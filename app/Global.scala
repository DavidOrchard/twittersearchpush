import play.api._
import twittersearchpush._

object Global extends GlobalSettings {

  override def onStart(app: Application) {
     Logger.info("Application has started")
     TwitterReader.loadTweets
     TwitterReader.streamListener
  }  
  
  override def onStop(app: Application) {
    Logger.info("Application shutdown...")
  }  
    
}