import Phaser from 'phaser'
import FSM from 'phaser3-rex-plugins/plugins/fsm.js'
import { createTrigger } from './utils.js'
import { enemyConfig } from './gameConfig.json'

// Enemy FSM class
class ZakuEnemyFSM extends FSM {
  constructor(scene, enemy) {
    super({
      start: 'idle',
      extend: {
        eventEmitter: new Phaser.Events.EventEmitter(),
      },
    });
    this.scene = scene;
    this.enemy = enemy;
  }

  // idle state
  enter_idle() {
    this.enemy.body.setVelocityX(0);
    this.enemy.play('zaku_idle_anim', true);
    this.enemy.resetOriginAndOffset();
  }

  update_idle(time, delta) {
    if (this.enemy.isDead || this.enemy.isHurting) return;
    
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.enemy.x, this.enemy.y,
      this.enemy.scene.player.x, this.enemy.scene.player.y
    );

    if (distanceToPlayer <= this.enemy.attackRange && this.enemy.canAttack()) {
      this.goto('attacking');
    } else if (distanceToPlayer <= this.enemy.patrolRange * 2) {
      this.goto('chasing');
    } else {
      this.goto('patrolling');
    }
  }

  // patrolling state
  enter_patrolling() {
    this.enemy.play('zaku_walk_anim', true);
    this.enemy.resetOriginAndOffset();
  }

  update_patrolling(time, delta) {
    if (this.enemy.isDead || this.enemy.isHurting) return;
    
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.enemy.x, this.enemy.y,
      this.enemy.scene.player.x, this.enemy.scene.player.y
    );

    if (distanceToPlayer <= this.enemy.attackRange && this.enemy.canAttack()) {
      this.goto('attacking');
      return;
    } else if (distanceToPlayer <= this.enemy.patrolRange * 2) {
      this.goto('chasing');
      return;
    }

    // Simple patrol logic
    const distanceFromStart = Math.abs(this.enemy.x - this.enemy.startX);
    if (distanceFromStart >= this.enemy.patrolRange) {
      this.enemy.facingDirection = this.enemy.x > this.enemy.startX ? "left" : "right";
    }

    if (this.enemy.facingDirection === "right") {
      this.enemy.body.setVelocityX(this.enemy.walkSpeed);
    } else {
      this.enemy.body.setVelocityX(-this.enemy.walkSpeed);
    }

    this.enemy.setFlipX(this.enemy.facingDirection === "left");
  }

  // chasing state
  enter_chasing() {
    this.enemy.play('zaku_walk_anim', true);
    this.enemy.resetOriginAndOffset();
  }

  update_chasing(time, delta) {
    if (this.enemy.isDead || this.enemy.isHurting) return;
    
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.enemy.x, this.enemy.y,
      this.enemy.scene.player.x, this.enemy.scene.player.y
    );

    if (distanceToPlayer <= this.enemy.attackRange && this.enemy.canAttack()) {
      this.goto('attacking');
      return;
    } else if (distanceToPlayer > this.enemy.patrolRange * 3) {
      this.goto('patrolling');
      return;
    }

    // Chase player
    if (this.enemy.scene.player.x > this.enemy.x) {
      this.enemy.facingDirection = "right";
      this.enemy.body.setVelocityX(this.enemy.walkSpeed);
    } else {
      this.enemy.facingDirection = "left";
      this.enemy.body.setVelocityX(-this.enemy.walkSpeed);
    }

    this.enemy.setFlipX(this.enemy.facingDirection === "left");
  }

  // attacking state
  enter_attacking() {
    this.enemy.body.setVelocityX(0);
    this.enemy.isAttacking = true;
    this.enemy.lastAttackTime = this.enemy.scene.time.now;
    
    // Clear attack target records, start new attack
    this.enemy.currentAttackTargets.clear();
    this.enemy.updateAttackTrigger();
    
    this.enemy.play('zaku_attack_anim', true);
    this.enemy.resetOriginAndOffset();
    this.enemy.machineGunFireSound.play();
    
    this.enemy.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation, frame) => {
      if (animation.key === 'zaku_attack_anim') {
        this.enemy.isAttacking = false;
        this.enemy.currentAttackTargets.clear();
        this.goto('idle');
      }
    });
  }
}

