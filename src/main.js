import "./style.css"
import Phaser from "phaser"
import GameScene from "./scenes/GameScene"
import { screenSize, debugConfig, renderConfig } from "./gameConfig.json"

const config = {
  type: Phaser.AUTO,
  parent: "app",
  width: screenSize.width.value,
  height: screenSize.height.value,
  physics: {
    default: "arcade",
    arcade: {
      debug: debugConfig.debug.value,
      debugShowBody: debugConfig.debugShowBody.value,
      debugShowStaticBody: debugConfig.debugShowStaticBody.value,
      debugShowVelocity: debugConfig.debugShowVelocity.value,
    },
  },
  pixelArt: renderConfig.pixelArt.value,
  scene: [GameScene],
}

export default new Phaser.Game(config)
