import { CameraType } from '@app/engine/camera/camera';
import { MenuMode, SolarBody } from '@app/engine/core/interfaces';
import { PluginRegistry } from '@app/engine/core/plugin-registry';
import { ServiceLocator } from '@app/engine/core/service-locator';
import { EventBus } from '@app/engine/events/event-bus';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { CelestialBody } from '@app/engine/rendering/draw-manager/celestial-bodies/celestial-body';
import { html } from '@app/engine/utils/development/formatter';
import { getEl } from '@app/engine/utils/get-el';
import { Kilometers, RADIUS_OF_EARTH } from '@ootk/src/main';
import planetPng from '@public/img/icons/planet.png';
import { ClickDragOptions, KeepTrackPlugin } from '../../engine/plugins/base-plugin';
import { SelectSatManager } from '../select-sat-manager/select-sat-manager';
import './planets-menu.css';

export class PlanetsMenuPlugin extends KeepTrackPlugin {
  readonly id = 'PlanetsMenuPlugin';
  dependencies_ = [];
  bottomIconImg = planetPng;

  menuMode: MenuMode[] = [MenuMode.BASIC, MenuMode.ADVANCED, MenuMode.ALL];

  init(): void {
    super.init();
  }

  PLANETS = [SolarBody.Mercury, SolarBody.Venus, SolarBody.Earth, SolarBody.Mars, SolarBody.Jupiter, SolarBody.Saturn, SolarBody.Uranus, SolarBody.Neptune];
  DWARF_PLANETS = [SolarBody.Pluto, SolarBody.Makemake, SolarBody.Eris, SolarBody.Haumea, SolarBody.Ceres, SolarBody.Sedna, SolarBody.Quaoar, SolarBody.Orcus, SolarBody.Gonggong, SolarBody.Charon];
  OTHER_CELESTIAL_BODIES = [
    SolarBody.Moon, SolarBody.Sun, SolarBody.Io, SolarBody.Europa, SolarBody.Ganymede,
    SolarBody.Callisto, SolarBody.Titan, SolarBody.Rhea, SolarBody.Iapetus, SolarBody.Dione, SolarBody.Tethys, SolarBody.Enceladus,
  ];

  get DEEP_SPACE_PROBES(): string[] {
    return Object.keys(ServiceLocator.getScene()?.deepSpaceSatellites ?? {});
  }

  bottomIconElementName: string = 'menu-planets';
  sideMenuElementName: string = 'planets-menu';
  sideMenuElementHtml: string = html`
  <div id="planets-menu" class="side-menu-parent start-hidden text-select">
    <div id="planets-menu-content" class="side-menu">
      <div class="row"></div>
      <ul>
        ${this.getSideMenuElementHtmlExtras()}
      </ul>
    </div>
  </div>`;

  rmbL1ElementName = 'planets-rmb';
  rmbL1Html = html`<li class="rmb-menu-item" id="${this.rmbL1ElementName}"><a href="#">Planets &#x27A4;</a></li>`;

  isRmbOnEarth = true;
  isRmbOffEarth = true;
  rmbMenuOrder = 70;

  rmbL2ElementName = 'planets-rmb-menu';
  rmbL2Html = html`
  <ul class='dropdown-contents'>
    ${this.getRmbL2HtmlExtras()}
  </ul>`;

  getSideMenuElementHtmlExtras() {

    let html_ = '';

    html_ += html`
      <h5 class="center-align side-menu-row-header">Planets</h5>
    `;

    for (const object of this.PLANETS) {
      html_ += `<li class="menu-selectable" kt-tooltip="Center the camera on ${object}." data-planet="${object}">${object}</li>`;
    }

    html_ += html`
      <div class="divider flow5out"></div>
      <h5 class="center-align side-menu-row-header">Dwarf Planets</h5>
    `;

    for (const object of this.DWARF_PLANETS) {
      html_ += `<li class="menu-selectable" kt-tooltip="Center the camera on ${object}." data-planet="${object}">${object}</li>`;
    }

    html_ += html`
      <div class="divider flow5out"></div>
      <h5 class="center-align side-menu-row-header">Other Celestial Bodies</h5>
    `;

    for (const object of this.OTHER_CELESTIAL_BODIES) {
      const isDisabled = ['Io', 'Europa', 'Ganymede', 'Callisto', 'Titan', 'Rhea', 'Iapetus', 'Dione', 'Tethys', 'Enceladus'].includes(object) ? ' disabled' : '';

      if (isDisabled) {
        html_ += `<li class="disabled" kt-tooltip="Planned for future update." aria-disabled="true" disabled>${object}</li>`;
      } else {
        html_ += `<li class="menu-selectable" kt-tooltip="Center the camera on ${object}." data-planet="${object}">${object}</li>`;
      }
    }

    // Deep-space probes are added dynamically after data loads (see addDeepSpaceProbesMenu_)

    return html_;
  }

