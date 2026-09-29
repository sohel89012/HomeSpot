# 🏠 HomeSpot — Full-Stack Real Estate Platform

**HomeSpot** is a responsive full-stack real estate web application developed using **React, Vite, Python Flask, and MySQL**.

The platform allows users to discover properties, search and filter listings, view property details, and submit enquiries. It also provides a protected administrator interface for managing property listings and reviewing customer enquiries.

> **BCA Graduate | Full-Stack Web Development Portfolio Project**

---

## 🚀 Project Overview

HomeSpot was developed to demonstrate practical full-stack development skills across:

* Frontend development
* REST API development
* Authentication & authorization
* Relational database design
* CRUD operations
* Responsive UI development
* API integration
* Git & GitHub workflow

The application follows a separated **React frontend + Flask backend + MySQL database** architecture.

---

## ✨ Key Features

### 👤 User

* User registration and login
* JWT-based authentication
* Browse property listings
* Search by title or location
* Filter properties by type
* View detailed property information
* Submit property enquiries
* View personal enquiry history
* Responsive profile interface
* Logout functionality

### 🛡️ Admin

* Protected administrator access
* Property management dashboard
* Add properties
* Edit properties
* Delete properties
* View property inventory
* Search and filter listings
* View customer enquiries
* Responsive admin interface

---

## 🧰 Tech Stack

| Category        | Technologies                 |
| --------------- | ---------------------------- |
| Frontend        | React, Vite, JavaScript, CSS |
| Backend         | Python, Flask                |
| API             | REST API, JSON               |
| Authentication  | JWT                          |
| Database        | MySQL                        |
| API Testing     | Postman                      |
| Version Control | Git, GitHub                  |
| Development     | VS Code                      |

---

## 🏗️ Application Architecture

```text
┌─────────────────────────────┐
│        React + Vite         │
│          Frontend           │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│        Python + Flask       │
│          Backend            │
│                             │
│  Users │ Properties │       │
│        Enquiries            │
└──────────────┬──────────────┘
               │
               │ SQL
               ▼
┌─────────────────────────────┐
│           MySQL             │
│                             │
│ Users │ Properties │        │
│       Enquiries             │
└─────────────────────────────┘
```

---

## 🔐 Authentication & Authorization

HomeSpot implements JWT-based authentication with role-based access control.

### Authentication

* User registration
* Password hashing
* Login authentication
* JWT token generation
* Bearer-token authentication for protected APIs

### Roles

The application supports:

* `User`
* `Admin`

Admin-only operations are protected on the backend using authorization middleware.

---

## 🔌 REST API

### Users

| Method | Endpoint       | Description         | Access        |
| ------ | -------------- | ------------------- | ------------- |
| POST   | `/users`       | Register user       | Public        |
| POST   | `/login`       | Login               | Public        |
| GET    | `/profile`     | Get current profile | Authenticated |
| GET    | `/admin/users` | Get users           | Admin         |
| PUT    | `/users/<id>`  | Update user         | Admin         |
| DELETE | `/users/<id>`  | Delete user         | Admin         |

### Properties

| Method | Endpoint           | Description          | Access |
| ------ | ------------------ | -------------------- | ------ |
| GET    | `/properties`      | Get all properties   | Public |
| GET    | `/properties/<id>` | Get property details | Public |
| POST   | `/properties`      | Create property      | Admin  |
| PUT    | `/properties/<id>` | Update property      | Admin  |
| DELETE | `/properties/<id>` | Delete property      | Admin  |

### Enquiries

| Method | Endpoint           | Description          | Access        |
| ------ | ------------------ | -------------------- | ------------- |
| POST   | `/enquiries`       | Submit enquiry       | Authenticated |
| GET    | `/enquiries`       | Get user's enquiries | Authenticated |
| GET    | `/admin/enquiries` | Get all enquiries    | Admin         |
| DELETE | `/enquiries/<id>`  | Delete enquiry       | Admin         |

---

## 🗄️ Database Design

HomeSpot uses a relational MySQL database with three core entities.

### Users

```text
users
├── UserID       PRIMARY KEY
├── name
├── Email        UNIQUE
├── Password
└── Role
```

### Properties

```text
properties
├── PropertyID   PRIMARY KEY
├── Title
├── Location
├── Price
├── BHK
├── PropertyType
├── Description
├── Image
└── OwnerID      FOREIGN KEY → users.UserID
```

### Enquiries

```text
enquiries
├── EnquiryID    PRIMARY KEY
├── UserID       FOREIGN KEY → users.UserID
├── PropertyID   FOREIGN KEY → properties.PropertyID
├── Message
└── EnquiryDate
```

### Relationships

```text
User
 │
 ├──────────► Properties
 │
 └──────────► Enquiries ◄──────── Property
```

