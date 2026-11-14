# Unauthorized Construction Monitoring System (UCMS)

A web-based system designed to monitor construction sites, conduct drone surveys, identify potentially unauthorized construction activities, and manage reports and investigations.

---

## 1. Project Overview

The **Unauthorized Construction Monitoring System (UCMS)** aims to simplify the monitoring of construction activities through centralized construction site management, drone survey records, report generation, and investigation tracking.

The system provides a structured platform for maintaining construction site information and documenting suspicious construction activities for further investigation.

### Objectives

- Maintain a centralized database of construction sites.
- Record and manage drone surveys.
- Identify and document potentially unauthorized construction activities.
- Generate and manage reports.
- Track investigations associated with submitted reports.
- Provide organized access to construction monitoring information.

---

## 2. Key Features

### Construction Site Management
- Register new construction sites.
- View all registered construction sites.
- Retrieve individual site details.
- Update construction site information.
- Delete construction site records.

### Drone Survey Management
- Create drone survey records.
- Associate surveys with construction sites.
- Record survey dates and statuses.
- Maintain survey remarks and observations.
- Retrieve survey information.

### Report Management
- Create reports related to suspected unauthorized construction.
- Associate reports with construction sites and drone surveys.
- Track report status.
- Retrieve and manage reports.

### Investigation Management
- Create investigations linked to reports.
- Record investigation dates and notes.
- Track investigation progress.

---

## 3. Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| PostgreSQL | Relational database |
| Prisma ORM | Database management |
| REST API | Client-server communication |
| JavaScript | Backend programming language |
| Git & GitHub | Version control and collaboration |

---

## 4. System Architecture

The backend follows the **MVC (Model-View-Controller) architecture**, with a separate service layer for business logic.

### Request Flow

```text
Client
  |
  v
Express Router
  |
  v
Controller
  |
  v
Service Layer
  |
  v
Prisma ORM
  |
  v
PostgreSQL Database
```

### Architecture Components

- **Routes:** Define API endpoints and HTTP methods.
- **Controllers:** Handle incoming requests and outgoing responses.
- **Services:** Implement business logic and database operations.
- **Prisma:** Communicates with the PostgreSQL database.
- **PostgreSQL:** Stores application data.

---

## 5. Database Design

The system uses PostgreSQL with Prisma ORM.

### Main Database Models

#### 1. ConstructionSite
Stores information about registered construction sites.

- `site_id` – Primary key
- `site_name` – Construction site name
- `address` – Site location
- `latitude` – Geographic latitude
- `longitude` – Geographic longitude
- `created_at` – Record creation timestamp

#### 2. DroneSurvey
Stores information about drone surveys conducted at construction sites.

- `survey_id` – Primary key
- `site_id` – Foreign key referencing ConstructionSite
- `survey_date` – Survey date
- `survey_status` – Current survey status
- `remarks` – Survey observations

#### 3. Report
Stores reports concerning potentially unauthorized construction.

- `report_id` – Primary key
- `site_id` – Related construction site
- `survey_id` – Associated drone survey (optional)
- `description` – Report description
- `report_date` – Report creation date
- `status` – Report status

#### 4. Investigation
Stores investigation details associated with reports.

- `investigation_id` – Primary key
- `report_id` – Related report
- `investigation_date` – Investigation date
- `notes` – Investigation notes

### Entity Relationships

```text
ConstructionSite
      |
      | 1 : N
      |
      +---------- DroneSurvey
      |
      | 1 : N
      |
      +---------- Report
                       |
                       | 1 : 0..1
                       |
                  Investigation
```

---

## 6. REST API Endpoints

Base URL:

```text
http://localhost:5000/api
```

### Construction Site APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/sites` | Create a construction site |
| GET | `/sites` | Retrieve all construction sites |
| GET | `/sites/:id` | Retrieve a site by ID |
| PUT | `/sites/:id` | Update a construction site |
| DELETE | `/sites/:id` | Delete a construction site |

### Drone Survey APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/surveys` | Create a drone survey |
| GET | `/surveys` | Retrieve all surveys |
| GET | `/surveys/:id` | Retrieve a survey by ID |
| PUT | `/surveys/:id` | Update a survey |
| DELETE | `/surveys/:id` | Delete a survey |

### Report APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/reports` | Create a report |
| GET | `/reports` | Retrieve all reports |
| GET | `/reports/:id` | Retrieve a report by ID |

### Investigation APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/investigations` | Create an investigation |
| GET | `/investigations` | Retrieve all investigations |
| GET | `/investigations/:id` | Retrieve an investigation by ID |

*Note: These endpoints represent the planned API structure. Update this section if your actual implementation differs.*

---

## 7. Project Structure

```text
UCMS/
│
├── controllers/
│   ├── siteController.js
│   ├── surveyController.js
│   ├── reportController.js
│   └── investigationController.js
│
├── services/
│   ├── siteService.js
│   ├── surveyService.js
│   ├── reportService.js
│   └── investigationService.js
│
├── routes/
│   ├── siteRoutes.js
│   ├── surveyRoutes.js
│   ├── reportRoutes.js
│   └── investigationRoutes.js
│
├── database/
│   └── db.js
│
├── prisma/
│   └── schema.prisma
│
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

---

## 8. Installation and Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- PostgreSQL
- Git

### Step 1: Clone the Repository

```bash
git clone <repository-url>
```

### Step 2: Navigate to the Project

```bash
cd UCMS
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/ucms"
PORT=5000
```

Replace the database credentials with your PostgreSQL configuration.

**Important:** Never commit your `.env` file to GitHub.

### Step 5: Generate Prisma Client

```bash
npx prisma generate
```

### Step 6: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### Step 7: Start the Development Server

```bash
npm run server
```

The backend should be accessible at:

```text
http://localhost:5000
```

---

## 9. Testing

REST APIs can be tested using tools such as:

- Postman
- Thunder Client
- Insomnia

Test the following operations:

- Creating construction sites.
- Retrieving construction site details.
- Updating and deleting site records.
- Creating and retrieving drone surveys.
- Generating reports.
- Creating and retrieving investigations.
- Validating database relationships.

---

## 10. Version Control and Collaboration

The project uses Git and GitHub for collaborative development.

### Pull Latest Changes

```bash
git pull origin main
```

### Stage Changes

```bash
git add .
```

### Commit Changes

```bash
git commit -m "Implement construction site and drone survey modules"
```

### Push Changes

```bash
git push origin main
```

---

## 12. Contributors

hrishikeshsehan64
e25b070630-stack

**Project:** Unauthorized Construction Monitoring System (UCMS)
