'use strict';

var express = require('express');
let router = express.Router();
var models = require('../models/');
var Rx = require('rx');
var _ = require('lodash');
var sqlite3 = require('sqlite3').verbose();
var uuid = require('node-uuid');

const tKeys = ['created_at','updated_at','deleted_at'];

var filterStampsAndNulls = (ff) => {
  return _.chain(ff.dataValues)
    .omit(tKeys)
    .omitBy(_.isNull)
    .value();
};

// example payload: https://gist.github.com/marcusthebrown/d467f146c69a2b081944a1fd026ce551
router.post('/', (req, res) => {
    Rx.Observable.from(req.body.operations)
      .flatMap(op => {
        return Rx.Observable.fromPromise(
          models.Operations.upsert({
            geogig_repo_name: req.body.geogig_repo_name,
            geogig_commit_id: req.body.geogig_commit_id,
            geogig_tree: op.geogig_tree,
            geogig_feature_id: op.geogig_feature_id,
            audit_op: op.audit_op,
            audit_timestamp: op.audit_timestamp,
            properties: op.properties
          })
        );
      })
      .reduce((acc, res, idx, source) => res, false)
      .subscribe(
          (finalResponse) => res.json({success:finalResponse}),
          (err) => res.json({success:false, message:err})
      );
});

var cb = function (error, rows) {
    console.log('this: ' + JSON.stringify(this));
    if (error) {
        console.trace(error);
    }
};

