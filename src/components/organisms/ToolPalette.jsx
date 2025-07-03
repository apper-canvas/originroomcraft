import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const ToolPalette = ({ selectedTool, onToolSelect, onAddObject, room, onRoomResize }) => {
  const [activeSection, setActiveSection] = useState('tools');
  const [roomDimensions, setRoomDimensions] = useState(room.dimensions);

  const toolSections = [
    {
      id: 'tools',
      title: 'Tools',
      icon: 'MousePointer',
      items: [
        { id: 'select', icon: 'MousePointer', label: 'Select' },
        { id: 'move', icon: 'Move', label: 'Move' },
        { id: 'rotate', icon: 'RotateCw', label: 'Rotate' },
        { id: 'scale', icon: 'Maximize', label: 'Scale' },
      ]
    },
{
      id: 'structure',
      title: 'Structure',
      icon: 'Home',
      items: [
        { id: 'wall', icon: 'Square', label: 'Wall' },
        { id: 'door', icon: 'DoorOpen', label: 'Door' },
        { id: 'window', icon: 'RectangleHorizontal', label: 'Window' },
        { id: 'ceiling', icon: 'Layers', label: 'Ceiling' },
      ]
    },
    {
      id: 'furniture',
      title: 'Furniture',
      icon: 'Package',
      items: [
        { id: 'sofa', icon: 'Sofa', label: 'Sofa' },
        { id: 'bed', icon: 'Bed', label: 'Bed' },
        { id: 'table', icon: 'Table', label: 'Table' },
        { id: 'chair', icon: 'Chair', label: 'Chair' },
        { id: 'desk', icon: 'Laptop', label: 'Desk' },
        { id: 'wardrobe', icon: 'Package', label: 'Wardrobe' },
      ]
    }
  ];

  const colorPresets = [
    { name: 'White', color: '#ffffff' },
    { name: 'Light Gray', color: '#f8f9fa' },
    { name: 'Beige', color: '#f5f5dc' },
    { name: 'Light Blue', color: '#e3f2fd' },
    { name: 'Light Green', color: '#e8f5e8' },
    { name: 'Light Pink', color: '#fce4ec' },
    { name: 'Light Yellow', color: '#fff9c4' },
    { name: 'Light Purple', color: '#f3e5f5' },
  ];

  const handleToolClick = (toolId) => {
    onToolSelect(toolId);
  };

  const handleAddFurniture = (furnitureType) => {
    onAddObject({
      type: 'furniture',
      furnitureType: furnitureType,
      color: '#6b7280',
      material: 'wood'
    });
  };

const handleAddStructure = (structureType) => {
    if (structureType === 'door' || structureType === 'window') {
      onAddObject({
        type: 'wall',
        color: '#ffffff',
        openings: [{
          type: structureType,
          position: { x: 0, y: 0 },
          dimensions: structureType === 'door' 
            ? { width: 0.8, height: 2.0 }
            : { width: 1.2, height: 1.0 }
        }]
      });
    } else if (structureType === 'ceiling') {
      onAddObject({
        type: 'ceiling',
        color: '#f8f9fa',
        material: 'plaster',
        height: room.dimensions.height
      });
    } else {
      onAddObject({
        type: structureType,
        color: '#ffffff',
        openings: []
      });
    }
  };

  const handleRoomDimensionChange = (dimension, value) => {
    const newDimensions = { ...roomDimensions, [dimension]: Math.max(1, value) };
    setRoomDimensions(newDimensions);
    onRoomResize(newDimensions);
  };

  return (
    <div className="h-full flex flex-col bg-white/95 backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50">
        <h2 className="text-lg font-bold text-gray-800">Design Tools</h2>
        <p className="text-sm text-gray-600">Create and customize your room</p>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-200/50">
        {toolSections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <ApperIcon name={section.icon} size={16} />
            <span className="hidden sm:inline">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Room Dimensions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
            <ApperIcon name="Home" size={16} />
            <span>Room Dimensions</span>
          </h3>
          
          <div className="space-y-3">
            {[
              { key: 'width', label: 'Width (m)', icon: 'ArrowLeftRight' },
              { key: 'length', label: 'Length (m)', icon: 'ArrowUpDown' },
              { key: 'height', label: 'Height (m)', icon: 'ArrowUp' }
            ].map(({ key, label, icon }) => (
              <div key={key} className="form-group">
                <label className="form-label flex items-center space-x-2">
                  <ApperIcon name={icon} size={14} />
                  <span>{label}</span>
                </label>
                <input
                  type="number"
                  value={roomDimensions[key]}
                  onChange={(e) => handleRoomDimensionChange(key, parseFloat(e.target.value) || 0)}
                  min="1"
                  max="20"
                  step="0.1"
                  className="form-input"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tool Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
            <ApperIcon name={toolSections.find(s => s.id === activeSection)?.icon} size={16} />
            <span>{toolSections.find(s => s.id === activeSection)?.title}</span>
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            {toolSections.find(s => s.id === activeSection)?.items.map((tool) => (
              <motion.button
                key={tool.id}
                onClick={() => {
                  if (activeSection === 'tools') {
                    handleToolClick(tool.id);
                  } else if (activeSection === 'furniture') {
                    handleAddFurniture(tool.id);
                  } else if (activeSection === 'structure') {
                    handleAddStructure(tool.id);
                  }
                }}
                className={`tool-item ${selectedTool === tool.id ? 'active' : ''} ${
                  activeSection === 'tools' && selectedTool === tool.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white hover:bg-gray-50 text-gray-700'
                } border border-gray-200/50`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={tool.label}
              >
                <ApperIcon name={tool.icon} size={20} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
            <ApperIcon name="Palette" size={16} />
            <span>Wall Colors</span>
          </h3>
          
          <div className="grid grid-cols-4 gap-2">
            {colorPresets.map((preset) => (
              <motion.button
                key={preset.name}
                onClick={() => {
                  // Apply color to selected wall or add new wall with color
                  if (selectedTool === 'wall') {
                    handleAddStructure('wall');
                  }
                }}
                className="color-swatch"
                style={{ backgroundColor: preset.color }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
            <ApperIcon name="Zap" size={16} />
            <span>Quick Actions</span>
          </h3>
          
          <div className="space-y-2">
<motion.button
              onClick={() => {
                // Clear all furniture
                onAddObject({ type: 'clear', target: 'furniture' });
              }}
              className="w-full btn-ghost text-left flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ApperIcon name="Trash2" size={16} />
              <span>Clear Furniture</span>
            </motion.button>
            
            <motion.button
              onClick={() => {
                // Reset room to default state
                onAddObject({ type: 'reset', target: 'room' });
                setRoomDimensions({ width: 10, length: 10, height: 3 });
              }}
              className="w-full btn-ghost text-left flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ApperIcon name="RotateCcw" size={16} />
              <span>Reset Room</span>
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
            <ApperIcon name="BarChart3" size={16} />
            <span>Room Stats</span>
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Floor Area:</span>
              <span className="font-medium">
                {(room.dimensions.width * room.dimensions.length).toFixed(1)} m²
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Volume:</span>
              <span className="font-medium">
                {(room.dimensions.width * room.dimensions.length * room.dimensions.height).toFixed(1)} m³
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Furniture:</span>
              <span className="font-medium">{room.furniture.length} items</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Walls:</span>
              <span className="font-medium">{room.walls.length} items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolPalette;