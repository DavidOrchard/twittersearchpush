/*Copyright (C) 2013 David Orchard

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/** @module pushHandler */
define([
       'jquery',
       'underscore',
       'backbone',
       'cordova',
       'PushNotification'
       ], function($, _, Backbone, cordova, PushNotification){
         'use strict';
    var onDeviceReady = function() {
      console.log("onDeviceReady called");
       
      var push = window.plugins.pushNotification;
      // Incoming message callback
      var handleIncomingPush = function(incoming) {
        if(incoming.message) {
          alert("Incoming push: " + incoming.message);
          $(".refreshsubmit").click();
        } else {
          console.log("No incoming message");
        }
      };

      // Registration callback
      var onRegistration = function(error, pushID)  {
          alert("onRegistration");
        if (!error) {
          console.log("Reg Success: " + pushID);
          $('#id').text(pushID);
        } else {
          console.log(error);
        }
      };

      // push event callback
      var onPush = function(data) {
        alert("Received push: " + data.message);
        $(".refreshsubmit").click();
      };
      
      push.enablePush();
      // Register for any registration events
      push.registerEvent('registration', onRegistration);

      push.registerEvent('push', onPush);

      // Reset Badge on resume and check for any incoming pushes
      document.addEventListener("resume", function() {
        push.resetBadge();
        push.getIncoming(handleIncomingPush);
      });
      
      // Get any incoming push from device ready open
      push.getIncoming(handleIncomingPush);
    };

   document.body.onload = function onLoad() {
     console.log("onLoad called");
     document.addEventListener("deviceready", onDeviceReady, false);
   };
});