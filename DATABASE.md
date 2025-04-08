# NapApp Database Schema Documentation

## Overview

This document details the PostgreSQL database schema used by NapApp, hosted on Supabase. It leverages the `pgcrypto` extension for UUID generation and the powerful `PostGIS` extension for storing and querying geospatial data, enabling location-based features.

## Extensions Required

* **`pgcrypto`**: Used for generating unique identifiers (`UUID`) for table primary keys via `gen_random_uuid()`.
* **`postgis`**: Enables the storage of geographic data (`GEOMETRY` type) and provides a rich set of functions for spatial analysis and querying (e.g., `ST_MakePoint`, `ST_DWithin`, `ST_MakeLine`). Also required for creating spatial indexes (GiST).



## Table Definitions

### 1. `hotels`

Stores information about each hotel property.

| Column Name | Data Type                | Constraints/Defaults        | Description                                                                 |
| :---------- | :----------------------- | :-------------------------- | :-------------------------------------------------------------------------- |
| `id`        | `UUID`                   | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the hotel.                                            |
| `name`      | `VARCHAR(255)`           | `NOT NULL`                  | Name of the hotel.                                                          |
| `address`   | `VARCHAR(255)`           |                             | Street address.                                                             |
| `city`      | `VARCHAR(100)`           |                             | City.                                                                       |
| `state`     | `VARCHAR(100)`           |                             | State or province.                                                          |
| `zip_code`  | `VARCHAR(20)`            |                             | Postal or ZIP code.                                                         |
| `country`   | `VARCHAR(100)`           |                             | Country.                                                                    |
| `phone`     | `VARCHAR(50)`            |                             | Contact phone number.                                                       |
| `email`     | `VARCHAR(150)`           |                             | Contact email address.                                                      |
| `location`  | `GEOMETRY(Point, 4326)` |                             | Geographic coordinates (Longitude, Latitude) using WGS 84 spatial reference system (SRID 4326). |
| `created_at`| `TIMESTAMPTZ`            | `DEFAULT now()`             | Timestamp of when the record was created.                                   |
| `updated_at`| `TIMESTAMPTZ`            | `DEFAULT now()`             | Timestamp of when the record was last updated (triggers recommended for auto-update). |

### 2. `rooms`

Stores details for individual rooms available within each hotel.

| Column Name   | Data Type       | Constraints/Defaults        | Description                                            |
| :------------ | :-------------- | :-------------------------- | :----------------------------------------------------- |
| `id`          | `UUID`          | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the room.                        |
| `hotel_id`    | `UUID`          | `NOT NULL`, `FOREIGN KEY -> hotels.id` | Links to the `hotels` table (the hotel this room belongs to). ON DELETE CASCADE. |
| `room_number` | `VARCHAR(50)`   |                             | Room number or identifier (e.g., '101', 'Suite A').    |
| `type`        | `VARCHAR(50)`   |                             | Type of room (e.g., 'Single', 'Double', 'Suite', 'Cabin'). |
| `base_rate`   | `NUMERIC(10,2)` |                             | Base price per night or per hour (depending on model). |
| `capacity`    | `INTEGER`       |                             | Maximum number of occupants.                           |
| `amenities`   | `JSONB`         |                             | Stores a list or key-value pairs of room amenities (e.g., `["WiFi", "TV"]`, `{"view": "ocean", "hasBalcony": true}`). |
| `is_active`   | `BOOLEAN`       | `DEFAULT true`              | Indicates if the room is currently available for booking. |
| `created_at`  | `TIMESTAMPTZ`   | `DEFAULT now()`             | Timestamp of when the record was created.              |
| `updated_at`  | `TIMESTAMPTZ`   | `DEFAULT now()`             | Timestamp of when the record was last updated.         |

### 3. `bookings`

Records each booking made for a room.

| Column Name      | Data Type       | Constraints/Defaults        | Description                                                          |
| :--------------- | :-------------- | :-------------------------- | :------------------------------------------------------------------- |
| `id`             | `UUID`          | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the booking.                                   |
| `room_id`        | `UUID`          | `NOT NULL`, `FOREIGN KEY -> rooms.id` | Links to the `rooms` table (the room being booked). ON DELETE CASCADE. |
| `user_id`        | `UUID`          | `FOREIGN KEY -> profiles.id`| Links to the `profiles` table (the user making the booking). ON DELETE SET NULL (or CASCADE/RESTRICT). |
| `start_time`     | `TIMESTAMPTZ`   | `NOT NULL`                  | Start date and time of the booking.                                  |
| `end_time`       | `TIMESTAMPTZ`   | `NOT NULL`                  | End date and time of the booking.                                    |
| `status`         | `VARCHAR(50)`   | `NOT NULL`, `CHECK(...)`    | Current status (e.g., 'pending', 'confirmed', 'cancelled').          |
| `total_price`    | `NUMERIC(10,2)` |                             | Calculated total price for the booking duration.                     |
| `payment_status` | `VARCHAR(50)`   | `CHECK(...)`                | Status of the payment (e.g., 'pending', 'completed', 'failed').      |
| `created_at`     | `TIMESTAMPTZ`   | `DEFAULT now()`             | Timestamp of when the record was created.                            |
| `updated_at`     | `TIMESTAMPTZ`   | `DEFAULT now()`             | Timestamp of when the record was last updated.                       |

### 4. `pricing_rules`

Defines rules for dynamic pricing or discounts applicable to specific rooms.

