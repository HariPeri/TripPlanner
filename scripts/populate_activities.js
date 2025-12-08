import mysql from 'mysql2/promise';
import fetch from 'node-fetch';

// Database connection
const pool = mysql.createPool({
  host: '35.245.199.33',
  user: 'tripapp',
  password: 'FinalProjectCS4750!',
  database: 'trip_planner_db',
  waitForConnections: true,
  connectionLimit: 10
});

const API_KEY = '5ae2e3f221c38a28845f05b6eb4256e0da5835696194d4396decf453'; // Get from opentripmap.org

// List of countries to fetch (add more as needed)
const countries = [
    { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734 },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lon: -118.2437 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  // Add more countries...
];

// Categories mapping from OpenTripMap to your database
const categoryMap = {
  'cultural': 'Cultural',
  'natural': 'Nature',
  'historic': 'Historic',
  'architecture': 'Architecture',
  'museums': 'Museums',
  'sport': 'Sports',
  'amusements': 'Entertainment',
  'foods': 'Food & Drink',
  'shops': 'Shopping'
};

async function fetchActivitiesForCountry(country) {
    console.log(`Fetching activities for ${country.name}...`);
    
    const [minLat, minLon, maxLat, maxLon] = country.bbox.split(',');
    
    const url = `https://api.opentripmap.com/0.1/en/places/bbox?lon_min=${minLon}&lat_min=${minLat}&lon_max=${maxLon}&lat_max=${maxLat}&kinds=cultural,natural,historic,architecture,museums,sport,amusements,foods&limit=100&apikey=${API_KEY}`;
    
    console.log('Fetching URL:', url); // DEBUG - see what URL is being called
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('API Response:', data); // DEBUG - see what API returns
      
      // Handle both array and object responses
      if (Array.isArray(data)) {
        return data;
      } else if (data.features && Array.isArray(data.features)) {
        return data.features;
      } else {
        console.log('Unexpected response format:', data);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching ${country.name}:`, error);
      return [];
    }
  }

async function getPlaceDetails(xid) {
  const url = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for ${xid}:`, error);
    return null;
  }
}

async function insertActivity(activity, countryName) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Insert into activity table
    const [result] = await connection.query(
      'INSERT INTO activity (name, description, country_name) VALUES (?, ?, ?)',
      [
        activity.name || 'Unknown',
        activity.description || activity.info?.descr || '',
        countryName
      ]
    );
    
    const activityId = result.insertId;
    
    // Insert categories
    if (activity.kinds) {
      const kinds = activity.kinds.split(',');
      for (const kind of kinds) {
        const category = categoryMap[kind] || 'Other';
        
        await connection.query(
          'INSERT IGNORE INTO activity_category (activity_id, category) VALUES (?, ?)',
          [activityId, category]
        );
      }
    }
    
    // Insert as suggested activity with popularity rating
    const popularityRating = activity.rate || Math.random() * 5; // Use rate or random 0-5
    
    await connection.query(
      'INSERT INTO suggested_activity (activity_id, popularity_rating) VALUES (?, ?)',
      [activityId, popularityRating.toFixed(2)]
    );
    
    await connection.commit();
    console.log(`✓ Inserted: ${activity.name}`);
    
  } catch (error) {
    await connection.rollback();
    console.error(`✗ Error inserting activity:`, error.message);
  } finally {
    connection.release();
  }
}

async function populateDatabase() {
  console.log('Starting to populate database...\n');
  
  for (const country of countries) {
    const activities = await fetchActivitiesForCountry(country);
    
    console.log(`Found ${activities.length} activities for ${country.name}`);
    
    // Fetch details and insert each activity
    for (const activity of activities.slice(0, 20)) { // Limit to 20 per country for now
      if (activity.properties?.xid) {
        const details = await getPlaceDetails(activity.properties.xid);
        
        if (details && details.name) {
          await insertActivity({
            name: details.name,
            description: details.wikipedia_extracts?.text || details.info?.descr || '',
            kinds: details.kinds,
            rate: details.rate
          }, country.name);
          
          // Rate limiting - wait 200ms between requests
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
    
    console.log(`\nCompleted ${country.name}\n`);
  }
  
  console.log('Database population complete!');
  process.exit(0);
}

populateDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});