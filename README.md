# Our Shelves

A reading tracker web application that allows users to search for books using the **Open Library API**, save them to their personal digital shelf, and manage their book collection.

## Team Members

**Sprint 1/2:**
- Alston
- Danny

**Sprint 3:**
- Kim
- Maddie

**Sprint 4:**
- Tyler
- Raymond

---

## Project Description

**Our Shelves** lets users:
- Search for books by title using the [Open Library API](https://openlibrary.org/developers/api).
- Add books to their personal shelf stored in a **MySQL** database.
- View their saved books.
- Delete books from their library.
- Interact with a **React frontend** and **Express backend**, connected via REST API.

### Future Feature Goals
- Add personal notes to books.
- Track bookmarks / reading progress.
- Organize books into multiple shelves.
- Share shelves and notes with friends.
- Support light/dark theme customization.

---

## Tech Stack

| Layer             | Technology                     |
|--------------------|-----------------------------|
| Frontend           | React (Vite), React Router   |
| Backend            | Node.js, Express.js          |
| Database           | MySQL (`mysql2/promise`)     |
| External API       | Open Library API            |
| Packaging     | Docker            |
| Deployment         | Ubuntu Server         |

---

## Prerequisites

Make sure the following are installed:

- [Node.js v18+](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [MySQL](https://dev.mysql.com/downloads/mysql/)
- [Docker](https://www.docker.com/get-started/)

---

## Environment Variables

### Inside project root `env`
```env
# db & api
MYSQL_USER=username
MYSQL_PASSWORD=superSecurePassword
MYSQL_DATABASE=my_favorite_db

# api
DB_PORT=3306
PORT=3000
HOST=localhost

# frontend
VITE_API_URL=http://${HOST}:${PORT}
```

> For production, replace `localhost` with your server IP or domain name.

---

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/our-shelves.git
cd our-shelves
```

### 2. Install Dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Set Up `.env` File
- Create `.env` inside root directory.
- Copy and paste the environment variable structure shown above.

---

## Running the Application (Local)

The backend, frontend, and MySQL server can all be built and ran with one command:
```bash
docker compose up -d
```

---

## Deployment Instructions (Ubuntu + Docker)

### 1. Update VM and Install Dependencies
**Updating:**
```bash
apt update
yes | sudo DEBIAN_FRONTEND=noninteractive apt-get -yqq upgrade
```

**Install Git**
```bash
apt install git
```

**Install Docker Engine With apt Repository**
Setup apt repo:
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```
Install docker package:
```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Confirm docker is installed and running:
```bash
sudo systemctl status docker
```

**Install docker compose**
```bash
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### 2. Clone Repository
```bash
git clone https://github.com/your-username/our-shelves.git
cd our-shelves
```

### 3. Add .env to repository
```bash
nano .env
```
Inside nano text editor:

```env
# db & api
MYSQL_USER=username
MYSQL_PASSWORD=superSecurePassword
MYSQL_DATABASE=my_favorite_db

# api
DB_PORT=3306
PORT=3000
HOST=<VM IP>

# frontend
VITE_API_URL=http://${HOST}:${PORT}
```
Ctrl + o to save
Ctrl + x to exit

Check if .env exists:
```bash
ls -a
```
### 4. Build and Deploy Docker Images
The application can be built and deployed with one command now:
```bash
docker compose up -d
```

The frontend will be running on the VMs IP address defined in the env, on PORT 5173.
ex: http://0.0.0.0:5173  (replace 0.0.0.0 with VM IP)


---

## API Endpoints

| Method | Endpoint                        | Description                         |
|--------|-----------------------------------|-------------------------------------|
| GET    | `/books`                          | Fetch all saved books              |
| POST   | `/books`                          | Add a new book                     |
| DELETE | `/books/:id`                      | Delete a book by ID                |
| GET    | `/books/search/:bookName`         | Search books via Open Library API  |

---

## Useful Commands

**Updating Deployed App:**
```bash
git pull
docker compose up -build
```

**Stopping:**
```bash
docker compose down
```

---

## Troubleshooting Tips
- Ensure `.env` files are correctly configured
- Confirm no leading spaces in env variables
- Check firewall settings if deploying to a remote server (allow ports 3000 and 5173).

---
## Testing
### Running Tests on the Backend
```bash
cd backend
npm test
```
### Running Tests on the Frontend
```bash
cd frontend
npm test
```
### Running E2E Tests
Make sure the backend is running
```bash
cd backend
npm run dev
```
and Make sure the frontend is running
```bash
cd frontend
npm run dev
```
Then access the e2e folder from the root directory
```bash
cd e2e
npm install
```
Once you've done this you have two options to run the test.
#### Option 1: 
```bash
npm run cy:open # Will open an application to view the tests live
```
#### Option 2:
```bash
npm run cy:run # Will run the tests in the terminal
```

#### ***NOTE:***
Cypress will run and create a screenshot and video folder displaying the errors and the functionality of tests.


---

## License
This project is for educational use as part of a student project at Green River College.
