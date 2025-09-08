/**
 * 关卡管理器 - 管理游戏关卡的顺序和导航
 */
export class LevelManager {
  // 关卡顺序清单
  static LEVEL_ORDER = [
    "Level1Scene",
    "Level2Scene"
  ]

  // 获取下一关场景的Key
  static getNextLevelScene(currentSceneKey) {
    const currentIndex = LevelManager.LEVEL_ORDER.indexOf(currentSceneKey)
    
    // 如果是最后一关或找不到当前关卡，返回null
    if (currentIndex === -1 || currentIndex >= LevelManager.LEVEL_ORDER.length - 1) {
      return null
    }
    
    return LevelManager.LEVEL_ORDER[currentIndex + 1]
  }

  // 检查是否是最后一关
  static isLastLevel(currentSceneKey) {
    const currentIndex = LevelManager.LEVEL_ORDER.indexOf(currentSceneKey)
    return currentIndex === LevelManager.LEVEL_ORDER.length - 1
  }

  // 获取第一关场景的Key
  static getFirstLevelScene() {
    return LevelManager.LEVEL_ORDER.length > 0 ? LevelManager.LEVEL_ORDER[0] : null
  }
}
