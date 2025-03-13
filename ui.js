/**
 * 游戏UI交互逻辑
 */

class UI {
    /**
     * 创建UI管理实例
     * @param {Game} game - 游戏实例
     * @param {SceneManager} sceneManager - 场景管理器实例
     */
    constructor(game, sceneManager) {
        this.game = game;
        this.sceneManager = sceneManager;
        
        // DOM元素
        this.container = document.getElementById('game-container');
        this.promoBubble = document.getElementById('promo-bubble');
        this.classicModeBtn = document.getElementById('classic-mode');
        this.challengeModeBtn = document.getElementById('challenge-mode');
        this.zenModeBtn = document.getElementById('zen-mode');
        this.sceneSwitcherBtn = document.getElementById('scene-switcher');
        this.achievementWallBtn = document.getElementById('achievement-wall');
        this.settingsBtn = document.getElementById('settings');
        this.musicControlBtn = document.getElementById('music-control');
        this.pauseMenuBtn = document.getElementById('pause-menu');
        this.speedControlContainer = document.getElementById('speed-control-container');
        this.speedControlSlider = document.getElementById('speed-control-slider');
        
        // 模态框容器
        this.modalContainer = null;
        
        // 初始化事件监听
        this.initEventListeners();
        
        // 检查是否是首次访问，如果是则显示新手引导
        this.checkFirstVisit();
    }
    
    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 游戏模式按钮
        this.classicModeBtn.addEventListener('click', () => this.startGame('classic'));
        this.challengeModeBtn.addEventListener('click', () => this.startGame('challenge'));
        this.zenModeBtn.addEventListener('click', () => this.startGame('zen'));
        
        // 场景切换按钮
        this.sceneSwitcherBtn.addEventListener('click', () => this.showSceneSelector());
        
        // 成就墙按钮
        this.achievementWallBtn.addEventListener('click', () => this.showAchievementWall());
        
        // 设置按钮
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        
        // 音乐控制按钮
        this.musicControlBtn.addEventListener('click', () => this.toggleMusic());
        
        // 暂停菜单按钮
        this.pauseMenuBtn.addEventListener('click', () => this.togglePause());
        
        // 宣传泡泡点击事件
        this.promoBubble.addEventListener('click', () => {
            this.promoBubble.classList.add('bubble-pop');
            setTimeout(() => {
                this.promoBubble.style.display = 'none';
                // 点击泡泡戳后直接进入经典模式
                this.startGame('classic');
            }, 300);
        });
        
        // 速度控制按钮事件
        const speedSlowBtn = document.getElementById('speed-slow');
        const speedMediumBtn = document.getElementById('speed-medium');
        const speedFastBtn = document.getElementById('speed-fast');
        
