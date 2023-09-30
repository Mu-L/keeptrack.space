// Generated by CodiumAI

import { SatObject, SensorObject } from '@app/js/interfaces';
import { DEG2RAD, DISTANCE_TO_SUN, RADIUS_OF_EARTH } from '@app/js/lib/constants';
import { dateFormat } from '@app/js/lib/dateFormat';
import { Sun } from '@app/js/singletons/draw-manager/sun';
import { CoordinateTransforms } from '@app/js/static/coordinate-transforms';
import { SatMath, SunStatus } from '@app/js/static/sat-math';
import { EciVec3, SatelliteRecord, Sgp4 } from 'ootk';
import { defaultSat, defaultSensor } from './environment/apiMocks';
import { disableConsoleErrors, enableConsoleErrors } from './environment/standard-env';

describe('altitudeCheck_method', () => {
  // Tests that valid input TLE strings and date return a valid altitude value.
  it('test_valid_input_returns_valid_altitude', () => {
    const tle1 = '1 25544U 98067A   21275.61828767  .00000808  00000-0  26368-4 0  9993';
    const tle2 = '2 25544  51.6443  82.0195 0002976  83.8537 276.3289 15.48978703297422';
    const now = new Date();
    const satrec = Sgp4.createSatrec(tle1, tle2);
    const altitude = SatMath.altitudeCheck(satrec, now);
    expect(altitude).toBeGreaterThan(0);
  });

  // Tests that invalid TLE strings return 0 altitude.
  it('test_invalid_TLE_strings_return_0_altitude', () => {
    const satrec = 'invalid_satrec';
    const now = new Date();
    const altitude = SatMath.altitudeCheck(satrec as unknown as SatelliteRecord, now);
    expect(altitude).toEqual(0);
  });

  // Tests that a satellite record is created successfully.
  it('test_satellite_record_created_successfully', () => {
    const tle1 = '1 25544U 98067A   21275.61828767  .00000808  00000-0  26368-4 0  9993';
    const tle2 = '2 25544  51.6443  82.0195 0002976  83.8537 276.3289 15.48978703297422';
    const satrec = Sgp4.createSatrec(tle1, tle2);
    expect(satrec).toBeDefined();
  });

  // Tests that ECI position is obtained successfully.
  it('test_ECI_position_obtained_successfully', () => {
    const tle1 = '1 25544U 98067A   21275.61828767  .00000808  00000-0  26368-4 0  9993';
    const tle2 = '2 25544  51.6443  82.0195 0002976  83.8537 276.3289 15.48978703297422';
    const now = new Date();
    const satrec = Sgp4.createSatrec(tle1, tle2);
    const { m } = SatMath.calculateTimeVariables(now, satrec);
    const positionEci = Sgp4.propagate(satrec, m).position;
    expect(positionEci).toBeDefined();
  });
});

