// Copyright (C) 2013 David Orchard
// See the LICENCE.txt file distributed with this work for additional
// information regarding copyright ownership.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package twittersearchpush

import org.apache.commons.io.FileUtils
import java.io.File
import org.specs2._
import org.scalatest.GivenWhenThen
import org.scalatest.PrivateMethodTester
import org.scalatest.FunSpec
import org.scalatest.Assertions
import controllers._
import play.api.libs.json._
import twitter4j.json.DataObjectFactory

class TwitterReaderTest extends FunSpec with GivenWhenThen with PrivateMethodTester{
  
  describe("A TwitterReader list of tweets filtered to before the last tweet") {
    it("Should return a filtered list of tweets") {
      Given("A TwitterReader reading from 1 file with 2 tweets should have length == 2")
      var tweets = twittersearchpush.TwitterReaderTest.getAllTweets(382586849065459712L, 382688727895904256L)
      assert( tweets.value.length == 2 )
      Then("pruning to newer than the last should have length == 1" )
      tweets = twittersearchpush.TwitterReader.filterTweetsToNewerThan(tweets, "382586849065459712" )
      assert( tweets.value.length == 1 )
    }
  }
  
  describe("A TwitterReader") {
    it("Should return a long list of tweets") {
      Given("A TwitterReader reading from 1 file with 1 tweet should have length == 1")
      var tweets:JsArray = twittersearchpush.TwitterReaderTest.getAllTweets(382585164356136960L, 382585164356136960L)
      Then("it should have length == 1 "  )
      assert( tweets.value.length == 1 )
      Then("reading from 1 ile with 2 tweets should have length == 2" )
      tweets = twittersearchpush.TwitterReaderTest.getAllTweets(382586849065459712L, 382688727895904256L)
      assert( tweets.value.length == 2 )
      Then("reading from 2 files with 3 tweets should have length == 3" )
      tweets = twittersearchpush.TwitterReader.getTweetsSinceMax(382585164356136960L, 382688727895904256L, twittersearchpush.TwitterReaderTest.getAllTweets)
      assert( tweets.value.length == 3 )
    }
  }
  describe("A TwitterReader list of tweets trimmed") {
    it("Should return a trimmed list of tweets") {
      Given("A TwitterReader reading from 1 file with 2 tweets should have length == 2")
      var tweets = twittersearchpush.TwitterReaderTest.getAllTweets(382586849065459712L, 382688727895904256L)
      assert( tweets.value.length == 2 )
      Then("trimming should have length == 2" )
      var trimmedTweets = twittersearchpush.TwitterReader.trimTweets(tweets)
      assert( trimmedTweets.value.length == 2 )
      And("item(0) should have id field == 382688727895904256")
      assert((trimmedTweets(0) \ "id").toString == "382688727895904256")
      And("item(0) should have no favorited field")
      val favJsValue = (trimmedTweets(0) \ "favorited")
      assert(favJsValue.isInstanceOf[JsError] == true || favJsValue.isInstanceOf[JsUndefined])                  
      
      And("item(1) should have id field == 382586849065459712")
      assert((trimmedTweets(1) \ "id").toString == "382586849065459712")
    }
  }
  
  describe("A TwitterReader.trimUserTransform") {
    it("Should remove fields such as favorated and keep id, text") {
      Given("An untrimmed tweet")
      var tweets = twittersearchpush.TwitterReaderTest.getAllTweets(382688727895904256L, 380373504086269953L)
      var tweet = tweets(0)
      Then("it should have id")
      assert((tweet \ "id").toString == "382688727895904256")
      And("favorited is true or false")
      val fav = (tweet \ "favorited").toString
      assert(fav == "false" || fav == "true")      
      var trimmedTweet = TwitterReader.trimUserTransform(tweet)
      Then("a trimmed tweet should have id field == 382688727895904256")
      assert((trimmedTweet \ "id").toString == "382688727895904256")
      And("a trimmed tweet should have no favorited field")
      val favJsValue = trimmedTweet \ "favorited"
      assert(favJsValue.isInstanceOf[JsError] == true || favJsValue.isInstanceOf[JsUndefined])                  
    }
  }
  
  describe("A TwitterReader list of 200 tweets") {
    it("Should return a trimmed and pruned to 20 list of tweets") {
      Given("A TwitterReader reading from 1 file with 200 tweets should have length == 200")
      var tweets = twittersearchpush.TwitterReaderTest.getAllTweets(382688727895904256L, 380373504086269953L)
      assert( tweets.value.length == 200 )
      Then("getTrades should have length == 20" )
      var trimmedTweets = twittersearchpush.TwitterReader.getTradesFromTweets(tweets, "380373504086269953")
      assert( trimmedTweets.value.length == 20 )
      And("item(0) should have id field == 382688727895904256")
      assert((trimmedTweets(0) \ "id").toString == "382688727895904256")
      And("item(0) should have no favorited field")
      val favJsValue = trimmedTweets(0) \ "favorited"
      assert(favJsValue.isInstanceOf[JsError] == true || favJsValue.isInstanceOf[JsUndefined])                  
      And("item(1) should have id field == 382586849065459712")
      assert((trimmedTweets(1) \ "id").toString == "382586849065459712")
    }
  }    
  
}

object TwitterReaderTest {
  class fileDescriptor(val sinceId:Long, val maxId:Long, val filename:String) {}
  
  var dir = "/Users/dave/Sites/twittersearchpush/test/"
   
  var testFiles = Array(new fileDescriptor(382586849065459712L, 382688727895904256L,"Tweets2.json"),
		  				// One test case is read tweets2 + tweets3 so cover both ranges starting at tweets2
		  				new fileDescriptor(382585164356136960L, 382688727895904256L,"Tweets2.json"),
		  				new fileDescriptor(382585164356136960L, 382585164356136960L,"Tweets3.json"),
		  				new fileDescriptor(382585164356136960L, 382586849065459711L,"Tweets3.json"),
		  				new fileDescriptor(382688727895904256L, 380373504086269953L,"Tweets200.json")
  )

  
  def getAllTweets(sinceId: Long, maxId: Long): JsArray = {
    var desc = testFiles.filter( ((e: fileDescriptor) => (e.sinceId == sinceId && e.maxId == maxId)))
    if( desc.length > 0 )
      readFile(desc(0).filename)
    else
      null
  }
  
  def readFile(filename:String): JsArray = {
	val jsonString = FileUtils readFileToString (new File(dir + filename), "UTF-8")
	Json.parse(jsonString).as[JsArray]
  }
}

