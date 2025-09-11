import { BaseLevelScene } from '../BaseLevelScene.js'
import { GundamPlayer } from '../GundamPlayer.js'
import { ZakuEnemy } from '../ZakuEnemy.js'

export class Level1Scene extends BaseLevelScene {
  constructor() {
    super({
      key: "Level1Scene",
    })
  }

  create() {
    // Create basic game elements
    this.createBaseElements()

    // Play background music
    this.backgroundMusic = this.sound.add("space_battle_8bit_theme", {
      volume: 0.6,
      loop: true
    })
    this.backgroundMusic.play()
  }

  update() {
    // Call base update method
    this.baseUpdate()
  }

  // Subclass override method: Set map size method, where 30 and 20 must match the width and height in the map asset info
  setupMapSize() {
    this.mapWidth = 30 * 64
    this.mapHeight = 20 * 64
  }

  // Create player
  createPlayer() {
    // Place player at bottom left platform
    this.player = new GundamPlayer(this, 4 * 64, 18 * 64)
  }

  // Create enemies
  createEnemies() {
    // Place enemies on different platforms based on map layout
    
    // Enemy on right side middle platform
    const enemy1 = new ZakuEnemy(this, 25 * 64, 14 * 64)
    this.enemies.add(enemy1)
    
    // Enemy on central high platform
    const enemy2 = new ZakuEnemy(this, 15 * 64, 10 * 64)
    this.enemies.add(enemy2)
    
    // Enemy on left upper small platform
    const enemy3 = new ZakuEnemy(this, 5 * 64, 6 * 64)
    this.enemies.add(enemy3)
  }

  // Create background
  createBackground() {
    // Calculate background scale to match map height
    const bgTexture = this.textures.get('space_station_background')
    const bgScale = this.mapHeight / bgTexture.getSourceImage().height
    const bgWidth = bgTexture.getSourceImage().width * bgScale
    
    // Tile background horizontally if needed
    for (let x = 0; x < this.mapWidth; x += bgWidth) {
      this.add.image(x, this.mapHeight, 'space_station_background')
        .setOrigin(0, 1)
        .setScale(bgScale)
        .setScrollFactor(0.2) // Parallax scrolling
    }
  }

  // Create tile map
  createTileMap() {
    // Load tilemap
    this.map = this.make.tilemap({ key: 'level1_map' })
    
    // Add tileset
    this.tileset = this.map.addTilesetImage('space_station_floor', 'space_station_floor')
    
    // Create ground layer
    this.groundLayer = this.map.createLayer('ground_layer', this.tileset, 0, 0)
    
    // Set collision for all tiles except empty ones (-1)
    this.groundLayer.setCollisionByExclusion([-1])
  }

  // Create decorations
  createDecorations() {
    const decorationScale = 0.5 // Same scale for all decoration variants
    
    // Add control panels on platforms
    const controlPanel1 = this.add.image(6 * 64, 14 * 64, 'space_control_panels_variant_1')
      .setOrigin(0.5, 1)
      .setScale(decorationScale)
    this.decorations.add(controlPanel1)
    
    const controlPanel2 = this.add.image(12 * 64, 10 * 64, 'space_control_panels_variant_2')
      .setOrigin(0.5, 1)
      .setScale(decorationScale)
    this.decorations.add(controlPanel2)
    
    // Add containers
    const container1 = this.add.image(2 * 64, 18 * 64, 'space_containers_variant_1')
      .setOrigin(0.5, 1)
      .setScale(decorationScale)
    this.decorations.add(container1)
    
    const container2 = this.add.image(28 * 64, 18 * 64, 'space_containers_variant_2')
      .setOrigin(0.5, 1)
      .setScale(decorationScale)
    this.decorations.add(container2)
    
    // Add pipes
    const pipe1 = this.add.image(18 * 64, 10 * 64, 'space_pipes_variant_1')
      .setOrigin(0.5, 1)
      .setScale(decorationScale)
    this.decorations.add(pipe1)
    
    // Add antennas
    const antenna1 = this.add.image(4 * 64, 6 * 64, 'space_antennas_variant_1')
      .setOrigin(0.5, 1)
      .setScale(decorationScale)
    this.decorations.add(antenna1)
    
    const antenna2 = this.add.image(26 * 64, 6 * 64, 'space_antennas_variant_1')
      .setOrigin(0.5, 1)
      .setScale(decorationScale)
    this.decorations.add(antenna2)
    
    // Add energy cores
    const energyCore1 = this.add.image(15 * 64, 18 * 64, 'space_energy_cores_variant_1')
      .setOrigin(0.5, 1)
      .setScale(decorationScale)
    this.decorations.add(energyCore1)
  }
}
