import { keepTrackApi } from '@app/keepTrackApi';

export const timeMachineMenuDiv = keepTrackApi.html`
<div id="time-machine-menu">
  <ul id="time-machine-default">
    <li>
      <div class="Square-Box legend-payload-box"></div>
      1960s
    </li>
    <li>
      <div class="Square-Box legend-rocketBody-box"></div>
      1970s
    </li>
    <li>
      <div class="Square-Box legend-debris-box"></div>
      1980s
    </li>
    <li>
      <div class="Square-Box legend-pink-box"></div>
      1990s
    </li>
    <li>
      <div class="Square-Box legend-sensor-box"></div>
      2000s
    </li>
    <li>
      <div class="Square-Box legend-facility-box"></div>
      2010s
    </li>
  </ul>
</div>
`.trim();
export const defaultDiv = keepTrackApi.html`
<ul id="legend-list-default">
  <li>
    <div class="Square-Box legend-payload-box"></div>
    Payload
  </li>
  <li>
    <div class="Square-Box legend-rocketBody-box"></div>
    Rocket Body
  </li>
  <li>
    <div class="Square-Box legend-debris-box"></div>
    Debris
  </li>
  <li>
    <div class="Square-Box legend-pink-box"></div>
    Special Sats
  </li>
  <li>
    <div class="Square-Box legend-sensor-box"></div>
    Sensor
  </li>
  <!-- TODO: This is part of the showAgencies feature that is being worked on -->
  <!-- <li>
    <div class="Square-Box legend-facility-box"></div>
    Launch Site
  </li> -->
</ul>
`.trim();
export const planetariumDiv = keepTrackApi.html`
<ul id="legend-list-planetarium">
  <li>
    <div class="Square-Box legend-payload-box"></div>
    Payload
  </li>
  <li>
    <div class="Square-Box legend-rocketBody-box"></div>
    Rocket Body
  </li>
  <li>
    <div class="Square-Box legend-debris-box"></div>
    Debris
  </li>
  <li>
    <div class="Square-Box legend-pink-box"></div>
    Special Sats
  </li>
</ul>
`.trim();
export const astronomyDiv = keepTrackApi.html`
<ul id="legend-list-astronomy">
  <li>
    <div class="Square-Box legend-starHi-box"></div>
    VisMag Less Than 3.5
  </li>
  <li>
    <div class="Square-Box legend-starMed-box"></div>
    VisMag Between 3.5 and 4.7
  </li>
  <li>
    <div class="Square-Box legend-starLow-box"></div>
    VisMag Greater Than 4.7
  </li>
</ul>
`.trim();
export const sunlightDiv = keepTrackApi.html`
<ul id="legend-list-sunlight">
  <li>
    <div class="Square-Box legend-satLow-box"></div>
    In Umbral
  </li>
  <li>
    <div class="Square-Box legend-satMed-box"></div>
    In Penumbral
  </li>
  <li>
    <div class="Square-Box legend-satHi-box"></div>
    In Sunlight
  </li>
  <li>
    <div class="Square-Box legend-inFOV-box"></div>
    Satellite FOV
  </li>
</ul>
`.trim();
export const defaultSensorDiv = keepTrackApi.html`
<ul id="legend-list-default-sensor">
  <li>
    <div class="Square-Box legend-payload-box"></div>
    Payload
  </li>
  <li>
    <div class="Square-Box legend-rocketBody-box"></div>
    Rocket Body
  </li>
  <li>
    <div class="Square-Box legend-debris-box"></div>
    Debris
  </li>
  <li>
    <div class="Square-Box legend-pink-box"></div>
    Special Sats
  </li>
  <li>
    <div class="Square-Box legend-inFOV-box"></div>
    Satellite In FOV
  </li>
  <li>
    <div class="Square-Box legend-missile-box"></div>
    Missile
  </li>
  <li>
    <div class="Square-Box legend-missileInview-box"></div>
    Missile In View
  </li>
  <li>
    <div class="Square-Box legend-sensor-box"></div>
    Sensor
  </li>
  <li>
    <div class="Square-Box legend-facility-box"></div>
    Launch Site
  </li>
</ul>
`.trim();
export const confidenceDiv = keepTrackApi.html`
<ul id="legend-list-confidence">
  <li>
    <div class="Square-Box legend-confidenceLow-box"></div>
    3 or Lower
  </li>
  <li>
    <div class="Square-Box legend-confidenceMed-box"></div>
    Between 3 and 7
  </li>
  <li>
    <div class="Square-Box legend-confidenceHi-box"></div>
    7 or Higher
  </li>
</ul>
`.trim();
export const rcsDiv = keepTrackApi.html`
<ul id="legend-list-rcs">
  <li>
    <div class="Square-Box legend-rcsSmall-box"></div>
    Less Than 0.1 sq m
  </li>
  <li>
    <div class="Square-Box legend-rcsMed-box"></div>
    Between 0.1 and 1 sq m
  </li>
  <li>
    <div class="Square-Box legend-rcsLarge-box"></div>
    More Than 1 sq m
  </li>
  <li>
    <div class="Square-Box legend-rcsUnknown-box"></div>
    No Public Data
  </li>
</ul>
`.trim();
export const neighborsDiv = keepTrackApi.html`
<ul id="legend-list-default-sensor">
  <li>
    <div class="Square-Box legend-densityPayload-box"></div>
    Payload
  </li>
  <li>
    <div class="Square-Box legend-densityHi-box"></div>
    High Orbit Density
  </li>
  <li>
    <div class="Square-Box legend-densityMed-box"></div>
    Med Orbit Density
  </li>
  <li>
    <div class="Square-Box legend-densityLow-box"></div>
    Low Orbit Density
  </li>
  <li>
    <div class="Square-Box legend-densityOther-box"></div>
    Other Debris
  </li>
</ul>
`.trim();