export class ZakuEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "zaku_idle_frame1")

    // Add to scene and physics system
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Character properties
    this.scene = scene
    this.startX = x
    this.facingDirection = "right"
    this.walkSpeed = enemyConfig.walkSpeed.value

    // State flags
    this.isDead = false
    this.isAttacking = false
    this.isHurting = false
    this.lastAttackTime = 0
    this.attackCooldown = enemyConfig.attackCooldown.value
    this.attackRange = enemyConfig.attackRange.value
    this.patrolRange = enemyConfig.patrolRange.value
    
    // Attack target tracking system
    this.currentAttackTargets = new Set()

    // Enemy health system
    this.maxHealth = enemyConfig.maxHealth.value
    this.health = this.maxHealth

    // Set physics properties
    this.body.setGravityY(enemyConfig.gravityY.value)

    // Set collision box based on idle animation
    this.collisionBoxWidth = 346 * 0.9
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
    this.play("zaku_idle_anim")
    this.resetOriginAndOffset()

    // Create attack trigger
    this.createAttackTrigger()

    // Initialize FSM
    this.fsm = new ZakuEnemyFSM(scene, this)
    this.fsm.start()

    // Initialize all sound effects
    this.initializeSounds()
  }

  // Initialize all sound effects
  initializeSounds() {
    this.machineGunFireSound = this.scene.sound.add("machine_gun_fire", { volume: 0.3 })
    this.mechaExplosionSound = this.scene.sound.add("mecha_explosion", { volume: 0.3 })
  }

  createAnimations() {
    const anims = this.scene.anims

    // Idle animation
    if (!anims.exists("zaku_idle_anim")) {
      anims.create({
        key: "zaku_idle_anim",
        frames: [
          {
            key: "zaku_idle_frame1",
            duration: 800,
          },
          {
            key: "zaku_idle_frame2",
            duration: 800,
          },
        ],
        repeat: -1,
      })
    }

    // Walk animation
    if (!anims.exists("zaku_walk_anim")) {
      anims.create({
        key: "zaku_walk_anim",
        frames: [
          {
            key: "zaku_walk_frame1",
            duration: 300,
          },
          {
            key: "zaku_walk_frame2",
            duration: 300,
          },
        ],
        repeat: -1,
      })
    }

    // Attack animation
    if (!anims.exists("zaku_attack_anim")) {
      anims.create({
        key: "zaku_attack_anim",
        frames: [
          {
            key: "zaku_attack_frame1",
            duration: 50,
          },
          {
            key: "zaku_attack_frame2",
            duration: 100,
          },
        ],
        repeat: 0,
      })
    }

    // Die animation
    if (!anims.exists("zaku_die_anim")) {
      anims.create({
        key: "zaku_die_anim",
        frames: [
          {
            key: "zaku_die_frame1",
            duration: 800,
          },
          {
            key: "zaku_die_frame2",
            duration: 800,
          },
        ],
        repeat: 0,
      })
    }
  }

  update(time, delta) {
    if (!this.body || !this.active) {
      return
    }

    // Handle death state
    this.handleDying()

    // Update FSM
    if (!this.isDead) {
      this.fsm.update(time, delta)
    }

    // Update attack trigger
    this.updateAttackTrigger()
  }

  handleDying() {
    if (this.health <= 0 && !this.isDead) {
      this.health = 0
      this.isDead = true
      this.body.setVelocityX(0)
      this.play("zaku_die_anim", true)
      this.resetOriginAndOffset()
      this.mechaExplosionSound.play()
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation, frame) => {
        if (animation.key === "zaku_die_anim") {
          this.setActive(false)
          this.setVisible(false)
          this.body.setEnable(false)
        }
      })
    }
  }

  resetOriginAndOffset() {
    // Return corresponding origin data based on different animations
    let baseOriginX = 0.5;
    let baseOriginY = 1.0;
    const currentAnim = this.anims.currentAnim;
    if (currentAnim) {
      switch(currentAnim.key) {
        case "zaku_idle_anim":
          baseOriginX = 0.5;
          baseOriginY = 1.0;
          break;
        case "zaku_walk_anim":
          baseOriginX = 0.49;
          baseOriginY = 1.0;
          break;
        case "zaku_attack_anim":
          baseOriginX = 0.21;
          baseOriginY = 1.0;
          break;
        case "zaku_die_anim":
          baseOriginX = 0.319;
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
    if (this.isDead) return
    
    this.health -= damage
    this.isHurting = true

    // Hurt stun logic
    this.scene.time.delayedCall(100, () => {
      this.isHurting = false
    })
  }

  canAttack() {
    return this.scene.time.now - this.lastAttackTime >= this.attackCooldown
  }

  // Create attack trigger
  createAttackTrigger() {
    this.attackTrigger = createTrigger(this.scene, 0, 0, 400, 120)
  }

  // Update attack trigger
  updateAttackTrigger() {
    let triggerX = 0
    let triggerY = 0
    let triggerWidth = 400
    let triggerHeight = 120

    const enemyCenterX = this.x
    const enemyCenterY = this.y - this.body.height / 2

    switch(this.facingDirection) {
      case "right":
        triggerX = enemyCenterX + triggerWidth / 2
        triggerY = enemyCenterY
        break;
      case "left":
        triggerX = enemyCenterX - triggerWidth / 2
        triggerY = enemyCenterY
        break;
    }
    
    this.attackTrigger.setPosition(triggerX, triggerY)
    this.attackTrigger.body.setSize(triggerWidth, triggerHeight)
  }
}