        if (speedSlowBtn && speedMediumBtn && speedFastBtn) {
            // 慢速按钮
            speedSlowBtn.addEventListener('click', () => {
                if (!this.game.isRunning) return;
                this.setGameSpeed('slow');
            });
            
            // 中速按钮
            speedMediumBtn.addEventListener('click', () => {
                if (!this.game.isRunning) return;
                this.setGameSpeed('medium');
            });
            
            // 快速按钮
            speedFastBtn.addEventListener('click', () => {
                if (!this.game.isRunning) return;
                this.setGameSpeed('fast');
            });
        }
    }
    
    /**
     * 开始游戏
     * @param {string} mode - 游戏模式
     */
    startGame(mode) {
        // 隐藏宣传泡泡
        this.promoBubble.style.display = 'none';
        
        // 隐藏健康游戏忠告
        const gameNotice = document.getElementById('game-notice');
        if (gameNotice) {
            gameNotice.style.display = 'none';
        }
        
        // 如果游戏已经在运行，则切换模式而不是重新开始
        if (this.game.isRunning) {
            // 如果游戏已暂停，先恢复
            if (this.game.isPaused) {
                this.pauseMenuBtn.textContent = '⏸️';
                this.closeModal(); // 关闭可能打开的暂停菜单
            }
            
            // 如果选择的是当前模式，不做任何操作
            if (this.game.currentMode === mode) return;
            
            console.log(`切换游戏模式: 从 ${this.game.currentMode} 到 ${mode}`);
        } else {
            console.log(`开始游戏: ${mode}模式`);
        }
        
        // 开始游戏或切换模式
        this.game.start(mode);
        
        // 添加活跃类
        this.resetActiveButtons();
        document.getElementById(`${mode}-mode`).classList.add('active');
    }
    
    /**
     * 重置所有活跃按钮
     */
    resetActiveButtons() {
        const buttons = document.querySelectorAll('.mode-button');
        buttons.forEach(btn => btn.classList.remove('active'));
    }
    
    /**
     * 播放简单音效
     * @param {string} soundFile - 音效文件路径
     */
    playSound(soundFile) {
        if (!this.game.soundEnabled) return;
        
        const sound = new Audio(soundFile);
        sound.volume = 0.5;
        sound.play();
    }
    
    /**
     * 显示成就墙
     */
    showAchievementWall() {
        // 从成就管理器获取成就列表
        const achievements = window.achievementManager ? window.achievementManager.getAchievements() : [];
        
        // 如果没有成就，显示默认成就
        let achievementHTML = '';
        if (achievements.length === 0) {
            achievementHTML = `
                <div class="achievement-item achievement-locked">
                    <div class="achievement-icon">🔒</div>
                    <div class="achievement-info">
                        <div class="achievement-title">泡泡大师</div>
                        <div class="achievement-description">单日戳破100个泡泡</div>
                    </div>
                </div>
                <div class="achievement-item achievement-locked">
                    <div class="achievement-icon">🔒</div>
                    <div class="achievement-info">
                        <div class="achievement-title">黄金收集者</div>
                        <div class="achievement-description">收集50个金色碎片</div>
                    </div>
                </div>
                <div class="achievement-item achievement-locked">
                    <div class="achievement-icon">🔒</div>
                    <div class="achievement-info">
                        <div class="achievement-title">彩虹猎人</div>
                        <div class="achievement-description">收集10个彩虹碎片</div>
                    </div>
                </div>
            `;
        } else {
            // 构建成就列表HTML
            achievementHTML = achievements.map(ach => {
                const lockedClass = ach.unlocked ? '' : 'achievement-locked';
                const icon = ach.unlocked ? ach.icon : '🔒';
                
                return `
                    <div class="achievement-item ${lockedClass}">
                        <div class="achievement-icon">${icon}</div>
                        <div class="achievement-info">
                            <div class="achievement-title">${ach.title}</div>
                            <div class="achievement-description">${ach.description}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        this.createModal('成就墙', achievementHTML);
    }
    
    /**
     * 显示设置菜单
     */
    showSettings() {
        const soundChecked = this.game.soundEnabled ? 'checked' : '';
        const musicChecked = this.game.musicEnabled ? 'checked' : '';
        
        this.createModal('设置', `
            <div class="settings-group">
                <h3>音频设置</h3>
                <div class="settings-item">
                    <span>音效</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="sound-toggle" ${soundChecked}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="settings-item">
                    <span>音乐</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="music-toggle" ${musicChecked}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="settings-group">
                <h3>游戏设置</h3>
                <div class="settings-item">
                    <span>粒子效果</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="particles-toggle" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="settings-item">
                    <span>高对比度模式</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="high-contrast-toggle">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="settings-group">
                <h3>关于</h3>
                <div class="about-info">
                    <p>泡泡梦境 v1.0</p>
                    <p>一款轻松解压的泡泡游戏</p>
                </div>
            </div>
        `);
        
        // 添加设置切换事件
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.game.toggleSound();
        });
        
        document.getElementById('music-toggle').addEventListener('change', (e) => {
            this.game.toggleMusic();
        });
    }
    
    /**
     * 切换音乐
     */
    toggleMusic() {
        const enabled = this.game.toggleMusic();
        this.musicControlBtn.textContent = enabled ? '🎵' : '🔇';
    }
    
    /**
     * 切换暂停
     */
    togglePause() {
        if (!this.game.isRunning) return;
        
        if (this.game.isPaused) {
            this.game.resume();
            this.pauseMenuBtn.textContent = '⏸️';
        } else {
            this.game.pause();
            this.pauseMenuBtn.textContent = '▶️';
            this.showPauseMenu();
        }
    }
    
    /**
     * 设置游戏速度
     * @param {string} speed - 速度等级 ('slow', 'medium', 'fast')
     */
    setGameSpeed(speed) {
        // 移除所有速度按钮的活跃状态
        const speedButtons = document.querySelectorAll('.speed-button');
        speedButtons.forEach(btn => btn.classList.remove('active'));
        
        // 设置相应的速度按钮为活跃状态
        const speedBtn = document.getElementById(`speed-${speed}`);
        if (speedBtn) {
            speedBtn.classList.add('active');
        }
        
        // 根据速度等级设置泡泡生成速度
        switch (speed) {
            case 'slow':
                this.game.config.bubbleSpawnRate = 3000; // 慢速：3秒 (原来2秒，降速50%)
                break;
            case 'medium':
                // 根据当前游戏模式设置中速
                if (this.game.currentMode === 'classic') {
                    this.game.config.bubbleSpawnRate = 1500; // 经典模式中速：1.5秒 (原来1秒，降速50%)
                } else if (this.game.currentMode === 'challenge') {
                    this.game.config.bubbleSpawnRate = 1200; // 挑战模式中速：1.2秒 (原来0.8秒，降速50%)
                } else {
                    this.game.config.bubbleSpawnRate = 2250; // 禅模式中速：2.25秒 (原来1.5秒，降速50%)
                }
                break;
            case 'fast':
                this.game.config.bubbleSpawnRate = 500; // 快速：0.5秒
                break;
        }
        
        console.log(`游戏速度设置为: ${speed}, 泡泡生成间隔: ${this.game.config.bubbleSpawnRate}ms`);
    }
    
    /**
     * 显示暂停菜单
     */
    showPauseMenu() {
        this.createModal('游戏暂停', `
            <button id="resume-btn" class="pause-button">继续游戏</button>
            <button id="restart-btn" class="pause-button">重新开始</button>
            <div class="pause-mode-selection">
                <h3>切换模式</h3>
                <div class="mode-buttons">
                    <button id="pause-classic-btn" class="pause-mode-button ${this.game.currentMode === 'classic' ? 'active' : ''}">经典模式</button>
                    <button id="pause-challenge-btn" class="pause-mode-button ${this.game.currentMode === 'challenge' ? 'active' : ''}">挑战模式</button>
                    <button id="pause-zen-btn" class="pause-mode-button ${this.game.currentMode === 'zen' ? 'active' : ''}">禅模式</button>
                </div>
            </div>
            <button id="quit-btn" class="pause-button secondary">退出游戏</button>
        `);
        
        // 添加按钮事件
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.closeModal();
            this.togglePause();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.closeModal();
            this.game.start(this.game.currentMode);
        });
        
        // 添加模式切换按钮事件
        document.getElementById('pause-classic-btn').addEventListener('click', () => {
            this.closeModal();
            this.startGame('classic');
        });
        
        document.getElementById('pause-challenge-btn').addEventListener('click', () => {
            this.closeModal();
            this.startGame('challenge');
        });
        
        document.getElementById('pause-zen-btn').addEventListener('click', () => {
            this.closeModal();
            this.startGame('zen');
        });
        
        document.getElementById('quit-btn').addEventListener('click', () => {
            this.closeModal();
            this.game.stop();
            this.promoBubble.style.display = 'flex';
            this.promoBubble.classList.remove('bubble-pop');
        });
    }
    
    /**
     * 创建模态框
     * @param {string} title - 模态框标题
     * @param {string} content - 模态框内容
     */
    createModal(title, content) {
        // 如果已有模态框，先关闭
        if (this.modalContainer) {
            this.closeModal();
        }
        
        // 创建模态框容器
        this.modalContainer = document.createElement('div');
        this.modalContainer.className = 'modal-container';
        this.modalContainer.style.position = 'fixed';
        this.modalContainer.style.top = '0';
        this.modalContainer.style.left = '0';
        this.modalContainer.style.width = '100%';
        this.modalContainer.style.height = '100%';
        this.modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.modalContainer.style.display = 'flex';
        this.modalContainer.style.justifyContent = 'center';
        this.modalContainer.style.alignItems = 'center';
        this.modalContainer.style.zIndex = '1000';
        this.modalContainer.style.opacity = '0';
        this.modalContainer.style.transition = 'opacity 0.3s ease';
        
        // 创建模态框内容
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.backgroundColor = 'white';
        modalContent.style.borderRadius = '28px';
        modalContent.style.padding = '24px';
        modalContent.style.width = '90%';
        modalContent.style.maxWidth = '500px';
        modalContent.style.maxHeight = '80vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.12), 0 5px 15px rgba(0, 0, 0, 0.08)';
        modalContent.style.transform = 'scale(0.9)';
        modalContent.style.transition = 'transform 0.3s ease';
        
        // 创建模态框头部
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.style.display = 'flex';
        modalHeader.style.justifyContent = 'space-between';
        modalHeader.style.alignItems = 'center';
        modalHeader.style.marginBottom = '18px';
        modalHeader.style.paddingBottom = '12px';
        modalHeader.style.borderBottom = '1px solid rgba(0, 0, 0, 0.05)';
        
        // 创建标题
        const modalTitle = document.createElement('div');
        modalTitle.className = 'modal-title';
        modalTitle.textContent = title;
        modalTitle.style.fontSize = '22px';
        modalTitle.style.fontWeight = '700';
        modalTitle.style.color = '#555';
        
        // 创建关闭按钮
        const closeButton = document.createElement('div');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '26px';
        closeButton.style.color = '#888';
        closeButton.style.transition = 'all 0.3s ease';
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.color = '#555';
            closeButton.style.transform = 'scale(1.1)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.color = '#888';
            closeButton.style.transform = 'scale(1)';
        });
        closeButton.addEventListener('click', () => this.closeModal());
        
        // 添加标题和关闭按钮到头部
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        // 创建内容区域
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.innerHTML = content;
        
        // 组装模态框
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        this.modalContainer.appendChild(modalContent);
        
        // 添加到DOM
        document.body.appendChild(this.modalContainer);
        
        // 触发重排以应用过渡效果
        setTimeout(() => {
            this.modalContainer.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);
        
        // 点击模态框外部关闭
        this.modalContainer.addEventListener('click', (e) => {
            if (e.target === this.modalContainer) {
                this.closeModal();
            }
        });
    }
    
    /**
     * 关闭模态框
     */
    closeModal() {
        if (!this.modalContainer) return;
        
        // 应用关闭动画
        this.modalContainer.style.opacity = '0';
        const modalContent = this.modalContainer.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.9)';
        }
        
        // 动画结束后移除DOM
        setTimeout(() => {
            document.body.removeChild(this.modalContainer);
            this.modalContainer = null;
        }, 300);
    }
    
    /**
     * 显示场景选择器
     */
    showSceneSelector() {
        // 获取所有场景
        const scenes = this.sceneManager.getScenes();
        const currentSceneId = this.sceneManager.currentScene;
        
        // 构建场景选择面板HTML
        let scenesHTML = '<div class="scene-selector-panel">';
        
        // 场景图标映射
        const sceneIcons = {
            'default': '🌈',
            'ocean': '🌊',
            'space': '🌌',
            'forest': '🌲'
        };
        
        // 添加每个场景选项
        scenes.forEach(scene => {
            const isActive = scene.id === currentSceneId ? 'active' : '';
            scenesHTML += `
                <div class="scene-option ${isActive}" data-scene-id="${scene.id}">
                    <div class="scene-option-icon">${sceneIcons[scene.id] || '🌟'}</div>
                    <div class="scene-option-name">${scene.name}</div>
                </div>
            `;
        });
        
        scenesHTML += '</div>';
        
        // 创建模态框
        this.createModal('选择场景', scenesHTML);
        
        // 添加场景选项点击事件
        const sceneOptions = document.querySelectorAll('.scene-option');
        sceneOptions.forEach(option => {
            option.addEventListener('click', () => {
                const sceneId = option.getAttribute('data-scene-id');
                this.sceneManager.switchScene(sceneId);
                
                // 更新选中状态
                sceneOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // 播放切换音效
                this.playSound('audio/chime_02.mp3');
                
                // 关闭模态框
                setTimeout(() => this.closeModal(), 300);
            });
        });
    }
}