# CodeLift Platform – Full Stack Python, SQL & AI Academy

A high-performance, modern educational web application built with **React + Vite + Bootstrap 5**. Features a public **interactive landing page** inspired by the FreshMart e-commerce architecture, comprehensive curriculum covering **Full Stack Python, SQL, HTML, CSS, JavaScript, 3+ Industry Capstone Projects, and AI Integration**, coupled with a dedicated **10-Theme Admin Dashboard**.

---

## 1. Landing Page Architecture (`/`)

The root route `/` features a interactive curriculum storefront:

- **Header Bar**:
  - Logo with tech branding (`🚀 CodeLift`).
  - **Live Search**: Instant real-time filtering across 24+ modules by technology, name, or keywords.
  - **Theme Toggle**: 🌙 / ☀️ toggle switching between light and dark visual modes.
  - **Syllabus Bag / Cart**: Dynamic counter with bounce animations (`cart-bounce`) when tracks are added.
  - **Login Button**: Direct link navigating to `/login`.
- **Hero Carousel**:
  - 3 auto-sliding gradient banners showcasing Python Core & OOP, Modern Web (HTML/CSS/JS) & SQL, and Generative AI & 3+ Production Projects.
  - Automatic 3.6s rotation, hover-pause, and clickable navigation dots.
- **Curriculum Category Filters**:
  - `All Curriculum`
  - `🐍 Python & OOP`
  - `🗄️ SQL & Databases`
  - `🌐 Web (HTML/CSS/JS)`
  - `🤖 AI & LLM Systems`
  - `🚀 3+ Capstone Projects`
  - `💼 DevOps & Career Prep`
- **Curriculum & Project Cards Grid**:
  - Cards featuring corner badges (`🔥 Popular`, `💚 High Demand`, `🤖 AI Powered`, `⭐ Capstone Project`), tech stack tags, duration, and tuition.
  - **➕ Add to Syllabus**: Fires floating `✨ +1 Added` particle animation, cart bounce, and toast confirmation.
  - **🔍 Details**: Opens a modal showing unit-by-unit syllabus topics.
- **Pagination**:
  - 12 items per page with Prev, numbered buttons, and Next.
- **Syllabus Drawer & Application Modal**:
  - Slide-out cart drawer showing selected modules and total tuition.
  - Application modal to enter contact details, pick a cohort batch (Morning / Evening / Weekend), save the application to `localStorage`, and send pre-filled application details via WhatsApp.
- **Footer**:
  - CodeLift Academy details, open-source community links, and an **"🔐 Admin Login"** button linking to `/login`.

---

## 2. Curriculum Coverage

### 🐍 Python Core & OOP
1. Python 3.12 Fundamentals, Data Structures & SOLID OOP
2. Asyncio, Concurrency & Multiprocessing Engine
3. FastAPI REST Microservices & Pydantic V2

### 🗄️ SQL & Databases
4. Relational Modeling, 1NF-3NF Normalization & PostgreSQL
5. Advanced SQL: Window Functions, CTEs & Index Optimization
6. SQLAlchemy 2.0 ORM & Alembic Automated Database Migrations
7. Redis In-Memory Caching & Pub/Sub Messaging

### 🌐 Frontend Web Stack
8. HTML5 Semantic Web, ARIA Accessibility & SEO
9. CSS3 Modern Layouts: Flexbox, 2D CSS Grid & Transitions
10. Modern JavaScript ES6+: Closures, Promises & Async/Await
11. DOM Manipulation, Event Bubbling & Fetch API
12. React 18, Hooks, Virtual DOM & State Engines

### 🤖 AI Integration & LLM Systems
13. Generative AI with OpenAI & Anthropic Claude APIs
14. LangChain Expression Language (LCEL) & Autonomous Agents
15. Vector Databases & Semantic Search with ChromaDB
16. Production Retrieval-Augmented Generation (RAG) Architecture
17. Local LLMs & Offline Privacy-First AI with Ollama

### 🚀 3+ Industry Capstone Projects
18. **Capstone 1: AI-Powered E-Commerce Recommendation Platform** (FastAPI, PostgreSQL, HTML/CSS/JS, OpenAI Embeddings)
19. **Capstone 2: Natural Language to SQL Analytics Engine** (Text-to-SQL, LangChain, PostgreSQL, Streamlit/Chart.js)
20. **Capstone 3: Autonomous Multi-Agent Support & RAG Knowledgebase** (Multi-Agent, ChromaDB, FastAPI, React UI)
21. **Capstone 4: Full-Stack Microservices SaaS Platform** (Docker, Stripe Billing, Celery/Redis Tasks)

### 💼 DevOps, Git & Career
22. Git & GitHub Production Team Workflows
23. Docker Multi-Stage Builds & Cloud Server Deployment
24. Full Stack Python & AI Interview Mastery & System Design

---

## 3. Admin Workspace (`/admin/*`)

