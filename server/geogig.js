'use strict';

var fetch = require('isomorphic-fetch');
var Rx = require('rx');
var FormData = require('form-data');
var fs = require('fs');
var querystring = require('querystring');

// TODO: remove this when geogig api returns json
var xpath = require('xpath');
var dom = require('xmldom');

// web-api config defaults
var defaultUrl = 'http://geogig:8182/';
var defaultOptions = {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'spatialconnect'
  }
};

function Client(url) {
  this.url = url || defaultUrl;
  this.options = defaultOptions;
}

var checkStatus = function (response) {
  console.log('status was ' + response.status + ' for ' + response.url);
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
};

var parseJSON = function (response) {
  return response.json();
};

var fetch$ = function (url, options) {
  return Rx.Observable.fromPromise(
    fetch(url, options)
      .then(checkStatus)
      .then(parseJSON)
      .catch(err => Rx.Observable.throw(err))
  );
};

Client.prototype.repos = function () {
  var url = this.url + 'repos.json';
  return fetch$(url, this.options);
};

Client.prototype.createRepo = function (repoName) {
  if (!repoName) {
    Rx.Observable.throw(new Error('A repository name is required.'));
  }
  // currently we need to add response body so you don't get a 400 error
  var options = {
    method: 'PUT',
    body: '{}',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'spatialconnect',
      'Content-Length': 2
    }
  };
  var url = this.url + 'repos/' + repoName + '/init.json';
  return fetch$(url, options);
};

Client.prototype.beginTransaction = function (repoName) {
  if (!repoName) {
    Rx.Observable.throw(new Error('A repository name is required.'));
  }
  var url = this.url + 'repos/' + repoName + '/beginTransaction.json';
  return fetch$(url, this.options);
};

/**
 * Makes request to end the transaction.
 * @param  repoName      name of repository to end transaction on
 * @param  transactionId transaction id to end
 * @return               observable emitting response or error
 */
Client.prototype.endTransaction = function (repoName, transactionId) {
  if (!repoName) {
    Rx.Observable.throw(new Error('A repository name is required.'));
  }
  if (!transactionId) {
    Rx.Observable.throw(new Error('A transactionId is required.'));
  }
  var url = this.url + 'repos/' + repoName + '/endTransaction.json?transactionId=' + transactionId;
  return fetch$(url, this.options);
};

/**
 * Makes the import request and returns async task id.
 *
 * @param  transactionId     the transaction id
 * @param  repoName          name of repository to import into
 * @param  gpkgPath          local file path to the GeoPackage
 * @param  refSpec           branch name or commit identifier features are imported to
 * @param  interchangeFormat boolean indicating if the GeoGig GeoPackage Extension is used
 * @return                   an observable that emits the task id or error
 */
Client.prototype.import = function (
  transactionId,
  repoName,
  gpkgPath,
  refSpec,
  interchangeFormat) {
  // build url with query params
  var params = querystring.stringify({
    format: 'gpkg',
    root: refSpec || 'master',
    message: 'Import GeoPacakge',
    transactionId: transactionId,
    interchangeFormat: interchangeFormat || 'false',
    authorName: 'spatialconnect',
    authorEmail: 'spatialconnect@boundlessgeo.com'
  });
  var url = this.url + 'repos/' + repoName + '/import.json?' + params;

  // create a "multipart/form-data" from a file stream
  var form = new FormData();
  form.append('fileUpload', fs.createReadStream(gpkgPath));

  // setup request options
  var options = {
    method: 'POST',
    body: form,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'spatialconnect'
    }
  };
  // return an observable that emits the taskId
  return Rx.Observable.fromPromise(
      fetch(url, options)
        .then(checkStatus)
        .then(res => res.text())
        .catch(err => Rx.Observable.throw(err))
    )
    .map(xml => {
      var doc = new dom.DOMParser().parseFromString(xml);
      var taskId = xpath.select('//task/id/text()', doc);
      return taskId;
    });
};

/**
 * Poll the async task until FINISHED, FAILED, or CANCELLED.
 * {@link http://geogig.org/docs/interaction/async-tasks.html docs}
 *
 * @param  url     the task url
 * @param  options fetch request options
 * @return         observable emitting finished task response or error
 */
