# Job Cliff — Full Stack Setup Guide

React + Vite frontend, Node.js + Express backend, Netcore Smartech email integration.

---

## Project Structure

```
job-cliff/
├── .env                          ← All environment variables (single source of truth)
│
├── server/                       ← Node.js + Express backend
│   ├── index.js                  ← Server entry point (runs on port 4000)
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js               ← Bearer token extractor
│   ├── routes/
│   │   ├── jobs.js               ← ★ POST /api/jobs/create → triggers Netcore Job Alert
│   │   ├── users.js              ← ★ POST /api/users/register → triggers Netcore Candidate Alert
│   │   ├── employers.js          ← Employer auth + profile + job management
│   │   └── common.js             ← Banners, courses, trainers
│   └── services/
│       ├── netcore.js            ← Netcore Smartech Campaign API wrapper
│       └── matchingService.js    ← Matches employees ↔ jobs (title + skills)
│
└── client/                       ← React + Vite frontend (runs on port 5173)
    ├── index.html
    ├── vite.config.js            ← Proxies /api → http://localhost:4000
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx               ← Router + AuthProvider
        ├── index.css             ← Design system (dark theme, CSS variables)
        ├── context/
        │   └── AuthContext.jsx   ← Global auth state (employee + employer)
        ├── services/
        │   └── api.js            ← All API calls (axios)
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── JobCard.jsx
        │   └── CompanyCard.jsx
        └── pages/
            ├── Home.jsx          ← Hero, banners, recommended jobs, companies, courses
            ├── JobListing.jsx    ← Paginated jobs with filters + search
            ├── JobDetails.jsx    ← Full job info, Apply + Save
            ├── Login.jsx         ← Employee / Employer login tabs
            └── Register.jsx      ← Employee / Employer registration (triggers Netcore)
```

---

## Prerequisites

- Node.js v18+ and npm
- Access to the Job Cliff backend API (`http://13.234.186.132:5000/api/v2`)
- Netcore Smartech account with:
  - API Key
  - Two email templates created (Job Alert + Candidate Alert)
  - An audience list ID

---

## Step 1 — Fill in Environment Variables

Open `.env` at the project root and replace all placeholder values:

```env
NETCORE_API_KEY=your_actual_netcore_api_key
NETCORE_SENDER_NAME=Job Cliff
NETCORE_SENDER_EMAIL=noreply@yoursite.com
NETCORE_JOB_ALERT_TEMPLATE_ID=your_job_alert_template_id
NETCORE_CANDIDATE_ALERT_TEMPLATE_ID=your_candidate_alert_template_id
NETCORE_LIST_ID=your_netcore_list_id
```

> **Netcore Templates to create in your panel:**
> 1. **Job Alert Template** — email sent to employees when a new matching job is posted
>    Suggested variables to use in template: `{{job_title}}`, `{{company_name}}`, `{{location}}`
> 2. **Candidate Alert Template** — email sent to employers when a matching candidate registers
>    Suggested variables: `{{candidate_name}}`, `{{desired_role}}`, `{{skills}}`

---

## Step 2 — Install Dependencies

### Server
```bash
cd server
npm install
```

### Client
```bash
cd client
npm install
```

---

## Step 3 — Run the Project

Open **two terminals**:

**Terminal 1 — Backend server:**
```bash
cd server
npm run dev
# Server starts at http://localhost:4000
# Health check: http://localhost:4000/health
```

**Terminal 2 — Frontend client:**
```bash
cd client
npm run dev
# App starts at http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## How the Netcore Email Flow Works

### Flow 1 — Employer Posts a Job → Employees Notified

```
Employer fills job form → POST /api/jobs/create
  └── server/routes/jobs.js
        ├── Forwards to Job Cliff API: POST /employers/jobs/add-new-job
        ├── On success: calls matchingService.findMatchingEmployeesForJob()
        │     └── Fetches job listings, filters by title + skills overlap
        └── If matches found: calls netcore.sendJobAlertToEmployees(job)
              └── POST https://api.netcoresmartech.com/v4/campaign/create
                    channel: "email", template: JOB_ALERT_TEMPLATE_ID
```

### Flow 2 — Employee Registers → Employers Notified

```
Employee fills register form → POST /api/users/register
  └── server/routes/users.js
        ├── Forwards to Job Cliff API: POST /users
        ├── On success: calls matchingService.findMatchingJobsForCandidate()
        │     └── Fetches job listings, filters by title + skills
        └── If matches found: calls netcore.sendCandidateAlertToEmployers(candidate)
              └── POST https://api.netcoresmartech.com/v4/campaign/create
                    channel: "email", template: CANDIDATE_ALERT_TEMPLATE_ID
```

> Both email triggers are **non-blocking** — they fire asynchronously after the main API response, so neither employer nor employee waits for the email to go through.

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero search, What's New banners, Recommended Jobs, Top Companies, Courses |
| `/jobs` | Job Listing | Paginated jobs with type/experience filters and keyword + location search |
| `/jobs/:jobId` | Job Details | Full job info, Apply Now, Save Job, Job Summary sidebar |
| `/login` | Login | Employee / Employer tab login |
| `/register` | Register | Employee (with skills) / Employer registration |

---

## API Endpoints (our Express server)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/jobs/listing` | Paginated job list |
| GET | `/api/jobs/:jobId` | Single job details |
| **POST** | **`/api/jobs/create`** | **Create job + trigger Netcore Job Alert** |
| POST | `/api/jobs/:jobId/apply` | Apply to job |
| POST/DELETE | `/api/jobs/:jobId/save` | Save / unsave job |
| POST | `/api/users/login` | Employee login |
| **POST** | **`/api/users/register`** | **Register employee + trigger Netcore Candidate Alert** |
| POST | `/api/users/profile` | Update profile + trigger Netcore Candidate Alert |
| GET | `/api/users/profile` | Get employee profile |
| POST | `/api/employers/auth/login` | Employer login |
| POST | `/api/employers/auth/register` | Employer registration |
| GET | `/api/employers` | List companies |
| GET | `/api/common/banners` | Home banners |
| GET | `/api/common/courses` | Placement courses |

---

## Testing Netcore Integration

To test without sending live emails, change `campaign_state` in `server/services/netcore.js`:

```js
// Line ~46 in netcore.js
campaign_state: "draft",   // ← Change "active" to "draft" for testing
```

Draft campaigns are created in your Netcore panel but NOT sent immediately. You can review them there before activating.

---

## Production Build

```bash
# Build React app
cd client && npm run build

# Serve the dist/ folder with any static server, or
# configure Express to serve it:
# app.use(express.static(path.join(__dirname, '../client/dist')));
```
