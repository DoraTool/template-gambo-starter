# 模版说明
Gambo 游戏基础模版

## 基础文件使用说明
0. 所有 UI 元素必修写在独立的 UI 场景中，不要写在关卡场景里，比如玩家的得分、血量等 UI 元素
1. 所有游戏所需的素材，必须统一在 asset-pack.json 里加载；
2. 所有关卡的 key 需统一在 LevelManager.js 的 LEVEL_ORDER 里进行管理；
3. 所有 number 和 boolean 类型的游戏参数都使用 gameConfig.json 进行管理和控制；
4. 需替换 TitleScreen.js 中的素材：
- 游戏标题图
- 背景图：优先使用第一关卡的背景，如果没有则生成一张背景图
- 背景音乐：优先使用第一关卡的背景音乐
5. 使用 VictoryUIScene / GameOverUIScene / GameCompleteUIScene 的注意点：
- 在关卡场景中使用 this.scene.launch 来启动这些 UI 场景
- 启动时需要传入 currentLevelKey，例如：
```
this.scene.launch("VictoryUIScene", { 
    currentLevelKey: this.scene.key
})
```
- 启动的时机：
    - VictoryUIScene：关卡胜利时出现
    - GameOverUIScene：玩家死亡时出现
    - GameCompleteUIScene：游戏通关时出现
- 当在 UI 场景中使用 this.scene.start 启动其他场景时，Phaser 引擎只会自动 stop this.scene，所以其他的 Scene 需要手动 stop，背景音乐也需要手动 stop
6. utils.js 中的工具说明
- createTrigger 方法可以方便地创建碰撞触发器，比如攻击区域检测等

## 其他文件使用说明
无