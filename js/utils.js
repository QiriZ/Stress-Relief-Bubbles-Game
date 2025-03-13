/**
 * 工具函数集合
 */

const Utils = {
    /**
     * 生成指定范围内的随机整数
     * @param {number} min - 最小值（包含）
     * @param {number} max - 最大值（包含）
     * @returns {number} 随机整数
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * 生成指定范围内的随机浮点数
     * @param {number} min - 最小值（包含）
     * @param {number} max - 最大值（包含）
     * @returns {number} 随机浮点数
     */
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * 检查两个圆是否重叠
     * @param {Object} circle1 - 第一个圆 {x, y, radius}
     * @param {Object} circle2 - 第二个圆 {x, y, radius}
     * @returns {boolean} 是否重叠
     */
    circlesOverlap: function(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (circle1.radius + circle2.radius);
    },
    
    /**
     * 检查点是否在圆内
     * @param {number} x - 点的x坐标
     * @param {number} y - 点的y坐标
     * @param {Object} circle - 圆 {x, y, radius}
     * @returns {boolean} 点是否在圆内
     */
    pointInCircle: function(x, y, circle) {
        const dx = x - circle.x;
        const dy = y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= circle.radius;
    },
    
    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId: function() {
        return '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * 从数组中随机选择一个元素
     * @param {Array} array - 数组
     * @returns {*} 随机选择的元素
     */
    randomChoice: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    /**
     * 将角度转换为弧度
     * @param {number} degrees - 角度
     * @returns {number} 弧度
     */
    degreesToRadians: function(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    /**
     * 将弧度转换为角度
     * @param {number} radians - 弧度
     * @returns {number} 角度
     */
    radiansToDegrees: function(radians) {
        return radians * (180 / Math.PI);
    },
    
    /**
     * 限制值在指定范围内
     * @param {number} value - 要限制的值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 限制后的值
     */
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * 检查设备是否为移动设备
     * @returns {boolean} 是否为移动设备
     */
    isMobileDevice: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * 保存数据到本地存储
     * @param {string} key - 键
     * @param {*} value - 值
     */
    saveToLocalStorage: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('保存到本地存储失败:', e);
        }
    },
    
    /**
     * 从本地存储获取数据
     * @param {string} key - 键
     * @param {*} defaultValue - 默认值
     * @returns {*} 获取的值或默认值
     */
    getFromLocalStorage: function(key, defaultValue) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('从本地存储获取数据失败:', e);
            return defaultValue;
        }
    },
    
    /**
     * 创建并播放音效
     * @param {string} src - 音效文件路径
     * @param {number} volume - 音量 (0-1)
     */
    playSound: function(src, volume = 1.0) {
        const sound = new Audio(src);
        sound.volume = volume;
        sound.play().catch(e => console.error('播放音效失败:', e));
    },
    
    /**
     * 创建粒子效果
     * @param {number} x - 粒子起始x坐标
     * @param {number} y - 粒子起始y坐标
     * @param {number} count - 粒子数量
     * @param {string} color - 粒子颜色
     * @param {HTMLElement} container - 容器元素
     */
    createParticles: function(x, y, count, color, container) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'bubble-particle';
            particle.style.backgroundColor = color || 'rgba(255, 255, 255, 0.8)';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // 随机速度和方向
            const speed = this.randomFloat(1, 5);
            const angle = this.randomFloat(0, Math.PI * 2);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            container.appendChild(particle);
            
            // 粒子动画
            let posX = x;
            let posY = y;
            let opacity = 1;
            let scale = this.randomFloat(0.5, 1.5);
            
            const animate = () => {
                if (opacity <= 0) {
                    container.removeChild(particle);
                    return;
                }
                
                posX += vx;
                posY += vy + 0.1; // 添加重力
                opacity -= 0.02;
                scale -= 0.01;
                
                particle.style.left = `${posX}px`;
                particle.style.top = `${posY}px`;
                particle.style.opacity = opacity;
                particle.style.transform = `scale(${scale})`;
                
                requestAnimationFrame(animate);
            };
            
            requestAnimationFrame(animate);
        }
    }
};