// ─── Complete Seed Data for CodeLift Platform ───────────────────────────────

// ── COURSES ──────────────────────────────────────────────────────────────────
export const SEED_COURSES = [
  {
    id: 'course-fswd',
    title: 'Full Stack Web Development',
    description: 'Master the complete web development stack from HTML to cloud deployment.',
    batchId: 'batch-fswd-morning',
    modules: [
      {
        id: 'm1',
        title: 'Web Foundations',
        topics: [
          {
            id: 't1',
            title: 'HTML5 & Semantic Markup',
            contentMd: `# HTML5 & Semantic Markup\n\nHTML5 introduced a rich set of semantic elements that describe the meaning of your content.\n\n## Key Semantic Elements\n\n- \`<header>\` – Page or section header\n- \`<nav>\` – Navigation links\n- \`<main>\` – Primary content\n- \`<article>\` – Self-contained content\n- \`<section>\` – Themed grouping\n- \`<footer>\` – Footer of page/section\n\n## Why Semantics Matter\n\n1. **Accessibility** – Screen readers understand structure\n2. **SEO** – Search engines rank content better\n3. **Maintainability** – Code is easier to read\n\n## Example\n\n\`\`\`html\n<header>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</header>\n<main>\n  <article>\n    <h1>My Article</h1>\n    <p>Content here...</p>\n  </article>\n</main>\n<footer>\n  <p>© 2026 CodeLift</p>\n</footer>\n\`\`\`\n`
          },
          {
            id: 't2',
            title: 'CSS3 Flexbox & Grid',
            contentMd: `# CSS3 Flexbox & Grid\n\nModern CSS layout is powered by two systems: **Flexbox** (1D) and **Grid** (2D).\n\n## Flexbox Basics\n\n\`\`\`css\n.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 16px;\n}\n\`\`\`\n\n## CSS Grid Basics\n\n\`\`\`css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 24px;\n}\n\`\`\`\n\n## When to Use Which?\n\n- **Flexbox** → Single row/column layouts, nav bars, card rows\n- **Grid** → Two-dimensional layouts, page structure, dashboards\n`
          },
          {
            id: 't3',
            title: 'Responsive Design Principles',
            contentMd: `# Responsive Design Principles\n\nResponsive design ensures your UI looks great on every device.\n\n## Core Concepts\n\n### 1. Mobile-First Approach\nWrite styles for small screens first, then scale up.\n\n\`\`\`css\n/* Mobile first */\n.card { width: 100%; }\n\n/* Tablet and up */\n@media (min-width: 768px) {\n  .card { width: 50%; }\n}\n\`\`\`\n\n### 2. Fluid Units\n- Use \`%\`, \`vw\`, \`rem\` instead of fixed \`px\`\n- \`clamp()\` for fluid typography\n\n### 3. Breakpoints\nCommon breakpoints: 480px, 768px, 1024px, 1280px\n`
          }
        ]
      },
      {
        id: 'm2',
        title: 'JavaScript Mastery',
        topics: [
          {
            id: 't4',
            title: 'ES6+ Modern JavaScript',
            contentMd: `# ES6+ Modern JavaScript\n\nES6 (ES2015) and beyond introduced powerful features that modernized JavaScript.\n\n## Destructuring\n\n\`\`\`javascript\nconst { name, age } = person;\nconst [first, ...rest] = array;\n\`\`\`\n\n## Arrow Functions\n\n\`\`\`javascript\nconst add = (a, b) => a + b;\nconst greet = name => \`Hello, \${name}!\`;\n\`\`\`\n\n## Spread & Rest\n\n\`\`\`javascript\nconst newArr = [...arr1, ...arr2];\nconst merged = { ...obj1, ...obj2 };\n\`\`\`\n\n## Template Literals\n\n\`\`\`javascript\nconst msg = \`Welcome \${user.name}, you have \${count} messages.\`;\n\`\`\`\n`
          },
          {
            id: 't5',
            title: 'Promises & Async/Await',
            contentMd: `# Promises & Async/Await\n\nAsynchronous JavaScript lets your code do work without blocking the thread.\n\n## The Promise\n\n\`\`\`javascript\nfetch('/api/data')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n\`\`\`\n\n## Async/Await (Cleaner Syntax)\n\n\`\`\`javascript\nasync function loadData() {\n  try {\n    const res = await fetch('/api/data');\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error('Failed:', err);\n  }\n}\n\`\`\`\n\n## Promise.all – Parallel Requests\n\n\`\`\`javascript\nconst [users, posts] = await Promise.all([\n  fetch('/users').then(r => r.json()),\n  fetch('/posts').then(r => r.json()),\n]);\n\`\`\`\n`
          },
          {
            id: 't6',
            title: 'DOM Manipulation & Events',
            contentMd: `# DOM Manipulation & Events\n\nThe DOM (Document Object Model) is JavaScript's interface to the HTML page.\n\n## Selecting Elements\n\n\`\`\`javascript\nconst btn = document.getElementById('myBtn');\nconst cards = document.querySelectorAll('.card');\n\`\`\`\n\n## Modifying the DOM\n\n\`\`\`javascript\nbtn.textContent = 'Clicked!';\nbtn.classList.add('active');\nbtn.style.color = 'green';\n\`\`\`\n\n## Event Listeners\n\n\`\`\`javascript\nbtn.addEventListener('click', (e) => {\n  e.preventDefault();\n  console.log('Button clicked!');\n});\n\`\`\`\n\n## Event Delegation\n\n\`\`\`javascript\ndocument.getElementById('list').addEventListener('click', (e) => {\n  if (e.target.matches('.item')) {\n    console.log('Item clicked:', e.target.dataset.id);\n  }\n});\n\`\`\`\n`
          }
        ]
      },
      {
        id: 'm3',
        title: 'React Engineering',
        topics: [
          {
            id: 't7',
            title: 'React Components & JSX',
            contentMd: `# React Components & JSX\n\nReact is a declarative UI library that builds interfaces from components.\n\n## Functional Components\n\n\`\`\`jsx\nfunction Welcome({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\`\`\`\n\n## JSX Rules\n\n1. Return a single root element (or Fragment \`<></>\`)\n2. Use \`className\` not \`class\`\n3. Self-close empty tags: \`<img />\`\n4. JavaScript goes in \`{}\`\n\n## Composing Components\n\n\`\`\`jsx\nfunction App() {\n  return (\n    <div>\n      <Header />\n      <Welcome name="Rahul" />\n      <Footer />\n    </div>\n  );\n}\n\`\`\`\n`
          },
          {
            id: 't8',
            title: 'React Hooks: useState & useEffect',
            contentMd: `# React Hooks: useState & useEffect\n\nHooks let functional components use state and lifecycle features.\n\n## useState\n\n\`\`\`jsx\nimport { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Count: {count}\n    </button>\n  );\n}\n\`\`\`\n\n## useEffect\n\n\`\`\`jsx\nimport { useEffect } from 'react';\n\nuseEffect(() => {\n  document.title = \`Count: \${count}\`;\n}, [count]); // runs when count changes\n\n// Cleanup:\nuseEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id); // cleanup on unmount\n}, []);\n\`\`\`\n`
          },
          {
            id: 't9',
            title: 'State Management & Context API',
            contentMd: `# State Management & Context API\n\nContext avoids prop-drilling by sharing state globally.\n\n## Creating Context\n\n\`\`\`jsx\nconst ThemeContext = createContext('light');\n\nfunction ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  return (\n    <ThemeContext.Provider value={{ theme, setTheme }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}\n\`\`\`\n\n## Consuming Context\n\n\`\`\`jsx\nfunction Button() {\n  const { theme, setTheme } = useContext(ThemeContext);\n  return (\n    <button onClick={() => setTheme('dark')}>\n      Current: {theme}\n    </button>\n  );\n}\n\`\`\`\n`
          }
        ]
      }
    ]
  },
  {
    id: 'course-da',
    title: 'Data Analytics & Engineering',
    description: 'Transform raw data into actionable insights using Python, SQL, and BI tools.',
    batchId: 'batch-da-weekend',
    modules: [
      {
        id: 'dm1',
        title: 'Python for Data Analysis',
        topics: [
          {
            id: 'dt1',
            title: 'Python Fundamentals & Data Structures',
            contentMd: `# Python Fundamentals & Data Structures\n\nPython is the go-to language for data analysis due to its readability and powerful libraries.\n\n## Core Data Structures\n\n\`\`\`python\n# List – ordered, mutable\nnumbers = [1, 2, 3, 4, 5]\n\n# Dict – key-value pairs\nstudent = {'name': 'Rahul', 'score': 95}\n\n# Set – unique values\nunique = {1, 2, 3, 2, 1}  # {1, 2, 3}\n\n# Tuple – immutable\npoint = (10, 20)\n\`\`\`\n\n## List Comprehensions\n\n\`\`\`python\nsquares = [x**2 for x in range(10)]\nevens = [x for x in numbers if x % 2 == 0]\n\`\`\`\n`
          },
          {
            id: 'dt2',
            title: 'Pandas & Data Wrangling',
            contentMd: `# Pandas & Data Wrangling\n\nPandas is the workhorse of data manipulation in Python.\n\n## Loading Data\n\n\`\`\`python\nimport pandas as pd\n\ndf = pd.read_csv('students.csv')\ndf = pd.read_excel('data.xlsx')\n\`\`\`\n\n## Exploring Data\n\n\`\`\`python\ndf.head(5)       # first 5 rows\ndf.info()        # dtypes and nulls\ndf.describe()    # statistics\ndf.shape         # (rows, cols)\n\`\`\`\n\n## Cleaning\n\n\`\`\`python\ndf.dropna()               # remove null rows\ndf.fillna(0)              # fill nulls with 0\ndf.rename(columns={'old': 'new'})\ndf['col'].astype(float)   # type conversion\n\`\`\`\n`
          },
          {
            id: 'dt3',
            title: 'Data Visualization',
            contentMd: `# Data Visualization with Matplotlib & Seaborn\n\nVisualization turns numbers into stories.\n\n## Matplotlib Basics\n\n\`\`\`python\nimport matplotlib.pyplot as plt\n\nplt.plot([1,2,3], [4,5,6])\nplt.title('Line Chart')\nplt.xlabel('X Axis')\nplt.ylabel('Y Axis')\nplt.show()\n\`\`\`\n\n## Seaborn for Statistical Plots\n\n\`\`\`python\nimport seaborn as sns\n\nsns.histplot(df['score'], bins=20)\nsns.boxplot(x='batch', y='score', data=df)\nsns.heatmap(df.corr(), annot=True)\n\`\`\`\n`
          }
        ]
      },
      {
        id: 'dm2',
        title: 'Advanced SQL',
        topics: [
          {
            id: 'dt4',
            title: 'SQL Joins & Aggregations',
            contentMd: `# SQL Joins & Aggregations\n\n## Types of JOINs\n\n\`\`\`sql\n-- INNER JOIN: only matching rows\nSELECT s.name, b.name AS batch\nFROM students s\nINNER JOIN batches b ON s.batch_id = b.id;\n\n-- LEFT JOIN: all from left, null if no match\nSELECT s.name, f.amount\nFROM students s\nLEFT JOIN fees f ON s.id = f.student_id;\n\`\`\`\n\n## Aggregation Functions\n\n\`\`\`sql\nSELECT\n  batch_id,\n  COUNT(*) AS total_students,\n  AVG(score) AS avg_score,\n  MAX(score) AS top_score\nFROM test_attempts\nGROUP BY batch_id\nHAVING AVG(score) > 70;\n\`\`\`\n`
          },
          {
            id: 'dt5',
            title: 'Window Functions & CTEs',
            contentMd: `# Window Functions & CTEs\n\n## Common Table Expressions (CTEs)\n\n\`\`\`sql\nWITH top_students AS (\n  SELECT student_id, AVG(score) AS avg_score\n  FROM test_attempts\n  GROUP BY student_id\n  HAVING AVG(score) >= 80\n)\nSELECT s.name, t.avg_score\nFROM students s\nJOIN top_students t ON s.id = t.student_id;\n\`\`\`\n\n## Window Functions\n\n\`\`\`sql\nSELECT\n  name,\n  score,\n  RANK() OVER (ORDER BY score DESC) AS rank,\n  AVG(score) OVER (PARTITION BY batch_id) AS batch_avg\nFROM test_attempts;\n\`\`\`\n`
          },
          {
            id: 'dt6',
            title: 'Query Optimization',
            contentMd: `# Query Optimization\n\nSlow queries destroy application performance. Let's fix them.\n\n## Indexes\n\n\`\`\`sql\n-- Create an index on frequently filtered column\nCREATE INDEX idx_students_email ON students(email);\n\n-- Composite index for multi-column queries\nCREATE INDEX idx_fees_student_status ON fees(student_id, status);\n\`\`\`\n\n## EXPLAIN ANALYZE\n\n\`\`\`sql\nEXPLAIN ANALYZE\nSELECT * FROM students WHERE email = 'rahul@example.com';\n-- Look for: Seq Scan vs Index Scan\n-- Aim for Index Scan for large tables\n\`\`\`\n\n## Common Optimizations\n\n1. Avoid \`SELECT *\` – select only needed columns\n2. Use \`LIMIT\` for pagination\n3. Avoid functions on indexed columns in WHERE\n4. Use connection pooling (pgBouncer)\n`
          }
        ]
      },
      {
        id: 'dm3',
        title: 'ETL & BI Dashboards',
        topics: [
          {
            id: 'dt7',
            title: 'Building ETL Pipelines',
            contentMd: `# Building ETL Pipelines\n\nETL = Extract, Transform, Load. The backbone of data engineering.\n\n## Simple ETL in Python\n\n\`\`\`python\nimport pandas as pd\nimport sqlite3\n\n# EXTRACT\ndf = pd.read_csv('raw_data.csv')\n\n# TRANSFORM\ndf['date'] = pd.to_datetime(df['date'])\ndf = df.dropna(subset=['id', 'amount'])\ndf['amount'] = df['amount'].astype(float)\ndf = df[df['amount'] > 0]\n\n# LOAD\nconn = sqlite3.connect('analytics.db')\ndf.to_sql('transactions', conn, if_exists='append', index=False)\nconn.close()\n\`\`\`\n`
          },
          {
            id: 'dt8',
            title: 'Power BI & Dashboard Design',
            contentMd: `# Power BI & Dashboard Design\n\n## Dashboard Design Principles\n\n1. **Tell a story** – what question does this dashboard answer?\n2. **Hierarchy** – KPI cards at top, detail below\n3. **Minimal colors** – max 3-4 complementary colors\n4. **Context** – add comparison (vs last month, vs target)\n\n## Key Chart Types\n\n| Chart | Best For |\n|-------|----------|\n| Line | Trends over time |\n| Bar | Comparison across categories |\n| Pie | Part-to-whole (max 5 slices) |\n| Scatter | Correlation between variables |\n| Table | Exact numbers & details |\n\n## Power BI Quick Start\n\n1. Load data (CSV, SQL, Excel)\n2. Clean in Power Query Editor\n3. Create relationships\n4. Build measures with DAX\n5. Design visuals\n6. Publish to Power BI Service\n`
          },
          {
            id: 'dt9',
            title: 'Capstone: End-to-End Analytics Project',
            contentMd: `# Capstone: End-to-End Analytics Project\n\nApply everything you've learned in a real-world scenario.\n\n## Project Requirements\n\nYou will build a complete analytics solution for a fictional e-commerce business:\n\n1. **Data Collection** – Load 3 CSV datasets (orders, customers, products)\n2. **Cleaning** – Handle nulls, duplicates, type mismatches\n3. **SQL Analysis** – Write 10 queries answering business questions\n4. **Python Visualization** – 5 charts with Matplotlib/Seaborn\n5. **Dashboard** – Power BI or Streamlit dashboard with KPIs\n6. **Presentation** – 5-minute executive summary slide deck\n\n## Evaluation Rubric\n\n- Data Quality & Cleaning: 20 marks\n- SQL Query Correctness: 30 marks\n- Visualization Clarity: 25 marks\n- Dashboard Design: 15 marks\n- Presentation: 10 marks\n\n**Total: 100 marks. Pass threshold: 60 marks.**\n`
          }
        ]
      }
    ]
  }
];

