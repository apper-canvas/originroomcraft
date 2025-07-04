import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const PropertiesPanel = ({ selectedObject, onObjectUpdate, onClose }) => {
  const [properties, setProperties] = useState({});

  useEffect(() => {
    if (selectedObject) {
      setProperties(selectedObject);
    }
  }, [selectedObject]);

  const handlePropertyChange = (key, value) => {
    const newProperties = { ...properties, [key]: value };
    setProperties(newProperties);

    if (onObjectUpdate && selectedObject?.id) {
      // Validate ID is integer for furniture/structure operations
      const objectId = Number.isInteger(selectedObject.id)
        ? selectedObject.id
        : parseInt(selectedObject.id);
      if (objectId > 0) {
        onObjectUpdate(objectId, newProperties);
      }
    }
  };

  const handleNestedPropertyChange = (parentKey, childKey, value) => {
    const newProperties = {
      ...properties,
      [parentKey]: {
        ...properties[parentKey],
        [childKey]: value,
      },
    };
    setProperties(newProperties);

    if (onObjectUpdate && selectedObject?.id) {
      // Validate ID is integer for furniture/structure operations
      const objectId = Number.isInteger(selectedObject.id)
        ? selectedObject.id
        : parseInt(selectedObject.id);
      if (objectId > 0) {
        onObjectUpdate(objectId, newProperties);
      }
    }
  };

  const colorPresets = [
    { name: "White", color: "#ffffff" },
    { name: "Light Gray", color: "#f8f9fa" },
    { name: "Gray", color: "#6b7280" },
    { name: "Dark Gray", color: "#374151" },
    { name: "Red", color: "#ef4444" },
    { name: "Orange", color: "#f59e0b" },
    { name: "Yellow", color: "#eab308" },
    { name: "Green", color: "#22c55e" },
    { name: "Blue", color: "#3b82f6" },
    { name: "Purple", color: "#8b5cf6" },
    { name: "Pink", color: "#ec4899" },
    { name: "Brown", color: "#a3785b" },
  ];

  if (!selectedObject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <ApperIcon name="MousePointer" size={48} className="mb-4" />
        <p className="text-lg font-medium">No Object Selected</p>
        <p className="text-sm text-center">
          Click on an object in the 3D view to see its properties
        </p>
      </div>
    );
  }

  return (
    <div className="h-full max-h-screen flex flex-col bg-white/95 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Properties</h2>
          <p className="text-sm text-gray-600 capitalize">
            {selectedObject.type || "Object"} Settings
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ApperIcon name="X" size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Properties */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
            <ApperIcon name="Settings" size={16} />
            <span>Basic Properties</span>
          </h3>

          {selectedObject.type && (
            <div className="form-group">
              <label className="form-label">Type</label>
              <input
                type="text"
                value={selectedObject.type}
                className="form-input bg-gray-50"
                disabled
              />
            </div>
          )}

          {selectedObject.name && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                value={properties.name || ""}
                onChange={(e) => handlePropertyChange("name", e.target.value)}
                className="form-input"
                placeholder="Enter name"
              />
            </div>
          )}
        </div>

        {/* Position Properties */}
        {selectedObject.position && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
              <ApperIcon name="Move" size={16} />
              <span>Position</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {["x", "y", "z"].map((axis) => (
                <div key={axis} className="form-group">
                  <label className="form-label">
                    {axis.toUpperCase()} Position
                  </label>
                  <input
                    type="number"
                    value={properties.position?.[axis] || 0}
                    onChange={(e) =>
                      handleNestedPropertyChange(
                        "position",
                        axis,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    step="0.1"
                    className="form-input"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rotation Properties */}
        {selectedObject.rotation && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
              <ApperIcon name="RotateCw" size={16} />
              <span>Rotation</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {typeof selectedObject.rotation === "object" ? (
                ["x", "y", "z"].map((axis) => (
                  <div key={axis} className="form-group">
                    <label className="form-label">
                      {axis.toUpperCase()} Rotation (degrees)
                    </label>
                    <input
                      type="number"
                      value={(
                        ((properties.rotation?.[axis] || 0) * 180) /
                        Math.PI
                      ).toFixed(1)}
                      onChange={(e) =>
                        handleNestedPropertyChange(
                          "rotation",
                          axis,
                          ((parseFloat(e.target.value) || 0) * Math.PI) / 180
                        )
                      }
                      step="1"
                      min="-180"
                      max="180"
                      className="form-input"
                    />
                  </div>
                ))
              ) : (
                <div className="form-group">
                  <label className="form-label">Rotation (degrees)</label>
                  <input
                    type="number"
                    value={(
                      ((properties.rotation || 0) * 180) /
                      Math.PI
                    ).toFixed(1)}
                    onChange={(e) =>
                      handlePropertyChange(
                        "rotation",
                        ((parseFloat(e.target.value) || 0) * Math.PI) / 180
                      )
                    }
                    step="1"
                    min="-180"
                    max="180"
                    className="form-input"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scale Properties */}
        {selectedObject.scale && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
              <ApperIcon name="Maximize" size={16} />
              <span>Scale</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {["x", "y", "z"].map((axis) => (
                <div key={axis} className="form-group">
                  <label className="form-label">
                    {axis.toUpperCase()} Scale
                  </label>
                  <input
                    type="number"
                    value={properties.scale?.[axis] || 1}
                    onChange={(e) =>
                      handleNestedPropertyChange(
                        "scale",
                        axis,
                        Math.max(0.1, parseFloat(e.target.value) || 1)
                      )
                    }
                    step="0.1"
                    min="0.1"
                    max="5"
                    className="form-input"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dimensions Properties */}
        {selectedObject.dimensions && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
              <ApperIcon name="Ruler" size={16} />
              <span>Dimensions</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {Object.keys(selectedObject.dimensions).map((key) => (
                <div key={key} className="form-group">
                  <label className="form-label">
                    {key.charAt(0).toUpperCase() + key.slice(1)} (m)
                  </label>
                  <input
                    type="number"
                    value={properties.dimensions?.[key] || 0}
                    onChange={(e) =>
                      handleNestedPropertyChange(
                        "dimensions",
                        key,
                        Math.max(0.1, parseFloat(e.target.value) || 0)
                      )
                    }
                    step="0.1"
                    min="0.1"
                    max="20"
                    className="form-input"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Color Properties */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
            <ApperIcon name="Palette" size={16} />
            <span>Color</span>
          </h3>

          <div className="space-y-3">
            <div className="form-group">
              <label className="form-label">Custom Color</label>
              <input
                type="color"
                value={properties.color || "#ffffff"}
                onChange={(e) => handlePropertyChange("color", e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color Presets</label>
              <div className="grid grid-cols-6 gap-2">
                {colorPresets.map((preset) => (
                  <motion.button
                    key={preset.name}
                    onClick={() => handlePropertyChange("color", preset.color)}
                    className={`color-swatch ${
                      properties.color === preset.color ? "active" : ""
                    }`}
                    style={{ backgroundColor: preset.color }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Material Properties */}
        {selectedObject.material && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
              <ApperIcon name="Package" size={16} />
              <span>Material</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Material Type</label>
              <select
                value={properties.material || "wood"}
                onChange={(e) =>
                  handlePropertyChange("material", e.target.value)
                }
                className="form-input"
              >
                <option value="wood">Wood</option>
                <option value="metal">Metal</option>
                <option value="fabric">Fabric</option>
                <option value="glass">Glass</option>
                <option value="plastic">Plastic</option>
                <option value="leather">Leather</option>
              </select>
            </div>
          </div>
        )}

        {/* Opening Properties for Walls */}
        {selectedObject.type === "wall" && selectedObject.openings && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
              <ApperIcon name="DoorOpen" size={16} />
              <span>Openings</span>
            </h3>

            <div className="space-y-3">
              {selectedObject.openings.map((opening, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {opening.type}
                    </span>
                    <button
                      onClick={() => {
                        const newOpenings = selectedObject.openings.filter(
                          (_, i) => i !== index
                        );
                        handlePropertyChange("openings", newOpenings);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <ApperIcon name="X" size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="form-group">
                      <label className="form-label">Width (m)</label>
                      <input
                        type="number"
                        value={opening.dimensions?.width || 1}
                        onChange={(e) => {
                          const newOpenings = [...selectedObject.openings];
                          newOpenings[index] = {
                            ...opening,
                            dimensions: {
                              ...opening.dimensions,
                              width: Math.max(
                                0.3,
                                parseFloat(e.target.value) || 1
                              ),
                            },
                          };
                          handlePropertyChange("openings", newOpenings);
                        }}
                        step="0.1"
                        min="0.3"
                        max="5"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Height (m)</label>
                      <input
                        type="number"
                        value={opening.dimensions?.height || 1}
                        onChange={(e) => {
                          const newOpenings = [...selectedObject.openings];
                          newOpenings[index] = {
                            ...opening,
                            dimensions: {
                              ...opening.dimensions,
                              height: Math.max(
                                0.3,
                                parseFloat(e.target.value) || 1
                              ),
                            },
                          };
                          handlePropertyChange("openings", newOpenings);
                        }}
                        step="0.1"
                        min="0.3"
                        max="3"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="form-group">
                      <label className="form-label">X Position</label>
                      <input
                        type="number"
                        value={opening.position?.x || 0}
                        onChange={(e) => {
                          const newOpenings = [...selectedObject.openings];
                          newOpenings[index] = {
                            ...opening,
                            position: {
                              ...opening.position,
                              x: parseFloat(e.target.value) || 0,
                            },
                          };
                          handlePropertyChange("openings", newOpenings);
                        }}
                        step="0.1"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Y Position</label>
                      <input
                        type="number"
                        value={opening.position?.y || 0}
                        onChange={(e) => {
                          const newOpenings = [...selectedObject.openings];
                          newOpenings[index] = {
                            ...opening,
                            position: {
                              ...opening.position,
                              y: parseFloat(e.target.value) || 0,
                            },
                          };
                          handlePropertyChange("openings", newOpenings);
                        }}
                        step="0.1"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex space-x-2">
                <motion.button
                  onClick={() => {
                    const newOpening = {
                      type: "door",
                      position: { x: 0, y: 0 },
                      dimensions: { width: 0.8, height: 2.0 },
                    };
                    handlePropertyChange("openings", [
                      ...(selectedObject.openings || []),
                      newOpening,
                    ]);
                  }}
                  className="flex-1 btn-ghost text-sm flex items-center justify-center space-x-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ApperIcon name="DoorOpen" size={14} />
                  <span>Add Door</span>
                </motion.button>
                <motion.button
                  onClick={() => {
                    const newOpening = {
                      type: "window",
                      position: { x: 0, y: 1 },
                      dimensions: { width: 1.2, height: 1.0 },
                    };
                    handlePropertyChange("openings", [
                      ...(selectedObject.openings || []),
                      newOpening,
                    ]);
                  }}
                  className="flex-1 btn-ghost text-sm flex items-center justify-center space-x-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ApperIcon name="RectangleHorizontal" size={14} />
                  <span>Add Window</span>
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Ceiling Properties */}
        {selectedObject.type === "ceiling" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
              <ApperIcon name="Layers" size={16} />
              <span>Ceiling Properties</span>
            </h3>

            <div className="space-y-3">
              <div className="form-group">
                <label className="form-label">Height (m)</label>
                <input
                  type="number"
                  value={properties.height || 3}
                  onChange={(e) =>
                    handlePropertyChange(
                      "height",
                      Math.max(2, parseFloat(e.target.value) || 3)
                    )
                  }
                  step="0.1"
                  min="2"
                  max="10"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Material Type</label>
                <select
                  value={properties.material || "plaster"}
                  onChange={(e) =>
                    handlePropertyChange("material", e.target.value)
                  }
                  className="form-input"
                >
                  <option value="plaster">Plaster</option>
                  <option value="wood">Wood</option>
                  <option value="concrete">Concrete</option>
                  <option value="metal">Metal</option>
                  <option value="drywall">Drywall</option>
                  <option value="tile">Tile</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Texture</label>
                <select
                  value={properties.texture || "smooth"}
                  onChange={(e) =>
                    handlePropertyChange("texture", e.target.value)
                  }
                  className="form-input"
                >
                  <option value="smooth">Smooth</option>
                  <option value="textured">Textured</option>
                  <option value="popcorn">Popcorn</option>
                  <option value="coffered">Coffered</option>
                  <option value="beamed">Beamed</option>
                </select>
              </div>
            </div>
          </div>
        )}
        {/* Object Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
            <ApperIcon name="Zap" size={16} />
            <span>Actions</span>
          </h3>

          <div className="space-y-2">
            <motion.button
              onClick={() => {
                // Duplicate furniture with proper structure
                const duplicatedFurniture = {
                  ...selectedObject,
                  id: Date.now(), // Generate new integer ID
                  type: "furniture",
                  furnitureType: selectedObject.type,
                  position: {
                    ...selectedObject.position,
                    x: (selectedObject.position?.x || 0) + 1,
                  },
                };
                onObjectUpdate("duplicate", duplicatedFurniture);
              }}
              className="w-full btn-ghost text-left flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ApperIcon name="Copy" size={16} />
              <span>Duplicate Furniture</span>
            </motion.button>

            <motion.button
              onClick={() => {
                // Reset furniture to default position/rotation
                const objectId = Number.isInteger(selectedObject.id)
                  ? selectedObject.id
                  : parseInt(selectedObject.id);
                if (objectId > 0) {
                  const defaultProps = {
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: 1, y: 1, z: 1 },
                  };
                  onObjectUpdate(objectId, {
                    ...selectedObject,
                    ...defaultProps,
                  });
                }
              }}
              className="w-full btn-ghost text-left flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ApperIcon name="RotateCcw" size={16} />
              <span>Reset Position</span>
            </motion.button>

            <motion.button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this furniture?"
                  )
                ) {
                  const objectId = Number.isInteger(selectedObject.id)
                    ? selectedObject.id
                    : parseInt(selectedObject.id);
                  if (objectId > 0) {
                    onObjectUpdate(objectId, { action: "delete" });
                    onClose();
                  }
                }
              }}
              className="w-full btn-ghost text-left flex items-center space-x-2 text-red-600 hover:bg-red-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ApperIcon name="Trash2" size={16} />
              <span>Delete Furniture</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