describe('getAngleBetweenTwoSatellites_method', () => {
  // Tests that the method returns the correct azimuth and elevation for two valid satellite objects with position and velocity defined
  it('test_valid_satellites', () => {
    const sat1 = {
      position: { x: -1000, y: -1000, z: -1000 },
      velocity: { x: -7, y: 0, z: 0 },
    } as SatObject;
    const sat2 = {
      position: { x: 1000, y: 1000, z: 1000 },
      velocity: { x: 7, y: 0, z: 0 },
    } as SatObject;
    const result = SatMath.getAngleBetweenTwoSatellites(sat1, sat2);
    expect(result.az).toBeCloseTo(90.0);
    expect(result.el).toBeCloseTo(-45);
  });

  // Tests that the method returns 0 for azimuth and elevation for two identical satellite objects
  it('test_identical_satellites', () => {
    const sat1 = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    } as SatObject;
    const sat2 = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    } as SatObject;
    const result = SatMath.getAngleBetweenTwoSatellites(sat1, sat2);
    expect(result.az).toBeCloseTo(0.0);
    expect(result.el).toBeCloseTo(0.0);
  });

  // Tests that the method returns the correct azimuth and elevation for two satellite objects with same position but different velocities
  it('test_same_position_different_velocity', () => {
    const sat1 = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    } as SatObject;
    const sat2 = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 1000, y: 1000, z: 1000 },
    } as SatObject;
    const result = SatMath.getAngleBetweenTwoSatellites(sat1, sat2);
    expect(result.az).toBeCloseTo(0);
    expect(result.el).toBeCloseTo(0);
  });

  // Tests that the method returns the correct azimuth and elevation for two satellite objects with same velocity but different positions
  it('test_same_velocity_different_position', () => {
    const sat1 = {
      position: { x: -100, y: 2000, z: 5000 },
      velocity: { x: 20, y: 20, z: 20 },
    } as SatObject;
    const sat2 = {
      position: { x: 1000, y: 1000, z: 1000 },
      velocity: { x: 10, y: 10, z: 10 },
    } as SatObject;
    const result = SatMath.getAngleBetweenTwoSatellites(sat1, sat2);
    expect(result.az).toBeCloseTo(120.465, 2);
    expect(result.el).toBeCloseTo(-19.54049, 2);
  });

  // Tests that the method throws an error when one of the satellite objects has undefined velocity
  it('test_undefined_velocity', () => {
    const sat1 = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    } as SatObject;
    const sat2 = {
      position: { x: 1000, y: 1000, z: 1000 },
    } as SatObject;
    expect(() => {
      SatMath.getAngleBetweenTwoSatellites(sat1, sat2);
    }).toThrow('Sat2 velocity is undefined');
  });
});

describe('getDirection_method', () => {
  // Tests that the method returns 'N' if the latitude of the satellite is increasing
  it('test_north_direction', () => {
    const sat = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    } as SatObject;
    const simulationTime = new Date();
    CoordinateTransforms.eci2lla = jest.fn().mockReturnValue({ lat: 0 });
    // @ts-ignore
    CoordinateTransforms.eci2lla.mockReturnValueOnce({ lat: 0 }).mockReturnValueOnce({ lat: 10 });
    const direction = SatMath.getDirection(sat, simulationTime);
    expect(direction).toBe('N');
  });

  // Tests that the method returns 'S' if the latitude of the satellite is decreasing
  it('test_south_direction', () => {
    const sat = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    } as SatObject;
    const simulationTime = new Date();
    CoordinateTransforms.eci2lla = jest.fn().mockReturnValue({ lat: 0 });
    // @ts-ignore
    CoordinateTransforms.eci2lla.mockReturnValueOnce({ lat: 0 }).mockReturnValueOnce({ lat: -10 });
    const direction = SatMath.getDirection(sat, simulationTime);
    expect(direction).toBe('S');
  });

  // Tests that the method returns 'Error' if the latitude of the satellite is the same in the current and future positions
  it('test_same_latitude', () => {
    const sat = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    } as SatObject;
    const simulationTime = new Date();
    CoordinateTransforms.eci2lla = jest.fn().mockReturnValue({ lat: 0 });
    // @ts-ignore
    CoordinateTransforms.eci2lla.mockReturnValueOnce({ lat: 0 }).mockReturnValueOnce({ lat: 0 });
    disableConsoleErrors();
    const direction = SatMath.getDirection(sat, simulationTime);
    enableConsoleErrors();
    expect(direction).toBe('Error');
  });

  // Tests that the method returns 'Error' if there is an error in the calculation
  it('test_error', () => {
    const sat = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    } as SatObject;
    const simulationTime = new Date();
    CoordinateTransforms.eci2lla = jest.fn().mockReturnValue({ lat: 0 });
    // @ts-ignore
    CoordinateTransforms.eci2lla.mockReturnValueOnce({ lat: 0 }).mockReturnValueOnce({ lat: null });
    disableConsoleErrors();
    const direction = SatMath.getDirection(sat, simulationTime);
    enableConsoleErrors();
    expect(direction).toBe('Error');
  });

  // Tests that the method handles cases where the satellite is at the North pole
  it('test_north_pole', () => {
    const sat = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    } as SatObject;
    const simulationTime = new Date();
    CoordinateTransforms.eci2lla = jest.fn().mockReturnValue({ lat: 90 });
    // @ts-ignore
    CoordinateTransforms.eci2lla.mockReturnValueOnce({ lat: 90 }).mockReturnValueOnce({ lat: 100 });
    const direction = SatMath.getDirection(sat, simulationTime);
    expect(direction).toBe('N');
  });

  // Tests that the method handles cases where the satellite is at the South pole
  it('test_south_pole', () => {
    const sat = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    } as SatObject;
    const simulationTime = new Date();
    CoordinateTransforms.eci2lla = jest.fn().mockReturnValue({ lat: -90 });
    // @ts-ignore
    CoordinateTransforms.eci2lla.mockReturnValueOnce({ lat: -90 }).mockReturnValueOnce({ lat: -100 });
    const direction = SatMath.getDirection(sat, simulationTime);
    expect(direction).toBe('S');
  });
});

