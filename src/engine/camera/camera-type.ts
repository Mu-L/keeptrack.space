/**
 * Represents the different types of cameras available.
 *
 * TODO: This should be replaced with different camera classes
 */

export enum CameraType {
  CURRENT = 0,
  FIXED_TO_EARTH = 1,
  FIXED_TO_SAT_LVLH = 2,
  FPS = 3,
  PLANETARIUM = 4,
  SATELLITE_FIRST_PERSON = 5,
  ASTRONOMY = 6,
  FLAT_MAP = 7,
  POLAR_VIEW = 8,
  FIXED_TO_SAT_ECI = 9,
  MAX_CAMERA_TYPES = 10,
}
