import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { BoxGeometry, EdgesGeometry, LineBasicMaterial } from 'three';

// Product Card 3D Model
function ProductModel({ color = '#1a1a1a', imageUrl }) {
  const boxGeometry = new BoxGeometry(1.5, 2, 0.1);
  const edgesGeometry = new EdgesGeometry(boxGeometry);
  
  return (
    <group>
      {/* Simple box representing the product */}
      <mesh geometry={boxGeometry}>
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Neon edge glow */}
      <lineSegments geometry={edgesGeometry}>
        <primitive object={new LineBasicMaterial({ color: '#00F0FF', transparent: true, opacity: 0.5 })} attach="material" />
      </lineSegments>
    </group>
  );
}

export const Product3DHover = ({ imageUrl, isHovered }) => {
  if (!isHovered) return null;
  
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <Canvas>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={0.5} color="#00F0FF" />
          
          <Float
            speed={2}
            rotationIntensity={0.2}
            floatIntensity={0.3}
          >
            <ProductModel imageUrl={imageUrl} />
          </Float>
          
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
        </Suspense>
      </Canvas>
    </div>
  );
};