// ── BATCHES ───────────────────────────────────────────────────────────────────
export const SEED_BATCHES = [
  {
    id: 'batch-fswd-morning',
    name: 'Full Stack Web Dev (Morning)',
    description: 'Master the MERN stack with real-world projects. Morning session for working professionals.',
    capacity: 30,
    feeAmount: 3000,
    startDate: '2026-01-15',
    isActive: true,
    isCompleted: false,
    completedAt: null,
    archivedStudents: []
  },
  {
    id: 'batch-fswd-evening',
    name: 'Full Stack Web Dev (Evening)',
    description: 'Same curriculum, evening timing. Ideal for fresh graduates.',
    capacity: 25,
    feeAmount: 3000,
    startDate: '2026-01-20',
    isActive: true,
    isCompleted: false,
    completedAt: null,
    archivedStudents: []
  },
  {
    id: 'batch-da-weekend',
    name: 'Data Analytics (Weekend)',
    description: 'Python, SQL, Power BI, and ETL pipelines. Weekend intensive format.',
    capacity: 20,
    feeAmount: 35000,
    startDate: '2026-02-01',
    isActive: true,
    isCompleted: false,
    completedAt: null,
    archivedStudents: []
  }
];

export const SEED_COMPLETED_BATCHES = [
  {
    id: 'cbatch-fswd-fall2025',
    originalBatchId: 'batch-fswd-fall2025',
    name: 'Full Stack Web Dev (Fall 2025)',
    description: 'Fall 2025 Intensive Cohort – Completed with distinction.',
    startDate: '2025-08-01',
    endDate: '2025-12-20',
    completedAt: '2025-12-20T17:00:00Z',
    studentIds: ['std-001'],
    testIds: ['attempt-001'],
    assignmentIds: ['sub-001']
  }
];

