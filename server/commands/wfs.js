'use strict';

let fetch   = require('node-fetch');
let Rx      = require('rx');
let parser  = require('xml2json');

module.exports = {
  getCapabilities : url => {
    url += '?service=WFS&request=GetCapabilities';
    return Rx.Observable.create(observer => {
      fetch(url)
        .then(res => res.text())
        .then(b => observer.onNext(b))
        .catch(err => observer.onError(err));
    })
    .map(xml => parser.toJson(xml, { object: true }))
    .map(json => {
      let root = json['wfs:WFS_Capabilities'];
      let feature_list = root['FeatureTypeList'];
      let layers = feature_list['FeatureType'];
      return layers;
    })
    .map(layers => {
      if (!Array.isArray(layers)) {
        layers = [layers];
      }
      return layers.map(l => l.Name);
    });
  }
};
