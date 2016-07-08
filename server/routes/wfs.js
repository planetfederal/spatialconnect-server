'use strict';

let express = require('express');
let fetch   = require('node-fetch');
let Rx      = require('rx');
let parser  = require('xml2json');

let router = express.Router();

router.get('/getCapabilities', (req, res) => {
  let url = req.query.url + '?service=WFS&request=GetCapabilities';
  Rx.Observable.create(observer => {
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
  .map(layers => layers.map(l => l.Name))
  .subscribe(layer_names => res.json(layer_names), () => res.status(500).send());
});

module.exports = router;
