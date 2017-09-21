(function() {
    let camera;
    let scene;
    let renderer;
    let particleSystem;

    let clock;
    let deltaTime;

    function init() {
        clock = new THREE.Clock(true);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 50;

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, -1, 1 ).normalize();
        scene.add(light);


        particleSystem = createParticleSystem();
        scene.add(particleSystem);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );

        render();
    }

    function createParticleSystem() {
        // The number of particles in a particle system is not easily changed.
        const particleCount = 100000;
        

        // Particles are just individual vertices in a geometry
        // Create the geometry that will hold all of the vertices
        const particles = new THREE.Geometry();

        for (const [x, y, z] of getParticles(2000)) {
            // Create the vertex
            const particle = new THREE.Vector3(x, y, z);

            // Add the vertex to the geometry
            particles.vertices.push(particle);
        }


        // Create the material that will be used to render each vertex of the geometry
        const particleMaterial = new THREE.PointsMaterial(
            {
                color: 0xffffff,
                size: 1,
                map: THREE.ImageUtils.loadTexture("images/snowflake.png"),
                blending: THREE.AdditiveBlending,
                transparent: true,
            });

        // Create the particle system
        return new THREE.Points(particles, particleMaterial);
    }


    function animate() {
        deltaTime = clock.getDelta();

        particleSystem.rotation.x += 0.1 * deltaTime;
        particleSystem.rotation.y += 0.2 * deltaTime;

        render();
        requestAnimationFrame( animate );
    }


    function render() {
        renderer.render( scene, camera );
    }


    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();
    }

    init();
    animate();


    function makeCode(len) {
        let accum = "";

        for (let i = 0; i < len; i++) {
            accum += String.fromCodePoint(65 + parseInt(25 * Math.random()));
        }

        return accum;
    }

    function translateCode(code) {
        const accum = [];
        for (const c of code) {
            accum.push((c.charCodeAt(0) - 77) / 10)
        }

        return accum;
    }

    function evalNext(X, Y, Z, a) {
        const x2 = X * X;
        const xy = X * Y;
        const xz = X * Z;
        const y2 = Y * Y;
        const yz = Y * Z;
        const z2 = Z * Z;

        const nextX = a[0] + a[1] * x2 + a[2] * X + a[3] * xy + a[4] * xz + a[5] * y2 + a[6] * Y + a[7] * yz + a[8] * z2 + a[9] * Z;
        const nextY = a[10] + a[11] * x2 + a[12] * X + a[13] * xy + a[14] * xz + a[15] * y2 + a[16] * Y + a[17] * yz + a[18] * z2 + a[19] * Z;
        const nextZ = a[20] + a[21] * x2 + a[22] * X + a[23] * xy + a[24] * xz + a[25] * y2 + a[26] * Y + a[27] * yz + a[28] * z2 + a[29] * Z;

        return [nextX, nextY, nextZ];
    }

    function factor(coef, val, first) {
        if (coef === 0) {
            return '';
        } else if (coef < 0) {
            return ` - ${-coef} ${val}`;
        } else if (first) {
            return `${coef} ${val}`;
        } else {
            return ` + ${coef} ${val}`;
        }
    }

    const texParts = [ 
        '',
        'X_n^2', 'X_n', 'X_n Y_n', 'X_n Z_n',
        'Y_n^2', 'Y_n', 'Y_n Z_n',
        'Z_n^2', 'Z_n'
    ]

    function makeTexPart(start, a) {
        return texParts.map((p, i) => factor(a[i + start], p, i === 0)).join('');
    }

    function makeTex(a) {
        const x = `\\( X_{n+1} = ${makeTexPart(0, a)} \\)`;
        const y = `\\( Y_{n+1} = ${makeTexPart(10, a)} \\)`;
        const z = `\\( Z_{n+1} = ${makeTexPart(20, a)} \\)`;

        document.getElementById('tex1').innerHTML = x;
        document.getElementById('tex2').innerHTML = y;
        document.getElementById('tex3').innerHTML = z;

        if (window.MathJax) {
            MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
        }
    }


    function eval2dQuad(code) {
        const a = translateCode(code);
        const lim = 11000;
        const xlim = 1000000;

        let maxx = 0;
        let minx = 0;
        let maxy = 0;
        let miny = 0;
        let maxz = 0;
        let minz = 0;

        let X = 0.5; // Math.random();
        let Y = 0.5; // Math.random();
        let Z = 0.5; // Math.random();

        let LSum = 0;

        for (let i = 0; i < lim; i++) {
            const [nextX, nextY, nextZ] = evalNext(X, Y, Z, a);

            const dx = nextX - X;
            const dy = nextY - Y;
            const dz = nextZ - Z;

            X = nextX;
            Y = nextY;
            Z = nextZ

            if (Math.abs(X) + Math.abs(Y) + Math.abs(Z) > xlim) {
                return [];
            }

            const df = 1e12 * (dx * dx + dy * dy + dz * dz);

            LSum += Math.log(df);

            const L = LSum / (i + 1);
            if (L < 0.005) {
                return [];
            }

            if (i < 1000) {
                continue;
            }
            else if (i == 1000) {
                minx = maxx = X;
                miny = maxy = Y;
                minz = maxz = Z;
            } else {
                minx = Math.min(minx, X);
                maxx = Math.max(maxx, X);
                miny = Math.min(miny, Y);
                maxy = Math.max(maxy, Y);
                minz = Math.min(minz, Z);
                maxz = Math.max(maxz, Z);
            }
        }

        return [code, a, [minx, maxx, miny, maxy, minz, maxz]];
    }

    function bucketCheck(code, a, bounds) {
        const [minx, maxx, miny, maxy, minz, maxz] = bounds;
        const rangex = maxx - minx;
        const rangey = maxy - miny;

        const buckets = [];
        for (let i = 0; i < 64; i++) {
            buckets[i] = 0;
        }

        let X = 0.5; // Math.random();
        let Y = 0.5; // Math.random();
        let Z = 0.5; // Math.random();

        for (let i = 0; i < 11000; i++) {
            const [nextX, nextY, nextZ] = evalNext(X, Y, Z, a);
            X = nextX;
            Y = nextY;
            Z = nextZ;

            if (i < 1000) {
                continue;
            }

            const bx = Math.floor(8 * (X - minx) / rangex);
            const by = Math.floor(8 * (Y - miny) / rangey);

            if (bx >= 0 && bx < 8 &&
                by >= 0 && by < 8) {
                buckets[bx + 8 * by] += 1;
            }
        }

        const zeros = buckets.reduce(
            (sum, value) => value ? sum : sum + 1,
            0
        );

        return zeros < 32;
    }

    function find2dCode(initial) {
        for (let i = 0; i < 10000; i++) {
            const code = i == 0 && initial.length == 30 ? initial : makeCode(30);
            const e = eval2dQuad(code);
            if (e.length && bucketCheck(...e)) {
                return e;
            }
        }

        return ["Not found", [], []];

    }

    function getParticles(count) {
        const particles = [];

        const [code, a, [minx, maxx, miny, maxy, minz, maxz]] = find2dCode('');

        let X = 0.5;
        let Y = 0.5;
        let Z = 0.5;

        for (let i = 0; i < 1000 + count; i++) {
            const [nextX, nextY, nextZ] = evalNext(X, Y, Z, a);

            X = nextX;
            Y = nextY;
            Z = nextZ;

            if (i < 1000) {
                continue;
            }

            particles.push([
                40 * (X - minx) / (maxx - minx) - 20,
                40 * (Y - miny) / (maxy - miny) - 20,
                40 * (Z - minz) / (maxz - minz) - 20
            ])
        }

        return particles;
    }

})();