var pollTask$ = function (url, options) {
  // wrap the request observable in a defer so that a new observable is
  // created (and thus the request is re-executed) when retryWhen re-subscribes
  return Rx.Observable.defer(() => fetch$(url, options))
    .map(res => {
      console.log('task response ' + JSON.stringify(res));
      if (res.task.status !== 'FINISHED') {
        throw 'ex'; // error will be picked up by retryWhen
      }
      return res;
    })
    // retry 5 times with exponential backoff strategy
    .retryWhen(err => {
      return Rx.Observable.zip(
          Rx.Observable.range(1, 5),
          err,
          (i, err) => i
        )
        .flatMap(i => {
          console.log('delay retry by ' + Math.pow(4, i) + ' second(s)');
          return Rx.Observable.timer(Math.pow(4, i) * 1000);
        });
    });
};

/**
 * Import features from tables in a GeoPackage into a GeoGig repository.
 * {@link http://geogig.org/docs/interaction/geopackage-import-export.html#geopackage-import docs}
 *
 * @param  repoName          name of repository to import into
 * @param  gpkgPath          local file path to the GeoPackage
 * @param  refSpec           branch name or commit identifier features are imported to
 * @param  interchangeFormat boolean indicating if the GeoGig GeoPackage Extension is used
 * @return                   observable emitting the final task response or error
 */
Client.prototype.importGeoPackage = function (
  repoName,
  gpkgPath,
  refSpec,
  interchangeFormat) {
  if (!repoName) {
    Rx.Observable.throw(new Error('A repository name is required.'));
  }
  if (!gpkgPath) {
    Rx.Observable.throw(new Error('A path to the GeoPackage file is required.'));
  }
  // create transaction observable to request and emit transaction id
  var txObs = this.beginTransaction(repoName)
    .map(res => {
      if (res.response.Transaction.ID) {
        return res.response.Transaction.ID;
      }
      var error = new Error(res.statusText);
      error.response = res;
      Rx.Observable.throw(error);
    });
  // use combineLatest operator to get the txId and taskId
  return Rx.Observable.combineLatest(txObs,
    // make request to import geopackage and return the taskId
    txObs.flatMap(txId => {
        return this.import(txId, repoName, gpkgPath, refSpec, interchangeFormat);
    }),
    (transactionId, taskId) => {
      // poll the task until completed
      var url = this.url + 'tasks/' + taskId + '.json';
      pollTask$(url, this.options)
        .subscribe(res => {
          // complete the transaction, then return response
          this.endTransaction(repoName, transactionId);
          return res;
        });
    });
};

/**
 * Exports a snapshot of a GeoGig repository as a GeoPackage file.
 * {@link http://geogig.org/docs/interaction/geopackage-import-export.html#geopackage-export docs}
 *
 * @param  repoName    name of repository to export from
 * @param  refSpec     branch name or commit identifier to export from
 * @param  bbox        bounding box filter as minx,miny,maxx,maxy,<SRS>
 * @return             observable emitting the response with the url to download or error
 */
Client.prototype.exportGeoPackage = function (
  repoName,
  refSpec,
  bbox) {
  // build url with query params
  var params = querystring.stringify({
    format: 'gpkg',
    root: refSpec || 'master',
    bbox: bbox || null,
    interchange: 'true'
  });
  var url = this.url + 'repos/' + repoName + '/export.json?' + params;
  // return an observable that emits the link where the subscriber can download from
  return fetch$(url, this.options).flatMap(res => {
      var taskId = res.task.id;
      // poll the task until the response has completed
      var url = this.url + 'tasks/' + taskId + '.json';
      return pollTask$(url, this.options)
        .map(res => {
          // return link to download file
          var downloadLink = res.task.result.href;
          console.log('downloadLink: ' + downloadLink);
          return res;
        });
    });
};

module.exports = {
  Client: Client
};
/**
Example Usage:
var geogig = require('./geogig');
var client = new geogig.Client();
client.createRepo('my-new-repo').subscribe(res => console.log(JSON.stringify(res)))
client.importGeoPackage('my-new-repo', '/tmp/rio.gpkg').subscribe(res => console.log(res))
client.repos().subscribe(res => console.log(JSON.stringify(res)))
client.exportGeoPackage('test-repo', 'master').subscribe(res => console.log(res))
// import from device
client.importGeoPackage('my-new-repo', '/tmp/rio.gpkg').subscribe(res => console.log(res))

**/
