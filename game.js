// ============================================
// 🎮 Dragon Dream World - Game Logic
// ============================================

const Game = {
    player: {
        name: 'البطل',
        race: null,
        level: 1,
        stars: 1,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        xp: 0,
        maxXp: 100,
        gold: 100,
        attack: 10,
        defense: 5,
        skills: [],
        equippedSkills: [],
        inventory: [],
        licenses: [],
        islandLevel: 1,
        islandStars: 1
    },

    combat: {
        enemy: null,
        inCombat: false
    },

    skillDB: {
        fireball: { name: 'كرة نار', icon: '🔥', type: 'ranged', pve: 40, pvp: 25, mp: 15, cd: 3, color: 0xff6600, desc: 'ضرر ناري من بعيد' },
        slash: { name: 'ضربة سيف', icon: '⚔️', type: 'direct', pve: 30, pvp: 18, mp: 8, cd: 2, color: 0xcccccc, desc: 'ضربة مباشرة' },
        heal: { name: 'شفاء', icon: '💚', type: 'healing', pve: 50, pvp: 30, mp: 20, cd: 5, color: 0x2ecc71, desc: 'استعادة HP' },
        iceball: { name: 'كرة جليد', icon: '❄️', type: 'ranged', pve: 35, pvp: 22, mp: 12, cd: 3, color: 0x00ccff, desc: 'ضرر جليدي' },
        lightning: { name: 'صاعقة', icon: '⚡', type: 'burst', pve: 60, pvp: 30, mp: 25, cd: 6, color: 0xffff00, desc: 'ضرر برقي' },
        freeze: { name: 'تجميد', icon: '🧊', type: 'control', pve: 0, pvp: 0, mp: 30, cd: 8, color: 0x00ffff, desc: 'شلل' },
        aoe: { name: 'عاصفة', icon: '🌀', type: 'aoe', pve: 45, pvp: 22, mp: 30, cd: 5, color: 0x9900ff, desc: 'ضرر جماعي' },
        shield: { name: 'درع', icon: '🛡️', type: 'defensive', pve: 0, pvp: 0, mp: 15, cd: 10, color: 0xffcc00, desc: 'درع' }
    },

    // ============================================
    // التهيئة
    // ============================================
    init() {
        // محاكاة تحميل
        let progress = 0;
        const loadingFill = document.getElementById('loading-fill');
        const loadingText = document.getElementById('loading-text');
        const messages = [
            'جاري إنشاء العالم...',
            'تحميل الجزر...',
            'إعداد التنانين...',
            'تحضير الشخصيات...',
            'جاري البدء...'
        ];
        
        const interval = setInterval(() => {
            progress += 5;
            loadingFill.style.width = progress + '%';
            loadingText.textContent = messages[Math.min(Math.floor(progress / 20), messages.length - 1)];
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => this.showScreen('screen-start'), 300);
            }
        }, 80);
    },

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },

    showRaceSelect() {
        this.showScreen('screen-race');
    },

    // ============================================
    // اختيار العرق
    // ============================================
    selectRace(race) {
        this.player.race = race;
        const bonuses = {
            human: { hp: 100, mp: 50, atk: 10, def: 5, icon: '👤', name: 'البشري' },
            elf: { hp: 80, mp: 70, atk: 12, def: 3, icon: '🧝', name: 'الجان' },
            dwarf: { hp: 130, mp: 30, atk: 8, def: 10, icon: '🧔', name: 'القزم' },
            orc: { hp: 110, mp: 20, atk: 15, def: 4, icon: '👹', name: 'الغول' }
        };
        
        const b = bonuses[race];
        this.player.maxHp = b.hp;
        this.player.hp = b.hp;
        this.player.maxMp = b.mp;
        this.player.mp = b.mp;
        this.player.attack = b.atk;
        this.player.defense = b.def;
        this.player.skills = ['slash', 'heal', 'fireball', 'iceball'];
        this.player.equippedSkills = ['slash', 'heal', 'fireball', 'iceball'];
        
        document.getElementById('hud-race').textContent = b.icon;
        
        // بدء المحرك 3D
        this.showScreen('screen-game');
        setTimeout(() => {
            Engine3D.init();
            Engine3D.changeIsland(1);
            Engine3D.spawnEnemy('wolf');
            Engine3D.spawnEnemy('orc');
            this.updateUI();
            this.toast(`مرحباً ${b.name}! استخدم العصا للحركة`, 'success');
        }, 100);
    },

    // ============================================
    // تحديث الواجهة
    // ============================================
    updateUI() {
        const p = this.player;
        
        document.getElementById('hud-gold').textContent = p.gold;
        document.getElementById('hud-level').textContent = `مستوى ${p.level} ${'⭐'.repeat(p.stars)}`;
        document.getElementById('hud-name').textContent = p.name;
        
        document.getElementById('hud-hp').style.width = (p.hp / p.maxHp * 100) + '%';
        document.getElementById('hud-hp-text').textContent = `${Math.floor(p.hp)}/${p.maxHp}`;
        
        document.getElementById('hud-mp').style.width = (p.mp / p.maxMp * 100) + '%';
        document.getElementById('hud-mp-text').textContent = `${Math.floor(p.mp)}/${p.maxMp}`;
        
        document.getElementById('hud-xp').style.width = (p.xp / p.maxXp * 100) + '%';
        document.getElementById('hud-xp-text').textContent = `${p.xp}/${p.maxXp}`;
        
        document.getElementById('hud-island').textContent = `🏝️ الجزيرة ${p.islandLevel}`;
        document.getElementById('hud-stars').textContent = '⭐'.repeat(p.islandStars);
    },

    addLog(msg, type = 'info') {
        const log = document.getElementById('combat-log');
        log.classList.add('show');
        const entry = document.createElement('div');
        entry.className = `log-${type}`;
        entry.textContent = msg;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        
        // حذف القديم
        while (log.children.length > 8) {
            log.removeChild(log.firstChild);
        }
    },

    // ============================================
    // الهجوم
    // ============================================
    attack() {
        const enemies = Engine3D.enemies;
        if (enemies.length === 0) {
            this.toast('لا يوجد أعداء!', 'error');
            return;
        }
        
        // أقرب عدو
        let closest = enemies[0];
        let minDist = Infinity;
        if (Engine3D.player) {
            enemies.forEach(e => {
                const d = e.position.distanceTo(Engine3D.player.position);
                if (d < minDist) { minDist = d; closest = e; }
            });
        }
        
        // ضرر
        const isCrit = Math.random() < 0.1;
        let damage = this.player.attack + Math.floor(Math.random() * 5);
        if (isCrit) damage = Math.floor(damage * 2);
        
        // تأثير
        Engine3D.attackAnimation();
        Engine3D.createParticles(
            closest.position.clone().setY(1.5),
            isCrit ? 0xff0000 : 0xffaa00,
            isCrit ? 30 : 15
        );
        
        this.addLog(`${isCrit ? '⚡ حرجة! ' : ''}${damage} ضرر`, isCrit ? 'crit' : 'player');
        
        // إزالة العدو إذا مات
        if (damage >= 30) {
            Engine3D.removeEnemy(closest);
            this.onEnemyKilled();
        }
        
        this.updateUI();
    },

    // ============================================
    // استخدام مهارة
    // ============================================
    useSkill() {
        if (Engine3D.enemies.length === 0) {
            this.toast('لا يوجد أعداء!', 'error');
            return;
        }
        
        const attackSkills = this.player.equippedSkills.filter(s => 
            !['healing', 'defensive'].includes(this.skillDB[s].type)
        );
        
        if (attackSkills.length === 0) {
            this.toast('لا توجد مهارات هجومية!', 'error');
            return;
        }
        
        const skillId = attackSkills[0];
        const skill = this.skillDB[skillId];
        
        if (this.player.mp < skill.mp) {
            this.toast('مانا غير كافية!', 'error');
            return;
        }
        
        this.player.mp -= skill.mp;
        
        // تأثير بصري
        const target = Engine3D.enemies[0];
        const from = Engine3D.player.position.clone().setY(1.5);
        const to = target.position.clone().setY(1.5);
        
        Engine3D.createProjectile(from, to, skill.color);
        
        const damage = skill.pve + Math.floor(this.player.level * 2);
        this.addLog(`${skill.icon} ${skill.name}: ${damage} ضرر`, 'player');
        
        setTimeout(() => {
            if (damage >= 30) {
                Engine3D.removeEnemy(target);
                this.onEnemyKilled();
            }
            this.updateUI();
        }, 400);
        
        this.updateUI();
    },

    // ============================================
    // الشفاء
    // ============================================
    useHeal() {
        if (this.player.mp < 20) {
            this.toast('مانا غير كافية!', 'error');
            return;
        }
        
        this.player.mp -= 20;
        const healAmount = 30 + Math.floor(this.player.level * 3);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
        
        // تأثير بصري
        if (Engine3D.player) {
            Engine3D.createParticles(
                Engine3D.player.position.clone().setY(1.5),
                0x2ecc71,
                25
            );
        }
        
        this.addLog(`💚 +${healAmount} HP`, 'player');
        this.toast(`+${healAmount} HP`, 'success');
        this.updateUI();
    },

    // ============================================
    // عند قتل عدو
    // ============================================
    onEnemyKilled() {
        const xp = 20 + this.player.level * 5;
        const gold = 15 + this.player.level * 3;
        
        this.player.xp += xp;
        this.player.gold += gold;
        
        this.addLog(`🏆 +${xp} XP +${gold} ذهب`, 'info');
        
        // ترقية
        while (this.player.xp >= this.player.maxXp) {
            this.player.xp -= this.player.maxXp;
            this.player.level++;
            this.player.maxHp += 20;
            this.player.hp = this.player.maxHp;
            this.player.maxMp += 10;
            this.player.mp = this.player.maxMp;
            this.player.attack += 3;
            this.player.defense += 2;
            this.player.maxXp = Math.floor(this.player.maxXp * 1.5);
            
            this.addLog(`🎉 المستوى ${this.player.level}!`, 'info');
            this.toast(`🎉 المستوى ${this.player.level}!`, 'success');
            
            // الجزيرة الجديدة كل 5 مستويات
            if (this.player.level % 5 === 0) {
                this.player.islandLevel++;
                this.player.islandStars = Math.min(5, Math.floor(this.player.level / 10) + 1);
                Engine3D.changeIsland(this.player.islandLevel);
                this.toast(`🏝️ جزيرة جديدة! المستوى ${this.player.islandLevel}`, 'info');
            }
        }
        
        // سقوط عشوائي
        if (Math.random() < 0.1) {
            const skills = Object.keys(this.skillDB);
            const newSkill = skills[Math.floor(Math.random() * skills.length)];
            if (!this.player.skills.includes(newSkill)) {
                this.player.skills.push(newSkill);
                this.toast(`✨ مهارة جديدة: ${this.skillDB[newSkill].name}`, 'success');
            }
        }
        
        // إعادة توليد عدو
        setTimeout(() => {
            const types = ['wolf', 'orc', 'dragon', 'ghost', 'giant'];
            const type = types[Math.min(Math.floor(Math.random() * types.length), Math.floor(this.player.islandLevel / 2))];
            Engine3D.spawnEnemy(type);
        }, 3000);
        
        this.updateUI();
    },

    // ============================================
    // اللوحات
    // ============================================
    openPanel(type) {
        const panel = document.getElementById('panel');
        const title = document.getElementById('panel-title');
        const content = document.getElementById('panel-content');
        
        panel.classList.remove('hidden');
        
        if (type === 'skills') {
            title.textContent = '✨ المهارات';
            content.innerHTML = '';
            
            this.player.skills.forEach(skillId => {
                const skill = this.skillDB[skillId];
                const equipped = this.player.equippedSkills.includes(skillId);
                
                const div = document.createElement('div');
                div.className = `list-item ${equipped ? 'equipped' : ''}`;
                div.innerHTML = `
                    <div class="item-header">
                        <span class="item-name">${skill.icon} ${skill.name}</span>
                        <span class="item-stars">${equipped ? '✅' : ''}</span>
                    </div>
                    <div class="item-desc">${skill.desc}</div>
                    <div class="item-stats">
                        <span>PvE: ${skill.pve}</span>
                        <span>PvP: ${skill.pvp}</span>
                        <span>MP: ${skill.mp}</span>
                        <span>CD: ${skill.cd}ث</span>
                    </div>
                `;
                div.onclick = () => this.toggleSkill(skillId);
                content.appendChild(div);
            });
        }
        
        else if (type === 'craft') {
            title.textContent = '🔨 التصنيع';
            const items = [
                { name: 'سيف حديدي', icon: '⚔️', cost: 50, stars: 1, atk: 5 },
                { name: 'درع جلدي', icon: '🛡️', cost: 40, stars: 1, def: 3 },
                { name: 'جرعة شفاء', icon: '🧪', cost: 20, stars: 1, heal: 30 },
                { name: 'سيف فولاذي', icon: '⚔️', cost: 150, stars: 2, atk: 12 },
                { name: 'درع فولاذي', icon: '🛡️', cost: 120, stars: 2, def: 8 }
            ];
            
            content.innerHTML = '';
            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `
                    <div class="item-header">
                        <span class="item-name">${item.icon} ${item.name}</span>
                        <span class="item-stars">${'⭐'.repeat(item.stars)}</span>
                    </div>
                    <div class="item-desc">التكلفة: ${item.cost} ذهب</div>
                    <div class="item-stats">
                        ${item.atk ? `<span>+${item.atk} هجوم</span>` : ''}
                        ${item.def ? `<span>+${item.def} دفاع</span>` : ''}
                        ${item.heal ? `<span>+${item.heal} شفاء</span>` : ''}
                    </div>
                `;
                div.onclick = () => this.craftItem(item);
                content.appendChild(div);
            });
        }
        
        else if (type === 'inventory') {
            title.textContent = '🎒 الحقيبة';
            if (this.player.inventory.length === 0) {
                content.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">فارغة</p>';
            } else {
                content.innerHTML = this.player.inventory.map(item => `
                    <div class="list-item">
                        <div class="item-header">
                            <span class="item-name">${item.icon} ${item.name}</span>
                            <span class="item-stars">${'⭐'.repeat(item.stars || 1)}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        else if (type === 'licenses') {
            title.textContent = '📜 العقود';
            content.innerHTML = `
                <div class="list-item">
                    <div class="item-header">
                        <span class="item-name">📜 عقد سيف مستوى ${this.player.islandLevel}</span>
                        <span class="item-stars">⭐⭐</span>
                    </div>
                    <div class="item-desc">تملك حق صنع سيوف مستوى ${this.player.islandLevel} ⭐⭐</div>
                    <div class="item-stats">
                        <span>النسخ: 5</span>
                        <span>الربح: 500 ذهب</span>
                    </div>
                </div>
            `;
        }
        
        else if (type === 'market') {
            title.textContent = '🏪 السوق';
            const items = [
                { name: 'سيف نادر', icon: '⚔️', stars: 3, price: 500, atk: 20 },
                { name: 'درع أسطوري', icon: '🛡️', stars: 5, price: 5000, def: 50 },
                { name: 'جرعة كبيرة', icon: '🧪', stars: 2, price: 100, heal: 100 }
            ];
            
            content.innerHTML = '';
            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `
                    <div class="item-header">
                        <span class="item-name">${item.icon} ${item.name}</span>
                        <span class="item-stars">${'⭐'.repeat(item.stars)}</span>
                    </div>
                    <div class="item-desc">السعر: ${item.price} ذهب</div>
                `;
                div.onclick = () => {
                    if (this.player.gold >= item.price) {
                        this.player.gold -= item.price;
                        this.player.inventory.push(item);
                        if (item.atk) this.player.attack += item.atk;
                        if (item.def) this.player.defense += item.def;
                        this.toast(`✅ اشتريت ${item.name}!`, 'success');
                        this.updateUI();
                        this.closePanel();
                    } else {
                        this.toast('ذهب غير كافٍ!', 'error');
                    }
                };
                content.appendChild(div);
            });
        }
        
        else if (type === 'islands') {
            title.textContent = '🏝️ الجزر';
            content.innerHTML = '';
            
            for (let i = 1; i <= Math.min(this.player.islandLevel + 2, 120); i++) {
                const stars = Math.min(5, Math.floor(i / 10) + 1);
                const unlocked = i <= this.player.islandLevel;
                
                const div = document.createElement('div');
                div.className = 'list-item';
                div.style.opacity = unlocked ? '1' : '0.4';
                div.innerHTML = `
                    <div class="item-header">
                        <span class="item-name">🏝️ الجزيرة ${i}</span>
                        <span class="item-stars">${'⭐'.repeat(stars)}</span>
                    </div>
                    <div class="item-desc">${unlocked ? 'مفتوحة' : `تحتاج مستوى ${(i - 1) * 5}`}</div>
                `;
                if (unlocked) {
                    div.onclick = () => {
                        this.player.islandLevel = i;
                        this.player.islandStars = stars;
                        Engine3D.changeIsland(i);
                        this.updateUI();
                        this.closePanel();
                        this.toast(`🏝️ انتقلت للجزيرة ${i}`, 'success');
                    };
                }
                content.appendChild(div);
            }
        }
    },

    toggleSkill(skillId) {
        const idx = this.player.equippedSkills.indexOf(skillId);
        if (idx >= 0) {
            this.player.equippedSkills.splice(idx, 1);
        } else {
            if (this.player.equippedSkills.length >= 4) {
                this.toast('الحد الأقصى 4!', 'error');
                return;
            }
            this.player.equippedSkills.push(skillId);
        }
        this.openPanel('skills');
    },

    craftItem(item) {
        if (this.player.gold < item.cost) {
            this.toast('ذهب