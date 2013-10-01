package controllers

import play.api._
import play.api.mvc._
import twittersearchpush.TwitterReader

object Application extends Controller {
  
  def proxy(oldest_id: String, newest_id: String) = Action {
    var tradeJson = TwitterReader.getTrades(newest_id)
    Ok(tradeJson.toString)
  };
  
}