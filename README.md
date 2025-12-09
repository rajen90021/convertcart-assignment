# Restaurant Search Backend

A simple Node.js + MySQL backend service that allows users to search for restaurants based on a dish name, filtered by price range, and sorted by popularity.

## Tech Stack
- Node.js
- Express.js
- MySQL

## Prerequisites
- Node.js installed
- MySQL installed and running
- A database created (or allow the seed script to create it)

## Setup

1.  **Clone the repository** (if applicable)
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Database Configuration**
    - Create a `.env` file in the root directory.
    - Add your MySQL credentials:
      ```env
      PORT=3000
      DB_HOST=localhost
      DB_USER=root
      DB_PASSWORD=your_password
      DB_NAME=restaurant_db
      ```

4.  **Seed Database**
    - Run the seed script to create tables and populate sample data:
      ```bash
      node database/seed.js
      ```
    - This will create the `restaurant_db` (if configured in .env), creating tables `restaurants`, `menu_items`, `orders`, and inserting sample data.

5.  **Start the Server**
    ```bash
    npm start
    ```
    - The server will start on `http://localhost:3000`.

## API Usage

### Search Dishes

**Endpoint:** `GET /search/dishes`

**Query Parameters:**
- `name` (required): Name of the dish (partial match supported).
- `minPrice` (required): Minimum price filter.
- `maxPrice` (required): Maximum price filter.

**Example Request:**
```
GET http://localhost:3000/search/dishes?name=biryani&minPrice=150&maxPrice=300
```

**Example Response:**
```json
{
  "restaurants": [
    {
      "restaurantId": 1,
      "restaurantName": "Hyderabadi Spice House",
      "city": "Hyderabad",
      "dishName": "Chicken Biryani",
      "dishPrice": 220,
      "orderCount": 96
    },
    {
      "restaurantId": 3,
      "restaurantName": "Delhi Delights",
      "city": "Delhi",
      "dishName": "Chicken Biryani",
      "dishPrice": 250,
      "orderCount": 60
    }
  ]
}
```

## Hosting
This project is ready to be deployed on platforms like Render or Railway. 
- Ensure you set the environment variables (DB_HOST, etc.) in the hosting platform's dashboard.
