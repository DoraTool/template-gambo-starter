import "./style.css"
import Phaser from "phaser"
import GameScene from "./scenes/game-scene"

const config = {
  type: Phaser.AUTO,
  parent: "app",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: [GameScene],
}

export default new Phaser.Game(config)
