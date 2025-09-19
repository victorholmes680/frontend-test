# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based equipment management application built with TypeScript and Ant Design. The system manages equipment data, investments, depreciation calculations, and dimensional hierarchies.

## Development Commands

### Core Development
- `npm start` - Start development server on http://localhost:3000
- `npm run build` - Build production version to `/build` directory
- `npm test` - Run tests in interactive watch mode
- `npm run proxy` - Start proxy server on http://localhost:3001 for API calls

### Testing and Quality
- React Testing Library is configured for component testing
- ESLint is configured with react-app and react-app/jest rules
- Jest is the testing framework with React Testing Library

## Architecture

### Core Components Structure
- **Components** organized by domain:
  - `components/equipment/` - Equipment management, investment forms, depreciation calculators
  - `components/investment/` - Investment listings and forms
  - `components/depreciation/` - Depreciation lists and form modals
  - `components/dimension/` - Dimension tree management and forms
  - `components/common/` - Shared components (Header, Navigation, EquipmentSelectionPopup)

### Service Layer
- **Authentication**: `src/services/auth.ts` - Singleton token management with localStorage persistence
- **API Service**: `src/services/api.ts` - Centralized API service with authentication headers and error handling

### Type Definitions
- **Main Types**: `src/types/equipment.ts` - Core interfaces including:
  - `Equipment` - Primary equipment entity with both legacy and current fields
  - `EquipmentInvestment` and `EquipmentInvestmentVo` - Investment data structures
  - `EquipmentDepreciation` - Depreciation calculation data
  - `ManageDimension*` - Dimension/hierarchy management types
  - `PageResponse<T>` - Standardized pagination response

### Page Structure
- `pages/EquipmentManagement.tsx` - Main equipment management page
- `pages/InvestmentPage.tsx` - Equipment investment management
- `pages/DepreciationPage.tsx` - Depreciation processing and reporting
- `pages/ManageDimensionPage.tsx` - Dimension tree management

### API Integration
- Uses proxy server (`proxy-server.js`) for development, forwarding requests to `https://www.inco-plat.com:9990`
- All API calls go through `/api` prefix and are handled by the centralized `EquipmentService` class
- Authentication token is automatically included in all API requests

### Key Features
1. **Equipment Management**: Hierarchical equipment structure with parent-child relationships
2. **Investment Tracking**: Additional equipment investments with depreciation calculation support
3. **Depreciation Processing**: Monthly batch processing with cancellation capability
4. **Dimension Management**: Tree-structured organizational hierarchies

### Data Flow
- Components use `EquipmentService` static methods for all data operations
- API responses are transformed to match frontend data structures
- Pagination is handled consistently across all list views
- Error handling is centralized through the `apiRequest` function

## Development Notes

### Proxy Setup
- The proxy server must be running (`npm run proxy`) for API calls to work during development
- Production builds expect the API to be available at the configured proxy target

### Authentication
- Uses JWT tokens stored in localStorage
- Token is automatically added to all API requests via the `authService` singleton
- Development uses a hardcoded token in `src/services/auth.ts`

### Component Patterns
- Modal components follow the naming convention `*FormModal.tsx`
- List components follow the naming convention `*List.tsx`
- Form components include both create and edit functionality