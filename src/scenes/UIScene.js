import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' })
  }

  init(data) {
    this.gameSceneKey = data.gameSceneKey
  }

  create() {
    // Get reference to game scene
    this.gameScene = this.scene.get(this.gameSceneKey)
    
    // Create UI elements
    this.createHealthBar()
    this.createControls()
    
    // Set UI to not be affected by camera
    this.cameras.main.setScroll(0, 0)
  }

  createHealthBar() {
    // Health bar background
    this.healthBarBg = this.add.graphics()
    this.healthBarBg.fillStyle(0x000000, 0.5)
    this.healthBarBg.fillRect(20, 20, 204, 24)
    this.healthBarBg.setScrollFactor(0)
    
    // Health bar border
    this.healthBarBorder = this.add.graphics()
    this.healthBarBorder.lineStyle(2, 0xffffff)
    this.healthBarBorder.strokeRect(20, 20, 204, 24)
    this.healthBarBorder.setScrollFactor(0)
    
    // Health bar fill
    this.healthBarFill = this.add.graphics()
    this.healthBarFill.setScrollFactor(0)
    
    // Health text
    this.healthText = this.add.text(22, 22, 'HEALTH', {
      fontSize: '12px',
      fontFamily: 'RetroPixel',
      fill: '#ffffff'
    })
    this.healthText.setScrollFactor(0)
  }

  createControls() {
    // Control instructions
    const controlsText = [
      'ARROW KEYS: Move',
      'UP: Jump',
      'D: Beam Saber Attack'
    ]
    
    controlsText.forEach((text, index) => {
      this.add.text(20, 60 + index * 20, text, {
        fontSize: '12px',
        fontFamily: 'RetroPixel',
        fill: '#ffffff'
      }).setScrollFactor(0)
    })
  }

  update() {
    // Update health bar
    if (this.gameScene && this.gameScene.player) {
      const healthPercentage = this.gameScene.player.getHealthPercentage()
      
      // Clear and redraw health bar fill
      this.healthBarFill.clear()
      
      // Health bar color based on percentage
      let healthColor = 0x00ff00 // Green
      if (healthPercentage < 30) {
        healthColor = 0xff0000 // Red
      } else if (healthPercentage < 60) {
        healthColor = 0xffff00 // Yellow
      }
      
      this.healthBarFill.fillStyle(healthColor)
      this.healthBarFill.fillRect(22, 22, (healthPercentage / 100) * 200, 20)
    }
  }
}
