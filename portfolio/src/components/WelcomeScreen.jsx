import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// 3D Card Component
const Card = ({ theme }) => {
  const meshRef = useRef();
  const texture = useTexture('/musili.jpeg');
  const [hovered, setHovered] = useState(false);

  const handlePointerMove = (e) => {
    if (!meshRef.current) return;
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = -(clientY / window.innerHeight) * 2 + 1;
    meshRef.current.rotation.x = y * 0.5;
    meshRef.current.rotation.y = x * 0.5;
  };

  return (
    <group onPointerMove={handlePointerMove}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[3, 4, 0.1]} />
        <meshStandardMaterial
          map={texture}
          color={theme === 'dark' ? '#00ff00' : '#000000'}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      <Text
        position={[0, 1.3, 0.2]}
        fontSize={0.2}
        color={theme === 'dark' ? '#00ff00' : '#000000'}
        anchorX="center"
        anchorY="middle"
      >
        Musili Andrew
      </Text>
      <Text
        position={[0, 1.0, 0.2]}
        fontSize={0.12}
        color={theme === 'dark' ? '#00ff00' : '#000000'}
        anchorX="center"
        anchorY="middle"
      >
        Fullstack Developer + Data Scientist
      </Text>
    </group>
  );
};

const WelcomeScreen = ({ onEnter, theme, setTheme }) => {
  const canvasRef = useRef();

  // Cleanup WebGL context on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        const gl = canvasRef.current.getContext('webgl') || canvasRef.current.getContext('webgl2');
        if (gl) {
          const ext = gl.getExtension('WEBGL_lose_context');
          if (ext) ext.loseContext();
        }
      }
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* 3D Card Canvas */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="w-[300px] h-[400px]"
      >
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Card theme={theme} />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </motion.div>

      {/* Click to Enter Button */}
      <motion.button
        onClick={onEnter}
        className={`mt-6 px-6 py-2 rounded font-semibold ${
          theme === 'dark'
            ? 'bg-green-500 text-black hover:bg-green-300'
            : 'bg-black text-white hover:bg-gray-600'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        Click to Enter
      </motion.button>
    </motion.div>
  );
};

export default WelcomeScreen;