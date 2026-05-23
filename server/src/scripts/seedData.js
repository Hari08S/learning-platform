// server/src/scripts/seedData.js
// Run once: node src/scripts/seedData.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Course = require('../models/Course');
const Internship = require('../models/Internship');

// ─────────── COURSES DATA ───────────
const courses = [
  {
    legacyId: 1,
    title: "React for Beginners: The Complete Guide",
    author: "Priya Sharma",
    hours: "25h",
    students: 12500,
    level: "Beginner",
    price: 99,
    priceNumber: 99,
    img: "/course1.jpeg",
    tag: "tech",
    rating: 4.9,
    isPublished: true,
    description: "Master the fundamentals of React and build modern, fast, and scalable web applications from scratch. Includes hands-on projects and best practices.",
    includes: ["25 hours of video lectures", "Downloadable code examples", "Small projects & quizzes", "Certificate of completion"],
    instructor: { name: "Priya Sharma", bio: "Priya is a senior front-end engineer who has built large scale React apps for enterprise and startups.", rating: 4.9, students: 12500, courses: 8 },
    curriculum: [
      { id: 1, title: "Introduction to React", mins: 8, preview: true, type: "text", content: "<h2>What is React?</h2><p>React is a JavaScript library for building user interfaces.</p>" },
      { id: 2, title: "JSX & Rendering", mins: 8, preview: true, type: "text", content: "<h2>Understanding JSX</h2><p>JSX stands for JavaScript XML.</p>" },
      { id: 3, title: "State & Props", mins: 10, preview: false, type: "text", content: "<h2>Props and State</h2><p>Props are read-only inputs, state is mutable.</p>" },
      { id: 4, title: "Hooks: useState & useEffect", mins: 10, preview: false, type: "text", content: "<h2>React Hooks</h2><p>Hooks let you use React features in functional components.</p>" },
      { id: 5, title: "Routing with React Router", mins: 8, preview: false, type: "text", content: "<h2>Client-Side Routing</h2><p>React Router handles navigation in SPAs.</p>" },
      { id: 6, title: "Building a Todo App", mins: 10, preview: false, type: "text", content: "<h2>Project: Build a Todo App</h2><p>Apply everything you've learned.</p>" },
    ],
  },
  {
    legacyId: 2,
    title: "Digital Marketing Mastery",
    author: "Rahul Kapoor",
    hours: "40h",
    students: 21300,
    level: "Intermediate",
    price: 99,
    priceNumber: 99,
    img: "/course2.webp",
    tag: "marketing",
    rating: 4.8,
    isPublished: true,
    description: "Learn complete digital marketing including SEO, SEM, social media marketing, email marketing, and content strategy to grow any business online.",
    includes: ["40 hours of video content", "Downloadable marketing templates", "Campaign walkthroughs", "Certificate of completion"],
    instructor: { name: "Rahul Kapoor", bio: "Rahul is a growth marketer who scaled multiple e-commerce and SaaS startups using data-driven marketing.", rating: 4.8, students: 21300, courses: 12 },
    curriculum: [
      { id: 1, title: "Marketing Fundamentals", mins: 8, preview: true, type: "text", content: "<h2>What is Digital Marketing?</h2><p>Digital marketing is the promotion of products via electronic media.</p>" },
      { id: 2, title: "Market Research & Target Audience", mins: 8, preview: true, type: "text", content: "<h2>Understanding Your Audience</h2><p>Effective marketing starts with knowing who you're talking to.</p>" },
      { id: 3, title: "SEO Basics", mins: 10, preview: false, type: "text", content: "<h2>Search Engine Optimization</h2><p>SEO is the practice of optimizing your website to rank higher.</p>" },
      { id: 4, title: "Content Marketing Strategies", mins: 10, preview: false, type: "text", content: "<h2>Content Marketing</h2><p>Creating valuable content to attract your target audience.</p>" },
      { id: 5, title: "Social Media Marketing", mins: 8, preview: false, type: "text", content: "<h2>Organic Social Media Growth</h2><p>Build community and drive engagement on social platforms.</p>" },
      { id: 6, title: "Paid Advertising", mins: 10, preview: false, type: "text", content: "<h2>Paid Digital Advertising</h2><p>Paid ads accelerate growth instantly.</p>" },
      { id: 7, title: "Email Marketing Funnels", mins: 8, preview: false, type: "text", content: "<h2>Email Marketing</h2><p>Email marketing has the highest ROI of any digital channel.</p>" },
      { id: 8, title: "Analytics & Measuring ROI", mins: 8, preview: false, type: "text", content: "<h2>Marketing Analytics</h2><p>Data-driven marketing is the difference between guessing and growing.</p>" },
    ],
  },
  {
    legacyId: 3,
    title: "UI/UX Design Fundamentals",
    author: "Ananya Desai",
    hours: "30h",
    students: 18450,
    level: "Beginner",
    price: 99,
    priceNumber: 99,
    img: "/course3.png",
    tag: "design",
    rating: 4.9,
    isPublished: true,
    description: "A comprehensive guide to UI/UX design, from user research and wireframing to creating beautiful, high-fidelity interfaces.",
    includes: ["30 hours of lessons", "Design templates & Figma files", "Wireframing and prototyping exercises", "Certificate of completion"],
    instructor: { name: "Ananya Desai", bio: "Ananya is a product designer with 10+ years experience designing consumer and B2B apps.", rating: 4.9, students: 18450, courses: 9 },
    curriculum: [
      { id: 1, title: "Design Fundamentals & Principles", mins: 8, preview: true, type: "text", content: "<h2>Core Design Principles</h2><p>Great design follows proven principles.</p>" },
      { id: 2, title: "Intro to UX Research", mins: 8, preview: true, type: "text", content: "<h2>What is UX Research?</h2><p>Systematic study of users to understand their needs.</p>" },
      { id: 3, title: "User Personas & Journey Maps", mins: 8, preview: false, type: "text", content: "<h2>Building User Personas</h2><p>Personas represent key user segments.</p>" },
      { id: 4, title: "Information Architecture", mins: 8, preview: false, type: "text", content: "<h2>Structuring Information</h2><p>IA is the practice of organizing content intuitively.</p>" },
      { id: 5, title: "Wireframing & Prototyping", mins: 10, preview: false, type: "text", content: "<h2>From Sketch to Prototype</h2><p>Wireframes are low-fidelity blueprints.</p>" },
      { id: 6, title: "Visual Design & Typography", mins: 8, preview: false, type: "text", content: "<h2>Visual Design Essentials</h2><p>Where aesthetics meet function.</p>" },
      { id: 7, title: "Design Systems", mins: 8, preview: false, type: "text", content: "<h2>What is a Design System?</h2><p>Reusable components and design tokens.</p>" },
      { id: 8, title: "Final Project: App Prototype", mins: 10, preview: false, type: "text", content: "<h2>Project: Design a Mobile App</h2><p>Apply everything to design a complete prototype.</p>" },
    ],
  },
  {
    legacyId: 4,
    title: "Startup Finance: From Seed to Scale",
    author: "Vikram Mehta",
    hours: "20h",
    students: 8900,
    level: "Advanced",
    price: 99,
    priceNumber: 99,
    img: "/course4.png",
    tag: "finance",
    rating: 4.7,
    isPublished: true,
    description: "Learn how to manage finances, create financial models, and secure funding for your startup.",
    includes: ["20 hours of video lectures", "Financial model templates", "Investor pitch examples", "Certificate of completion"],
    instructor: { name: "Vikram Mehta", bio: "Vikram is a CFO-advisor who has helped early-stage startups raise seed and Series A rounds.", rating: 4.7, students: 8900, courses: 6 },
    curriculum: [
      { id: 1, title: "Startup Finance Basics", mins: 8, preview: true, type: "text", content: "<h2>Introduction to Startup Finance</h2><p>Understanding finance is critical for any founder.</p>" },
      { id: 2, title: "Financial Statements 101", mins: 10, preview: true, type: "text", content: "<h2>Reading Financial Statements</h2><p>Every business has three core financial statements.</p>" },
      { id: 3, title: "Forecasting & Unit Economics", mins: 10, preview: false, type: "text", content: "<h2>Unit Economics</h2><p>Measure profitability of a single unit of your business.</p>" },
      { id: 4, title: "Budgeting & Runway Management", mins: 8, preview: false, type: "text", content: "<h2>Managing Your Startup's Money</h2><p>Most startups die from running out of cash.</p>" },
      { id: 5, title: "Valuation Methods", mins: 10, preview: false, type: "text", content: "<h2>How Startups Are Valued</h2><p>Startup valuation is more art than science at early stages.</p>" },
      { id: 6, title: "Raising Capital", mins: 10, preview: false, type: "text", content: "<h2>The Fundraising Process</h2><p>Raising capital is a structured process.</p>" },
      { id: 7, title: "Pitching to Investors", mins: 8, preview: false, type: "text", content: "<h2>The Perfect Pitch Deck</h2><p>A 10-12 slide presentation that tells a compelling story.</p>" },
    ],
  },
  {
    legacyId: 5,
    title: "Complete React Developer Course",
    author: "Sarah Johnson",
    hours: "42h",
    students: 15420,
    level: "Beginner",
    price: 99,
    priceNumber: 99,
    img: "/course5.jpg",
    tag: "tech",
    rating: 4.9,
    isPublished: true,
    description: "Master React from basics to advanced concepts including hooks, context, and testing. Build real-world apps and portfolio projects.",
    includes: ["42 hours of hands-on tutorials", "Projects & assignments", "Test-driven development lessons", "Certificate of completion"],
    instructor: { name: "Sarah Johnson", bio: "Sarah is a senior React engineer and trainer who previously led front-end teams at a SaaS company.", rating: 4.9, students: 15420, courses: 10 },
    curriculum: [
      { id: 1, title: "React Basics Refresher", mins: 8, preview: true, type: "text", content: "<h2>React 18 Core Concepts</h2><p>Essential building blocks for advanced topics.</p>" },
      { id: 2, title: "State Management with Context", mins: 10, preview: true, type: "text", content: "<h2>The Context API</h2><p>Share values between components without prop drilling.</p>" },
      { id: 3, title: "Advanced Hooks", mins: 10, preview: false, type: "text", content: "<h2>Beyond useState and useEffect</h2><p>useMemo, useCallback, useRef, useReducer.</p>" },
      { id: 4, title: "Routing and Navigation", mins: 8, preview: false, type: "text", content: "<h2>Advanced Routing Patterns</h2><p>Lazy loading, protected routes, nested routes.</p>" },
      { id: 5, title: "Performance Optimization", mins: 10, preview: false, type: "text", content: "<h2>Making React Apps Fast</h2><p>Performance optimization is about doing less work.</p>" },
      { id: 6, title: "Global State (Zustand/Redux)", mins: 10, preview: false, type: "text", content: "<h2>Global State Management</h2><p>For large apps, you need shared state across many components.</p>" },
      { id: 7, title: "Testing React Apps", mins: 10, preview: false, type: "text", content: "<h2>Testing in React</h2><p>Testing gives you confidence your code works.</p>" },
      { id: 8, title: "Deploying to Production", mins: 8, preview: false, type: "text", content: "<h2>Deployment & DevOps for React</h2><p>Getting your app from localhost to the real world.</p>" },
    ],
  },
  {
    legacyId: 6,
    title: "Personal Finance Mastery",
    author: "Neha Agrawal",
    hours: "28h",
    students: 5430,
    level: "Beginner",
    price: 99,
    priceNumber: 99,
    img: "/course6.jpg",
    tag: "finance",
    rating: 4.6,
    isPublished: true,
    description: "Master personal finance, investing, tax planning, and wealth building. Secure your financial future with practical lessons.",
    includes: ["28 hours of lessons", "Budget templates", "Investment strategy guides", "Certificate of completion"],
    instructor: { name: "Neha Agrawal", bio: "Neha is a certified financial planner who helps people build saving & investment plans.", rating: 4.6, students: 5430, courses: 5 },
    curriculum: [
      { id: 1, title: "Financial Goal Setting", mins: 8, preview: true, type: "text", content: "<h2>Setting SMART Financial Goals</h2><p>SMART framework turns vague wishes into actionable plans.</p>" },
      { id: 2, title: "Budgeting & Saving", mins: 8, preview: true, type: "text", content: "<h2>Mastering Your Budget</h2><p>A budget gives every rupee a purpose.</p>" },
      { id: 3, title: "Debt Management", mins: 8, preview: false, type: "text", content: "<h2>Getting Out of Debt</h2><p>Not all debt is bad. Credit card debt at 36% destroys wealth.</p>" },
      { id: 4, title: "Investing Basics", mins: 10, preview: false, type: "text", content: "<h2>The Power of Investing</h2><p>Saving keeps your money safe. Investing makes it grow.</p>" },
      { id: 5, title: "Stock Market Fundamentals", mins: 10, preview: false, type: "text", content: "<h2>Understanding the Stock Market</h2><p>The stock market lets you buy ownership in companies.</p>" },
      { id: 6, title: "Mutual Funds & Real Estate", mins: 10, preview: false, type: "text", content: "<h2>Mutual Funds</h2><p>Pools money from many investors into a diversified portfolio.</p>" },
      { id: 7, title: "Tax Planning", mins: 8, preview: false, type: "text", content: "<h2>Smart Tax Planning</h2><p>Tax planning is legal. Tax evasion is not.</p>" },
      { id: 8, title: "Retirement Planning", mins: 8, preview: false, type: "text", content: "<h2>Planning for Financial Freedom</h2><p>Retirement planning is about freedom to choose.</p>" },
    ],
  },
];

