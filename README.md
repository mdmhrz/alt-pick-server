# 🧠 AltPick Server

> 🌐 *A secure and lightweight backend for AltPick — powered by Express, MongoDB, and Firebase Admin.*

---

## 📝 Description

The **AltPick Server** is the RESTful API backend of the AltPick application. It handles user authentication (via Firebase Admin), product query management, recommendation processing, and integrates with MongoDB for fast, scalable data storage. The backend is built with **Express.js**, structured for maintainability, and equipped with environment-based configuration using **dotenv**.

---

## 🚀 Tech Stack

| Tool / Library       | Purpose                                 |
|----------------------|------------------------------------------|
| 🧭 `Express 5`        | Backend Web Framework                    |
| 🍃 `MongoDB 6`        | NoSQL Database                           |
| 🔐 `Firebase Admin`   | Token validation & user verification     |
| 🌍 `CORS`             | Cross-origin request management          |
| 🔁 `nodemon`          | Dev-time auto-reloading                  |
| 🔑 `dotenv`           | Secure environment configuration         |

---

## 📦 Project Structure
```
alt-pick-server/
│
├── routes/ # API route handlers
├── controllers/ # Logic for each route
├── utils/ # Firebase setup, DB connection, etc.
├── .env # Environment variables
├── index.js # Entry point (Express server)
└── package.json # Project metadata & dependencies
```

## 🧪 Development
```bash
nodemon index.js
```
Server will run on:
```http://localhost:3000```



## 📮 API Endpoints (Example)
| Method | Route                  | Description                        |
| ------ | ---------------------- | ---------------------------------- |
| GET    | `/queries`             | Get all product queries            |
| GET    | `/queries/:id`         | Get a single query by ID           |
| POST   | `/recommendations`     | Add a new recommendation           |
| DELETE | `/recommendations/:id` | Delete a recommendation (auth req) |

## 🙌 Contribution
Feel free to contribute, fork the repo, or raise an issue to improve the backend. PRs are welcome!