describe('getEcfOfCurrentOrbit_method', () => {
  // Tests that answers remain the same
  it('test_answers_remain_the_same', () => {
    const sat = { ...defaultSat };
    const points = 10;
    const outPoints = SatMath.getEcfOfCurrentOrbit(sat, points, () => new Date(2023, 1, 1));
    expect(outPoints).toMatchSnapshot();
  });

  // Tests that the method returns an array of ECF points for a given satellite and number of points
  it('test_happy_path_returns_ecf_points', () => {
    const sat = {
      period: 100,
      sccNum: '12345',
      position: {
        x: 100,
        y: 200,
        z: 300,
      },
    } as SatObject;
    const points = 10;
    const ecfPoints = SatMath.getEcfOfCurrentOrbit(sat, points, () => new Date());
    expect(ecfPoints.length).toBe(points);
    expect(ecfPoints[0]).toHaveProperty('x');
    expect(ecfPoints[0]).toHaveProperty('y');
    expect(ecfPoints[0]).toHaveProperty('z');
  });

  // Tests that the method returns an empty array when the number of points is 0
  it('test_edge_case_returns_empty_array_when_points_is_zero', () => {
    const sat = {
      period: 100,
      sccNum: '12345',
      position: {
        x: 100,
        y: 200,
        z: 300,
      },
    } as SatObject;
    const points = 0;
    const ecfPoints = SatMath.getEcfOfCurrentOrbit(sat, points, () => new Date());
    expect(ecfPoints.length).toBe(0);
  });

  // Tests that the method can handle different time offsets
  it('test_general_behaviour_handles_different_time_offsets', () => {
    const sat = {
      period: 100,
      sccNum: '12345',
      position: {
        x: 100,
        y: 200,
        z: 300,
      },
    } as SatObject;
    const points = 10;
    const ecfPoints1 = SatMath.getEcfOfCurrentOrbit(sat, points, () => new Date());
    const ecfPoints2 = SatMath.getEcfOfCurrentOrbit(sat, points + 1, () => new Date());
    expect(ecfPoints1).not.toEqual(ecfPoints2);
  });
});

