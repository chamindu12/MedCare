# :pill:Pharmacy Management System

This is a **web-based Pharmacy Management System** built using the **MERN stack** (MongoDB, Express, React, Node.js). It enables online drug ordering and real-time order tracking. The system also includes inventory control, supplier coordination, and automated restocking alerts, providing a secure, scalable, and modular solution to enhance efficiency and customer satisfaction.

## :open_book:Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Technologies Used](#technologies-used)

## :bookmark:Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes bundled with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (for local development, or use MongoDB Atlas for cloud-based hosting)

## :bookmark:Installation

Clone the repository:
```bash
git clone https://github.com/chamindu12/MedCare.git
cd Medcare
```
---
## :bookmark:Frontend Setup

1. Navigate to the frontend directory:
 ```bash
 cd frontend
```
2. Install the required dependencies:
```bash
npm install
```

3.To run the frontend in development mode:
```bash
npm run dev
```
:green_circle:Frontend will start usually on http://localhost:3000.

## :bookmark:Backend Setup

1.Navigate to the backend directory:
```bash
cd ../backend
```

2.Install the required dependencies:
```bash
npm install
```

3.Create a .env file in the backend directory and configure the following environment variables:
```bash
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
```
4.To run the backend in development mode (using nodemon for auto-reload):
```bash
npm run dev
```
:green_circle:The backend server will start on http://localhost:5000

## :bookmark:Technologies Used

### :white_check_mark:Frontend:
- React                                                </br>
- Vite (for fast bundling and hot module replacement)  </br>
- Material-UI                                          </br>
- Tailwind CSS                                         </br>
- Axios (for API requests)                             </br>
- Chart.js (for data visualization)                    </br>
- React Router (for routing)                           </br>
- Framer Motion (for animations)                       </br>

### :white_check_mark:Backend:
- Node.js                                    </br>
- Express                                    </br>
- MongoDB (using Mongoose for data modeling) </br>
- JWT (for authentication)                   </br>
- bcryptjs (for password hashing)            </br>
- dotenv (for environment variables)         </br>
- cors (to enable cross-origin requests)     </br>

### :white_check_mark:Development Tools:
- Nodemon (for auto-reloading the backend server)  </br>
- ESLint (for linting)                             </br>
