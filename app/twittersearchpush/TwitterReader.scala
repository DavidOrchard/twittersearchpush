package twittersearchpush

import twitter4j._
import org.apache.commons.io.FileUtils
import java.io.File
import play.api._
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import twitter4j.json.DataObjectFactory
import com.urbanairship.api.client._
import sys.process._

/** Singleton that reads from twitter
 *  
 *  @constructor
 */
object TwitterReader {
  var dir = "./files/"
  var allTweets = new JsArray()
  var filteredAndPrunedTweets = new JsArray()
  var streamedTweets = new JsArray()
  AppState.dir = dir
  AppState.read

  /** load all Tweets from persisted store and update filtered tweets */
  def loadTweets {
    allTweets = getAndUpdatePersistedTweets(dir + "twittersearchpushTweetsFull.json")
    Logger.info("loaded " + allTweets.value.length + " tweets from file")
    val filteredTweets = filterTweets(allTweets)
    val filteredAndTrimmedTweets = trimTweets(filteredTweets)
    FileUtils.writeStringToFile(new File(dir + "twittersearchpushTweetsFilteredAndTrimmed.json"), Json.prettyPrint(filteredAndTrimmedTweets))
  }

  /** getTrades from oldestId to newerThanId from allTweets
   *  
   *  @param newerThanId String id to search newer than 
   *  
   */
  def getTrades(newerThanId: String): JsArray = {
    getTradesFromTweets(allTweets, newerThanId)
  }

  /** filter a jsArray to within a range, trimmed to only fields we care about, and max 20 length */
  def getTradesFromTweets(tweets: JsArray, newerThanId: String): JsArray = {
    Logger.info("getTradesFromTweets")
    var filteredTweets = if (newerThanId != "") filterTweetsToNewerThan(tweets, newerThanId) else tweets
    var prunedTweets = trimTweets(filteredTweets)
    if (prunedTweets.value.length > 20) {
      prunedTweets = JsArray(prunedTweets.value.slice(0, 20))
    }
    prunedTweets
  }

  /** get all tweets starting from a file then calling twitter API if last request > 2 s ago
   *
   */
  def getAndUpdatePersistedTweets(fileName: String) = {
    play.api.Logger.info("getAllTweets")
    val jsonString = FileUtils readFileToString (new File(fileName), "UTF-8")
    var json = Json.parse(jsonString).as[JsArray]
    if (java.util.Calendar.getInstance.getTime.getTime - AppState.timestamp > 2000) {
      var json2 = getTweetsSinceMax(getFirstId(json), -1, this.getTimelineTweetsSinceMax _)
      json = json2 ++ json
      FileUtils.writeStringToFile(new File(fileName), Json.prettyPrint(json))
    }
    json
  }

  /** Get tweets between a since and a max id
  * 
  * @param sinceId Long
  * @param maxId Long -1 indicates no max Id
  * @param tweetGetter Unit function to call to get tweets
  * 
  * Rate limiting is done outside
  */
  def getTweetsSinceMax(sinceId: Long, maxId: Long, tweetGetter: (Long, Long) => JsArray): JsArray = {
    var loop = true
    var json: JsArray = new JsArray
    var maxIdVar = maxId

    while (loop == true) {
      loop = false
      if (sinceId <= maxIdVar || maxIdVar == -1) {
        var olderTweets = tweetGetter(sinceId, maxIdVar)
        // What a pain in the arse.  Can't work on the string as a List, must be jsArray to combine
        //var rawJSON = Json.stringify(olderTweets)//DataObjectFactory.getRawJSON(olderTweets.as[List[JsValue]]);
        //val json2 = Json.parse(rawJSON).as[JsArray]
        if (olderTweets != null) {
          if (maxId == maxIdVar) {
            json = olderTweets
          } else {
            json = json ++ olderTweets
          }
          if (olderTweets.value.length != 0) {
            maxIdVar = getLastId(olderTweets)
            loop = true
          }
        }
      }
    }
    json
  }

  /** Get Tweets from sinceId up to maxId, maxId == -1 means no max
   *  
   *  @param sinceId Long 
   *  @param maxId Long
   */
  def getTimelineTweetsSinceMax(sinceId: Long, maxId: Long): JsArray = {
    var paging = new Paging()
    paging.setCount(200)
    if (maxId != -1) {
      paging.setMaxId(maxId)
    }
    paging.setSinceId(sinceId)
    val list = getTimeline(paging)
    AppState.update(list.getRateLimitStatus)
    Json.parse(DataObjectFactory.getRawJSON(list)).as[JsArray]
  }

  /** Call Twitter api 1.1 getTimeline for the configured user
   *  
   *  @param paging Paging the paging structure to use
   */
  def getTimeline(paging: Paging): twitter4j.ResponseList[twitter4j.Status] = {
    val twitter = new TwitterFactory().getInstance()
    val user = twitter.verifyCredentials()
    twitter.getUserTimeline(220451297, paging);
  }


