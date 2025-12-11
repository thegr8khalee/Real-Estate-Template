# Real Estate Website Migration Plan

This document outlines the steps to convert the existing Car Dealership template into a Real Estate website.

## 1. Backend Refactoring

### Models
- **Rename `Car` to `Property`** (`backend/src/models/car.model.js` -> `backend/src/models/property.model.js`)
- **Update Schema:**
  - Remove: `make`, `model`, `bodyType`, `transmission`, `fuelType`, `engineSize`, `drivetrain`, `mileage`, `vin`, `color`.
  - Add/Update:
    - `title` (String) - e.g., "Modern Villa in Beverly Hills"
    - `description` (Text)
    - `price` (Decimal)
    - `address` (String)
    - `city` (String)
    - `state` (String)
    - `zipCode` (String)
    - `type` (Enum: 'House', 'Apartment', 'Condo', 'Land', 'Commercial')
    - `status` (Enum: 'For Sale', 'For Rent', 'Sold', 'Pending')
    - `bedrooms` (Integer)
    - `bathrooms` (Integer)
    - `sqft` (Integer)
    - `yearBuilt` (Integer)
    - `features` (Array/JSON) - e.g., ['Pool', 'Garage', 'Garden']
    - `images` (Array)
- **Update Associations:**
  - Update `backend/src/models/associations.js` to link `Property` instead of `Car`.
  - Update `backend/src/models/index.js` to export `Property`.

### Controllers
- **Rename `car.controller.js` to `property.controller.js`**
- **Update Logic:**
  - `getAllProperties`: Update filters to support `minPrice`, `maxPrice`, `bedrooms`, `bathrooms`, `type`, `city`.
  - `createProperty`: Validate new schema fields.
  - `updateProperty`: Handle updates for new fields.
- **Rename `sell.controller.js` to `listing.controller.js`** (if applicable for user submissions).

### Routes
- **Rename `car.routes.js` to `property.routes.js`**
- Update endpoints:
  - `GET /api/cars` -> `GET /api/properties`
  - `POST /api/cars` -> `POST /api/properties`
  - etc.

## 2. Frontend Refactoring

### Components
- **Rename & Refactor:**
  - `CarCard.jsx` -> `PropertyCard.jsx`
    - Display: Image, Price, Title, Address, Beds, Baths, SqFt.
  - `CarList.jsx` -> `PropertyList.jsx`
  - `CarCard2.jsx` -> `PropertyCardHorizontal.jsx`
  - `MakeCard.jsx` -> `CityCard.jsx` (or Category)
- **Update Search/Filter:**
  - Update `Searchbar.jsx` to filter by Location, Price, Type, Beds/Baths.

### Pages
- **Rename & Refactor:**
  - `AddCarPage.jsx` -> `AddPropertyPage.jsx`
    - Update form to accept property details.
  - `CarDetailsPage.jsx` (if exists) -> `PropertyDetailsPage.jsx`

### API & State
- Update API calls in `frontend/src/lib/axios.js` or component files to point to `/api/properties`.
- Update any Redux/Context state management to refer to `properties` instead of `cars`.

## 3. Configuration & Branding
- Update `branding.config.json` and `frontend/src/config/branding.js` with Real Estate terminology.
- Update `frontend/src/config/images.js` to remove car icons (gas, transmission) and add property icons (bed, bath, ruler).

## 4. Execution Steps
1.  **Backup**: Ensure current state is committed.
2.  **Backend Migration**: Rename files, update code, test API.
3.  **Frontend Migration**: Rename files, update UI, connect to new API.
4.  **Database Reset**: Force sync database to create new tables.