// ── STUDENTS ──────────────────────────────────────────────────────────────────
export const SEED_STUDENTS = [
  {
    id: 'std-001',
    name: 'Rahul Sharma',
    email: 'rahul@codelift.in',
    phone: '+91 98765 43210',
    batchId: 'batch-fswd-morning',
    password: 'password123',
    isActive: true,
    joinedAt: '2026-01-15T10:30:00Z',
    progress: { 't1': 'completed', 't2': 'completed', 't3': 'completed', 't4': 'completed', 't5': 'completed' }
  },
  {
    id: 'std-002',
    name: 'Ananya Verma',
    email: 'ananya@codelift.in',
    phone: '+91 98765 43211',
    batchId: 'batch-fswd-morning',
    password: 'password123',
    isActive: true,
    joinedAt: '2026-01-15T11:00:00Z',
    progress: { 't1': 'completed', 't2': 'completed', 't3': 'completed' }
  },
  {
    id: 'std-003',
    name: 'Priya Patel',
    email: 'priya@codelift.in',
    phone: '+91 98765 43212',
    batchId: 'batch-fswd-morning',
    password: 'password123',
    isActive: true,
    joinedAt: '2026-01-16T09:00:00Z',
    progress: { 't1': 'completed', 't2': 'completed' }
  },
  {
    id: 'std-004',
    name: 'Karan Singh',
    email: 'karan@codelift.in',
    phone: '+91 98765 43213',
    batchId: 'batch-fswd-morning',
    password: 'password123',
    isActive: true,
    joinedAt: '2026-01-16T10:30:00Z',
    progress: { 't1': 'completed' }
  },
  {
    id: 'std-005',
    name: 'Rohit Mehta',
    email: 'rohit@codelift.in',
    phone: '+91 98765 43214',
    batchId: 'batch-fswd-evening',
    password: 'password123',
    isActive: true,
    joinedAt: '2026-01-20T18:00:00Z',
    progress: { 't1': 'completed', 't2': 'completed', 't3': 'completed', 't4': 'completed' }
  },
  {
    id: 'std-006',
    name: 'Neha Gupta',
    email: 'neha@codelift.in',
    phone: '+91 98765 43215',
    batchId: 'batch-fswd-evening',
    password: 'password123',
    isActive: true,
    joinedAt: '2026-01-20T18:30:00Z',
    progress: { 't1': 'completed', 't2': 'completed' }
  },
  {
    id: 'std-007',
    name: 'Amit Kumar',
    email: 'amit@codelift.in',
    phone: '+91 98765 43216',
    batchId: 'batch-fswd-evening',
    password: 'password123',
    isActive: false,
    joinedAt: '2026-01-21T17:00:00Z',
    progress: { 't1': 'completed' }
  },
  {
    id: 'std-008',
    name: 'Divya Nair',
    email: 'divya@codelift.in',
    phone: '+91 98765 43217',
    batchId: 'batch-da-weekend',
    password: 'password123',
    isActive: true,
    joinedAt: '2026-02-01T10:00:00Z',
    progress: { 'dt1': 'completed', 'dt2': 'completed', 'dt3': 'completed', 'dt4': 'completed', 'dt5': 'completed', 'dt6': 'completed', 'dt7': 'completed', 'dt8': 'completed', 'dt9': 'completed' }
  },
  {
    id: 'std-009',
    name: 'Suresh Reddy',
    email: 'suresh@codelift.in',
    phone: '+91 98765 43218',
    batchId: 'batch-da-weekend',
    password: 'password123',
    isActive: true,
    joinedAt: '2026-02-01T10:30:00Z',
    progress: { 'dt1': 'completed', 'dt2': 'completed', 'dt3': 'completed' }
  },
  {
    id: 'std-010',
    name: 'Meera Iyer',
    email: 'meera@codelift.in',
    phone: '+91 98765 43219',
    batchId: 'batch-da-weekend',
    password: 'password123',
    isActive: true,
    joinedAt: '2026-02-02T09:00:00Z',
    progress: { 'dt1': 'completed', 'dt2': 'completed' }
  }
];

