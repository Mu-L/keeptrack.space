import { keepTrackApi } from '@app/keepTrackApi';
import type { ColorSchemeColorMap } from '@app/singletons/color-scheme-manager';
import { keepTrackContainer } from '../src/container';
import { Singletons } from '../src/interfaces';
import { settingsManager } from '../src/settings/settings';
import { LegendManager } from '../src/static/legend-manager';
import { defaultDiv, defaultSensorDiv, rcsDiv } from '../src/static/legend-manager/legend-divs';
import { defaultSensor } from './environment/apiMocks';
// Generated by CodiumAI

/*
 *Code Analysis
 *
 *Main functionalities:
 *The LegendManager class is responsible for managing the legend menu and updating the legend colors based on the selected menu option. It contains a list of menu options and
 *corresponding HTML templates, as well as a list of CSS class selectors for legend items. The class provides methods for changing the legend menu, updating legend colors, and
 *setting velocity colors.
 *
 *Methods:
 *- change(menu: string): changes the legend menu to the specified option and updates the legend colors
 *- legendColorsChange(): updates the legend colors based on the current color scheme
 *- setColors_(): sets the background color of legend items based on the current color scheme
 *- setVelocityColor_(colorSchemeManagerInstance: ColorSchemeManager): sets the background color of velocity legend items
 *
 *Fields:
 *- legendClassList: a list of CSS class selectors for legend items
 *- menuOptions: a list of menu options and corresponding HTML templates
 */

