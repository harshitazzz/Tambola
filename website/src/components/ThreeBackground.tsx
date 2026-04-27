import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const spheres: THREE.Mesh[] = [];
    const geometry = new THREE.SphereGeometry(1, 32, 32);

    // Create soft, blurry-looking out-of-focus background orbs
    for (let i = 0; i < 8; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xa4f4b6 : 0xffe2a9, // Light green and peach
        transparent: true,
        opacity: 0.15 + Math.random() * 0.1,
      });

      const sphere = new THREE.Mesh(geometry, material);

      // Keep them near the edges of the screen
      sphere.position.x = (Math.random() - 0.5) * 30;
      sphere.position.y = (Math.random() - 0.5) * 20;
      sphere.position.z = -10 - Math.random() * 15;

      const scale = 1.5 + Math.random() * 4;
      sphere.scale.set(scale, scale, scale);

      scene.add(sphere);
      spheres.push(sphere);
    }

    // Floating subtle dust
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 150;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 35;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x1a7631, // Tambola Green
      transparent: true,
      opacity: 0.15,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 5;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.003;

      spheres.forEach((sphere, i) => {
        sphere.position.y += Math.sin(time + i) * 0.008;
        sphere.position.x += Math.cos(time + i) * 0.005;

        sphere.position.x += (mouseX * 0.5 - sphere.position.x) * 0.01;
        sphere.position.y += (mouseY * 0.5 - sphere.position.y) * 0.01;
      });

      particlesMesh.rotation.y += 0.0003;
      particlesMesh.rotation.x += 0.0001;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
};

export default ThreeBackground;