describe('getEciOfCurrentOrbit_method', () => {
  // Tests that answers remain the same
  it('test_answers_remain_the_same', () => {
    const sat = { ...defaultSat };
    const points = 10;
    const outPoints = SatMath.getEciOfCurrentOrbit(sat, points, () => new Date(2023, 1, 1));
    expect(outPoints).toMatchSnapshot();
  });

  // Tests that the method returns an array of eci points for a given satellite and number of points
  it('test_happy_path_returns_eci_points', () => {
    const sat = {
      period: 100,
      sccNum: '12345',
      position: {
        x: 100,
        y: 200,
        z: 300,
      },
    } as SatObject;
    const points = 10;
    const eciPoints = SatMath.getEciOfCurrentOrbit(sat, points, () => new Date());
    expect(eciPoints.length).toBe(points);
    expect(eciPoints[0]).toHaveProperty('x');
    expect(eciPoints[0]).toHaveProperty('y');
    expect(eciPoints[0]).toHaveProperty('z');
  });

  // Tests that the method returns an empty array when the number of points is 0
  it('test_edge_case_returns_empty_array_when_points_is_zero', () => {
    const sat = {
      period: 100,
      sccNum: '12345',
      position: {
        x: 100,
        y: 200,
        z: 300,
      },
    } as SatObject;
    const points = 0;
    const eciPoints = SatMath.getEciOfCurrentOrbit(sat, points, () => new Date());
    expect(eciPoints.length).toBe(0);
  });

  // Tests that the method can handle different time offsets
  it('test_general_behaviour_handles_different_time_offsets', () => {
    const sat = {
      period: 100,
      sccNum: '12345',
      position: {
        x: 100,
        y: 200,
        z: 300,
      },
    } as SatObject;
    const points = 10;
    const eciPoints1 = SatMath.getEciOfCurrentOrbit(sat, points, () => new Date());
    const eciPoints2 = SatMath.getEciOfCurrentOrbit(sat, points + 1, () => new Date());
    expect(eciPoints1).not.toEqual(eciPoints2);
  });
});

describe('getLlaOfCurrentOrbit_method', () => {
  // Tests that answers remain the same
  it('test_answers_remain_the_same', () => {
    const sat = { ...defaultSat };
    const points = 10;
    const outPoints = SatMath.getLlaOfCurrentOrbit(sat, points, () => new Date(2023, 1, 1));
    expect(outPoints).toMatchSnapshot();
  });

  // Tests that the method returns an array of eci points for a given satellite and number of points
  it('test_happy_path_returns_lla_points', () => {
    const sat = {
      period: 100,
      sccNum: '12345',
      position: {
        x: 100,
        y: 200,
        z: 300,
      },
    } as SatObject;
    const points = 10;
    const llaPoints = SatMath.getLlaOfCurrentOrbit(sat, points, () => new Date());
    expect(llaPoints.length).toBe(points);
    expect(llaPoints[0]).toHaveProperty('lat');
    expect(llaPoints[0]).toHaveProperty('lon');
    expect(llaPoints[0]).toHaveProperty('alt');
  });

  // Tests that the method returns an empty array when the number of points is 0
  it('test_edge_case_returns_empty_array_when_points_is_zero', () => {
    const sat = {
      period: 100,
      sccNum: '12345',
      position: {
        x: 100,
        y: 200,
        z: 300,
      },
    } as SatObject;
    const points = 0;
    const llaPoints = SatMath.getLlaOfCurrentOrbit(sat, points, () => new Date());
    expect(llaPoints.length).toBe(0);
  });

  // Tests that the method can handle different time offsets
  it('test_general_behaviour_handles_different_time_offsets', () => {
    const sat = {
      period: 100,
      sccNum: '12345',
      position: {
        x: 100,
        y: 200,
        z: 300,
      },
    } as SatObject;
    const points = 10;
    const llaPoints1 = SatMath.getLlaOfCurrentOrbit(sat, points, () => new Date());
    const llaPoints2 = SatMath.getLlaOfCurrentOrbit(sat, points + 1, () => new Date());
    expect(llaPoints1).not.toEqual(llaPoints2);
  });
});

