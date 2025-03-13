/**
 * 泡泡类
 */

class Bubble {
    /**
     * 创建一个泡泡实例
     * @param {Object} options - 泡泡配置选项
     * @param {string} options.id - 泡泡ID
     * @param {number} options.size - 泡泡大小（直径，像素）
     * @param {number} options.layer - 泡泡层级（1-5）
     * @param {string} options.type - 泡泡类型（normal, golden, rainbow）
     * @param {Object} options.position - 泡泡位置 {x, y}
     * @param {HTMLElement} options.container - 泡泡容器元素
     * @param {Function} options.onPop - 泡泡被戳破时的回调函数
     */
    constructor(options) {
        this.id = options.id || Utils.generateId();
        this.size = options.size || Utils.randomInt(30, 150);
        this.layer = options.layer || Utils.randomInt(1, 3);
        this.type = options.type || 'normal';
        this.position = options.position || { x: 0, y: 0 };
        this.container = options.container;
        this.onPop = options.onPop || function() {};
        this.element = null;
        this.popped = false;
        this.velocity = {
            x: Utils.randomFloat(-0.5, 0.5),
            y: Utils.randomFloat(-0.5, 0.5)
        };
        
        this.create();
    }
    
    /**
     * 创建泡泡DOM元素
     */
    create() {
        this.element = document.createElement('div');
        this.element.className = 'bubble';
        this.element.id = this.id;
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
        this.element.style.zIndex = this.layer;
        
        // 根据泡泡类型设置样式
        if (this.type === 'golden') {
            this.element.classList.add('golden-bubble');
        } else if (this.type === 'rainbow') {
            // 为彩虹泡泡随机选择一种固定颜色
            const rainbowColors = [
                'rainbow-pink', 'rainbow-peach', 'rainbow-blue', 'rainbow-skyblue',
                'rainbow-teal', 'rainbow-green', 'rainbow-yellow', 'rainbow-violet',
                'rainbow-lightpink', 'rainbow-lightblue'
            ];
            const randomColor = Utils.randomChoice(rainbowColors);
            this.element.classList.add(randomColor);
        }
        
        // 随机动画延迟，使泡泡浮动不同步
        this.element.style.animationDelay = `${Utils.randomFloat(0, 2)}s`;
        
        // 添加点击事件
        this.element.addEventListener('click', this.pop.bind(this));
        
        // 添加触摸事件（移动端）
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 防止触发鼠标事件
            this.pop();
        });
        
        // 将泡泡添加到容器
        this.container.appendChild(this.element);
    }
    
    /**
     * 更新泡泡位置
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    update(deltaTime) {
        if (this.popped) return;
        
        // 更新位置
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // 边界检查
        const containerRect = this.container.getBoundingClientRect();
        const radius = this.size / 2;
        
        if (this.position.x - radius < 0) {
            this.position.x = radius;
            this.velocity.x *= -0.8; // 反弹并减少速度
        } else if (this.position.x + radius > containerRect.width) {
            this.position.x = containerRect.width - radius;
            this.velocity.x *= -0.8;
        }
        
        if (this.position.y - radius < 0) {
            this.position.y = radius;
            this.velocity.y *= -0.8;
        } else if (this.position.y + radius > containerRect.height) {
            this.position.y = containerRect.height - radius;
            this.velocity.y *= -0.8;
        }
        
        // 更新DOM元素位置
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
    }
    
    /**
     * 戳破泡泡
     */
    pop() {
        if (this.popped) return;
        
        this.popped = true;
        
        // 添加爆炸动画类
        // 根据泡泡类型选择不同的爆炸动画
        if (this.type === 'normal') {
            this.element.classList.add('bubble-pop');
        } else if (this.type === 'golden') {
            this.element.classList.add('bubble-pop-golden');
        } else if (this.type === 'rainbow') {
            const popEffects = ['bubble-pop-rainbow', 'bubble-pop-explode', 'bubble-pop-spiral', 'bubble-pop-shatter'];
            this.element.classList.add(Utils.randomChoice(popEffects));
        }
        
        // 播放音效
        let soundFile = 'audio/pop_01.mp3';
        if (this.type === 'golden') {
            soundFile = 'audio/chime_02.mp3';
        } else if (this.type === 'rainbow') {
            soundFile = 'audio/magic_01.mp3';
        }
        Utils.playSound(soundFile, 0.5);
        
        // 创建粒子效果
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let particleColor = 'rgba(255, 255, 255, 0.8)';
        if (this.type === 'golden') {
            particleColor = 'rgba(255, 215, 0, 0.8)';
        } else if (this.type === 'rainbow') {
            // 彩虹泡泡使用随机颜色的粒子
            const colors = [
                'rgba(255, 154, 158, 0.8)', // 粉红
                'rgba(250, 208, 196, 0.8)', // 桃色
                'rgba(161, 196, 253, 0.8)', // 淡蓝
                'rgba(194, 233, 251, 0.8)', // 天蓝
                'rgba(175, 238, 238, 0.8)', // 蓝绿
                'rgba(152, 251, 152, 0.8)', // 淡绿
                'rgba(255, 236, 179, 0.8)', // 淡黄
                'rgba(238, 130, 238, 0.8)', // 紫罗兰
                'rgba(255, 182, 193, 0.8)', // 浅粉
                'rgba(135, 206, 250, 0.8)'  // 淡天蓝
            ];
            // 随机选择颜色或使用多彩效果
            if (Math.random() < 0.3) {
                // 30%几率使用多彩粒子
                particleColor = 'multi';
            } else {
                particleColor = Utils.randomChoice(colors);
            }
        }
        
        // 根据泡泡类型创建不同数量和效果的粒子
        let particleCount = 15;
        
        if (this.type === 'golden') {
            particleCount = 20;
        } else if (this.type === 'rainbow') {
            particleCount = 25;
        }
        
        Utils.createParticles(centerX, centerY, particleCount, particleColor, document.body);
        
        // 调用回调函数
        this.onPop({
            id: this.id,
            type: this.type,
            size: this.size,
            position: this.position
        });
        
        // 300毫秒后移除元素
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, 300);
    }
    
    /**
     * 移除泡泡（不触发爆炸效果）
     */
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.popped = true;
    }
    
    /**
     * 获取泡泡的碰撞圆形
     * @returns {Object} 圆形 {x, y, radius}
     */
    getCollisionCircle() {
        return {
            x: this.position.x,
            y: this.position.y,
            radius: this.size / 2
        };
    }
}

