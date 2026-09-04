# Schedula

Schedula is a responsive doctor-discovery, appointment-booking, payment, consultation, and care-plan platform built for patients and clinicians. It demonstrates the complete journey from finding a specialist to receiving a structured prescription after a consultation.

The current application uses browser storage and mock data, making it suitable for demos, frontend portfolios, product validation, and continued backend integration.

## What the project does

Patients can discover doctors, inspect profiles and availability, pay for an appointment, complete a specialty-specific intake, follow a live consultation queue, receive notifications, and view prescriptions. Doctors receive booking information, manage appointments and schedules, monitor the live queue, complete consultations, and publish structured care plans.

## Features

### Patient experience

- Responsive healthcare landing page with motion and interactive sections
- Doctor search by name, specialty, condition, location, availability, experience, and fee
- Detailed doctor profiles with credentials, clinical focus, availability, and reviews
- Appointment booking with slot reservation and patient details
- UPI and card payment interface with validation and a five-minute session timer
- Payment success and failure notifications
- Specialty-specific pre-consultation intake forms
- Patient health profile and optional profile sharing
- Appointment history, confirmation, rescheduling approval, and cancellation
- Live queue position and estimated waiting time
- Prescription and structured care-plan viewing
- Downloadable appointment and prescription PDFs
- Patient chatbot with contextual suggestions and doctor-booking links

### Doctor experience

- Dedicated doctor authentication and dashboard
- New-booking notifications with unread state and direct appointment routing
- Appointment roster with pending, confirmed, completed, cancelled, and missed states
- Patient details, health profile, uploaded documents, and intake summaries
- Calendar with daily appointment inspection and custom slot creation
- Live patient queue and consultation controls
- Prescription authoring with medicines, Rx formatting, schedule stamp, and digital signature
- Structured care-plan publishing with follow-up guidance
- Dashboard analytics, reviews, quick actions, and command palette
- Editable professional profile

### Platform behavior

- Role-aware patient and doctor interfaces
- Session-specific chatbot history cleared during logout
- Local persistence for users, bookings, slots, notifications, profiles, reviews, and prescriptions
- Responsive navigation and accessible interactive controls
- Reduced-motion support
- Permanent light theme

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| Components | Radix UI primitives, Lucide React |
| Forms and validation | React Hook Form, Zod |
| Motion | Framer Motion, GSAP |
| Data visualization | Recharts |
| 3D interface | React Three Fiber, Drei, Three.js |
| PDF generation | jsPDF |
| QR generation | qrcode |
| Calendar | react-calendar |
| Notifications | Sonner |
| AI chatbot | Groq SDK |
| Persistence | Browser localStorage and mock JSON data |

## Screenshots and demo

![Schedula clinical booking visual](public/schedula-doctor-hero.png)

The main demo journeys are available at these routes after starting the project:

| Journey | Route |
|---|---|
| Landing page | `/` |
| Doctor discovery | `/doctors` |
| Doctor profile | `/doctors/doc-001` |
| Appointment booking | `/booking/doc-001` |
| Patient appointments | `/my-appointments` |
| Patient health profile | `/profile` |
| Doctor overview | `/doctor-dashboard` |
| Doctor appointments | `/doctor-dashboard/appointments` |
| Doctor calendar | `/doctor-dashboard/calendar` |
| Doctor prescriptions | `/doctor-dashboard/prescriptions` |
| Doctor profile | `/doctor-dashboard/profile` |

Demo patient:

```text
Email: patient@schedula.com
Password: password123
```

Demo doctor:

```text
Email: anika@schedula.com
Password: password123
```

Additional doctor accounts are defined in `src/lib/mock-data/users.json`.

## Installation

```bash
git clone https://github.com/subham-235/Project_for_internship1.git
cd Project_for_internship1
npm install
cp .env.example .env.local
```

Windows PowerShell equivalent:

```powershell
Copy-Item .env.example .env.local
```

Detailed requirements and troubleshooting are available in [SETUP.md](SETUP.md).

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

To validate and run the production build:

```bash
npm run build
npm run start
```

## Environment variables

| Variable | Required | Description |
|---|---:|---|
| `GROQ_API_KEY` | For live chatbot responses | Groq API key used by the server-side chat action |
| `GROQ_MODEL` | No | Groq model identifier; defaults to `openai/gpt-oss-120b` |

The rest of the application runs without external credentials because its current data layer is browser-local.

## Folder structure

```text
Schedula-Day1/
|-- public/                    Static images and doctor portraits
|-- output/pdf/                Generated PDF samples
|-- src/
|   |-- app/                   App Router pages, server actions, and API routes
|   |-- components/            Reusable feature and UI components
|   |-- lib/                   Storage, mock data, utilities, AI, and PDF logic
|   `-- types/                 Shared TypeScript domain models
|-- .env.example               Environment variable template
|-- ARCHITECTURE.md            Application structure and data flow
|-- SETUP.md                   Detailed development setup
|-- next.config.ts             Next.js configuration
`-- package.json               Scripts and dependencies
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for route boundaries, state ownership, persistence, and feature data flow.

## Deployment and live link

- Repository: [github.com/subham-235/Project_for_internship1](https://github.com/subham-235/Project_for_internship1)
- Live deployment: Not configured in this repository yet

The project is compatible with Vercel or any Node.js host that supports Next.js. Configure `GROQ_API_KEY` and optionally `GROQ_MODEL` in the hosting provider before deploying.

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create and validate a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint across the project |

## Current data model limitation

Schedula currently stores application data in `localStorage`. Data therefore belongs to a browser profile and is not synchronized between different devices or browsers. Production use requires a secure backend, database, authenticated sessions, payment gateway, protected medical-record storage, and appropriate healthcare privacy controls.
