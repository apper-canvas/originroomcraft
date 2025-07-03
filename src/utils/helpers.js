import React from "react";
import Error from "@/components/ui/Error";
// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
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
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    errors.push('Width must be greater than 0');
  }
  
  if (!length || length <= 0) {
    errors.push('Length must be greater than 0');
  }
  
  if (!height || height <= 0) {
    errors.push('Height must be greater than 0');
  }
  
  if (width > 50) {
    errors.push('Width cannot exceed 50 meters');
  }
  
  if (length > 50) {
    errors.push('Length cannot exceed 50 meters');
  }
  
  if (height > 10) {
    errors.push('Height cannot exceed 10 meters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate random color
export const generateRandomColor = () => {
  const colors = [
    '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#ec4899', '#f43f5e', '#6b7280', '#374151', '#1f2937'
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
    x >= -width / 2 && x <= width / 2 &&
    z >= -length / 2 && z <= length / 2
  );
};

// Get furniture default properties
export const getFurnitureDefaults = (type) => {
  const defaults = {
    sofa: {
      dimensions: { width: 2, height: 0.8, depth: 1 },
      color: '#8b5cf6',
      material: 'fabric'
    },
    bed: {
      dimensions: { width: 2, height: 0.6, depth: 1.5 },
      color: '#06b6d4',
      material: 'fabric'
    },
    table: {
      dimensions: { width: 1.5, height: 0.8, depth: 1 },
      color: '#f59e0b',
      material: 'wood'
    },
    chair: {
      dimensions: { width: 0.6, height: 1, depth: 0.6 },
      color: '#10b981',
      material: 'plastic'
    },
    desk: {
      dimensions: { width: 1.2, height: 0.8, depth: 0.6 },
      color: '#3b82f6',
      material: 'wood'
    },
    wardrobe: {
      dimensions: { width: 1, height: 2, depth: 0.6 },
      color: '#ef4444',
      material: 'wood'
    }
  };
  
  return defaults[type] || defaults.table;
};

// Get furniture color based on type or custom color
export const getFurnitureColor = (furniture) => {
  if (!furniture || typeof furniture !== 'object') {
    return 0x9ca3af; // Default gray color
  }
  
  if (furniture.color) {
    // Handle hex string colors
    if (typeof furniture.color === 'string') {
      const hexColor = furniture.color.replace('#', '');
      const color = parseInt(hexColor, 16);
      return !isNaN(color) ? color : 0x9ca3af;
    }
    
    // Handle numeric colors
    const color = Number(furniture.color);
    return !isNaN(color) ? color : 0x9ca3af;
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

// Export room to JSON
export const exportRoomToJSON = (room) => {
  const exportData = {
    name: room.name,
    dimensions: room.dimensions,
    walls: room.walls,
    furniture: room.furniture,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(exportData, null, 2);
};

// Import room from JSON
export const importRoomFromJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate required fields
    if (!data.dimensions || !data.walls || !data.furniture) {
      throw new Error('Invalid room data format');
    }
    
    return {
      Id: generateId(),
      name: data.name || 'Imported Room',
      dimensions: data.dimensions,
      walls: data.walls,
      furniture: data.furniture,
      lastModified: new Date().toISOString()
    };
  } catch (error) {
    throw new Error('Failed to import room: ' + error.message);
  }
};

// Local storage helpers
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
    return false;
  }
};