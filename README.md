# NASA Habitat Layout Builder

A 2D interactive layout builder for designing NASA habitat module configurations with drag-and-drop functionality, port connections, and validation rules.

## 🚀 Features

- **Two-Level Architecture**: Main modules (9 types: A-I) and sub-modules (9 types: J-R)
- **Interactive Canvas**: Drag-and-drop module placement with grid snapping
- **Port Connections**: Click-to-connect system for linking main modules via compatible ports
- **Sub-Module Placement**: Place sub-modules inside compatible main modules
- **Real-time Validation**: 10 validation rules ensure proper habitat configuration
- **Visual Feedback**: Color-coded modules, port indicators, and connection lines
- **Canvas Navigation**: Pan, zoom, and manipulate layouts intuitively

---

## 🎮 Controls

### Canvas Navigation
- **Pan**: Drag empty canvas background to move horizontally/vertically
- **Zoom**: Scroll wheel to zoom in/out (0.5x to 3x range)
- **Initial Zoom**: Canvas starts at 1.5x for optimal visibility

### Module Placement
1. **Main Modules**: Drag from "Main Modules" tab to canvas
2. **Sub-Modules**: Drag from "Sub-Modules" tab onto a main module
3. **Reposition**: Click and drag modules to move them
4. **Grid Snapping**: Modules snap to 0.5m grid automatically

### Port Connections
1. Click first port (colored circle on module edge)
2. Port highlights yellow with toast: "Click another port to connect"
3. Click second port on different module  
4. Connection line appears between ports
5. Press `ESC` to cancel connection

### Keyboard Shortcuts
- `R` - Rotate selected main module 90°
- `Delete` - Remove selected module (and its children)
- `Esc` - Cancel connection OR deselect module
- Scroll Wheel - Zoom in/out
- Drag Background - Pan canvas

---

## 📦 Module Types

### Main Modules (A-I)
| ID | Name | Category | Dimensions (W×D×H) | Ports | Allowed Sub-Modules |
|----|------|----------|-------------------|-------|---------------------|
| A | Wardroom | Habitation | 4.5×4.5×3.0m | 4 | J,K,L,M,N |
| B | Hygiene | Habitation | 2.5×3.0×3.0m | 3 | O,P |
| C | Crew Quarters | Habitation | 2.0×2.5×3.0m | 2 | K,N |
| D | Galley | Habitation | 3.5×3.0×3.0m | 3 | J,M |
| E | Lab | Science | 5.0×5.0×3.5m | 4 | J,K,Q,R |
| F | Storage | Logistics | 3.0×4.0×3.0m | 3 | M,N,P |
| G | Airlock | Ops | 2.5×4.0×3.5m | 3 | O,P,Q |
| H | Power/Life Support | Systems | 4.0×5.0×4.0m | 4 | N,P,Q,R |
| I | Command | Ops | 4.5×4.0×3.0m | 4 | J,K,L,R |

### Sub-Modules (J-R)
| ID | Name | Category | Dimensions | Z-Aware | Allowed Anchors |
|----|------|----------|-----------|---------|-----------------|
| J | Table | Furniture | 1.2×0.8×0.75m | No | floor,wall |
| K | Chair | Furniture | 0.5×0.5×1.0m | No | floor |
| L | Workstation | Equipment | 1.5×0.8×1.5m | No | floor,wall |
| M | Cabinet | Storage | 0.6×0.5×2.0m | No | wall |
| N | Locker | Storage | 0.6×0.6×2.0m | No | floor,wall |
| O | Shower | Facility | 1.0×1.0×2.2m | Yes | floor |
| P | Toilet | Facility | 0.8×1.0×1.3m | Yes | floor |
| Q | Equipment Rack | Equipment | 0.6×0.8×2.0m | No | floor,wall |
| R | Console | Equipment | 1.0×0.6×1.2m | No | floor,wall |

---

## 🔌 Port Types & Compatibility

### Port Types
- **🔵 hab-port**: Habitability connection (blue)
- **🟢 svc-port**: Service connection (green)
- **🔴 airlock-port**: External access (red)
- **🟠 std-port**: Standard connection (orange)

### Port Positions
- **North**: Top edge of module
- **South**: Bottom edge of module
- **East**: Right edge of module
- **West**: Left edge of module

---

## ✅ Validation Rules

1. **Max Main Modules**: Maximum 20 main modules per layout
2. **Max Sub-Modules**: Maximum 50 sub-modules per layout
3. **Total Volume**: Maximum 500 m³ total volume
4. **Sub-Module Parent Check**: Sub-modules must be inside compatible main modules
5. **Overlap Prevention**: Main modules cannot overlap
6. **Port Compatibility**: Connected ports must be compatible types
7. **Connection Distance**: Ports must be within 10m to connect
8. **Airlock Requirement**: At least 1 main module must have an airlock port
9. **Power/Life Support**: At least 1 Power/Life Support module required
10. **Command Module**: At least 1 Command module required

