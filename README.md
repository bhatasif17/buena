# Buena Property Management

A full-stack property management application with a guided creation flow for managing WEG (owner communities) and MV (rental management) properties.

## Features

- **Property Dashboard**: View all properties with name, type badge, building/unit counts, and auto-generated property numbers
- **Property Creation Wizard**: 3-step guided flow
  - Step 1: General Info (type selection, name, manager, accountant, document upload)
  - Step 2: Buildings (multiple buildings with full address details)
  - Step 3: Units (individual and bulk add with quick-add feature)
- **Property Details**: Comprehensive view with expandable building sections and unit tables
- **File Uploads**: Support for declaration documents (PDF, DOC, DOCX)

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite with better-sqlite3
- **File Upload**: Multer
- **Architecture**: Layered (Routes → Controllers → Services → Repositories)

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Styling**: Custom CSS with CSS variables

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository and install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server (port 3001):
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend (port 5173):
```bash
cd frontend
npm run dev
```

3. Open http://localhost:5173 in your browser

### Environment Variables (Optional)

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:3001/api
VITE_UPLOADS_URL=http://localhost:3001/uploads
```

**Backend** (`backend/.env`):
```
PORT=3001
NODE_ENV=development
```

## Project Structure

```
buena/
├── backend/
│   └── src/
│       ├── index.js              # Application entry point
│       ├── app.js                # Express app configuration
│       ├── config/               # Environment configuration
│       ├── routes/               # API route definitions
│       │   ├── propertyRoutes.js
│       │   ├── buildingRoutes.js
│       │   ├── unitRoutes.js
│       │   └── suggestionRoutes.js
│       ├── controllers/          # Request/response handling
│       ├── services/             # Business logic
│       ├── repositories/         # Database access
│       ├── models/               # Database schema
│       ├── middleware/           # Error handling, uploads
│       └── utils/                # Helper functions
│
├── frontend/
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Root component with routing
│       ├── App.css               # Global styles
│       ├── api.js                # Centralized API client
│       └── pages/
│           ├── Dashboard.jsx     # Property listing
│           ├── CreateProperty.jsx # 3-step wizard
│           └── PropertyDetail.jsx # Property view
│
└── readme.md
```

## API Endpoints

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | List all properties |
| GET | `/api/properties/:id` | Get property with buildings and units |
| POST | `/api/properties` | Create property (multipart/form-data) |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |

### Buildings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties/:propertyId/buildings` | List buildings for property |
| POST | `/api/properties/:propertyId/buildings` | Create building |
| PUT | `/api/buildings/:id` | Update building |
| DELETE | `/api/buildings/:id` | Delete building |

### Units
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buildings/:buildingId/units` | List units for building |
| POST | `/api/buildings/:buildingId/units` | Create single unit |
| POST | `/api/buildings/:buildingId/units/bulk` | Create multiple units |
| PUT | `/api/units/:id` | Update unit |
| DELETE | `/api/units/:id` | Delete unit |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suggestions/staff` | Get staff suggestions |
| GET | `/api/health` | Health check |

## Key Features

### Efficient Unit Entry
Optimized for entering 60+ units quickly:

- **Quick Add**: Bulk create multiple units with configurable start number, count, type, and default values
- **Duplicate**: Copy existing units with one click
- **Tabular Entry**: Spreadsheet-like interface for fast data entry
- **Collapsible Sections**: Organize units by building

### Auto-Generated Property Numbers
Each property receives a unique identifier in the format `PROP-XXXXXX` (e.g., `PROP-847291`).

### Property Types
- **WEG**: Wohnungseigentümergemeinschaft (Owner Community) - For condominiums with shared ownership
- **MV**: Mietverwaltung (Rental Management) - For rental properties

### Unit Types
- Apartment
- Office
- Garden
- Parking

## Architecture Decisions

1. **SQLite Database**: Chosen for simplicity and zero-configuration setup. Easy to migrate to PostgreSQL for production.

2. **Layered Backend**: Clean separation between routes, controllers, services, and repositories for maintainability and testability.

3. **Centralized API Client**: Single source of truth for all API calls with consistent error handling.

4. **Custom CSS**: No UI framework dependency for full control and smaller bundle size.

5. **Multi-step Wizard**: Breaks down complex property creation into manageable steps with validation.

