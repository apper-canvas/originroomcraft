import mockRooms from "@/services/mockData/rooms.json";
import { generateId } from "@/utils/helpers";

class RoomService {
  constructor() {
    this.rooms = this.loadRoomsFromStorage();
  }

  loadRoomsFromStorage() {
    try {
      const storedRooms = localStorage.getItem("roomcraft_rooms");
      if (storedRooms) {
        return JSON.parse(storedRooms);
      }
      return [...mockRooms];
    } catch (error) {
      console.error("Failed to load rooms from storage:", error);
      return [...mockRooms];
    }
  }

  saveRoomsToStorage() {
    try {
      localStorage.setItem("roomcraft_rooms", JSON.stringify(this.rooms));
    } catch (error) {
      console.error("Failed to save rooms to storage:", error);
    }
  }

  // Simulate API delay
  async delay(ms = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getAllRooms() {
    await this.delay();
    return [...this.rooms];
  }

  async getRoom(id) {
    await this.delay();
    const room = this.rooms.find((r) => r.id === parseInt(id));
    if (!room) {
      throw new Error("Room not found");
    }
    return { ...room };
  }

  async createRoom(roomData) {
    await this.delay();

    const newRoom = {
      id: this.getNextId(),
      name: roomData.name || "New Room",
      dimensions: roomData.dimensions || { width: 10, length: 10, height: 3 },
      walls: roomData.walls || [],
      furniture: roomData.furniture || [],
      ceiling: roomData.ceiling || null,
      lastModified: new Date().toISOString(),
    };

    this.rooms.push(newRoom);
    this.saveRoomsToStorage();

    return { ...newRoom };
  }

  async saveRoom(roomData) {
    await this.delay();

    const existingIndex = this.rooms.findIndex((r) => r.id === roomData.id);

    const updatedRoom = {
      ...roomData,
      id: roomData.id || this.getNextId(),
      lastModified: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.rooms[existingIndex] = updatedRoom;
    } else {
      this.rooms.push(updatedRoom);
    }

    this.saveRoomsToStorage();
    return { ...updatedRoom };
  }

  async updateRoom(id, updates) {
    await this.delay();

    const roomIndex = this.rooms.findIndex((r) => r.id === parseInt(id));
    if (roomIndex === -1) {
      throw new Error("Room not found");
    }

    const updatedRoom = {
      ...this.rooms[roomIndex],
      ...updates,
      id: parseInt(id),
      lastModified: new Date().toISOString(),
    };

    this.rooms[roomIndex] = updatedRoom;
    this.saveRoomsToStorage();

    return { ...updatedRoom };
  }

  async deleteRoom(id) {
    await this.delay();

    const roomIndex = this.rooms.findIndex((r) => r.id === parseInt(id));
    if (roomIndex === -1) {
      throw new Error("Room not found");
    }

    this.rooms.splice(roomIndex, 1);
    this.saveRoomsToStorage();

    return { success: true };
  }

  getNextId() {
    if (this.rooms.length === 0) return 1;
    return Math.max(...this.rooms.map((r) => r.id)) + 1;
  }
}

export const roomService = new RoomService();
