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
import { generateId } from '@/utils/helpers';
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
    setSelectedObject(null);
  };

  // Handle object selection in 3D scene
  const handleObjectSelect = (object) => {
    setSelectedObject(object);
    setSelectedTool('select');
  };

  // Handle object updates
  const handleObjectUpdate = (objectId, updates) => {
    setRoom(prevRoom => {
      const newRoom = { ...prevRoom };
      
      if (updates.type === 'furniture') {
        newRoom.furniture = newRoom.furniture.map(item => 
          item.id === objectId ? { ...item, ...updates } : item
        );
      } else if (updates.type === 'wall') {
        newRoom.walls = newRoom.walls.map(wall => 
          wall.id === objectId ? { ...wall, ...updates } : wall
        );
      }
      
      newRoom.lastModified = new Date();
      return newRoom;
    });
  };

  // Handle adding new objects
  const handleAddObject = (objectData) => {
    setRoom(prevRoom => {
      const newRoom = { ...prevRoom };
      
      if (objectData.type === 'furniture') {
        newRoom.furniture.push({
          id: generateId(),
          ...objectData,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 }
        });
      } else if (objectData.type === 'wall') {
        newRoom.walls.push({
          id: generateId(),
          ...objectData,
          position: { x: 0, z: 0 },
          rotation: 0,
          dimensions: { width: 5, height: 3 },
          color: '#ffffff',
          openings: []
        });
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
        <div className="hidden lg:block w-80 sidebar">
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
        <div className="flex-1 relative">
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
              className="w-80 bg-white/90 backdrop-blur-md border-l border-gray-200/50"
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
          onClick={() => setPropertiesOpen(!propertiesOpen)}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ApperIcon 
            name={propertiesOpen ? "ChevronRight" : "Settings"} 
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