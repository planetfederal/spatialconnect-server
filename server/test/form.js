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
  beforeEach((done) => {
    server = require('./../server');
    request(server)
      .post('/api/authenticate')
      .send({email:'admin@something.com',password:'admin'})
      .set('Content-Type','application/json')
      .end((err,res) => {
        if (err) {
          console.log(err);
        }
        xaccesstoken = res.body.token;
        done();
      });
  });

  // it('can get a list of forms',(done) => {
  //   request(server)
  //     .get('/api/forms')
  //     .set('Content-Type','application/json')
  //     .set('x-access-token',xaccesstoken)
  //     .expect(200)
  //     .end((err,res) => {
  //       if (err) {
  //         return done(err);
  //       }
  //       res.body.map((v,idx) => {
  //         if (idx === res.body.length - 1) {
  //           done();
  //         }
  //       });
  //     });
  // });

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
    form_key:formname,
    form_label:formname,
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


  it('can get a create a form',(done) => {
    request(server)
      .post('/api/forms')
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .send(form).end(function(err) {
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

  afterEach(() => {
    server.close();
  });

});
