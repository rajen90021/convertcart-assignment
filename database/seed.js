const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();

async function seed() {

    const connection = await mysql.createConnection({
        host: process.env.HOST,
        port: process.env.PORT,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
            rejectUnauthorized: true,
            ca: fs.readFileSync('./ca.pem')   // IMPORTANT
        }
    });

    try {
        console.log("✔ Connected to Aiven MySQL");

        // Load schema file
        const schema = fs.readFileSync("./database/schema.sql", "utf8");
        await connection.query(schema);
        console.log("✔ Schema applied");

        // Delete old data
        await connection.query("DELETE FROM orders;");
        await connection.query("DELETE FROM menu_items;");
        await connection.query("DELETE FROM restaurants;");
        console.log("✔ Old data cleared");

        // Insert Restaurants
        await connection.query(`
            INSERT INTO restaurants (name, city) VALUES 
            ('Hyderabadi Spice House', 'Hyderabad'),
            ('Mumbai Flavors', 'Mumbai'),
            ('Delhi Delights', 'Delhi'),
            ('Bangalore Bites', 'Bangalore'),
            ('Chennai Kitchen', 'Chennai')
        `);
        console.log("✔ Restaurants inserted");

        const [restaurants] = await connection.query("SELECT id, name FROM restaurants");
        const rMap = restaurants.reduce((acc, r) => {
            acc[r.name] = r.id;
            return acc;
        }, {});

        // Insert menu_items
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
            await connection.query(
                "INSERT INTO menu_items (restaurant_id, name, price) VALUES (?, ?, ?)",
                [rMap[item.r], item.n, item.p]
            );
        }
        console.log("✔ Menu items inserted");

        const [menuItems] = await connection.query("SELECT id, name, restaurant_id FROM menu_items");

        // Insert orders
        const ordersValues = [];

        const addOrders = (itemName, restaurantName, count) => {
            const rId = rMap[restaurantName];
            const item = menuItems.find(m => m.name === itemName && m.restaurant_id === rId);
            if (!item) return;
            for (let i = 0; i < count; i++) {
                ordersValues.push([item.id]);
            }
        };

        addOrders('Chicken Biryani', 'Hyderabadi Spice House', 96);
        addOrders('Chicken Biryani', 'Mumbai Flavors', 45);
        addOrders('Chicken Biryani', 'Delhi Delights', 60);
        addOrders('Chicken Biryani', 'Bangalore Bites', 30);
        addOrders('Chicken Biryani', 'Chennai Kitchen', 20);
        addOrders('Mutton Biryani', 'Hyderabadi Spice House', 50);

        if (ordersValues.length > 0) {
            await connection.query(
                `INSERT INTO orders (menu_item_id) VALUES ${ordersValues.map(() => "(?)").join(",")}`,
                ordersValues.flat()
            );
        }

        console.log(`✔ Seeded ${ordersValues.length} orders`);
        console.log("🎉 Seeding completed");

    } catch (err) {
        console.error("❌ Seeding failed:", err);
    } finally {
        await connection.end();
    }
}

seed();
