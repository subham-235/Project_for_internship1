# Schedula — Day 1 Internship Implementation

A complete mock-first doctor booking workflow built with Next.js App Router, TypeScript and Tailwind CSS.

## Day 4 features

- Project setup and local run
- Responsive patient landing page
- Mock patient/doctor login flow with validation
- Doctor listing
- Search by doctor name or specialty
- Filter by specialty and location
- Doctor profile page
- Available appointment slots
- Date and time selection
- Patient details validation
- Booking confirmation
- Browser-local booking persistence
- Existing appointment API route preserved
- Doctor dashboard that merges starter appointments with locally created bookings

## Important architecture note

This is intentionally a Day 1 mock implementation. There is no production database, authentication provider, payment integration or email provider yet.

The starter `/api/appointments` route is kept because it already exists in the provided project. Patient-created bookings are stored in `localStorage`, so the doctor dashboard can demonstrate the full workflow without adding backend infrastructure.

## Project structure

```text
src/
├── app/
│   ├── api/appointments/route.ts
│   ├── booking/[doctorId]/page.tsx
│   ├── booking-confirmation/page.tsx
│   ├── doctor-dashboard/page.tsx
│   ├── doctors/[id]/page.tsx
│   ├── doctors/page.tsx
│   ├── login/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── booking/BookingSummary.tsx
│   ├── doctors/DoctorCard.tsx
│   ├── home/
│   │   ├── FeaturedDoctors.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   └── SpecialtySection.tsx
│   └── layout/
│       ├── Footer.tsx
│       └── Navbar.tsx
├── lib/
│   ├── client-storage.ts
│   └── mock-data/
│       ├── appointments.ts
│       ├── doctors.json
│       ├── doctors.ts
│       ├── users.json
│       └── users.ts
└── types/
    ├── appointment.ts
    ├── booking.ts
    ├── doctor.ts
    └── user.ts
```

## Setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3001
```

## Demo accounts

### Patient

```text
Email: patient@schedula.com
Password: password123
```

### Doctor

```text
Email: doctor@schedula.com
Password: password123
```

## Main routes

| Route | Purpose |
|---|---|
| `/` | Patient landing page |
| `/login` | Mock user login |
| `/doctors` | Doctor listing and filters |
| `/doctors/doc-001` | Doctor profile |
| `/booking/doc-001` | Booking flow |
| `/booking-confirmation` | Booking confirmation |
| `/doctor-dashboard` | Existing clinic/doctor dashboard |
| `/api/appointments` | Starter mock appointment API |


If you are applying these files to an already initialized starter repository, do **not** recreate Git history. Copy/replace the relevant source files, then commit your work incrementally according to the internship README.
