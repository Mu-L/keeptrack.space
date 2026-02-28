/**
 * Represents the different types of cameras available.
 *
 * TODO: This should be replaced with different camera classes
 */

export enum CameraType {
  CURRENT = 0,
  FIXED_TO_EARTH = 1,
  FIXED_TO_SAT = 2,
  FPS = 3,
  PLANETARIUM = 4,
  SATELLITE = 5,
  ASTRONOMY = 6,
  FLAT_MAP = 7,
  POLAR_VIEW = 8,
  MAX_CAMERA_TYPES = 9,
  /** @deprecated */
  OFFSET = 9
}
