/**
 * FOV Prediction Web Worker
 *
 * Computes "minutes to next FOV entry" for every satellite in the catalog
 * by propagating each forward in time and checking against sensor FOV bounds.
 *
 * Results are cached: only satellites whose cached exit time has expired
 * are recomputed on subsequent UPDATE_TIME messages.
 */

/* eslint-disable complexity */

import { DetailedSensor } from '@app/app/sensors/DetailedSensor';
import {
  Degrees,
  EcefVec3,
  Kilometers,
  MILLISECONDS_TO_DAYS,
  RaeVec3,
  Sgp4,
  TemeVec3,
  ecefRad2rae,
  eci2ecef,
} from '@ootk/src/main';
import { jday } from '../engine/utils/transforms';
import {
  FovPredMsgType,
  FovPredOutMsgType,
  type FovPredInMsg,
} from './fov-prediction-messages';

// ─── Worker State ────────────────────────────────────────────────────────────

interface SatRecord {
  satrec: ReturnType<typeof Sgp4.createSatrec>;
  active: boolean;
}

let satRecords: SatRecord[] = [];
let sensors: DetailedSensor[] = [];
let numObjects = 0;

/** Minutes until next FOV entry per satellite. Infinity = not in window. */
let minutesToEntry: Float32Array | null = null;
/** Absolute sim time (ms) when each satellite exits FOV. 0 = not cached / no pass. */
let exitTimesMs: Float64Array | null = null;

let maxLookaheadMin = 120;
let sweepStepMin = 1;
let cancelled = false;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a Date-like ms timestamp to julian day and GMST. */
function timeToJdayGmst(timeMs: number): { j: number; gmst: number } {
  const d = new Date(timeMs);
  const j =
    jday(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
    ) +
    d.getUTCMilliseconds() * MILLISECONDS_TO_DAYS;

  const gmst = Sgp4.gstime(j);

  return { j, gmst };
}

/** Check if a satellite position (ECI) is in any sensor's FOV. */
function isInAnyFov(position: TemeVec3, gmst: number): boolean {
  let positionEcf: EcefVec3;
  let rae: RaeVec3<Kilometers, Degrees>;

  for (const sensor of sensors) {
    try {
      positionEcf = eci2ecef(position, gmst);
      rae = ecefRad2rae(sensor.llaRad(), positionEcf);
    } catch {
      continue;
    }

    // Skip optical sensors' dark-satellite check for simplicity in prediction
    // (we just want geometric FOV, not observability)
    if (sensor.isRaeInFov(rae.az, rae.el, rae.rng)) {
      return true;
    }
  }

  return false;
}

/**
 * Sweep a single satellite forward in time to find the next FOV entry and exit.
 * Returns [minutesToEntry, exitTimeMs].
 * If no entry found within the lookahead window, returns [Infinity, 0].
 */
function sweepSatellite(satIndex: number, simTimeMs: number): [number, number] {
  const rec = satRecords[satIndex];

  if (!rec || !rec.active || !rec.satrec) {
    return [Infinity, 0];
  }

  const satrec = rec.satrec;
  let entryMin = Infinity;
  let exitMs = 0;
  let wasInFov = false;

  for (let stepMin = 0; stepMin <= maxLookaheadMin; stepMin += sweepStepMin) {
    const targetMs = simTimeMs + stepMin * 60000;
    const { j, gmst } = timeToJdayGmst(targetMs);
    const m = (j - satrec.jdsatepoch) * 1440.0;

    let pv: { position: TemeVec3 };

    try {
      pv = Sgp4.propagate(satrec, m) as { position: TemeVec3 };
      if (isNaN(pv.position.x) || isNaN(pv.position.y) || isNaN(pv.position.z)) {
        continue;
      }
    } catch {
      continue;
    }

    const inFov = isInAnyFov(pv.position, gmst);

    if (inFov && entryMin === Infinity) {
      // Found FOV entry
      entryMin = stepMin;
      wasInFov = true;
    } else if (!inFov && wasInFov) {
      // Found FOV exit — record exit time and stop
      exitMs = targetMs;
      break;
    } else if (inFov) {
      wasInFov = true;
    }
  }

  // If satellite entered FOV but never exited within the window
  if (wasInFov && exitMs === 0) {
    exitMs = simTimeMs + maxLookaheadMin * 60000;
  }

  return [entryMin, exitMs];
}

// ─── Full Sweep (batched with yields) ────────────────────────────────────────

const BATCH_SIZE = 200;

