/* global beforeEach, afterEach, describe, it */
'use strict';
var request = require('supertest');

function makeStr(len)
{
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for( var i=0; i < len; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

describe('Testing Users. It',() => {
  let server;
  let xaccesstoken;
  beforeEach(done => {
    server = require('./../server');
    request(server)
      .post('/api/authenticate')
      .send({email:'admin@something.com',password:'admin'})
      .set('Content-Type','application/json')
      .end((err,res) => {
        if (err) {
          console.log(err);
        }
        xaccesstoken = res.body.result.token;
        done();
      });
  });

  let formname = makeStr(10);
  let form = {
    form_key:formname,
    form_label:formname,
    version : 1,
    fields : [
      {
        type : 'number',
        field_label : 'num1',
        field_key : 'num2',
        position : 0,
        is_integer : false
      },{
        type : 'string',
        field_label : 'str1',
        field_key : 'str2',
        position : 1
      },{
        type : 'slider',
        field_label : 'sld1',
        field_key : 'sld2',
        position : 2,
        initial_value : 1,
        minimum : 0,
        maximum : 100
      }
    ]
  };

  let newForm = {
    form_key: formname,
    form_label: formname,
    version : 4,
    fields : []
  };

  let formupdate = {
    form_key:formname,
    form_label:formname,
    version : 2,
    fields : [
      {
        type : 'number',
        field_label : 'num1',
        field_key : 'num2',
        position : 0,
        is_integer : false
      },{
        type : 'string',
        field_label : 'foo',
        field_key : 'foo',
        position : 1
      },{
        type : 'slider',
        field_label : 'bar',
        field_key : 'bar',
        position : 2,
        initial_value : 1,
        minimum : 0,
        maximum : 100
      }
    ]
  };

  let formsubmission = {
    id: '1',
    geometry: {
      type: 'Point',
      coordinates: [ -122.40777475, 37.73868713, 0 ]
    },
    bbox: [ 0, 0, 0, 0 ],
    properties: { team: 'A', why: 'A' },
    crs: { type: 'name', properties: { name: 'EPSG:4326' } },
    metadata: {
      created_at: '2016-08-22 14:08:49 EDT',
      client: 'D25DA92D-F53D-460A-A4B6-8B57EC59C46C',
      layerId: 'baseball_team'
    },
    type: 'Feature'
  };

  it('can get a create a form',(done) => {
    request(server)
      .post('/api/forms')
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .send(form)
      .end(function(err) {
        if (err) done(err);
        done();
      });
  });

  it('can get a list of forms',(done) => {
    request(server)
      .get('/api/forms')
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .expect(200)
      .end(function(err) {
        if (err) done(err);
        done();
      });
  });

  it('can get a single form',(done) => {
    request(server)
      .get('/api/forms/' + formname)
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .expect(200, done);
  });

  it('can get form results',(done) => {
    request(server)
      .get('/api/forms/1/results')
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .expect(200,done);
  });

  it('can submit a form',(done) => {
    request(server)
    .post('/api/forms/2/submit')
    .set('Content-Type','application/json')
    .set('x-access-token',xaccesstoken)
    .send(formsubmission)
    .end(function(err) {
      if (err) done(err);
      done();
    });
  });

  it('can get a create a form with no fields',(done) => {
    request(server)
      .post('/api/forms')
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .send(newForm).end(function(err) {
        if (err) done(err);
        done();
      });
  });

  it('can update a form',(done) => {
    request(server)
      .post('/api/forms')
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .send(formupdate).end(function(err) {
        if (err) done(err);
        done();
      });
  });

  it('can delete a form',(done) => {
    request(server)
      .delete('/api/forms/' + formname)
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .send(form)
      .end(function(err) {
        if (err) done(err);
        done();
      });
  });

  afterEach(() => {
    server.close();
  });

});
