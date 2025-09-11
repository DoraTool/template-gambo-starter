import Phaser from 'phaser'
import { screenSize } from '../gameConfig.json'

export class GameOverUIScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameOverUIScene",
    })
    this.currentLevelKey = null // 存储当前关卡的场景key
    this.isRestarting = false // 重置重启标志
  }

  init(data) {
    // 接收从关卡场景传递的数据
    this.currentLevelKey = data.currentLevelKey || "Level1Scene"
    // 重置重启标志
    this.isRestarting = false
  }

  create() {
    // 播放游戏结束音效
    this.gameOverSound = this.sound.add("game_over_sound", { volume: 0.3 })
    this.gameOverSound.play()

    // 创建半透明遮罩背景
    this.createOverlay()

    // 直接创建UI，字体已通过Phaser加载器加载完成
    this.createUI()

    // 设置输入控制
    this.setupInputs()
  }

  createOverlay() {
    // 获取屏幕尺寸
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    // 创建半透明红色遮罩，营造危险感
    this.overlay = this.add.graphics()
    this.overlay.fillStyle(0x330000, 0.8) // 深红色，80%透明度
    this.overlay.fillRect(0, 0, screenWidth, screenHeight)
  }

  createUI() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    // 使用rexUI创建垂直布局容器
    this.mainContainer = this.rexUI.add.sizer({
      x: screenWidth / 2,
      y: screenHeight / 2,
      width: screenWidth,
      height: screenHeight,
      orientation: 'vertical',
      space: { 
        top: 150,           // 顶部padding
        bottom: 150,        // 底部padding
        left: 20,          // 左侧padding
        right: 20          // 右侧padding
      }
    })

    // 创建游戏结束标题
    this.createGameOverTitle()

    // 创建中间的弹性空间
    this.mainContainer.addSpace()

    // 创建失败文字
    this.createFailureText()

    // 添加一些空间
    this.mainContainer.addSpace()

    // 创建PRESS ENTER文字
    this.createPressEnterText()

    // 布局UI
    this.mainContainer.layout()
  }

  createGameOverTitle() {
    const screenWidth = screenSize.width.value
    
    // 创建游戏结束标题文字
    this.gameOverTitle = this.add.text(0, 0, 'GAME OVER', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 12, 80) + 'px',
      fill: '#FF0000', // 红色
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // 添加到主容器
    this.mainContainer.add(this.gameOverTitle, {
        proportion: 0, 
        align: 'center',
    })

    // 添加标题的闪烁动画（更快的频率营造紧迫感）
    this.tweens.add({
      targets: this.gameOverTitle,
      alpha: 0.5,
      duration: 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
  }

  createFailureText() {
    const screenWidth = screenSize.width.value
    
    // 创建失败文字
    this.failureText = this.add.text(0, 0, 'Your gundam has been destroyed!', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 25, 36) + 'px',
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // 添加到主容器
    this.mainContainer.add(this.failureText, {
        proportion: 0, 
        align: 'center',
    })
  }

  createPressEnterText() {
    const screenWidth = screenSize.width.value
    
    console.log('use font RetroPixel')
    
    // 创建PRESS ENTER文字
    this.pressEnterText = this.add.text(0, 0, 'PRESS ENTER TO RESTART', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 25, 36) + 'px',
      fill: '#FFFF00', // 黄色
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // 添加到主容器
    this.mainContainer.add(this.pressEnterText, { 
      proportion: 0, 
      align: 'center',
    })

    // 添加闪烁动画
    this.tweens.add({
      targets: this.pressEnterText,
      alpha: 0.3,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
  }

  setupInputs() {
    // 清理之前可能存在的事件监听器
    this.input.off('pointerdown')
    
    // 创建键盘输入
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // 监听鼠标点击事件（直接在input上监听）
    this.input.on('pointerdown', () => this.restartGame())

    // 监听按键事件
    this.enterKey.on('down', () => this.restartGame())
    this.spaceKey.on('down', () => this.restartGame())
  }

  restartGame() {
    // 防止多次触发
    if (this.isRestarting) return
    this.isRestarting = true

    console.log(`Restarting current level: ${this.currentLevelKey}`)

    // 停止当前关卡的背景音乐
    const currentScene = this.scene.get(this.currentLevelKey)
    if (currentScene && currentScene.backgroundMusic) {
      currentScene.backgroundMusic.stop()
    }

    // 清理事件监听器
    this.input.off('pointerdown')
    if (this.enterKey) {
      this.enterKey.off('down')
    }
    if (this.spaceKey) {
      this.spaceKey.off('down')
    }

    // 停止所有游戏相关场景
    this.scene.stop("UIScene")
    this.scene.stop(this.currentLevelKey)
    
    // 重启当前关卡
    this.scene.start(this.currentLevelKey)
  }

  update() {
    // 游戏结束UI场景不需要特殊的更新逻辑
  }
}
