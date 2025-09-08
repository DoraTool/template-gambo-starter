import Phaser from 'phaser'

// 创建碰撞触发器
export const createTrigger = (
    scene,
    x,
    y,
    width,
    height,
    origin = { x: 0.5, y: 0.5 }
) => {
    const customCollider = scene.add.zone(x, y, width, height).setOrigin(origin.x, origin.y);

    scene.physics.add.existing(customCollider);
    customCollider.body.setAllowGravity(false); // 不受重力影响
    customCollider.body.setImmovable(true);
    return customCollider;
};