---

## 🛠️ Technical Stack

### Frontend
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Konva.js** + **React-Konva** - 2D canvas rendering
- **Sonner** - Toast notifications
- **React Router** - Navigation
- **React Hook Form** + **Zod** - Forms and validation

### Canvas & Rendering
- **Konva.js**: High-performance 2D canvas library
  - Handles module rendering, dragging, and interactions
  - Grid system with snapping (0.5m granularity)
  - Layer-based rendering (grid → connections → main modules → sub-modules)
  - Transform support for zoom and pan
  - Event handling for clicks, drags, and wheel events

### State Management
- React Context + Hooks
- Local state for layout configuration
- Real-time validation on state changes

---

## 📁 Project Structure

```
habitat-layout-builder/
├── src/
│   ├── components/
│   │   ├── LayoutCanvas2D.tsx      # Main 2D canvas component (Konva)
│   │   ├── ComponentLibrary.tsx    # Module library sidebar
│   │   ├── Toolbar.tsx             # Top toolbar with actions
│   │   ├── ValidationPanel.tsx     # Validation results display
│   │   └── ui/                     # shadcn/ui components
│   ├── data/
│   │   ├── mainModules.ts          # Main module definitions
│   │   └── subModules.ts           # Sub-module definitions
│   ├── types/
│   │   └── layout.ts               # TypeScript interfaces
│   ├── utils/
│   │   └── validation.ts           # Validation logic
│   ├── pages/
│   │   ├── Index.tsx               # Main application page
│   │   └── NotFound.tsx            # 404 page
│   ├── App.tsx                     # Root component
│   └── main.tsx                    # Entry point
├── public/                         # Static assets
├── package.json                    # Dependencies
├── vite.config.ts                  # Vite configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/Harkit2004/habitat-layout-builder.git
cd habitat-layout-builder

# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
# or
bun run dev

# Opens at http://localhost:8080
```

### Build

```bash
# Build for production
npm run build
# or
bun run build

# Preview production build
npm run preview
```

---

## 🐛 Known Issues & Fixes

### ✅ FIXED: Page Reload Issues
**Problem**: When reloading the page, validation showed "all passed" and canvas sometimes disappeared.

**Solution**: 
- Validation now shows informative message when layout is empty: "No modules placed yet..."
- Increased initial canvas dimensions (1200×800) to ensure proper rendering
- ValidationPanel now distinguishes between empty state and validated state
- Canvas always renders with proper dimensions even on fresh page load

### ✅ FIXED: Coordinate System Issues
**Problem**: Modules were jumping to wrong positions after dropping or dragging.

**Solution**: 
- Fixed coordinate transformation from screen space to canvas space
- Proper handling of Konva's absolute transform matrix
- Grid snapping applied correctly in meters (0.5m granularity)
- Sub-module positioning relative to parent now accurate

### ✅ FIXED: Canvas Displacement
**Problem**: Canvas would move when dragging modules.

**Solution**:
- Added `isDraggingModule` state to prevent canvas dragging during module manipulation
- Canvas only pans when dragging empty background
- Module drag operations don't affect canvas position

### ✅ FIXED: Connection Lines
**Problem**: Lines connected center-to-center instead of port-to-port.

**Solution**:
- Created `getPortPosition()` function to calculate exact port coordinates
- Accounts for module rotation and port position (north/south/east/west)
- Lines now connect directly between actual port circles

### ✅ FIXED: Zoom Issues
**Problem**: Canvas too zoomed out on load, could zoom out too far.

**Solution**:
- Initial zoom set to 1.5x (from 1.0x) for better visibility
- Minimum zoom constraint: 0.5x (prevents losing modules)
- Maximum zoom constraint: 3.0x

### ✅ FIXED: Scroll Area
**Problem**: Module library tabs weren't scrollable.

**Solution**:
- Added `overflow-hidden` CSS constraints to enable scrolling
- ScrollArea now properly displays all modules in tabs

---

## 🎨 Canvas Implementation Details

### Coordinate System
- **Units**: Meters (real-world dimensions)
- **Pixel Conversion**: 40 pixels = 1 meter (`PIXELS_PER_METER = 40`)
- **Grid Size**: 0.5m snapping grid
- **Origin**: Top-left corner (Konva default)

### Rendering Layers (bottom to top)
1. **Grid Layer**: 0.5m grid lines
2. **Connections Layer**: Port-to-port connection lines
3. **Main Modules Layer**: Draggable main module groups
4. **Sub-Modules Layer**: Draggable sub-module groups (rendered with parent offset)

