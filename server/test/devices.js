/* global beforeEach, afterEach, describe, it */
'use strict';

var request = require('supertest');

function makeStr()
{
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

describe('Testing Devices. It',() => {
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
        xaccesstoken = res.body.result.token;
        done();
      });
  });

  afterEach(() => {
    server.close();
  });

  it('can get a list of devices',(done) => {
    request(server)
      .get('/api/devices')
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .expect(200,done);
  });

  let deviceId = makeStr();
  let deviceName = makeStr();

  it('can register a device',(done) => {
    request(server)
      .post('/api/devices/register')
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .field('name',deviceName)
      .field('identifier',deviceId)
      .expect(200,done);
  });

  it('can retrieve a device',(done) => {
    request(server)
      .get('/api/devices/'+deviceId)
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .expect(200,done);
  });
});
