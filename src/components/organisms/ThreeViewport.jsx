import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box, Grid, OrbitControls, Plane, Text } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import {
  applyDragOffset,
  calculateDragOffset,
  getFurnitureColor,
  processDragPosition,
  screenToWorld,
} from "@/utils/helpers";
import ApperIcon from "@/components/ApperIcon";
// Room component that renders the 3D room structure
function Room({
  room,
  selectedTool,
  selectedObject,
  onObjectSelect,
  onObjectUpdate,
  orbitControlsRef,
}) {
  const { width = 10, length = 10, height = 3 } = room?.dimensions || {};
  // Defensive checks for valid dimensions
  if (
    !width ||
    !length ||
    !height ||
    width <= 0 ||
    length <= 0 ||
    height <= 0
  ) {
    console.warn("Invalid room dimensions:", { width, length, height });
    return null;
  }

  // Handle floor/background click for deselection
  const handleFloorClick = (e) => {
    e.stopPropagation();
    // Only deselect if not in move mode with an object selected
    if (selectedTool !== "move" || !selectedObject) {
      onObjectSelect(null);
    }
  };

  return (
    <group>
      {/* Floor */}
      <Plane
        args={[width, length]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handleFloorClick}
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
            selectedTool={selectedTool}
            onDrag={onObjectUpdate}
            roomDimensions={room?.dimensions}
            orbitControlsRef={orbitControlsRef}
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
          isDragMode={selectedTool === "select" || selectedTool === "move"}
          selectedTool={selectedTool}
          roomDimensions={room?.dimensions}
          orbitControlsRef={orbitControlsRef}
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
            onClick={handleFloorClick}
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
            onClick={handleFloorClick}
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
            onClick={handleFloorClick}
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
            onClick={handleFloorClick}
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
          selectedTool={selectedTool}
          onDrag={onObjectUpdate}
          orbitControlsRef={orbitControlsRef}
        />
      )}
    </group>
  );
}

