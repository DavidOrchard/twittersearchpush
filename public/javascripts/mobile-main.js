/*Copyright (C) 2013 David Orchard

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/** main entry point into the application */

require.config({
  baseUrl: "javascripts",
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    backboneLocalStorage: {
      deps: ['backbone'],
      exports: 'Store'
    }
  },
  paths: {
    jquery: 'lib/jquery',
    underscore: 'lib/underscore', 
    backbone: 'lib/backbone',
    backboneLocalStorage: 'lib/backbone.localStorage',
    cordova: 'lib/cordova',
    PushNotification: 'lib/PushNotification',
    pushHandler: 'pushHandler',
    text: 'text',
    common: 'common'
  }
});

define([
  'jquery',
  'underscore',
  'backbone',
  'models/Feed',
  'routers/mobileRouter',
  'views/Feed',
  'pushHandler'
], function( $, _, Backbone, FeedModel, MobileRouter, FeedView, pushHandler) {

  new MobileRouter();
  // Tell Backbone to start watching for hashchange events
  Backbone.history.start();

  new FeedView({model:new FeedModel()});  
});