/**
 * 泡泡工厂类 - 负责创建和管理泡泡
 */
class BubbleFactory {
    /**
     * 创建泡泡工厂实例
     * @param {HTMLElement} container - 泡泡容器元素
     */
    constructor(container) {
        this.container = container;
        this.bubbles = new Map(); // 存储所有活跃的泡泡
        this.bubbleTypes = ['normal', 'golden', 'rainbow'];
        this.typeWeights = { normal: 0.8, golden: 0.15, rainbow: 0.05 };
    }
    
    /**
     * 创建一个新泡泡
     * @param {Object} options - 泡泡配置选项（可选）
     * @returns {Bubble} 创建的泡泡实例
     */
    createBubble(options = {}) {
        const containerRect = this.container.getBoundingClientRect();
        
        // 随机选择泡泡类型（基于权重）
        const type = options.type || this.getRandomType();
        
        // 随机大小（根据类型调整）
        let size = options.size;
        if (!size) {
            if (type === 'golden') {
                size = Utils.randomInt(50, 100); // 金色泡泡稍大
            } else if (type === 'rainbow') {
                size = Utils.randomInt(70, 120); // 彩虹泡泡更大
            } else {
                size = Utils.randomInt(30, 150); // 普通泡泡大小范围广
            }
        }
        
        // 随机位置（避免重叠）
        let position = options.position;
        if (!position) {
            const radius = size / 2;
            const margin = 20; // 边缘安全距离
            
            // 尝试10次找到不重叠的位置
            let attempts = 0;
            let validPosition = false;
            
            while (!validPosition && attempts < 10) {
                position = {
                    x: Utils.randomInt(radius + margin, containerRect.width - radius - margin),
                    y: Utils.randomInt(radius + margin, containerRect.height - radius - margin)
                };
                
                validPosition = true;
                
                // 检查与现有泡泡的重叠
                for (const bubble of this.bubbles.values()) {
                    if (Utils.circlesOverlap(
                        { x: position.x, y: position.y, radius: radius + 10 }, // 添加10px容差
                        bubble.getCollisionCircle()
                    )) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            // 如果找不到不重叠的位置，就使用最后一次尝试的位置
            if (!validPosition) {
                console.log('无法找到不重叠的位置，使用最后尝试的位置');
            }
        }
        
        // 创建泡泡
        const bubble = new Bubble({
            id: options.id,
            size: size,
            layer: options.layer || Utils.randomInt(1, 3),
            type: type,
            position: position,
            container: this.container,
            onPop: (bubbleInfo) => {
                // 从管理列表中移除
                this.bubbles.delete(bubbleInfo.id);
                
                // 调用外部回调（如果有）
                if (options.onPop) {
                    options.onPop(bubbleInfo);
                }
            }
        });
        
        // 添加到管理列表
        this.bubbles.set(bubble.id, bubble);
        
        return bubble;
    }
    
    /**
     * 根据权重随机选择泡泡类型
     * @returns {string} 泡泡类型
     */
    getRandomType() {
        const rand = Math.random();
        let cumulativeWeight = 0;
        
        for (const type of this.bubbleTypes) {
            cumulativeWeight += this.typeWeights[type];
            if (rand < cumulativeWeight) {
                return type;
            }
        }
        
        return 'normal'; // 默认类型
    }
    
    /**
     * 更新所有泡泡
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    updateBubbles(deltaTime) {
        for (const bubble of this.bubbles.values()) {
            bubble.update(deltaTime);
        }
    }
    
    /**
     * 移除所有泡泡
     */
    removeAllBubbles() {
        for (const bubble of this.bubbles.values()) {
            bubble.remove();
        }
        this.bubbles.clear();
    }
    
    /**
     * 获取当前活跃泡泡数量
     * @returns {number} 泡泡数量
     */
    getBubbleCount() {
        return this.bubbles.size;
    }
    
    /**
     * 设置泡泡类型的生成权重
     * @param {Object} weights - 权重对象 {normal: 0.8, golden: 0.15, rainbow: 0.05}
     */
    setTypeWeights(weights) {
        this.typeWeights = { ...this.typeWeights, ...weights };
    }
}