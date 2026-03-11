import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const CustomDesign3D = ({ designImage }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const textureRef = useRef(null);

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

    // T-Shirt Group
    const tshirtGroup = new THREE.Group();
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(2, 2.5, 0.2);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    tshirtGroup.add(body);

    // Design preview plane
    const designPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.2),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.95,
        color: 0xffffff
      })
    );
    designPlane.position.set(0, 0.2, 0.11);
    tshirtGroup.add(designPlane);

    // Neon edges
    const edges = new THREE.EdgesGeometry(bodyGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.3
    });
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    tshirtGroup.add(lineSegments);

    scene.add(tshirtGroup);

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10, 0x00F0FF, 0x00F0FF);
    gridHelper.position.set(0, -2, -3);
    scene.add(gridHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00F0FF, 0.8);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xFF003C, 0.4);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);

    const spotLight = new THREE.SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 10, 0);
    spotLight.angle = 0.3;
    spotLight.penumbra = 1;
    scene.add(spotLight);

    // Update texture if design image is provided
    if (designImage) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(designImage, (texture) => {
        textureRef.current = texture;
        designPlane.material.map = texture;
        designPlane.material.needsUpdate = true;
      });
    }

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (event) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    containerRef.current.addEventListener('mousemove', onMouseMove);

    // Animation
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Auto-rotate
      tshirtGroup.rotation.y += 0.005;

      // Mouse interaction
      tshirtGroup.rotation.x = mouseY * 0.2;
      tshirtGroup.rotation.y += mouseX * 0.01;

      // Float animation
      tshirtGroup.position.y = Math.sin(time) * 0.1;

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
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', onMouseMove);
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, [designImage]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-void-card"
    />
  );
};