| Column Name         | Data Type       | Constraints/Defaults        | Description                                                              |
| :------------------ | :-------------- | :-------------------------- | :----------------------------------------------------------------------- |
| `id`                | `UUID`          | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the pricing rule.                   |
| `room_id`           | `UUID`          | `NOT NULL`, `FOREIGN KEY -> rooms.id` | Links to the `rooms` table (the room this rule applies to).    |
| `rule_name`         | `VARCHAR(100)`  | `NOT NULL`                  | Name of the rule (e.g., 'Weekend Surge', 'Night Discount').              |
| `discount_percentage`|`NUMERIC(5,2)`  | `NOT NULL`                  | Percentage discount (e.g., 10.00 for 10%). Use negative for surcharge?   |
| `start_time`        | `TIME`          |                             | Optional start time for time-of-day rules (e.g., '22:00:00').            |
| `end_time`          | `TIME`          |                             | Optional end time for time-of-day rules (e.g., '06:00:00').              |
| `conditions`        | `JSONB`         |                             | Additional conditions stored as JSON (e.g., `{"min_hours": 3}`).         |
| `created_at`        | `TIMESTAMPTZ`   | `DEFAULT now()`             | Timestamp of when the record was created.                                |
| `updated_at`        | `TIMESTAMPTZ`   | `DEFAULT now()`             | Timestamp of when the record was last updated.                           |

### 5. `profiles`

Stores basic information about users (customers, managers). Can be linked to `auth.users` table if using Supabase Auth.

| Column Name  | Data Type       | Constraints/Defaults        | Description                                                      |
| :----------- | :-------------- | :-------------------------- | :--------------------------------------------------------------- |
| `id`         | `UUID`          | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the profile.              . |
| `email`      | `VARCHAR(150)`  | `UNIQUE`, `NOT NULL`        | User's email address.                                            |
| `name`       | `VARCHAR(255)`  |                             | User's full name.                                                |
| `role`       | `VARCHAR(50)`   | `DEFAULT 'customer'`, `CHECK(...)` | User role (e.g., 'customer', 'hotel_manager', 'admin').   |
| `phone`      | `VARCHAR(50)`   |                             | User's phone number.                                             |
| `created_at` | `TIMESTAMPTZ`   | `DEFAULT now()`             | Timestamp of when the record was created.                        |
| `updated_at` | `TIMESTAMPTZ`   | `DEFAULT now()`             | Timestamp of when the record was last updated.                   |

## Relationships Summary

* `rooms.hotel_id` references `hotels.id` (One Hotel to Many Rooms)
* `bookings.room_id` references `rooms.id` (One Room to Many Bookings)
* `bookings.user_id` references `profiles.id` (One Profile to Many Bookings)
* `pricing_rules.room_id` references `rooms.id` (One Room to Many Pricing Rules)

## Indexes

* **Primary Key Indexes:** Automatically created for all `id` columns.
* **Foreign Key Indexes:** Often created automatically by PostgreSQL depending on version/configuration.
* **Spatial Index:**
    * `idx_hotels_location ON hotels USING gist(location)`: **Crucial** index using Generalized Search Tree (GiST) for efficiently querying the `hotels.location` geometry column. Essential for performance of location-based searches.

## Custom PostgreSQL Functions

These functions are designed to be called via Supabase RPC (`supabase.rpc(...)`) to perform spatial queries efficiently within the database.

### 1. `hotels_near_point(lon float, lat float, dist_meters float)`

* **Purpose:** Finds hotels located within a specified distance (radius) from a central geographic point.
* **Parameters:**
    * `lon float`: Longitude of the center point.
    * `lat float`: Latitude of the center point.
    * `dist_meters float`: The search radius in meters.
* **Returns:** `SETOF hotels` - A set of rows matching the `hotels` table structure.
* **Logic:** Uses the PostGIS function `ST_DWithin` with `geography` type casting to perform an accurate meter-based distance calculation between the `hotels.location` and the input point (`ST_MakePoint(lon, lat)`). Leverages the `idx_hotels_location` GIST index.
* **Example RPC Call (JS):**
    ```javascript
    const { data, error } = await supabase.rpc('hotels_near_point', {
      lon: -71.0654, // Example longitude
      lat: 42.3550,  // Example latitude
      dist_meters: 5000 // Example radius (5km)
    });
    ```

### 2. `hotels_near_route(route_points jsonb, dist_meters float)`

* **Purpose:** Finds hotels located within a specified tolerance distance from a given route (path).
* **Parameters:**
    * `route_points jsonb`: A JSON array containing ordered coordinate pairs `[longitude, latitude]` that define the vertices of the route. Must contain at least two points. Example: `'[[-71.0, 42.0], [-71.1, 42.1], [-71.2, 42.0]]'`
    * `dist_meters float`: The search tolerance in meters (maximum distance a hotel can be from the route).
* **Returns:** `SETOF hotels` - A set of rows matching the `hotels` table structure.
* **Logic:**
    1.  Validates the input JSONB array.
    2.  Constructs a PostGIS `LINESTRING` geometry from the input points using `ST_MakeLine`.
    3.  Uses the PostGIS function `ST_DWithin` with `geography` type casting to perform an accurate meter-based distance calculation between the `hotels.location` and the constructed route `LINESTRING`. Leverages the `idx_hotels_location` GIST index.
* **Example RPC Call (JS):**
    ```javascript
    const route = [ [-71.0, 42.0], [-71.1, 42.1] ]; // Example route points
    const { data, error } = await supabase.rpc('hotels_near_route', {
      route_points: route,
      dist_meters: 2000 // This is the example tolerance (2km)
    });
    ```