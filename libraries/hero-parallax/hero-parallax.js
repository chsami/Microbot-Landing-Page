(function () {
    var IMAGE_SRC = 'images/general/header-background-4k.jpg';
    var MAP_SRC = 'images/general/header-background-depth.png';
    var IMAGE_ASPECT = 1584 / 746;
    var FOCUS = 0.45;
    var SHIFT = [0.03, 0.022];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var VERT = [
        'attribute vec2 aPos;',
        'void main() { gl_Position = vec4(aPos, 0.0, 1.0); }'
    ].join('\n');

    var FRAG = [
        'precision highp float;',
        'uniform sampler2D uImg;',
        'uniform sampler2D uMap;',
        'uniform vec2 uView;',
        'uniform float uDpr;',
        'uniform float uImgLeft;',
        'uniform float uImgW;',
        'uniform vec2 uPointer;',
        'uniform vec2 uLightPos;',
        'uniform float uLight;',
        'uniform float uZoom;',
        'uniform float uDolly;',
        'uniform float uScroll;',
        'uniform float uTime;',
        'uniform float uFx;',
        'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
        'float noise(vec2 p) {',
        '    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);',
        '    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);',
        '}',
        'vec2 project(vec2 uv0, float d) {',
        '    vec2 c = vec2(0.42, 0.38);',
        '    vec2 uv = c + (uv0 - c) / (uZoom + uDolly * d);',
        '    uv += (d - ' + FOCUS.toFixed(2) + ') * uPointer * vec2(' + SHIFT[0] + ', ' + SHIFT[1] + ');',
        '    uv.y -= (1.0 - d) * uScroll * 0.12;',
        '    return uv;',
        '}',
        'void main() {',
        '    vec2 px = vec2(gl_FragCoord.x / uDpr, uView.y - gl_FragCoord.y / uDpr);',
        '    vec2 uv0 = vec2((px.x - uImgLeft) / uImgW, px.y / uView.y);',
        '    float d = texture2D(uMap, uv0).r;',
        '    vec2 uv = project(uv0, d);',
        '    for (int i = 0; i < 3; i++) { d = mix(d, texture2D(uMap, uv).r, 0.6); uv = project(uv0, d); }',
        '    float hazeMask = texture2D(uMap, uv + vec2(0.0, 0.045)).g;',
        '    float n = noise(uv * vec2(22.0, 12.0) + vec2(0.0, uTime * 1.6));',
        '    uv += vec2(n - 0.5, (n - 0.5) * 0.6) * 0.008 * hazeMask * uFx;',
        '    vec3 col = texture2D(uImg, uv).rgb;',
        '    vec3 m = texture2D(uMap, uv).rgb;',
        '    float flick = noise(vec2(uTime * 3.1, uv.x * 5.0 + uv.y * 3.0)) * 0.7 + noise(vec2(uTime * 9.0, uv.y * 9.0)) * 0.3;',
        '    float halo = 0.0;',
        '    float eyeHalo = 0.0;',
        '    for (int k = 0; k < 8; k++) {',
        '        float a = float(k) * 0.7854;',
        '        vec2 o = vec2(cos(a), sin(a) * 2.1);',
        '        halo += texture2D(uMap, uv + o * 0.022).g;',
        '        eyeHalo += texture2D(uMap, uv + o * 0.008).b;',
        '    }',
        '    halo /= 8.0;',
        '    eyeHalo /= 8.0;',
        '    col += col * m.g * (0.25 + 0.9 * flick) * uFx;',
        '    col += vec3(1.0, 0.42, 0.08) * halo * (0.10 + 0.16 * flick) * uFx;',
        '    float pulse = 0.55 + 0.45 * sin(uTime * 2.3) * sin(uTime * 0.7 + 1.3);',
        '    col += vec3(1.0, 0.1, 0.04) * (m.b * 0.5 + eyeHalo * 0.22) * (0.3 + 0.7 * pulse) * uFx;',
        '    vec2 e = vec2(1.5 / 792.0, 1.5 / 373.0);',
        '    float dx = texture2D(uMap, uv + vec2(e.x, 0.0)).r - texture2D(uMap, uv - vec2(e.x, 0.0)).r;',
        '    float dy = texture2D(uMap, uv + vec2(0.0, e.y)).r - texture2D(uMap, uv - vec2(0.0, e.y)).r;',
        '    vec3 nrm = normalize(vec3(-dx * 14.0, dy * 14.0, 1.0));',
        '    vec2 lp = (px - uLightPos) / uView.y;',
        '    vec3 L = normalize(vec3(-lp.x, lp.y, 0.45));',
        '    float fall = exp(-dot(lp, lp) * 5.0);',
        '    float lambert = max(dot(nrm, L), 0.0);',
        '    col += (col * 1.4 * lambert + vec3(1.0, 0.55, 0.25) * 0.035) * fall * uLight * (0.4 + 0.6 * d);',
        '    vec2 v = px / uView - vec2(0.5, 0.42);',
        '    col *= 1.0 - dot(v, v) * 0.35;',
        '    col += (hash(px + fract(uTime) * 91.0) - 0.5) * 0.018;',
        '    float alpha = smoothstep(1.0, 0.82, px.y / uView.y);',
        '    gl_FragColor = vec4(col * alpha, alpha);',
        '}'
    ].join('\n');

    function loadImage(src) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload = function () { resolve(img); };
            img.onerror = reject;
            img.src = src;
        });
    }

    function compile(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
        return shader;
    }

    function texture(gl, unit, img) {
        var tex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        return tex;
    }

    function emberSprite() {
        var c = document.createElement('canvas');
        c.width = c.height = 64;
        var g = c.getContext('2d');
        var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255,240,200,1)');
        grad.addColorStop(0.15, 'rgba(255,190,90,0.9)');
        grad.addColorStop(0.4, 'rgba(255,110,30,0.35)');
        grad.addColorStop(1, 'rgba(255,60,0,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        return c;
    }

    function init(img, map) {
        var root = document.createElement('div');
        root.className = 'c-hero-3d';
        root.setAttribute('aria-hidden', 'true');
        var glCanvas = document.createElement('canvas');
        var fxCanvas = document.createElement('canvas');
        root.appendChild(glCanvas);
        root.appendChild(fxCanvas);

        var gl = glCanvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
        if (!gl) return;
        var program;
        try {
            program = gl.createProgram();
            gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
            gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
        } catch (e) {
            return;
        }
        gl.useProgram(program);

        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        var aPos = gl.getAttribLocation(program, 'aPos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        texture(gl, 0, img);
        texture(gl, 1, map);

        var u = {};
        ['uImg', 'uMap', 'uView', 'uDpr', 'uImgLeft', 'uImgW', 'uPointer', 'uLightPos', 'uLight',
            'uZoom', 'uDolly', 'uScroll', 'uTime', 'uFx'].forEach(function (name) {
            u[name] = gl.getUniformLocation(program, name);
        });
        gl.uniform1i(u.uImg, 0);
        gl.uniform1i(u.uMap, 1);

        var fx = fxCanvas.getContext('2d');
        var sprite = emberSprite();

        document.body.classList.add('has-hero-3d');
        document.body.insertBefore(root, document.body.firstChild);

        var view = { w: 0, h: 0, imgLeft: 0, imgW: 0, dpr: 1 };
        var narrow = window.matchMedia('(max-width: 1400px)');
        var wide = window.matchMedia('(min-width: 1921px)');

        function layout() {
            var w = document.body.clientWidth;
            var h = narrow.matches ? 703 : wide.matches ? 1036 : 1001;
            var imgW = h * IMAGE_ASPECT;
            var anchor = narrow.matches ? 0.2 : 0.5;
            view.w = w;
            view.h = h;
            view.imgW = imgW;
            view.imgLeft = (w - imgW) * anchor;
            view.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            root.style.height = h + 'px';
            glCanvas.width = fxCanvas.width = Math.round(w * view.dpr);
            glCanvas.height = fxCanvas.height = Math.round(h * view.dpr);
            gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        }

        var embers = [];
        var emberCount = 0;

        function spawn(ember, initial) {
            var r = Math.random();
            var ix, iy;
            if (r < 0.45) {
                ix = 0.84 + Math.random() * 0.16;
                iy = 0.55 + Math.random() * 0.3;
            } else if (r < 0.75) {
                ix = 0.22 + Math.random() * 0.28;
                iy = 0.3 + Math.random() * 0.4;
            } else {
                ix = Math.random();
                iy = 0.6 + Math.random() * 0.4;
            }
            ember.x = view.imgLeft + ix * view.imgW;
            ember.y = iy * view.h;
            ember.z = 0.15 + Math.random() * 1.05;
            ember.vx = (Math.random() - 0.3) * 18;
            ember.vy = -(14 + Math.random() * 42) * (0.5 + ember.z);
            ember.size = (2.5 + Math.random() * 5.5) * (0.4 + ember.z);
            ember.life = 0;
            ember.maxLife = 3 + Math.random() * 6;
            ember.phase = Math.random() * Math.PI * 2;
            if (initial) ember.life = Math.random() * ember.maxLife;
        }

        var pointer = { x: 0, y: 0, tx: 0, ty: 0, lx: 0, ly: 0, light: 0, lastMove: -1e9 };
        var scroll = 0;
        var start = performance.now();
        var last = start;
        var visible = true;
        var running = false;
        var live = false;

        window.addEventListener('pointermove', function (e) {
            if (e.pointerType === 'touch') return;
            pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
            pointer.lx = e.clientX;
            pointer.ly = e.clientY + window.scrollY;
            pointer.lastMove = performance.now();
        }, { passive: true });

        document.addEventListener('pointerleave', function () {
            pointer.lastMove = -1e9;
        });

        if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
            window.addEventListener('deviceorientation', function (e) {
                if (e.gamma == null || e.beta == null) return;
                pointer.tx = Math.max(-1, Math.min(1, e.gamma / 25));
                pointer.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
                pointer.lastMove = performance.now();
            }, { passive: true });
        }

        window.addEventListener('scroll', function () {
            scroll = window.scrollY;
            if (!running && visible) loop();
        }, { passive: true });

        window.addEventListener('resize', layout);

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
                if (visible && !running) loop();
            }).observe(root);
        }

        document.addEventListener('visibilitychange', function () {
            if (!document.hidden && !running) {
                last = performance.now();
                loop();
            }
        });

        function ease(t) {
            t = Math.max(0, Math.min(1, t));
            return 1 - Math.pow(1 - t, 3);
        }

        function frame(now) {
            var dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            var t = (now - start) / 1000;
            var intro = ease((t - 0.3) / 2.6);
            var active = now - pointer.lastMove < 3500;

            var tx = active ? pointer.tx : Math.sin(t * 0.21) * 0.55;
            var ty = active ? pointer.ty : Math.sin(t * 0.16 + 1.1) * 0.35;
            var k = 1 - Math.exp(-dt * 3.2);
            pointer.x += (tx - pointer.x) * k;
            pointer.y += (ty - pointer.y) * k;
            pointer.light += ((active ? 1 : 0) - pointer.light) * (1 - Math.exp(-dt * 2));

            var sc = Math.min(1, scroll / view.h);
            var px = pointer.x * intro;
            var py = pointer.y * intro;

            gl.uniform2f(u.uView, view.w, view.h);
            gl.uniform1f(u.uDpr, view.dpr);
            gl.uniform1f(u.uImgLeft, view.imgLeft);
            gl.uniform1f(u.uImgW, view.imgW);
            gl.uniform2f(u.uPointer, px, py);
            gl.uniform2f(u.uLightPos, pointer.lx, pointer.ly);
            gl.uniform1f(u.uLight, pointer.light * intro);
            gl.uniform1f(u.uZoom, 1 + 0.035 * intro + sc * 0.05);
            gl.uniform1f(u.uDolly, 0.05 * intro + sc * 0.12);
            gl.uniform1f(u.uScroll, sc);
            gl.uniform1f(u.uTime, t);
            gl.uniform1f(u.uFx, ease(t / 1.5));
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            fx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
            fx.clearRect(0, 0, view.w, view.h);
            fx.globalCompositeOperation = 'lighter';
            while (embers.length < emberCount) {
                var ember = {};
                spawn(ember, true);
                embers.push(ember);
            }
            for (var i = 0; i < embers.length; i++) {
                var p = embers[i];
                p.life += dt;
                if (p.life > p.maxLife || p.y < -20) spawn(p, false);
                p.x += (p.vx + Math.sin(t * 1.3 + p.phase) * 12 * p.z) * dt;
                p.y += p.vy * dt;
                var lifeT = p.life / p.maxLife;
                var a = Math.min(1, lifeT * 6) * (1 - lifeT) * (0.55 + 0.45 * Math.sin(t * 9 + p.phase * 3));
                var depthShift = p.z - FOCUS;
                var sx = p.x - depthShift * px * SHIFT[0] * view.imgW;
                var sy = p.y - depthShift * py * SHIFT[1] * view.h + (1 - Math.min(p.z, 1)) * sc * 0.12 * view.h;
                var fade = Math.max(0, Math.min(1, (1 - sy / view.h) / 0.25));
                fx.globalAlpha = Math.max(0, a) * fade * intro * (p.z > 1 ? 0.6 : 1);
                var s = p.size * 4;
                fx.drawImage(sprite, sx - s / 2, sy - s / 2, s, s);
            }
            fx.globalAlpha = 1;

            if (!live) {
                live = true;
                root.classList.add('is-live');
            }
        }

        function loop() {
            running = true;
            requestAnimationFrame(function tick(now) {
                if (!visible || document.hidden) {
                    running = false;
                    return;
                }
                frame(now);
                requestAnimationFrame(tick);
            });
        }

        glCanvas.addEventListener('webglcontextlost', function () {
            root.remove();
            document.body.classList.remove('has-hero-3d');
            visible = false;
        });

        layout();
        emberCount = view.w < 768 ? 50 : 130;
        loop();
    }

    function boot() {
        Promise.all([loadImage(IMAGE_SRC), loadImage(MAP_SRC)]).then(function (imgs) {
            init(imgs[0], imgs[1]);
        }).catch(function () {});
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
