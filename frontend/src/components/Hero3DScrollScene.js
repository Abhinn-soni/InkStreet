import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Hero3DScrollScene = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const tshirtGroupRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // T-Shirt Group (crushed initially)
    const tshirtGroup = new THREE.Group();
    tshirtGroupRef.current = tshirtGroup;
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(1.8, 2.2, 0.15);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.7,
      metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    tshirtGroup.add(body);

    // Left sleeve
    const leftSleeve = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.4, 0.15),
      bodyMaterial
    );
    leftSleeve.position.set(-1.1, 0.6, 0);
    leftSleeve.rotation.z = Math.PI / 6;
    tshirtGroup.add(leftSleeve);

    // Right sleeve
    const rightSleeve = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.4, 0.15),
      bodyMaterial
    );
    rightSleeve.position.set(1.1, 0.6, 0);
    rightSleeve.rotation.z = -Math.PI / 6;
    tshirtGroup.add(rightSleeve);

    // Neon accent (hidden initially, revealed on unfold)
    const accentGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const accentMaterial = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0
    });
    const accent = new THREE.Mesh(accentGeometry, accentMaterial);
    accent.position.z = 0.08;
    tshirtGroup.add(accent);

    // Set initial crushed state
    tshirtGroup.scale.set(0.5, 0.5, 0.5);
    tshirtGroup.rotation.set(Math.PI * 0.4, Math.PI * 0.3, Math.PI * 0.2);
    
    scene.add(tshirtGroup);

    // Holographic shapes
    const shapes = [];
    for (let i = 0; i < 5; i++) {
      const geometry = i % 2 === 0 
        ? new THREE.OctahedronGeometry(0.3)
        : new THREE.TorusGeometry(0.3, 0.1, 16, 32);
      
      const material = new THREE.MeshBasicMaterial({
        color: 0x00F0FF,
        wireframe: true,
        transparent: true,
        opacity: 0
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 3
      );
      shapes.push(mesh);
      scene.add(mesh);
    }

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x00F0FF, 0x00F0FF);
    gridHelper.position.set(0, -2, -5);
    gridHelper.material.opacity = 0;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00F0FF, 0.5);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xFF003C, 0.3);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    // Scroll-triggered animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current.parentElement,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // Unfold T-shirt
          tshirtGroup.scale.set(
            0.5 + progress * 0.5,
            0.5 + progress * 0.5,
            0.5 + progress * 0.5
          );
          tshirtGroup.rotation.set(
            Math.PI * 0.4 * (1 - progress),
            Math.PI * 0.3 * (1 - progress) + progress * Math.PI * 2,
            Math.PI * 0.2 * (1 - progress)
          );

          // Reveal neon accent
          accentMaterial.opacity = progress * 0.6;

          // Fade in shapes
          shapes.forEach((shape) => {
            shape.material.opacity = progress * 0.3;
          });

          // Fade in grid
          gridHelper.material.opacity = progress * 1;
        },
      },
    });

    // Base animation
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Gentle floating
      tshirtGroup.position.y = Math.sin(time * 0.5) * 0.05;

      // Rotate shapes
      shapes.forEach((shape) => {
        shape.rotation.x += 0.005;
        shape.rotation.y += 0.005;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      accentGeometry.dispose();
      accentMaterial.dispose();
      shapes.forEach(shape => {
        shape.geometry.dispose();
        shape.material.dispose();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    />
  );
};
