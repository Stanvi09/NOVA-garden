🌿 NOVA — Your Codebase, as a Living Garden

A modern bug-tracking platform that turns your codebase into a living ecosystem.

NOVA reimagines the core bug-tracking workflows of tools like Bugzilla into a visual and intelligent experience.

Modules are plants. Bugs are weeds. Dependencies are roots. Project health is calculated from real issue data.

Instead of simply showing how many bugs exist, NOVA helps developers understand where problems are, what they affect, why they may be happening, and what to do next.

✨ Key Features

Feature

What it does

🌱 Living Garden

Visualizes module health using real issue data

🐛 Bug Tracking

Create, assign, prioritize, filter, update, and resolve issues

🧬 Bug DNA

Finds structurally similar bugs using keywords and module overlap

🌐 Impact Radius

Traces a bug's potential impact through dependencies

🌳 Root Cause Explorer

Follows dependency chains to identify likely origins

🔮 What-If Simulation

Projects how unresolved bugs may affect the codebase

🧠 Codebase Memory

Surfaces similar historical bugs and previous fixes

👨‍💻 Developer Recommendation

Suggests suitable developers using workload and history

🩺 Bug Autopsy

Generates a structured post-mortem after resolution

📊 Analytics & Risk

Provides live project and module health insights

🌿 Living Garden

NOVA calculates module health directly from open issue severity.

Severity

Health Impact

CRITICAL

-25

HIGH

-12

MEDIUM

-5

LOW

-2

Health starts at 100 and changes according to real issues.

Healthy 🌱 → Stressed 🌿 → Wilting 🥀

The garden does not use hardcoded health values. Resolve an issue and the corresponding module can recover.

🧠 Explainable Intelligence

NOVA uses deterministic signals instead of black-box scoring.

• Issue history
• Severity
• Keyword overlap
• Module overlap
• Dependency relationships
• Developer workload
• Resolution history

Risk assessments and What-If results are presented as projections, not guarantees.

🛠️ Tech Stack

Frontend: React · TypeScript · Vite · GSAP · SVG

Backend: Node.js · Express · TypeScript · Prisma

Database: SQLite / PostgreSQL

Security: JWT · bcrypt · Zod

Testing: Vitest

🚀 Quick Start

1. Install dependencies

npm run install:all

2. Configure environment variables

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

3. Set up the database

npm run db:setup

SQLite works out of the box, so no external database service is required.

4. Start the application

Backend:

npm run dev:backend

Frontend:

npm run dev:frontend

Frontend: http://localhost:5173
Backend: http://localhost:4000

🔑 Demo Login

Email:    aarav@nova.dev
Password: password123

🧪 Testing

Run the backend test suite:

npm test --prefix backend

The project currently includes 24 backend unit tests covering authentication, RBAC, health scoring, and analysis utilities.

📌 Current Scope

NOVA is a hackathon-focused working vertical slice with:

• Core bug tracking
• Authentication and authorization
• Database-backed issue management
• Dependency analysis
• Risk assessment
• Bug intelligence
• Developer recommendations
• Analytics
• Living garden visualization

Not currently included

• File attachments
• Saved searches
• Email notifications
• Custom issue fields
• Frontend automated tests
• End-to-end integration tests

🔗 Reference

NOVA is inspired by the core problem addressed by Bugzilla, but independently redesigned with a modern architecture, workflow, visual language, and intelligence layer.

Bugzilla Reference Repository:
https://github.com/bugzilla/bugzilla

🌱 NOVA

Don't just track bugs. See how your codebase is growing.
