import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// -------------------- 27+ CURRICULUM MODULES & PROJECTS --------------------
const CURRICULUM_DATA = [
  // 1. PYTHON CORE & ADVANCED OOP
  {
    id: 1,
    name: 'Python 3.12 Core & Advanced OOP',
    category: 'python',
    badge: 'popular',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #15803d, #064e3b)',
    price: 4999,
    duration: '40 Hours • 6 Weeks',
    tags: ['Python 3.12', 'OOP', 'Dunder Methods', 'Generators'],
    description: 'Master Python from ground zero to advanced OOP, encapsulation, inheritance, polymorphism, custom decorators, and memory management.',
    topics: [
      'Python Data Model, Mutability & Memory References',
      'Object-Oriented Programming (OOP) & SOLID Principles',
      'Advanced Decorators, Closures & Context Managers',
      'Iterators, Generators, and Yield Expressions',
      'Functional Programming: Lambdas, Maps, and Filters',
      'Unit Testing with pytest and Mocking Patterns'
    ]
  },
  {
    id: 2,
    name: 'Asyncio & Concurrency Engine',
    category: 'python',
    badge: 'new',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    price: 3999,
    duration: '25 Hours • 3 Weeks',
    tags: ['Asyncio', 'Threading', 'Multiprocessing', 'Coroutines'],
    description: 'Build non-blocking high-throughput Python backends with async/await, event loops, tasks, semaphore locks, and parallel worker pools.',
    topics: [
      'Event Loop Internals & Task Scheduling',
      'Coroutines vs Generators vs Threads vs Processes',
      'Async Context Managers & Async Iterators',
      'Concurrent HTTP Scraping & Rate Limiting with aiohttp',
      'Handling Deadlocks and Race Conditions'
    ]
  },
  {
    id: 3,
    name: 'FastAPI High-Performance Web Services',
    category: 'python',
    badge: 'popular',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #059669, #065f46)',
    price: 4499,
    duration: '35 Hours • 4 Weeks',
    tags: ['FastAPI', 'Pydantic V2', 'REST APIs', 'Swagger'],
    description: 'Architect modern enterprise REST APIs with automatic OpenAPI docs, Pydantic V2 data validation, dependency injection, and JWT auth.',
    topics: [
      'Pydantic Schema Serialization & Validation',
      'FastAPI Dependency Injection Architecture',
      'JWT Authentication, Password Hashing & RBAC',
      'Background Tasks, WebSockets & Middleware',
      'Production Deployment with Uvicorn & Gunicorn'
    ]
  },

  // 2. SQL & DATABASE ENGINEERING
  {
    id: 4,
    name: 'Relational Database Design & PostgreSQL',
    category: 'sql',
    badge: 'popular',
    icon: '️',
    bgGradient: 'linear-gradient(135deg, #1e3a8a, #172554)',
    price: 4999,
    duration: '35 Hours • 5 Weeks',
    tags: ['PostgreSQL', 'Normalization', 'Relational Models', 'DDL/DML'],
    description: 'Design robust schemas, master relational algebra, foreign key constraints, 1NF to 3NF normalization, and transaction ACID properties.',
    topics: [
      'Database Schema Normalization (1NF, 2NF, 3NF, BCNF)',
      'Foreign Key Cascades, Triggers, and Constraints',
      'ACID Compliance and Transaction Isolation Levels',
      'PostgreSQL Native Types: JSONB, Arrays, UUIDs',
      'Stored Procedures, Views, and Materialized Views'
    ]
  },
  {
    id: 5,
    name: 'Advanced SQL Mastery & Optimization',
    category: 'sql',
    badge: 'new',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #0d9488, #115e59)',
    price: 4299,
    duration: '30 Hours • 4 Weeks',
    tags: ['Window Functions', 'CTEs', 'EXPLAIN ANALYZE', 'Indexes'],
    description: 'Write complex enterprise queries with Common Table Expressions (CTEs), Window Functions, and optimize slow execution plans with indexing.',
    topics: [
      'Window Functions: RANK, DENSE_RANK, ROW_NUMBER, NTILE',
      'Recursive Common Table Expressions (CTEs)',
      'Subqueries, Correlated Subqueries, and Complex Joins',
      'Index Engineering: B-Tree, Hash, GIN, GiST, BRIN',
      'Query Execution Plans with EXPLAIN (ANALYZE, BUFFERS)'
    ]
  },
  {
    id: 6,
    name: 'SQLAlchemy ORM & Alembic Migrations',
    category: 'sql',
    badge: null,
    icon: '',
    bgGradient: 'linear-gradient(135deg, #374151, #1f2937)',
    price: 3499,
    duration: '20 Hours • 3 Weeks',
    tags: ['SQLAlchemy 2.0', 'Alembic', 'ORM', 'PostgreSQL'],
    description: 'Bridge Python with SQL using modern SQLAlchemy 2.0 declarative models, eager loading strategies, sessions, and automated database migrations.',
    topics: [
      'SQLAlchemy 2.0 Declarative Base & Mapped Columns',
      'Eager vs Lazy Loading: joinedload, selectinload',
      'Complex Filtering, Joins, and Aggregates in Python',
      'Automated Database Migrations with Alembic',
      'Unit of Work and Session Lifecycle Management'
    ]
  },
  {
    id: 7,
    name: 'Redis In-Memory Caching & Pub/Sub',
    category: 'sql',
    badge: null,
    icon: '',
    bgGradient: 'linear-gradient(135deg, #b91c1c, #991b1b)',
    price: 2999,
    duration: '18 Hours • 2 Weeks',
    tags: ['Redis', 'Caching', 'Pub/Sub', 'Rate Limiting'],
    description: 'Drastically accelerate application performance with Redis caching strategies (Cache-Aside, Write-Through), Pub/Sub messaging, and rate limiters.',
    topics: [
      'Redis Data Structures: Strings, Hashes, Lists, Sets, Sorted Sets',
      'Cache Invalidation Strategies & TTL Expirations',
      'Real-time Token Bucket API Rate Limiting',
      'Message Queuing & Publish/Subscribe Patterns'
    ]
  },

  // 3. FRONTEND WEB STACK (HTML, CSS, JAVASCRIPT)
  {
    id: 8,
    name: 'HTML5 Semantic Web & Modern SEO',
    category: 'web',
    badge: null,
    icon: '',
    bgGradient: 'linear-gradient(135deg, #ea580c, #c2410c)',
    price: 2499,
    duration: '18 Hours • 2 Weeks',
    tags: ['HTML5', 'Semantic Tags', 'SEO', 'Accessibility'],
    description: 'Construct clean semantic document trees, master accessible UI components with ARIA roles, modern forms, and search engine optimization.',
    topics: [
      'Semantic Structure: main, article, section, nav, aside',
      'Accessible Form Controls, Validation, and Attributes',
      'OpenGraph Metadata and Search Engine Architecture',
      'HTML5 Multimedia: Audio, Video, and Canvas basics'
    ]
  },
  {
    id: 9,
    name: 'CSS3 Flexbox, CSS Grid & Responsive Systems',
    category: 'web',
    badge: 'popular',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    price: 3499,
    duration: '28 Hours • 3 Weeks',
    tags: ['CSS3', 'Flexbox', 'CSS Grid', 'Glassmorphism'],
    description: 'Design pixel-perfect, responsive layouts across devices without heavy libraries using CSS Flexbox, 2D CSS Grid, transitions, and custom properties.',
    topics: [
      'Flexbox Axes, Alignment, Wrapping, and Dynamic Sizing',
      'Two-Dimensional CSS Grid Layouts & Template Areas',
      'Fluid Typography with clamp() and CSS Custom Properties',
      'CSS Animations, Keyframes, and Transitions',
      'Modern UI Trends: Glassmorphism and Dark Mode Theming'
    ]
  },
  {
    id: 10,
    name: 'Modern JavaScript (ES6+ & Async/Await)',
    category: 'web',
    badge: 'popular',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #ca8a04, #a16207)',
    price: 4499,
    duration: '40 Hours • 5 Weeks',
    tags: ['ES6+', 'Async/Await', 'Promises', 'Closures'],
    description: 'Deep dive into the JavaScript language engine: closures, prototypes, event loops, promises, async/await, modules, and functional programming.',
    topics: [
      'Scope Chains, Closures, and Hoisting Mechanics',
      'Arrow Functions, Destructuring, Rest/Spread Operators',
      'Promises State Machines & Chaining Architecture',
      'Async/Await Syntax & Error Handling Patterns',
      'ES6 Modules (import/export) and Modular Code Organization'
    ]
  },
  {
    id: 11,
    name: 'DOM Manipulation & Interactive Web UI',
    category: 'web',
    badge: null,
    icon: '️',
    bgGradient: 'linear-gradient(135deg, #475569, #334155)',
    price: 3299,
    duration: '22 Hours • 3 Weeks',
    tags: ['DOM API', 'Event Delegation', 'Fetch API', 'LocalStorage'],
    description: 'Build interactive user interfaces: dynamic DOM nodes, event bubbling/delegation, Fetch API for HTTP calls, and browser local-first storage.',
    topics: [
      'DOM Querying, Traversal, and Element Creation',
      'Event Bubbling, Capturing, and Event Delegation',
      'Fetch API, Handling JSON, and Network Error Handling',
      'Browser Persistence: LocalStorage, SessionStorage, Cookies'
    ]
  },
  {
    id: 12,
    name: 'React 18 & State Engine Architecture',
    category: 'web',
    badge: 'new',
    icon: '️',
    bgGradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    price: 4999,
    duration: '40 Hours • 5 Weeks',
    tags: ['React 18', 'Hooks', 'Context API', 'Vite'],
    description: 'Craft single-page applications with React 18, functional components, state hooks, effect lifecycles, and global state management.',
    topics: [
      'Virtual DOM Reconciliation & JSX Compilation',
      'Hooks in Action: useState, useEffect, useRef, useMemo',
      'Global State Management with React Context API',
      'Component Composition and Custom Hook Creation',
      'Production Bundling with Vite & Modern Tooling'
    ]
  },

  // 4. AI INTEGRATION & LLM ENGINEERING
  {
    id: 13,
    name: 'Generative AI & OpenAI / Claude API Suite',
    category: 'ai',
    badge: 'ai',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #6d28d9, #4c1d95)',
    price: 5999,
    duration: '35 Hours • 4 Weeks',
    tags: ['OpenAI API', 'Claude 3.5', 'Function Calling', 'Embeddings'],
    description: 'Connect enterprise applications to state-of-the-art LLMs: streaming text, structured JSON outputs, function calling, and token optimization.',
    topics: [
      'LLM Architecture & Tokenization Deep Dive',
      'Prompt Engineering: Few-Shot, CoT (Chain of Thought)',
      'Structured Outputs with Pydantic and JSON Schema',
      'Function / Tool Calling for External Action Triggers',
      'Streaming Responses to Frontends via Server-Sent Events'
    ]
  },
  {
    id: 14,
    name: 'LangChain & Autonomous Agent Architecture',
    category: 'ai',
    badge: 'ai',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    price: 5499,
    duration: '30 Hours • 4 Weeks',
    tags: ['LangChain', 'AI Agents', 'ReAct Pattern', 'Tool Use'],
    description: 'Build reasoning autonomous agents using LangChain expressions (LCEL), memory systems, multi-step problem solving, and dynamic tool invocation.',
    topics: [
      'LangChain Expression Language (LCEL) & Runnables',
      'Conversation Memory: Buffer, Summary, VectorStore',
      'ReAct Agent Architecture (Reasoning + Acting)',
      'Custom Tools for Database Querying & Web Browsing',
      'Multi-Agent Coordination & Delegation Patterns'
    ]
  },
  {
    id: 15,
    name: 'Vector DBs & Semantic Search with ChromaDB',
    category: 'ai',
    badge: 'ai',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #4338ca, #312e81)',
    price: 4999,
    duration: '25 Hours • 3 Weeks',
    tags: ['Vector DB', 'ChromaDB', 'Embeddings', 'Cosine Sim'],
    description: 'Transform textual information into dense vector embeddings and index them inside vector databases for hyper-fast semantic similarity retrieval.',
    topics: [
      'Vector Embeddings Explained: text-embedding-3-small',
      'Cosine Similarity, Dot Product & Euclidean Distances',
      'Setting up ChromaDB & Pinecone Collections',
      'Metadata Filtering, Hybrid Search, and Index Tuning'
    ]
  },
  {
    id: 16,
    name: 'Retrieval-Augmented Generation (RAG) Mastery',
    category: 'ai',
    badge: 'popular',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #059669, #047857)',
    price: 6499,
    duration: '40 Hours • 5 Weeks',
    tags: ['RAG', 'Chunking', 'Hallucination Checks', 'PDF Q&A'],
    description: 'Engineer production-grade RAG systems that ingest enterprise documents (PDFs, docs, tables) and provide verifiable, cited factual answers.',
    topics: [
      'Document Parsing, Text Cleaning & Chunking Strategies',
      'Dense vs Sparse Retrieval & Context Compression',
      'Re-ranking Search Results with Cohere Rerank',
      'Guardrails, Groundedness Verification & Citations'
    ]
  },
  {
    id: 17,
    name: 'Local LLMs & Privacy-First AI with Ollama',
    category: 'ai',
    badge: 'new',
    icon: '️',
    bgGradient: 'linear-gradient(135deg, #0f766e, #115e59)',
    price: 3999,
    duration: '20 Hours • 2 Weeks',
    tags: ['Ollama', 'Llama 3.2', 'Local Inference', 'Quantization'],
    description: 'Run open-weight models (Llama 3, Mistral, DeepSeek) completely offline on local hardware with zero data leakage and integrate with Python apps.',
    topics: [
      'Ollama CLI Setup, Model Pulling, and Rest APIs',
      'Quantization Basics (GGUF, 4-bit, 8-bit)',
      'Connecting Python Backends to Local Inference Endpoints',
      'Benchmarking Inference Speed & Memory Footprints'
    ]
  },

  // 5. 3+ PRODUCTION CAPSTONE PROJECTS
  {
    id: 18,
    name: 'Capstone 1: AI-Powered E-Commerce Platform',
    category: 'projects',
    badge: 'project',
    icon: '️',
    bgGradient: 'linear-gradient(135deg, #d97706, #b45309)',
    price: 7999,
    duration: '50 Hours • Capstone 1',
    tags: ['FastAPI', 'PostgreSQL', 'HTML/CSS/JS', 'AI Recommendations'],
    description: 'Full stack e-commerce web application featuring user cart management, product catalogs in PostgreSQL, and semantic vector recommendation engines.',
    topics: [
      'FastAPI Backend Architecture with Async PostgreSQL Sessions',
      'Semantic Search Bar using OpenAI Embeddings & pgvector',
      'Interactive Shopping Cart, Checkout & Order Management',
      'Admin Dashboard with Live Inventory & Reconciliations'
    ]
  },
  {
    id: 19,
    name: 'Capstone 2: Natural Language to SQL Analytics Engine',
    category: 'projects',
    badge: 'project',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #b91c1c, #991b1b)',
    price: 7999,
    duration: '45 Hours • Capstone 2',
    tags: ['Text-to-SQL', 'LangChain', 'Streamlit', 'Data Viz'],
    description: 'Transform plain English questions into sanitized, optimized SQL queries, execute them safely on PostgreSQL, and render interactive visual charts.',
    topics: [
      'Dynamic Schema Ingestion & Prompt Injection Guards',
      'Few-Shot Prompting for Complex Multi-Table SQL Joins',
      'Automatic Query Validation & Read-Only Sandbox Execution',
      'Interactive Analytics Dashboards with Plotly & Chart.js'
    ]
  },
  {
    id: 20,
    name: 'Capstone 3: Autonomous Multi-Agent Support & RAG',
    category: 'projects',
    badge: 'project',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #4338ca, #3730a3)',
    price: 8999,
    duration: '55 Hours • Capstone 3',
    tags: ['Multi-Agent', 'ChromaDB', 'FastAPI', 'React UI'],
    description: 'Enterprise AI knowledgebase with autonomous customer support agents capable of document lookup, ticket filing, and human agent handoff.',
    topics: [
      'Multi-Format Document Ingestion Engine (PDFs, Markdown, FAQs)',
      'Vector Embedding Storage in ChromaDB with Hybrid Search',
      'ReAct Autonomous Agent with Dynamic Tool Calling',
      'Real-Time Chat Interface with Streaming WebSocket Tokens'
    ]
  },
  {
    id: 21,
    name: 'Capstone 4: Full-Stack Microservices SaaS Platform',
    category: 'projects',
    badge: 'project',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #059669, #065f46)',
    price: 8499,
    duration: '50 Hours • Bonus Capstone',
    tags: ['Microservices', 'Docker', 'Redis', 'Stripe Auth'],
    description: 'Production-ready subscription SaaS platform complete with user authentication, Stripe payment billing, Redis task queuing, and Docker deployment.',
    topics: [
      'Microservice Separation: Auth, Billing, and Core Workflows',
      'Stripe Webhooks & Subscription Lifecycle Handling',
      'Asynchronous Background Tasks with Celery and Redis',
      'Docker Compose Multi-Container Orchestration'
    ]
  },

  // 6. CAREER, DEVOPS & PLACEMENT PREP
  {
    id: 22,
    name: 'Git, GitHub & Production Team Workflows',
    category: 'career',
    badge: null,
    icon: '',
    bgGradient: 'linear-gradient(135deg, #334155, #1e293b)',
    price: 2499,
    duration: '15 Hours • 2 Weeks',
    tags: ['Git', 'GitHub', 'Pull Requests', 'CI/CD Actions'],
    description: 'Collaborate like a senior engineer: trunk-based development, feature branching, interactive rebasing, merge conflict resolution, and GitHub Actions.',
    topics: [
      'Git Internals: Trees, Blobs, Commits, and References',
      'Branching Strategies: GitFlow vs Trunk-Based Development',
      'Interactive Rebasing, Cherry-Picking, and Squash Commits',
      'Automated Testing Pipelines with GitHub Actions'
    ]
  },
  {
    id: 23,
    name: 'Docker Containers & Cloud Deployment',
    category: 'career',
    badge: 'popular',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    price: 3999,
    duration: '25 Hours • 3 Weeks',
    tags: ['Docker', 'Multi-Stage', 'AWS', 'Linux Server'],
    description: 'Containerize Python backends, databases, and frontends with multi-stage Dockerfiles and deploy onto cloud virtual machines with HTTPS and Nginx.',
    topics: [
      'Docker Core Architecture, Images, and Layer Caching',
      'Writing Optimized Multi-Stage Dockerfiles for Python',
      'Docker Compose Orchestration for Multi-Tier Stacks',
      'Nginx Reverse Proxying, SSL Certificates & Domain Setup'
    ]
  },
  {
    id: 24,
    name: 'Full Stack Python & AI Interview Mastery',
    category: 'career',
    badge: 'new',
    icon: '',
    bgGradient: 'linear-gradient(135deg, #15803d, #14532d)',
    price: 4499,
    duration: '30 Hours • 4 Weeks',
    tags: ['Mock Interviews', 'System Design', 'DSA', 'Portfolio'],
    description: 'Ace technical screenings with live coding mock interviews, Data Structures & Algorithms in Python, system design architecture, and resume audits.',
    topics: [
      'Data Structures & Algorithms in Python (Arrays, Trees, Graphs)',
      'System Design for Scalable Web Applications',
      'Behavioral Interview Strategies & STAR Method',
      'GitHub Portfolio Curation & Technical Resume Review'
    ]
  }
];

