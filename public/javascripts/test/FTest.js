var x = require('casper').selectXPath;
var casper = require('casper').create();

var refreshSubmitSelector = "span[class='refreshsubmit'][title='Refresh Search'][label='Refresh Search']";
var resetSubmitSelector = "span[class='resetsubmit']";
var localhost = 'http://localhost:9000/';
var heroku = 'http://twittersearchpush.herokuapp.com/';
// Can switch to ftest against running heroku instance
//var twitterSearchSite = localhost;
var twitterSearchSite = localhost;
var autorefreshinterval = 30000;
var maxItems = 50;

var removeLocalStorageDirectAccess = function(testName) { 
    casper.evaluate(function() {
      delete localStorage.feed;
      });
    };

var removeLocalStorageClickReset = function (testName, successCallback) { 
  casper.waitForSelector(resetSubmitSelector, 
    function success() { 
      casper.click(resetSubmitSelector);
      if(successCallback) {
        successCallback();
      }
    }, 
    function fail() {
      casper.capture(testName + 'neverSeeReset.png');
      casper.assertExists(resetSubmitSelector, (testName !== undefined ? testName : "No testName provided") + " looking for resetSubmit");
     });
};

var removeLocalStorage = removeLocalStorageClickReset;

var feedItemLength = function() {return $(".feeditem").length;};
var feedItemLengthGreaterThan = function(val){ return casper.evaluate(feedItemLength) > val;};
var queryValueFtn = function() {return $("input").val();};
var NoTweetResultsText = "No Tweet results for";
//var testsToRun = [1];
var testsToRun = Array(1,2);

casper.test.begin("Twitter Search Feed tests", {
  setUp: function(test) {    
  },
  
  test: function(test) {
    /** down the middle test, search term, refresh */
    casper.start(twitterSearchSite);
    removeLocalStorage("test initializer");
    var that = this;
    if( testsToRun.indexOf(1) != -1 ){
      var testText = "Twitter Search Feed Test #1: down the middle test";
      var fileName = testText.replace(/\s+/g, '');
      casper.then( function() {
        casper.waitForSelector('.feeditem', function success() {
          test.assertExists('.feeditem', testText + " has " + '.feeditem');
          casper.then( function() {
            that.waitForRefreshAndClick(test, testText);
            casper.then( function() {
              test.assertExists(refreshSubmitSelector, testText + " last check");
            });
          });
        }, function fail() {
          casper.capture(fileName + 'NoFeedItemSoFail.png');
          test.assertExists('.feeditem', testText + " has " + '.feeditem');
        });
      });
    }

    /** down the middle test, reload, */
      if( testsToRun.indexOf(2) != -1 ){
        casper.thenOpen(twitterSearchSite);
        casper.then( function() {
          var testText2 = "Twitter Search Feed Test #2: down the middle test after reload";
          that.waitForRefreshAndClick(casper.test, testText2);
          test.assertExists(refreshSubmitSelector, testText2);
        });
      }
   
   
  casper.run(function() {casper.test.renderResults(true); test.done();});
  },

  /** utility function to enter a term and click */
  enterTermAndClick: function(test, term, testName) {
    casper.waitUntilVisible(formInputSelector,
    function success() {
      casper.click(formInputSelector);
    },
    function fail() {
      casper.capture(testName.replace(/\s+/g, '') + 'NoFormInputSoFail.png');
      test.assertExists(formInputSelector, testName + " missing form Input " + formInputSelector);
    });
    casper.waitUntilVisible(inputSelector,
    function success() {
      this.sendKeys(inputSelector, "test");
    },
    function fail() {
      test.assertExists(inputSelector, testName + " missing Input " + inputSelector);
    });
    
    casper.waitUntilVisible(searchSubmitSelector,
    function success() {
      casper.click(searchSubmitSelector);
    },
    function fail() {
      test.assertExists(searchSubmitSelector, testName + " missing searchSubmit  " + searchSubmitSelector);
    });
  
  },

  waitForRefreshAndClick: function (test, testName) {
    casper.waitUntilVisible(refreshSubmitSelector,
    function success() {
      casper.click(refreshSubmitSelector);
    },
    function fail() {
      casper.capture(testName.replace(/\s+/g, '') + 'NoRefreshSubmitSelectorFail.png');
      test.assertExists(refreshSubmitSelector, testName + " missing "+ refreshSubmitSelector);
    });
  
  }
});

