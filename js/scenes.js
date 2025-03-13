/**
 * 场景配置和管理
 */

class SceneManager {
    /**
     * 创建场景管理器实例
     * @param {Game} game - 游戏实例
     */
    constructor(game) {
        this.game = game;
        this.currentScene = 'default';
        
        // 场景配置
        this.scenes = [
            {
                id: 'default',
                name: '默认场景',
                bgGradient: ['#e0f7fa', '#bbdefb'],
                bubbleStyle: 'normal',
                soundEffects: ['pop_01.mp3']
            },
            {
                id: 'ocean',
                name: '海底世界',
                bgGradient: ['#004080', '#001e3c'],
                bubbleStyle: 'water',
                soundEffects: ['pop_01.mp3']
            },
            {
                id: 'space',
                name: '太空',
                bgGradient: ['#E6E6FA', '#C3B1E1'] ,
                bubbleStyle: 'star',
                soundEffects: ['pop_01.mp3']
            },
            {
                id: 'forest',
                name: '森林',
                bgGradient: ['#F8F3D7', '#C2E0D6'],
                bubbleStyle: 'leaf',
                soundEffects: ['pop_01.mp3']
            }
        ];
        
        // 加载上次选择的场景
        this.loadSavedScene();
    }
    
    /**
     * 获取所有场景
     * @returns {Array} 场景列表
     */
    getScenes() {
        return this.scenes;
    }
    
    /**
     * 获取当前场景
     * @returns {Object} 当前场景配置
     */
    getCurrentScene() {
        return this.scenes.find(scene => scene.id === this.currentScene);
    }
    
    /**
     * 切换场景
     * @param {string} sceneId - 场景ID
     */
    switchScene(sceneId) {
        const scene = this.scenes.find(s => s.id === sceneId);
        if (!scene) return;
        
        this.currentScene = sceneId;
        
        // 更新背景渐变
        this.updateBackgroundGradient(scene.bgGradient);
        
        // 更新泡泡风格
        this.updateBubbleStyle(scene.bubbleStyle);
        
        // 保存选择
        this.saveSceneSelection();
        
        console.log(`场景已切换: ${scene.name}`);
    }
    
    /**
     * 更新背景渐变
     * @param {Array} gradient - 渐变颜色数组 [startColor, endColor]
     */
    updateBackgroundGradient(gradient) {
        const gameContent = document.getElementById('game-content');
        if (gameContent) {
            gameContent.style.background = `linear-gradient(180deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`;
        }
    }
    
    /**
     * 更新泡泡风格
     * @param {string} style - 泡泡风格
     */
    updateBubbleStyle(style) {
        // 移除所有场景相关的类
        document.body.classList.remove('scene-default', 'scene-ocean', 'scene-space', 'scene-forest');
        
        // 添加当前场景的类
        document.body.classList.add(`scene-${this.currentScene}`);
        
        // 确保金色泡泡和彩虹泡泡不受场景切换影响
        const goldenBubbles = document.querySelectorAll('.golden-bubble');
        const rainbowBubbles = document.querySelectorAll('[class*="rainbow-"]');
        
        // 为特殊泡泡重新应用其原始样式，确保CSS优先级
        goldenBubbles.forEach(bubble => {
            // 移除可能的内联样式
            bubble.style.background = '';
            bubble.style.boxShadow = '';
            
            // 确保金色泡泡样式优先级高于场景样式
            // 先移除再添加类，刷新样式应用
            bubble.classList.remove('golden-bubble');
            setTimeout(() => bubble.classList.add('golden-bubble'), 0);
        });
        
        rainbowBubbles.forEach(bubble => {
            // 移除可能的内联样式
            bubble.style.background = '';
            bubble.style.boxShadow = '';
            
            // 获取当前彩虹泡泡的具体颜色类
            const rainbowClass = Array.from(bubble.classList).find(cls => cls.startsWith('rainbow-'));
            if (rainbowClass) {
                // 先移除再添加类，刷新样式应用
                bubble.classList.remove(rainbowClass);
                setTimeout(() => bubble.classList.add(rainbowClass), 0);
            }
        });
    }
    
    /**
     * 保存场景选择到本地存储
     */
    saveSceneSelection() {
        try {
            localStorage.setItem('lastScene', this.currentScene);
        } catch (e) {
            console.warn('无法保存场景选择:', e);
        }
    }
    
    /**
     * 从本地存储加载上次选择的场景
     */
    loadSavedScene() {
        try {
            const savedScene = localStorage.getItem('lastScene');
            if (savedScene && this.scenes.some(s => s.id === savedScene)) {
                this.switchScene(savedScene);
            }
        } catch (e) {
            console.warn('无法加载保存的场景:', e);
        }
    }
}