export const ageOfElsetDiv = keepTrackApi.html`
<ul id="legend-list-ageOfElset">
  <li>
    <div class="Square-Box legend-age1-box"></div>
    Less Than 0.5 Days
  </li>
  <li>
    <div class="Square-Box legend-age2-box"></div>
    Between 0.5 and 1 Days
  </li>
  <li>
    <div class="Square-Box legend-age3-box"></div>
    Between 1 and 1.5 Days
  </li>
  <li>
    <div class="Square-Box legend-age4-box"></div>
    Between 1.5 and 2 Days
  </li>
  <li>
    <div class="Square-Box legend-age5-box"></div>
    Between 2 and 2.5 Days
  </li>
  <li>
    <div class="Square-Box legend-age6-box"></div>
    Between 2.5 and 3 Days
  </li>
  <li>
    <div class="Square-Box legend-age7-box"></div>
    More Than 3 Days
  </li>
</ul>
`.trim();
export const dataSourceDiv = keepTrackApi.html`
<ul id="legend-list-dataSource">
  <li>
    <div class="Square-Box legend-sourceAldoria-box"></div>
    Aldoria
  </li>
  <li>
    <div class="Square-Box legend-sourceUssf-box"></div>
    18 SDS
  </li>
  <li>
    <div class="Square-Box legend-sourceCelestrak-box"></div>
    Celestrak
  </li>
  <li>
    <div class="Square-Box legend-sourcePrismnet-box"></div>
    Prismnet
  </li>
  <li>
    <div class="Square-Box legend-sourceVimpel-box"></div>
    Vimpel
  </li>
  <li>
    <div class="Square-Box legend-countryOther-box"></div>
    Other
  </li>
</ul>
`.trim();
export const smallDiv = keepTrackApi.html`
<ul id="legend-list-small">
  <li>
    <div class="Square-Box legend-satSmall-box"></div>
    Small Satellite
  </li>
  <!-- <li><div class="Square-Box legend-inFOV-box"></div>Satellite In View</li> -->
</ul>
`.trim();
export const nearDiv = keepTrackApi.html`
<ul id="legend-list-near">
  <li>
    <div class="Square-Box legend-satLEO-box"></div>
    Apogee < Than 2000 km
  </li>
  <!-- <li><div class="Square-Box legend-satOther-box"></div>Other Satellite</li> -->
  <li>
    <div class="Square-Box legend-inFOV-box"></div>
    Satellite In View
  </li>
</ul>
`.trim();
export const deepDiv = keepTrackApi.html`
<ul id="legend-list-deep">
  <li>
    <div class="Square-Box legend-satGEO-box"></div>
    Perigee > Than 35000 km
  </li>
  <!-- <li><div class="Square-Box legend-satOther-box"></div>Other Satellite</li> -->
  <li>
    <div class="Square-Box legend-inFOV-box"></div>
    Satellite In View
  </li>
</ul>
`.trim();
export const velocityDiv = keepTrackApi.html`
<ul id="legend-list-velocity">
  <li>
    <div class="Square-Box legend-velocityFast-box"></div>
    ~7 km/s Velocity
  </li>
  <li>
    <div class="Square-Box legend-velocityMed-box"></div>
    ~4 km/s Velocity
  </li>
  <li>
    <div class="Square-Box legend-velocitySlow-box"></div>
    ~1 km/s Velocity
  </li>
  <!-- Not sure we need to see what is in view in the mode -->
  <!-- <li><div class="Square-Box legend-inviewAlt-box"></div>Satellite In View</li> -->
</ul>
`.trim();
export const countriesDiv = keepTrackApi.html`
<ul id="legend-list-countries">
  <li>
    <div class="Square-Box legend-countryUS-box"></div>
    United States
  </li>
  <li>
    <div class="Square-Box legend-countryCIS-box"></div>
    Russia
  </li>
  <li>
    <div class="Square-Box legend-countryPRC-box"></div>
    China
  </li>
  <li>
    <div class="Square-Box legend-countryOther-box"></div>
    Other
  </li>
</ul>
`.trim();
