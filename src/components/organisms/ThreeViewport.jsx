import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box, Grid, OrbitControls, Plane, Text } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import { applyDragOffset, calculateDragOffset, getFurnitureColor, processDragPosition, screenToWorld } from "@/utils/helpers";
import ApperIcon from "@/components/ApperIcon";
// Room component that renders the 3D room structure
function Room({ room, selectedObject, onObjectSelect, onObjectUpdate, selectedTool }) {
  const { width = 10, length = 10, height = 3 } = room?.dimensions || {}
  
  // Defensive checks for valid dimensions
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
          onDrag={onObjectUpdate}
          isDragMode={selectedTool === 'select' || selectedTool === 'move'}
          roomDimensions={room?.dimensions}
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
{/* Ceiling */}
      {room?.ceiling && (
        <CeilingComponent
          ceiling={room.ceiling}
          isSelected={selectedObject?.id === room.ceiling.id}
          onSelect={() => onObjectSelect(room.ceiling)}
          roomDimensions={room?.dimensions}
        />
      )}
    </group>
  );
};

// Ceiling Component
function CeilingComponent({ ceiling, isSelected, onSelect, roomDimensions }) {
  const meshRef = useRef();

  useEffect(() => {
    if (!ceiling || typeof ceiling !== 'object' || !meshRef.current) return;
    
    if (isSelected) {
      meshRef.current.material.color.setHex(0x3b82f6);
    } else {
      const color = ceiling.color ? new THREE.Color(ceiling.color).getHex() : 0xf8f9fa;
      meshRef.current.material.color.setHex(color);
    }
  }, [isSelected, ceiling]);

  if (!ceiling || typeof ceiling !== 'object' || !roomDimensions) {
    return null;
  }

  const { width = 10, length = 10 } = roomDimensions;
  const height = ceiling.height || 3;

  return (
    <Plane
      ref={meshRef}
      args={[width, length]}
      position={[0, height, 0]}
      rotation={[Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(ceiling);
      }}
    >
      <meshStandardMaterial 
        color={ceiling.color || '#f8f9fa'} 
        transparent 
        opacity={0.9}
        side={THREE.DoubleSide}
      />
    </Plane>
  );
}

// Wall Component
function WallComponent({ wall, isSelected, onSelect }) {
  // CRITICAL: All hooks must be called before any conditional returns
  const meshRef = useRef();

  // useEffect must be called before any early returns to maintain hook order
  useEffect(() => {
    // Skip effect if wall is invalid or mesh not ready
    if (!wall || typeof wall !== 'object' || !meshRef.current) return;
    
    if (isSelected) {
      meshRef.current.material.color.setHex(0x3b82f6);
    } else {
      meshRef.current.material.color.setHex(0x6b7280);
    }
  }, [isSelected, wall]);

  // Early return if wall object is invalid - MUST be after all hooks
  if (!wall || typeof wall !== 'object') {
    console.warn('Invalid wall object provided to WallComponent');
    return null;
  }

  // Safe property access with fallback values and validation
  const { width = 1, height = 1 } = wall.dimensions || {};
  const { x = 0, z = 0 } = wall.position || {};

  // Validate geometry values to prevent Three.js errors
  const validatedGeometry = [
    Math.max(0.1, Math.min(50, Number(width) || 1)),
    Math.max(0.1, Math.min(50, Number(height) || 1)),
    0.1
  ];

  // Validate position values
  const validatedPosition = [
    Number(x) || 0,
    validatedGeometry[1] / 2,
    Number(z) || 0
  ];

  // Handle rotation - support both scalar and object formats with validation
  const getRotationY = () => {
    if (!wall.rotation) return 0;
    const rotation = typeof wall.rotation === 'object' ? (wall.rotation?.y || 0) : wall.rotation;
    return Number(rotation) || 0;
  };

  // Validate rotation
  const validatedRotation = [0, getRotationY(), 0];

return (
    <group>
      <Box
        ref={meshRef}
        args={validatedGeometry}
        position={validatedPosition}
        rotation={validatedRotation}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(wall);
        }}
      >
        <meshStandardMaterial color={isSelected ? 0x3b82f6 : 0x6b7280} />
      </Box>
      
      {/* Render openings (doors/windows) */}
      {wall.openings && wall.openings.map((opening, index) => {
        const openingWidth = opening.dimensions?.width || 1;
        const openingHeight = opening.dimensions?.height || 1;
        const openingX = opening.position?.x || 0;
        const openingY = opening.position?.y || 0;
        
        return (
          <Box
            key={index}
            args={[openingWidth, openingHeight, 0.05]}
            position={[
              validatedPosition[0] + openingX,
              validatedPosition[1] - validatedGeometry[1]/2 + openingY + openingHeight/2,
              validatedPosition[2] + validatedGeometry[2]/2 + 0.01
            ]}
            rotation={validatedRotation}
          >
            <meshStandardMaterial 
              color={opening.type === 'door' ? 0x8b4513 : 0x87ceeb} 
              transparent 
              opacity={opening.type === 'window' ? 0.3 : 1.0}
            />
          </Box>
        );
      })}
    </group>
  );
}

