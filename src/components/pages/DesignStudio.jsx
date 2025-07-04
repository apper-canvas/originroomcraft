import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import ThreeViewport from '@/components/organisms/ThreeViewport';
import ToolPalette from '@/components/organisms/ToolPalette';
import PropertiesPanel from '@/components/organisms/PropertiesPanel';
import SaveLoadDialog from '@/components/organisms/SaveLoadDialog';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { generateId, getFurnitureDefaults, processFurnitureMovement } from '@/utils/helpers';
import { roomService } from '@/services/api/roomService';

const DesignStudio = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);

  // 3D Scene State
  const [room, setRoom] = useState({
    id: generateId(),
    name: "New Room",
    dimensions: { width: 10, length: 10, height: 3 },
    walls: [],
    furniture: [],
    lastModified: new Date()
  });

  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedObject, setSelectedObject] = useState(null);
  const [cameraView, setCameraView] = useState('perspective');

  // Initialize 3D engine
  useEffect(() => {
    const initializeEngine = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate 3D engine initialization
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Initialize default room
        const defaultRoom = await roomService.createRoom({
          name: "My Room",
          dimensions: { width: 10, length: 10, height: 3 },
          walls: [],
          furniture: []
        });
        
        setRoom(defaultRoom);
        setIsLoading(false);
        
        toast.success("3D Engine initialized successfully!");
      } catch (err) {
        setError(err.message || "Failed to initialize 3D engine");
        setIsLoading(false);
      }
    };

    initializeEngine();
  }, []);

// Handle tool selection
  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    // Only clear selection if not switching to move tool
    if (tool !== 'move') {
      setSelectedObject(null);
    }
  };

// Handle object selection in 3D scene
  const handleObjectSelect = (object) => {
    setSelectedObject(object);
    // Only change tool to 'select' if not currently using 'move' tool
    // This preserves move tool when selecting structure elements
    if (selectedTool !== 'move') {
      setSelectedTool('select');
    }
    // Ensure properties panel is visible when object is selected
    if (object) {
      setPropertiesOpen(true);
    }
  };

// Enhanced object update handler with proper ID validation and furniture-specific logic
  const handleObjectUpdate = (objectId, updates) => {
    setRoom(prevRoom => {
      const newRoom = { ...prevRoom };
      
      // Validate objectId is integer
      const validObjectId = Number.isInteger(objectId) ? objectId : parseInt(objectId);
      if (!validObjectId || validObjectId <= 0) {
        console.warn('Invalid object ID provided to handleObjectUpdate:', objectId);
        return prevRoom;
      }
      
      // Handle special actions
      if (updates.action === 'delete') {
        // Remove furniture by ID
        newRoom.furniture = newRoom.furniture.filter(item => item.id !== validObjectId);
        newRoom.walls = newRoom.walls.filter(wall => wall.id !== validObjectId);
        if (newRoom.ceiling && newRoom.ceiling.id === validObjectId) {
          newRoom.ceiling = null;
        }
        setSelectedObject(null);
        toast.success('Object deleted successfully!');
        newRoom.lastModified = new Date();
        return newRoom;
      }
      
      // Find and update furniture objects with enhanced validation
      const furnitureIndex = newRoom.furniture.findIndex(item => item.id === validObjectId);
      const wallIndex = newRoom.walls.findIndex(wall => wall.id === validObjectId);
      
      if (furnitureIndex >= 0) {
        // Update furniture with position validation
        const updatedFurniture = { 
          ...newRoom.furniture[furnitureIndex], 
          ...updates 
        };
        
        // Validate furniture position if provided
        if (updates.position) {
          const roomDims = newRoom.dimensions || { width: 10, length: 10 };
          const furnitureDims = updatedFurniture.dimensions || { width: 1, depth: 1 };
          
          // Process position with constraints
          updatedFurniture.position = processFurnitureMovement(
            updates.position,
            roomDims,
            furnitureDims,
            { enableSnap: true, enableConstraints: true }
          );
        }
        
        newRoom.furniture[furnitureIndex] = updatedFurniture;
        
        // Update selected object if it's the one being modified
        if (selectedObject && selectedObject.id === validObjectId) {
          setSelectedObject(updatedFurniture);
        }
      } else if (wallIndex >= 0) {
        // Update wall object
        newRoom.walls[wallIndex] = { 
          ...newRoom.walls[wallIndex], 
          ...updates 
        };
      } else if (newRoom.ceiling && newRoom.ceiling.id === validObjectId) {
        // Handle ceiling updates
        newRoom.ceiling = { ...newRoom.ceiling, ...updates };
      }
      
      // Update modification timestamp for any change
      newRoom.lastModified = new Date();
      return newRoom;
    });
  };

