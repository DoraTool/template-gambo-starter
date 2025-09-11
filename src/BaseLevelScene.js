import Phaser from 'phaser'
import { GundamPlayer } from './GundamPlayer.js'
import { ZakuEnemy } from './ZakuEnemy.js'

export class BaseLevelScene extends Phaser.Scene {
  constructor(config) {
    super(config)
  }

  // Level order list
  static LEVEL_ORDER = [
    "Level1Scene",
    "Level2Scene"
  ]

  // Get next level scene Key
  getNextLevelScene() {
    const currentIndex = BaseLevelScene.LEVEL_ORDER.indexOf(this.scene.key)
    if (currentIndex >= 0 && currentIndex < BaseLevelScene.LEVEL_ORDER.length - 1) {
      return BaseLevelScene.LEVEL_ORDER[currentIndex + 1]
    }
    return null
  }

  // Check if it's the last level
  isLastLevel() {
    const currentIndex = BaseLevelScene.LEVEL_ORDER.indexOf(this.scene.key)
    return currentIndex === BaseLevelScene.LEVEL_ORDER.length - 1
  }

  // Get first level scene Key
  static getFirstLevelScene() {
    return BaseLevelScene.LEVEL_ORDER[0]
  }

  // Common creation method
  createBaseElements() {
    // Initialize gameCompleted flag
    this.gameCompleted = false

    // Set map size
    this.setupMapSize()

    // Create background
    this.createBackground()

    // Create map
    this.createTileMap()

    // Create decoration elements
    this.decorations = this.add.group()
    this.createDecorations()

    // Create enemies
    this.enemies = this.add.group()
    this.createEnemies()

    // Create player
    this.createPlayer()

    // Set basic collisions
    this.setupBaseCollisions()

    // Set player's world boundary collision
    this.player.body.setCollideWorldBounds(true)

    // Set camera
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight)
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setLerp(0.1, 0.1)

    // Set world boundaries - side-scroll game: only enable left/right/top collisions, disable bottom boundary collision
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight, true, true, true, false)

    // Create input controls
    this.setupInputs()

    // Set beam saber attack collision detection
    this.setupMeleeCollision()

    // Show UI, pass current scene Key
    this.scene.launch("UIScene", { gameSceneKey: this.scene.key })
  }

  setupBaseCollisions() {
    // Player with collidable tilelayer
    this.physics.add.collider(this.player, this.groundLayer)
    
    // Enemies with collidable tilelayer
    this.physics.add.collider(this.enemies, this.groundLayer)

    // Player and enemy collision - player is knocked back and hurt
    this.physics.add.overlap(
      this.player,
      this.enemies,
      (player, enemy) => {
        if (player.isInvulnerable || player.isHurting || player.isDead || enemy.isDead) return
        
        // Knockback effect
        const knockbackForce = 200
        const direction = player.x > enemy.x ? 1 : -1
        player.body.setVelocityX(direction * knockbackForce)
        
        // Player takes damage
        player.takeDamage(20)
      }
    )
  }

  setupInputs() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  }

  // Set beam saber attack collision detection
  setupMeleeCollision() {
    // Set collision detection between player beam saber trigger and enemies
    this.physics.add.overlap(
      this.player.meleeTrigger,
      this.enemies,
      (trigger, enemy) => {
        if (this.player.isBeamSaberSlashing && !this.player.currentMeleeTargets.has(enemy)) {
          // No response in death or hurt state
          if (enemy.isHurting || enemy.isDead) return
          // Add enemy to attacked list
          this.player.currentMeleeTargets.add(enemy)
          
          // Knockback effect
          const knockbackForce = 300
          const direction = enemy.x > this.player.x ? 1 : -1
          enemy.body.setVelocityX(direction * knockbackForce)
          
          // Finally call takeDamage
          enemy.takeDamage(40)
        }
      }
    )

    // Set collision detection between enemy attack trigger and player
    this.physics.add.overlap(
      this.enemies,
      this.player,
      (enemy, player) => {
        if (enemy.isAttacking && !enemy.currentAttackTargets.has(player)) {
          if (player.isInvulnerable || player.isHurting || player.isDead) return
          
          enemy.currentAttackTargets.add(player)
          
          // Knockback effect
          const knockbackForce = 250
          const direction = player.x > enemy.x ? 1 : -1
          player.body.setVelocityX(direction * knockbackForce)
          
          // Player takes damage
          player.takeDamage(25)
        }
      }
    )
  }

  // Common update method
  baseUpdate() {
    // Update player
    this.player.update(
      this.cursors,
      this.dKey
    )

    // Update enemies
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        enemy.update(this.time.now, this.game.loop.delta)
      }
    })

    this.checkEnemiesDefeated()
  }

  // Check if all enemies are defeated (common method)
  checkEnemiesDefeated() {
    const currentEnemyCount = this.enemies.children.entries.filter(enemy => enemy.active).length
    
    // If all enemies are defeated, launch corresponding UI scene
    if (currentEnemyCount === 0 && !this.gameCompleted) {
      this.gameCompleted = true

      if (this.isLastLevel()) {
        console.log("Game completed!")
        this.scene.launch("GameCompleteUIScene", { 
          currentLevelKey: this.scene.key
        })
      } else {
        this.scene.launch("VictoryUIScene", { 
          currentLevelKey: this.scene.key
        })
      }
    }
  }

  // Set map size method - subclasses need to override
  setupMapSize() {
    throw new Error("setupMapSize method must be implemented by subclass")
  }

  // Create player method - subclasses need to override
  createPlayer() {
    throw new Error("createPlayer method must be implemented by subclass")
  }

  // Create enemies method - subclasses need to override
  createEnemies() {
    throw new Error("createEnemies method must be implemented by subclass")
  }

  // Create background method - subclasses need to override
  createBackground() {
    throw new Error("createBackground method must be implemented by subclass")
  }

  // Create tile map method - subclasses need to override
  createTileMap() {
    throw new Error("createTileMap method must be implemented by subclass")
  }

  // Create decorations method - subclasses need to override
  createDecorations() {
    throw new Error("createDecorations method must be implemented by subclass")
  }
}
