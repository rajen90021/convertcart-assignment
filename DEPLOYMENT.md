# Deployment Guide (Render + MySQL)

Since your application uses **MySQL**, and Render (the platform in your screenshot) does not provide a free managed MySQL database (they use PostgreSQL), you need to host your database separately or use a provider that supports MySQL.

Here is the recommended path using **Aiven** (for free MySQL) and **Render** (for the Node.js app). Alternatively, you can use **Railway** for both.

---

## Option 1: Render (App) + Aiven (Database) - *Recommended for "Free Tier" permanence*

### Step 1: Create a Free MySQL Database
1.  Go to [Aiven.io](https://aiven.io/) and allow the free trial/tier.
2.  Create a new service: **MySQL**.
3.  Select the **Free Plan** (DigitalOcean or similar cloud).
4.  Once created, copy the **Service URI** (looks like `mysql://user:password@host:port/defaultdb...`).
5.  *Important:* You may need to create the specific database name `restaurant_db` or updates your `.env` to use `defaultdb`.

### Step 2: Configure Render Web Service
1.  In your Render dashboard (the screen you screenshotted):
2.  **Name**: `restaurant-search-api` (or similar).
3.  **Region**: Choose one close to you.
4.  **Branch**: `main`.
5.  **Root Directory**: Leave empty (defaults to root).
6.  **Runtime**: `Node`.
7.  **Build Command**: `npm install`.
8.  **Start Command**: `npm start`.
9.  **Instance Type**: Select **Free**.

### Step 3: Environment Variables (Crucial!)
Scroll down to "Environment Variables" and add these keys using the details from your Aiven/MySQL database:

| Key | Value |
| --- | --- |
| `DB_HOST` | The host from Aiven (e.g., `mysql-service...aivencloud.com`) |
| `DB_PORT` | The port (usually `2XXXX`) |
| `DB_USER` | The username (e.g., `avnadmin`) |
| `DB_PASSWORD` | The password |
| `DB_NAME` | `defaultdb` (or whatever database name exists) |

*Note:* If you have a full connection string (URI), you might need to parse it into these fields, or modify your `config/db.js` to accept a `DATABASE_URL` environment variable. But for now, separate fields work if you extract them.

### Step 4: Deploy
Click **Create Web Service**. Render will clone your repo and install dependencies.

### Step 5: Seed the Database
Since default `npm start` just runs the server, your database is empty.
1.  Wait for the deploy to finish (it might log "Server running" but the DB is empty).
2.  Go to the **Shell** tab in your Render service dashboard.
3.  Run the seed command manually:
    ```bash
    node database/seed.js
    ```
4.  You should see "Seeding completed successfully."

---

## Option 2: Railway (App + Database) - *Easiest Setup*

Railway handles both Node.js and MySQL in one project.

1.  Go to [Railway.app](https://railway.app/).
2.  Create a **New Project** > **Provision MySQL**.
3.  Click on the MySQL service > **Variables** tab > Copy the values or just notice them.
4.  In the same project, click **New** > **GitHub Repo** > Select your `convertcart-assignment` repo.
5.  Railway automatically detects Node.js.
6.  Go to your App Service > **Variables**.
7.  Add the database variables. Railway often makes this automatic if you "Reference" the MySQL variable, but you can manually paste:
    - `DB_HOST`: `${{MySQL.MYSQLHOST}}`
    - `DB_USER`: `${{MySQL.MYSQLUSER}}`
    - `DB_PASSWORD`: `${{MySQL.MYSQLPASSWORD}}`
    - `DB_NAME`: `${{MySQL.MYSQLDATABASE}}`
    - `DB_PORT`: `${{MySQL.MYSQLPORT}}`
8.  **Seeding**:
    - Go to your App Service > **Settings** > **Deploy Command**.
    - Change it to: `node database/seed.js && npm start` (ONLY do this for the *first* deploy, then remove `node database/seed.js` so it doesn't reset every time).
    - OR, keep the command as `npm start`, and use the **Railway CLI** or connect to the DB via an external tool to run the SQL from `schema.sql` and `seed.js`.

---

## Quick Checklist for Render (Your Screenshot)
1.  **Build Command**: `npm install`
2.  **Start Command**: `npm start`
3.  **Env Vars**:
    - `DB_HOST`
    - `DB_USER`
    - `DB_PASSWORD`
    - `DB_NAME`
4.  **Run Seed**: via **Shell** tab after deploy.