// Furniture Component with enhanced validation and error handling
function FurnitureComponent({ furniture, isSelected, onSelect, onDrag, isDragMode, roomDimensions }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0, z: 0 });

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  // Material color effect - only runs when furniture is valid
  useEffect(() => {
    // Skip effect if furniture is invalid or mesh not ready
    if (!furniture || typeof furniture !== 'object' || !meshRef.current) return;
    
    try {
      if (isSelected || isDragging) {
        meshRef.current.material.color.setHex(isDragging ? 0xf59e0b : 0x10b981);
      } else {
        meshRef.current.material.color.setHex(getFurnitureColor(furniture));
      }
    } catch (error) {
      console.error('Error updating furniture material:', error);
    }
  }, [isSelected, furniture, isDragging]);

  // Global event listeners for drag operations - only runs when dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMove = (e) => handlePointerMove(e);
    const handleGlobalUp = (e) => handlePointerUp(e);
    
    document.addEventListener('pointermove', handleGlobalMove);
    document.addEventListener('pointerup', handleGlobalUp);
    
    return () => {
      document.removeEventListener('pointermove', handleGlobalMove);
      document.removeEventListener('pointerup', handleGlobalUp);
    };
  }, [isDragging, dragOffset, roomDimensions]);

  // Early return AFTER all hooks - furniture validation
  if (!furniture || typeof furniture !== 'object') {
    console.warn('Invalid furniture object provided to FurnitureComponent');
    return null;
  }

  // Safe property access with fallback values and validation
  const { x = 0, y = 0, z = 0 } = furniture.position || {};

  // Validate position values
  const validatedPosition = [
    Number(x) || 0,
    Number(y) || 0,
    Number(z) || 0
  ];

  const getFurnitureGeometry = () => {
    if (furniture.dimensions) {
      const { width = 1, height = 1, depth = 1 } = furniture.dimensions || {};
      // Validate and clamp geometry values
      return [
        Math.max(0.1, Math.min(10, Number(width) || 1)),
        Math.max(0.1, Math.min(10, Number(height) || 1)),
        Math.max(0.1, Math.min(10, Number(depth) || 1))
      ];
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

  const getRotationY = () => {
    if (!furniture.rotation) return 0;
    const rotation = typeof furniture.rotation === 'object' ? (furniture.rotation?.y || 0) : furniture.rotation;
    return Number(rotation) || 0;
  };
  
  // Get and validate geometry
  const geometry = getFurnitureGeometry();
  
  // Validate geometry array
  if (!Array.isArray(geometry) || geometry.length !== 3 || geometry.some(val => !isFinite(val))) {
    console.warn('Invalid geometry calculated for furniture:', furniture);
    return null;
  }

  // Validate rotation
  const validatedRotation = [0, getRotationY(), 0];
  
  // Drag event handlers
  const handlePointerDown = (e) => {
    if (!isDragMode) {
      e.stopPropagation();
      onSelect?.(furniture);
      return;
    }

    e.stopPropagation();
    setIsDragging(true);
    
    // Calculate world position from screen coordinates
    const rect = gl.domElement.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    try {
      const worldPos = screenToWorld(screenX, screenY, camera, gl.domElement);
      const currentPos = { 
        x: validatedPosition[0], 
        y: validatedPosition[1], 
        z: validatedPosition[2] 
      };
      
      const offset = calculateDragOffset(worldPos, currentPos);
      setDragOffset(offset);
// Disable orbit controls during drag
      if (gl.domElement) {
        gl.domElement.style.cursor = 'grabbing';
      }
      
      // Disable OrbitControls during move tool drag
      const orbitControls = gl.domElement.querySelector('canvas')?.orbitControls;
      if (orbitControls) {
        orbitControls.enabled = false;
      }
    } catch (error) {
      console.error('Error starting drag:', error);
      setIsDragging(false);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !isDragMode) return;

    e.stopPropagation();
    
    const rect = gl.domElement.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    try {
      const worldPos = screenToWorld(screenX, screenY, camera, gl.domElement);
      const newPos = applyDragOffset(worldPos, dragOffset);
      
      // Get furniture dimensions for boundary checking
      const furnitureDimensions = {
        width: geometry[0],
        depth: geometry[2]
      };
      
      // Process position with constraints and snapping
      const processedPos = processDragPosition(
        newPos, 
        roomDimensions || { width: 10, length: 10 }, 
        furnitureDimensions,
        true, // enable snapping
        0.5   // grid size
      );
      
      // Update furniture position in real-time
      if (onDrag) {
        onDrag(furniture.id, {
          position: processedPos
        });
      }
    } catch (error) {
      console.error('Error during drag move:', error);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    
e.stopPropagation();
    setIsDragging(false);
    
    // Re-enable orbit controls
    if (gl.domElement) {
      gl.domElement.style.cursor = 'default';
    }
    
    // Re-enable OrbitControls after move tool drag
    const orbitControls = gl.domElement.querySelector('canvas')?.orbitControls;
    if (orbitControls) {
      orbitControls.enabled = true;
    }
  };

  return (
    <group 
      ref={groupRef}
      position={validatedPosition} 
      rotation={validatedRotation}
    >
      <Box
        ref={meshRef}
        args={geometry}
        position={[0, geometry[1] / 2, 0]}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => {
          if (isDragMode && gl.domElement) {
            gl.domElement.style.cursor = 'grab';
          }
        }}
        onPointerLeave={() => {
          if (!isDragging && gl.domElement) {
            gl.domElement.style.cursor = 'default';
          }
        }}
      >
        <meshStandardMaterial 
          color={getFurnitureColor(furniture)} 
          transparent
          opacity={isDragging ? 0.8 : 1.0}
        />
      </Box>
      
      {/* Visual indicator when dragging */}
      {isDragging && (
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(geometry[0], geometry[2]) * 0.6, Math.max(geometry[0], geometry[2]) * 0.8, 32]} />
          <meshBasicMaterial color={0x10b981} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
);
}

// Scene Setup
// Scene component that contains all 3D elements
function Scene({ room, selectedObject, onObjectSelect, onObjectUpdate, selectedTool }) {
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
        onObjectUpdate={onObjectUpdate}
        selectedTool={selectedTool}
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
{/* 3D Canvas */}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 75 }}
        shadows
        className="w-full h-full"
      >
        <OrbitControls
          ref={controlsRef}
          enablePan={selectedTool !== 'move'}
          enableZoom={selectedTool !== 'move'}
          enableRotate={selectedTool !== 'move'}
          onStart={() => setIsDragging(true)}
          onEnd={() => setIsDragging(false)}
        />
        
        <Scene
          room={room}
          selectedObject={selectedObject}
          onObjectSelect={onObjectSelect}
          onObjectUpdate={onObjectUpdate}
          selectedTool={selectedTool}
        />
      </Canvas>
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