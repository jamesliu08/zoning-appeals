import * as moment from 'moment';

export function getFilterResultsCollection(data) {
  const myData = data;
  if (typeof data === 'object' && data.length > 0) {
    for (let i = 0; i < data.length; i += 1) {
      const temp = moment(data[i].date_scheduled, moment.ISO_8601).utc();
      myData[i].date = temp.format('MM/DD/YYYY');
      if (temp.format('HH:mm:ss') === '00:00:00') {
        myData[i].time = '';
      } else {
        myData[i].time = temp.format('hh:mm A');
      }
    }

    return myData;
  }
  return [];
}

export function getAppealsDataObject(data) {
  if (typeof data === 'object') {
    const tempObj = {};

    tempObj.address = data.address;
    tempObj.type = data.applictype;
    tempObj.appealNo = data.appealno;
    tempObj.permitNo = data.descriptionofproject;
    tempObj.description = data.appealgrounds;
    tempObj.primaryApplicant = data.primaryapplicant;
    tempObj.latLng = data.latlng;

    const tempDate = moment(data.date_scheduled, moment.ISO_8601).utc();
    if (tempDate.format('HH:mm:ss') === '00:00:00') {
      tempObj.time = '-';
    } else {
      tempObj.time = tempDate.format('hh:mm A');
    }
    tempObj.date = tempDate.format('MM/DD/YYYY');

    return tempObj;
  }
  return {};
}

export function getCourtHistoryCollection(data) {
  if (typeof data === 'object' && data.length > 0) {
    const tempArr = [];
    for (let i = 0; i < data.length; i += 1) {
      const tempObj = {};
      const tempDate = moment(data[i].courtactiondate, moment.ISO_8601).utc();
      if (tempDate.format('HH:mm:ss') === '00:00:00') {
        tempObj.courtactiondate = tempDate.format('MM/DD/YYYY');
      } else {
        tempObj.courtactiondate = tempDate.format('MM/DD/YYYY hh:mm A');
      }
      tempObj.court = data[i].court;
      tempObj.courtcasenumber = data[i].courtcasenumber;
      tempObj.courtaction = data[i].courtaction;
      tempObj.courtresult = data[i].courtresult;
      tempObj.courtproviso = data[i].courtproviso;
      tempArr.push(tempObj);
    }
    return tempArr;
  }
  return [];
}


export function getDecisionHistoryCollection(data) {
  if (typeof data === 'object' && data.length > 0) {
    const tempArr = [];
    for (let i = 0; i < data.length; i += 1) {
      const tempObj = {};
      const tempDate = moment(data[i].decisiondate, moment.ISO_8601).utc();
      if (tempDate.format('HH:mm:ss') === '00:00:00') {
        tempObj.decisiondate = tempDate.format('MM/DD/YYYY');
      } else {
        tempObj.decisiondate = tempDate.format('MM/DD/YYYY hh:mm A');
      }
      tempObj.decision = data[i].decision;
      tempObj.proviso = data[i].proviso;
      tempArr.push(tempObj);
    }
    return tempArr;
  }
  return [];
}