// ── FEES ──────────────────────────────────────────────────────────────────────
export const SEED_FEES = [
  { id: 'fee-001', studentId: 'std-001', amount: 3000, paidAt: '2026-01-15T12:00:00Z', mode: 'UPI', status: 'PAID' },
  { id: 'fee-002', studentId: 'std-002', amount: 3000, paidAt: '2026-01-16T10:00:00Z', mode: 'Bank Transfer', status: 'PAID' },
  { id: 'fee-003', studentId: 'std-003', amount: 22500, paidAt: '2026-01-17T11:00:00Z', mode: 'Cash', status: 'PAID' },
  { id: 'fee-004', studentId: 'std-003', amount: 22500, paidAt: null, mode: 'UPI', status: 'PENDING' },
  { id: 'fee-005', studentId: 'std-004', amount: 3000, paidAt: null, mode: 'Bank Transfer', status: 'PENDING' },
  { id: 'fee-006', studentId: 'std-005', amount: 3000, paidAt: '2026-01-20T19:00:00Z', mode: 'UPI', status: 'PAID' },
  { id: 'fee-007', studentId: 'std-008', amount: 35000, paidAt: '2026-02-01T11:00:00Z', mode: 'Bank Transfer', status: 'PAID' },
  { id: 'fee-008', studentId: 'std-009', amount: 35000, paidAt: null, mode: 'UPI', status: 'PENDING' }
];

