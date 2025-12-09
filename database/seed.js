const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'restaurant_db',
    multipleStatements: true
};

async function seed() {
    let connection;
    try {
        // Create connection without database first to ensure it exists
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        await connection.query(`USE \`${dbConfig.database}\`;`);

        console.log('Database created/selected.');

        const schema = require('fs').readFileSync('./database/schema.sql', 'utf8');
        await connection.query(schema);
        console.log('Schema applied.');

        // Clear existing data
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        await connection.query('TRUNCATE TABLE orders;');
        await connection.query('TRUNCATE TABLE menu_items;');
        await connection.query('TRUNCATE TABLE restaurants;');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

        // Insert Restaurants
        const [resParams] = await connection.query(`
            INSERT INTO restaurants (name, city) VALUES 
            ('Hyderabadi Spice House', 'Hyderabad'),
            ('Mumbai Flavors', 'Mumbai'),
            ('Delhi Delights', 'Delhi'),
            ('Bangalore Bites', 'Bangalore'),
            ('Chennai Kitchen', 'Chennai')
        `);
        console.log('Restaurants inserted.');

        // Get Restaurant IDs (assuming auto-increment starts at 1, but fetching is safer)
        const [restaurants] = await connection.query('SELECT id, name FROM restaurants');
        const rMap = restaurants.reduce((acc, r) => { acc[r.name] = r.id; return acc; }, {});

        // Insert Menu Items
        const menuItemsData = [
            { r: 'Hyderabadi Spice House', n: 'Chicken Biryani', p: 220 },
            { r: 'Hyderabadi Spice House', n: 'Mutton Biryani', p: 350 },
            { r: 'Mumbai Flavors', n: 'Chicken Biryani', p: 200 },
            { r: 'Mumbai Flavors', n: 'Veg Biryani', p: 180 },
            { r: 'Delhi Delights', n: 'Chicken Biryani', p: 250 },
            { r: 'Delhi Delights', n: 'Butter Chicken', p: 280 },
            { r: 'Bangalore Bites', n: 'Chicken Biryani', p: 190 },
            { r: 'Chennai Kitchen', n: 'Chicken Biryani', p: 210 }
        ];

        for (const item of menuItemsData) {
            await connection.query('INSERT INTO menu_items (restaurant_id, name, price) VALUES (?, ?, ?)',
                [rMap[item.r], item.n, item.p]);
        }
        console.log('Menu Items inserted.');

        // Fetch Menu Items to seed orders
        const [menuItems] = await connection.query('SELECT id, name, restaurant_id FROM menu_items');

        // Insert Orders (random counts to simulate popularity)
        // High orders for Hyderabadi Spice House - Chicken Biryani
        const ordersValues = [];

        const addOrders = (itemName, restaurantName, count) => {
            const rId = rMap[restaurantName];
            const item = menuItems.find(m => m.name === itemName && m.restaurant_id === rId);
            if (item) {
                for (let i = 0; i < count; i++) {
                    ordersValues.push([item.id]);
                }
            }
        };

        addOrders('Chicken Biryani', 'Hyderabadi Spice House', 96);
        addOrders('Chicken Biryani', 'Mumbai Flavors', 45);
        addOrders('Chicken Biryani', 'Delhi Delights', 60);
        addOrders('Chicken Biryani', 'Bangalore Bites', 30);
        addOrders('Chicken Biryani', 'Chennai Kitchen', 20);
        addOrders('Mutton Biryani', 'Hyderabadi Spice House', 50);

        if (ordersValues.length > 0) {
            // Insert in batches to avoid query size limits if it were huge, but here it's fine
            const placeholder = ordersValues.map(() => '(?)').join(',');
            const flatValues = ordersValues.flat();
            // Constructing query manually for bulk insert
            await connection.query(`INSERT INTO orders (menu_item_id) VALUES ${placeholder}`, flatValues);
        }

        console.log(`Seeded ${ordersValues.length} orders.`);
        console.log('Seeding completed successfully.');

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

seed();
