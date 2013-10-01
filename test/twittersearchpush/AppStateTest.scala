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
import org.scalatest.GivenWhenThen
import org.scalatest.PrivateMethodTester
import org.scalatest.FunSpec
import controllers._
import play.api.libs.json._
import twitter4j.json.DataObjectFactory

class AppStateTest extends FunSpec with GivenWhenThen with PrivateMethodTester {
   
  describe("An appstate") {
    it("should be insantiable") {
      Given("An instance")
      var appState = AppState
      appState.dir = "/Users/dave/Sites/twittersearchpush/test/"
      Then("it should not be null")
      assert(appState != null)
      Then("writing it should create a file")
      FileUtils.deleteQuietly(new File(AppState.fileName))
      val file = new File(appState.fileName)
      appState.write
      assert(file.exists == true)
      Then("updating it should update it and write the file")
      FileUtils.deleteQuietly(new File(AppState.fileName))
      assert(file.exists != true)
      appState.update(5,5,5)
      appState.timestamp = 3
      assert(file.exists == true)      
      Then("reading it should update a property")
      appState.read
      assert(appState.remaining == 5)      
    }    
  }
  
  describe("A non-existant AppState file") {
    it("should be readable") {
      Given("An instance with no file")
      AppState.timestamp = 1000
      FileUtils.deleteQuietly(new File(AppState.fileName))
      Then("reading it should non generate an error or exception and it should be unchanged" )
      AppState.read
      assert(AppState.timestamp == 1000)
    }
  }
}

