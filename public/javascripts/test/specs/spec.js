/*Copyright (C) 2013 David Orchard

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

require.config( {
  baseUrl: ".",
  paths: {
    jquery: 'lib/jquery',
    underscore: 'lib/underscore',
    backbone: 'lib/backbone',
    backboneLocalStorage: 'lib/backbone.localStorage',
    newsfeedstatic: 'test/newsfeedstatic',
    common: 'common',

    // Plugins

    jasminejquery: 'lib/plugins/jasmine-jquery',
    text: 'text'
  },
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
    },
    // Jasmine-jQuery plugin
    "jasminejquery": {
        deps:['jquery'],
        exports:'jquery'
     },

     newsfeedstatic:{
       exports:'testData15'
     }
    }
});

// Can this be done in Common JS style?  I tried once and it seemed to break phantomjs
define(['jquery',
"backbone",
"views/Feed",
"views/FeedItem",
"views/FeedItemsCollection",
"models/FeedItem",
"models/Feed",
'collections/FeedItemsCollection',
"routers/mobileRouter",
'newsfeedstatic',
'common',
"jasminejquery"],
function($,
  Backbone,
  FeedView,
  FeedItemView,
  FeedItemsCollectionView,
  FeedItemModel,
  FeedModel,
  FeedItemsCollection,
  MobileRouter,
  testData15,
  common )
  {
  var testData1 =  [ {"id_str" : "377465033191485441",
                                 "created_at" : "Tue Sep 10 16:14:11 +0000 2013",
                                 "user" : {
                                     "screen_name" : "NBAZena",
                                     "profile_image_url" : "http:\/\/a0.twimg.com\/profile_images\/470119903\/NBA_Genova_logoSociet__normal.jpg"
                                   },
                                   "text" : "text1"
                                   }
                              ];

  var testData0 = [];
  var testDataError0 = {"errors":[{"message":"Rate limit exceeded","code":88}]};

        // Test suite that includes all of the Jasmine unit tests
        describe("Twitter Search", function() {

            // Twitter Search View Suite: contains all tests related to views
            describe("Twitter Search views", function() {

              // Runs before every View spec
              beforeEach(function() {
                jasmine.getFixtures().fixturesPath = "../";
                loadFixtures('TestHTMLFixture.html');
                this.feedModel = new FeedModel();
              });

              describe("FeedItemsCollectionView", function() {
                beforeEach(function() {
                  this.common = common;
                  this.common.maxFeedItemsCollectionSize = 15;
                  var ajaxMock = spyOn($, 'ajax').andCallFake(function (options) {
                          options.success(testData15);
                      });  
                  
                  this.feedItemsCollection = new FeedItemsCollection();
                  this.feedItemsCollection.fetchRemote();
                  this.feedItemsCollectionView = new FeedItemsCollectionView({
                    collection: this.feedItemsCollection,
                  });

                });

                it('render() returns the view object', function() {
                  expect(this.feedItemsCollectionView.render()).toEqual(this.feedItemsCollectionView);
                });

                it('should have a tagname of "section"', function(){
                  expect(this.feedItemsCollectionView.el.tagName.toLowerCase()).toBe('section');
                });

                it("should contain the correct number of views", function() {
                  expect(this.feedItemsCollectionView.$el.children().length).toEqual(15);
                });

                it("should contain the correct number of views after 1 added", function() {
                  $.ajax.andCallFake(function (options) { options.success(testData1);});  
                  this.feedItemsCollection.refresh();
                  expect(this.feedItemsCollectionView.$el.children().length).toEqual(15);
                });
              });

              describe("FeedView", function() {
                 var refreshButton = ".refreshsubmit";
                 var resetButton = ".resetsubmit";
                  var feedItemsCollection = ".feeditemscollectioncontainer";
                 
                 beforeEach( function (){
                   var ajaxMock = spyOn($, 'ajax').andCallFake(function (options) {
                           options.success(testData15);
                       });  
                   
                   this.feedView = new FeedView({model: new FeedModel()});
                   spyOn(this.feedView, 'refresh');
                   spyOn(this.feedView, 'reset');
                   spyOnEvent(refreshButton, 'click');
                   spyOnEvent(resetButton, 'click');
                   this.feedView.delegateEvents();
                   this.feedView.$el.find(resetButton).click();
                   delete localStorage.feed;
                 });
                 

                it('refreshButton click should generate click event', function() {
                   $(refreshButton).click();
                  expect('click').toHaveBeenTriggeredOn($(refreshButton));
                });
                 it('resetButton click should generate click event', function() {
                  $(resetButton).click();
                  expect('click').toHaveBeenTriggeredOn($(resetButton));
                });
 
 
                it('refreshbutton click should call refresh function', function() {
                  this.feedView.$el.find(refreshButton).click();
                  expect(this.feedView.refresh).toHaveBeenCalled();
                });
                it('resetbutton click should call reset function', function() {
                  this.feedView.$el.find(resetButton).click();
                  expect(this.feedView.reset).toHaveBeenCalled();
                 });

              });
               

            }); // End of the View test suite


        // Twitter Search Collection Suite: contains all tests related to collections
        describe("Twitter Search collections", function() {

          describe("FeedItemsCollection", function() {
          // Runs before every Collection spec
          beforeEach(function() {
            // Instantiates a new Collection instance
            var ajaxMock = spyOn($, 'ajax').andCallFake(function (options) {
                   options.success(testData15);
             });  
            this.collection = new FeedItemsCollection();
           });

          it("should contain the correct number of models", function() {
            this.collection.fetchRemote();
            expect(this.collection.length).toEqual(15);
          });

          it("should contain the correct number of models after 1 added", function() {
            this.common = common;
            this.common.maxFeedItemsCollectionSize = 15;
            this.collection.fetchRemote();
            $.ajax.andCallFake(function (options) { options.success(testData1);});  
            this.collection.refresh();
            expect(this.collection.length).toEqual(15);
          });

          it("should fire successfulSearch event after update with no items previously", function () {
            var spy = jasmine.createSpy('');
            this.collection.bind('successfulSearch', spy);
            $.ajax.andCallFake(function (options) { options.success(testData1);});  
            this.collection.refresh();
            expect(spy).toHaveBeenCalled();
          });
          
          it("should generate a URL request with the newest id_str", function () {
             this.collection.fetchRemote();
             var spy = jasmine.createSpy('');
             this.collection.bind('successfulSearch', spy);
             $.ajax.andCallFake(function (options) { options.success(testData1);});  
             this.collection.refresh();
             expect($.ajax.mostRecentCall.args[0].url).toContain("newest_id=377413976306778100");
           });

          it("should fire unsuccessfulSearch event after empty update with no items previously", function () {
            var spy = jasmine.createSpy('');
            this.collection.bind('unsuccessfulSearch', spy);
            $.ajax.andCallFake(function (options) { options.success(testData0);});  
            this.collection.refresh();
            expect(spy).toHaveBeenCalled();
          });

          it("should fire unsuccessfulSearch event after error with no items previously", function () {
            var spy = jasmine.createSpy('');
            this.collection.bind('unsuccessfulSearch', spy);
            $.ajax.andCallFake(function (options) { options.success(testDataError0);});  
            this.collection.refresh();
            expect(spy).toHaveBeenCalled();
          });
 
          it("should fire unsuccessfulSearch event after error with items previously", function () {
            this.collection.fetchRemote();
            var spy = jasmine.createSpy('');
            this.collection.bind('unsuccessfulSearch', spy);
            $.ajax.andCallFake(function (options) { options.success(testDataError0);});  
            this.collection.refresh();
            expect(spy).toHaveBeenCalled();
          });
          
          it("should have no items after reset called", function () {
            this.collection.reset();
            expect(this.collection.length).toEqual(0);
          });
        });

        }); // End of the Collection test suite


        // Twitter Search Mobile Router Suite: contains all tests related to Mobile routers
        describe("Twitter Search mobile routers", function () {

            // Runs before every Mobile Router spec
            beforeEach(function () {

                // Stops the router from listening to hashchange events (Required because Backbone will only allow you to run Backbone.history.start() once for each page load.)
                Backbone.history.stop();

                // Instantiates a new Router instance
                this.router = new MobileRouter();
                
                Backbone.history.start();

                // Creates a Jasmine spy
                this.routeSpy = jasmine.createSpy("home");

                // When the route index method is called, the Jasmine spy is also called
                this.router.on("route:home", this.routeSpy);

            });

            it("should call the mobile router home method when there is a #home on the url", function() {

                 // Navigates to home
                 this.router.navigate("#home");

                 // Navigates to the default route
                 this.router.navigate("", { trigger: true });

                 // Expects the Jasmine spy to have been called
                 expect(this.routeSpy).toHaveBeenCalled();

             });


            it("should call the mobile router home method when there is no hash on the url", function() {

                // Navigates to a different route
                this.router.navigate("elsewhere");

                // Navigates to the default route
                this.router.navigate("", { trigger: true });

                // Expects the Jasmine spy to have been called
                expect(this.routeSpy).toHaveBeenCalled();

            });

        }); // End of the Mobile Router test suite

    }); // End of the Twitter Search test suite

});