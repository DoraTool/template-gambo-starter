import Phaser from 'phaser'
import { screenSize } from '../gameConfig.json'
import { LevelManager } from '../LevelManager.js'

export class TitleScreen extends Phaser.Scene {
  constructor() {
    super({
      key: "TitleScreen",
    })
    this.isStarting = false // 初始化启动标志
  }

  init() {
    // 重置启动标志
    this.isStarting = false
  }

  create() {
    // 创建背景
    this.createBackground()

    // 直接创建UI，字体已通过Phaser加载器加载完成
    this.createUI()

    // 设置输入控制
    this.setupInputs()

    // 播放背景音乐
    this.playBackgroundMusic()
  }

  createBackground() {
    // 获取屏幕尺寸
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    // 创建背景并缩放至填满屏幕
    this.background = this.add.image(screenWidth / 2, screenHeight / 2, "space_station_background")
    
    // 计算缩放比例以填满屏幕
    const scaleX = screenWidth / this.background.width
    const scaleY = screenHeight / this.background.height
    const scale = Math.max(scaleX, scaleY) // 使用较大的缩放比例以确保完全覆盖

    this.background.setScale(scale)
  }

  createUI() {
    // 直接使用原生 Phaser 元素摆放
    this.createGameTitle()
    this.createPressEnterText()
  }

  createGameTitle() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    this.gameTitle = this.add.image(screenWidth / 2, screenHeight * 0.35, "game_title")
    
    const maxTitleWidth = screenWidth * 0.7
    const maxTitleHeight = screenHeight * 0.6

    if (this.gameTitle.width / this.gameTitle.height > maxTitleWidth / maxTitleHeight) {
        this.gameTitle.setScale(maxTitleWidth / this.gameTitle.width)
    } else {
        this.gameTitle.setScale(maxTitleHeight / this.gameTitle.height)
    }
    // 确保顶部距离为50px
    this.gameTitle.y = 50 + this.gameTitle.displayHeight / 2
  }

  createPressEnterText() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // 创建PRESS ENTER文字（居中靠下）
    this.pressEnterText = this.add.text(screenWidth / 2, screenSize.height.value * 0.75, 'PRESS ENTER', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 20, 48) + 'px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 10,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // 确保底部距离为80px
    this.pressEnterText.y = screenHeight - 80 - this.pressEnterText.displayHeight / 2

    // 添加闪烁动画
    this.tweens.add({
      targets: this.pressEnterText,
      alpha: 0.3,
      duration: 1000,
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
    this.input.on('pointerdown', () => this.startGame())

    // 监听按键事件
    this.enterKey.on('down', () => this.startGame())
    this.spaceKey.on('down', () => this.startGame())
  }

  playBackgroundMusic() {
    // 播放背景音乐（音量较低）
    this.backgroundMusic = this.sound.add("space_battle_8bit_theme", {
      volume: 0.4,
      loop: true
    })
    this.backgroundMusic.play()
  }

  startGame() {
    // 防止多次触发
    if (this.isStarting) return
    this.isStarting = true

    // 停止背景音乐
    if (this.backgroundMusic) {
      this.backgroundMusic.stop()
    }

    // 添加过渡效果
    this.cameras.main.fadeOut(500, 0, 0, 0)
    
    // 延迟后启动第一关
    this.time.delayedCall(500, () => {
      const firstLevelScene = LevelManager.getFirstLevelScene()
      if (firstLevelScene) {
        this.scene.start(firstLevelScene)
      } else {
        console.error("No first level scene found in LEVEL_ORDER")
      }
    })
  }

  update() {
    // 标题屏幕不需要特殊的更新逻辑
  }
}