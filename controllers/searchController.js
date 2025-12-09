const pool = require('../config/db');

exports.searchDishes = async (req, res) => {
    try {
        const { name, minPrice, maxPrice } = req.query;

        // Validation
        if (!name || !minPrice || !maxPrice) {
            return res.status(400).json({
                error: 'Missing required query parameters: name, minPrice, maxPrice'
            });
        }

        const query = `
            SELECT 
                r.id as restaurantId,
                r.name as restaurantName,
                r.city,
                m.name as dishName,
                m.price as dishPrice,
                COUNT(o.id) as orderCount
            FROM restaurants r
            JOIN menu_items m ON r.id = m.restaurant_id
            LEFT JOIN orders o ON m.id = o.menu_item_id
            WHERE 
                m.name LIKE ? 
                AND m.price BETWEEN ? AND ?
            GROUP BY r.id, m.id
            ORDER BY orderCount DESC
            LIMIT 10
        `;

        const [rows] = await pool.query(query, [`%${name}%`, minPrice, maxPrice]);

        // Format numbers to match requirement (although JSON handles numbers, sometimes SQL returns strings for count)
        const results = rows.map(row => ({
            ...row,
            dishPrice: parseFloat(row.dishPrice), // Ensure number
            orderCount: parseInt(row.orderCount) // Ensure number
        }));

        res.json({ restaurants: results });

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
