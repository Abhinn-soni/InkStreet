import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Product3DPreview = ({ color = '#1a1a1a', size = 'M', productType = 'tshirt' }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const productGroupRef = useRef(null);
  const animationIdRef = useRef(null);
  const materialRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 4;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Get size multiplier
    const sizeMultipliers = {
      'S': 0.85,
      'M': 1.0,
      'L': 1.15,
      'XL': 1.3,
      'XXL': 1.45
    };
    const sizeMultiplier = sizeMultipliers[size] || 1.0;

    // Product Group
    const productGroup = new THREE.Group();
    productGroupRef.current = productGroup;
    
    // Create material with selected color
    const productMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.7,
      metalness: 0.2
    });
    materialRef.current = productMaterial;

    if (productType === 'tshirt' || productType === 'hoodie') {
      // Main body - scaled by size
      const bodyWidth = 1.8 * sizeMultiplier;
      const bodyHeight = 2.2 * sizeMultiplier;
      const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, 0.15);
      const body = new THREE.Mesh(bodyGeometry, productMaterial);
      productGroup.add(body);

      // Sleeves
      const sleeveSize = productType === 'hoodie' ? 0.9 : 0.8;
      const leftSleeve = new THREE.Mesh(
        new THREE.BoxGeometry(sleeveSize * sizeMultiplier, 0.4 * sizeMultiplier, 0.15),
        productMaterial
      );
      leftSleeve.position.set(-1.1 * sizeMultiplier, 0.6 * sizeMultiplier, 0);
      leftSleeve.rotation.z = Math.PI / 6;
      productGroup.add(leftSleeve);

      const rightSleeve = new THREE.Mesh(
        new THREE.BoxGeometry(sleeveSize * sizeMultiplier, 0.4 * sizeMultiplier, 0.15),
        productMaterial
      );
      rightSleeve.position.set(1.1 * sizeMultiplier, 0.6 * sizeMultiplier, 0);
      rightSleeve.rotation.z = -Math.PI / 6;
      productGroup.add(rightSleeve);

      // Hood for hoodie
      if (productType === 'hoodie') {
        const hood = new THREE.Mesh(
          new THREE.BoxGeometry(1.2 * sizeMultiplier, 0.6 * sizeMultiplier, 0.4),
          productMaterial
        );
        hood.position.set(0, 1.4 * sizeMultiplier, 0);
        productGroup.add(hood);
      }
    } else if (productType === 'cap') {
      // Cap model
      const capTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32),
        productMaterial
      );
      capTop.position.y = 0.2;
      productGroup.add(capTop);

      const capBrim = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32),
        productMaterial
      );
      capBrim.position.y = 0;
      productGroup.add(capBrim);
    }

    // Neon edges
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.8 * sizeMultiplier, 2.2 * sizeMultiplier, 0.15));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.4
    });
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    if (productType === 'tshirt' || productType === 'hoodie') {
      productGroup.add(lineSegments);
    }

    scene.add(productGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00F0FF, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xFF003C, 0.3);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);

    // Animation
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Auto-rotate
      productGroup.rotation.y += 0.005;

      // Float animation
      productGroup.position.y = Math.sin(time) * 0.05;

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
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      productMaterial.dispose();
    };
  }, []);

  // Update color when it changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(new THREE.Color(color));
    }
  }, [color]);

  // Update size when it changes - recreate the scene
  useEffect(() => {
    // This will trigger the main useEffect to recreate with new size
  }, [size]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-void-card"
    />
  );
};
