import Phaser from 'phaser'
import { screenSize } from '../gameConfig.json'
import { LevelManager } from '../LevelManager.js'

export class VictoryUIScene extends Phaser.Scene {
  constructor() {
    super({
      key: "VictoryUIScene",
    })
    this.currentLevelKey = null // 存储当前关卡的场景key
  }

  init(data) {
    // 接收从关卡场景传递的数据
    this.currentLevelKey = data.currentLevelKey
  }

  create() {
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

    // 创建半透明黑色遮罩
    this.overlay = this.add.graphics()
    this.overlay.fillStyle(0x000000, 0.7) // 黑色，70%透明度
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

    // 创建胜利标题
    this.createVictoryTitle()

    // 创建中间的弹性空间
    this.mainContainer.addSpace()

    // 创建副标题
    this.createSubtitle()

    // 添加一些空间
    this.mainContainer.addSpace()

    // 创建PRESS ENTER文字
    this.createPressEnterText()

    // 布局UI
    this.mainContainer.layout()
  }

  createVictoryTitle() {
    const screenWidth = screenSize.width.value
    
    // 创建胜利标题文字
    this.victoryTitle = this.add.text(0, 0, 'LEVEL COMPLETE!', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 15, 64) + 'px',
      fill: '#FFD700', // 金色
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // 添加到主容器
    this.mainContainer.add(this.victoryTitle, {
        proportion: 0, 
        align: 'center',
    })

    // 添加胜利文字的闪烁动画
    this.tweens.add({
      targets: this.victoryTitle,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
  }

  createSubtitle() {
    const screenWidth = screenSize.width.value
    
    // 创建副标题文字
    this.subtitle = this.add.text(0, 0, 'All enemies defeated!', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 25, 36) + 'px',
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // 添加到主容器
    this.mainContainer.add(this.subtitle, {
        proportion: 0, 
        align: 'center',
    })
  }

  createPressEnterText() {
    const screenWidth = screenSize.width.value
    
    console.log('use font RetroPixel')
    
    // 创建PRESS ENTER文字
    this.pressEnterText = this.add.text(0, 0, 'PRESS ENTER FOR NEXT LEVEL', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 25, 36) + 'px',
      fill: '#00FF00', // 绿色
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
    this.input.on('pointerdown', () => this.goToNextLevel())

    // 监听按键事件
    this.enterKey.on('down', () => this.goToNextLevel())
    this.spaceKey.on('down', () => this.goToNextLevel())
  }

  goToNextLevel() {
    console.log(`Going to next level from: ${this.currentLevelKey}`)

    // 直接使用 LevelManager 获取下一关信息
    const nextLevelKey = LevelManager.getNextLevelScene(this.currentLevelKey)
    if (!nextLevelKey) {
      console.error(`No next level found for: ${this.currentLevelKey}`)
      return
    }

    console.log(`Next level: ${nextLevelKey}`)

    // 获取当前关卡场景以停止背景音乐
    const currentScene = this.scene.get(this.currentLevelKey)

    // 停止当前关卡的背景音乐
    if (currentScene.backgroundMusic) {
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
    
    // 启动下一关
    this.scene.start(nextLevelKey)
  }

  update() {
    // 胜利UI场景不需要特殊的更新逻辑
  }
}