  getRmbL2HtmlExtras() {
    let html = '';

    for (const planet of this.PLANETS) {
      html += `<li id="planets-${planet}-rmb"><a href="#">${planet}</a></li>`;
      if (planet === SolarBody.Earth) {
        html += `<li id="planets-${SolarBody.Moon}-rmb"><a href="#">Moon</a></li>`;
      }
    }

    return html;
  }

  rmbCallback: (targetId: string | null, clickedSat?: number) => void = (targetId: string | null) => {
    // convert 'planets-moon-rmb' to 'moon'
    if (targetId?.startsWith('planets-') && targetId.endsWith('-rmb')) {
      targetId = targetId.slice(8, -4);
    }
    this.changePlanet(targetId as SolarBody ?? SolarBody.Earth);
  };

  changePlanet(planetName: SolarBody) {
    if (
      !this.PLANETS.includes(planetName) &&
      !this.DWARF_PLANETS.includes(planetName) &&
      !this.OTHER_CELESTIAL_BODIES.includes(planetName) &&
      !this.DEEP_SPACE_PROBES.includes(planetName)
    ) {
      return;
    }

    if (planetName === SolarBody.Earth || planetName === SolarBody.Moon) {
      ServiceLocator.getLineManager().clear();
    }

    ServiceLocator.getDotsManager().updateSizeBuffer(ServiceLocator.getCatalogManager().objectCache.length);

    PluginRegistry.getPlugin(SelectSatManager)?.selectSat(-1); // Deselect any selected satellite
    settingsManager.centerBody = planetName;
    ServiceLocator.getMainCamera().cameraType = CameraType.FIXED_TO_EARTH;
    ServiceLocator.getUiManager().hideSideMenus();

    if (planetName === SolarBody.Sun) {
      this.drawOrbits_(planetName);
      settingsManager.minZoomDistance = 62e6 as Kilometers; // 62 million km
      settingsManager.maxZoomDistance = 1.5e10 as Kilometers; // 15 billion km
      this.setAllPlanetsDotSize(1);
    } else if (planetName === SolarBody.Earth) {
      settingsManager.minZoomDistance = RADIUS_OF_EARTH + 50 as Kilometers;
      settingsManager.maxZoomDistance = 1.2e6 as Kilometers; // 1.2 million km
      this.setAllPlanetsDotSize(0);
    } else if (planetName === SolarBody.Moon) {
      const selectedPlanet = ServiceLocator.getScene().moons.Moon;

      selectedPlanet.useHighestQualityTexture();
      settingsManager.minZoomDistance = selectedPlanet.RADIUS * 1.2 as Kilometers;
      settingsManager.maxZoomDistance = 1.2e6 as Kilometers; // 1.2 million km
      this.setAllPlanetsDotSize(0);
    } else {
      // Anything but Earth, Moon or Sun
      this.drawOrbits_(planetName);
      const selectedPlanet = ServiceLocator.getScene().getBodyById(planetName);

      if (!selectedPlanet) {
        console.error(`Planet ${planetName} not found in scene.`);

        return;
      }

      selectedPlanet.useHighestQualityTexture();
      settingsManager.minZoomDistance = selectedPlanet.RADIUS * 1.2 as Kilometers;
      settingsManager.maxZoomDistance = 1.3e10 as Kilometers; // 13 billion km
      this.setAllPlanetsDotSize(1);
    }
  }

  dragOptions: ClickDragOptions = {
    isDraggable: true,
  };

  addHtml(): void {
    super.addHtml();
    EventBus.getInstance().on(
      EventBusEvent.uiManagerFinal,
      () => {
        getEl('planets-menu')
          ?.querySelectorAll('li')
          .forEach((element) => {
            element.addEventListener('click', () => {
              const planetName = element.dataset.planet;

              if (!planetName) {
                console.error('Planet name not found in dataset');

                return;
              }

              this.planetsMenuClick(planetName ?? '');
            });
          });
      },
    );
  }

