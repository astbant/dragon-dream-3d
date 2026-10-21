document.write('<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"><\/script>');
// ============================================
// 🎨 Dragon Dream World - 3D Engine
// ============================================

const Engine3D = {
    scene: null,
    camera: null,
    renderer: null,
    clock: null,
    
    player: null,
    enemies: [],
    islands: [],
    particles: [],
    projectiles: [],
    
    joystick: { x: 0, y: 0, active: false },
    
    // ============================================
    // التهيئة
    // ============================================
    init() {
        const canvas = document.getElementById('game-canvas');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);
        this.scene.background = new THREE.Color(0x0a0a1a);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
        this.camera.position.set(0, 12, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Clock
        this.clock = new THREE.Clock();
        
        // الإضاءة
        this.setupLights();
        
        // الأرض
        this.createGround();
        
        // اللاعب
        this.createPlayer();
        
        // التحكم
        this.setupJoystick();
        
        // resize
        window.addEventListener('resize', () => this.onResize());
        
        // بدء اللعبة
        this.animate();
    },

    // ============================================
    // الإضاءة
    // ============================================
    setupLights() {
        // ضوء محيطي
        const ambient = new THREE.AmbientLight(0x404060, 0.6);
        this.scene.add(ambient);
        
        // ضوء القمر
        const moon = new THREE.DirectionalLight(0xaaccff, 0.8);
        moon.position.set(20, 40, 20);
        moon.castShadow = true;
        moon.shadow.mapSize.width = 2048;
        moon.shadow.mapSize.height = 2048;
        moon.shadow.camera.left = -50;
        moon.shadow.camera.right = 50;
        moon.shadow.camera.top = 50;
        moon.shadow.camera.bottom = -50;
        this.scene.add(moon);
        
        // ضوء دافئ من اللاعب
        const warm = new THREE.PointLight(0xff8844, 1, 20);
        warm.position.set(0, 5, 0);
        this.scene.add(warm);
    },

    // ============================================
    // الأرض (جزيرة عائمة)
    // ============================================
    createGround() {
        // الجزيرة الرئيسية
        const geo = new THREE.CylinderGeometry(15, 12, 3, 32);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            roughness: 0.9,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(geo, mat);
        ground.receiveShadow = true;
        ground.position.y = -1.5;
        this.scene.add(ground);
        
        // حافة الجزيرة
        const edgeGeo = new THREE.CylinderGeometry(15.2, 15, 0.5, 32);
        const edgeMat = new THREE.MeshStandardMaterial({ color: 0x1a3d17, roughness: 1 });
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.position.y = -0.1;
        edge.receiveShadow = true;
        this.scene.add(edge);
        
        // أشجار
        for (let i = 0; i < 8; i++) {
            this.createTree(
                (Math.random() - 0.5) * 22,
                (Math.random() - 0.5) * 22
            );
        }
        
        // صخور
        for (let i = 0; i < 6; i++) {
            this.createRock(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
        }
        
        // كريستالات سحرية
        for (let i = 0; i < 4; i++) {
            this.createCrystal(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
        }
    },

    createTree(x, z) {
        const group = new THREE.Group();
        
        // الجذع
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 2.5, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2c1a, roughness: 1 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.25;
        trunk.castShadow = true;
        group.add(trunk);
        
        // الأوراق
        const leavesGeo = new THREE.ConeGeometry(1.8, 3, 6);
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2d6b1f, roughness: 0.8 });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 3.5;
        leaves.castShadow = true;
        group.add(leaves);
        
        group.position.set(x, 0, z);
        group.scale.setScalar(0.7 + Math.random() * 0.6);
        this.scene.add(group);
    },

    createRock(x, z) {
        const geo = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.8);
        const mat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 1 });
        const rock = new THREE.Mesh(geo, mat);
        rock.position.set(x, 0.3, z);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        this.scene.add(rock);
    },

    createCrystal(x, z) {
        const geo = new THREE.OctahedronGeometry(0.6);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00aaff,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        });
        const crystal = new THREE.Mesh(geo, mat);
        crystal.position.set(x, 0.8, z);
        crystal.castShadow = true;
        crystal.userData.isCrystal = true;
        crystal.userData.baseY = 0.8;
        this.scene.add(crystal);
    },

    // ============================================
    // اللاعب 3D
    // ============================================
    createPlayer() {
        const group = new THREE.Group();
        
        // الجسم
        const bodyGeo = new THREE.CapsuleGeometry(0.5, 1.2, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x3498db,
            roughness: 0.6
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);
        
        // الرأس
        const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xffcc99, roughness: 0.7 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2.4;
        head.castShadow = true;
        group.add(head);
        
        // العيون
        const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-0.15, 2.45, 0.35);
        group.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.15, 2.45, 0.35);
        group.add(eyeR);
        
        // السيف
        const swordGeo = new THREE.BoxGeometry(0.1, 1.5, 0.05);
        const swordMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x4444ff,
            emissiveIntensity: 0.2
        });
        const sword = new THREE.Mesh(swordGeo, swordMat);
        sword.position.set(0.7, 1.5, 0);
        sword.castShadow = true;
        sword.userData.isSword = true;
        group.add(sword);
        
        // مقبض السيف
        const hiltGeo = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const hiltMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const hilt = new THREE.Mesh(hiltGeo, hiltMat);
        hilt.position.set(0.7, 0.8, 0);
        group.add(hilt);
        
        // عباءة
        const capeGeo = new THREE.PlaneGeometry(0.8, 1.5);
        const capeMat = new THREE.MeshStandardMaterial({
            color: 0xe74c3c,
            side: THREE.DoubleSide,
            roughness: 0.8
        });
        const cape = new THREE.Mesh(capeGeo, capeMat);
        cape.position.set(0, 1.3, -0.4);
        cape.castShadow = true;
        group.add(cape);
        
        group.position.set(0, 0, 0);
        this.scene.add(group);
        this.player = group;
        this.player.userData.basePos = new THREE.Vector3(0, 0, 0);
    },

    // ============================================
    // إنشاء عدو 3D
    // ============================================
    spawnEnemy(type = 'wolf') {
        const group = new THREE.Group();
        
        let color = 0x884444;
        let size = 1;
        
        if (type === 'wolf') { color = 0x4a4a4a; size = 1; }
        if (type === 'orc') { color = 0x4a8a4a; size = 1.2; }
        if (type === 'dragon') { color = 0x8a2a2a; size = 1.8; }
        if (type === 'ghost') { color = 0xccccff; size = 1; }
        if (type === 'giant') { color = 0x6a5a4a; size = 2.2; }
        
        // الجسم
        const bodyGeo = new THREE.CapsuleGeometry(0.5 * size, 1 * size, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.2 * size;
        body.castShadow = true;
        group.add(body);
        
        // الرأس
        const headGeo = new THREE.SphereGeometry(0.45 * size, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2.3 * size;
        head.castShadow = true;
        group.add(head);
        
        // عيون حمراء
        const eyeGeo = new THREE.SphereGeometry(0.1 * size, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 2
        });
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-0.15 * size, 2.35 * size, 0.35 * size);
        group.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.15 * size, 2.35 * size, 0.35 * size);
        group.add(eyeR);
        
        // موقع عشوائي
        const angle = Math.random() * Math.PI * 2;
        const dist = 8 + Math.random() * 5;
        group.position.set(
            Math.cos(angle) * dist,
            0,
            Math.sin(angle) * dist
        );
        
        group.userData = {
            type,
            size,
            baseY: 0,
            speed: 0.02 + Math.random() * 0.02
        };
        
        this.scene.add(group);
        this.enemies.push(group);
        return group;
    },

    // ============================================
    // تأثير الجسيمات
    // ============================================
    createParticles(position, color, count = 20) {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];
        
        for (let i = 0; i < count; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;
            
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.3,
                (Math.random() - 0.5) * 0.3
            ));
        }
        
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const mat = new THREE.PointsMaterial({
            color,
            size: 0.2,
            transparent: true,
            opacity: 1
        });
        
        const particles = new THREE.Points(geo, mat);
        particles.userData = { velocities, life: 1 };
        this.scene.add(particles);
        this.particles.push(particles);
    },

    // ============================================
    // تأثير سهم/مقذوف
    // ============================================
    createProjectile(from, to, color = 0xff6600) {
        const geo = new THREE.SphereGeometry(0.2, 8, 8);
        const mat = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 2
        });
        const proj = new THREE.Mesh(geo, mat);
        proj.position.copy(from);
        proj.userData = {
            target: to.clone(),
            speed: 0.4,
            life: 2
        };
        this.scene.add(proj);
        this.projectiles.push(proj);
    },

    // ============================================
    // التحكم بالعصا
    // ============================================
    setupJoystick() {
        const joystick = document.getElementById('joystick');
        const knob = document.getElementById('joystick-knob');
        let touchId = null;
        
        const handleStart = (e) => {
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            touchId = touch.identifier || 'mouse';
            this.joystick.active = true;
        };
        
        const handleMove = (e) => {
            if (!this.joystick.active) return;
            e.preventDefault();
            
            const rect = joystick.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            let touch;
            if (e.touches) {
                touch = Array.from(e.touches).find(t => t.identifier === touchId) || e.touches[0];
            } else {
                touch = e;
            }
            
            let dx = touch.clientX - centerX;
            let dy = touch.clientY - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = rect.width / 2;
            
            if (dist > maxDist) {
                dx = (dx / dist) * maxDist;
                dy = (dy / dist) * maxDist;
            }
            
            knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
            
            this.joystick.x = dx / maxDist;
            this.joystick.y = dy / maxDist;
        };
        
        const handleEnd = (e) => {
            this.joystick.active = false;
            this.joystick.x = 0;
            this.joystick.y = 0;
            touchId = null;
            knob.style.transform = 'translate(-50%, -50%)';
        };
        
        joystick.addEventListener('touchstart', handleStart);
        joystick.addEventListener('touchmove', handleMove);
        joystick.addEventListener('touchend', handleEnd);
        
        joystick.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
    },

    // ============================================
    // تحريك اللاعب
    // ============================================
    movePlayer(dt) {
        if (!this.player) return;
        
        const speed = 6;
        const dx = this.joystick.x * speed * dt;
        const dz = this.joystick.y * speed * dt;
        
        if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
            this.player.position.x += dx;
            this.player.position.z += dz;
            
            // حدود الجزيرة
            const dist = Math.sqrt(
                this.player.position.x ** 2 + 
                this.player.position.z ** 2
            );
            if (dist > 13) {
                const angle = Math.atan2(this.player.position.z, this.player.position.x);
                this.player.position.x = Math.cos(angle) * 13;
                this.player.position.z = Math.sin(angle) * 13;
            }
            
            // تدوير اللاعب
            const targetAngle = Math.atan2(dx, dz);
            this.player.rotation.y = targetAngle;
            
            // حركة طبيعية
            const bounce = Math.sin(this.clock.elapsedTime * 10) * 0.05;
            this.player.position.y = Math.abs(bounce);
        }
        
        // الكاميرا تتبع اللاعب
        const targetCamPos = new THREE.Vector3(
            this.player.position.x,
            12,
            this.player.position.z + 15
        );
        this.camera.position.lerp(targetCamPos, 0.1);
        this.camera.lookAt(this.player.position.x, 1, this.player.position.z);
    },

    // ============================================
    // تحديث الأعداء
    // ============================================
    updateEnemies(dt) {
        this.enemies.forEach(enemy => {
            // دوران
            enemy.rotation.y += dt * 0.5;
            
            // حركة عمودية
            enemy.position.y = Math.sin(this.clock.elapsedTime * 2 + enemy.position.x) * 0.1;
            
            // اقتراب من اللاعب (اختياري)
            if (this.player && enemy.userData.type !== 'ghost') {
                const dx = this.player.position.x - enemy.position.x;
                const dz = this.player.position.z - enemy.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist > 3 && dist < 15) {
                    enemy.position.x += (dx / dist) * enemy.userData.speed;
                    enemy.position.z += (dz / dist) * enemy.userData.speed;
                }
            }
        });
    },

    // ============================================
    // تحديث الجسيمات
    // ============================================
    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const pos = p.geometry.attributes.position.array;
            
            for (let j = 0; j < p.userData.velocities.length; j++) {
                pos[j * 3] += p.userData.velocities[j].x;
                pos[j * 3 + 1] += p.userData.velocities[j].y;
                pos[j * 3 + 2] += p.userData.velocities[j].z;
                p.userData.velocities[j].y -= 0.01;
            }
            
            p.geometry.attributes.position.needsUpdate = true;
            p.userData.life -= dt * 1.5;
            p.material.opacity = Math.max(0, p.userData.life);
            
            if (p.userData.life <= 0) {
                this.scene.remove(p);
                p.geometry.dispose();
                p.material.dispose();
                this.particles.splice(i, 1);
            }
        }
    },

    // ============================================
    // تحديث المقذوفات
    // ============================================
    updateProjectiles(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const dir = p.userData.target.clone().sub(p.position).normalize();
            p.position.add(dir.multiplyScalar(p.userData.speed));
            
            if (p.position.distanceTo(p.userData.target) < 0.5) {
                this.createParticles(p.position, 0xff6600, 15);
                this.scene.remove(p);
                p.geometry.dispose();
                p.material.dispose();
                this.projectiles.splice(i, 1);
            }
        }
    },

    // ============================================
    // تحديث الكريستالات
    // ============================================
    updateCrystals() {
        this.scene.children.forEach(obj => {
            if (obj.userData.isCrystal) {
                obj.rotation.y += 0.02;
                obj.position.y = obj.userData.baseY + Math.sin(this.clock.elapsedTime * 2 + obj.position.x) * 0.2;
            }
        });
    },

    // ============================================
    // تأثير الهجوم
    // ============================================
    attackAnimation() {
