// src/data/coursesData.js
const courses = [
  {
    id: 1,
    title: "React for Beginners: The Complete Guide",
    author: "Priya Sharma",
    hours: "25h",
    students: 12500,
    level: "beginner",
    price: 99, // numeric price
    img: "/course1.jpeg",
    tag: "tech",
    rating: 4.9,
    description:
      "Master the fundamentals of React and build modern, fast, and scalable web applications from scratch. Includes hands-on projects and best practices.",
    includes: [
      "25 hours of video lectures",
      "Downloadable code examples",
      "Small projects & quizzes",
      "Certificate of completion"
    ],
    curriculum: [
      { id: 1, title: "Introduction to React", mins: 15, preview: true },
      { id: 2, title: "JSX & Rendering", mins: 20, preview: true },
      { id: 3, title: "State & Props", mins: 30, preview: false },
      { id: 4, title: "Hooks (useState, useEffect)", mins: 45, preview: false },
      { id: 5, title: "Routing with React Router", mins: 35, preview: false },
      { id: 6, title: "Final Project: Todo App", mins: 60, preview: false }
    ],
    instructor: {
      name: "Priya Sharma",
      bio: "Priya is a senior front-end engineer who has built large scale React apps for enterprise and startups.",
      rating: 4.9,
      students: 12500,
      courses: 8
    }
  },

  {
    id: 2,
    title: "Digital Marketing Mastery",
    author: "Rahul Kapoor",
    hours: "40h",
    students: 21300,
    level: "intermediate",
    price: 99,
    img: "/course2.webp",
    tag: "marketing",
    rating: 4.8,
    description:
      "Learn complete digital marketing including SEO, SEM, social media marketing, email marketing, and content strategy to grow any business online.",
    includes: [
      "40 hours of video content",
      "Downloadable marketing templates",
      "Campaign walkthroughs",
      "Certificate of completion"
    ],
    curriculum: [
      { id: 1, title: "Marketing Fundamentals", mins: 20, preview: true },
      { id: 2, title: "SEO Basics", mins: 35, preview: false },
      { id: 3, title: "Paid Ads (Google & Social)", mins: 50, preview: false },
      { id: 4, title: "Email Marketing Funnels", mins: 40, preview: false }
    ],
    instructor: {
      name: "Rahul Kapoor",
      bio: "Rahul is a growth marketer who scaled multiple e-commerce and SaaS startups using data-driven marketing.",
      rating: 4.8,
      students: 21300,
      courses: 12
    }
  },

  {
    id: 3,
    title: "UI/UX Design Fundamentals",
    author: "Ananya Desai",
    hours: "30h",
    students: 18450,
    level: "beginner",
    price: 99,
    img: "/course3.png",
    tag: "design",
    rating: 4.9,
    description:
      "A comprehensive guide to UI/UX design, from user research and wireframing to creating beautiful, high-fidelity interfaces.",
    includes: [
      "30 hours of lessons",
      "Design templates & Figma files",
      "Wireframing and prototyping exercises",
      "Certificate of completion"
    ],
    curriculum: [
      { id: 1, title: "Intro to UX Research", mins: 25, preview: true },
      { id: 2, title: "Wireframing & Prototyping", mins: 40, preview: false },
      { id: 3, title: "Design Systems", mins: 35, preview: false },
      { id: 4, title: "Final Project: App Prototype", mins: 60, preview: false }
    ],
    instructor: {
      name: "Ananya Desai",
      bio: "Ananya is a product designer with 10+ years experience designing consumer and B2B apps.",
      rating: 4.9,
      students: 18450,
      courses: 9
    }
  },

  {
    id: 4,
    title: "Startup Finance: From Seed to Scale",
    author: "Vikram Mehta",
    hours: "20h",
    students: 8900,
    level: "advanced",
    price: 99,
    img: "/course4.png",
    tag: "finance",
    rating: 4.7,
    description:
      "Learn how to manage finances, create financial models, and secure funding for your startup.",
    includes: [
      "20 hours of video lectures",
      "Financial model templates",
      "Investor pitch examples",
      "Certificate of completion"
    ],
    curriculum: [
      { id: 1, title: "Financial Statements 101", mins: 25, preview: true },
      { id: 2, title: "Forecasting & Unit Economics", mins: 40, preview: false },
      { id: 3, title: "Raising Capital", mins: 35, preview: false }
    ],
    instructor: {
      name: "Vikram Mehta",
      bio: "Vikram is a CFO-advisor who has helped early-stage startups raise seed and Series A rounds.",
      rating: 4.7,
      students: 8900,
      courses: 6
    }
  },

  {
    id: 5,
    title: "Complete React Developer Course",
    author: "Sarah Johnson",
    hours: "42h",
    students: 15420,
    level: "beginner",
    price: 99,
    img: "/course5.jpg",
    tag: "tech",
    rating: 4.9,
    description:
      "Master React from basics to advanced concepts including hooks, context, and testing. Build real-world apps and portfolio projects.",
    includes: [
      "42 hours of hands-on tutorials",
      "Projects & assignments",
      "Test-driven development lessons",
      "Certificate of completion"
    ],
    curriculum: [
      { id: 1, title: "React Basics", mins: 30, preview: true },
      { id: 2, title: "Advanced Hooks", mins: 50, preview: false },
      { id: 3, title: "Testing React Apps", mins: 45, preview: false }
    ],
    instructor: {
      name: "Sarah Johnson",
      bio: "Sarah is a senior React engineer and trainer who previously led front-end teams at a SaaS company.",
      rating: 4.9,
      students: 15420,
      courses: 10
    }
  },

  {
    id: 6,
    title: "Personal Finance Mastery",
    author: "Neha Agrawal",
    hours: "28h",
    students: 5430,
    level: "beginner",
    price: 99,
    img: "/course6.jpg",
    tag: "finance",
    rating: 4.6,
    description:
      "Master personal finance, investing, tax planning, and wealth building. Secure your financial future with practical lessons.",
    includes: [
      "28 hours of lessons",
      "Budget templates",
      "Investment strategy guides",
      "Certificate of completion"
    ],
    curriculum: [
      { id: 1, title: "Budgeting & Saving", mins: 20, preview: true },
      { id: 2, title: "Investing Basics", mins: 40, preview: false },
      { id: 3, title: "Tax Planning", mins: 30, preview: false }
    ],
    instructor: {
      name: "Neha Agrawal",
      bio: "Neha is a certified financial planner who helps people build saving & investment plans.",
      rating: 4.6,
      students: 5430,
      courses: 5
    }
  }
];

export default courses;