### Transform Pipeline
```
Screen Click → Stage Transform → Canvas Coordinates → Meters → Grid Snap
```

### Drag & Drop Flow
1. User drags module from library (sets dataTransfer)
2. Drop event on canvas
3. Get pointer position → Transform to canvas space
4. Convert pixels to meters → Snap to grid
5. Create placed module instance
6. Add to layout state → Triggers re-render

### Port Connection Flow
1. Click port 1 → Set `connectingPort` state → Visual highlight
2. Click port 2 → Validate connection
3. Create connection object with moduleIds and portIds
4. Add to connections array → Render line between exact port positions

---

## 🔧 Configuration

### Environment Variables
```bash
# Supabase (optional - for future backend integration)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Canvas Settings
Edit `src/components/LayoutCanvas2D.tsx`:
```typescript
const PIXELS_PER_METER = 40;  // Scaling factor
const GRID_SIZE = 0.5;         // Grid snap size (meters)
const MIN_ZOOM = 0.5;          // Minimum zoom level
const MAX_ZOOM = 3.0;          // Maximum zoom level
const INITIAL_ZOOM = 1.5;      // Starting zoom
```

### Module Data
Add/edit modules in:
- `src/data/mainModules.ts` - Main module definitions
- `src/data/subModules.ts` - Sub-module definitions

### Validation Rules
Edit `src/utils/validation.ts` to modify constraints.

---

## 📝 Usage Examples

### Basic Workflow
1. **Start Fresh**: Open app → See empty canvas with grid
2. **Add Main Module**: Drag "Wardroom" from Main Modules tab to canvas
3. **Add Another**: Drag "Galley" next to it
4. **Connect Modules**: Click port on Wardroom → Click port on Galley
5. **Add Sub-Module**: Drag "Table" from Sub-Modules tab onto Wardroom
6. **Rotate**: Select module → Press `R` key
7. **Validate**: Check ValidationPanel for any issues

### Port Connection Example
```
1. Place Wardroom (has 4 hab-ports)
2. Place Galley (has 3 hab-ports)
3. Click hab-port on Wardroom's east side
   → Port turns yellow
4. Click hab-port on Galley's west side
   → Connection line appears
   → Toast: "Modules connected!"
```

### Sub-Module Placement Example
```
1. Place Hygiene module (allows O, P sub-modules)
2. Go to Sub-Modules tab
3. Drag "Shower" (ID: O) onto Hygiene module
   → Success: "Added Shower to Hygiene"
4. Try dragging "Table" (ID: J) onto Hygiene
   → Error: "Table cannot be placed in Hygiene"
```

---

## 🤝 Contributing

This is a NASA Space Apps Challenge hackathon project. Contributions, issues, and feature requests are welcome!

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Follow existing component patterns
- Add types for all props and state

---

## 📊 Performance Notes

- Canvas rendering optimized with Konva layers
- Grid lines cached and only re-rendered on zoom
- Module drag operations use Konva's built-in transform
- State updates batched to prevent excessive re-renders
- Validation runs only on state changes, not on every render

---

## 🔮 Future Enhancements

- [ ] 3D visualization toggle (using Three.js)
- [ ] Export layout to JSON/SVG/PDF
- [ ] Import existing layouts
- [ ] Undo/Redo functionality
- [ ] Multi-select and group operations
- [ ] Snap-to-port alignment
- [ ] Auto-routing for connection lines
- [ ] Collision detection improvements
- [ ] Backend integration (Supabase)
- [ ] Real-time collaboration
- [ ] Template library
- [ ] Advanced validation (structural integrity, power flow)

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👥 Team

NASA Space Apps Challenge 2025 - Habitat Layout Builder Team

---

## 🆘 Support

For issues or questions:
1. Check this README for solutions
2. Open an issue on GitHub
3. Check browser console for errors (F12)

---

## 🎯 Quick Reference

### Canvas starts too zoomed out?
Initial zoom is 1.5x. Scroll to zoom further.

### Modules not staying in place?
Fixed! Drop modules and they stay where placed with grid snapping.

### Sub-modules not placing?
Drag sub-module ONTO a main module (not beside it). Check if allowed in that parent.

### Connection lines wrong?
Fixed! Lines now go directly from port to port positions.

### Canvas moves when dragging modules?
Fixed! Canvas only pans when dragging empty background.

### Can't scroll module library?
Fixed! Both tabs now scroll properly to show all modules.

### Canvas disappears on page reload?
Fixed! Canvas now initializes with proper dimensions (1200×800px) and always renders.

### Validation shows "all passed" when page is empty?
Fixed! Now shows helpful message: "No modules placed yet. Drag modules from the library to start building."

---

**Made with ❤️ for NASA Space Apps Challenge 2025**