export default function LandingPage() {
  const navigate = useNavigate();

  // -------------------- STATE --------------------
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('codelift_syllabus_cart');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('codelift_landing_theme') === 'dark';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedModuleForDetails, setSelectedModuleForDetails] = useState(null);

  // Form states for Checkout
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custBatch, setCustBatch] = useState('Morning Cohort (Full Stack)');
  const [checkoutError, setCheckoutError] = useState('');

  // Toast state
  const [toastText, setToastText] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  // Carousel state
  const [slideIndex, setSlideIndex] = useState(0);
  const autoSlideRef = useRef(null);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('codelift_syllabus_cart', JSON.stringify(cart));
    } catch (e) { }
  }, [cart]);

  // Save theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('codelift_landing_theme', isDarkTheme ? 'dark' : 'light');
    } catch (e) { }
  }, [isDarkTheme]);

  // Carousel timer setup
  const startSlideTimer = () => {
    stopSlideTimer();
    autoSlideRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % 3);
    }, 3600);
  };

  const stopSlideTimer = () => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
  };

  useEffect(() => {
    startSlideTimer();
    return () => stopSlideTimer();
  }, []);

  // Show Toast helper
  const showToast = (msg) => {
    setToastText(msg);
    setIsToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setIsToastVisible(false);
    }, 2400);
  };

  // Add to cart with floating particle
  const handleAddToCart = (id, event) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));

    // Trigger floating +1 effect at click location
    if (event && event.clientX) {
      const floatEl = document.createElement('div');
      floatEl.className = 'float-plus';
      floatEl.innerText = ' +1 Added';
      floatEl.style.left = `${event.clientX - 20}px`;
      floatEl.style.top = `${event.clientY - 20}px`;
      document.body.appendChild(floatEl);
      setTimeout(() => floatEl.remove(), 950);
    }

    // Trigger cart bounce
    const cartBtn = document.getElementById('landingCartBtn');
    if (cartBtn) {
      cartBtn.classList.remove('cart-bounce');
      void cartBtn.offsetWidth;
      cartBtn.classList.add('cart-bounce');
    }

    const item = CURRICULUM_DATA.find((c) => c.id === id);
    showToast(` ${item?.name || 'Track'} added to your syllabus!`);
  };

  const changeQty = (id, delta) => {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[id] || 0;
      const updated = current + delta;
      if (updated <= 0) {
        delete next[id];
      } else {
        next[id] = updated;
      }
      return next;
    });
  };

  // Filtered modules
  const filteredModules = CURRICULUM_DATA.filter((item) => {
    const matchCat = currentCategory === 'all' || item.category === currentCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const totalItems = filteredModules.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIdx = (validPage - 1) * itemsPerPage;
  const displayedItems = filteredModules.slice(startIdx, startIdx + itemsPerPage);

  // Cart total counts
  const totalCartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const grandTotalFee = Object.keys(cart).reduce((sum, id) => {
    const item = CURRICULUM_DATA.find((c) => c.id === parseInt(id));
    return sum + (item ? item.price * cart[id] : 0);
  }, 0);

  // Confirm Application / Order
  const handleConfirmOrder = () => {
    if (!custName.trim() || !custMobile.trim() || !custEmail.trim()) {
      setCheckoutError('️ Please fill in your name, mobile, and email address.');
      return;
    }

    if (!/^[0-9]{10,15}$/.test(custMobile.trim())) {
      setCheckoutError('️ Please enter a valid 10-digit mobile number.');
      return;
    }

    setCheckoutError('');
    setIsCheckoutOpen(false);

    const enrollmentId = `CL-${Date.now().toString().slice(-5)}`;
    const enrollmentRecord = {
      id: enrollmentId,
      date: new Date().toLocaleDateString(),
      name: custName,
      mobile: custMobile,
      email: custEmail,
      batch: custBatch,
      total: grandTotalFee,
      items: Object.keys(cart).map((id) => {
        const item = CURRICULUM_DATA.find((c) => c.id === parseInt(id));
        return { name: item?.name, price: item?.price, qty: cart[id] };
      })
    };

    // Show confirmation
    alert(
      ` Application Confirmed! (Ref #${enrollmentId})\n\nStudent: ${custName}\nSelected Tracks: ${totalCartCount}\nTotal Fees: ₹${grandTotalFee.toLocaleString()}\nCohort: ${custBatch}\n\nOur admissions team will contact you shortly!`
    );

    // WhatsApp Message
    const WHATSAPP_PHONE = '917796895137';
    let msg = `Hello CodeLift Admissions,\n\n`;
    msg += `I am submitting an enrollment application for CodeLift cohorts:\n\n`;
    msg += `Reference ID: #${enrollmentId}\n`;
    msg += `Applicant Name: ${custName}\n`;
    msg += `Contact Phone: ${custMobile}\n`;
    msg += `Email Address: ${custEmail}\n`;
    msg += `Preferred Cohort: ${custBatch}\n\n`;
    msg += `Selected Curriculum Tracks:\n`;
    Object.keys(cart).forEach((id) => {
      const item = CURRICULUM_DATA.find((c) => c.id === parseInt(id));
      if (item) msg += `- ${item.name} (x${cart[id]}) - Rs. ${item.price}\n`;
    });
    msg += `\nTotal Fees: Rs. ${grandTotalFee.toLocaleString()}\n\n`;
    msg += `Please provide the onboarding schedule and verification steps.\n\nThank you.`;

    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');

    // Clear cart
    setCart({});
    setIsCartOpen(false);
  };

  return (
    <div className={`landing-wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
      {/* -------------------- TOAST NOTIFICATION -------------------- */}
      <div
        id="toast"
        className={isToastVisible ? 'show' : ''}
        style={{
          visibility: isToastVisible ? 'visible' : 'hidden',
          opacity: isToastVisible ? 1 : 0,
          transform: isToastVisible ? 'translateY(0)' : 'translateY(20px)'
        }}
      >
        <span>{toastText}</span>
      </div>

      {/* -------------------- HEADER -------------------- */}
      <header className="landing-header">
        <Link to="/" className="logo">
          Code<span>Lift</span>
          <small style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginLeft: '6px' }}>
            Full Stack Python • SQL • AI
          </small>
        </Link>

        <div className="landing-header-actions">
          {/* Live Search */}
          <input
            type="text"
            className="landing-search-box"
            placeholder=" Search Python, SQL, React, AI..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          {/* Theme Toggle Button */}
          <button
            className="landing-theme-toggle"
            title="Toggle Light / Dark Mode"
            onClick={() => setIsDarkTheme(!isDarkTheme)}
          >
            {isDarkTheme ? '️' : ''}
          </button>

          {/* Syllabus Bag / Cart Button */}
          <button
            id="landingCartBtn"
            className="landing-cart-btn"
            onClick={() => setIsCartOpen(true)}
          >
            Syllabus Bag <span className="cart-count">{totalCartCount}</span>
          </button>

          {/* Login Button that navigates to /login */}
          <Link to="/login" className="landing-login-nav-btn" title="Open Admin Portal">
            Login
          </Link>
        </div>
      </header>

      {/* -------------------- HERO CAROUSEL -------------------- */}
      <div
        className="landing-carousel-container"
        onMouseEnter={stopSlideTimer}
        onMouseLeave={startSlideTimer}
      >
        <div
          className="landing-carousel-slide"
          style={{ transform: `translateX(-${slideIndex * 33.333}%)` }}
        >
          {/* Slide 1 */}
          <div className="landing-carousel-item slide-1">
            <span> Full Stack Python & Advanced OOP Engine</span>
            <small>
              From core syntax to decorators, asyncio concurrency, and enterprise FastAPI microservices.
            </small>
          </div>

          {/* Slide 2 */}
          <div className="landing-carousel-item slide-2">
            <span> Modern Frontend (HTML/CSS/JS/React) & SQL Databases</span>
            <small>
              Architect responsive user interfaces and pair them with production PostgreSQL schema models.
            </small>
          </div>

          {/* Slide 3 */}
          <div className="landing-carousel-item slide-3">
            <span> Generative AI, LLM Agents & 3+ Industry Capstone Projects</span>
            <small>
              Build RAG pipelines with LangChain, ChromaDB vector stores, and ship 3 production-grade portfolio apps.
            </small>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="landing-carousel-dots">
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              className={slideIndex === idx ? 'active' : ''}
              onClick={() => setSlideIndex(idx)}
            />
          ))}
        </div>
      </div>

      {/* -------------------- CATEGORY FILTER PILLS -------------------- */}
      <div className="landing-category-bar">
        {[
          { id: 'all', label: 'All Curriculum' },
          { id: 'python', label: ' Python & OOP' },
          { id: 'sql', label: '️ SQL & Databases' },
          { id: 'web', label: ' Web (HTML/CSS/JS)' },
          { id: 'ai', label: ' AI & LLM Systems' },
          { id: 'projects', label: ' 3+ Capstone Projects' },
          { id: 'career', label: ' DevOps & Career Prep' }
        ].map((cat) => (
          <button
            key={cat.id}
            className={currentCategory === cat.id ? 'active' : ''}
            onClick={() => {
              setCurrentCategory(cat.id);
              setCurrentPage(1);
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* -------------------- CURRICULUM & PROJECTS GRID -------------------- */}
      <div className="landing-product-grid">
        {displayedItems.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--lp-text-secondary)' }}>
            <h4>No modules found matching "{searchQuery}"</h4>
            <p className="small">Try searching for Python, SQL, AI, React, or reset category filter.</p>
          </div>
        ) : (
          displayedItems.map((item) => (
            <div className="landing-product-card" key={item.id}>
              {/* Corner Badge */}
              {item.badge && (
                <span className={`badge-corner ${item.badge}`}>
                  {item.badge === 'popular' && ' Popular'}
                  {item.badge === 'new' && ' High Demand'}
                  {item.badge === 'ai' && ' AI Powered'}
                  {item.badge === 'project' && '⭐ Capstone Project'}
                </span>
              )}

              {/* Graphic Banner */}
              <div className="landing-card-header-art" style={{ background: item.bgGradient }}>
                <span>{item.icon}</span>
              </div>

              {/* Title & Description */}
              <div>
                <h3>{item.name}</h3>
                <p className="description">{item.description}</p>

                {/* Tech Tags */}
                <div className="landing-tags">
                  {item.tags.map((t, idx) => (
                    <span className="landing-tag" key={idx}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing & Duration */}
              <div>
                <div className="landing-pricing-row">
                  <div className="price">₹{item.price.toLocaleString()}</div>
                  <div className="duration">{item.duration}</div>
                </div>

                {/* Actions */}
                <div className="landing-card-actions">
                  <button
                    className="landing-add-btn"
                    onClick={(e) => handleAddToCart(item.id, e)}
                  >
                    <span> Add to Syllabus</span>
                  </button>
                  <button
                    className="landing-detail-btn"
                    onClick={() => setSelectedModuleForDetails(item)}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* -------------------- PAGINATION -------------------- */}
      {totalPages > 1 && (
        <div className="landing-pagination">
          <button
            disabled={validPage <= 1}
            onClick={() => {
              setCurrentPage((p) => p - 1);
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
          >
            ◀ Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              className={validPage === i + 1 ? 'active' : ''}
              onClick={() => {
                setCurrentPage(i + 1);
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={validPage >= totalPages}
            onClick={() => {
              setCurrentPage((p) => p + 1);
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
          >
            Next ▶
          </button>
          <span className="page-info">
            Page {validPage} of {totalPages}
          </span>
        </div>
      )}

      {/* -------------------- SYLLABUS CART DRAWER (SIDEBAR) -------------------- */}
      <div
        className={`landing-cart-overlay ${isCartOpen ? 'active' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsCartOpen(false);
        }}
      >
        <div className="landing-cart-panel">
          <h2>
            <span> Selected Learning Path</span>
            <button className="landing-close-cart" onClick={() => setIsCartOpen(false)}>
              &times;
            </button>
          </h2>

          <div className="landing-cart-items">
            {totalCartCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--lp-text-secondary)' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}></div>
                <h5>Your learning path is empty</h5>
                <p className="small">Add modules from the curriculum above to build your customized training track.</p>
              </div>
            ) : (
              Object.keys(cart).map((id) => {
                const item = CURRICULUM_DATA.find((c) => c.id === parseInt(id));
                if (!item) return null;
                const qty = cart[id];
                const subtotal = item.price * qty;

                return (
                  <div className="landing-cart-item" key={id}>
                    <div className="item-info">
                      <strong>{item.name}</strong>
                      <div>
                        ₹{item.price.toLocaleString()} x {qty} = ₹{subtotal.toLocaleString()}
                      </div>
                    </div>
                    <div className="item-qty">
                      <button onClick={() => changeQty(parseInt(id), -1)}>−</button>
                      <span style={{ fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>{qty}</span>
                      <button onClick={() => changeQty(parseInt(id), 1)}>+</button>
                      <button
                        className="remove-item"
                        title="Remove track"
                        onClick={() => changeQty(parseInt(id), -100)}
                      >

                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalCartCount > 0 && (
            <div>
              <div className="landing-total-row">
                <span>Tuition Total</span>
                <span>₹{grandTotalFee.toLocaleString()}</span>
              </div>
              <button
                className="landing-checkout-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
              >
                Apply for Cohort & Send via WhatsApp
              </button>
              <p style={{ fontSize: '12px', color: 'var(--lp-text-secondary)', marginTop: '10px', textAlign: 'center' }}>
                * Dedicated live mentorship, doubt clearing sessions & placement support included.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* -------------------- ENROLLMENT / CHECKOUT MODAL -------------------- */}
      <div className={`landing-modal-overlay ${isCheckoutOpen ? 'active' : ''}`}>
        <div className="landing-modal-box">
          <h2> Student Enrollment Application</h2>
          <p style={{ color: 'var(--lp-text-secondary)', marginBottom: '18px', textAlign: 'center', fontSize: '14px' }}>
            Fill in your contact details to enroll in the selected modules and receive the cohort starter kit.
          </p>

          <label>Full Name *</label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={custName}
            onChange={(e) => setCustName(e.target.value)}
          />

          <label>Mobile Number (WhatsApp) *</label>
          <input
            type="tel"
            placeholder="e.g. 9876543210"
            value={custMobile}
            onChange={(e) => setCustMobile(e.target.value)}
          />

          <label>Email Address *</label>
          <input
            type="email"
            placeholder="e.g. rahul.sharma@example.com"
            value={custEmail}
            onChange={(e) => setCustEmail(e.target.value)}
          />

          <label>Preferred Cohort Timing</label>
          <select value={custBatch} onChange={(e) => setCustBatch(e.target.value)}>
            <option value="Morning Cohort (Full Stack)">Full Stack Morning Batch (8:00 AM - 10:00 AM)</option>
            <option value="Evening Cohort (Python & AI)">Evening Cohort (6:30 PM - 8:30 PM)</option>
            <option value="Weekend Intensive Track">Weekend Intensive (Sat & Sun)</option>
          </select>

          {checkoutError && (
            <div style={{ color: '#e76f51', fontWeight: 600, fontSize: '13px', marginBottom: '14px', textAlign: 'center' }}>
              {checkoutError}
            </div>
          )}

          <div className="btn-group">
            <button className="btn-confirm" onClick={handleConfirmOrder}>
              Submit & WhatsApp Us
            </button>
            <button className="btn-cancel" onClick={() => setIsCheckoutOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* -------------------- SYLLABUS DETAILS MODAL -------------------- */}
      {selectedModuleForDetails && (
        <div className="landing-modal-overlay active">
          <div className="landing-modal-box">
            <h2>
              <span>{selectedModuleForDetails.icon}</span> {selectedModuleForDetails.name}
            </h2>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
              <span className="landing-tag" style={{ background: 'var(--lp-accent-green)', color: '#fff' }}>
                {selectedModuleForDetails.duration}
              </span>
              <span className="landing-tag">
                Fees: ₹{selectedModuleForDetails.price.toLocaleString()}
              </span>
            </div>

            <p style={{ color: 'var(--lp-text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              {selectedModuleForDetails.description}
            </p>

            <h5 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--lp-text-primary)', marginBottom: '10px' }}>
              Detailed Syllabus Curriculum Topics:
            </h5>

            <ul style={{ paddingLeft: '20px', color: 'var(--lp-text-secondary)', fontSize: '14px', lineHeight: 1.8 }}>
              {selectedModuleForDetails.topics?.map((topic, idx) => (
                <li key={idx}>
                  <strong style={{ color: 'var(--lp-text-primary)' }}>Unit {idx + 1}:</strong> {topic}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
              <button
                className="btn-confirm"
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                onClick={(e) => {
                  handleAddToCart(selectedModuleForDetails.id, e);
                  setSelectedModuleForDetails(null);
                }}
              >
                Add to Syllabus
              </button>
              <button
                className="btn-cancel"
                style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setSelectedModuleForDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- FOOTER -------------------- */}
      <footer className="landing-footer">
        <div>
          <h4>
            Code<span style={{ color: 'var(--bs-primary, #15803D)' }}>Li</span>ft Engineering Academy
          </h4>
          <p> Sector 62, Knowledge Park III, Tech Hub</p>
          <p> +91 7796895137 • admissions@codelift.dev</p>
          <p style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
            © {new Date().getFullYear()} Code<span style={{ color: 'var(--bs-primary, #15803D)' }}>Li</span>ft Platform. Full Stack Python, SQL, Web & Generative AI.
          </p>
        </div>

        <div>
          <h4>Follow Our Open-Source Community</h4>
          <div className="socials">
            <span title="GitHub"></span>
            <span title="Discord"></span>
            <span title="Twitter/X"></span>
            <span title="YouTube"></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
