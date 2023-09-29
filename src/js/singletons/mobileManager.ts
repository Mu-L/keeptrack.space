export class MobileManager {
  public static async checkMobileMode() {
    try {
      if (MobileManager.checkIfMobileDevice()) {
        settingsManager.maxOribtsDisplayed = settingsManager.maxOrbitsDisplayedMobile;
        settingsManager.enableHoverOverlay = false;
        settingsManager.isMobileModeEnabled = true;
        settingsManager.cameraMovementSpeed = 0.0001;
        settingsManager.cameraMovementSpeedMin = 0.0001;
        if (settingsManager.isUseHigherFOVonMobile) {
          settingsManager.fieldOfView = settingsManager.fieldOfViewMax;
        } else {
          settingsManager.fieldOfView = 0.6;
        }
        settingsManager.maxLabels = settingsManager.mobileMaxLabels;

        // Disable desktop only plugins
        settingsManager.plugins.debug = false;
        settingsManager.plugins.dops = false;
        settingsManager.plugins.screenRecorder = false;
        settingsManager.plugins.satChanges = false;
        settingsManager.plugins.initialOrbit = false;
        settingsManager.plugins.editSat = false;
        settingsManager.plugins.shortTermFences = false;
        settingsManager.plugins.orbitReferences = false;
        settingsManager.plugins.externalSources = false;
        settingsManager.plugins.analysis = false;
        settingsManager.plugins.plotAnalysis = false;
        settingsManager.plugins.planetarium = false;
        settingsManager.plugins.astronomy = false;
        settingsManager.plugins.watchlist = false;
        settingsManager.plugins.social = false;
        settingsManager.plugins.classificationBar = false;
        settingsManager.plugins.gamepad = false;
        settingsManager.plugins.scenarioCreator = false;
      } else {
        settingsManager.maxOribtsDisplayed = settingsManager.maxOribtsDisplayedDesktop;
        if (typeof settingsManager.enableHoverOverlay == 'undefined') {
          settingsManager.enableHoverOverlay = true;
        }
        settingsManager.isMobileModeEnabled = false;
        settingsManager.cameraMovementSpeed = 0.003;
        settingsManager.cameraMovementSpeedMin = 0.005;
        if (settingsManager.isUseHigherFOVonMobile) {
          settingsManager.fieldOfView = settingsManager.fieldOfViewMax;
        } else {
          settingsManager.fieldOfView = 0.6;
        }
        settingsManager.maxLabels = settingsManager.desktopMaxLabels;
      }
    } catch (e) {
      console.debug(e);
    }
  }

  public static checkIfMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/iu.test(navigator.userAgent);
  }
}

export const mobileManager = new MobileManager();