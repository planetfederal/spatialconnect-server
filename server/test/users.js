/* global beforeEach, afterEach, describe, it */
'use strict';
var request = require('supertest');

function makeStr()
{
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for( var i=0; i < 5; i++ ) {
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
        xaccesstoken = res.body.result.token;
        done();
      });
  });
  afterEach(() => {
    server.close();
  });

  it('can get a list of users',(done) => {
    request(server)
      .get('/api/users')
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .expect(200)
      .end((err,res) => {
        if (err) {
          return done(err);
        }
        res.body.result.map((v,idx) => {
          if (v.password !== undefined) {
            done(new Error('Password is being returned'));
          }

          if (idx === res.body.result.length - 1) {
            done();
          }
        });
      });
  });

  const email = makeStr() + '@' + makeStr() + '.com';
  const password = makeStr() + makeStr();
  const name = makeStr();
  it('can create a user',(done) => {
    request(server)
      .post('/api/users')
      .send({name:name,email:email,password:password})
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .expect(200,done);
  });

  it('check for new user',(done) => {
    request(server)
      .get('/api/users')
      .set('Content-Type','application/json')
      .set('x-access-token',xaccesstoken)
      .expect(200)
      .end((err,res) => {
        if (err) {
          return done(err);
        }
        res.body.result.map((v,idx) => {
          if (v.email === email && v.name === name) {
            done();
            return;
          }

          if (idx === res.body.result.length - 1) {
            done(new Error('Did not find the newly created user'));
          }
        });
      });
  });
});