This structure demonstrates practical use of **primary keys, foreign keys, relationships, and CRUD-based database operations**.

---

## 📂 Project Structure

```text
HomeSpot/
│
├── backend/
│   ├── app.py
│   │
│   ├── middleware/
│   │   └── auth.py
│   │
│   ├── routes/
│   │   ├── users.py
│   │   ├── properties.py
│   │   └── enquiries.py
│   │
│   └── utils/
│       └── helpers.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddPropertyModal.jsx
│   │   │   ├── AdminPropertyListings.jsx
│   │   │   ├── ContactSection.jsx
│   │   │   ├── HeroSearch.jsx
│   │   │   ├── InquiriesView.jsx
│   │   │   ├── InteriorShowcase.jsx
│   │   │   ├── LoginModal.jsx
│   │   │   ├── Philosophy.jsx
│   │   │   ├── ProfileDrawer.jsx
│   │   │   ├── ProjectSpotlight.jsx
│   │   │   ├── PropertyGrid.jsx
│   │   │   └── navbar.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── postman/
├── .gitignore
└── README.md
```

---

## 🧪 Testing

The application was tested across the major user and administrator workflows.

### User Testing

```text
Register
   ↓
Login
   ↓
Browse Properties
   ↓
Search / Filter
   ↓
View Property
   ↓
Submit Enquiry
   ↓
View My Inquiries
   ↓
Logout
```

### Admin Testing

```text
Admin Login
   ↓
Property Management
   ↓
Add Property
   ↓
Edit Property
   ↓
View Property
   ↓
Delete Property
   ↓
Review Enquiries
   ↓
Logout
```

API endpoints were also tested during development using Postman.

---

## 📱 Responsive Design

The frontend is designed for desktop and mobile screens.

### Desktop

* Glassmorphic navigation
* Property management interface
* Responsive property cards
* Profile interface

### Mobile

* Hamburger navigation
* Mobile navigation drawer
* Responsive property cards
* Mobile-friendly admin management
* Responsive forms and modals

The application was also tested on real mobile devices through a local network development setup.

---

## 💡 Technical Highlights

### Frontend

* Component-based React architecture
* React state management for UI flows
* API integration using HTTP requests
* Dynamic property rendering
* Responsive CSS
* Reusable property and modal components

### Backend

* Flask REST API
* Blueprint-based route organization
* Authentication middleware
* Admin authorization middleware
* JSON API responses
* CRUD operations
* Database integration

### Database

* Relational MySQL design
* Primary and foreign keys
* User-property relationships
* User-enquiry relationships
* Property-enquiry relationships

---

## 🔒 Security Practices

The project includes development-level security practices such as:

* Password hashing
* JWT authentication
* Protected API endpoints
* Backend role-based authorization
* Parameterized database queries
* Sensitive local configuration excluded from Git

For production deployment, additional hardening such as HTTPS, secure cookie-based authentication, strict CORS configuration, rate limiting, and production environment management would be appropriate.

---

## 📸 Screenshots

Recommended screenshots for the project portfolio:

* Home page
* Property listings
* Property details
* Login/Register
* User profile
* My Inquiries
* Admin Property Management
* Add/Edit Property
* Mobile responsive interface

---

## 📈 Future Improvements

Possible future enhancements include:

* Cloud-based property image uploads
* Interactive property maps
* Advanced property filters
* Email notifications
* In-app enquiry replies
* Production deployment
* Additional property information and amenities

---

## 💼 Resume-Ready Project Description

### HomeSpot — Full-Stack Real Estate Web Application

Developed a responsive full-stack real estate platform using **React, Vite, Python Flask, and MySQL**, implementing JWT authentication, role-based authorization, REST APIs, property CRUD operations, search/filter functionality, and customer enquiry workflows.

**Key Contributions:**

* Built a responsive React frontend with reusable components and API integration.
* Developed modular Flask REST APIs using Blueprints for users, properties, and enquiries.
* Implemented JWT authentication and backend role-based access control for User/Admin roles.
* Designed and integrated a relational MySQL database using primary and foreign-key relationships.
* Developed an admin dashboard for property creation, editing, deletion, and inventory management.
* Implemented responsive layouts for desktop and mobile devices and tested major application workflows.

---

## 🎓 Education

**Bachelor of Computer Applications (BCA)**
**Status: Completed**

---

## 👨‍💻 About the Developer

**Sohel Khan**

BCA Graduate interested in **Full-Stack Web Development, Python, React, MySQL, and software development**.

This project represents practical experience in building and integrating a complete web application from frontend interface to backend API and relational database.

---

## 📌 Project Status

**Completed Portfolio Project**

HomeSpot currently contains the core authentication, property management, enquiry, database, REST API, and responsive frontend functionality described in this documentation.

---

## 📄 License

This project is developed as a portfolio and academic project.