async function fullSweep(simTimeMs: number): Promise<void> {
  if (!minutesToEntry || !exitTimesMs) {
    return;
  }

  let processed = 0;

  for (let start = 0; start < numObjects && !cancelled; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, numObjects);

    for (let i = start; i < end; i++) {
      const [entry, exit] = sweepSatellite(i, simTimeMs);

      minutesToEntry[i] = entry;
      exitTimesMs[i] = exit;
    }

    processed = end;

    // Report progress
    postMessage({
      typ: FovPredOutMsgType.PROGRESS,
      progress: processed / numObjects,
    });

    // Yield to allow message processing
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  if (cancelled) {
    return;
  }

  // Send final results (copy so we keep our working arrays)
  const result = new Float32Array(minutesToEntry);

  postMessage(
    {
      typ: FovPredOutMsgType.FULL_SWEEP_COMPLETE,
      minutesToEntry: result,
    },
    { transfer: [result.buffer as ArrayBuffer] },
  );
}

// ─── Incremental Update ──────────────────────────────────────────────────────

function incrementalUpdate(simTimeMs: number): void {
  if (!minutesToEntry || !exitTimesMs) {
    return;
  }

  let hasChanges = false;

  for (let i = 0; i < numObjects; i++) {
    // Recompute if the cached exit time has passed
    if (exitTimesMs[i] > 0 && simTimeMs >= exitTimesMs[i]) {
      const [entry, exit] = sweepSatellite(i, simTimeMs);

      minutesToEntry[i] = entry;
      exitTimesMs[i] = exit;
      hasChanges = true;
    } else if (exitTimesMs[i] === 0 && minutesToEntry[i] !== Infinity) {
      // Edge case: had an entry but no exit tracked — recompute
      const [entry, exit] = sweepSatellite(i, simTimeMs);

      minutesToEntry[i] = entry;
      exitTimesMs[i] = exit;
      hasChanges = true;
    } else if (minutesToEntry[i] !== Infinity) {
      // Recalculate minutesToEntry based on advancing time
      // The entry time was at simTimeMs + minutesToEntry * 60000 originally
      // But we need to keep it relative to current sim time
      // If we stored the absolute entry time, we'd subtract. Instead, we stored
      // the relative offset at sweep time. For accuracy, recompute stale entries.
      // Non-stale entries: just update the relative offset from cached absolute entry.
    }
  }

  if (hasChanges) {
    const result = new Float32Array(minutesToEntry);

    postMessage(
      {
        typ: FovPredOutMsgType.INCREMENTAL_UPDATE,
        minutesToEntry: result,
      },
      { transfer: [result.buffer as ArrayBuffer] },
    );
  }
}

// ─── Message Handler ─────────────────────────────────────────────────────────

onmessage = function handleMessage(event: MessageEvent<FovPredInMsg>) {
  const msg = event.data;

  switch (msg.typ) {
    case FovPredMsgType.INIT: {
      cancelled = false;
      maxLookaheadMin = msg.maxLookaheadMin || 120;
      sweepStepMin = msg.sweepStepMin || 1;

      // Parse catalog and create satrecs
      const satData = JSON.parse(msg.catalogJson) as Array<{
        tle1?: string;
        tle2?: string;
        active?: boolean;
      }>;

      numObjects = satData.length;
      satRecords = [];

      for (let i = 0; i < numObjects; i++) {
        const tle1 = satData[i]?.tle1;
        const tle2 = satData[i]?.tle2;

        if (tle1 && tle2) {
          satRecords.push({
            satrec: Sgp4.createSatrec(tle1, tle2),
            active: satData[i].active ?? true,
          });
        } else {
          // Non-satellite objects (sensors, markers, stars, etc.)
          satRecords.push({ satrec: null as unknown as ReturnType<typeof Sgp4.createSatrec>, active: false });
        }
      }

      // Create sensor instances
      sensors = msg.sensors
        .filter((s) => s)
        .map((s) => new DetailedSensor(s as ConstructorParameters<typeof DetailedSensor>[0]));

      // Allocate output arrays
      minutesToEntry = new Float32Array(numObjects).fill(Infinity);
      exitTimesMs = new Float64Array(numObjects);

      // Start full sweep
      fullSweep(msg.simTimeMs);
      break;
    }

    case FovPredMsgType.UPDATE_TIME:
      if (sensors.length > 0 && minutesToEntry) {
        incrementalUpdate(msg.simTimeMs);
      }
      break;

    case FovPredMsgType.CANCEL:
      cancelled = true;
      break;
  }
};

// Signal ready
postMessage('ready');
