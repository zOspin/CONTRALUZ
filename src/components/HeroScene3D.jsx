import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useMotionValueEvent } from 'framer-motion';

/**
 * ESCENA 3D — volumen arquitectonico procedural
 * =============================================
 *
 * QUE ES Y QUE NO ES
 * ------------------
 * Esto NO es un modelo del edificio real: es una MASAJE procedural. Tres.js
 * no puede reconstruir geometria a partir de una foto, asi que lo que hay
 * aqui son volumenes primitivos —planos, columnas, losas— compuestos para que
 * se lean como arquitectura bajo una luz concreta. Es direccion de arte, no
 * documentacion del proyecto.
 *
 * COMO REEMPLAZARLO POR EL MODELO REAL
 * ------------------------------------
 * Si consigues un .glb del edificio (desde Revit, Rhino, SketchUp o
 * Blender), el cambio es localized: en lugar de llamar a buildProcedural()
 * usarias:
 *
 *     const gltf = await new GLTFLoader().loadAsync('/modelo.glb');
 *     gltf.scene.traverse((o) => { if (o.isMesh) o.castShadow = true; });
 *     group.add(gltf.scene);
 *
 * y listo. Todo lo demas (luz, camara, scroll, dispose) sigue igual.
 *
 * RENDIMIENTO
 * -----------
 * - Geometria de primitivas: ~20 mallas, nada de subdivision.
 * - Sin post-procesado (bloom, SSAO):todo se resuelve con luz y material.
 * - render() a 60fps con pixelRatio limitado a 2 para pantallas retina.
 * - prefers-reduced-motion: renderiza UN frame estatico y detiene el loop.
 * - dispose() completo al desmontar: geometrias, materiales y renderer.
 */

const PALETTE = {
  void: 0x0a0a0a,
  concrete: 0x2a2724, // hormigon en sombra
  concreteLit: 0x4a443c, // hormigon iluminado
  warm: 0xd9a15b, // el acento de luz que entra
  glass: 0x1a1d1f,
};