  private drawOrbits_(planetName: SolarBody) {
    // NOTE: Don't use changePlanet() here to avoid infinite loop
    settingsManager.centerBody = SolarBody.Sun; // Temporarily set to Sun to draw orbits relative to Sun

    const moon = ServiceLocator.getScene().getBodyById(SolarBody.Moon)!;
    const gl = ServiceLocator.getRenderer().gl;

    moon.isDrawOrbitPath = true;
    moon.drawFullOrbitPath();
    moon.planetObject?.setHoverDotSize(gl, 1);

    for (const planetBody of this.PLANETS.filter((p) => p !== SolarBody.Moon)) {
      const planet = ServiceLocator.getScene().getBodyById(planetBody) as CelestialBody;

      if (!planet) {
        continue;
      }

      planet.isDrawOrbitPath = true;
      planet.drawFullOrbitPath();
    }
    for (const dwarfPlanetBody of this.DWARF_PLANETS) {
      const dwarfPlanet = ServiceLocator.getScene().getBodyById(dwarfPlanetBody) as CelestialBody;

      if (!dwarfPlanet) {
        continue;
      }

      dwarfPlanet.isDrawOrbitPath = true;
      dwarfPlanet.drawFullOrbitPath();
    }
    for (const probeName of this.DEEP_SPACE_PROBES) {
      const probe = ServiceLocator.getScene().getBodyById(probeName as SolarBody) as CelestialBody;

      if (!probe) {
        continue;
      }

      probe.isDrawOrbitPath = true;
      probe.drawFullOrbitPath();
    }

    this.setAllPlanetsDotSize(1);

    settingsManager.centerBody = planetName; // Set back to selected planet
  }

  addJs(): void {
    super.addJs();

    EventBus.getInstance().on(EventBusEvent.KeyDown, (key: string, _code: string, isRepeat: boolean, isShift: boolean) => {
      if (key === 'Home' && isShift && !isRepeat) {
        this.changePlanet(SolarBody.Earth);
      }
    });

    EventBus.getInstance().on(EventBusEvent.KeyDown, (key: string, _code: string, isRepeat: boolean, isShift: boolean) => {
      if (key === 'Home' && !isShift && !isRepeat) {
        settingsManager.centerBody = SolarBody.Earth;
        settingsManager.minZoomDistance = RADIUS_OF_EARTH + 50 as Kilometers;
        settingsManager.maxZoomDistance = 1.2e6 as Kilometers; // 1.2 million km
      }
    });
  }

  setAllPlanetsDotSize(size = 1): void {
    const gl = ServiceLocator.getRenderer().gl;
    const moon = ServiceLocator.getScene().getBodyById(SolarBody.Moon)!;
    const earth = ServiceLocator.getScene().getBodyById(SolarBody.Earth)!;

    moon.planetObject?.setHoverDotSize(gl, size);
    earth.planetObject?.setHoverDotSize(gl, size);

    for (const planetBody of this.PLANETS) {
      const planet = ServiceLocator.getScene().getBodyById(planetBody) as CelestialBody;

      planet?.planetObject?.setHoverDotSize(gl, size);
    }

    for (const dwarfPlanetBody of this.DWARF_PLANETS) {
      const dwarfPlanet = ServiceLocator.getScene().getBodyById(dwarfPlanetBody as SolarBody) as CelestialBody;

      dwarfPlanet?.planetObject?.setHoverDotSize(gl, size);
    }

    for (const otherBody of this.OTHER_CELESTIAL_BODIES) {
      const otherCelestialBody = ServiceLocator.getScene().getBodyById(otherBody as SolarBody) as CelestialBody;

      otherCelestialBody?.planetObject?.setHoverDotSize(gl, size);
    }

    for (const probeName of this.DEEP_SPACE_PROBES) {
      const probe = ServiceLocator.getScene().getBodyById(probeName as SolarBody) as CelestialBody;

      probe?.planetObject?.setHoverDotSize(gl, size);
    }
  }

  planetsMenuClick = (planetName: string) => {
    this.rmbCallback(planetName);
  };

  private hasAddedDeepSpaceProbes_ = false;

  /** Dynamically adds deep-space probe entries to the menu after ephemeris data has loaded. */
  private addDeepSpaceProbesMenu_(): void {
    if (this.hasAddedDeepSpaceProbes_) {
      return;
    }
    this.hasAddedDeepSpaceProbes_ = true;

    const probes = this.DEEP_SPACE_PROBES;

    if (probes.length === 0) {
      return;
    }

    const ul = getEl('planets-menu')?.querySelector('ul');

    if (!ul) {
      return;
    }

    const divider = document.createElement('div');

    divider.className = 'divider flow5out';
    ul.appendChild(divider);

    const header = document.createElement('h5');

    header.className = 'center-align side-menu-row-header';
    header.textContent = 'Deep Space Probes';
    ul.appendChild(header);

    for (const probe of probes) {
      const li = document.createElement('li');

      li.className = 'menu-selectable';
      li.setAttribute('kt-tooltip', `Center the camera on ${probe}.`);
      li.dataset.planet = probe;
      li.textContent = probe;
      li.addEventListener('click', () => {
        this.planetsMenuClick(probe);
      });
      ul.appendChild(li);
    }
  }

  bottomIconCallback = (): void => {
    this.addDeepSpaceProbesMenu_();
  };
}

