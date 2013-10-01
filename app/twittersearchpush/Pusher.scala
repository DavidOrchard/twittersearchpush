package twittersearchpush

import twitter4j._
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import com.urbanairship.api.client._
import com.urbanairship.api.push.model.DeviceTypeData
import com.urbanairship.api.push.model.DeviceType
import com.urbanairship.api.push.model.PushPayload
import com.urbanairship.api.push.model.audience.Selectors
import com.urbanairship.api.push.model.notification.Notifications
import sys.process._

object Pusher {

  def main(args: Array[String]) {
    sendPushUsingCurl("hi")
  }

  /** send a pushing using curl
   *  
   *  @param message String message text for the alert to the user
   */
  def sendPushUsingCurl(message: String) {
    val cmd = Seq("curl", "-X", "POST", "-u", "", "-g", "-H", "Content-Type: application/json", "-H", "Accept: application/vnd.urbanairship+json; version=3;", "-d", "{\"audience\": \"all\", \"device_types\":\"all\", \"notification\": {\"alert\": \"" + message + "\"}}", "https://go.urbanairship.com/api/push/")
    cmd.!!
    System.out.println(cmd.mkString(" "))
  }

  /** YABI (Yet another broken api)
   *  
   */
  def sendPushUsingAPI(message: String) {

    val key = "njIAYS0iSgCLjahW_KklwQ";
    val secret = "90DAtbVgSvSqPuNay0OE_w";

    // Build and configure an APIClient
    val apiClient = APIClient.newBuilder()
      .setKey(key)
      .setSecret(secret)
      .build();

    // Setup a payload for the message you want to send
    val payload = PushPayload.newBuilder()
      .setAudience(Selectors.all())
      .setNotification(Notifications.alert(message))
      .setDeviceTypes(DeviceTypeData.of(DeviceType.IOS))
      .build();
    // Try/Catch for any issues, any non 200 response, or non library
    // related exceptions
    try {
      val response = apiClient.push(payload);
      System.out.println(String.format("Response %s", response.toString()));
    } catch {
      case ex: APIRequestException =>
        System.out.println(String.format("APIRequestException " + ex));
        System.out.println("Something wrong with the request " + ex.toString());
      case e: Throwable =>
        System.out.println("Exception in API request, message = " + e.getMessage());
        System.out.println("Exception in API request, stacktrace = " + e.printStackTrace());
        System.out.println("Exception in API request, cause = " + e.getCause());
    }

  }
}