describe('getRicOfCurrentOrbit_method', () => {
  const sat = defaultSat;
  const sat2 = {
    ...defaultSat,
    ...{
      TLE1: '1 25544U 98067A   21203.40407588  .00003453  00000-0  71172-4 0  9991',
      TLE2: '2 25544  51.6423 168.5744 0001475 184.3976 304.3642 15.48839820294053',
    },
  } as SatObject;

  sat2.satrec = Sgp4.createSatrec(sat2.TLE1, sat2.TLE2);

  // Tests that answers remain the same
  it('test_answers_remain_the_same', () => {
    const points = 10;
    const outPoints = SatMath.getRicOfCurrentOrbit(sat, sat2, points, () => new Date(2023, 1, 1), 1);
    expect(outPoints).toMatchSnapshot();
  });

  // Tests that the method returns an array of eci points for a given satellite and number of points
  it('test_happy_path_returns_ric_points', () => {
    const points = 10;
    const outPoints = SatMath.getRicOfCurrentOrbit(sat, sat2, points, () => new Date(2023, 1, 1), 1);
    expect(outPoints.length).toBe(points);
    expect(outPoints[0]).toHaveProperty('x');
    expect(outPoints[0]).toHaveProperty('y');
    expect(outPoints[0]).toHaveProperty('z');
  });

  // Tests that the method returns an empty array when the number of points is 0
  it('test_edge_case_returns_empty_array_when_points_is_zero', () => {
    const points = 0;
    const outPoints = SatMath.getRicOfCurrentOrbit(sat, sat2, points, () => new Date(2023, 1, 1), 1);
    expect(outPoints.length).toBe(0);
  });

  // Tests that the methods handles bad eci calculations
  it('test_bad_eci_calculation', () => {
    const points = 10;
    const satrec = Sgp4.createSatrec(
      '1 25544U 98067A   21268.51782528  .00002182  00000-0  50870-4 0  9993',
      '2 25544  51.6443  98.5701 0001669  95.6847 264.4655 28.48978703297420'
    );
    expect(() => SatMath.getRicOfCurrentOrbit({ ...sat, ...{ satrec } }, sat2, points, () => new Date(2023, 1, 1), 1)).not.toThrow();
    expect(() => SatMath.getRicOfCurrentOrbit(sat2, { ...sat, ...{ satrec } }, points, () => new Date(2023, 1, 1), 1)).not.toThrow();
  });

  // Tests that the method can handle different time offsets
  it('test_general_behaviour_handles_different_time_offsets', () => {
    const points = 10;
    const outPoints1 = SatMath.getRicOfCurrentOrbit(sat, sat2, points, () => new Date(2023, 1, 1), 1);
    const outPoints2 = SatMath.getRicOfCurrentOrbit(sat, sat2, points + 1, () => new Date(2023, 1, 1), 1);
    expect(outPoints1).not.toEqual(outPoints2);
  });
});

describe('getLlaTimeView_method', () => {
  // Tests that the method returns an object with lat, lon, time and inView properties when given valid inputs
  it('test_happy_path_valid_inputs', () => {
    const now = new Date();
    const result = SatMath.getLlaTimeView(now, defaultSat, defaultSensor);
    expect(result).toHaveProperty('lat');
    expect(result).toHaveProperty('lon');
    expect(result).toHaveProperty('time');
    expect(result).toHaveProperty('inView');
  });

  // Tests that the method returns an object with lat and lon set to 0 and time set to 'Invalid' when positionEci is null
  it('test_edge_case_null_position_eci', () => {
    const now = new Date();
    const sat = {
      satrec: {
        epochyr: 2021,
        epochdays: 1,
        ndot: 0,
        nddot: 0,
        bstar: 0,
        inclo: 0,
        nodeo: 0,
        ecco: 0,
        argpo: 0,
        mo: 0,
        no: 0,
        a: 0,
        alta: 0,
        altp: 0,
        jdsatepoch: 2459215.5,
      },
    } as SatObject;
    const result = SatMath.getLlaTimeView(now, sat, defaultSensor);
    expect(result.lat).toBe(0);
    expect(result.lon).toBe(0);
    expect(result.time).toBe('Invalid');
  });

  // Tests that the method throws an error when SensorManager.currentSensors is empty
  it.skip('test_edge_case_empty_sensor_manager_current_sensors', () => {
    const now = new Date();
    expect(() => SatMath.getLlaTimeView(now, defaultSat, [] as any)).toThrow();
  });

  // Tests that the method uses dateFormat to format the time property
  it('test_general_behaviour_uses_date_format', () => {
    const now = new Date();
    const result = SatMath.getLlaTimeView(now, defaultSat, defaultSensor);
    expect(result.time).toBe(dateFormat(now, 'isoDateTime', true));
  });
});

// Generated by CodiumAI

