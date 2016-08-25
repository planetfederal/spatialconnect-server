/* global beforeEach, afterEach, describe, it */
'use strict';

var client;
var Commands = require('./../../schema/actions.json');
var expect = require('expect.js');

function makeStr(len)
{
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for( var i=0; i < len; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

describe('Testing MQTT. It',() => {
  let server;

  before(() => {
    server = require('./../server');
    client = require('./../client')('localhost',1883,'tester');
  });

  after(() => {
    server.close();
  });

  it('can ping pong',done => {
    client.listenOnTopic('/anaconda').subscribe(
      m => {
        expect(m.payload).to.be('pong');
        done();
      },err => console.log(err)
    );
    client.publishObj('/ping',{replyTo:'/anaconda'});
  });

  it('can get config',done => {
    const str = makeStr(6);
    client.listenOnTopic(str).subscribe(
      c => {
        expect(c).to.be.ok(1);
        expect(c.payload).to.be.an('string');
        var cg = JSON.parse(c.payload);
        expect(cg).to.be.ok();
        expect(cg.stores).to.be.an('array');
        expect(cg.forms).to.be.an('array');
        done();
      }
    );
    client.publishObj('/config',{replyTo:str,action:Commands.CONFIG_FULL});
  });

  it('can create a notification',done => {
    client.listenOnTopic('/notify').subscribe(
      n => {
        var nt = JSON.parse(n.payload);
        expect(nt.to).to.be('all');
        expect(nt.notification.title).to.be('Geofence');
        done();
      }
    );

    client.publishObj('/store/tracking',{payload:JSON.stringify({
      type : 'Feature',
      id : 'foo',
      metadata : {
        client : '0c20b743-5485-4109-823c-c9c4f54038c4'
      },
      geometry : {
        type : 'Point',
        coordinates : [-122.03909397125244,
          37.335360847277165]
      }
    })});
  });
});
