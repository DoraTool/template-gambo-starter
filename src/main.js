import Phaser from "phaser"
import { screenSize, debugConfig, renderConfig } from "./gameConfig.json"
import { Preloader } from "./scenes/Preloader.js"
import { TitleScreen } from "./scenes/TitleScreen.js"
import { VictoryUIScene } from "./scenes/VictoryUIScene.js"
import { GameCompleteUIScene } from "./scenes/GameCompleteUIScene.js"
import { GameOverUIScene } from "./scenes/GameOverUIScene.js"

const config = {
  type: Phaser.AUTO,
  width: screenSize.width.value,
  height: screenSize.height.value,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      fps: 120,
      debug: debugConfig.debug.value,
      debugShowBody: debugConfig.debug.value,
      debugShowStaticBody: debugConfig.debug.value,
      debugShowVelocity: debugConfig.debug.value,
    },
  },
  pixelArt: renderConfig.pixelArt.value,
}

var game = new Phaser.Game(config)
// 严格按以下顺序添加场景：Preloader、TitleScreen、关卡场景、UI 相关场景

// Preloader：加载所有游戏资源
game.scene.add("Preloader", Preloader, true)

// TitleScreen
game.scene.add("TitleScreen", TitleScreen)

// 关卡场景
// game.scene.add("Level1Scene", Level1Scene)
// game.scene.add("Level2Scene", Level2Scene)

// UI 相关场景
game.scene.add("VictoryUIScene", VictoryUIScene)
game.scene.add("GameCompleteUIScene", GameCompleteUIScene)
game.scene.add("GameOverUIScene", GameOverUIScene)