describe('LegendManager_class', () => {
  const objectTypeFlags = {
    velocitySlow: false,
    velocityMed: false,
    velocityFast: false,
  };
  const colorSchemeManagerInstance = {
    resetObjectTypeFlags: jest.fn(),
    objectTypeFlags,
  };

  beforeEach(() => {
    keepTrackApi.containerRoot.innerHTML = '';
    keepTrackContainer.registerSingleton(Singletons.ColorSchemeManager, colorSchemeManagerInstance);
  });

  // Tests that the legend menu changes to a valid option
  it('test_change_valid_option', () => {
    // Arrange
    const menu = 'rcs';
    const legendHoverDom = document.createElement('div');

    legendHoverDom.id = 'legend-hover-menu';
    keepTrackApi.containerRoot.appendChild(legendHoverDom);

    // Act
    LegendManager.change(menu);
    // Remove all styles from legendHoverDom.innerHTML
    legendHoverDom.innerHTML = legendHoverDom.innerHTML.replace(/style="[^"]*"/gu, '');

    // Assert
    expect(legendHoverDom.innerHTML).toEqual(rcsDiv);
  });

  // Tests that the legend menu changes to the default option
  it('test_change_default_option', () => {
    // Arrange
    const menu = 'default';
    const legendHoverDom = document.createElement('div');

    legendHoverDom.id = 'legend-hover-menu';
    keepTrackApi.containerRoot.appendChild(legendHoverDom);

    // Act
    LegendManager.change(menu);
    legendHoverDom.innerHTML = legendHoverDom.innerHTML.replace(/style="[^"]*"/gu, '');

    // Assert
    expect(legendHoverDom.innerHTML).toEqual(defaultDiv);
  });

  // Tests that the legend menu does not change to an invalid option
  it('test_change_invalid_option', () => {
    // Arrange
    const menu = 'invalid';
    const legendHoverDom = document.createElement('div');

    legendHoverDom.id = 'legend-hover-menu';
    keepTrackApi.containerRoot.appendChild(legendHoverDom);

    // Act
    LegendManager.change(menu);
    legendHoverDom.innerHTML = legendHoverDom.innerHTML.replace(/style="[^"]*"/gu, '');

    // Assert
    expect(legendHoverDom.innerHTML).toEqual(defaultDiv);
  });

  // Tests that the legend menu does not change to a null option
  it('test_change_null_option', () => {
    // Arrange
    const menu = null;
    const legendHoverDom = document.createElement('div');

    legendHoverDom.id = 'legend-hover-menu';
    keepTrackApi.containerRoot.appendChild(legendHoverDom);

    // Act
    LegendManager.change(<string>(<unknown>menu));
    legendHoverDom.innerHTML = legendHoverDom.innerHTML.replace(/style="[^"]*"/gu, '');

    // Assert
    expect(legendHoverDom.innerHTML).not.toEqual('');
  });

  // Tests that the legend colors are updated when the legend menu changes
  it('test_update_legend_colors', () => {
    // Arrange
    const menu = 'rcs';
    const legendHoverDom = document.createElement('div');

    legendHoverDom.id = 'legend-hover-menu';
    keepTrackApi.containerRoot.appendChild(legendHoverDom);

    // Act
    LegendManager.change(menu);

    // Assert
    expect((keepTrackApi.containerRoot.querySelector('.legend-rcsSmall-box') as HTMLElement).style.background).toEqual('rgba(255, 102, 0, 0.6)');
    expect((keepTrackApi.containerRoot.querySelector('.legend-rcsMed-box') as HTMLElement).style.background).toEqual('rgb(51, 102, 255)');
    expect((keepTrackApi.containerRoot.querySelector('.legend-rcsLarge-box') as HTMLElement).style.background).toEqual('rgba(0, 255, 0, 0.6)');
    expect((keepTrackApi.containerRoot.querySelector('.legend-rcsUnknown-box') as HTMLElement).style.background).toEqual('rgba(255, 255, 0, 0.6)');
  });

  // Tests that the velocity color is set for the legend
  it('test_set_velocity_color', () => {
    // Arrange
    const menu = 'velocity';
    const legendHoverDom = document.createElement('div');

    legendHoverDom.id = 'legend-hover-menu';
    const velocitySlowClass = document.createElement('div');

    velocitySlowClass.classList.add('legend-velocitySlow-box');
    legendHoverDom.appendChild(velocitySlowClass);
    const velocityMedClass = document.createElement('div');

    velocityMedClass.classList.add('legend-velocityMed-box');
    legendHoverDom.appendChild(velocityMedClass);
    const velocityFastClass = document.createElement('div');

    velocityFastClass.classList.add('legend-velocityFast-box');
    legendHoverDom.appendChild(velocityFastClass);
    keepTrackApi.containerRoot.appendChild(legendHoverDom);

    // Act
    LegendManager.change(menu);

    // Assert
    expect((keepTrackApi.containerRoot.querySelector('.legend-velocitySlow-box') as HTMLElement).style.background).toEqual('rgb(255, 0, 0)');
    expect((keepTrackApi.containerRoot.querySelector('.legend-velocityMed-box') as HTMLElement).style.background).toEqual('rgb(191, 64, 0)');
    expect((keepTrackApi.containerRoot.querySelector('.legend-velocityFast-box') as HTMLElement).style.background).toEqual('rgb(191, 191, 0)');
    expect(colorSchemeManagerInstance.objectTypeFlags.velocitySlow).toBe(true);
    expect(colorSchemeManagerInstance.objectTypeFlags.velocityMed).toBe(true);
    expect(colorSchemeManagerInstance.objectTypeFlags.velocityFast).toBe(true);
  });

  // Tests the behavior when the legend menu is cleared
  it('test_change_legend_menu_cleared', () => {
    const legendHoverDom = document.createElement('div');

    legendHoverDom.id = 'legend-hover-menu';
    keepTrackApi.containerRoot.appendChild(legendHoverDom);

    LegendManager.change('clear');

    expect(legendHoverDom.style.display).toBe('none');
  });

  // Tests the behavior when a sensor is selected
  it('test_change_sensor_selected', () => {
    const legendHoverDom = document.createElement('div');

    legendHoverDom.id = 'legend-hover-menu';
    keepTrackApi.containerRoot.appendChild(legendHoverDom);

    const catalogManagerInstance = {
      isSensorManagerLoaded: true,
    };
    const sensorManagerInstance = {
      currentSensors: [defaultSensor],
    };
    const colorSchemeManagerInstance = {
      resetObjectTypeFlags: jest.fn(),
    };

    keepTrackContainer.get = jest.fn().mockImplementation((singleton) => {
      if (singleton === Singletons.CatalogManager) {
        return catalogManagerInstance;
      } else if (singleton === Singletons.SensorManager) {
        return sensorManagerInstance;
      } else if (singleton === Singletons.ColorSchemeManager) {
        return colorSchemeManagerInstance;
      }

      return null;
    });

    LegendManager.change('default');

    expect(legendHoverDom.innerHTML).toBe(defaultSensorDiv);
  });

  // Tests that the legend colors are set when there is an error
  it('test_set_legend_colors_when_error', () => {
    // Arrange
    const legendHoverDom = document.createElement('div');

    legendHoverDom.id = 'legend-hover-menu';
    const velocitySlowClass = document.createElement('div');

    velocitySlowClass.classList.add('legend-velocitySlow-box');
    legendHoverDom.appendChild(velocitySlowClass);
    const velocityMedClass = document.createElement('div');

    velocityMedClass.classList.add('legend-velocityMed-box');
    legendHoverDom.appendChild(velocityMedClass);
    const velocityFastClass = document.createElement('div');

    velocityFastClass.classList.add('legend-velocityFast-box');
    legendHoverDom.appendChild(velocityFastClass);
    keepTrackApi.containerRoot.appendChild(legendHoverDom);
    settingsManager.colors = {
      velocity: [1, 0, 0, 1],
    } as unknown as ColorSchemeColorMap;

    // Act
    LegendManager.legendColorsChange();

    // Assert
    expect(colorSchemeManagerInstance.resetObjectTypeFlags).toHaveBeenCalled();
    expect(objectTypeFlags.velocitySlow).toBe(true);
    expect(objectTypeFlags.velocityMed).toBe(true);
    expect(objectTypeFlags.velocityFast).toBe(true);
    const velocitySlowBox = keepTrackApi.containerRoot.querySelector('.legend-velocitySlow-box') as HTMLElement | null;
    const velocityMedBox = keepTrackApi.containerRoot.querySelector('.legend-velocityMed-box') as HTMLElement | null;
    const velocityFastBox = keepTrackApi.containerRoot.querySelector('.legend-velocityFast-box') as HTMLElement | null;

    expect(velocitySlowBox?.style.background).toBe('rgb(255, 0, 0)');
    expect(velocityMedBox?.style.background).toBe('rgb(191, 64, 0)');
    expect(velocityFastBox?.style.background).toBe('rgb(191, 191, 0)');
  });
});
