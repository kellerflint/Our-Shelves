Our Shelves - Deployment Documentation

This document explains how the Our Shelves project was configured, deployed, and connected across the full stack.
It serves as a technical handoff for developers who will maintain or extend this project.

Overview

Our Shelves is a full-stack application using the following technologies:

Frontend: React + Vite

Backend: Node.js + Express

Database: MySQL

Process Management: PM2

Hosting Environment: DigitalOcean Ubuntu VM

The application allows users to create and view items stored in a MySQL database.
The React frontend communicates with the Express backend, which performs SQL queries and serves the built frontend.

1. Production Database Setup

MySQL was installed on the DigitalOcean Ubuntu VM using the following commands:
sudo apt update
sudo apt install mysql-server -y

MySQL was configured to allow external access for Workbench and the application by updating:
/etc/mysql/mysql.conf.d/mysqld.cnf

Change this line:
bind-address = 0.0.0.0

A production database was created:
CREATE DATABASE appdb;

A dedicated user was created with global privileges for remote development:
CREATE USER 'userworkbench'@'%' IDENTIFIED BY 'NicePassword123!';
GRANT ALL PRIVILEGES ON . TO 'userworkbench'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

Verification was completed using MySQL Workbench:

Hostname: <VM_IP>

Port: 3306

Username: userworkbench

Password: NicePassword123!

2. Backend Deployment (Express + PM2)

A .env file was created in the project root containing:
PORT=3000
DB_HOST=localhost
DB_USER=userworkbench
DB_PASSWORD=NicePassword123!
DB_NAME=appdb
DB_PORT=3306

This file is listed in .gitignore so it does not get committed.

Dependencies were installed using:
npm install express mysql2 dotenv cors

The server is defined in index.js and managed with PM2:
pm2 start index.js --name index
pm2 save
pm2 startup

The backend API is accessible at:
http://<VM_IP>:3000

Endpoints:

GET /items → Retrieves all items

POST /items → Adds a new item

3. Frontend Deployment (React + Vite)

The frontend is located in the client/ directory and was created using Vite.

To set it up:
cd client
npm install

A .env file was created inside client/ with:
VITE_API_URL=http://<VM_IP>:3000

The frontend was built with:
npm run build

Vite generated production files inside:
client/dist/

Express was configured to serve these files:
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "client/dist")));
app.get("*", (req, res) => {
res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

The React frontend is accessible through the same port (3000).

4. Firewall Configuration

The firewall was configured using UFW to allow connections:
sudo ufw allow 22
sudo ufw allow 3000
sudo ufw allow 5173
sudo ufw allow 3306
sudo ufw enable

This allows access for demonstration and remote testing.

5. Create and Read Functionality

The application uses a simple table named items:
CREATE TABLE items (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(500),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

The frontend form sends a POST request to /items to insert a new record.
The frontend also calls /items on page load to retrieve and display all items from the database.

6. Local Development Workflow

Start backend (local):
node index.js

Start frontend (local):
cd client
npm run dev

Test production build:
pm2 restart index
Then open http://<VM_IP>:3000

7. Environment Variables Summary

PORT - Express server port
DB_HOST - MySQL host (localhost on VM)
DB_USER - MySQL username
DB_PASSWORD - MySQL password
DB_NAME - MySQL database name
DB_PORT - MySQL port (3306)
VITE_API_URL - Backend URL for frontend calls

8. Notes for Future Developers

Do not commit .env files.

Always rebuild the frontend with npm run build after changes.

Restart the backend with pm2 restart index after deployment updates.

Restrict MySQL and Express access to trusted IPs after demo.

Document any schema changes in this file.

9. Verification Checklist

[x] MySQL running and accessible
[x] Express server deployed via PM2
[x] React frontend accessible through same port
[x] Create and Read operations functional
[x] .env protected and ignored
[x] Code stable and running on VM

10. Author Notes

This document describes a working full-stack deployment of a React, Express, and MySQL application hosted on a DigitalOcean Ubuntu VM.
All steps have been verified as of the current working build.

Now you can run:
git add README_DEPLOY.md
git commit -m "Add deployment documentation"
git push origin features
