# International Payments Portal

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Web-blue.svg)
![Backend](https://img.shields.io/badge/backend-Node.js%20%7C%20Express%20%7C%20MongoDB-green.svg)
![Frontend](https://img.shields.io/badge/frontend-React%20JS%20%7C%20Axios-orange.svg)
![Security](https://img.shields.io/badge/security-HTTPS%20%7C%20JWT%20%7C%20Encryption-red.svg)

This is a secure **International Payments Website** for customers of a bank. A full-stack website that enables users to register, authenticate, and perform secure transactions. This portal allows customers to make international payments, track their transactions history, and manage their account.
This website ensures high security through password hashing, ssl encryption, input validation with RegEx patterns and scalability.  
A separate **Employee Portal** is planned for future development to handle verification and reporting.


---
## Group Memebers:
- Nia Diale - ST10396650
- Thando Nqobile Candies Phiri - ST10377344
- Letlotlo Motloung - ST10365209
- Keitumetse George Rankwane - ST10372590

---

## Table of Contents

- [Overview](#overview)
- [Implemented Features](#implemented-features)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Setup Guide](#setup-guide)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Frontend Integration](#frontend-integration)
- [Security Implementation](#security-implementation)
  - [Frontend Security](#frontend-security)
  - [Backend Security](#backend-security)
  - [DDoS & Infrastructure / Additional Protections](#ddos--infrastructure--additional-protections)
- [GitHub Workflows (DevSecOps)](#github-workflows-devsecops)
- [License](#license)
- [Additional Resources](#additional-resources)

---

## Overview

The **International Payments Portal** is a secure web-based system designed to simplify international money transfers.  
It enables customers to initiate, manage, and track payment transactions.  

The project integrates a **Node.js + Express backend** with a **React.js frontend**, ensuring an efficient and responsive experience.  
The backend includes strong encryption, JWT authentication, and Mongoose-based data management.


### Key Highlights

- **Secure Transactions** — AES-256-CBC encryption for sensitive data
- **RESTful APIs** — Well-structured endpoints for smooth communication  
- **International Transactions** — Support for multiple currencies
- **Role-Based Access** — Future employee/admin access system   

---

## Features

### Customer Features
- **Register & Login** — Customers can register with their personal details and login with secure user authentication with JWT and session management. 
- **Submit Payment** — Create and track international payment requests.
- **Currency Support** — Send and receive in multiple currencies.  
- **Transaction History** — Track all transactions and statuses.  
- **Encrypted Data** — All payment and user data encrypted before storage.    

### Employee Features (To be implemented)
- **Employee Authentication** — Secure login for employees  
- **Transaction Review** — Review and verify pending transactions


## Implemented Features

- Customer registration and login (JWT authentication)
- Employee login scaffolding (pre-seeded test employees)
- Create international payments (payment creation API)
- Transaction listing, filtering, and detail endpoints
- Input validation (regex-based) and server-side sanitization
- Password hashing (bcrypt) and AES encryption for sensitive fields
- Brute-force protection (failed login lockouts)
- Basic session security using JWT with expiry
- CORS configuration, security headers (helmet), and rate limiting
- Dev & CI guidance (workflows / scanning setup references included in repo docs)

---

## Technology Stack

### Backend
- **Language:** JavaScript (Node.js)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + bcrypt
- **Encryption:** crypto (AES-256-CBC)
- **Validation:** express-validator

### Frontend
- **Framework:** React.js
- **HTTP Client:** Axios
- **Routing:** React Router DOM
- **Styling:** CSS
- **State Management:** React Hooks & Context API

### Development Tools
- **Environment Variables:** dotenv
- **Testing:** Postman
- **Version Control:** Git & GitHub

### Security Implementations

- **Password Hashing**: Using bcrypt before saving to the database
- **JWT Authentication**: Secure user sessions via tokens
- **AES Encryption**: Encrypts sensitive transaction details
- **Input Validation**: Prevents malformed data and attacks
- **Error Handling**: Clean and consistent error responses
- **CORS**: Configured to allow secure cross-origin requests


#### Frontend Security

- **REGEX INPUT VALIDATION** — Client-side validation to reduce invalid inputs before submission.
- **XSS PROTECTION (CROSS-SITE SCRIPTING)** — Input sanitization and output escaping patterns.
- **SESSION MANAGEMENT (SESSION JACKING)** — JWT tokens with expiry and storing tokens responsibly.
- **HTTPS (MITM PROTECTION)** — Project is configured to require HTTPS in production.
- **CLICKJACKING (CSP)** — Content Security Policy headers included in server headers recommendations.

#### Backend Security

- **REGEX WHITELISTING** — Server-side validation using strict regex patterns for all inputs (IDs, account numbers, SWIFT codes, etc.).
- **SQL INJECTION PROTECTION** — Using Mongoose.
- **SESSION SECURITY (SESSION JACKING)** — JWT validation middleware, token expiry, and route protection.
- **DATA ENCRYPTION** — AES-based field encryption for highly sensitive fields (ID numbers, account numbers) before storage.
- **BRUTE FORCE** — Login attempt tracking, temporary account lock, and rate-limiting on auth endpoints.
- **DDoS** — Rate limiting.
- **SECURITY HEADERS** — Helmet middleware applied.
- **CORS CONFIGURATION** — CORS restricted to configured frontend origins.
- **CROSS-SITE SCRIPTING** — Server-side sanitization before storing/displaying content.


---

## GitHub Workflows (DevSecOps)

The repository includes GitHub Actions workflows to automate testing, security scanning, and deployment.

| Extension                     |
| ----------------------------- | 
| **ESLint**                    |
| **REST Client**               |
| **GitLens**                   | 
| **Snyk**                      | 
| **Git Actions**               |
| **Sonar**                     |




## Architecture Overview
```
Frontend (React)
│
├── Pages (Login, Register, Payments)
│
▼
Backend (Express)
├── Routes (/api/customer, /api/payment)
├── Controllers (Handle business logic)
├── Middleware (Auth, Validation)
└── Models (User, Payment)
│
▼
Database (MongoDB)
├── users Collection
├── payments Collection
└── logs Collection
```

---

## Setup Guide

### 1. Clone the Repository

git clone https://github.com/YourUsername/international-payments-portal.git
cd international-payments-portal

#### Backend Setup
cd backend
npm install

#### Create a .env file 
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_characters_key
ENCRYPTION_IV=your_16_characters_iv

#### Run the server
npm start

#### Frontend Setup
cd frontend
npm install
npm start

#### Access your app:
Frontend: http://localhost:3000

Backend API: http://localhost:5000

---

## Project Structure
```
international-payments-portal/
├── github/
│   ├── workflows/
│   ├── scripts/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── customerController.js
│   │   ├── employeeController.js
│   │   └── paymentController.js
│   ├── models/
│   │   ├── Customer.js
│   │   ├── Employee.js
│   │   ├── Role.js
│   │   └── Payment.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── customerRoutes.js
│   │   └── employeeRoutes.js
│   ├── utils/
│   │   ├── encryption.js
│   │   ├── jwt.js
│   │   ├── populateDatabase.js
│   │   └── validate.js
│   ├── server.js
│   └── .env
├── certificates/
│   ├── server.crt
│   ├── server.key
│
├── frontend/
│   ├── src/
│   │   ├── public/
│   │   ├── components/
│   │   ├── scripts/
│   ├── src/
│   │   ├── compnents/
│   │   ├── contexts/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── TransactionHistory.jsx
│   │   │   └── MakePayment.jsx
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── README.md
└── LICENSE
```
---

## API Endpoints

### Authentication
- POST /api/customer/register - Register new user
- POST /api/customer/login - Login user
- GET /api/customer/profile - Get customeer profile (Protected)
- POST /api//customer/logout - Get current user (Protected)

### Make International Payment
- POST /api/customer/payment - Create a new payment
- GET /api/customer/transactions - Get all transaction for customer
- GET /api/customer/transactions/:id - Get specific payment details
- PUT /transactions/:id/status - Update payment status


## Testing with Postman

### 1. Register/Login
POST http://localhost:5000/api/customer/login
Headers: 
      Key: Context-Type 
      Value: application/json
Body: { "username": "opendown", "account_number": "8800557711",  "password": "CreatePassword1*" }

Copy the token from response.

### 2. Protected Routes
Add to Headers:
      Key: Context-Type 
      Value: application/json
Authorization: Bearer YOUR_TOKEN_HERE

### 3. Create Payment
POST http://localhost:5000/api/customer/payment
Headers:
      Key: Context-Type 
      Value: application/json
Authorization: Bearer YOUR_TOKEN

Body:
{
  "amount": "190",
  "currency": "USD",
  "beneficiary_name": "Molly Huda",
  "beneficiary_account": "77363779966444",
  "swift_code": "NWBKGB2L",
  "bank_name": "England Bank",  
  "bank_address": "London. England",  
  "bank_country": "Asia"
}


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Nia Diale

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Contact

**Author**: Nia Diale
**Institution**: Varsity College
**Course**: BCA3 - INSY7314 Part 3
**Repository**: [bca3-prog7314-part-2-submission-ST10356476]([https://github.com/VCPTA/bca3-prog7314-part-2-submission-ST10356476](https://github.com/VCPTA/bca3-insy7314-poe-submission-ST10396650.git))


## Acknowledgments

- **Varsity College** - For educational support
- **MongoDB** - Backend services
- **Node.js, Express, MongoDB Teams** – Backend frameworks
- **React.js Community** – Frontend development tools
- **JWT & bcrypt Developers** – Authentication libraries
- **CSS** – UI styling and design system

## Additional Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/en/docs)  
- [Express.js Guide](https://expressjs.com/en/starter/installing.html)  
- [MongoDB Manual](https://www.mongodb.com/docs/)  
- [Mongoose Documentation](https://mongoosejs.com/docs/)  
- [React.js Documentation](https://react.dev/)  
- [Axios HTTP Client](https://axios-http.com/docs/intro)  
- [JSON Web Tokens (JWT)](https://jwt.io/introduction/)  
- [bcrypt.js Documentation](https://github.com/kelektiv/node.bcrypt.js)     

### Tutorials
- [Build a Secure REST API with Node.js and Express](https://developer.okta.com/blog/2018/11/15/node-express-typescript)  
- [Learn MongoDB with Mongoose](https://www.freecodecamp.org/news/learn-mongodb-a4ce205e7739/)  
- [React Beginner’s Tutorial](https://react.dev/learn)  
- [Securing Web Applications with JWTs](https://auth0.com/learn/json-web-tokens/)  
- [Deploying Node.js Apps on Render](https://render.com/docs/deploy-node-express-app)  
- [Deploying React Apps on Vercel](https://vercel.com/docs/deployments/overview)  
- [Encryption in Node.js (crypto module)](https://nodejs.org/api/crypto.html)
