'use strict';
import path from 'path';
import { jsdom } from 'jsdom'
import mock from 'mock-require';

mock('config', path.join(__dirname, '../config', process.env.NODE_ENV || 'development'));

global.document = jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView
global.navigator = global.window.navigator
