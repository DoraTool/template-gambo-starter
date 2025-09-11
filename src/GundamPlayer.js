import Phaser from 'phaser'
import { createTrigger } from './utils.js'
import { playerConfig } from './gameConfig.json'

export class GundamPlayer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "gundam_idle_frame1")

    // Add to scene and physics system
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Character properties
    this.scene = scene
    this.facingDirection = "right"
    this.walkSpeed = playerConfig.walkSpeed.value
    this.jumpPower = playerConfig.jumpPower.value

    // State flags
    this.isDead = false // Death state
    this.isBeamSaberSlashing = false // Beam saber slashing state
    this.isHurting = false // Hurt stun state
    this.isInvulnerable = false // Invulnerable state
    this.hurtingDuration = playerConfig.hurtingDuration.value // Hurt stun duration, recommended 100ms
    this.invulnerableTime = playerConfig.invulnerableTime.value // Invulnerable time, recommended 2000ms
    
    // Attack target tracking system
    this.currentMeleeTargets = new Set() // Record targets already hit by current attack

    // Player health system
    this.maxHealth = playerConfig.maxHealth.value
    this.health = this.maxHealth

    // Set physics properties
    this.body.setGravityY(playerConfig.gravityY.value)

    // Set collision box based on idle animation
    this.collisionBoxWidth = 379 * 0.9
    this.collisionBoxHeight = 560 * 0.9
    this.body.setSize(this.collisionBoxWidth, this.collisionBoxHeight)

    // Set character scale
    const standardHeight = 2 * 64
    this.characterScale = standardHeight / 560
    this.setScale(this.characterScale)

    // Set initial origin
    this.setOrigin(0.5, 1.0)

    // Create animations
    this.createAnimations()

    // Play idle animation
    this.play("gundam_idle_anim")
    this.resetOriginAndOffset()

    // Create beam saber attack trigger
    this.createMeleeTrigger()

    // Initialize all sound effects
    this.initializeSounds()
  }

  // Initialize all sound effects
  initializeSounds() {
    this.thrustersBoostSound = this.scene.sound.add("thrusters_boost", { volume: 0.3 })
    this.beamSaberSlashSound = this.scene.sound.add("beam_saber_slash", { volume: 0.3 })
  }

  createAnimations() {
    const anims = this.scene.anims

    // Idle animation
    if (!anims.exists("gundam_idle_anim")) {
      anims.create({
        key: "gundam_idle_anim",
        frames: [
          {
            key: "gundam_idle_frame1",
            duration: 800,
          },
          {
            key: "gundam_idle_frame2",
            duration: 800,
          },
        ],
        repeat: -1,
      })
    }

    // Walk animation
    if (!anims.exists("gundam_walk_anim")) {
      anims.create({
        key: "gundam_walk_anim",
        frames: [
          {
            key: "gundam_walk_frame1",
            duration: 300,
          },
          {
            key: "gundam_walk_frame2",
            duration: 300,
          },
        ],
        repeat: -1,
      })
    }

    // Jump up animation
    if (!anims.exists("gundam_jump_up_anim")) {
      anims.create({
        key: "gundam_jump_up_anim",
        frames: [
          {
            key: "gundam_jump_frame1",
            duration: 300,
          },
        ],
        repeat: 0,
      })
    }

    // Jump down animation
    if (!anims.exists("gundam_jump_down_anim")) {
      anims.create({
        key: "gundam_jump_down_anim",
        frames: [
          {
            key: "gundam_jump_frame2",
            duration: 300,
          },
        ],
        repeat: 0,
      })
    }

    // Beam saber slash animation
    if (!anims.exists("gundam_beam_saber_slash_anim")) {
      anims.create({
        key: "gundam_beam_saber_slash_anim",
        frames: [
          {
            key: "gundam_beam_saber_slash_frame1",
            duration: 50,
          },
          {
            key: "gundam_beam_saber_slash_frame2",
            duration: 100,
          },
        ],
        repeat: 0,
      })
    }

    // Die animation
    if (!anims.exists("gundam_die_anim")) {
      anims.create({
        key: "gundam_die_anim",
        frames: [
          {
            key: "gundam_die_frame1",
            duration: 800,
          },
          {
            key: "gundam_die_frame2",
            duration: 800,
          },
        ],
        repeat: 0,
      })
    }
  }

  update(cursors, dKey) {
    if (!this.body || !this.active || this.isDead || this.isBeamSaberSlashing || this.isHurting) {
      return
    }

    // Handle death state
    if (!this.isDead) {
      this.handleDying()
    }

    // Handle attack state
    if (!this.isDead && !this.isBeamSaberSlashing && !this.isHurting) {
      this.handleAttacks(dKey)
    }

    // Handle movement
    if (!this.isDead && !this.isBeamSaberSlashing && !this.isHurting) {
      this.handleMovement(cursors)
    }

    // Update beam saber attack trigger
    this.updateMeleeTrigger()
  }

  handleDying() {
    if (this.health <= 0 && !this.isDead) {
      this.health = 0
      this.isDead = true
      this.body.setVelocityX(0)
      this.play("gundam_die_anim", true)
      this.resetOriginAndOffset()
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation, frame) => {
        if (animation.key === "gundam_die_anim") {
          this.scene.scene.launch("GameOverUIScene", { 
            currentLevelKey: this.scene.scene.key 
          })
        }
      })
    } else if(this.y > this.scene.mapHeight + 100 && !this.isDead) { // If it's a side-scroll game, falling out of the world's bottom edge is considered death
      this.health = 0
      this.isDead = true
      this.scene.scene.launch("GameOverUIScene", { 
        currentLevelKey: this.scene.scene.key 
      })
    }
  }

  handleAttacks(dKey) {
    // New: Beam saber slash (D key)
    if (
      Phaser.Input.Keyboard.JustDown(dKey) &&
      !this.isBeamSaberSlashing
    ) {
      // Clear attack target records, start new attack
      this.currentMeleeTargets.clear()
      // Update trigger before attack
      this.updateMeleeTrigger()
      this.isBeamSaberSlashing = true
      this.body.setVelocityX(0) // Stop movement during melee attack

      this.play("gundam_beam_saber_slash_anim", true)
      this.resetOriginAndOffset()
      this.beamSaberSlashSound.play()
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation, frame) => {
        if (animation.key === "gundam_beam_saber_slash_anim") {
          this.isBeamSaberSlashing = false
          // Clear target records when attack ends
          this.currentMeleeTargets.clear()
        }
      })
    }
  }

  handleMovement(cursors) {
    // Normal mode movement control
    if (cursors.left.isDown) {
      this.body.setVelocityX(-this.walkSpeed)
      this.facingDirection = "left"
    } else if (cursors.right.isDown) {
      this.body.setVelocityX(this.walkSpeed)
      this.facingDirection = "right"
    } else {
      this.body.setVelocityX(0)
    }

    // Update facing direction
    this.setFlipX(this.facingDirection === "left")

    // Jump
    if (cursors.up.isDown && this.body.blocked.down) {
      this.body.setVelocityY(-this.jumpPower)
      this.thrustersBoostSound.play()
    }

    // Update animation
    if (!this.body.blocked.down) {
      if (this.body.velocity.y < 0) {
        // Rising phase
        this.play("gundam_jump_up_anim", true)
        this.resetOriginAndOffset()
      } else {
        // Falling phase
        this.play("gundam_jump_down_anim", true)
        this.resetOriginAndOffset()
      }
    } else if (Math.abs(this.body.velocity.x) > 0) {
      // Walking
      this.play("gundam_walk_anim", true)
      this.resetOriginAndOffset()
    } else {
      // Idle
      this.play("gundam_idle_anim", true)
      this.resetOriginAndOffset()
    }
  }

  resetOriginAndOffset() {
    // Return corresponding origin data based on different animations
    let baseOriginX = 0.5;
    let baseOriginY = 1.0;
    const currentAnim = this.anims.currentAnim;
    if (currentAnim) {
      switch(currentAnim.key) {
        case "gundam_idle_anim":
          baseOriginX = 0.5;
          baseOriginY = 1.0;
          break;
        case "gundam_walk_anim":
          baseOriginX = 0.468;
          baseOriginY = 1.0;
          break;
        case "gundam_jump_up_anim":
        case "gundam_jump_down_anim":
          baseOriginX = 0.482;
          baseOriginY = 1.0;
          break;
        case "gundam_beam_saber_slash_anim":
          baseOriginX = 0.29;
          baseOriginY = 1.0;
          break;
        case "gundam_die_anim":
          baseOriginX = 0.594;
          baseOriginY = 1.0;
          break;
        default:
          baseOriginX = 0.5;
          baseOriginY = 1.0;
          break;
      }
    }

    let animOriginX = this.facingDirection === "left" ? (1 - baseOriginX) : baseOriginX;
    let animOriginY = baseOriginY;
    
    // Set origin
    this.setOrigin(animOriginX, animOriginY);
    
    // Calculate offset to align collision box's bottomCenter with animation frame's origin
    this.body.setOffset(
      this.width * animOriginX - this.collisionBoxWidth / 2, 
      this.height * animOriginY - this.collisionBoxHeight
    );
  }

  takeDamage(damage) {
    if (this.isInvulnerable || this.isDead) return
    
    this.health -= damage
    this.isHurting = true
    this.isInvulnerable = true

    // Hurt stun logic
    this.scene.time.delayedCall(this.hurtingDuration, () => {
      this.isHurting = false
    })

    // Blinking logic during invulnerable time
    let blinkCount = 0
    const blinkInterval = 100
    const totalBlinks = this.invulnerableTime / blinkInterval

    const blinkTimer = this.scene.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        this.setVisible(!this.visible)
        blinkCount++
        if (blinkCount >= totalBlinks) {
          this.setVisible(true)
          this.isInvulnerable = false
          blinkTimer.destroy()
        }
      },
      repeat: totalBlinks - 1
    })
  }

  getHealthPercentage() {
    return (this.health / this.maxHealth) * 100
  }

  // Create beam saber attack trigger
  createMeleeTrigger() {
    // Use utility method to create beam saber attack trigger
    this.meleeTrigger = createTrigger(this.scene, 0, 0, 150, 120)
  }

  // Update beam saber attack trigger
  updateMeleeTrigger() {
    let triggerX = 0
    let triggerY = 0
    let triggerWidth = 150
    let triggerHeight = 120

    const playerCenterX = this.x
    // Character origin is at bottom, needs to be offset
    const playerCenterY = this.y - this.body.height / 2

    switch(this.facingDirection) {
      case "right":
        triggerWidth = 150
        triggerHeight = 120
        triggerX = playerCenterX + triggerWidth / 2 // Character center point offset right
        triggerY = playerCenterY
        break;
      case "left":
        triggerWidth = 150
        triggerHeight = 120
        triggerX = playerCenterX - triggerWidth / 2 // Character center point offset left
        triggerY = playerCenterY
        break;
    }
    
    this.meleeTrigger.setPosition(triggerX, triggerY)
    this.meleeTrigger.body.setSize(triggerWidth, triggerHeight)
  }
}
