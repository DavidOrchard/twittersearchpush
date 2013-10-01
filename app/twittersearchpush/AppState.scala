package twittersearchpush

import org.apache.commons.io.FileUtils
import java.io.File
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import twitter4j._

/** Tracks any application state such as the last metadata from twitter about rate limiting
 *  
 *  @constructor
 */
object AppState {
  var dir = ""
  val file = "appState.json"
  var timestamp = 0L
  var limit = 0
  var remaining = 0

  /** update the metadata and persist
   *  
   *  @param timestamp Long 
   *  @param limit Int
   *  @param remaining Int
   */
  def update(timestamp: Long, limit: Int, remaining: Int) {
    this.timestamp = timestamp
    this.limit = limit
    this.remaining = remaining
    this.write
  }

  /** update the metadata using current timestamp and persist
   *  
   *  @param status twitter4j.RateLimitStatus source of limit and remaining
   */
  def update(status: twitter4j.RateLimitStatus) {
    this.timestamp = java.util.Calendar.getInstance.getTime.getTime
    this.remaining = status.getRemaining
    this.limit = status.getLimit
    this.write
  }

  /** persist the appstate in json format to the filesystem*/
  def write {
    val json = Json.obj(
      "timestamp" -> timestamp,
      "limit" -> limit,
      "remaining" -> remaining)
    FileUtils.write(new File(fileName), Json.stringify(json))
  }

  /** read the appstate from the file system */
  def read = {
    try {
      val fileLimitStr = FileUtils readFileToString (new File(fileName), "UTF-8")
      if (fileLimitStr.length > 0) {
    	val fileLimitJson = Json.parse(fileLimitStr)
    	this.timestamp = (fileLimitJson \ "timestamp").as[Long]
        this.limit = (fileLimitJson \ "limit").as[Int]
        this.remaining = (fileLimitJson \ "remaining").as[Int]
      }
    } catch {
      case e: Exception => 
    }
  }

  /** filename used for persistence.  Useful for testing */
  def fileName: String = {
    dir + file
  }
}