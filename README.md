twitterSearchPush
=================
A Twitter search feed with Push to iOS devices

Problem Description
This is a basic functioning Twitter search feed that displays twitter search results for a user ( currently stockguy22feed ), and pushes notifications for a nested search results (currently tweets containing stockguy22: SELL or stockguy22: BUY) to a device.  It uses CSS, HTML, Javascript, Backbone, Underscore, JQuery, CasperJS, Jasmine, iOS/Xcode, Urban Airship Push service, Play Framework, Scala, scalatest, Heroku and the Twitter 1.1 API.  It is a derivate of the twittersearchfeed project.

When first opened in a browser or app, the web application displays the 20 most recent search results. When the search notification for push is matched, a push is sent to the device.  If the app is running, the app displays an alert and performs refresh.  If the app is not running, a message is added to the notification center.  The application provides a button for the user to manually refresh the stream without reloading the page. 

#Architecture and Design

##Visual design
The app starts with some explanative text and a search input, styled as a search input and with a search button.  Upon tapping the search button and having more than 0 results, the search input is hidden, results are displayed and a refresh icon is displayed.  If there are no results, a no results section is displayed and the search remains.  The search results are persisted to the device and are available if the user visits the app again.

There is explicitly no "fancy" UI, such as:
 * pull to refresh
 * spinner during search or refresh
 * change the time interval for auto-refresh
 * show new tweets such as a highlight or the twitter style (n new results, tap to show)
 * show time of last refresh
 * show offline/online state
 * pagination of long results
 * login so my personal oauth credentials are used.
 * warning the user if localStorage isn't available
 * bookmarking the app
 * reasonable styling, shading, corners...
 * a button to cancel the persisted search
 
## Application Architecture and design

The application is a mixture of HTML/Javascript on the web app and native client, and play framework using scala on the server.

The twitter best practices guide says "Include a since_id when asking for Tweets. since_id should be set to the value of the last Tweet you received or the max_id from the Search API response. If the since_id you provide is older than the index allows, it will be updated to the oldest since_id available." so the since_id or the max_id from the previous search is used

The Twitter app is at https://dev.twitter.com/apps/5062978/show, twitsearchfeed is the brilliant name

It is deployed on heroku at http://twittersearchpush.herokuapp.com/

Grunt automates the running of jsdoc, jshint, jasmine unit tests, casperjs functional tests, and deployment to git.  grunt test will run jshint and casperjs ftests.  TODO: fix grunt requirejs path bug that breaks jasmine.  

The play app on startup loads any persistent files and starts the twitter stream.  Upon receiving a request, the server queries twitter and writes out any new tweets.  The AppState object represents the current app state, currently just rate limiting information.  The Pusher object uses curl to push a message to all devices.  The bulk of the server logic is in TwitterReader.  It loads tweets from the file system, from the api, gets tweets that match the regular expressions, updates the file system with new tweets, registers and responds to the streaming api.  

There is a backbone model for a feed item and a feed, a collection of feed items.  There are views for a feed, a feed items collection and a feed item.  The feed item uses CSS Box and Flex layouts.

The FeedItemsCollection uses Backbone's built in URL handling with parsing.  backbone.localStorage is used to persist the Feed model and the feedItemsCollection.  There is conflict between the fetch for localStorage and the fetch for the twitter search.  There is a fetchRemote function to disambiguate.  There can be duplicate sync events issued after the local or remote stores have been fetched.  It would be good for backbone to have a way for the store provider to indicate which store was synced. 

The iOS app is a phonegap app that includes the Urban Airship phonegap plugin.  PhoneGap 3.0 CLI and the UA plugin don't work as the UA plugin puts it's files in the project's plugins dir but phonegap expects it in platforms/ios/twittersearchpush/Plugins.  The app just does a redirect to the heroku web app. 

The UI is performant on refresh as any new tweets are inserted at the top and the existing tweets are not rendered.  There is a maximum number of tweets that are stored to prevent out of memory errors and sluggishness.  Extra models are removed and the DOM nodes are removed.  I believe this means they really are removed and do not become zombies, but I'm not 100% positive.  The feeditems are fairly minimal in their markup.  Each element is required for a css selector, and no more.

The user is rate limited to a request at most once every 2 seconds.

The search and refresh icons are from Hootsuite's desktop app.  TODO: They should be a bit larger.

