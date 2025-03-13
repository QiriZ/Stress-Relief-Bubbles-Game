/**
 * 游戏核心逻辑
 */

class Game {
    /**
     * 创建游戏实例
     * @param {Object} options - 游戏配置选项
     */
    constructor(options = {}) {
        // DOM元素
        this.container = document.getElementById('game-container');
        this.contentElement = document.getElementById('game-content');
        this.bubbleContainer = document.getElementById('bubble-container');
        this.hudElement = document.getElementById('game-hud');
        this.fragmentCounter = document.getElementById('fragment-counter');
        
        // 游戏状态
        this.isRunning = false;
        this.isPaused = false;
        this.currentMode = null;
        this.score = 0;
        this.fragments = {
            normal: 0,
            golden: 0,
            rainbow: 0
        };
        
        // 游戏配置
        this.config = {
            bubbleSpawnRate: 1000, // 泡泡生成间隔（毫秒）
            maxBubbles: 50,        // 最大泡泡数量
            speedIncrease: 0.1,    // 每10个泡泡增加的速度
            minSpawnRate: 300,     // 最小生成间隔（毫秒）
            ...options
        };
        
        // 创建泡泡工厂
        this.bubbleFactory = new BubbleFactory(this.bubbleContainer);
        
        // 游戏计时器
        this.lastFrameTime = 0;
        this.spawnTimer = 0;
        this.bubblesPopped = 0;
        
        // 音效设置
        this.soundEnabled = true;
        this.musicEnabled = false;
        this.backgroundMusic = null;
        
        // 加载用户数据
        this.loadUserData();
        
        // 绑定方法
        this.update = this.update.bind(this);
        this.handleBubblePop = this.handleBubblePop.bind(this);
    }
    
    /**
     * 开始游戏
     * @param {string} mode - 游戏模式 ('classic', 'challenge', 'zen')
     */
    start(mode) {
        if (this.isRunning) {
            this.stop();
        }
        
        // 设置游戏模式
        this.currentMode = mode || 'classic';
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.bubblesPopped = 0;
        
        // 清除所有现有泡泡
        this.bubbleFactory.removeAllBubbles();
        
        // 根据模式设置游戏参数
        this.setupGameMode();
        
        // 显示HUD
        this.hudElement.classList.remove('hidden');
        this.updateFragmentCounter();
        
        // 开始游戏循环
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.update);
        
        // 播放背景音乐（如果启用）
        if (this.musicEnabled) {
            this.playBackgroundMusic();
        }
        
