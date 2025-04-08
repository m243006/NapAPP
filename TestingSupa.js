// TestingSupa.js
const { createClient } = require('@supabase/supabase-js');


// IMPORTANT: Replace with your actual Supabase URL and ANON key
const SUPABASE_URL = 'https://blabla.co'; // Use your URL
const SUPABASE_API_KEY = 'kajsfdjadfkalf'; // Use your Anon Key

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    throw new Error("Supabase URL and API Key must be provided.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

// --- Helper Function for Logging ---
function logResult(testName, result) {
    console.log(`\n--- ${testName} ---`);
    if (result.error) {
        console.error("Error:", result.error.message || result.error);
    } else {
        console.log("Success. Data:", result.data);
    }
    console.log(`--- End ${testName} ---`);
}

// --- Test Functions ---

// Test 1: Basic Fetch Operations
async function testBasicFetches() {
    console.log("\n=== Running Basic Fetch Tests ===");

    let result = await supabase.from('hotels').select('*').limit(5);
    logResult("Fetch First 5 Hotels", { data: result.data, error: result.error });

    result = await supabase.from('hotels').select('name, city, state').eq('state', 'CO');
    logResult("Fetch Hotels in CO", { data: result.data, error: result.error });

    // Fetch a specific known hotel (Mountain Lodge ID)
    const mountainLodgeId = '33333333-3333-3333-3333-333333333333';
    result = await supabase.from('hotels').select('*').eq('id', mountainLodgeId).single(); // .single() expects exactly one row
    logResult("Fetch Mountain Lodge by ID", { data: result.data, error: result.error });

    // Fetch rooms for Mountain Lodge
    result = await supabase.from('rooms').select('*').eq('hotel_id', mountainLodgeId);
    logResult("Fetch Rooms for Mountain Lodge", { data: result.data, error: result.error });

    // Fetch bookings (limit for brevity)
    result = await supabase.from('bookings').select('*, rooms(hotel_id, hotels(name)), profiles(name)').limit(5);
    logResult("Fetch Recent Bookings with Hotel/Profile Names", { data: result.data, error: result.error });
}

// Test 2: Location - Find Hotels Near a Point
async function testFindHotelsNearPoint() {
    console.log("\n=== Running 'Find Hotels Near Point' Tests ===");

    // Point near Boston Common Hotel (-71.0654, 42.3550)
    const bostonLon = -71.0654;
    const bostonLat = 42.3550;
    let result = await supabase.rpc('hotels_near_point', {
        lon: bostonLon,
        lat: bostonLat,
        dist_meters: 1000 // 1 km radius
    });
    logResult(`Find Hotels within 1km of Boston Common (${bostonLon}, ${bostonLat})`, { data: result.data, error: result.error });

    // Point near Denver (-104.9903, 39.7392)
    const denverLon = -104.9903;
    const denverLat = 39.7392;
    result = await supabase.rpc('hotels_near_point', {
        lon: denverLon,
        lat: denverLat,
        dist_meters: 5000 // 5 km radius
    });
    logResult(`Find Hotels within 5km of Denver (${denverLon}, ${denverLat})`, { data: result.data, error: result.error });

    // Point somewhere with no hotels (e.g., middle of Kansas)
    const kansasLon = -98.35;
    const kansasLat = 39.50;
    result = await supabase.rpc('hotels_near_point', {
        lon: kansasLon,
        lat: kansasLat,
        dist_meters: 50000 // 50 km radius
    });
    logResult(`Find Hotels within 50km of Kansas (${kansasLon}, ${kansasLat}) - Expect Empty`, { data: result.data, error: result.error });
}

// Test 3: Location - Find Hotels Along a Route
async function testFindHotelsAlongRoute() {
    console.log("\n=== Running 'Find Hotels Along Route' Tests ===");

    // Route from ~Denver to ~Springfield (straight line for simplicity)
    const denverSpringfieldRoute = [
        [-104.9903, 39.7392], // Denver approx
        [-89.6501, 39.7817]   // Springfield approx
    ];
    let result = await supabase.rpc('hotels_near_route', {
        route_points: denverSpringfieldRoute,
        dist_meters: 50000 // 50 km tolerance along the route
    });
    logResult("Find Hotels near Denver-Springfield Route (50km tolerance)", { data: result.data, error: result.error });

    // Route within Boston (short route)
    const bostonRoute = [
        [-71.0654, 42.3550], // Near Boston Common Hotel
        [-71.0589, 42.3601]  // Near Faneuil Hall (example)
    ];
    result = await supabase.rpc('hotels_near_route', {
        route_points: bostonRoute,
        dist_meters: 1000 // 1 km tolerance
    });
    logResult("Find Hotels near short Boston Route (1km tolerance)", { data: result.data, error: result.error });

    // Test invalid route (single point) - should trigger function error
     const invalidRoute = [ [-71.0, 42.0] ];
     result = await supabase.rpc('hotels_near_route', {
         route_points: invalidRoute,
         dist_meters: 1000
     });
     logResult("Test Invalid Route (single point) - Expect Error", { data: result.data, error: result.error }); // Error expected
}

// Test 4: Data Modification (Example: Add/Update Hotel)
async function testDataModification() {
    console.log("\n=== Running Data Modification Tests ===");

    // Add a new temporary hotel
    const newHotelData = {
        name: 'Testayside Inn',
        address: '1 Test Way',
        city: 'Testville',
        state: 'TS',
        zip_code: '12345',
        country: 'USA',
        phone: '555-TEST',
        email: 'test@testside.com',
        location: null // Insert without location first
    };

    let insertResult = await supabase.from('hotels').insert(newHotelData).select().single(); // select().single() returns the inserted row
    logResult("Add New Hotel (No Location Yet)", { data: insertResult.data, error: insertResult.error });

    if (!insertResult.error && insertResult.data) {
        const newHotelId = insertResult.data.id;
        const testLon = -71.10; // Near Boston
        const testLat = 42.36;
        const pointWkt = `POINT(${testLon} ${testLat})`;
        const updateResult = await supabase
            .from('hotels')
            .update({ location: `SRID=4326;${pointWkt}` }) // Use EWKT format
            .eq('id', newHotelId)
            .select()
            .single();
        logResult(`Update Hotel ${newHotelId} Location`, { data: updateResult.data, error: updateResult.error });

        // Clean up: Delete the test hotel
        const deleteResult = await supabase.from('hotels').delete().eq('id', newHotelId);
        logResult(`Delete Test Hotel ${newHotelId}`, { data: deleteResult.data, error: deleteResult.error });
    } else {
         console.log("Skipping update/delete due to insertion error.");
    }
}


// --- Main Execution ---
async function runAllTests() {
    console.log("Starting Database Tests...");
    await testBasicFetches();
    await testFindHotelsNearPoint();
    await testFindHotelsAlongRoute();
    // await testDataModification(); // Uncomment if you want but it modifies data
    console.log("\nAll Tests Completed.");
}

// Execute the tests
runAllTests().catch(err => {
    console.error("\nUnhandled error during tests:", err);
});
