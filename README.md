# RoomCraft 3D - Interior Design Tool

A powerful 3D interior design web application that allows users to create, customize, and visualize room layouts in real-time. Built with React, Three.js, and modern web technologies.

## Features

### 🏠 3D Room Design
- Create rooms with adjustable dimensions (width, length, height)
- Interactive 3D viewport with full camera controls
- Real-time visualization of changes
- Grid-based snapping for precise placement

### 🚪 Structure Elements
- Wall placement and customization
- Door and window insertion
- Adjustable dimensions and positioning
- Color customization for all elements

### 🪑 Furniture Library
- Comprehensive furniture collection:
  - Sofas, beds, tables, chairs
  - Desks, wardrobes, and more
- Drag-and-drop placement
- Transform tools (move, rotate, scale)
- Material and color customization

### 🎨 Visual Customization
- Advanced color picker with presets
- Material selection (wood, metal, fabric, etc.)
- Real-time preview of changes
- Professional color palettes

### 📐 Precision Tools
- Object selection and manipulation
- Precise positioning with numeric inputs
- Rotation and scaling controls
- Snap-to-grid functionality

### 💾 Save & Load System
- Local storage for room designs
- Save multiple room configurations
- Load and modify existing designs
- Export/import functionality

### 🎯 Camera Controls
- Multiple view presets (top, front, side, isometric)
- Smooth camera transitions
- Orbit, pan, and zoom controls
- Touch-friendly mobile interface

## Technology Stack

- **Frontend**: React 18 + Vite
- **3D Engine**: Three.js + React Three Fiber
- **3D Helpers**: React Three Drei
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router Dom
- **Notifications**: React Toastify

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd roomcraft-3d
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating a Room
1. Set room dimensions using the sidebar controls
2. The 3D viewport will update automatically
3. Use camera controls to navigate around your room

### Adding Furniture
1. Select furniture from the tool palette
2. Click to add furniture to the room
3. Select objects to modify their properties
4. Use the properties panel to fine-tune positioning

### Customizing Elements
1. Select any object in the 3D view
2. Use the properties panel to adjust:
   - Position, rotation, and scale
   - Colors and materials
   - Dimensions

### Saving Your Work
1. Click the "Save" button in the header
2. Enter a name for your room design
3. Your design will be saved to browser storage

### Loading Designs
1. Click the "Load" button in the header
2. Select from your saved room designs
3. Click "Load" to open the design

## Browser Compatibility

RoomCraft 3D requires a modern browser with WebGL support:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Tips

- Use fewer furniture items for better performance on mobile devices
- Close the properties panel when not needed
- Use the simplified view modes for complex scenes

## Development

### Project Structure
```
src/
├── components/
│   ├── atoms/          # Basic UI components
│   ├── molecules/      # Composed components
│   ├── organisms/      # Complex sections
│   ├── pages/          # Page components
│   └── ui/             # State components
├── hooks/              # Custom React hooks
├── services/           # API and data services
├── utils/              # Utility functions
└── App.jsx             # Main application
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ using React, Three.js, and modern web technologies.