// ─────────── INTERNSHIPS DATA ───────────
const internships = [
  {
    title: "Frontend Developer Intern",
    company: "TechNova Solutions",
    domain: "tech",
    description: "Work on real-world React projects. Build responsive UIs and collaborate with senior engineers on production codebases.",
    duration: "3 months",
    mode: "Remote",
    stipend: "₹8,000/month",
    fee: 0,
    seats: 5,
    skills: ["React", "JavaScript", "CSS", "Git"],
    mentorName: "Arjun Patel",
    mentorBio: "Senior Frontend Engineer with 8 years of experience at product startups.",
    status: "published",
    tasks: [
      { title: "Build a Component Library", description: "Create reusable React components following design system guidelines.", dueInDays: 14, order: 1 },
      { title: "API Integration", description: "Integrate REST APIs and handle loading/error states gracefully.", dueInDays: 30, order: 2 },
      { title: "Performance Audit", description: "Profile and optimize the app using React DevTools.", dueInDays: 60, order: 3 },
    ],
  },
  {
    title: "Digital Marketing Intern",
    company: "GrowthHive Agency",
    domain: "marketing",
    description: "Run real campaigns, create content strategies, and analyze performance data for actual clients across multiple industries.",
    duration: "2 months",
    mode: "Remote",
    stipend: "₹6,000/month",
    fee: 0,
    seats: 8,
    skills: ["SEO", "Google Analytics", "Content Writing", "Social Media"],
    mentorName: "Priya Menon",
    mentorBio: "Digital marketing specialist who has managed campaigns worth ₹50L+ in ad spend.",
    status: "published",
    tasks: [
      { title: "SEO Audit Report", description: "Perform a full SEO audit for one of our client websites and suggest improvements.", dueInDays: 10, order: 1 },
      { title: "Content Calendar", description: "Create a 30-day social media content calendar for a brand.", dueInDays: 20, order: 2 },
      { title: "Campaign Analysis", description: "Analyze a past ad campaign and present learnings.", dueInDays: 45, order: 3 },
    ],
  },
  {
    title: "UI/UX Design Intern",
    company: "PixelCraft Studio",
    domain: "design",
    description: "Design user interfaces for mobile and web apps. Work directly with product managers and developers to ship real features.",
    duration: "3 months",
    mode: "Hybrid",
    stipend: "₹10,000/month",
    fee: 0,
    seats: 4,
    skills: ["Figma", "User Research", "Wireframing", "Prototyping"],
    mentorName: "Ananya Singh",
    mentorBio: "Lead UX designer with experience at top design agencies and product companies.",
    status: "published",
    tasks: [
      { title: "User Research Report", description: "Conduct 5 user interviews and synthesize findings into a report.", dueInDays: 14, order: 1 },
      { title: "Wireframe Design", description: "Design wireframes for a new feature from scratch.", dueInDays: 28, order: 2 },
      { title: "High-Fidelity Prototype", description: "Create a clickable Figma prototype ready for developer handoff.", dueInDays: 60, order: 3 },
    ],
  },
  {
    title: "Data Analytics Intern",
    company: "DataPulse Analytics",
    domain: "data",
    description: "Analyze real datasets, build dashboards, and present actionable insights to business stakeholders.",
    duration: "2 months",
    mode: "Remote",
    stipend: "₹7,000/month",
    fee: 0,
    seats: 6,
    skills: ["Python", "SQL", "Excel", "Tableau", "Data Visualization"],
    mentorName: "Rohan Sharma",
    mentorBio: "Data analyst with 6 years of experience in e-commerce and fintech analytics.",
    status: "published",
    tasks: [
      { title: "Exploratory Data Analysis", description: "Perform EDA on a provided dataset and identify key patterns.", dueInDays: 10, order: 1 },
      { title: "SQL Queries Project", description: "Write 20 complex SQL queries to answer business questions.", dueInDays: 25, order: 2 },
      { title: "Dashboard Creation", description: "Build an interactive dashboard in Tableau or Power BI.", dueInDays: 50, order: 3 },
    ],
  },
  {
    title: "Finance & Investment Intern",
    company: "WealthBridge Advisors",
    domain: "finance",
    description: "Assist in financial modeling, investment research, and preparing client reports under the guidance of certified financial planners.",
    duration: "3 months",
    mode: "On-site",
    stipend: "₹5,000/month",
    fee: 0,
    seats: 3,
    skills: ["Excel", "Financial Modeling", "Research", "Valuation"],
    mentorName: "Vikram Nair",
    mentorBio: "CFA charterholder with 12 years in investment banking and wealth management.",
    status: "published",
    tasks: [
      { title: "Company Research Report", description: "Analyze a listed company and write a 2-page investment thesis.", dueInDays: 14, order: 1 },
      { title: "Financial Model", description: "Build a 3-statement financial model for a startup case study.", dueInDays: 35, order: 2 },
      { title: "Portfolio Presentation", description: "Present a model portfolio to the team with rationale.", dueInDays: 70, order: 3 },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Seed Courses ──
    const existingCourses = await Course.countDocuments();
    if (existingCourses > 0) {
      console.log(`ℹ️  ${existingCourses} courses already exist. Skipping course seed.`);
      console.log('   To re-seed, manually drop the courses collection first.');
    } else {
      const inserted = await Course.insertMany(courses);
      console.log(`✅ Seeded ${inserted.length} courses successfully!`);
    }

    // ── Seed Internships ──
    const existingInternships = await Internship.countDocuments();
    if (existingInternships > 0) {
      console.log(`ℹ️  ${existingInternships} internships already exist. Skipping internship seed.`);
    } else {
      const inserted = await Internship.insertMany(internships);
      console.log(`✅ Seeded ${inserted.length} internships successfully!`);
    }

    console.log('\n🎉 Database seeding complete!');
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