Access via the **Login** buttons (`/login`):
- **10 Professional Themes**: Forest Green, Emerald & White, Dark Green / Black, Navy Blue, Indigo & Gray, Teal, Warm Amber, Rose, Purple, and Neutral Gray.
- **Dashboard**: 4 KPI cards and real-time activity log.
- **Students**: Batch filter, search, validated modal, edit modal, and active status toggle.
- **Fees**: Revenue statistics, record payment modal, and pending invoices filter.
- **Tests**: Assessment builder with dynamic multiple-choice question builder.

---

## 4. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Copy .env.example to .env.local and populate your Supabase project keys
cp .env.example .env.local

# 3. Start development server
npm run dev
```

---

## 5. Supabase Database Migration & Backups

CodeLift is powered by a fully relational Supabase PostgreSQL database with Row-Level Security (RLS) across 26 normalized tables.

### 5.1 Running the One-Time Migration
To apply `supabase/migrations/001_initial_schema.sql` and migrate all seed JSON collections into your Supabase PostgreSQL instance:

```bash
# Ensure DATABASE_URL is set in .env.local
node scripts/migrate-json-to-supabase.js
```

### 5.2 Exporting Database Backups
To dump all 26 database tables back into dated JSON files:

```bash
node scripts/export-supabase-to-json.js
```

---

## 6. GitHub Pages Deployment

The repository includes an automated GitHub Actions deployment workflow (`.github/workflows/deploy.yml`):
- **Base Path**: Configured via `VITE_BASE_PATH` in `vite.config.js` (default: `/platform/`).
- **SPA Routing**: `npm run build` automatically generates `dist/404.html` so client-side routes (e.g. `/admin/dashboard`) work seamlessly on GitHub Pages.
- **Repository Secrets**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are added under **Settings → Secrets and variables → Actions**.

---

## 7. EmailJS Event Notification Engine & Quota Architecture

CodeLift includes a built-in event-driven email notification engine powered by `@emailjs/browser` with zero backend server overhead.

### 7.1 Key Features & Safeguards
- **Universal Template Pattern**: Free tier EmailJS permits up to 2 templates. CodeLift solves this by utilizing **1 Universal Template** with dynamic variables (`{{subject}}`, `{{heading}}`, `{{message}}`, `{{action_url}}`, `{{action_text}}`, `{{platform_name}}`, `{{support_email}}`) to dispatch all 16 platform event types.
- **Monthly Quota Enforcement (200 Emails/Month)**: Dispatches are tracked in Supabase `email_quota_log`. The Admin Platform Settings displays a live progress counter (`X / 200 emails used`), shows an 80% warning at 160 emails, and enforces a hard block at 190 emails (95%) for bulk events.
- **Categorization**:
  - **Transactional (Default ON)**: Account creation, test submissions, assignment evaluations, fee receipts, certificate issuance, password updates.
  - **Bulk Events (Default OFF)**: Batch course/test/assignment allotment, fee reminders. Admin can enable selectively when ready to avoid burning monthly quota.
- **Selective Fee Reminders**: Filter pending student balances by cohort batch, select individual students via checkboxes, and send reminders only to chosen recipients with a comprehensive post-send delivery report.
- **Partial Failure Handling**: Batches stagger requests with 500ms intervals, skip empty emails, continue on individual rejections, and present a summary modal with a "Copy Failed Emails" button.
- **Non-Blocking Fail-Safe**: All email triggers run as non-blocking promises wrapped in exception handlers. Email service errors or quota exhaustion will never disrupt primary operations (e.g. submitting tests or recording fees).

### 7.2 Security & Domain Restriction
The EmailJS `publicKey` runs in client browsers by design. To prevent unauthorized usage:
1. Log in to [EmailJS Dashboard](https://dashboard.emailjs.com/) → **Account** → **Security**.
2. Under **Allowed Origins**, add:
   ```
   https://rishabhsanjaychoudhari.github.io
   http://localhost:5173
   ```
3. Enable **"Restrict to allowed origins"**.

### 7.3 Setup Instructions
1. **Create Account**: Register at [emailjs.com](https://www.emailjs.com/).
2. **Add Service**: Add an Email Service (e.g., Gmail) → Note your **Service ID** (`service_xxx`).
3. **Create Universal Template**: Add 1 template with:
   - **Subject**: `{{subject}}`
   - **Content (HTML)**:
     ```html
     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
       <h2 style="color: #4f46e5; margin-top: 0;">{{heading}}</h2>
       <p>Hi <strong>{{to_name}}</strong>,</p>
       <div style="white-space: pre-line; line-height: 1.6; color: #334155;">{{message}}</div>
       <div style="margin: 28px 0; text-align: center;">
         <a href="{{action_url}}" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">{{action_text}}</a>
       </div>
       <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
       <p style="font-size: 12px; color: #94a3b8; margin: 0;">— {{platform_name}} · Questions? Contact <a href="mailto:{{support_email}}">{{support_email}}</a></p>
     </div>
     ```
   - Note your **Template ID** (`template_xxx`).
4. **Copy Public Key**: Account → General → API Keys → **Public Key**.
5. **Configure CodeLift**: In `/admin/settings` under **EmailJS Engine & Quota**, enter the Service ID, Template ID, and Public Key, click **Save Settings**, and send a live Test Email.