// Handle adding new objects with enhanced furniture creation
  const handleAddObject = (objectData) => {
    setRoom(prevRoom => {
      const newRoom = { ...prevRoom };
      
      if (objectData.type === 'clear' && objectData.target === 'furniture') {
        // Clear all furniture with selection reset
        newRoom.furniture = [];
        setSelectedObject(null);
        toast.success("All furniture cleared!");
      } else if (objectData.type === 'reset' && objectData.target === 'room') {
        // Reset room to defaults
        newRoom.dimensions = { width: 10, length: 10, height: 3 };
        newRoom.furniture = [];
        newRoom.walls = [];
        newRoom.ceiling = null;
        setSelectedObject(null);
        toast.success("Room reset to defaults!");
      } else if (objectData.type === 'furniture') {
        // Create new furniture with proper ID and defaults
        const newFurniture = {
          id: generateId(), // Generate integer ID
          ...objectData,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          // Add furniture-specific defaults if not provided
          dimensions: objectData.dimensions || getFurnitureDefaults(objectData.subType || objectData.name)?.dimensions,
          color: objectData.color || getFurnitureDefaults(objectData.subType || objectData.name)?.color,
          material: objectData.material || getFurnitureDefaults(objectData.subType || objectData.name)?.material
        };
        
        newRoom.furniture.push(newFurniture);
        
        // Auto-select newly created furniture for immediate editing
        setSelectedObject(newFurniture);
        setSelectedTool('select');
        setPropertiesOpen(true);
        
        toast.success(`${objectData.subType || 'Furniture'} added successfully!`);
      } else if (objectData.type === 'wall') {
        const newWall = {
          id: generateId(),
          ...objectData,
          position: { x: 0, z: 0 },
          rotation: 0,
          dimensions: { width: 5, height: 3 },
          color: objectData.color || '#ffffff',
          openings: objectData.openings || []
        };
        newRoom.walls.push(newWall);
        toast.success('Wall added successfully!');
      } else if (objectData.type === 'ceiling') {
        newRoom.ceiling = {
          id: generateId(),
          type: 'ceiling',
          color: objectData.color || '#f8f9fa',
          material: objectData.material || 'plaster',
          texture: objectData.texture || 'smooth',
          height: objectData.height || newRoom.dimensions.height
        };
        toast.success('Ceiling added successfully!');
      }
      
      newRoom.lastModified = new Date();
      return newRoom;
    });
  };

  // Handle room dimension changes
  const handleRoomResize = (dimensions) => {
    setRoom(prevRoom => ({
      ...prevRoom,
      dimensions,
      lastModified: new Date()
    }));
  };

  // Handle save/load
  const handleSave = async (name) => {
    try {
      const savedRoom = await roomService.saveRoom({ ...room, name });
      setRoom(savedRoom);
      setShowSaveDialog(false);
      toast.success("Room saved successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save room");
    }
  };

  const handleLoad = async (roomId) => {
    try {
      const loadedRoom = await roomService.getRoom(roomId);
      setRoom(loadedRoom);
      setSelectedObject(null);
      setShowLoadDialog(false);
      toast.success("Room loaded successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to load room");
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={handleRetry} />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-surface to-white overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="Menu" size={24} />
          </motion.button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="Box" size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RoomCraft 3D
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setShowSaveDialog(true)}
            className="btn-primary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="Save" size={16} />
            <span>Save</span>
          </motion.button>
          
          <motion.button
            onClick={() => setShowLoadDialog(true)}
            className="btn-ghost flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="FolderOpen" size={16} />
            <span>Load</span>
          </motion.button>
        </div>
      </header>

{/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0 sidebar">
          <ToolPalette
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
            onAddObject={handleAddObject}
            room={room}
            onRoomResize={handleRoomResize}
          />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-80 sidebar"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <ToolPalette
                  selectedTool={selectedTool}
                  onToolSelect={handleToolSelect}
                  onAddObject={handleAddObject}
                  room={room}
                  onRoomResize={handleRoomResize}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
{/* 3D Viewport */}
        <div className="flex-1 min-w-0 relative">
          <ThreeViewport
            room={room}
            selectedTool={selectedTool}
            selectedObject={selectedObject}
            onObjectSelect={handleObjectSelect}
            onObjectUpdate={handleObjectUpdate}
            cameraView={cameraView}
            onCameraViewChange={setCameraView}
          />
        </div>

{/* Properties Panel */}
        <AnimatePresence>
          {(selectedObject || propertiesOpen) && (
            <motion.div
              className="w-80 flex-shrink-0 max-w-[90vw] min-w-[280px] lg:w-80 lg:max-w-80 bg-white/90 backdrop-blur-md border-l border-gray-200/50 h-full max-h-screen overflow-hidden"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <PropertiesPanel
                selectedObject={selectedObject}
                onObjectUpdate={handleObjectUpdate}
                onClose={() => {
                  setSelectedObject(null);
                  setPropertiesOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

{/* Properties Toggle Button */}
        <motion.button
          onClick={() => {
            if (propertiesOpen || selectedObject) {
              // Close the properties panel
              setPropertiesOpen(false);
              setSelectedObject(null);
            } else {
              // Open the properties panel
              setPropertiesOpen(true);
            }
          }}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ApperIcon 
            name={propertiesOpen || selectedObject ? "ChevronRight" : "Settings"} 
            size={20} 
            className="text-gray-600" 
          />
        </motion.button>
      </div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <SaveLoadDialog
            type="save"
            currentRoom={room}
            onSave={handleSave}
            onClose={() => setShowSaveDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Load Dialog */}
      <AnimatePresence>
        {showLoadDialog && (
          <SaveLoadDialog
            type="load"
            onLoad={handleLoad}
            onClose={() => setShowLoadDialog(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DesignStudio;