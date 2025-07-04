import * as THREE from "three";
// Generate unique integer ID
let lastUsedId = 0;
export const generateId = () => {
  return ++lastUsedId;
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Clamp number between min and max
export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

// Convert degrees to radians
export const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Convert radians to degrees
export const toDegrees = (radians) => {
  return radians * (180 / Math.PI);
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const clonedObj = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Calculate room area
export const calculateRoomArea = (width, length) => {
  return width * length;
};

// Calculate room volume
export const calculateRoomVolume = (width, length, height) => {
  return width * length * height;
};

// Validate room dimensions
export const validateRoomDimensions = (dimensions) => {
  const { width, length, height } = dimensions;

  const errors = [];

  if (!width || width <= 0) {
    errors.push("Width must be greater than 0");
  }

  if (!length || length <= 0) {
    errors.push("Length must be greater than 0");
  }

  if (!height || height <= 0) {
    errors.push("Height must be greater than 0");
  }

  if (width > 50) {
    errors.push("Width cannot exceed 50 meters");
  }

  if (length > 50) {
    errors.push("Length cannot exceed 50 meters");
  }

  if (height > 10) {
    errors.push("Height cannot exceed 10 meters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Generate random color
export const generateRandomColor = () => {
  const colors = [
    "#ef4444",
    "#f59e0b",
    "#eab308",
    "#22c55e",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#ec4899",
    "#f43f5e",
    "#6b7280",
    "#374151",
    "#1f2937",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Calculate distance between two points
export const calculateDistance = (point1, point2) => {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  const dz = point1.z - point2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};
// Snap to grid
export const snapToGrid = (value, gridSize = 0.5) => {
  return Math.round(value / gridSize) * gridSize;
};

// Check if object is within room bounds
export const isWithinRoomBounds = (position, roomDimensions) => {
  const { x, z } = position;
  const { width, length } = roomDimensions;

  return (
    x >= -width / 2 && x <= width / 2 && z >= -length / 2 && z <= length / 2
  );
};

// Snap position to grid
export const snapPositionToGrid = (position, gridSize = 0.5) => {
  return {
    x: snapToGrid(position.x, gridSize),
    y: position.y, // Y position usually doesn't snap to grid
    z: snapToGrid(position.z, gridSize),
  };
};

// Constrain position within room bounds
export const constrainToRoomBounds = (
  position,
  roomDimensions,
  objectDimensions = {}
) => {
  const { width, length } = roomDimensions;
  const objWidth = objectDimensions.width || 1;
  const objDepth = objectDimensions.depth || 1;

  // Calculate boundaries accounting for object size
  const maxX = width / 2 - objWidth / 2;
  const minX = -(width / 2) + objWidth / 2;
  const maxZ = length / 2 - objDepth / 2;
  const minZ = -(length / 2) + objDepth / 2;

  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: position.y,
    z: Math.max(minZ, Math.min(maxZ, position.z)),
  };
};

// Process furniture position for dragging
export const processDragPosition = (
  position,
  roomDimensions,
  objectDimensions,
  enableSnap = true,
  gridSize = 0.5
) => {
  let newPosition = { ...position };

  // First constrain to room bounds
  newPosition = constrainToRoomBounds(
    newPosition,
    roomDimensions,
    objectDimensions
  );

  // Then snap to grid if enabled
  if (enableSnap) {
    newPosition = snapPositionToGrid(newPosition, gridSize);
  }

  return newPosition;
};

// Convert screen coordinates to world coordinates for Three.js
export const screenToWorld = (screenX, screenY, camera, domElement) => {
  if (!camera || !domElement) {
    console.error(
      "Camera and domElement are required for screenToWorld conversion"
    );
    return { x: 0, y: 0, z: 0 };
  }

  const mouse = {
    x: (screenX / domElement.clientWidth) * 2 - 1,
    y: -(screenY / domElement.clientHeight) * 2 + 1,
  };

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  // Intersect with ground plane (y = 0)
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const intersection = new THREE.Vector3();
  raycaster.ray.intersectPlane(groundPlane, intersection);

  return intersection;
};

// Calculate offset for drag operations
export const calculateDragOffset = (clickPosition, objectPosition) => {
  return {
    x: clickPosition.x - objectPosition.x,
    y: clickPosition.y - objectPosition.y,
    z: clickPosition.z - objectPosition.z,
  };
};

// Apply drag offset to maintain relative position
export const applyDragOffset = (worldPosition, dragOffset) => {
  return {
    x: worldPosition.x - dragOffset.x,
    y: worldPosition.y - dragOffset.y,
    z: worldPosition.z - dragOffset.z,
  };
};

// Get furniture default properties
export const getFurnitureDefaults = (type) => {
  const defaults = {
    sofa: {
      dimensions: { width: 2, height: 0.8, depth: 1 },
      color: "#8b5cf6",
      material: "fabric",
    },
    bed: {
      dimensions: { width: 2, height: 0.6, depth: 1.5 },
      color: "#06b6d4",
      material: "fabric",
    },
    table: {
      dimensions: { width: 1.5, height: 0.8, depth: 1 },
      color: "#f59e0b",
      material: "wood",
    },
    chair: {
      dimensions: { width: 0.6, height: 1, depth: 0.6 },
      color: "#10b981",
      material: "plastic",
    },
    desk: {
      dimensions: { width: 1.2, height: 0.8, depth: 0.6 },
      color: "#3b82f6",
      material: "wood",
    },
    wardrobe: {
      dimensions: { width: 1, height: 2, depth: 0.6 },
      color: "#ef4444",
      material: "wood",
    },
  };

  return defaults[type] || defaults.table;
};

// Get furniture color based on type or custom color
export const getFurnitureColor = (furniture) => {
  if (!furniture || typeof furniture !== "object") {
    return 0x9ca3af; // Default gray color
  }

  if (furniture.color) {
    // Handle hex string colors
    if (typeof furniture.color === "string") {
      const hexColor = furniture.color.replace("#", "");
      const color = parseInt(hexColor, 16);
      return !isNaN(color) ? color : 0x9ca3af;
    }

    // Handle numeric colors
    const color = Number(furniture.color);
    return !isNaN(color) ? color : 0x9ca3af;
  }

  // Safe type checking with fallback for color selection
  const furnitureType = furniture.type || furniture.furnitureType || "default";
  switch (furnitureType) {
    case "sofa":
      return 0x8b5cf6;
    case "bed":
      return 0x3b82f6;
    case "table":
      return 0x10b981;
    case "chair":
      return 0xf59e0b;
    case "desk":
      return 0xef4444;
    case "wardrobe":
      return 0x6b7280;
    default:
      return 0x9ca3af;
  }
};

// Export room to JSON
export const exportRoomToJSON = (room) => {
  const exportData = {
    name: room.name,
    dimensions: room.dimensions,
    walls: room.walls,
    furniture: room.furniture,
    exportDate: new Date().toISOString(),
    version: "1.0",
  };

  return JSON.stringify(exportData, null, 2);
};

// Import room from JSON
export const importRoomFromJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    // Validate required fields
    if (!data.dimensions || !data.walls || !data.furniture) {
      throw new Error("Invalid room data format");
    }

    return {
      Id: generateId(),
      name: data.name || "Imported Room",
      dimensions: data.dimensions,
      walls: data.walls,
      furniture: data.furniture,
      lastModified: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error("Failed to import room: " + error.message);
  }
};

// Local storage helpers
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
    return false;
  }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Failed to remove from localStorage:", error);
    return false;
  }
};

// Clear all furniture from room
export const clearRoomFurniture = (room) => {
  return {
    ...room,
    furniture: [],
    lastModified: new Date().toISOString(),
  };
};

// Reset room to default state
export const resetRoomToDefaults = (room) => {
  return {
    ...room,
    dimensions: { width: 10, length: 10, height: 3 },
    furniture: [],
    walls: [],
    ceiling: null,
    lastModified: new Date().toISOString(),
  };
};

// Enhanced drag utilities for better structure movement
export const isDragInProgress = (dragState) => {
  return dragState && dragState.isDragging === true;
};

// Calculate smooth drag transition
export const calculateSmoothDragPosition = (startPos, endPos, progress = 1) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return {
    x: startPos.x + (endPos.x - startPos.x) * clampedProgress,
    y: startPos.y + (endPos.y - startPos.y) * clampedProgress,
    z: startPos.z + (endPos.z - startPos.z) * clampedProgress,
  };
};

// Enhanced position validation for structures
export const validateStructurePosition = (
  position,
  roomDimensions,
  structureDimensions
) => {
  if (!position || !roomDimensions) return false;

  const { x, z } = position;
  const { width, length } = roomDimensions;
  const structWidth = structureDimensions?.width || 1;
  const structDepth = structureDimensions?.depth || 1;

  // Check if structure fits within room bounds
  const minX = -(width / 2) + structWidth / 2;
  const maxX = width / 2 - structWidth / 2;
  const minZ = -(length / 2) + structDepth / 2;
  const maxZ = length / 2 - structDepth / 2;

  return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
};

// Process structure drag with enhanced validation
export const processStructureDrag = (
  position,
  roomDimensions,
  structureDimensions,
  enableSnap = true
) => {
  let newPosition = { ...position };

  // Validate structure can be placed at position
  if (
    !validateStructurePosition(newPosition, roomDimensions, structureDimensions)
  ) {
    newPosition = constrainToRoomBounds(
      newPosition,
      roomDimensions,
      structureDimensions
    );
  }

  // Apply grid snapping if enabled
  if (enableSnap) {
    newPosition = snapPositionToGrid(newPosition, 0.5);
  }

  return newPosition;
};

// Enhanced drag state management
export const createDragState = (
  initialPosition,
  offset = { x: 0, y: 0, z: 0 }
) => {
  return {
    isDragging: true,
    startPosition: { ...initialPosition },
    currentPosition: { ...initialPosition },
    offset: { ...offset },
    timestamp: Date.now(),
  };
};

// Clear drag state
export const clearDragState = () => {
  return {
    isDragging: false,
    startPosition: null,
    currentPosition: null,
    offset: { x: 0, y: 0, z: 0 },
    timestamp: null,
  };
};

// Validate drag movement with constraints
export const validateDragMovement = (
  dragState,
  newPosition,
  constraints = {}
) => {
  if (!isDragInProgress(dragState) || !newPosition) return false;

  const { maxDistance = Infinity, minMovement = 0.01 } = constraints;

  // Check minimum movement threshold
  const distance = calculateDistance(dragState.startPosition, newPosition);
  if (distance < minMovement) return false;

  // Check maximum distance constraint
  if (distance > maxDistance) return false;

  return true;
};

// Enhanced furniture movement processing
export const processFurnitureMovement = (
  position,
  roomDimensions,
  furnitureDimensions,
  options = {}
) => {
  const {
    enableSnap = true,
    gridSize = 0.5,
    enableConstraints = true,
  } = options;

  let newPosition = { ...position };

  // Apply constraints if enabled
  if (enableConstraints) {
    newPosition = constrainToRoomBounds(
      newPosition,
      roomDimensions,
      furnitureDimensions
    );
  }

  // Apply grid snapping if enabled
  if (enableSnap) {
    newPosition = snapPositionToGrid(newPosition, gridSize);
  }

  return newPosition;
};

// Validate furniture selection by ID
export const validateFurnitureSelection = (furnitureId, furnitureList) => {
  if (!Number.isInteger(furnitureId) || furnitureId <= 0) return false;
  if (!Array.isArray(furnitureList)) return false;

  return furnitureList.some((furniture) => furniture.Id === furnitureId);
};

// Get furniture by ID with validation
export const getFurnitureById = (furnitureId, furnitureList) => {
  if (!validateFurnitureSelection(furnitureId, furnitureList)) return null;

  return (
    furnitureList.find((furniture) => furniture.Id === furnitureId) || null
  );
};

// Enhanced structure movement processing
export const processStructureMovement = (
  position,
  roomDimensions,
  structureDimensions,
  options = {}
) => {
  const {
    enableSnap = true,
    gridSize = 0.5,
    enableConstraints = true,
  } = options;

  let newPosition = { ...position };

  // Apply constraints if enabled
  if (enableConstraints) {
    newPosition = constrainToRoomBounds(
      newPosition,
      roomDimensions,
      structureDimensions
    );
  }

  // Apply grid snapping if enabled
  if (enableSnap) {
    newPosition = snapPositionToGrid(newPosition, gridSize);
  }

  return newPosition;
};

// Calculate drag boundaries for preview
export const calculateDragBoundaries = (
  roomDimensions,
  structureDimensions
) => {
  if (!roomDimensions || !structureDimensions) return null;

  const { width, length } = roomDimensions;
  const structWidth = structureDimensions?.width || 1;
  const structDepth = structureDimensions?.depth || 1;

  return {
    minX: -(width / 2) + structWidth / 2,
    maxX: width / 2 - structWidth / 2,
    minZ: -(length / 2) + structDepth / 2,
    maxZ: length / 2 - structDepth / 2,
  };
};