export default function HeroScene3D({ progress, enabled = true }) {
  const mountRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Renderer ---------- */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PALETTE.void);
    // Niebla: hunde la base del edificio en la oscuridad. Es lo que hace
    // que el volumen "emerja de la sombra" en vez de flotar sobre ella.
    scene.fog = new THREE.FogExp2(PALETTE.void, 0.055);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(6, 3.2, 9);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // ACESFilmic: comprime los altos luces sin quemar. Sin esto, la luz
    // calida se ve plana y digital.
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    /* ---------- Luces ----------
       El concepto del sitio es "luz que entra por una ventana". Eso se
       codifica literal: una luz puntual calida, baja y lateral, dentro de la
       masa, como un punto de luz interior. Contra ella, un directional
       tenue y frio que solo define siluetas. */
    const keyLight = new THREE.PointLight(PALETTE.warm, 40, 26, 2);
    keyLight.position.set(2.2, 1.4, 1.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.002;
    scene.add(keyLight);

    // Rim frio: separa el volumen del fondo sin delatarlo.
    const rimLight = new THREE.DirectionalLight(0x5a6a78, 0.35);
    rimLight.position.set(-6, 6, -4);
    scene.add(rimLight);

    // Rebote de suelo: evita que la base quede en negro absoluto.
    const fillLight = new THREE.HemisphereLight(0x2a2f33, 0x0a0a0a, 0.4);
    scene.add(fillLight);

    /* ---------- Geometria ---------- */
    const group = new THREE.Group();
    scene.add(group);

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const planeGeo = new THREE.PlaneGeometry(1, 1);

    const matConcrete = new THREE.MeshStandardMaterial({
      color: PALETTE.concrete,
      roughness: 0.92,
      metalness: 0.04,
    });
    const matConcreteLit = new THREE.MeshStandardMaterial({
      color: PALETTE.concreteLit,
      roughness: 0.78,
      metalness: 0.06,
    });
    const matGlass = new THREE.MeshStandardMaterial({
      color: PALETTE.glass,
      roughness: 0.18,
      metalness: 0.7,
    });

    /** Crea una caja escalada y la anade al grupo. */
    const addBox = (mat, w, h, d, x, y, z, castShadow = true) => {
      const mesh = new THREE.Mesh(boxGeo, mat);
      mesh.scale.set(w, h, d);
      mesh.position.set(x, y, z);
      mesh.castShadow = castShadow;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };

    // --- Volumen principal: dos cajas apiladas con un retranqueo.
    // El escalon es lo que crea sombra propia y profundidad.
    addBox(matConcrete, 5.2, 2.4, 3.6, 0, 1.2, 0);
    addBox(matConcreteLit, 4.2, 2, 3, -0.5, 3.4, 0);

    // --- Cantilever: la planta alta se sale de la base. Es el gesto que
    // hace legible el conjunto desde cualquier angulo.
    addBox(matConcreteLit, 3.4, 0.34, 2.6, 0.9, 4.5, 0.2);

    // --- Losas horizontales: thin, leen como forjado visto.
    addBox(matConcrete, 6, 0.18, 4.2, 0, 2.45, 0, false);
    addBox(matConcrete, 4.4, 0.16, 3.2, -0.5, 4.42, 0, false);

    // --- Huecos verticales: los vanos de la fachada. Son oscuros, y leen
    // como sombra profunda desde cualquier luz.
    for (let i = 0; i < 4; i++) {
      addBox(matGlass, 0.5, 1.7, 0.06, -1.6 + i * 1.05, 1.4, 1.81, false);
    }
    for (let i = 0; i < 3; i++) {
      addBox(matGlass, 0.42, 1.3, 0.06, -1.3 + i * 0.95, 3.4, 1.51, false);
    }

    // --- Columnas: la escala de referencia. Sin ellas el volumen no
    // comunica "tamaño humano".
    const colGeo = new THREE.CylinderGeometry(0.09, 0.09, 5.4, 10);
    for (let i = 0; i < 5; i++) {
      const col = new THREE.Mesh(colGeo, matConcreteLit);
      col.position.set(-2.2 + i * 1.1, 2.7, 2.1);
      col.castShadow = true;
      group.add(col);
    }

    // --- Escalinata: tres peldaños, puro gesto. Ancla la composition.
    for (let i = 0; i < 3; i++) {
      addBox(matConcrete, 3.2 - i * 0.3, 0.16, 0.5, 0, 0.08 + i * 0.16, 2.4 + i * 0.5, false);
    }

    // --- Suelo reflectante: da doble piso visual y ancla la sombra.
    const ground = new THREE.Mesh(
      planeGeo,
      new THREE.MeshStandardMaterial({
        color: 0x121212,
        roughness: 0.35,
        metalness: 0.5,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.scale.set(60, 60, 1);
    ground.receiveShadow = true;
    scene.add(ground);

    /* ---------- Resize ---------- */
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    window.addEventListener('resize', resize);

    /* ---------- Estado de animacion ---------- */
    const state = {
      p: 0, // progreso de scroll 0..1
      pSmooth: 0, // valor interpolado (el lerp da la inercia)
    };
    stateRef.current = state;

    const applyProgress = (p) => {
      // Camara: orbita lenta de derecha a izquierda mientras avanza.
      const angle = -0.35 + p * 1.15;
      const radius = 9.5 - p * 2.2; // se acerca
      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius;
      camera.position.y = 3.2 - p * 1.1 + Math.sin(p * Math.PI) * 0.5;

      // La luz calida recorre el volumen: al inicio esta lejos y a la
      // derecha, al final esta dentro, casi frontal. Es "la luz que entra".
      keyLight.position.x = 3.4 - p * 2.6;
      keyLight.position.z = 3.2 - p * 1.9;
      keyLight.intensity = 30 + p * 34;

      // El volumen gira muy despacio, en sentido contrario a la camara.
      // El contra-movimiento es lo que da la sensacion de volumen.
      group.rotation.y = -p * 0.32;

      // La niebla se cierra al final: el edificio se disuelve en la sombra.
      scene.fog.density = 0.045 + p * 0.035;
    };

    applyProgress(0);

    /* ---------- Loop ---------- */
    let rafId = 0;
    const tick = () => {
      // Lerp: convierte el scroll discreto en movimiento continuo. Sin esto
      // la camara avanza a saltos y se pierde toda la sensacion de peso.
      state.pSmooth += (state.p - state.pSmooth) * 0.07;
      applyProgress(state.pSmooth);
      renderer.render(scene, camera);

      if (reduceMotion) return; // un solo frame en reduced-motion
      rafId = requestAnimationFrame(tick);
    };
    tick();

    /* ---------- Limpieza ---------- */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      // dispose explicito: sin esto, Three mantiene buffers de GPU vivos
      // y en HMR se acumulan hasta agotar la memoria.
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose?.();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material?.dispose?.();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [enabled]);

  // El scroll escribe en el MotionValue; aqui lo copiamos al estado que lee
  // el loop. No leemos el MotionValue dentro de requestAnimationFrame porque
  // eso fuerza una lectura sincrona de React en cada frame.
  useMotionValueEvent(progress, 'change', (v) => {
    if (stateRef.current) stateRef.current.p = v;
  });

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-[5] h-full w-full"
      aria-hidden="true"
    />
  );
}
