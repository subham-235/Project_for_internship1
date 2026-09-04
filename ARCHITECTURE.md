# Architecture

## Overview

Schedula is a Next.js App Router application with role-aware patient and doctor experiences. Pages compose reusable components, shared domain functions manage browser-local state, and TypeScript models define the contracts between booking, notification, queue, intake, prescription, and profile features.

The application is mock-first. It exposes one sample API route, but most interactive data is persisted in browser `localStorage` so the complete product journey can be demonstrated without a backend.

## Application structure

```text
src/
|-- app/
|   |-- actions/               Server actions, including AI chat orchestration
|   |-- api/                   Next.js route handlers
|   |-- booking/               Patient booking flow
|   |-- booking-confirmation/  Booking result and confirmation PDF
|   |-- doctor-dashboard/      Doctor overview, appointments, calendar, prescriptions, profile
|   |-- doctors/               Doctor search and profile routes
|   |-- login/                 Role-aware authentication entry
|   |-- my-appointments/       Patient appointments, intake, queue, and prescriptions
|   |-- profile/               Patient health profile
|   |-- signup/                Patient and doctor registration
|   |-- globals.css            Design tokens and global styles
|   `-- layout.tsx             Root providers and application shell
|-- components/
|   |-- appointments/          Appointment details, statuses, and patient queue
|   |-- auth/                  Authentication visuals
|   |-- booking/               Booking summary and payment panel
|   |-- chat/                  Patient and doctor-aware chatbot interface
|   |-- doctor/                Doctor queue, analytics, patient context, and schedule dialog
|   |-- doctors/               Doctor result cards
|   |-- home/                  Landing page sections
|   |-- layout/                Navigation, footer, and mobile actions
|   |-- motion/                Page transitions, reveals, and progress feedback
|   |-- notifications/         Notification popover and read-state controls
|   |-- prescriptions/         Prescription editing, viewing, and PDF action
|   |-- providers/             Shared client providers
|   `-- ui/                    Reusable UI primitives
|-- lib/
|   |-- mock-data/             Doctors, users, and starter appointments
|   |-- appointment-utils.ts   Appointment date and status helpers
|   |-- chat-system-instruction.ts
|   |-- client-storage.ts      Main browser persistence and domain operations
|   |-- file-storage.ts        Browser file and attachment persistence
|   |-- prescription-pdf.ts    Prescription PDF layout and generation
|   |-- specialty-intake.ts    Specialty-specific intake definitions
|   |-- theme.ts               Status presentation tokens
|   `-- utils.ts               Shared utility functions
`-- types/                     Domain types shared across routes and components
```

The project does not currently use a separate `hooks/` directory. Page-level hooks remain close to their owning route, while reusable state operations live in `lib/`. Mock data is stored in `lib/mock-data/` rather than a top-level `data/` directory.

## Data flow

```text
UI
 |
 v
Pages and Components
 |
 v
React Hooks and Local State
 |
 v
Domain Functions and Mock Data
 |
 v
localStorage, File Storage, Server Action, or API Route
```

### Read flow

1. A route identifies the signed-in role from `client-storage.ts`.
2. Domain functions load doctors, bookings, slots, profiles, reviews, prescriptions, and notifications.
3. Page state derives filtered lists, metrics, appointment status, and selected records.
4. Components render the resulting view and expose role-appropriate actions.

### Write flow

1. A user submits a form or triggers an appointment action.
2. The page validates the input and creates a typed domain object.
3. A storage function writes the record and emits a same-tab change event.
4. Listening components reload the affected state.
5. Notifications communicate important booking, payment, rescheduling, queue, and prescription events.

## Route architecture

### Public and patient routes

- `/` composes the marketing and discovery landing page.
- `/doctors` filters and sorts the merged doctor catalogue.
- `/doctors/[id]` displays one clinician and available booking entry points.
- `/booking/[doctorId]` coordinates slot selection, details, profile sharing, attachments, and payment.
- `/my-appointments` manages the patient appointment lifecycle.
- `/my-appointments/[bookingId]/intake` renders questions selected from the booked specialty.
- `/my-appointments/[bookingId]/prescription` displays the published prescription and care plan.
- `/profile` manages the reusable patient health profile.

### Doctor routes

- `/doctor-dashboard` summarizes the clinician's day, queue, reviews, and analytics.
- `/doctor-dashboard/appointments` manages booking decisions, patient context, consultation completion, and rescheduling.
- `/doctor-dashboard/calendar` provides monthly and daily schedule management with custom slots.
- `/doctor-dashboard/prescriptions` creates prescriptions and structured care plans.
- `/doctor-dashboard/profile` manages the public clinician profile.

## State and persistence

`src/lib/client-storage.ts` is the current domain data layer. It owns keys and operations for:

- Current user and registered accounts
- Registered doctor profiles
- Bookings and booking statuses
- Doctor availability slots
- Patient profiles
- Specialty intake answers
- Live queue state
- Notifications and read state
- Prescriptions and structured care plans
- Doctor reviews

`src/lib/file-storage.ts` handles uploaded file content separately so booking records stay smaller and remain compatible with earlier stored data.

Browser events such as `schedula-bookings-change` and `schedula-notifications-change` allow components in the same tab to refresh immediately. The native `storage` event supports updates originating from another tab.

## Booking lifecycle

```text
Doctor discovery
  -> Doctor profile
  -> Slot selection
  -> Patient details and health profile
  -> UPI or card payment
  -> Booking request
  -> Specialty intake
  -> Doctor confirmation
  -> Patient check-in
  -> Live queue
  -> Consultation
  -> Prescription and structured care plan
  -> Completion and review
```

The slot and booking write occurs together through the storage layer to prevent the selected mock slot from remaining available after a successful booking.

## Notification architecture

Notifications are typed domain records associated with a user ID or email. The shared notification popover loads the signed-in user's records, calculates unread state, supports individual and bulk read actions, and routes users to the relevant appointment area.

Patient notifications cover payment, booking confirmation, reminders, rescheduling, consultation progress, completion, and prescriptions. Doctor notifications cover new patient appointment requests and related booking activity.

## Chat architecture

The chatbot interface sends the message history and current role to a server action. The server instruction limits the assistant to healthcare navigation and doctor workflow guidance, formats structured doctor recommendations, and returns contextual suggested questions after each response.

When `GROQ_API_KEY` is absent, the chat layer returns a configuration-safe fallback. Chat history is scoped to the active account and cleared on logout.

## PDF architecture

Appointment confirmation and prescription documents are generated client-side. The prescription generator creates a conventional medical layout containing clinician details, patient details, Rx content, medicine directions, advice, follow-up information, a schedule stamp, and a digital signature area.

## Styling and motion

Global clinical tokens are defined in `globals.css`. Shared components combine those tokens with Tailwind utilities. Framer Motion handles component transitions and reveal sequences, while GSAP powers application-level entrance and scroll behavior. Reduced-motion preferences disable nonessential animation.

## Production evolution

A production architecture should replace browser storage with authenticated API services and a database. Recommended boundaries include:

- Identity and role-based access service
- Doctor catalogue and availability service
- Transactional booking service
- PCI-compliant payment gateway integration
- Notification delivery service for email, SMS, and push
- Encrypted clinical-record and document storage
- Audit logging and consent history
- Realtime queue transport using WebSockets or server-sent events
- Observability, rate limiting, backups, and disaster recovery

Healthcare deployment also requires jurisdiction-appropriate privacy, consent, retention, and security controls.