        console.log(`游戏开始: ${this.currentMode}模式`);
    }
    
    /**
     * 根据当前模式设置游戏参数
     */
    setupGameMode() {
        switch (this.currentMode) {
            case 'classic':
                // 经典模式：平衡的泡泡生成，标准难度
                this.config.bubbleSpawnRate = 1000;
                this.config.maxBubbles = 50;
                this.config.speedIncrease = 0.1;
                this.config.minSpawnRate = 300;
                this.bubbleFactory.setTypeWeights({ normal: 0.8, golden: 0.15, rainbow: 0.05 });
                break;
                
            case 'challenge':
                // 挑战模式：更快的泡泡生成，更多层级
                this.config.bubbleSpawnRate = 800;
                this.config.maxBubbles = 100;
                this.config.speedIncrease = 0.15;
                this.config.minSpawnRate = 200;
                this.bubbleFactory.setTypeWeights({ normal: 0.7, golden: 0.2, rainbow: 0.1 });
                
                // 创建初始的泡泡堆（10层）
                this.createInitialBubbleStack();
                break;
                
            case 'zen':
                // 禅模式：慢节奏，放松体验
                this.config.bubbleSpawnRate = 1500;
                this.config.maxBubbles = 30;
                this.config.speedIncrease = 0.05;
                this.config.minSpawnRate = 500;
                this.bubbleFactory.setTypeWeights({ normal: 0.9, golden: 0.08, rainbow: 0.02 });
                break;
        }
    }
    
    /**
     * 创建挑战模式的初始泡泡堆
     */
    createInitialBubbleStack() {
        const containerRect = this.bubbleContainer.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        
        // 创建10层泡泡
        for (let layer = 5; layer >= 1; layer--) {
            const bubblesInLayer = 5 + (5 - layer) * 2; // 越上层泡泡越少
            const radius = 150 - (layer - 1) * 20; // 越上层泡泡越小
            
            for (let i = 0; i < bubblesInLayer; i++) {
                const angle = (i / bubblesInLayer) * Math.PI * 2;
                const distance = radius * 0.8;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                // 随机决定是否为特殊泡泡
                let type = 'normal';
                if (i === 0 && layer === 3) {
                    type = 'rainbow'; // 确保有一个彩虹泡泡（钥匙泡泡）
                } else if (Math.random() < 0.1) {
                    type = 'golden';
                }
                
                this.bubbleFactory.createBubble({
                    size: 30 + (5 - layer) * 10,
                    layer: layer,
                    type: type,
                    position: { x, y },
                    onPop: this.handleBubblePop
                });
            }
        }
    }
    
    /**
     * 游戏主循环
     * @param {number} timestamp - 当前时间戳
     */
    update(timestamp) {
        if (!this.isRunning || this.isPaused) return;
        
        // 计算时间增量
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // 更新所有泡泡
        this.bubbleFactory.updateBubbles(deltaTime);
        
        // 生成新泡泡
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.config.bubbleSpawnRate && 
            this.bubbleFactory.getBubbleCount() < this.config.maxBubbles) {
            
            this.spawnBubble();
            this.spawnTimer = 0;
        }
        
        // 继续游戏循环
        requestAnimationFrame(this.update);
    }
    
    /**
     * 生成新泡泡
     */
    spawnBubble() {
        this.bubbleFactory.createBubble({
            onPop: this.handleBubblePop
        });
    }
    
    /**
     * 处理泡泡被戳破事件
     * @param {Object} bubbleInfo - 泡泡信息
     */
    handleBubblePop(bubbleInfo) {
        // 增加分数
        this.score += bubbleInfo.size;
        
        // 增加碎片计数
        this.fragments[bubbleInfo.type]++;
        this.updateFragmentCounter();
        
        // 增加已戳破泡泡计数
        this.bubblesPopped++;
        
        // 每戳破10个泡泡，增加生成速度
        if (this.bubblesPopped % 10 === 0) {
            this.increaseSpeed();
        }
        
        // 检查成就
        this.checkAchievements();
        
        // 保存用户数据
        this.saveUserData();
    }
    
    /**
     * 增加泡泡生成速度
     */
    increaseSpeed() {
        const newRate = this.config.bubbleSpawnRate * (1 - this.config.speedIncrease);
        this.config.bubbleSpawnRate = Math.max(newRate, this.config.minSpawnRate);
        console.log(`泡泡生成速度提升: ${this.config.bubbleSpawnRate.toFixed(0)}ms`);
    }
    
    /**
     * 更新碎片计数器显示
     */
    updateFragmentCounter() {
        // 分别显示三种泡泡的碎片数量
        this.fragmentCounter.innerHTML = `
            <span title="普通泡泡碎片">🔵 ${this.fragments.normal}</span> | 
            <span title="金色泡泡碎片">🟡 ${this.fragments.golden}</span> | 
            <span title="彩虹泡泡碎片">🌈 ${this.fragments.rainbow}</span>
        `;
    }
    
    /**
     * 检查成就
     */
    checkAchievements() {
        // 检查是否有成就管理器
        if (window.achievementManager) {
            // 准备游戏统计数据
            const stats = {
                dailyBubblesPopped: this.bubblesPopped,
                fragments: this.fragments,
                zenModeTime: this.currentMode === 'zen' ? (performance.now() - this.lastFrameTime) : 0,
                loginStreak: this.loginStreak || 1, // 使用连续登录天数替代心情记录
                challengesCompleted: 0 // 这里应该从本地存储获取实际的挑战完成次数
            };
            
            // 调用成就管理器的检查方法
            window.achievementManager.checkAchievements(stats);
        }
    }
    
    /**
     * 更新连续登录天数
     */
    updateLoginStreak() {
        const userData = Utils.getFromLocalStorage('userData', {});
        const today = new Date().toISOString().split('T')[0]; // 当前日期，格式为YYYY-MM-DD
        const lastLoginDate = userData.lastLoginDate;
        let loginStreak = userData.loginStreak || 0;
        
        if (lastLoginDate) {
            // 计算上次登录日期与今天的差值
            const lastDate = new Date(lastLoginDate);
            const currentDate = new Date(today);
            const timeDiff = currentDate.getTime() - lastDate.getTime();
            const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
            
            if (dayDiff === 1) {
                // 连续登录，增加天数
                loginStreak++;
            } else if (dayDiff > 1) {
                // 中断了连续登录，重置为1
                loginStreak = 1;
            }
            // 如果是同一天登录，保持不变
        } else {
            // 首次登录
            loginStreak = 1;
        }
        
        // 保存连续登录天数
        this.loginStreak = loginStreak;
        
        // 更新最后登录日期为今天
        userData.lastLoginDate = today;
        userData.loginStreak = loginStreak;
        Utils.saveToLocalStorage('userData', userData);
    }
    
    /**
     * 加载用户数据
     */
    loadUserData() {
        const userData = Utils.getFromLocalStorage('userData', {});
        
        if (userData.fragments) {
            this.fragments = userData.fragments;
        }
        
        if (userData.soundEnabled !== undefined) {
            this.soundEnabled = userData.soundEnabled;
        }
        
        if (userData.musicEnabled !== undefined) {
            this.musicEnabled = userData.musicEnabled;
        }
        
        // 检查上次登录日期，更新连续登录天数
        this.updateLoginStreak();
        
        console.log('用户数据加载完成');
    }
    
    /**
     * 保存用户数据
     */
    saveUserData() {
        const userData = {
            fragments: this.fragments,
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            lastLoginDate: new Date().toISOString().split('T')[0], // 保存当前日期，格式为YYYY-MM-DD
            loginStreak: this.loginStreak || 1
        };
        
        Utils.saveToLocalStorage('userData', userData);
    }
    
    /**
     * 暂停游戏
     */
    pause() {
        if (!this.isRunning) return;
        
        this.isPaused = true;
        console.log('游戏暂停');
    }
    
    /**
     * 恢复游戏
     */
    resume() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.update);
        console.log('游戏继续');
    }
    
    /**
     * 停止游戏
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        this.bubbleFactory.removeAllBubbles();
        this.hudElement.classList.add('hidden');
        console.log('游戏停止');
    }
    
    /**
     * 切换音效
     * @returns {boolean} 音效是否启用
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveUserData();
        return this.soundEnabled;
    }
    
    /**
     * 切换音乐
     * @returns {boolean} 音乐是否启用
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        
        if (this.musicEnabled && this.isRunning && !this.isPaused) {
            this.playBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        
        this.saveUserData();
        return this.musicEnabled;
    }
    
    /**
     * 播放背景音乐
     * @param {string} musicFile - 音乐文件路径
     */
    playBackgroundMusic(musicFile) {
        // 停止当前可能正在播放的音乐
        this.stopBackgroundMusic();
        
        // 如果没有指定音乐文件，根据当前模式选择音乐
        let musicPath = musicFile;
        if (!musicPath) {
            switch(this.currentMode) {
                case 'classic':
                    musicPath = 'audio/bgm_classic.mp3';
                    break;
                case 'challenge':
                    musicPath = 'audio/audiobgm_challenge.mp3';
                    break;
                case 'zen':
                    musicPath = 'audio/bgm_zen.mp3';
                    break;
                default:
                    musicPath = 'audio/bgm_classic.mp3';
            }
        }
        
        // 创建音频元素
        this.backgroundMusic = new Audio(musicPath);
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.5;
        
        // 播放音乐
        if (this.musicEnabled) {
            this.backgroundMusic.play().catch(e => {
                console.log('背景音乐播放失败:', e);
            });
        }
        
        console.log(`播放背景音乐: ${musicPath}`);
    }
    
    /**
     * 停止背景音乐
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic = null;
        }
        console.log('停止背景音乐');
    }
    

}