var createGpkg = function (fileName, operations) {
  var db = new sqlite3.Database(fileName);
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    // console.log('BEGIN TRANSACTION;');

    db.run('CREATE TABLE IF NOT EXISTS geogig_audited_tables (table_name VARCHAR, mapped_path VARCHAR, audit_table VARCHAR, commit_id VARCHAR)');
    // console.log('CREATE TABLE IF NOT EXISTS geogig_audited_tables (table_name VARCHAR, mapped_path VARCHAR, audit_table VARCHAR, commit_id VARCHAR);')

    db.run('CREATE TABLE IF NOT EXISTS geogig_metadata (repository_uri VARCHAR)');
    // console.log('CREATE TABLE IF NOT EXISTS geogig_metadata (repository_uri VARCHAR);')

    // create required gpkg tables
    db.run('CREATE TABLE gpkg_contents (table_name TEXT NOT NULL PRIMARY KEY,data_type TEXT NOT NULL,identifier TEXT UNIQUE,description TEXT DEFAULT \'\',last_change DATETIME NOT NULL DEFAULT (strftime(\'%Y-%m-%dT%H:%M:%fZ\',CURRENT_TIMESTAMP)),min_x DOUBLE, min_y DOUBLE,max_x DOUBLE, max_y DOUBLE,srs_id INTEGER)');
    db.run('CREATE TABLE gpkg_spatial_ref_sys (srs_name TEXT NOT NULL,srs_id INTEGER NOT NULL PRIMARY KEY,organization TEXT NOT NULL,organization_coordsys_id INTEGER NOT NULL,definition  TEXT NOT NULL,description TEXT)');
    db.run('INSERT OR IGNORE INTO gpkg_spatial_ref_sys (srs_name,srs_id,organization,organization_coordsys_id,definition,description) VALUES (\'WGS 84 geodetic\', \'4326\', \'EPSG\', \'4326\', \'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]\', \'longitude/latitude coordinates in decimal degrees on the WGS 84 spheroid\')');
    db.run('CREATE TABLE gpkg_geometry_columns (table_name TEXT NOT NULL,column_name TEXT NOT NULL,geometry_type_name TEXT NOT NULL,srs_id INTEGER NOT NULL,z TINYINT NOT NULL,m TINYINT NOT NULL,CONSTRAINT pk_geom_cols PRIMARY KEY (table_name, column_name),CONSTRAINT uk_gc_table_name UNIQUE (table_name),CONSTRAINT fk_gc_tn FOREIGN KEY (table_name) REFERENCES gpkg_contents(table_name),CONSTRAINT fk_gc_srs FOREIGN KEY (srs_id) REFERENCES gpkg_spatial_ref_sys (srs_id))');

    operations.map((op) => {
      // add entry to gpkg_contents
      db.run('INSERT OR IGNORE INTO gpkg_contents (table_name, data_type) VALUES (?,?)', op.geogig_tree, 'features');
      // add entry gpkg_geometry_columns so we know the feature type
      // TODO: take this out b/c the geogig repository knows this information...we shouldn't need to build a table that duplicates info??
      db.run('INSERT OR IGNORE INTO gpkg_geometry_columns (table_name,column_name,geometry_type_name,srs_id,z,m) VALUES (\'buildings\', \'geom\', \'POLYGON\', 4326, 0, 0)');

      // insert a row for the audit table
      // db.run('INSERT OR IGNORE INTO geogig_audited_tables (table_name, mapped_path, audit_table, commit_id) VALUES (\'?\',\'?\',\'?\',\'?\')',
      //   op.geogig_tree,
      //   op.geogig_tree,
      //   op.geogig_tree + '_audit',
      //   op.geogig_commit_id
      // , cb);
      db.run('INSERT OR IGNORE INTO geogig_audited_tables (table_name, mapped_path, audit_table, commit_id) VALUES (?,?,?,?)',
        op.geogig_tree,
        op.geogig_tree,
        op.geogig_tree + '_audit',
        op.geogig_commit_id
      , cb);
      // console.log('INSERT OR IGNORE INTO geogig_audited_tables (table_name, mapped_path, audit_table, commit_id) VALUES (\'%s\',\'%s\',\'%s\',\'%s\');',
      //   op.geogig_tree,
      //   op.geogig_tree,
      //   op.geogig_tree + '_audit',
      //   op.geogig_commit_id
      // );
      // create the fid table and populate it
      db.run('CREATE TABLE IF NOT EXISTS '+ op.geogig_tree + '_fids' + ' (gpkg_fid TEXT, geogig_fid TEXT)', [], cb);
      // console.log('CREATE TABLE IF NOT EXISTS %s (gpkg_fid TEXT, geogig_fid TEXT);', op.geogig_tree + '_fids');

      db.run('INSERT OR IGNORE INTO '+ op.geogig_tree + '_fids' +' (gpkg_fid, geogig_fid) VALUES (?,?)', op.properties.fid, op.geogig_feature_id, cb);
      // console.log('INSERT OR IGNORE INTO %s (gpkg_fid, geogig_fid) VALUES (\'%s\',\'%s\');', op.geogig_tree + '_fids', op.properties.fid, op.geogig_feature_id);

      // create the audit table
      var columns = _.keys(op.properties);
      var columnsSql = columns.map(prop => prop + ' TEXT,')
        .reduce((acc, col, idx, source) => acc + col, '')
        .slice(0, -1);
      // feature table
      db.run('CREATE TABLE IF NOT EXISTS '+ op.geogig_tree +' (' + columnsSql + ')');
      // audit table
      db.run('CREATE TABLE IF NOT EXISTS '+ op.geogig_tree + '_audit' +' (audit_op TEXT, audit_timestamp TEXT, ' + columnsSql + ')');
      // console.log('CREATE TABLE IF NOT EXISTS %s (audit_op TEXT, audit_timestamp TEXT, %s);',
      //   op.geogig_tree + '_audit',
      //   columnsSql);

      // insert a row in the audit able for each operation
      var opValues = columns.map(key => '\''+op.properties[key]+'\'' || 'null');
      db.run('INSERT OR IGNORE INTO '+ op.geogig_tree + '_audit' + ' (audit_op, audit_timestamp, '+ columns +') VALUES (?, ?,'+ opValues +')',  op.audit_op, op.audit_timestamp, cb);
      // console.log('INSERT OR IGNORE INTO %s (audit_op, audit_timestamp, %s) VALUES (\'%s\', \'%s\', %s);', op.geogig_tree + '_audit', columns, op.audit_op, op.audit_timestamp, opValues);

      // insert fake data into feture table
      var nullValues = columns.map(key => (key === 'fid') ? op.properties.fid : 'null');

      db.run('INSERT OR IGNORE INTO '+ op.geogig_tree + ' ('+ columns +') VALUES ('+ opValues +')');


    });

    db.run('END TRANSACTION');
    // console.log('END TRANSACTION;');
  });
  db.close();
};

router.post('/commit', (req, res) => {
  Rx.Observable.fromPromise(
    models.Operations.findAll({
      where: {
        geogig_commit_id: req.body.geogig_commit_id,
        geogig_repo_name: req.body.geogig_repo_name
      }
    })
  )
  .flatMap(Rx.Observable.fromArray)
  .map(filterStampsAndNulls)
  .toArray()
  .subscribe((ops) => {
    // createGpkg('/tmp/'+req.body.geogig_repo_name+'.gpkg', ops);
    createGpkg('/tmp/'+req.body.geogig_repo_name+'_'+uuid.v4()+'.gpkg', ops);
  });
  return res.json({success:true});
});



module.exports = router;
