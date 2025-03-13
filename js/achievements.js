/**
 * 成就系统
 */

class AchievementManager {
    /**
     * 创建成就管理器实例
     */
    constructor() {
        // 成就列表
        this.achievements = [
            {
                id: 'ACH001',
                title: '泡泡大师',
                description: '单日戳破100个泡泡',
                icon: '🏆',
                unlocked: false,
                condition: (stats) => stats.dailyBubblesPopped >= 100
            },
            {
                id: 'ACH002',
                title: '黄金收集者',
                description: '收集50个金色碎片',
                icon: '🌟',
                unlocked: false,
                condition: (stats) => stats.fragments.golden >= 50
            },
            {
                id: 'ACH003',
                title: '彩虹猎人',
                description: '收集10个彩虹碎片',
                icon: '🌈',
                unlocked: false,
                condition: (stats) => stats.fragments.rainbow >= 10
            },
            {
                id: 'ACH004',
                title: '禅定大师',
                description: '在禅模式中度过10分钟',
                icon: '🧘',
                unlocked: false,
                condition: (stats) => stats.zenModeTime >= 600000 // 10分钟（毫秒）
            },
            {
                id: 'ACH005',
                title: '情绪疗愈者',
                description: '连续3天登录',
                icon: '📝',
                unlocked: false,
                condition: (stats) => stats.loginStreak >= 3
            },
            {
                id: 'ACH006',
                title: '挑战征服者',
                description: '完成5次挑战模式',
                icon: '🏅',
                unlocked: false,
                condition: (stats) => stats.challengesCompleted >= 5
            }
        ];
        
        // 加载已解锁的成就
        this.loadAchievements();
    }
    
    /**
     * 检查成就解锁状态
     * @param {Object} stats - 游戏统计数据
     */
    checkAchievements(stats) {
        let newlyUnlocked = [];
        
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && achievement.condition(stats)) {
                achievement.unlocked = true;
                achievement.unlockDate = new Date().toISOString();
                newlyUnlocked.push(achievement);
            }
        });
        
        // 如果有新解锁的成就，保存并通知
        if (newlyUnlocked.length > 0) {
            this.saveAchievements();
            this.notifyNewAchievements(newlyUnlocked);
        }
        
        return newlyUnlocked;
    }
    
    /**
     * 通知新解锁的成就
     * @param {Array} achievements - 新解锁的成就列表
     */
    notifyNewAchievements(achievements) {
        achievements.forEach(achievement => {
            this.showAchievementNotification(achievement);
        });
    }
    
    /**
     * 显示成就解锁通知
     * @param {Object} achievement - 成就对象
     */
    showAchievementNotification(achievement) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">成就解锁: ${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 播放音效
        Utils.playSound('audio/achievement.mp3', 0.7);
        
        // 动画效果
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 3秒后移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    /**
     * 获取所有成就
     * @returns {Array} 成就列表
     */
    getAchievements() {
        return this.achievements;
    }
    
    /**
     * 获取已解锁的成就数量
     * @returns {number} 已解锁成就数量
     */
    getUnlockedCount() {
        return this.achievements.filter(a => a.unlocked).length;
    }
    
    /**
     * 获取成就完成百分比
     * @returns {number} 完成百分比（0-100）
     */
    getCompletionPercentage() {
        return (this.getUnlockedCount() / this.achievements.length) * 100;
    }
    
    /**
     * 保存成就到本地存储
     */
    saveAchievements() {
        const saveData = this.achievements.map(achievement => ({
            id: achievement.id,
            unlocked: achievement.unlocked,
            unlockDate: achievement.unlockDate
        }));
        
        Utils.saveToLocalStorage('achievements', saveData);
    }
    
    /**
     * 从本地存储加载成就
     */
    loadAchievements() {
        const savedAchievements = Utils.getFromLocalStorage('achievements', []);
        
        if (savedAchievements.length > 0) {
            savedAchievements.forEach(savedAchievement => {
                const achievement = this.achievements.find(a => a.id === savedAchievement.id);
                if (achievement) {
                    achievement.unlocked = savedAchievement.unlocked;
                    achievement.unlockDate = savedAchievement.unlockDate;
                }
            });
        }
    }
    
    /**
     * 重置所有成就（仅用于测试）
     */
    resetAchievements() {
        this.achievements.forEach(achievement => {
            achievement.unlocked = false;
            delete achievement.unlockDate;
        });
        
        this.saveAchievements();
        console.log('所有成就已重置');
    }
}

// 创建全局成就管理器实例
window.achievementManager = new AchievementManager();