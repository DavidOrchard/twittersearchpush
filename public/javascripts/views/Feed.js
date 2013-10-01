/*Copyright (C) 2013 David Orchard

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/** 
 * FeedView view for the feed including collections
 * @module FeedView
 */
define(function(require) {
  
   var $ = require('jquery'),
      _ = require('underscore'),
      Backbone = require('backbone'),
      FeedModel = require('models/Feed'),
      FeedItemsCollectionView = require('views/FeedItemsCollection'),
      FeedItemsCollection = require('collections/FeedItemsCollection');
  
  /**
   * @constructor
   */    
  return Backbone.View.extend({
    events : {
       'click .refreshsubmit'           : 'refresh',
       'click .resetsubmit'             : 'reset',
     },

     el:  '.feedcontainer',  

  /** 
   * restores any previous search query state
   * @instance
   */
    initialize: function(){
      this.feedItemsCollection = new FeedItemsCollection();
   // The stored item has already been parsed and we can't double parse.
      this.feedItemsCollection.fetch({parse:false});
        
      console.log("An object of FeedView was created");
      this.model.on('reset', _.bind(this.render, this));

      new FeedItemsCollectionView({
        collection: this.feedItemsCollection,
      });
      this.feedItemsCollection.fetchRemote();
       
      this.render();
    },  

/** renders the feedview with a new collection
  *
  * @instance
  */
    render : function () {
    },
    
    /** refresh the collection
     */
    refresh: function () {
      this.feedItemsCollection.refresh();
     },
     
     /** reset the app including all models and collections */
     reset : function () {
       this.model.reset();
       this.feedItemsCollection.reset();
       localStorage.clear();
     }
   });
});
