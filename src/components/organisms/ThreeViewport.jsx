import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Plane, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import ApperIcon from '@/components/ApperIcon';

// Room Component
const Room = ({ room, selectedObject, onObjectSelect }) => {
  const { width, length, height } = room.dimensions;

  return (
    <group>
      {/* Floor */}
      <Plane
        args={[width, length]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={() => onObjectSelect(null)}
      >
        <meshStandardMaterial color="#f8f9fa" />
      </Plane>

      {/* Walls */}
      {room.walls.map((wall) => (
        <WallComponent
          key={wall.id}
          wall={wall}
          isSelected={selectedObject?.id === wall.id}
          onSelect={() => onObjectSelect(wall)}
        />
      ))}

      {/* Furniture */}
      {room.furniture.map((furniture) => (
        <FurnitureComponent
          key={furniture.id}
          furniture={furniture}
          isSelected={selectedObject?.id === furniture.id}
          onSelect={() => onObjectSelect(furniture)}
        />
      ))}

      {/* Room Boundaries */}
      <group>
        {/* Front Wall */}
        <Plane
          args={[width, height]}
          position={[0, height / 2, -length / 2]}
          rotation={[0, 0, 0]}
        >
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
        </Plane>

        {/* Back Wall */}
        <Plane
          args={[width, height]}
          position={[0, height / 2, length / 2]}
          rotation={[0, Math.PI, 0]}
        >
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
        </Plane>

        {/* Left Wall */}
        <Plane
          args={[length, height]}
          position={[-width / 2, height / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
        </Plane>

        {/* Right Wall */}
        <Plane
          args={[length, height]}
          position={[width / 2, height / 2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
        </Plane>
      </group>
    </group>
  );
};

// Wall Component
const WallComponent = ({ wall, isSelected, onSelect }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.material.emissive.setHex(0x2563eb);
    } else if (meshRef.current) {
      meshRef.current.material.emissive.setHex(0x000000);
    }
  });

  return (
    <Box
      ref={meshRef}
      args={[wall.dimensions.width, wall.dimensions.height, 0.1]}
      position={[wall.position.x, wall.dimensions.height / 2, wall.position.z]}
      rotation={[0, wall.rotation, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <meshStandardMaterial color={wall.color || '#ffffff'} />
    </Box>
  );
};

// Furniture Component
const FurnitureComponent = ({ furniture, isSelected, onSelect }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.material.emissive.setHex(0x10b981);
    } else if (meshRef.current) {
      meshRef.current.material.emissive.setHex(0x000000);
    }
  });

  const getFurnitureGeometry = () => {
    switch (furniture.type) {
      case 'sofa':
        return [2, 0.8, 1];
      case 'bed':
        return [2, 0.6, 1.5];
      case 'table':
        return [1.5, 0.8, 1];
      case 'chair':
        return [0.6, 1, 0.6];
      case 'desk':
        return [1.2, 0.8, 0.6];
      case 'wardrobe':
        return [1, 2, 0.6];
      default:
        return [1, 1, 1];
    }
  };

  const getFurnitureColor = () => {
    switch (furniture.type) {
      case 'sofa':
        return '#8b5cf6';
      case 'bed':
        return '#06b6d4';
      case 'table':
        return '#f59e0b';
      case 'chair':
        return '#10b981';
      case 'desk':
        return '#3b82f6';
      case 'wardrobe':
        return '#ef4444';
      default:
        return furniture.color || '#6b7280';
    }
  };

  return (
    <group
      position={[furniture.position.x, furniture.position.y, furniture.position.z]}
      rotation={[furniture.rotation.x, furniture.rotation.y, furniture.rotation.z]}
      scale={[furniture.scale.x, furniture.scale.y, furniture.scale.z]}
    >
      <Box
        ref={meshRef}
        args={getFurnitureGeometry()}
        position={[0, getFurnitureGeometry()[1] / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <meshStandardMaterial color={getFurnitureColor()} />
      </Box>
      
      {/* Furniture Label */}
      <Text
        position={[0, getFurnitureGeometry()[1] + 0.5, 0]}
        fontSize={0.2}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {furniture.type}
      </Text>
    </group>
  );
};

// Scene Setup
const Scene = ({ room, selectedObject, onObjectSelect }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.background = new THREE.Color(0xf8fafc);
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />
      
      <Grid
        position={[0, -0.01, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#e2e8f0"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#cbd5e1"
      />
      
      <Room
        room={room}
        selectedObject={selectedObject}
        onObjectSelect={onObjectSelect}
      />
    </>
  );
};

// Main Viewport Component
const ThreeViewport = ({
  room,
  selectedTool,
  selectedObject,
  onObjectSelect,
  onObjectUpdate,
  cameraView,
  onCameraViewChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const controlsRef = useRef();

  const handleCameraPreset = (preset) => {
    if (!controlsRef.current) return;
    
    const controls = controlsRef.current;
    const camera = controls.object;
    
    switch (preset) {
      case 'top':
        camera.position.set(0, 20, 0);
        controls.target.set(0, 0, 0);
        break;
      case 'front':
        camera.position.set(0, 5, 15);
        controls.target.set(0, 0, 0);
        break;
      case 'side':
        camera.position.set(15, 5, 0);
        controls.target.set(0, 0, 0);
        break;
      case 'isometric':
        camera.position.set(10, 10, 10);
        controls.target.set(0, 0, 0);
        break;
      default:
        camera.position.set(5, 5, 5);
        controls.target.set(0, 0, 0);
    }
    
    controls.update();
    onCameraViewChange(preset);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-white to-gray-50">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 75 }}
        shadows
        className="w-full h-full"
      >
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          onStart={() => setIsDragging(true)}
          onEnd={() => setIsDragging(false)}
        />
        
        <Scene
          room={room}
          selectedObject={selectedObject}
          onObjectSelect={onObjectSelect}
        />
      </Canvas>

      {/* Viewport Controls */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        {[
          { key: 'perspective', icon: 'Eye', label: 'Perspective' },
          { key: 'top', icon: 'Square', label: 'Top View' },
          { key: 'front', icon: 'RectangleHorizontal', label: 'Front View' },
          { key: 'side', icon: 'RectangleVertical', label: 'Side View' },
          { key: 'isometric', icon: 'Box', label: 'Isometric' }
        ].map((view) => (
          <motion.button
            key={view.key}
            onClick={() => handleCameraPreset(view.key)}
            className={`p-3 rounded-lg backdrop-blur-md border shadow-lg transition-all duration-200 ${
              cameraView === view.key
                ? 'bg-primary text-white border-primary'
                : 'bg-white/90 text-gray-700 border-gray-200/50 hover:bg-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={view.label}
          >
            <ApperIcon name={view.icon} size={20} />
          </motion.button>
        ))}
      </div>

      {/* Tool Indicator */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700 capitalize">
            {selectedTool} Tool
          </span>
        </div>
      </div>

      {/* Selected Object Indicator */}
      {selectedObject && (
        <motion.div
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-lg px-4 py-2 shadow-lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
        >
          <div className="flex items-center space-x-2">
            <ApperIcon name="Target" size={16} className="text-primary" />
            <span className="text-sm font-medium text-gray-700">
              {selectedObject.type || 'Object'} Selected
            </span>
          </div>
        </motion.div>
      )}

      {/* Room Dimensions Display */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-lg px-4 py-2 shadow-lg">
        <div className="text-sm text-gray-600">
          <div className="font-medium text-gray-800 mb-1">Room Dimensions</div>
          <div className="space-y-1">
            <div>Width: {room.dimensions.width}m</div>
            <div>Length: {room.dimensions.length}m</div>
            <div>Height: {room.dimensions.height}m</div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isDragging && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
            Navigating...
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeViewport;