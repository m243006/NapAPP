# NapApp Backend Database & Location Services

## Overview

This project defines the backend database schema and core location-based query logic for NapApp, an application designed for managing and booking hotel rooms, potentially with hourly options. It includes storing details about hotels, rooms, bookings, user profiles, and pricing rules. A key feature is the ability to find hotels near a specific geographic point or along a travel route, leveraging PostgreSQL with the PostGIS extension.

This repository includes:
* The SQL schema definition (`schema_setup.sql`).
* A Node.js script (`test_hotel_schema.js`) demonstrating how to interact with the database using the Supabase client library, focusing on location queries.

## Technology Stack

* **Database:** PostgreSQL (via Supabase)
* **Database Extensions:**
    * `PostGIS`: For storing geographic locations and performing spatial queries.
    * `pgcrypto`: For generating UUIDs.
* **Backend Interaction Example:** Node.js
* **Database Client:** `@supabase/supabase-js`
* **Platform:** Supabase

## Features

* **Hotel & Room Management:** Stores details about hotels (including geographic location) and their associated rooms (type, rate, capacity, amenities).
* **Booking Management:** Records bookings with start/end times, status, and links to users and rooms.
* **User Profiles:** Basic user profile storage (can be linked to Supabase Auth).
* **Pricing Rules:** Schema structure for defining dynamic pricing or discounts (e.g., hourly, time-of-day).
* **Location-Based Search:** Find hotels within a specified distance (radius) of a given latitude/longitude point.
* **Route-Based Search:** Find hotels within a specified distance (tolerance) of a given route (defined by a sequence of points).

## Setup Instructions

### Prerequisites
* **Node.js:** Required to run the example interaction script. (Download from [nodejs.org](https://nodejs.org/)).
* **Supabase Account:** You need a Supabase project to host the database.
* **Supabase Project Credentials:**
    * Your Supabase Project URL.
    * Your Supabase Project Anon Key.

### Database Setup

1.  **Prepare Supabase Project:** It's recommended to start with a clean database or reset your existing one if testing this schema from scratch. You can use the Supabase Dashboard SQL Editor or the Supabase CLI (`supabase db reset`).
2.  **Run the Schema Script:**
    * Obtain the complete database setup script (let's assume it's saved as `schema_setup.sql` - this script should contain `DROP`, `CREATE EXTENSION`, `CREATE TABLE`, `CREATE INDEX`, `CREATE FUNCTION`, and `INSERT` statements).
    * Execute the *entire* `schema_setup.sql` script in your Supabase project's SQL Editor (`Database` -> `SQL Editor`).
    * This will create all necessary tables, indexes, spatial functions, and insert sample data.
    * For detailed information about the schema, see `DATABASE.md`.

### Test Script Setup

1.  **Navigate to Directory:** Open your terminal and navigate (`cd`) to the directory where you saved the Node.js test script (e.g., `test_hotel_schema.js`).
2.  **Install Dependencies:** Run the following command to install the Supabase client library:
    ```bash
    npm install @supabase/supabase-js
    ```
3.  **Configure Credentials:** Open the test script (`test_hotel_schema.js`) in a text editor and update the following placeholder constants with your actual Supabase project credentials:
    ```javascript
    const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your URL
    const SUPABASE_API_KEY = 'your_anon_key'; // Replace with your Anon Key
    ```


## Running the Test/Example Script

1.  **Execute Script:** From your terminal (while in the script's directory), run:
    ```bash
    node TestingSupa.js
    ```


2.  **Observe Output:** The script will connect to your Supabase database and execute a series of tests, demonstrating:
    * Basic data fetching (hotels, rooms, bookings).
    * Calling the custom PostgreSQL functions (`hotels_near_point`, `hotels_near_route`) via Supabase RPC to perform location-based searches.
    * Error handling for invalid inputs (e.g., invalid route).
    * The output will be printed to your console.