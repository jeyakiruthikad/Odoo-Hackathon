# 🚚 TransitOps - Smart Transport Operation System

> **Developed for the Odoo Hackathon**

TransitOps is a web-based Fleet & Transportation Management System designed to streamline fleet operations. It enables organizations to efficiently manage vehicles, drivers, trips, maintenance, fuel logs, and expenses through a centralized and user-friendly dashboard.

---

# 📖 Project Overview

Managing transportation manually often leads to scheduling conflicts, maintenance delays, inaccurate records, and increased operational costs.

TransitOps provides a centralized solution to:

- Manage vehicles and drivers
- Schedule and monitor trips
- Track maintenance activities
- Record fuel usage and operational expenses
- Improve fleet utilization
- Enforce business rules for reliable operations

---

# ✨ Features

## 🔐 Authentication
- Secure JWT-based login
- Protected API routes
- Role-based access

## 🚛 Vehicle Management
- Register vehicles
- Edit vehicle details
- Delete vehicles
- Search vehicles
- Track vehicle availability

## 👨‍✈️ Driver Management
- Add and update drivers
- Monitor driver availability
- Assign drivers to trips

## 📦 Trip Management
- Create trip requests
- Dispatch trips
- Complete trips
- Cancel trips

## 🔧 Maintenance Management
- Schedule maintenance
- Close maintenance records
- Automatically update vehicle status

## ⛽ Fuel Management
- Record fuel consumption
- Maintain fuel history

## 💰 Expense Management
- Track operational expenses
- Maintain expense records

## 📊 Dashboard
- Fleet overview
- Vehicle availability
- Driver availability
- Active trips
- Maintenance summary

---

# 🛠 Technology Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Context API

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication
- JWT (JSON Web Token)
- bcrypt

## Development Tools
- Git
- GitHub
- Postman
- MongoDB Compass
- Visual Studio Code

---

# 🏗 System Architecture

```
React Frontend
       │
       ▼
     Axios
       │
       ▼
Express REST API
       │
       ▼
MongoDB Database
```

---

# 📁 Project Structure

```
TransitOps
│
├── transitops-frontend
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── services
│   │   ├── utils
│   │   └── App.jsx
│   └── package.json
│
├── transitops-backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

- Node.js (v18 or later)
- npm
- MongoDB Community Server
- Git
- Visual Studio Code (Recommended)

Check your installation:

```bash
node -v
npm -v
git --version
```

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/jeyakiruthikad/Odoo-Hackathon/.git

cd Odoo-Hackathon
```

---

## 2️⃣ Backend Setup

Navigate to the backend folder:

```bash
cd transitops-backend
```

Install dependencies:

```bash
npm install
```

### Create a `.env` file

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

> Replace the placeholder values with your own local configuration. Do not commit your actual `.env` file to GitHub.

Start the backend server:

```bash
npm run dev
```

You should see:

```
MongoDB Connected
Server running on port 5000
```

---

## 3️⃣ Frontend Setup

Open a new terminal.

Navigate to the frontend folder:

```bash
cd transitops-frontend
```

Install dependencies:

```bash
npm install
```

### Create a `.env` file

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open your browser and visit:

```
http://localhost:5173
```

---

## 4️⃣ Running the Application

Start both servers.

### Backend

```bash
cd transitops-backend
npm run dev
```

### Frontend

```bash
cd transitops-frontend
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

# 📡 API Endpoints

| Module | Endpoint |
|---------|----------|
| Authentication | `/api/auth/login` |
| Vehicles | `/api/vehicles` |
| Drivers | `/api/drivers` |
| Trips | `/api/trips` |
| Maintenance | `/api/maintenance` |
| Fuel Logs | `/api/fuel` |
| Expenses | `/api/expenses` |

---

# ✅ Business Rules

- Vehicle registration numbers must be unique.
- A vehicle cannot be assigned to multiple active trips.
- A driver cannot be assigned to multiple active trips.
- Cargo weight cannot exceed vehicle capacity.
- Vehicle status updates automatically during trips and maintenance.
- Driver status updates automatically after trip completion.
- Protected routes require JWT authentication.

---

# 🧪 Testing

The application was tested using:

- Postman
- MongoDB Compass
- Browser testing
- CRUD operation testing
- Business rule validation
- Responsive UI testing

---

# 🔮 Future Enhancements

- GPS-based live vehicle tracking
- Route optimization
- Predictive maintenance
- Fuel analytics dashboard
- Driver performance reports
- Export reports to PDF/Excel
- Email and SMS notifications

---

# 👥 Team

| Member | Responsibility |
|---------|----------------|
| Jeya Kiruthika D | Frontend Development |
| Jeya Keerthana D | Backend Development & Database |

> Replace the placeholders with your actual names.

---

# 📄 License

This project was developed for the **Odoo Hackathon** and is intended for educational and demonstration purposes.

---

# 🙏 Acknowledgements

We thank the **Odoo Hackathon** organizers for providing the opportunity to build an innovative fleet management solution.