// Ceiling Component with enhanced drag support
function CeilingComponent({
  ceiling,
  isSelected,
  onSelect,
  roomDimensions,
  selectedTool,
  onDrag,
  orbitControlsRef,
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const { gl, camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0, z: 0 });
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!ceiling || typeof ceiling !== "object" || !meshRef.current) return;

    if (isSelected) {
      meshRef.current.material.color.setHex(0x3b82f6);
    } else {
      const color = ceiling.color
        ? new THREE.Color(ceiling.color).getHex()
        : 0xf8f9fa;
      meshRef.current.material.color.setHex(color);
    }
  }, [isSelected, ceiling]);

  // Global event listeners for drag operations
  useEffect(() => {
    if (!isDragging || !dragActive) return;

    const handleGlobalMove = (e) => {
      e.preventDefault();
      handlePointerMove(e);
    };

    const handleGlobalUp = (e) => {
      e.preventDefault();
      handlePointerUp(e);
    };

    document.addEventListener("pointermove", handleGlobalMove, {
      passive: false,
    });
    document.addEventListener("pointerup", handleGlobalUp, { passive: false });
    document.addEventListener("pointercancel", handleGlobalUp, {
      passive: false,
    });

    return () => {
      document.removeEventListener("pointermove", handleGlobalMove);
      document.removeEventListener("pointerup", handleGlobalUp);
      document.removeEventListener("pointercancel", handleGlobalUp);
    };
  }, [isDragging, dragActive, dragOffset, roomDimensions]);

  // OrbitControls management effect
  useEffect(() => {
    if (!orbitControlsRef?.current) return;

    const controls = orbitControlsRef.current;
    const originalEnabled = controls.enabled;

    if (isDragging && dragActive) {
      controls.enabled = false;
    } else if (!isDragging) {
      controls.enabled = originalEnabled;
    }

    return () => {
      if (controls) {
        controls.enabled = originalEnabled;
      }
    };
  }, [isDragging, dragActive]);

  if (!ceiling || typeof ceiling !== "object" || !roomDimensions) {
    return null;
  }

  const { width = 10, length = 10 } = roomDimensions;
  const height = ceiling.height || 3;

  // Enhanced click handler with drag support
  const handlePointerDown = (e) => {
    e.stopPropagation();
    onSelect?.(ceiling);

    // Only proceed with drag if in move mode
    if (selectedTool !== "move") {
      return;
    }

    // Validate prerequisites for dragging
    if (!gl?.domElement || !camera) {
      console.warn("Required Three.js components not available for dragging");
      return;
    }

    setIsDragging(true);
    setDragActive(true);

    // Calculate world position from screen coordinates
    const rect = gl.domElement.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    try {
      const worldPos = screenToWorld(screenX, screenY, camera, gl.domElement);
      if (worldPos) {
        const offset = calculateDragOffset(worldPos, {
          x: 0,
          y: height,
          z: 0,
        });
        setDragOffset(offset);
      }

      gl.domElement.style.cursor = "grabbing";
      e.preventDefault();
    } catch (error) {
      console.error("Error starting ceiling drag operation:", error);
      setIsDragging(false);
      setDragActive(false);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !dragActive) return;

    if (!gl?.domElement || !camera) return;

    e.stopPropagation();
    e.preventDefault();

    const rect = gl.domElement.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    try {
      const worldPos = screenToWorld(screenX, screenY, camera, gl.domElement);
      if (!worldPos) return;

      const newPos = applyDragOffset(worldPos, dragOffset);

      // For ceiling, we mainly adjust height
      const processedHeight = Math.max(2, Math.min(10, newPos.y));

      if (onDrag) {
        onDrag(ceiling.id, {
          height: processedHeight,
        });
      }
    } catch (error) {
      console.error("Error during ceiling drag move operation:", error);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging && !dragActive) return;

    e.stopPropagation();
    e.preventDefault();

    setIsDragging(false);
    setDragActive(false);

    if (gl?.domElement) {
      gl.domElement.style.cursor = selectedTool === "move" ? "grab" : "default";
    }
  };

  const isDragMode = selectedTool === "move" || selectedTool === "select";

  return (
    <group ref={groupRef}>
      <Plane
        ref={meshRef}
        args={[width, length]}
        position={[0, height, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => {
          if (isDragMode && !isDragging && gl?.domElement) {
            gl.domElement.style.cursor = "grab";
          }
        }}
        onPointerLeave={() => {
          if (!isDragging && gl?.domElement) {
            gl.domElement.style.cursor = "default";
          }
        }}
      >
        <meshStandardMaterial
          color={ceiling.color || "#f8f9fa"}
          transparent
          opacity={isDragging ? 0.7 : 0.9}
          side={THREE.DoubleSide}
        />
      </Plane>

      {/* Visual indicator when dragging */}
      {isDragging && (
        <mesh position={[0, height - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry
            args={[
              Math.max(width, length) * 0.3,
              Math.max(width, length) * 0.35,
              32,
            ]}
          />
          <meshBasicMaterial color={0x10b981} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
// Wall Component with enhanced drag support
function WallComponent({
  wall,
  isSelected,
  onSelect,
  selectedTool,
  onDrag,
  roomDimensions,
  orbitControlsRef,
}) {
  // CRITICAL: All hooks must be called before any conditional returns
  const meshRef = useRef();
  const groupRef = useRef();
  const { gl, camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0, z: 0 });
  const [dragActive, setDragActive] = useState(false);

  // useEffect must be called before any early returns to maintain hook order
  useEffect(() => {
    // Skip effect if wall is invalid or mesh not ready
    if (!wall || typeof wall !== "object" || !meshRef.current) return;

    if (isSelected) {
      meshRef.current.material.color.setHex(0x3b82f6);
    } else {
      meshRef.current.material.color.setHex(0x6b7280);
    }
  }, [isSelected, wall]);

  // Global event listeners for drag operations
  useEffect(() => {
    if (!isDragging || !dragActive) return;

    const handleGlobalMove = (e) => {
      e.preventDefault();
      handlePointerMove(e);
    };

    const handleGlobalUp = (e) => {
      e.preventDefault();
      handlePointerUp(e);
    };

    document.addEventListener("pointermove", handleGlobalMove, {
      passive: false,
    });
    document.addEventListener("pointerup", handleGlobalUp, { passive: false });
    document.addEventListener("pointercancel", handleGlobalUp, {
      passive: false,
    });

    return () => {
      document.removeEventListener("pointermove", handleGlobalMove);
      document.removeEventListener("pointerup", handleGlobalUp);
      document.removeEventListener("pointercancel", handleGlobalUp);
    };
  }, [isDragging, dragActive, dragOffset, roomDimensions]);

  // OrbitControls management effect
  useEffect(() => {
    if (!orbitControlsRef?.current) return;

    const controls = orbitControlsRef.current;
    const originalEnabled = controls.enabled;

    if (isDragging && dragActive) {
      controls.enabled = false;
    } else if (!isDragging) {
      controls.enabled = originalEnabled;
    }

    return () => {
      if (controls) {
        controls.enabled = originalEnabled;
      }
    };
  }, [isDragging, dragActive]);

  // Early return if wall object is invalid - MUST be after all hooks
  if (!wall || typeof wall !== "object") {
    console.warn("Invalid wall object provided to WallComponent");
    return null;
  }

  // Safe property access with fallback values and validation
  const { width = 1, height = 1 } = wall.dimensions || {};
  const { x = 0, z = 0 } = wall.position || {};

  // Validate geometry values to prevent Three.js errors
  const validatedGeometry = [
    Math.max(0.1, Math.min(50, Number(width) || 1)),
    Math.max(0.1, Math.min(50, Number(height) || 1)),
    0.1,
  ];

  // Validate position values
  const validatedPosition = [
    Number(x) || 0,
    validatedGeometry[1] / 2,
    Number(z) || 0,
  ];

  // Handle rotation - support both scalar and object formats with validation
  const getRotationY = () => {
    if (!wall.rotation) return 0;
    const rotation =
      typeof wall.rotation === "object" ? wall.rotation?.y || 0 : wall.rotation;
    return Number(rotation) || 0;
  };

  // Validate rotation
  const validatedRotation = [0, getRotationY(), 0];

  // Enhanced click handler with drag support
  const handlePointerDown = (e) => {
    e.stopPropagation();
    onSelect?.(wall);

    // Only proceed with drag if in move mode
    if (selectedTool !== "move") {
      return;
    }

    // Validate prerequisites for dragging
    if (!gl?.domElement || !camera) {
      console.warn("Required Three.js components not available for dragging");
      return;
    }

    setIsDragging(true);
    setDragActive(true);

    // Calculate world position from screen coordinates
    const rect = gl.domElement.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    try {
      const worldPos = screenToWorld(screenX, screenY, camera, gl.domElement);
      if (worldPos) {
        const offset = calculateDragOffset(worldPos, {
          x: validatedPosition[0],
          y: validatedPosition[1],
          z: validatedPosition[2],
        });
        setDragOffset(offset);
      }

      gl.domElement.style.cursor = "grabbing";
      e.preventDefault();
    } catch (error) {
      console.error("Error starting wall drag operation:", error);
      setIsDragging(false);
      setDragActive(false);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !dragActive) return;

    if (!gl?.domElement || !camera) return;

    e.stopPropagation();
    e.preventDefault();

    const rect = gl.domElement.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    try {
      const worldPos = screenToWorld(screenX, screenY, camera, gl.domElement);
      if (!worldPos) return;

      const newPos = applyDragOffset(worldPos, dragOffset);

      // Process position with constraints
      const processedPos = processDragPosition(
        { x: newPos.x, y: newPos.y, z: newPos.z },
        roomDimensions || { width: 10, length: 10 },
        { width: validatedGeometry[0], depth: validatedGeometry[2] },
        true, // enable snapping
        0.5 // grid size
      );

      if (processedPos && onDrag) {
        onDrag(wall.id, {
          position: { x: processedPos.x, z: processedPos.z },
        });
      }
    } catch (error) {
      console.error("Error during wall drag move operation:", error);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging && !dragActive) return;

    e.stopPropagation();
    e.preventDefault();

    setIsDragging(false);
    setDragActive(false);

    if (gl?.domElement) {
      gl.domElement.style.cursor = selectedTool === "move" ? "grab" : "default";
    }
  };

  const isDragMode = selectedTool === "move" || selectedTool === "select";

  return (
    <group ref={groupRef}>
      <Box
        ref={meshRef}
        args={validatedGeometry}
        position={validatedPosition}
        rotation={validatedRotation}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => {
          if (isDragMode && !isDragging && gl?.domElement) {
            gl.domElement.style.cursor = "grab";
          }
        }}
        onPointerLeave={() => {
          if (!isDragging && gl?.domElement) {
            gl.domElement.style.cursor = "default";
          }
        }}
      >
        <meshStandardMaterial
          color={isSelected ? 0x3b82f6 : 0x6b7280}
          transparent
          opacity={isDragging ? 0.8 : 1.0}
        />
      </Box>

      {/* Render openings (doors/windows) */}
      {wall.openings &&
        wall.openings.map((opening, index) => {
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
                validatedPosition[1] -
                  validatedGeometry[1] / 2 +
                  openingY +
                  openingHeight / 2,
                validatedPosition[2] + validatedGeometry[2] / 2 + 0.01,
              ]}
              rotation={validatedRotation}
            >
              <meshStandardMaterial
                color={opening.type === "door" ? 0x8b4513 : 0x87ceeb}
                transparent
                opacity={opening.type === "window" ? 0.3 : 1.0}
              />
            </Box>
          );
        })}

      {/* Visual indicator when dragging */}
      {isDragging && (
        <mesh
          position={[validatedPosition[0], -0.01, validatedPosition[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[
              Math.max(validatedGeometry[0], validatedGeometry[2]) * 0.6,
              Math.max(validatedGeometry[0], validatedGeometry[2]) * 0.8,
              32,
            ]}
          />
          <meshBasicMaterial color={0x10b981} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
function FurnitureComponent({
  furniture,
  isSelected,
  onSelect,
  onDrag,
  isDragMode,
  roomDimensions,
  orbitControlsRef,
  selectedTool,
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const { gl, camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0, z: 0 });
  const [dragActive, setDragActive] = useState(false);

  // Memoized handlers to prevent recreating functions on every render
  const handleGlobalMoveRef = useRef();
  const handleGlobalUpRef = useRef();

  // Material color effect - only runs when furniture is valid
  useEffect(() => {
    // Skip effect if furniture is invalid or mesh not ready
    if (!furniture || typeof furniture !== "object" || !meshRef.current) return;

    try {
      if (isSelected || isDragging) {
        meshRef.current.material.color.setHex(isDragging ? 0xf59e0b : 0x10b981);
      } else {
        meshRef.current.material.color.setHex(getFurnitureColor(furniture));
      }
    } catch (error) {
      console.error("Error updating furniture material:", error);
    }
  }, [isSelected, furniture, isDragging]);

  // Create stable handler functions
  useEffect(() => {
    handleGlobalMoveRef.current = (e) => {
      e.preventDefault();
      if (isDragging && dragActive) {
        handlePointerMove(e);
      }
    };

    handleGlobalUpRef.current = (e) => {
      e.preventDefault();
      if (isDragging || dragActive) {
        handlePointerUp(e);
      }
    };
  });

  // Global event listeners for drag operations - improved cleanup
  useEffect(() => {
    if (!isDragging || !dragActive) return;

    const handleMove = handleGlobalMoveRef.current;
    const handleUp = handleGlobalUpRef.current;

    document.addEventListener("pointermove", handleMove, { passive: false });
    document.addEventListener("pointerup", handleUp, { passive: false });
    document.addEventListener("pointercancel", handleUp, { passive: false });

    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging, dragActive]);

  // OrbitControls management effect - improved cleanup
  useEffect(() => {
    if (!orbitControlsRef?.current) return;

    const controls = orbitControlsRef.current;
    const originalEnabled = controls.enabled;

    if (isDragging && dragActive) {
      controls.enabled = false;
    } else {
      controls.enabled = originalEnabled;
    }

    // Cleanup function to restore controls state
    return () => {
      if (controls && controls.enabled !== originalEnabled) {
        controls.enabled = originalEnabled;
      }
    };
  }, [isDragging, dragActive, orbitControlsRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset cursor state on unmount
      if (gl?.domElement) {
        gl.domElement.style.cursor = "default";
      }
      // Reset drag states
      setIsDragging(false);
      setDragActive(false);
    };
  }, [gl]);

  // Early return AFTER all hooks - furniture validation
  if (!furniture || typeof furniture !== "object") {
    console.warn("Invalid furniture object provided to FurnitureComponent");
    return null;
  }

  // Safe property access with fallback values and validation
  const { x = 0, y = 0, z = 0 } = furniture.position || {};

  // Validate position values
  const validatedPosition = [Number(x) || 0, Number(y) || 0, Number(z) || 0];

  const getFurnitureGeometry = () => {
    if (furniture.dimensions) {
      const { width = 1, height = 1, depth = 1 } = furniture.dimensions || {};
      // Validate and clamp geometry values
      return [
        Math.max(0.1, Math.min(10, Number(width) || 1)),
        Math.max(0.1, Math.min(10, Number(height) || 1)),
        Math.max(0.1, Math.min(10, Number(depth) || 1)),
      ];
    }

    // Safe type checking with fallback
    const furnitureType = furniture.type || "default";
    switch (furnitureType) {
      case "sofa":
        return [2, 0.8, 1];
      case "bed":
        return [2, 0.6, 1.5];
      case "table":
        return [1.5, 0.8, 1];
      case "chair":
        return [0.6, 1, 0.6];
      case "desk":
        return [1.2, 0.8, 0.6];
      case "wardrobe":
        return [1, 2, 0.6];
      default:
        return [1, 1, 1];
    }
  };

  const getRotationY = () => {
    if (!furniture.rotation) return 0;
    const rotation =
      typeof furniture.rotation === "object"
        ? furniture.rotation?.y || 0
        : furniture.rotation;
    return Number(rotation) || 0;
  };

  // Get and validate geometry
  const geometry = getFurnitureGeometry();

  // Validate geometry array
  if (
    !Array.isArray(geometry) ||
    geometry.length !== 3 ||
    geometry.some((val) => !isFinite(val))
  ) {
    console.warn("Invalid geometry calculated for furniture:", furniture);
    return null;
  }

  // Validate rotation
  const validatedRotation = [0, getRotationY(), 0];

  // Enhanced drag event handlers with improved error handling
  const handlePointerDown = (e) => {
    // Always handle selection first
    e.stopPropagation();
    onSelect?.(furniture);

    // Only proceed with drag if in drag mode
    if (!isDragMode || (selectedTool !== "move" && selectedTool !== "select")) {
      return;
    }

    // Validate prerequisites for dragging
    if (!gl?.domElement || !camera) {
      console.warn("Required Three.js components not available for dragging");
      return;
    }

    setIsDragging(true);
    setDragActive(true);

    // Calculate world position from screen coordinates
    const rect = gl.domElement.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    try {
      // Calculate drag offset for smooth dragging
      const worldPos = screenToWorld(screenX, screenY, camera, gl.domElement);
      if (worldPos) {
        const offset = calculateDragOffset(worldPos, {
          x: validatedPosition[0],
          y: validatedPosition[1],
          z: validatedPosition[2],
        });
        setDragOffset(offset);
      }

      // Set cursor state
      gl.domElement.style.cursor = "grabbing";

      // Prevent default to avoid unwanted browser behaviors
      e.preventDefault();
    } catch (error) {
      console.error("Error starting drag operation:", error);
      setIsDragging(false);
      setDragActive(false);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !dragActive || !isDragMode) return;

    // Validate prerequisites
    if (!gl?.domElement || !camera) return;

    const rect = gl.domElement.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    try {
      const worldPos = screenToWorld(screenX, screenY, camera, gl.domElement);
      if (!worldPos) return;

      const newPos = applyDragOffset(worldPos, dragOffset);

      // Get structure dimensions for boundary checking
      const structureDimensions = {
        width: geometry[0],
        depth: geometry[2],
        height: geometry[1],
      };

      // Process position with enhanced constraints and snapping
      const processedPos = processDragPosition(
        newPos,
        roomDimensions || { width: 10, length: 10 },
        structureDimensions,
        true, // enable snapping
        0.5 // grid size
      );

      // Validate the movement before applying
      if (processedPos && onDrag && furniture.id) {
        onDrag(furniture.id, {
          position: processedPos,
        });
      }
    } catch (error) {
      console.error("Error during drag move operation:", error);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging && !dragActive) return;

    setIsDragging(false);
    setDragActive(false);

    // Reset cursor state
    if (gl?.domElement) {
      gl.domElement.style.cursor = isDragMode ? "grab" : "default";
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
          if (isDragMode && !isDragging && gl?.domElement) {
            gl.domElement.style.cursor = "grab";
          }
        }}
        onPointerLeave={() => {
          if (!isDragging && gl?.domElement) {
            gl.domElement.style.cursor = "default";
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
          <ringGeometry
            args={[
              Math.max(geometry[0], geometry[2]) * 0.6,
              Math.max(geometry[0], geometry[2]) * 0.8,
              32,
            ]}
          />
          <meshBasicMaterial color={0x10b981} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

// Scene Setup
// Scene component that contains all 3D elements
function Scene({
  room,
  selectedObject,
  onObjectSelect,
  onObjectUpdate,
  selectedTool,
  orbitControlsRef,
}) {
  const controlsRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (camera) {
      camera.position.set(15, 10, 15);
      camera.lookAt(0, 0, 0);
    }
  }, [camera]);

  return (
    <>
      {/* Lighting with error boundaries */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />
      <Grid sectionSize={5} sectionThickness={1} sectionColor="#cbd5e1" />
      <Room
        room={room}
        selectedObject={selectedObject}
        onObjectSelect={onObjectSelect}
        onObjectUpdate={onObjectUpdate}
        selectedTool={selectedTool}
        orbitControlsRef={orbitControlsRef}
      />
    </>
  );
}

// Main Viewport Component
const ThreeViewport = ({
  room,
  selectedTool,
  selectedObject,
  onObjectSelect,
  onObjectUpdate,
  cameraView,
  onCameraViewChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const orbitControlsRef = useRef();

  const handleCameraPreset = (preset) => {
    if (!orbitControlsRef.current) return;

    const controls = orbitControlsRef.current;
    const camera = controls.object;

    switch (preset) {
      case "top":
        camera.position.set(0, 20, 0);
        controls.target.set(0, 0, 0);
        break;
      case "front":
        camera.position.set(0, 5, 15);
        controls.target.set(0, 0, 0);
        break;
      case "side":
        camera.position.set(15, 5, 0);
        controls.target.set(0, 0, 0);
        break;
      case "isometric":
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
          ref={orbitControlsRef}
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
          onObjectUpdate={onObjectUpdate}
          selectedTool={selectedTool}
          orbitControlsRef={orbitControlsRef}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 flex space-x-2">
        {[
          { key: "perspective", icon: "Eye", label: "Perspective" },
          { key: "top", icon: "Square", label: "Top View" },
          { key: "front", icon: "RectangleHorizontal", label: "Front View" },
          { key: "side", icon: "RectangleVertical", label: "Side View" },
          { key: "isometric", icon: "Box", label: "Isometric" },
        ].map((view) => (
          <motion.button
            key={view.key}
            onClick={() => handleCameraPreset(view.key)}
            className={`p-3 rounded-lg backdrop-blur-md border shadow-lg transition-all duration-200 ${
              cameraView === view.key
                ? "bg-primary text-white border-primary"
                : "bg-white/90 text-gray-700 border-gray-200/50 hover:bg-white"
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
              {selectedObject.type || "Object"} Selected
            </span>
          </div>
        </motion.div>
      )}
      {/* Room Dimensions Display */}
      {room?.dimensions && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-lg px-4 py-2 shadow-lg">
          <div className="text-sm text-gray-600">
            <div className="font-medium text-gray-800 mb-1">
              Room Dimensions
            </div>
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
