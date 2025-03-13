/**
 * 游戏主入口
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 创建游戏实例
    const game = new Game();
    
    // 创建场景管理器
    const sceneManager = new SceneManager(game);
    
    // 创建UI管理器
    const ui = new UI(game, sceneManager);
    
    // 创建音频目录（如果不存在）
    createAudioDirectory();
    
    console.log('泡泡戳游戏初始化完成');
});

/**
 * 创建音频目录和默认音频文件
 */
function createAudioDirectory() {
    // 在实际环境中，这里会检查音频文件是否存在
    // 由于这是前端代码，我们只能假设音频文件已经存在
    // 在实际项目中，应该将音频文件放在audio目录下
    
    console.log('音频资源检查...');
    
    // 音频文件列表（实际项目中需要确保这些文件存在）
    const audioFiles = [
        'audio/pop_01.mp3',       // 普通泡泡音效
        'audio/chime_02.mp3',     // 金色泡泡音效
        'audio/magic_01.mp3',     // 彩虹泡泡音效（戳泡泡的音效，不是场景音效）
        'audio/achievement.mp3',  // 成就解锁音效
        'audio/bgm_classic.mp3',  // 经典模式背景音乐
        'audio/audiobgm_challenge.mp3', // 挑战模式背景音乐
        'audio/bgm_zen.mp3'       // 禅模式背景音乐
    ];
    
    // 预加载音频
    audioFiles.forEach(file => {
        try {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = file;
            console.log(`预加载音频: ${file}`);
        } catch (e) {
            console.warn(`音频预加载失败: ${file}`, e);
        }
    });
}

/**
 * 检测浏览器兼容性
 */
function checkBrowserCompatibility() {
    // 检查基本的Web Audio API支持
    if (!window.AudioContext && !window.webkitAudioContext) {
        console.warn('当前浏览器不支持Web Audio API，音效可能无法正常播放');
    }
    
    // 检查本地存储支持
    if (!window.localStorage) {
        console.warn('当前浏览器不支持本地存储，游戏进度将无法保存');
    }
    
    // 检查是否为移动设备
    if (Utils.isMobileDevice()) {
        console.log('检测到移动设备，已启用触摸优化');
        document.body.classList.add('mobile-device');
    }
}

// 添加窗口大小调整事件
window.addEventListener('resize', () => {
    console.log('窗口大小已调整，更新游戏布局');
    // 在实际项目中，这里可以添加响应式布局调整逻辑
});

// 添加页面可见性变化事件（用于在切换标签页时暂停游戏）
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('页面不可见，自动暂停游戏');
        // 获取游戏实例并暂停（实际项目中需要实现）
        // window.gameInstance?.pause();
    } else {
        console.log('页面可见，游戏可以继续');
        // 页面重新可见时，不自动恢复游戏，让用户手动点击继续
    }
});