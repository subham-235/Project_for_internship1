# Development Setup

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- Git
- A modern browser with `localStorage` enabled
- A Groq API key for live chatbot responses

## Clone the project

```bash
git clone https://github.com/subham-235/Project_for_internship1.git
cd Project_for_internship1
```

If the repository is already available locally, open a terminal in the directory containing `package.json`.

## Install dependencies

```bash
npm install
```

Use the committed `package-lock.json` to keep dependency resolution consistent.

## Configure environment variables

Create a local environment file from the supplied template.

macOS or Linux:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Set the following values in `.env.local`:

```dotenv
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

`GROQ_API_KEY` enables live chatbot responses. `GROQ_MODEL` is optional and falls back to `openai/gpt-oss-120b`.

Never commit `.env.local` or a real API key.

## Start development

```bash
npm run dev
```

Open `http://localhost:3000`.

If port 3000 is occupied, Next.js selects another port and prints the address in the terminal.

## Demo accounts

Patient:

```text
Email: patient@schedula.com
Password: password123
```

Doctor:

```text
Email: anika@schedula.com
Password: password123
```

Other demo clinicians are available in `src/lib/mock-data/users.json`.

## Validate the project

Run the linter:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Serve the production build:

```bash
npm run start
```

## Reset demo data

The project stores its interactive records in browser `localStorage`. To reset the demo:

1. Open the browser developer tools.
2. Select the Application or Storage panel.
3. Open Local Storage for the Schedula origin.
4. Clear the stored entries.
5. Refresh the page and sign in again.

This removes locally created bookings, accounts, slots, notifications, profiles, reviews, and prescriptions for that browser origin.

## Common issues

### The chatbot says it is not configured

Confirm that `.env.local` contains a valid `GROQ_API_KEY`, then restart the development server.

### A booking is not visible in another browser

The current implementation uses browser-local persistence. Use the same browser profile and origin for the patient and doctor demo journeys.

### Doctor notifications appear empty

Book the doctor associated with the signed-in clinician account. For example, bookings with Dr. Anika Rao appear for `anika@schedula.com`.

### A selected slot is unavailable

Choose another slot or clear the browser's local storage to reset the demo dataset.

### Images do not load

Run the project from its repository root and confirm that the assets under `public/` are present.

## Deployment

### Vercel

1. Import the GitHub repository into Vercel.
2. Keep the detected framework as Next.js.
3. Add `GROQ_API_KEY` and optionally `GROQ_MODEL` to the project environment variables.
4. Deploy the project.

### Other Node.js hosts

Use these commands in the build and runtime environment:

```bash
npm install
npm run build
npm run start
```

The host must support Node.js 20 or newer and Next.js server execution because the chatbot uses a server action.

## Production readiness

The existing payment flow is a validated demonstration and does not charge real money. Before production use, connect a payment gateway and replace browser persistence with authenticated backend services and encrypted storage.
