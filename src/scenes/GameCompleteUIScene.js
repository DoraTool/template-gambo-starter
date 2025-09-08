import Phaser from 'phaser'
import { screenSize } from '../gameConfig.json'

export class GameCompleteUIScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameCompleteUIScene",
    })
    this.currentLevelKey = null // 存储当前关卡的场景key
    this.isTransitioning = false // 重置切换标志
  }

  init(data) {
    // 接收从关卡场景传递的数据
    this.currentLevelKey = data.currentLevelKey || "Level2Scene"
    // 重置切换标志
    this.isTransitioning = false
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
        top: 120,           // 顶部padding
        bottom: 120,        // 底部padding
        left: 20,          // 左侧padding
        right: 20          // 右侧padding
      }
    })

    // 创建游戏通关标题
    this.createGameCompleteTitle()

    // 创建中间的弹性空间
    this.mainContainer.addSpace()

    // 创建恭喜文字
    this.createCongratulationsText()

    // 添加一些空间
    this.mainContainer.addSpace()

    // 创建PRESS ENTER文字
    this.createPressEnterText()

    // 布局UI
    this.mainContainer.layout()
  }

  createGameCompleteTitle() {
    const screenWidth = screenSize.width.value
    
    // 创建游戏通关标题文字
    this.gameCompleteTitle = this.add.text(0, 0, 'GAME COMPLETE!', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 13, 72) + 'px',
      fill: '#FFD700', // 金色
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // 添加到主容器
    this.mainContainer.add(this.gameCompleteTitle, {
        proportion: 0, 
        align: 'center',
    })

    // 添加标题的闪烁动画
    this.tweens.add({
      targets: this.gameCompleteTitle,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 1200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
  }

  createCongratulationsText() {
    const screenWidth = screenSize.width.value
    
    // 创建恭喜文字
    this.congratulationsText = this.add.text(0, 0, 'Congratulations!\nYou have completed all levels!', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 25, 36) + 'px',
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // 添加到主容器
    this.mainContainer.add(this.congratulationsText, {
        proportion: 0, 
        align: 'center',
    })

    // 添加彩虹色效果
    this.tweens.add({
      targets: this.congratulationsText,
      duration: 3000,
      repeat: -1,
      onUpdate: () => {
        const hue = (this.time.now * 0.1) % 360
        const color = Phaser.Display.Color.HSVToRGB(hue / 360, 1, 1)
        this.congratulationsText.setFill(`rgb(${Math.floor(color.r)}, ${Math.floor(color.g)}, ${Math.floor(color.b)})`)
      }
    })
  }

  createPressEnterText() {
    const screenWidth = screenSize.width.value
    
    console.log('use font RetroPixel')
    
    // 创建PRESS ENTER文字
    this.pressEnterText = this.add.text(0, 0, 'PRESS ENTER TO RETURN TO MENU', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 28, 32) + 'px',
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
    this.input.on('pointerdown', () => this.returnToMenu())

    // 监听按键事件
    this.enterKey.on('down', () => this.returnToMenu())
    this.spaceKey.on('down', () => this.returnToMenu())
  }

  returnToMenu() {
    // 防止多次触发
    if (this.isTransitioning) return
    this.isTransitioning = true

    console.log("Returning to title screen")

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
    
    // 启动标题屏幕
    this.scene.start("TitleScreen")
  }

  update() {
    // 游戏通关UI场景不需要特殊的更新逻辑
  }
}
