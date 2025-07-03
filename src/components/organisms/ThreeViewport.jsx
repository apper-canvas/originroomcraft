import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box, Grid, OrbitControls, Plane, Text } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import ApperIcon from "@/components/ApperIcon";

// Room component that renders the 3D room structure
function Room({ room, selectedObject, onObjectSelect }) {
  const { width = 10, length = 10, height = 3 } = room?.dimensions || {}
  
  // Defensive checks for valid dimensions
  if (!width || !length || !height || width <= 0 || length <= 0 || height <= 0) {
    console.warn('Invalid room dimensions:', { width, length, height })
    return null
  }
  
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
      <group>
        {(room?.walls || []).map((wall) => (
          <WallComponent
            key={wall.id}
            wall={wall}
            isSelected={selectedObject?.id === wall.id}
            onSelect={() => onObjectSelect(wall)}
          />
        ))}
      </group>

      {/* Furniture */}
      {(room?.furniture || []).map((furniture) => (
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
        {width > 0 && height > 0 && (
          <Plane
            args={[width, height]}
            position={[0, height / 2, -length / 2]}
            rotation={[0, 0, 0]}
          >
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
          </Plane>
        )}
        
        {/* Back Wall */}
        {width > 0 && height > 0 && (
          <Plane
            args={[width, height]}
            position={[0, height / 2, length / 2]}
            rotation={[0, Math.PI, 0]}
          >
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
          </Plane>
        )}
        
        {/* Left Wall */}
        {length > 0 && height > 0 && (
          <Plane
            args={[length, height]}
            position={[-width / 2, height / 2, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
          </Plane>
        )}
        
        {/* Right Wall */}
        {length > 0 && height > 0 && (
          <Plane
            args={[length, height]}
            position={[width / 2, height / 2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
          </Plane>
        )}
      </group>
    </group>
  );
};

// Wall Component
// Wall Component
function WallComponent({ wall, isSelected, onSelect }) {
  const meshRef = useRef();

  // Early return if wall object is invalid
  if (!wall) {
    return null;
  }

  useEffect(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.material.color.setHex(0x3b82f6);
    } else if (meshRef.current) {
      meshRef.current.material.color.setHex(0x6b7280);
    }
  }, [isSelected]);

  // Safe property access with fallback values
  const { width = 1, height = 1 } = wall.dimensions || {};
  const { x = 0, z = 0 } = wall.position || {};

  // Handle rotation - support both scalar and object formats
  const getRotationY = () => {
    if (!wall.rotation) return 0;
    return typeof wall.rotation === 'object' ? (wall.rotation?.y || 0) : wall.rotation;
  };

  return (
    <Box
      ref={meshRef}
      args={[width, height, 0.1]}
      position={[x, height / 2, z]}
      rotation={[0, getRotationY(), 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(wall);
      }}
    >
      <meshStandardMaterial color={isSelected ? 0x3b82f6 : 0x6b7280} />
    </Box>
  );
}

// Furniture Component
function FurnitureComponent({ furniture, isSelected, onSelect }) {
  const meshRef = useRef();

  // Early return if furniture object is invalid
  if (!furniture) {
    return null;
  }

  useEffect(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.material.color.setHex(0x10b981);
    } else if (meshRef.current) {
      meshRef.current.material.color.setHex(getFurnitureColor());
    }
  }, [isSelected]);

  // Safe property access with fallback values
  const { x = 0, y = 0, z = 0 } = furniture.position || {};

  const getFurnitureGeometry = () => {
    if (furniture.dimensions) {
      const { width = 1, height = 1, depth = 1 } = furniture.dimensions || {};
      return [width, height, depth];
    }
    
    // Safe type checking with fallback
    const furnitureType = furniture.type || 'default';
    switch (furnitureType) {
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
    if (furniture.color) {
      return furniture.color;
    }
    
    // Safe type checking with fallback for color selection
    const furnitureType = furniture.type || 'default';
    switch (furnitureType) {
      case 'sofa':
        return 0x8b5cf6;
      case 'bed':
        return 0x3b82f6;
      case 'table':
        return 0x10b981;
      case 'chair':
        return 0xf59e0b;
      case 'desk':
        return 0xef4444;
      case 'wardrobe':
        return 0x6b7280;
      default:
        return 0x9ca3af;
    }
  };

  const getRotationY = () => {
    if (!furniture.rotation) return 0;
    return typeof furniture.rotation === 'object' ? (furniture.rotation?.y || 0) : furniture.rotation;
  };
  
  const geometry = getFurnitureGeometry();
  
  return (
    <group position={[x, y, z]} rotation={[0, getRotationY(), 0]}>
      <Box
        ref={meshRef}
        args={geometry}
        position={[0, geometry[1] / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        <meshStandardMaterial color={getFurnitureColor()} />
      </Box>
    </group>
  );
}
// Scene Setup
// Scene component that contains all 3D elements
function Scene({ room, selectedObject, onObjectSelect }) {
  const controlsRef = useRef()
  const { camera } = useThree()
  
  useEffect(() => {
    if (camera) {
      camera.position.set(15, 10, 15)
      camera.lookAt(0, 0, 0)
    }
  }, [camera])
  
  return (
    <>
      {/* Lighting with error boundaries */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />
      
<Grid
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
      {room?.dimensions && (
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
      )}

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