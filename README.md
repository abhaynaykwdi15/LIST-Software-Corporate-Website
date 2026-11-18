# LIST Software corporate website & careers portal

An independent, full-stack demonstration project inspired by publicly available information on [listspl.co.in](https://listspl.co.in/). It is not an official LIST Software website and is not affiliated with or endorsed by LIST Software Pvt. Ltd.

The company background and product descriptions are paraphrased from the official website. Metrics are shown as published by the company and have not been independently audited. Role listings are clearly marked as independent demonstration examples; their availability is unverified. The logo in `public/assets/list-software-logo.png` was supplied for this project; confirm authorization before public or company use. No company photographs are reproduced.

## Project layout

```text
src/
  assets/                    Imported source assets and asset-use guidance
  components/                Reusable UI (logo, form fields)
  layouts/                   Shared site shell (navigation and footer)
  pages/                     Route definitions and public/admin page views
  services/                  Axios API client and service integrations
  main.jsx                   React entry point and router provider
  styles.css                 Tailwind directives and site design system
public/assets/               User-provided LIST Software logo
backend/app/                 FastAPI endpoints, SQLAlchemy models and validation
backend/alembic/             Database migration and clearly marked sample roles
backend/uploads/resumes/     Private resume storage (created at runtime; ignored by Git)
```

## Requirements

- Node.js 20.19+ or 22.12+
- Python 3.10+
- MySQL 8+ / TiDB for a shared deployment; SQLite is the local development default

## Run locally

### 1. Configure the API

In PowerShell:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` before starting. Generate and set a unique `SECRET_KEY` and set an `ADMIN_EMAIL` plus an `ADMIN_PASSWORD` of at least 12 characters. The example secret is intentionally rejected by the API. The example uses SQLite for local development. For MySQL/TiDB, set a SQLAlchemy URL such as:

```text
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/list_software
```

Generate a signing secret in PowerShell with:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

URL-encode any reserved characters in MySQL usernames or passwords before placing them in `DATABASE_URL`.

Create the schema and start the API from the `backend` directory:

```powershell
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

The initial migration creates the requested tables and three **independent demo roles**, marked unverified. Admin bootstrap creates the configured admin account on API startup. API documentation is available at `http://localhost:8000/docs`; health check: `http://localhost:8000/api/health`.

### 2. Start the website

In another PowerShell window, from the project root:

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

For a single-command local launch after installing both sets of dependencies and configuring `backend/.env`, stop any existing frontend/backend dev servers and run this from the project root instead:

```powershell
npm.cmd run dev:full
```

This applies database migrations, then starts the API and frontend together. Press Ctrl+C to stop both. Alternatively, start the API and frontend in separate terminals as described above. Open `http://localhost:5173`. During development, the frontend sends API requests through Vite's `/api` proxy to `http://127.0.0.1:8000`, which also works when the site is opened through the computer's LAN address. For deployment, set `VITE_API_URL` to the deployed API base including `/api`. The admin sign-in is at `/admin/login`; use the credentials configured for the API.

The frontend is configured in `vite.config.js`, `tailwind.config.js` and `postcss.config.js`. Tailwind directives and the shared design system are in `src/styles.css`; page routes are registered in `src/pages/index.jsx`.

## Included features

- Responsive home, about, solutions, banking technology, career, job details, application and contact pages.
- Careers search and department, experience and employment-type filters.
- Careers status filters for illustrative profiles, historical advertisements and currently verified vacancies. Historical/current records require a dated official `listspl.co.in` source; historical roles cannot receive applications.
- The official careers page currently presents general resume submission and no specific opening. The included sample role profiles are illustrative, not historical ads or confirmed vacancies.
- Public job listing and details endpoints; admin-only role creation, editing, publication and deletion.
- Application submission with server-side validation, consent, file extension/signature checks and a 10 MB upload limit.
- Resume downloads protected by bearer-token admin authentication. Resume files are stored outside the static web root.
- Admin dashboard statistics, applicant search/status filtering, status updates and resume downloads.
- Contact enquiries stored for admin review; private contact-message listing endpoint.
- Alembic migration, SQLAlchemy relationships, password hashing and expiring signed admin tokens.

## Deployment

### Vercel frontend

1. Import the project into Vercel and set the project root to the repository root. Vercel detects Vite; the build command is `npm run build` and the output directory is `dist`.
2. Set `VITE_API_URL` in the Vercel project environment variables to the deployed API base URL, including `/api` (for example `https://api.example.com/api`). This value is embedded at build time; redeploy after changing it.
3. Keep `vercel.json`'s SPA rewrite so React Router routes work on direct navigation and refresh.

### FastAPI backend (Docker)

Build and run from the repository root:

```powershell
docker build -f backend/Dockerfile -t list-careers-api ./backend
docker run --rm -p 8000:8000 `
  -e DATABASE_URL="mysql+pymysql://user:password@host:3306/list_software" `
  -e SECRET_KEY="your-generated-secret" `
  -e ADMIN_EMAIL="admin@example.com" `
  -e ADMIN_PASSWORD="your-unique-password" `
  -e CORS_ORIGINS="https://your-site.vercel.app" `
  -e UPLOAD_DIR="/app/uploads/resumes" `
  -v list-careers-resumes:/app/uploads/resumes `
  list-careers-api
```

The image applies Alembic migrations before starting Uvicorn and listens on the platform-provided `PORT` (default 8000). Deploy the container to a Docker-capable service and provision managed MySQL/TiDB plus persistent private storage for resumes. The example volume is mounted at the image's app-owned upload directory. If you choose another mount path, ensure it is writable by the non-root `appuser`. SQLite is for local development only; ephemeral container filesystems are not suitable for production databases or resume retention.

Set all production settings through the hosting provider's secret/environment manager. Do not copy real credentials into source control.

## Deployment and security notes

- Set `DATABASE_URL`, `SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS`, `UPLOAD_DIR` and `MAX_UPLOAD_BYTES` through the deployment platform’s secret/environment settings.
- Use a unique random signing key, HTTPS, a managed private database, restricted admin access, backups and private persistent storage for resumes. Do not deploy the example environment values.
- Configure CORS to only allow the deployed frontend origin. The local default allows `http://localhost:5173`.
- The initial admin account is bootstrapped only if it does not exist. Rotate credentials and manage production admins through an authorized operational process.
- The frontend and backend are independently deployable. Vercel hosts the Vite frontend; deploy the FastAPI Docker image, managed database and private resume storage separately.
- Before company use, obtain authorization, replace demo branding with approved assets, confirm all corporate content, and configure the recruitment data-retention/privacy process.

## Verify

```powershell
npm.cmd run build
npm.cmd test
cd backend
python -m compileall app alembic
alembic upgrade head
```

The React route smoke tests cover the home, about, solutions, banking technology, careers, job details, application, contact, admin login/dashboard redirect and not-found routes. They run in jsdom; use a real browser at desktop and mobile breakpoints before launch for visual verification.

For the focused backend validation test, install the development dependency and run:

```powershell
pip install -r requirements-dev.txt
python -m unittest discover -s tests -v
```

