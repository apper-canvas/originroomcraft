import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import ThreeViewport from "@/components/organisms/ThreeViewport";
import ToolPalette from "@/components/organisms/ToolPalette";
import PropertiesPanel from "@/components/organisms/PropertiesPanel";
import SaveLoadDialog from "@/components/organisms/SaveLoadDialog";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import {
  generateId,
  getFurnitureDefaults,
  processFurnitureMovement,
} from "@/utils/helpers";
import { roomService } from "@/services/api/roomService";

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
    lastModified: new Date(),
  });

  const [selectedTool, setSelectedTool] = useState("select");
  const [selectedObject, setSelectedObject] = useState(null);
  const [cameraView, setCameraView] = useState("perspective");

  // Initialize 3D engine
  useEffect(() => {
    const initializeEngine = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate 3D engine initialization
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Initialize default room
        const defaultRoom = await roomService.createRoom({
          name: "My Room",
          dimensions: { width: 10, length: 10, height: 3 },
          walls: [],
          furniture: [],
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
    // Clear selection when switching to non-interactive tools
    if (tool !== "select" && tool !== "move") {
      setSelectedObject(null);
      setPropertiesOpen(false);
    }
  };

  // Handle object selection in 3D scene with improved state management
  const handleObjectSelect = (object) => {
    // Always update selected object
    setSelectedObject(object);

    // Smart tool switching logic
    if (object) {
      // If no tool is selected or using a non-interactive tool, switch to select
      if (
        !selectedTool ||
        (selectedTool !== "select" && selectedTool !== "move")
      ) {
        setSelectedTool("select");
      }
      // Always open properties panel when object is selected
      setPropertiesOpen(true);
    } else {
      // When deselecting (clicking on empty space), close properties panel
      setPropertiesOpen(false);
      // Only switch away from select tool if we're not in move mode
      if (selectedTool === "select") {
        setSelectedTool("select"); // Keep select tool active for next selection
      }
    }
  };

  // Enhanced object update handler with proper ID validation and improved structure support
  const handleObjectUpdate = (objectId, updates) => {
    // Handle special actions first
    if (objectId === "duplicate" && updates && typeof updates === "object") {
      setRoom((prevRoom) => {
        const newRoom = { ...prevRoom };
        const duplicatedObject = { ...updates };

        if (
          duplicatedObject.type === "furniture" ||
          duplicatedObject.furnitureType
        ) {
          newRoom.furniture.push(duplicatedObject);
          // Update selected object to the duplicated one
          setSelectedObject(duplicatedObject);
          toast.success("Furniture duplicated successfully!");
        }

        newRoom.lastModified = new Date();
        return newRoom;
      });
      return;
    }

    setRoom((prevRoom) => {
      const newRoom = { ...prevRoom };

      // Validate objectId is integer
      const validObjectId = Number.isInteger(objectId)
        ? objectId
        : parseInt(objectId);
      if (!validObjectId || validObjectId <= 0) {
        console.warn(
          "Invalid object ID provided to handleObjectUpdate:",
          objectId
        );
        return prevRoom;
      }

      // Handle special actions
      if (updates.action === "delete") {
        // Remove object by ID from all collections
        newRoom.furniture = newRoom.furniture.filter(
          (item) => item.id !== validObjectId
        );
        newRoom.walls = newRoom.walls.filter(
          (wall) => wall.id !== validObjectId
        );
        if (newRoom.ceiling && newRoom.ceiling.id === validObjectId) {
          newRoom.ceiling = null;
        }
        setSelectedObject(null);
        toast.success("Object deleted successfully!");
        newRoom.lastModified = new Date();
        return newRoom;
      }

      // Find and update objects with enhanced validation
      const furnitureIndex = newRoom.furniture.findIndex(
        (item) => item.id === validObjectId
      );
      const wallIndex = newRoom.walls.findIndex(
        (wall) => wall.id === validObjectId
      );

      if (furnitureIndex >= 0) {
        // Update furniture with enhanced validation
        const currentFurniture = newRoom.furniture[furnitureIndex];
        const updatedFurniture = {
          ...currentFurniture,
          ...updates,
        };

        // Validate and process furniture position if provided
        if (updates.position) {
          const roomDims = newRoom.dimensions || { width: 10, length: 10 };
          const furnitureDims = updatedFurniture.dimensions ||
            getFurnitureDefaults(updatedFurniture.type)?.dimensions || {
              width: 1,
              depth: 1,
            };

          // Process position with constraints
          updatedFurniture.position = processFurnitureMovement(
            updates.position,
            roomDims,
            furnitureDims,
            { enableSnap: true, enableConstraints: true }
          );
        }

        // Validate rotation object structure
        if (updates.rotation && typeof updates.rotation === "object") {
          updatedFurniture.rotation = {
            x: Number(updates.rotation.x) || 0,
            y: Number(updates.rotation.y) || 0,
            z: Number(updates.rotation.z) || 0,
          };
        }

        // Validate scale object structure
        if (updates.scale && typeof updates.scale === "object") {
          updatedFurniture.scale = {
            x: Math.max(0.1, Number(updates.scale.x) || 1),
            y: Math.max(0.1, Number(updates.scale.y) || 1),
            z: Math.max(0.1, Number(updates.scale.z) || 1),
          };
        }

        newRoom.furniture[furnitureIndex] = updatedFurniture;

        // Update selected object if it's the one being modified
        if (selectedObject && selectedObject.id === validObjectId) {
          setSelectedObject(updatedFurniture);
        }
      } else if (wallIndex >= 0) {
        // Update wall object with validation
        const currentWall = newRoom.walls[wallIndex];
        const updatedWall = {
          ...currentWall,
          ...updates,
        };

        // Validate and process wall position if provided
        if (updates.position) {
          const roomDims = newRoom.dimensions || { width: 10, length: 10 };
          const wallDims = updatedWall.dimensions || { width: 5, height: 3 };

          // Process wall position with constraints
          updatedWall.position = {
            x: Math.max(
              -(roomDims.width / 2),
              Math.min(roomDims.width / 2, Number(updates.position.x) || 0)
            ),
            z: Math.max(
              -(roomDims.length / 2),
              Math.min(roomDims.length / 2, Number(updates.position.z) || 0)
            ),
          };
        }

        // Validate wall dimensions
        if (updates.dimensions) {
          updatedWall.dimensions = {
            width: Math.max(
              0.1,
              Math.min(50, Number(updates.dimensions.width) || 1)
            ),
            height: Math.max(
              0.1,
              Math.min(10, Number(updates.dimensions.height) || 1)
            ),
          };
        }

        // Validate wall rotation
        if (updates.rotation !== undefined) {
          updatedWall.rotation = Number(updates.rotation) || 0;
        }

        newRoom.walls[wallIndex] = updatedWall;

        // Update selected object if it's the one being modified
        if (selectedObject && selectedObject.id === validObjectId) {
          setSelectedObject(updatedWall);
        }
      } else if (newRoom.ceiling && newRoom.ceiling.id === validObjectId) {
        // Handle ceiling updates with validation
        const updatedCeiling = {
          ...newRoom.ceiling,
          ...updates,
        };

        // Validate ceiling height
        if (updates.height !== undefined) {
          updatedCeiling.height = Math.max(
            2,
            Math.min(10, Number(updates.height) || 3)
          );
        }

        // Validate ceiling color
        if (updates.color && typeof updates.color === "string") {
          updatedCeiling.color = updates.color;
        }

        // Validate ceiling material
        if (updates.material && typeof updates.material === "string") {
          updatedCeiling.material = updates.material;
        }

        newRoom.ceiling = updatedCeiling;

        // Update selected object if it's the one being modified
        if (selectedObject && selectedObject.id === validObjectId) {
          setSelectedObject(updatedCeiling);
        }
      } else {
        console.warn("Object not found for update:", validObjectId);
        return prevRoom;
      }

      // Update modification timestamp for any change
      newRoom.lastModified = new Date();
      return newRoom;
    });
  };

  // Handle adding new objects with enhanced furniture creation and validation
  const handleAddObject = (objectData) => {
    setRoom((prevRoom) => {
      const newRoom = { ...prevRoom };

      if (objectData.type === "clear" && objectData.target === "furniture") {
        // Clear all furniture with selection reset
        newRoom.furniture = [];
        setSelectedObject(null);
        toast.success("All furniture cleared!");
      } else if (objectData.type === "reset" && objectData.target === "room") {
        // Reset room to defaults
        newRoom.dimensions = { width: 10, length: 10, height: 3 };
        newRoom.furniture = [];
        newRoom.walls = [];
        newRoom.ceiling = null;
        setSelectedObject(null);
        toast.success("Room reset to defaults!");
      } else if (objectData.type === "furniture") {
        // Create new furniture with proper ID and enhanced defaults
        const furnitureType =
          objectData.furnitureType || objectData.subType || "table";
        const defaults = getFurnitureDefaults(furnitureType);

        const newFurniture = {
          id: generateId(), // Generate integer ID
          type: furnitureType,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          // Use defaults with fallbacks
          dimensions: objectData.dimensions ||
            defaults?.dimensions || { width: 1, height: 1, depth: 1 },
          color: objectData.color || defaults?.color || "#6b7280",
          material: objectData.material || defaults?.material || "wood",
        };

        newRoom.furniture.push(newFurniture);

        // Auto-select newly created furniture for immediate editing
        setSelectedObject(newFurniture);
        setSelectedTool("select");
        setPropertiesOpen(true);

        toast.success(
          `${
            furnitureType.charAt(0).toUpperCase() + furnitureType.slice(1)
          } added successfully!`
        );
      } else if (objectData.type === "wall") {
        // Create new wall with proper defaults
        const newWall = {
          id: generateId(),
          type: "wall",
          position: { x: 0, z: 0 },
          rotation: 0,
          dimensions: { width: 5, height: 3 },
          color: objectData.color || "#ffffff",
          openings: objectData.openings || [],
        };

        newRoom.walls.push(newWall);

        // Auto-select newly created wall
        setSelectedObject(newWall);
        setSelectedTool("select");
        setPropertiesOpen(true);

        toast.success("Wall added successfully!");
      } else if (objectData.type === "ceiling") {
        // Create or update ceiling
        const newCeiling = {
          id: generateId(),
          type: "ceiling",
          color: objectData.color || "#f8f9fa",
          material: objectData.material || "plaster",
          texture: objectData.texture || "smooth",
          height: objectData.height || newRoom.dimensions.height,
        };

        newRoom.ceiling = newCeiling;

        // Auto-select newly created ceiling
        setSelectedObject(newCeiling);
        setSelectedTool("select");
        setPropertiesOpen(true);

        toast.success("Ceiling added successfully!");
      } else {
        console.warn("Unknown object type for creation:", objectData);
        return prevRoom;
      }

      newRoom.lastModified = new Date();
      return newRoom;
    });
  };

  // Handle room dimension changes
  const handleRoomResize = (dimensions) => {
    setRoom((prevRoom) => ({
      ...prevRoom,
      dimensions,
      lastModified: new Date(),
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
            name={
              propertiesOpen || selectedObject ? "ChevronRight" : "Settings"
            }
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
