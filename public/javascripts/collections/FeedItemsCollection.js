/*Copyright (C) 2013 David Orchard

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/** @module FeedItemsCollection */
define([
  'underscore',
  'backbone',
  'backboneLocalStorage',
  'models/FeedItem',
  'common'
  ], function(_, Backbone, Store, FeedItemModel, common){
    'use strict';
    var FeedItemsCollection = Backbone.Collection.extend({
      model: FeedItemModel,
      localStorage: new Store("feeditemscollection"),

      initialize: function(){
        this.bind('sync', function(model, collection, options) {
          this.setAutoRefresh();
        });
        this.bind('add', function(model, collection, options) {
          if( model.isNew()) {
            model.save();
          }
        });
        this.bind('remove', function(model, collection, options) {
          model.destroy();
        });
      },

      comparator : "id_str",

      /** clear the localStorage and reset the model */
      reset: function() {
        try {
          Backbone.Collection.prototype.reset.call(this);
          this.clearAutoRefresh();
        } catch (e) {        
        }
      },

      /** filter the feed items
      * Filters the json data to store the flattened:
      * id_str
      * user.profile_image_url
      * user.screen_name
      * text
      * created_at
      *
      * Note, there is a conflict between twitter ids and backbone ids.  If a model has an id, then isNew() reports false so it wouldn't be saved.  
      * Naming is hard....
      */
      filter: function(feedItem) {
        return {
          id                  : feedItem.id,
          id_str              : feedItem.id_str,
          user                : {
            profile_image_url   : "http:\/\/a0.twimg.com\/profile_images\/1267937438\/privateFeed2_normal.jpg", 
            screen_name         : "stockguy22feed"},
          text                : feedItem.text,
          created_at          : feedItem.created_at
        };
      },

      /** set the auto refresh, usually only on successful query */
      setAutoRefresh: function() {
/*        var that = this;
        if(! this.intervalId) {
          this.intervalId = window.setInterval(function () {
            that.refresh();
            }, common.autoRefreshInterval);
          }
*/      },

      /** clear the auto refresh, probably only happen on reset */
      clearAutoRefresh: function() {
        window.clearInterval(this.intervalId);
      },

      /** format the URL for search requests
       */
      url: function() {
      var proxyURL = document.location.href.indexOf("http") === 0 ? "/proxy" : "http://twittersearchpush.herokuapp.com/proxy";
      return proxyURL + ("?oldest_id=" + ( this.length > 0 ? this.at(this.length - 1 ).id : "") + "&newest_id=" + ( this.length > 0 ? this.at(0).id : ""));
      },

      /** returns a filtered response with space for the incoming items.  Generates successfulSearch or unsuccessfulSearch depending upon response value
      *
      * @param {String} response server response
      */
      parse: function( response ) {
        if( this.localStorage === undefined && this.localStorageTemp !== undefined) {
          this.localStorage = this.localStorageTemp;
          delete this.localStorageTemp;
        }
        if( response !== undefined  && response.length !== undefined ) {
          if( this.length === 0 ) {
            if( response.length > 0 ) {
              this.trigger('successfulSearch');
              this.setAutoRefresh();
            } else {
              this.trigger('unsuccessfulSearch', {message:"no data"});
            }
          }
          // Preserve the maxFeedItemsCollectionSize
          // In cases of small values, this ui may flash as items are removed from the bottom and then items added at the top
          // Alternatively, on the add event from the sync, remove items to preserve
          while(this.length + response.length > common.maxFeedItemsCollectionSize ) {
            this.pop();
          }
          var that = this;
          var newArray = [];
          response.forEach(function(element, index ) { newArray.unshift(that.filter(element));});
          return newArray;

        } else if( response !== undefined && response.errors !== undefined && response.errors[0] !== undefined && response.errors[0].message !== undefined) {
          this.trigger('unsuccessfulSearch', {message:response.errors[0].message});
        } else {
          this.trigger('unsuccessfulSearch', {message:"unknown error"});         
        }
        return [];
      },
      
      /**  Fetch the model from the server. If the server's representation of the
       * model differs from its current attributes, they will be overridden,
       * triggering a `"change"` event.
       *
       * Removes localStorage from the collection for the next synch call, then adds it back
       * By the time the callbacks from the fetch are executed, the localStorage will be back in
       * so any new data will be persisted to localStorage.  Updating this.localStorage in the 
       * complete callback is too late as that happens after all the models are added and localStorage 
       * has to be ready.
       *
       * There are at least 3 alternatives:
       * 1) the previous solution was to copy the backbone fetch function in it's entirety, modifying the sync call
       * 2) add something like "remote:true" to the options, and used by backbone localstorage to do the correct
       * sync call
       * 3) add a beforeParse
       *
       * @param {Object} options
       * 
       */
      fetchRemote: function(options) {
        this.localStorageTemp = this.localStorage;
        delete this.localStorage;
        delete this.__proto__.localStorage;
        return this.fetch(options);
      },

      /** refresh the list of feedItems from the server, not removing items that are local but not in server response */
      refresh : function () {
        this.fetchRemote({remove: false});
      }

    });

    return FeedItemsCollection;
  });