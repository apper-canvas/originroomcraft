import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { roomService } from '@/services/api/roomService';

const SaveLoadDialog = ({ type, currentRoom, onSave, onLoad, onClose }) => {
  const [roomName, setRoomName] = useState('');
  const [savedRooms, setSavedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (type === 'save' && currentRoom) {
      setRoomName(currentRoom.name || 'New Room');
    }
    
    if (type === 'load') {
      loadSavedRooms();
    }
  }, [type, currentRoom]);

  const loadSavedRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const rooms = await roomService.getAllRooms();
      setSavedRooms(rooms);
    } catch (err) {
      setError(err.message || 'Failed to load saved rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(roomName.trim());
    } catch (err) {
      setError(err.message || 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (roomId) => {
    try {
      setLoading(true);
      setError(null);
      await onLoad(roomId);
    } catch (err) {
      setError(err.message || 'Failed to load room');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await roomService.deleteRoom(roomId);
      await loadSavedRooms();
    } catch (err) {
      setError(err.message || 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name={type === 'save' ? 'Save' : 'FolderOpen'} size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {type === 'save' ? 'Save Room' : 'Load Room'}
                </h2>
                <p className="text-sm text-gray-600">
                  {type === 'save' ? 'Save your room design' : 'Load a saved room design'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <ApperIcon name="AlertCircle" size={16} className="text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {type === 'save' ? (
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="form-input"
                  placeholder="Enter room name"
                  autoFocus
                />
              </div>

              {currentRoom && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-gray-800">Room Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Dimensions: {currentRoom.dimensions.width}m × {currentRoom.dimensions.length}m × {currentRoom.dimensions.height}m</div>
                    <div>Furniture: {currentRoom.furniture.length} items</div>
                    <div>Walls: {currentRoom.walls.length} items</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : savedRooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="FolderOpen" size={48} className="mx-auto mb-4" />
                  <p>No saved rooms found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{room.name}</h4>
                        <p className="text-sm text-gray-600">
                          {room.dimensions.width}m × {room.dimensions.length}m × {room.dimensions.height}m
                        </p>
                        <p className="text-xs text-gray-500">
                          {room.furniture.length} furniture, {room.walls.length} walls
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => handleLoad(room.id)}
                          className="btn-primary px-3 py-1 text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Load
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(room.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <motion.button
            onClick={onClose}
            className="btn-ghost"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          
          {type === 'save' && (
            <motion.button
              onClick={handleSave}
              disabled={loading || !roomName.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Room'
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SaveLoadDialog;