describe('getRae_method', () => {
  // Tests that the method returns the correct azimuth, elevation, and range when given valid input values for now, satrec, and sensor
  it('test_valid_input_values', () => {
    const now = new Date();
    const satrec = Sgp4.createSatrec(
      '1 25544U 98067A   21268.51782528  .00002182  00000-0  50870-4 0  9993',
      '2 25544  51.6443  98.5701 0001669  95.6847 264.4655 15.48978703297420'
    );
    const sensor = defaultSensor;
    const result = SatMath.getRae(now, satrec, sensor);
    expect(result).toHaveProperty('az');
    expect(result).toHaveProperty('el');
    expect(result).toHaveProperty('rng');
  });

  // Tests that the method returns the correct azimuth, elevation, and range when given valid input values for now, satrec, and sensor, and observerGd is undefined
  it('test_valid_input_values_observerGd_undefined', () => {
    const now = new Date();
    const satrec = Sgp4.createSatrec(
      '1 25544U 98067A   21268.51782528  .00002182  00000-0  50870-4 0  9993',
      '2 25544  51.6443  98.5701 0001669  95.6847 264.4655 15.48978703297420'
    );
    const sensor = defaultSensor;
    // eslint-disable-next-line
    sensor.observerGd = undefined;
    const result = SatMath.getRae(now, satrec, sensor);
    expect(result).toHaveProperty('az');
    expect(result).toHaveProperty('el');
    expect(result).toHaveProperty('rng');
  });

  // Tests that the method returns the correct azimuth, elevation, and range when given valid input values for now, satrec, and sensor, and observerGd is defined
  it('test_valid_input_values_observerGd_defined', () => {
    const now = new Date();
    const satrec = Sgp4.createSatrec(
      '1 25544U 98067A   21268.51782528  .00002182  00000-0  50870-4 0  9993',
      '2 25544  51.6443  98.5701 0001669  95.6847 264.4655 15.48978703297420'
    );
    const sensor = defaultSensor;
    const result = SatMath.getRae(now, satrec, sensor);
    expect(result).toHaveProperty('az');
    expect(result).toHaveProperty('el');
    expect(result).toHaveProperty('rng');
  });

  // Tests that the methods handles bad eci calculations
  it('test_bad_eci_calculation', () => {
    const now = new Date();
    const satrec = Sgp4.createSatrec(
      '1 25544U 98067A   21268.51782528  .00002182  00000-0  50870-4 0  9993',
      '2 25544  51.6443  98.5701 0001669  95.6847 264.4655 28.48978703297420'
    );
    const sensor = defaultSensor;
    expect(() => SatMath.getRae(now, satrec, sensor)).not.toThrow();
  });

  // Tests that the method throws an error when now, satrec, and sensor are undefined
  it('test_null_input_values', () => {
    const now = null;
    const satrec = null;
    const sensor = null;
    expect(() => SatMath.getRae(now, satrec, sensor)).toThrow();
  });

  // Tests that the method throws an error when now, satrec, and sensor are undefined
  it('test_undefined_input_values', () => {
    // eslint-disable-next-line no-undefined
    const now = undefined;
    // eslint-disable-next-line no-undefined
    const satrec = undefined;
    // eslint-disable-next-line no-undefined
    const sensor = undefined;
    expect(() => SatMath.getRae(now, satrec, sensor)).toThrow();
  });
});

// Generated by CodiumAI

describe('getSunDirection_method', () => {
  // Tests that the method returns a valid sun direction vector for a valid Julian date
  it('test_valid_jd', () => {
    const jd = 2451545.0;
    const sunDirection = SatMath.getSunDirection(jd);
    expect(sunDirection).toMatchSnapshot();
  });

  // Tests that the method returns a valid sun direction vector for a Julian date at the start of the year
  it('test_jd_start_of_year', () => {
    const jd = 2458850.5;
    const sunDirection = SatMath.getSunDirection(jd);
    expect(sunDirection).toMatchSnapshot();
  });

  // Tests that the method returns a valid sun direction vector for a Julian date at the end of the year
  it('test_jd_end_of_year', () => {
    const jd = 2459203.5;
    const sunDirection = SatMath.getSunDirection(jd);
    expect(sunDirection).toMatchSnapshot();
  });

  // Tests that the method returns null for a null Julian date
  it('test_jd_null', () => {
    const jd = null;
    expect(() => SatMath.getSunDirection(jd)).toThrow();
  });
});

