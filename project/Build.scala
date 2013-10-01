import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

val name = "twittersearchpush"
val version = "1.0"
val appDependencies = Seq(
  jdbc,
  anorm,
  cache,
  "commons-io" % "commons-io" % "2.3",
  "org.twitter4j" % "twitter4j-stream" % "3.0.3",
  "org.scalatest" % "scalatest_2.10" % "2.0.RC1-SNAP4" % "test"  
  )
  val main = play.Project(name, version, appDependencies).settings(
    	requireJs += "mobile-main.js",
    	closureCompilerOptions += "ecmascript5"
    	)
}