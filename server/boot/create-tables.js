module.exports = function(app) {

  var db = app.dataSources.db;
  var lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role'];
  db.automigrate(lbTables, function(er) {
    if (er) throw er;
    console.log('Loopback tables [' + lbTables + '] created in ', db.adapter.name);
  });

  var pg = app.dataSources.postgres;
  var scTables = ['DataStore', 'Event'];
  pg.autoupdate(scTables, function(er) {
    if (er) throw er;
    console.log('SpatialConnect tables [' + scTables + '] created in ', pg.adapter.name);
  });
};