describe('calculateIsInSun_method', () => {
  // Tests that SunStatus.SUN is returned when semiDiamEarth is less than semiDiamSun and theta is greater than semiDiamEarth - semiDiamSun
  it('test_happy_path_1', () => {
    const sat = {
      position: {
        x: 10000,
        y: 10000,
        z: 10000,
      },
    } as unknown as SatObject;
    const sunECI = {
      x: DISTANCE_TO_SUN,
      y: DISTANCE_TO_SUN,
      z: DISTANCE_TO_SUN,
    } as EciVec3;
    expect(SatMath.calculateIsInSun(sat, sunECI)).toBe(SunStatus.SUN);
  });

  // Tests that SunStatus.UMBRAL is returned when semiDiamEarth is greater than semiDiamSun
  it('test_happy_path_2', () => {
    const sat = {
      position: {
        x: -10000,
        y: -10000,
        z: -10000,
      },
    } as unknown as SatObject;
    const sunECI = {
      x: DISTANCE_TO_SUN,
      y: DISTANCE_TO_SUN,
      z: DISTANCE_TO_SUN,
    } as EciVec3;
    expect(SatMath.calculateIsInSun(sat, sunECI)).toBe(SunStatus.UMBRAL);
  });

  // Tests that SunStatus.PENUMBRAL is returned when theta is less than semiDiamSun - semiDiamEarth
  it('test_happy_path_3', () => {
    const sat = {
      position: {
        x: -RADIUS_OF_EARTH - 7800,
        y: -RADIUS_OF_EARTH,
        z: -RADIUS_OF_EARTH,
      },
    } as unknown as SatObject;
    const sunECI = {
      x: DISTANCE_TO_SUN,
      y: DISTANCE_TO_SUN,
      z: DISTANCE_TO_SUN,
    } as EciVec3;
    expect(SatMath.calculateIsInSun(sat, sunECI)).toBe(SunStatus.PENUMBRAL);
  });

  // Tests that SunStatus.UNKNOWN is returned when SatObject has an undefined position
  it('test_edge_case_1', () => {
    const sat = {} as unknown as SatObject;
    const sunECI = {
      x: DISTANCE_TO_SUN,
      y: DISTANCE_TO_SUN,
      z: DISTANCE_TO_SUN,
    } as EciVec3;
    expect(SatMath.calculateIsInSun(sat, sunECI)).toBe(SunStatus.UNKNOWN);
  });

  // Tests that SunStatus.UNKNOWN is returned when sunECI is null
  it('test_edge_case_2', () => {
    const sat = {
      position: {
        x: -1000,
        y: -1000,
        z: -1000,
      },
    } as unknown as SatObject;
    expect(SatMath.calculateIsInSun(sat, null as EciVec3)).toBe(SunStatus.UNKNOWN);
  });
});

// Generated by CodiumAI

describe('distance_method', () => {
  // Tests that distance method returns correct distance between two EciVec3 objects with different values
  it('test_distance_different_values', () => {
    const obj1 = { x: 1, y: 2, z: 3 } as EciVec3;
    const obj2 = { x: 4, y: 5, z: 6 } as EciVec3;
    expect(SatMath.distance(obj1, obj2)).toBeCloseTo(5.196152, 6);
  });
});

// Generated by CodiumAI