  /* status received from stream, push if it's a trade */
  def handleStatus(status: Status) {
    var json = Json.parse(DataObjectFactory.getRawJSON(status))
    if (isStatusFromUser(json, 220451297L)) {
      streamedTweets = streamedTweets.+:(json)
      allTweets = allTweets.+:(json)
      val text = (json \ "text").toString
      if (isStatusATrade(json)) {
        Logger.info("It's a trade, pushing")
        filteredAndPrunedTweets = filteredAndPrunedTweets.+:(trimUserTransform(json))
        twittersearchpush.Pusher.sendPushUsingCurl(text)
      }
      Logger.info("handleStatus after parsing, text = " + text)
      var file = "twittersearchpushTweetsStreamed.json"
      FileUtils.writeStringToFile(new File(dir + file), Json stringify streamedTweets)
    }
  }

  /* streamListener registers the userStreamListener for userStream events */

  def streamListener = {
    Logger.info("streamListener")
    val twitterStream = new TwitterStreamFactory().getInstance
    var fq = new FilterQuery()
    fq.follow(Array(220451297))
    twitterStream.addListener(userStreamListener)
    twitterStream.user
  }

  /* userStreamList holds all the callbacks for the events on a user stream
   * Only handles the onStatus event
   */
  def userStreamListener = new UserStreamListener() {
    def onStatus(status: Status) {
      handleStatus(status)
    }
    def onDeletionNotice(statusDeletionNotice: StatusDeletionNotice) {}
    def onTrackLimitationNotice(numberOfLimitedStatuses: Int) {}
    def onException(ex: Exception) { ex.printStackTrace }
    def onScrubGeo(arg0: Long, arg1: Long) {}
    def onStallWarning(warning: StallWarning) {}
    def onBlock(x$1: twitter4j.User, x$2: twitter4j.User): Unit = {}
    def onDeletionNotice(x$1: Long, x$2: Long): Unit = {}
    def onDirectMessage(x$1: twitter4j.DirectMessage): Unit = {}
    def onFavorite(x$1: twitter4j.User, x$2: twitter4j.User, x$3: twitter4j.Status): Unit = {}
    def onFollow(x$1: twitter4j.User, x$2: twitter4j.User): Unit = {}
    def onFriendList(x$1: Array[Long]): Unit = {}
    def onUnblock(x$1: twitter4j.User, x$2: twitter4j.User): Unit = {}
    def onUnfavorite(x$1: twitter4j.User, x$2: twitter4j.User, x$3: twitter4j.Status): Unit = {}
    def onUserListCreation(x$1: twitter4j.User, x$2: twitter4j.UserList): Unit = {}
    def onUserListDeletion(x$1: twitter4j.User, x$2: twitter4j.UserList): Unit = {}
    def onUserListMemberAddition(x$1: twitter4j.User, x$2: twitter4j.User, x$3: twitter4j.UserList): Unit = {}
    def onUserListMemberDeletion(x$1: twitter4j.User, x$2: twitter4j.User, x$3: twitter4j.UserList): Unit = {}
    def onUserListSubscription(x$1: twitter4j.User, x$2: twitter4j.User, x$3: twitter4j.UserList): Unit = {}
    def onUserListUnsubscription(x$1: twitter4j.User, x$2: twitter4j.User, x$3: twitter4j.UserList): Unit = {}
    def onUserListUpdate(x$1: twitter4j.User, x$2: twitter4j.UserList): Unit = {}
    def onUserProfileUpdate(x$1: twitter4j.User): Unit = {}
  }

  /** json parsing utility functions */
  def getFirstId(json: JsArray): Long = {
    (json(0) \ "id").as[Long]
  }

  def getLastId(json: JsArray): Long = {
    (json(json.value.length - 1) \ "id").as[Long] - 1
  }

  def filterTweetsToOlderThan(tweets: JsArray, oldest_id: String): JsArray = {
    JsArray(tweets.value.filter((e: JsValue) => (e \ "id").toString < oldest_id))
  }

  def filterTweetsToNewerThan(tweets: JsArray, newerThanId: String): JsArray = {
    JsArray(tweets.value.filter((e: JsValue) => (e \ "id").toString > newerThanId))
  }
  def isStatusATrade(e: JsValue): Boolean = {
    ("stockguy22: SELL|stockguy22: BUY".r findFirstIn (e \ "text").toString).nonEmpty
  }
  def isStatusFromUser(e: JsValue, user: Long): Boolean = {
    (e \ "user" \ "id").toString equals user.toString
  }

  def filterTweets(statuses: JsArray): JsArray = {
    JsArray(statuses.value filter isStatusATrade)
  }
  /* Trim the data structure to just id, id_str, text, created_at */
  def trimUserTransform(item: JsValue): JsObject = {
    val xform = (
      (__ \ 'id).json.pickBranch and
      (__ \ 'id_str).json.pickBranch and
      (__ \ 'text).json.pickBranch and
      (__ \ 'created_at).json.pickBranch) reduce
    val transformed = item.transform(xform)
    transformed match {
      case _: JsError => null
      case _          => transformed.get
    }
  }

  /* trim each tweet in an array to a subset of the fields */
  def trimTweets(statuses: JsArray): JsArray = {
    var tweetsTrimmed = new JsArray()
    // Hopefully += with null does the obvious nothing.
    statuses.value.foreach(item => tweetsTrimmed = tweetsTrimmed :+ trimUserTransform(item))
    tweetsTrimmed

  }

}
