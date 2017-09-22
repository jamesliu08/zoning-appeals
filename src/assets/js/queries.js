import axios from 'axios';
import turf from 'turf';
import Leaflet from 'leaflet';

const vsprintf = require('sprintf-js').vsprintf;

export const CARTO_URL = 'https://data.phila.gov/carto/api/v2/sql?q=';
export const RCO_SERVICE = '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Zoning_RCO/FeatureServer/0/query?';
export const strings = {
  rcoNames: 'http://gis.phila.gov/arcgis/rest/services/PhilaGov/RCO/MapServer/0/query?where=1%3D1&outFields=ORGANIZATION_NAME&returnGeometry=false&returnIdsOnly=false&returnCountOnly=false&orderByFields=ORGANIZATION_NAME&returnZ=false&returnM=false&returnDistinctValues=false&f=pjson',
  rcoGeom: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Zoning_RCO/FeatureServer/0/query?where=ORGANIZATION_NAME=\'25th Republican Ward\'&f=pjson',
  appealsByDate: 'SELECT date_scheduled, address, appealno, applictype FROM LI_APPEALS WHERE applictype = \'RB_ZBA\' AND DATE(date_scheduled) >= \'%s\' AND DATE(date_scheduled) < \'%s\' ORDER BY date_scheduled ASC',
  appealById: 'SELECT * FROM LI_APPEALS WHERE appealno = \'%s\'',
  courtHistory: 'SELECT * FROM LI_COURT_APPEALS WHERE appealnumber = \'%s\' ORDER BY courtactiondate DESC',
  deicisionHistory: 'SELECT * FROM LI_BOARD_DECISIONS WHERE appealnumber = \'%s\' ORDER BY decisiondate DESC',
};

export function prepare(...args) {
  if (!args || args.length === 0) {
    return '';
  }
  const a = Array.from(args);
  const q = a.shift();
  return encodeURIComponent(vsprintf(q, a));
}

export function query(q, data) {
  return axios.get(q, data);
}

export function spatialQuery(url, relationship, targetGeom, calculateDistancePt) {
  // console.log('fetch esri spatial query', dataSourceKey, url, relationship, targetGeom);

  const query = L.esri.query({ url })[relationship](targetGeom);

  query.run((error, featureCollection, response) => {
    // console.log('did get esri spatial query', response, error);

    let features = (featureCollection || {}).features;
    const status = error ? 'error' : 'success';

    // calculate distance
    if (calculateDistancePt) {
      const from = turf.point(calculateDistancePt);

      features = features.map(feature => {
        // console.log('feat', feature);
        const featureCoords = feature.geometry.coordinates;
        const to = turf.point(featureCoords);
        const dist = turf.distance(from, to, 'miles');

        // TODO make distance units an option. for now, just hard code to ft.
        const distFeet = parseInt(dist * 5280);

        feature._distance = distFeet;

        return feature;
      })
    }

    this.dataManager.didFetchData(dataSourceKey, status, features);
  });
}