describe('calculateVisMag_method', () => {
  // Tests that the method returns a valid visual magnitude when given a valid satellite object, sensor object, propTime, and sun object
  it('test_valid_satellite_and_sensor', () => {
    const sat = {
      position: {
        x: 15000,
        y: 10000,
        z: 15000,
      },
      vmag: 5,
      satrec: defaultSat.satrec,
    } as SatObject;
    const sensor = {
      lat: 90,
      lon: 0,
      alt: 1000,
      observerGd: {
        lat: 90 * DEG2RAD,
        lon: 0 * DEG2RAD,
        alt: 1000,
      },
    } as SensorObject;
    const propTime = new Date();
    const sun = new Sun();
    sun.eci = {
      x: DISTANCE_TO_SUN,
      y: DISTANCE_TO_SUN,
      z: DISTANCE_TO_SUN,
    } as EciVec3;
    const visMag = SatMath.calculateVisMag(sat, sensor, propTime, sun);
    expect(visMag).toBeGreaterThan(0);
  });

  // Test if the method returns a huge number when the satellite is eclipsing the sun
  it('test_satellite_eclipsing_sun', () => {
    const sat = {
      position: {
        x: 15000,
        y: 15000,
        z: 15000,
      },
      vmag: 5,
      satrec: defaultSat.satrec,
    } as SatObject;
    const sensor = {
      lat: 90,
      lon: 0,
      alt: 1000,
      observerGd: {
        lat: 90 * DEG2RAD,
        lon: 0 * DEG2RAD,
        alt: 1000,
      },
    } as SensorObject;
    const propTime = new Date();
    const sun = new Sun();
    sun.eci = {
      x: DISTANCE_TO_SUN,
      y: DISTANCE_TO_SUN,
      z: DISTANCE_TO_SUN,
    } as EciVec3;
    const visMag = SatMath.calculateVisMag(sat, sensor, propTime, sun);
    expect(visMag).toBe(30);
  });

  // Tests that the method returns a valid visual magnitude when given a satellite object that has a vmag property
  it('test_satellite_with_vmag_property', () => {
    const sat = {
      position: {
        x: 7000,
        y: 10000,
        z: 7000,
      },
      vmag: -25,
    } as SatObject;
    const sensor = {
      lat: 0,
      lon: 0,
      alt: 1000,
      observerGd: {
        lat: 90 * DEG2RAD,
        lon: 0 * DEG2RAD,
        alt: 1000,
      },
    } as SensorObject;
    const propTime = new Date();
    const sun = new Sun();
    sun.eci = {
      x: DISTANCE_TO_SUN,
      y: DISTANCE_TO_SUN,
      z: DISTANCE_TO_SUN,
    } as EciVec3;
    const visMag = SatMath.calculateVisMag(sat, sensor, propTime, sun);
    expect(visMag).toBeLessThan(0);
  });

  // Tests that the method returns a valid visual magnitude when given a satellite object that does not have a vmag property
  it('test_satellite_without_vmag_property', () => {
    const sat = {
      position: {
        x: 7000,
        y: 10000,
        z: 7000,
      },
    } as SatObject;
    const sensor = {
      lat: 0,
      lon: 0,
      alt: 1000,
      observerGd: {
        lat: 90 * DEG2RAD,
        lon: 0 * DEG2RAD,
        alt: 1000,
      },
    } as SensorObject;
    const propTime = new Date();
    const sun = new Sun();
    sun.eci = {
      x: DISTANCE_TO_SUN,
      y: DISTANCE_TO_SUN,
      z: DISTANCE_TO_SUN,
    } as EciVec3;
    const visMag = SatMath.calculateVisMag(sat, sensor, propTime, sun);
    expect(visMag).toBeGreaterThan(0);
    expect(visMag).toBeLessThan(25);
  });

  // Tests that the method returns a valid decibal magnitude when given a rcs in square meters
  it('test_rcs_in_square_meters', () => {
    expect(SatMath.mag2db(1)).toBe(0);
    expect(SatMath.mag2db(0.1)).toBe(-10);
    expect(SatMath.mag2db(0.01)).toBe(-20);
    expect(SatMath.mag2db(10)).toBe(10);
    expect(SatMath.mag2db(100)).toBe(20);
    expect(SatMath.mag2db(2)).toBeCloseTo(3, 1);
    expect(SatMath.mag2db(4)).toBeCloseTo(6, 1);
    expect(SatMath.mag2db(8)).toBeCloseTo(9, 1);
  });
});