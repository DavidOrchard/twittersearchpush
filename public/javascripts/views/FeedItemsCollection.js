/*Copyright (C) 2013 David Orchard

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/** @module FeedItemsCollectionView */
define(function(require){
  'use strict';
  var $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    FeedItemView = require('views/FeedItem');
 
  var FeedItemsCollectionView = Backbone.View.extend({
    el: '.feeditemscollection',
    
    /** subscribe to model add events using the added method */
    initialize: function(){
      this.collection.on('add', _.bind(this.added, this));
      this.collection.on('remove', _.bind(this.remove, this));
      this.collection.on('reset', _.bind(this.render, this));
      this.render();
    },
  
    /** subscriber for removed items
     * @param {object} item the item removed
     *
     * There shouldn't be a chance that the last item in the collection is not the last item in the view
     */
   remove: function(item) {
     this.$el.children().last().remove();
     
   },
    /** subscriber for added items.  Prepend the item to collection 
     * @param {object} item the item to be added
     */
    added: function(item) {
      var feedItemView = new FeedItemView({ model: item });
      this.$el.prepend(feedItemView.render().el);
    },
    
    /** render the collection by clearing the markup then rendering each item the model */
    render: function() {
      this.$el.html("");
      _.each(this.collection.models, function (item) {
           var feedItemView = new FeedItemView({ model: item });
           this.$el.prepend(feedItemView.render().el);
       }, this);

        return this;
    }

  });

  return FeedItemsCollectionView;
});