If localStorage is not available, the app still functions but without persistence. It wasn't worth making a custom modernizr build to just check for localStorage.  

# Testing

The files pass jshint, with 2 warnings excluded.  grunt jshint runs the jshint tests.

Casperjs tests can be run with casperjs test js/test/FTest.js or grunt casperjs or grunt ftest

jasmine tests can be run with SpecRunner.html, such as http://twittersearchfeed.herokuapp.com/SpecRunner.html(Todo:, and grunt jasmine or grunt unittest)

grunt test will run jshint, (todo:unittest), and ftest

The Feed model and the FeedItems Collections are coupled to the localStorage.  There's a bit more unit testing that could be done, such as checking for max lengths.  

It looks like the 2 ways of clearing localstorage: 1) casper.evaluate of removing localStorage (delete localStorage.feed and localStorage.removeItem('feed'), and 2) adding a reset button that clears it; don't work well with casper js.  There is a manual way to remove the localStorage: 
rm ~/Library/Application\ Support/Ofi\ Labs/PhantomJS/http_localhost_0.localstorage

I resorted to resetting the models in addition to removing localStorage when a custom reset method is called, typically via a hidden reset button.  After the models are reset, the UI resets to the search state as there are just empty models then.  This workaround enables the casper ftests to run to completion.

There could be more unit tests or ftests, such as images correctly displayed, exact correct formatting of the elements, etc.  It is important to only test the external behavior, not the internals.  This allows for refactoring and changes without needless test rewrites.  Also, the FTest.js file has some duplicate code because there are problems guaranteeing ordering of executing.

TODO: 

* BUG: why is text.js and the feeditem template not working?
* more tests
* BUG: grunt jasmine running.
* run all grunt tests
* remove properties from twitter4j into heroku vars.
* Mock for twitter
* Mock for push
* remove keys for curl push

* refresh icon bigger
* button to test push?
* on resume, do a refresh
* scala code should be more functional, too many side-effects
* persist data to S3 as heroku is ephemeral
* twitter login instead of my app
* new twitter app instead of re-using twittersearchfeed
* actually implement the search term and push term.  Currently hardcoded to stockguy22feed user and tweets containing stockguy22: SELL | stockguy22: BUY
* start stream per user.  How to know if the user doesn't want the stream any more?  No app uninstall event..
* add more tweets at the bottom
* comet/websocket stream new tweets.
* app into the app store
* Clean up FTest.js dup code
* Clean up automated github and heroku deployment

#Installation

##Grunt
* npm install -g grunt-cli
* npm install
* npm install grunt-shell
* npm install grunt-contrib-jasmine
* npm install requirejs
* npm install grunt-jsdoc
* npm install -g git://github.com/jsdoc3/jsdoc.git

## Valiant attempts

Mockito isn't supported in scalatest because of a library build problem :-(

Couldn't split casperjs tests into multiple files per https://gist.github.com/n1k0/3813361.  The waitFor doesn't wait in file like:
  var x = require('casper').selectXPath;
  casper.test.comment("Ftest");
  casper.start("http://localhost/~dave/twittersearchfeed/");
  casper.waitForSelector("form input#query",
    function success() {
       this.click("form input#query");
    },
    function fail() {
      test.assertExists("form input#query", "Twitter Search Feed down the middle tests: form input#query");
    });
  casper.echo("finished waiting");

Can't run multiple casperjs suites per file per https://groups.google.com/forum/#!topic/casperjs/VrtkdGQl3FA

Something has broken recently in grunt-contrib-jasmine and previously working tests and these tests don't run.  I tried both normal and --save-dev versions.  A common problem is The 0.5.1 version of jasmine-phantomjs has a rights problem so you may need to 
sudo chmod a+x node_modules/grunt-contrib-jasmine/node_modules/grunt-lib-phantomjs/node_modules/phantomjs/lib/phantom/bin/phantomjs
Even after that, the loading of the js/test/specs/spec.js in the generated _SpecRunner.html timesout.

## Other things
I spent too much time on the casperjs tests.  I found it a very fragile and unpolished product.  See the previous comments about inability to split tests into suites within a file and across files, needing to manually reset localStorage.  Many things just don't work.  I found the ordering of the tests to be fairly random.  I ended up wrapping a lot of calls in then() and this made the test code even more complicated.

Play framework Javascript processing is pretty painful.  I'm not sure that it's easier than straight jackson.  