// ── TESTS ─────────────────────────────────────────────────────────────────────
export const SEED_TESTS = [
  {
    id: 'test-001',
    title: 'JavaScript Fundamentals',
    description: 'Test your core JavaScript knowledge including ES6+ features, closures, and async programming.',
    passingPercentage: 70,
    allowRetake: true,
    assignedBatchIds: ['batch-fswd-morning', 'batch-fswd-evening'],
    createdAt: '2026-02-10T10:00:00Z',
    questions: [
      { id: 'q1', text: 'What is the output of `typeof null` in JavaScript?', options: ['object', 'null', 'undefined', 'number'], correctAnswer: 0 },
      { id: 'q2', text: 'Which keyword creates a block-scoped variable?', options: ['var', 'let', 'function', 'const'], correctAnswer: 1 },
      { id: 'q3', text: 'What does the spread operator `...` do?', options: ['Deletes array elements', 'Expands iterables', 'Creates closures', 'Declares functions'], correctAnswer: 1 },
      { id: 'q4', text: 'What is a Promise in JavaScript?', options: ['A synchronous function', 'An object representing eventual completion/failure', 'A CSS property', 'A loop construct'], correctAnswer: 1 },
      { id: 'q5', text: 'Which array method transforms each element and returns a new array?', options: ['filter', 'forEach', 'map', 'reduce'], correctAnswer: 2 },
      { id: 'q6', text: 'What is a closure?', options: ['A function that has no return', 'A function bundled with its lexical scope', 'A CSS layout', 'An ES5 class'], correctAnswer: 1 },
      { id: 'q7', text: 'What does `async/await` simplify?', options: ['CSS transitions', 'Promise chaining', 'HTML rendering', 'Database queries'], correctAnswer: 1 },
      { id: 'q8', text: 'Which method removes the last element from an array?', options: ['shift', 'unshift', 'pop', 'splice'], correctAnswer: 2 },
      { id: 'q9', text: 'What is the purpose of `Array.prototype.reduce`?', options: ['To filter elements', 'To accumulate a single value from an array', 'To sort arrays', 'To flatten arrays'], correctAnswer: 1 },
      { id: 'q10', text: 'What does `===` check in JavaScript?', options: ['Value only', 'Type only', 'Both value and type', 'Reference only'], correctAnswer: 2 }
    ]
  },
  {
    id: 'test-002',
    title: 'React Basics',
    description: 'Assess your understanding of React components, hooks, and state management.',
    passingPercentage: 70,
    allowRetake: true,
    assignedBatchIds: ['batch-fswd-morning', 'batch-fswd-evening'],
    createdAt: '2026-02-15T10:00:00Z',
    questions: [
      { id: 'q1', text: 'What hook is used to manage state in a functional component?', options: ['useEffect', 'useState', 'useContext', 'useRef'], correctAnswer: 1 },
      { id: 'q2', text: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Execution'], correctAnswer: 0 },
      { id: 'q3', text: 'Which hook handles side effects in React?', options: ['useState', 'useRef', 'useEffect', 'useMemo'], correctAnswer: 2 },
      { id: 'q4', text: 'What is the virtual DOM?', options: ['A JavaScript database', 'A lightweight copy of the real DOM', 'A CSS preprocessor', 'A testing tool'], correctAnswer: 1 },
      { id: 'q5', text: 'How do you pass data from parent to child in React?', options: ['Using state', 'Using props', 'Using context only', 'Using refs'], correctAnswer: 1 },
      { id: 'q6', text: 'What does the `key` prop help React do?', options: ['Style elements', 'Efficiently update list items', 'Handle events', 'Create context'], correctAnswer: 1 },
      { id: 'q7', text: 'Which lifecycle is equivalent to `useEffect(() => {}, [])`?', options: ['componentDidUpdate', 'componentWillUnmount', 'componentDidMount', 'shouldComponentUpdate'], correctAnswer: 2 },
      { id: 'q8', text: 'What does React.memo do?', options: ['Memoizes a hook', 'Prevents re-render if props unchanged', 'Stores state', 'Creates context'], correctAnswer: 1 }
    ]
  },
  {
    id: 'test-003',
    title: 'Python for Data Science',
    description: 'Test your Python knowledge with a focus on data structures, Pandas, and SQL.',
    passingPercentage: 70,
    allowRetake: true,
    assignedBatchIds: ['batch-da-weekend'],
    createdAt: '2026-02-20T10:00:00Z',
    questions: [
      { id: 'q1', text: 'Which library is the primary tool for data manipulation in Python?', options: ['NumPy', 'Matplotlib', 'Pandas', 'Scikit-learn'], correctAnswer: 2 },
      { id: 'q2', text: 'How do you read a CSV into a DataFrame?', options: ['pd.open_csv()', 'pd.read_csv()', 'pd.load_csv()', 'pd.import_csv()'], correctAnswer: 1 },
      { id: 'q3', text: 'What does `df.dropna()` do?', options: ['Drops columns', 'Removes rows with null values', 'Fills nulls with 0', 'Renames columns'], correctAnswer: 1 },
      { id: 'q4', text: 'Which SQL clause filters groups after aggregation?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correctAnswer: 1 },
      { id: 'q5', text: 'What is a Python list comprehension?', options: ['A function for sorting', 'A concise way to create lists', 'A class method', 'A file reader'], correctAnswer: 1 },
      { id: 'q6', text: 'What does `df.describe()` return?', options: ['Column names', 'Descriptive statistics', 'Data types', 'Null counts'], correctAnswer: 1 },
      { id: 'q7', text: 'Which SQL JOIN returns all rows from both tables?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], correctAnswer: 3 },
      { id: 'q8', text: 'What does `GROUP BY` do in SQL?', options: ['Sorts results', 'Groups rows with same values', 'Filters rows', 'Joins tables'], correctAnswer: 1 },
      { id: 'q9', text: 'Which Python library creates visualizations?', options: ['Pandas', 'NumPy', 'Matplotlib', 'SQLAlchemy'], correctAnswer: 2 },
      { id: 'q10', text: 'What is an ETL pipeline?', options: ['A Python function', 'Extract-Transform-Load data process', 'A database index', 'A visualization tool'], correctAnswer: 1 },
      { id: 'q11', text: 'What does `df.merge()` do?', options: ['Splits a DataFrame', 'Combines two DataFrames', 'Sorts a DataFrame', 'Drops columns'], correctAnswer: 1 },
      { id: 'q12', text: 'Which function creates a new column in Pandas?', options: ['df.add_column()', 'df[\'new\'] = value', 'df.insert_column()', 'df.new_col()'], correctAnswer: 1 }
    ]
  }
];

// ── TEST ATTEMPTS ─────────────────────────────────────────────────────────────
export const SEED_TEST_ATTEMPTS = [
  {
    id: 'attempt-001',
    studentId: 'std-001',
    testId: 'test-001',
    batchId: 'batch-fswd-morning',
    answers: [0, 1, 1, 1, 2, 1, 1, 2, 1, 2],
    score: 10,
    totalQuestions: 10,
    submittedAt: '2026-02-12T14:30:00Z'
  },
  {
    id: 'attempt-002',
    studentId: 'std-001',
    testId: 'test-002',
    batchId: 'batch-fswd-morning',
    answers: [1, 0, 2, 1, 1, 1, 2, 1],
    score: 8,
    totalQuestions: 8,
    submittedAt: '2026-02-17T11:00:00Z'
  },
  {
    id: 'attempt-003',
    studentId: 'std-002',
    testId: 'test-001',
    batchId: 'batch-fswd-morning',
    answers: [0, 1, 1, 1, 2, 1, 1, 2, 1, 2],
    score: 8,
    totalQuestions: 10,
    submittedAt: '2026-02-13T10:00:00Z'
  },
  {
    id: 'attempt-004',
    studentId: 'std-008',
    testId: 'test-003',
    batchId: 'batch-da-weekend',
    answers: [2, 1, 1, 1, 1, 1, 3, 1, 2, 1, 1, 1],
    score: 12,
    totalQuestions: 12,
    submittedAt: '2026-02-22T15:00:00Z'
  }
];

// ── REVIEWS ───────────────────────────────────────────────────────────────────
export const SEED_REVIEWS = [
  {
    id: 'rev-001',
    studentId: 'std-001',
    studentName: 'Rahul Sharma',
    rating: 5,
    comment: 'The project-based approach gave me the confidence to crack my first developer interview. I walked in with a GitHub full of real applications—that made all the difference.',
    createdAt: '2026-03-01T10:00:00Z',
    isPublished: true,
    isAnonymous: false,
    reply: 'Thank you Rahul! We are incredibly proud of your journey. Keep building great things!'
  },
  {
    id: 'rev-002',
    studentId: 'std-008',
    studentName: 'Divya Nair',
    rating: 5,
    comment: 'The mentorship is unparalleled. I went from a complete beginner to a job-ready data analyst in just 5 months. My mentor was available every time I had a doubt.',
    createdAt: '2026-03-05T14:00:00Z',
    isPublished: true,
    isAnonymous: false,
    reply: null
  },
  {
    id: 'rev-003',
    studentId: 'std-005',
    studentName: 'Rohit Mehta',
    rating: 4,
    comment: 'Small batch sizes meant I never got left behind. The curriculum is very well structured. I only wish there were more industry guest sessions.',
    createdAt: '2026-03-08T09:00:00Z',
    isPublished: true,
    isAnonymous: false,
    reply: null
  },
  {
    id: 'rev-004',
    studentId: 'std-002',
    studentName: 'Ananya Verma',
    rating: 5,
    comment: 'The React modules were exceptional. The way complex concepts like closures and the event loop were explained using real-world analogies was brilliant. Highly recommend!',
    createdAt: '2026-03-10T11:00:00Z',
    isPublished: true,
    isAnonymous: false,
    reply: 'Thank you Ananya! Your dedication in class was truly inspiring to the whole cohort.'
  },
  {
    id: 'rev-005',
    studentId: 'std-009',
    studentName: 'Suresh Reddy',
    rating: 3,
    comment: 'Good course overall. The SQL section was very thorough. I felt the Python section could have been a bit more advanced. But the mentors were always helpful.',
    createdAt: '2026-03-12T16:00:00Z',
    isPublished: false,
    isAnonymous: false,
    reply: null
  },
  {
    id: 'rev-006',
    studentId: 'std-003',
    studentName: 'Priya Patel',
    rating: 4,
    comment: 'CodeLift gave me the structured learning environment I needed. The assignments were challenging but very practical. The certificate helped me get shortlisted much faster.',
    createdAt: '2026-03-15T10:30:00Z',
    isPublished: false,
    isAnonymous: false,
    reply: null
  }
];

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────────
export const SEED_ASSIGNMENTS = [
  {
    id: 'asgn-001',
    title: 'Build a Responsive Portfolio Website',
    description: 'Create a personal portfolio website using HTML5 & CSS3. Must include a hero section, about, skills, projects, and contact sections. Must be fully responsive.',
    deadline: '2026-02-10T23:59:00Z',
    maxMarks: 100,
    batchIds: ['batch-fswd-morning', 'batch-fswd-evening'],
    createdAt: '2026-01-25T10:00:00Z'
  },
  {
    id: 'asgn-002',
    title: 'JavaScript To-Do App',
    description: 'Build a functional To-Do application using vanilla JavaScript. Must support: add, delete, complete, and filter tasks. Data must persist in localStorage.',
    deadline: '2026-02-25T23:59:00Z',
    maxMarks: 100,
    batchIds: ['batch-fswd-morning', 'batch-fswd-evening'],
    createdAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'asgn-003',
    title: 'React Dashboard with Context API',
    description: 'Build a mini admin dashboard with React 18. Must use useState, useEffect, and Context API for theme/data management. Include at least 3 components and a chart.',
    deadline: '2026-04-15T23:59:00Z',
    maxMarks: 100,
    batchIds: ['batch-fswd-morning'],
    createdAt: '2026-03-20T10:00:00Z'
  },
  {
    id: 'asgn-004',
    title: 'SQL & Pandas Analysis Project',
    description: 'Analyse the provided e-commerce dataset. Write 10 SQL queries using JOINs, aggregations, and window functions. Create 5 visualizations using Matplotlib.',
    deadline: '2026-04-01T23:59:00Z',
    maxMarks: 100,
    batchIds: ['batch-da-weekend'],
    createdAt: '2026-03-01T10:00:00Z'
  }
];

// ── SUBMISSIONS ───────────────────────────────────────────────────────────────
export const SEED_SUBMISSIONS = [
  {
    id: 'sub-001',
    studentId: 'std-001',
    assignmentId: 'asgn-001',
    batchId: 'batch-fswd-morning',
    fileUrls: ['https://github.com/rahulsharma/portfolio'],
    notes: 'Deployed on GitHub Pages. Used CSS Grid for layout.',
    submittedAt: '2026-02-09T18:00:00Z',
    grade: 92,
    feedback: 'Excellent responsive design! Consider adding CSS animations for a more polished feel.'
  },
  {
    id: 'sub-002',
    studentId: 'std-001',
    assignmentId: 'asgn-002',
    batchId: 'batch-fswd-morning',
    fileUrls: ['https://github.com/rahulsharma/todo-app'],
    notes: 'Used ES6 classes and localStorage API.',
    submittedAt: '2026-02-24T20:00:00Z',
    grade: 88,
    feedback: 'Good implementation. The filter feature works perfectly. Try adding drag-and-drop reordering next.'
  },
  {
    id: 'sub-003',
    studentId: 'std-002',
    assignmentId: 'asgn-001',
    batchId: 'batch-fswd-morning',
    fileUrls: ['https://github.com/ananyav/portfolio'],
    notes: 'Used Flexbox for all sections.',
    submittedAt: '2026-02-08T15:00:00Z',
    grade: 95,
    feedback: 'Outstanding work! Beautiful design and excellent mobile responsiveness.'
  },
  {
    id: 'sub-004',
    studentId: 'std-005',
    assignmentId: 'asgn-001',
    batchId: 'batch-fswd-evening',
    fileUrls: ['https://github.com/rohitmehta/portfolio'],
    notes: 'First time building a complete website!',
    submittedAt: '2026-02-10T22:00:00Z',
    grade: null,
    feedback: null
  },
  {
    id: 'sub-005',
    studentId: 'std-008',
    assignmentId: 'asgn-004',
    batchId: 'batch-da-weekend',
    fileUrls: ['https://github.com/divyanair/analytics-project'],
    notes: 'Used Pandas and Matplotlib. Included Jupyter notebook.',
    submittedAt: '2026-03-30T16:00:00Z',
    grade: 98,
    feedback: 'Exceptional analysis! Your window function queries were particularly impressive.'
  },
  {
    id: 'sub-006',
    studentId: 'std-009',
    assignmentId: 'asgn-004',
    batchId: 'batch-da-weekend',
    fileUrls: ['https://github.com/sureshreddy/data-project'],
    notes: 'Completed all 10 SQL queries and 5 charts.',
    submittedAt: '2026-04-01T20:00:00Z',
    grade: null,
    feedback: null
  }
];

// ── CERTIFICATES ──────────────────────────────────────────────────────────────
export const DEFAULT_CERTIFICATE_TEMPLATES = [
  {
    id: 'classic-emerald',
    name: 'Classic Academy (Emerald)',
    isActive: true,
    instituteName: '',
    signatoryName: '',
    signatoryTitle: '',
    certTitle: 'CERTIFICATE OF COMPLETION',
    design: {
      accentColor: '#15803D',
      bgStyle: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%)',
      fontFamily: 'Georgia, serif',
      borderStyle: 'double',
      borderWidth: 4,
      borderColor: '#15803D',
      badgeText: 'ACADEMIC EXCELLENCE',
      isDark: false,
      elements: {
        signatureName: { content: '{{signatoryName}}' },
        signatureTitle: { content: '{{signatoryTitle}}' }
      }
    }
  },
  {
    id: 'modern-dark',
    name: 'Modern Executive (Obsidian & Mint)',
    isActive: false,
    instituteName: '',
    signatoryName: '',
    signatoryTitle: '',
    certTitle: 'CERTIFICATE OF ACHIEVEMENT',
    design: {
      accentColor: '#10B981',
      bgStyle: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: 'Inter, sans-serif',
      borderStyle: 'solid',
      borderWidth: 2,
      borderColor: '#334155',
      badgeText: 'INDUSTRY CERTIFIED',
      isDark: true,
      elements: {
        signatureName: { content: '{{signatoryName}}' },
        signatureTitle: { content: '{{signatoryTitle}}' }
      }
    }
  },
  {
    id: 'regal-purple',
    name: 'Honorary Distinction (Royal Purple)',
    isActive: false,
    instituteName: '',
    signatoryName: '',
    signatoryTitle: '',
    certTitle: 'CERTIFICATE OF EXCELLENCE',
    design: {
      accentColor: '#7C3AED',
      bgStyle: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 50%, #f3e8ff 100%)',
      fontFamily: 'Georgia, serif',
      borderStyle: 'solid',
      borderWidth: 3,
      borderColor: '#A855F7',
      badgeText: 'GOLD MEDAL HONORS',
      isDark: false,
      elements: {
        signatureName: { content: '{{signatoryName}}' },
        signatureTitle: { content: '{{signatoryTitle}}' }
      }
    }
  },
  {
    id: 'sky-horizon',
    name: 'Horizon Diploma (Sky & Slate)',
    isActive: false,
    instituteName: '',
    signatoryName: '',
    signatoryTitle: '',
    certTitle: 'CERTIFICATE OF COMPLETION',
    design: {
      accentColor: '#0284C7',
      bgStyle: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #e0f2fe 100%)',
      fontFamily: "'Playfair Display', Georgia, serif",
      borderStyle: 'double',
      borderWidth: 4,
      borderColor: '#0284C7',
      badgeText: 'ACADEMIC EXCELLENCE',
      isDark: false,
      elements: {
        signatureName: { content: '{{signatoryName}}' },
        signatureTitle: { content: '{{signatoryTitle}}' }
      }
    }
  },
  {
    id: 'gold-laureate',
    name: 'Laureate Honors (Gold & Ivory)',
    isActive: false,
    instituteName: '',
    signatoryName: '',
    signatoryTitle: '',
    certTitle: 'CERTIFICATE OF DISTINCTION',
    design: {
      accentColor: '#CA8A04',
      bgStyle: 'linear-gradient(135deg, #fefce8 0%, #ffffff 50%, #fef3c7 100%)',
      fontFamily: 'Georgia, serif',
      borderStyle: 'solid',
      borderWidth: 5,
      borderColor: '#EAB308',
      badgeText: 'GOLD LAUREATE',
      isDark: false,
      elements: {
        signatureName: { content: '{{signatoryName}}' },
        signatureTitle: { content: '{{signatoryTitle}}' }
      }
    }
  },
  {
    id: 'minimal-slate',
    name: 'Minimalist Professional (Slate)',
    isActive: false,
    instituteName: '',
    signatoryName: '',
    signatoryTitle: '',
    certTitle: 'CERTIFICATE OF COMPLETION',
    design: {
      accentColor: '#64748B',
      bgStyle: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
      fontFamily: 'Inter, sans-serif',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#CBD5E1',
      badgeText: 'PROFESSIONAL SKILLS',
      isDark: false,
      elements: {
        signatureName: { content: '{{signatoryName}}' },
        signatureTitle: { content: '{{signatoryTitle}}' }
      }
    }
  },
  {
    id: 'rose-distinction',
    name: 'Distinction Accolade (Rose & Blush)',
    isActive: false,
    instituteName: '',
    signatoryName: '',
    signatoryTitle: '',
    certTitle: 'CERTIFICATE OF DISTINCTION',
    design: {
      accentColor: '#BE185D',
      bgStyle: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 50%, #fce7f3 100%)',
      fontFamily: "'Playfair Display', Georgia, serif",
      borderStyle: 'solid',
      borderWidth: 3,
      borderColor: '#EC4899',
      badgeText: 'SPECIAL DISTINCTION',
      isDark: false,
      elements: {
        signatureName: { content: '{{signatoryName}}' },
        signatureTitle: { content: '{{signatoryTitle}}' }
      }
    }
  },
  {
    id: 'charcoal-premium',
    name: 'Premier Certificate (Charcoal & Gold)',
    isActive: false,
    instituteName: '',
    signatoryName: '',
    signatoryTitle: '',
    certTitle: 'CERTIFICATE OF EXCELLENCE',
    design: {
      accentColor: '#F5C518',
      bgStyle: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #292524 100%)',
      fontFamily: 'Georgia, serif',
      borderStyle: 'double',
      borderWidth: 4,
      borderColor: '#F5C518',
      badgeText: 'PREMIER CREDENTIAL',
      isDark: true,
      elements: {
        signatureName: { content: '{{signatoryName}}' },
        signatureTitle: { content: '{{signatoryTitle}}' }
      }
    }
  }
];

export const SEED_CERTIFICATES = [
  {
    id: 'cert-001',
    studentId: 'std-001',
    studentName: 'Rahul Sharma',
    courseName: 'Full Stack Web Development',
    issuedAt: '2026-04-01T10:00:00Z',
    certificateId: 'CERT-2026-0001',
    isIssued: true,
    isRevoked: false,
    instituteName: 'CodeLift Engineering Academy',
    signatoryName: 'Vikram Nair',
    signatoryTitle: 'Director, CodeLift Academy',
    certTitle: 'CERTIFICATE OF COMPLETION',
    design: DEFAULT_CERTIFICATE_TEMPLATES[0].design
  },
  {
    id: 'cert-002',
    studentId: 'std-008',
    studentName: 'Divya Nair',
    courseName: 'Data Analytics & Engineering',
    issuedAt: '2026-04-10T10:00:00Z',
    certificateId: 'CERT-2026-0002',
    isIssued: true,
    isRevoked: false,
    instituteName: 'CodeLift Engineering Academy',
    signatoryName: 'Vikram Nair',
    signatoryTitle: 'Director, CodeLift Academy',
    certTitle: 'CERTIFICATE OF COMPLETION',
    design: DEFAULT_CERTIFICATE_TEMPLATES[0].design
  },
  {
    id: 'cert-003',
    studentId: 'std-002',
    studentName: 'Ananya Verma',
    courseName: 'Full Stack Web Development',
    issuedAt: '2026-04-15T10:00:00Z',
    certificateId: 'CERT-2026-0003',
    isIssued: true,
    isRevoked: false,
    instituteName: 'CodeLift Engineering Academy',
    signatoryName: 'Vikram Nair',
    signatoryTitle: 'Director, CodeLift Academy',
    certTitle: 'CERTIFICATE OF COMPLETION',
    design: DEFAULT_CERTIFICATE_TEMPLATES[0].design
  }
];

// ── ACTIVITIES ────────────────────────────────────────────────────────────────
export const SEED_ACTIVITIES = [
  { id: 'act-001', type: 'student_added', message: 'New student Rahul Sharma enrolled in Full Stack Web Dev (Morning)', createdAt: '2026-01-15T10:30:00Z' },
  { id: 'act-002', type: 'fee_recorded', message: 'Fee of ₹3000 recorded for Rahul Sharma (UPI)', createdAt: '2026-01-15T12:00:00Z' },
  { id: 'act-003', type: 'student_added', message: 'New student Divya Nair enrolled in Data Analytics (Weekend)', createdAt: '2026-02-01T10:00:00Z' },
  { id: 'act-004', type: 'test_created', message: 'Test "JavaScript Fundamentals" created and assigned to 2 batches', createdAt: '2026-02-10T10:00:00Z' },
  { id: 'act-005', type: 'fee_recorded', message: 'Fee of ₹35,000 recorded for Divya Nair (Bank Transfer)', createdAt: '2026-02-01T11:00:00Z' },
  { id: 'act-006', type: 'review_added', message: 'New 5-star review submitted by Rahul Sharma', createdAt: '2026-03-01T10:00:00Z' },
  { id: 'act-007', type: 'test_created', message: 'Test "React Basics" created and assigned to 2 batches', createdAt: '2026-02-15T10:00:00Z' },
  { id: 'act-008', type: 'cert_issued', message: 'Certificate issued to Rahul Sharma – Full Stack Web Development', createdAt: '2026-04-01T10:00:00Z' },
  { id: 'act-009', type: 'review_added', message: 'New 5-star review submitted by Divya Nair', createdAt: '2026-03-05T14:00:00Z' },
  { id: 'act-010', type: 'cert_issued', message: 'Certificate issued to Divya Nair – Data Analytics', createdAt: '2026-04-10T10:00:00Z' }
];

// ── DEFAULT DATA OBJECT ───────────────────────────────────────────────────────
export const defaultData = {
  batches: SEED_BATCHES,
  completedBatches: SEED_COMPLETED_BATCHES,
  students: SEED_STUDENTS,
  fees: SEED_FEES,
  tests: SEED_TESTS,
  testAttempts: SEED_TEST_ATTEMPTS,
  reviews: SEED_REVIEWS,
  courses: SEED_COURSES,
  assignments: SEED_ASSIGNMENTS,
  submissions: SEED_SUBMISSIONS,
  certificates: SEED_CERTIFICATES,
  certificateTemplates: DEFAULT_CERTIFICATE_TEMPLATES,
  activities: SEED_ACTIVITIES
};

