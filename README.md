# Reforestation API for Tunisia

A web-based application developed for the Tunisian Ministry of Environment to create, manage, and participate in reforestation events. The platform serves volunteers, university clubs, and companies, enabling them to contribute to reforestation efforts through event registrations, group volunteering, and sponsorships.

---

## Features

- **Event Management:** Create, update, and view reforestation events.
- **User Roles:** 
  - Volunteers (individuals or groups) can register for events.
  - Companies can sponsor events.
  - Ministry users can manage events.
- **Sponsorship:** Companies can contribute financially to events.
- **Frontend and Backend Integration:** Interactive UI powered by a REST API.

---

## Tools Used

- **Backend:**
  - Python
  - FastAPI
  - PostgreSQL
  - SQLAlchemy

- **Frontend:**
  - React
  - Axios

- **Development Tools:**
  - Visual Studio Code

---

## API Endpoints

### **Authentication**
- **POST** `/auth/register`: Register a new user.
- **POST** `/auth/login`: Authenticate and obtain a token.

### **Events**
- **GET** `/events`: List all events (all users)
- **POST** `/events`: Create a new event (ministry users only).
- **PUT** `/events/{event_id}`: Update an event (ministry users only).

### **Registrations**
- **POST** `/events/{event_id}/register`: Register for an event (individuals and university clubs).

### **Sponsorships**
- **POST** `/sponsorships`: Create a sponsorship (companies only).

---

## How to Run the Project

### **Backend**

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Run the commmand
   ```bash
   uvicorn app:app --reload   
   ```
3. Access the API documentation at:
   ```
   http://localhost:8000/docs
   ```

### **Frontend**

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open the application in your browser:
   ```
   http://localhost:3000
   ```
