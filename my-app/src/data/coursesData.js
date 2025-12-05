const courses = [
  {
    // added _id so local fallback can match URLs using mongo ids
    _id: '692c4008b5bc73c629dab289',
    id: 1,
    title: "React for Beginners: The Complete Guide",
    author: "Priya Sharma",
    hours: "25h",
    students: 12500,
    level: "beginner",
    price: 99,
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
    },

    // Unique intermediate quiz (React)
    quiz: {
      _id: "local-q-react-1",
      title: "React Intermediate Quiz",
      estimatedMins: 12,
      passingPercentage: 60,
      questions: [
        {
          _id: "r-int-1",
          text: "Which hook lets you run side effects in function components?",
          options: [
            { id: "a", text: "useMemo" },
            { id: "b", text: "useEffect" },
            { id: "c", text: "useCallback" }
          ],
          correctOptionId: "b",
          points: 2
        },
        {
          _id: "r-int-2",
          text: "What is the primary purpose of keys in a list?",
          options: [
            { id: "a", text: "To style elements" },
            { id: "b", text: "To uniquely identify list items for reconciliation" },
            { id: "c", text: "To add event handlers" }
          ],
          correctOptionId: "b",
          points: 2
        },
        {
          _id: "r-int-3",
          text: "Which of these prevents unnecessary re-renders when passed as props?",
          options: [
            { id: "a", text: "Wrapping callbacks with useCallback" },
            { id: "b", text: "Using inline functions everywhere" },
            { id: "c", text: "Using JSON.stringify on props" }
          ],
          correctOptionId: "a",
          points: 2
        },
        {
          _id: "r-int-4",
          text: "How do you optimize expensive calculations only when inputs change?",
          options: [
            { id: "a", text: "useState" },
            { id: "b", text: "useMemo" },
            { id: "c", text: "useRef" }
          ],
          correctOptionId: "b",
          points: 2
        },
        {
          _id: "r-int-5",
          text: "When should you use Context API?",
          options: [
            { id: "a", text: "For passing data deeply without prop-drilling" },
            { id: "b", text: "To replace local component state always" },
            { id: "c", text: "To implement routing" }
          ],
          correctOptionId: "a",
          points: 2
        }
      ]
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
    },

    // Unique intermediate quiz (Marketing)
    quiz: {
      _id: "local-q-marketing-2",
      title: "Digital Marketing Intermediate Quiz",
      estimatedMins: 12,
      passingPercentage: 65,
      questions: [
        {
          _id: "m-int-1",
          text: "Which metric indicates the % of people who clicked an ad after seeing it?",
          options: [
            { id: "a", text: "Conversion Rate" },
            { id: "b", text: "Click-Through Rate (CTR)" },
            { id: "c", text: "Bounce Rate" }
          ],
          correctOptionId: "b",
          points: 2
        },
        {
          _id: "m-int-2",
          text: "In SEO, adding structured data (schema.org) primarily helps with:",
          options: [
            { id: "a", text: "Server speed" },
            { id: "b", text: "Search result richness & SERP features" },
            { id: "c", text: "Email deliverability" }
          ],
          correctOptionId: "b",
          points: 2
        },
        {
          _id: "m-int-3",
          text: "Which paid channel is typically best for intent-driven search traffic?",
          options: [
            { id: "a", text: "Display Ads" },
            { id: "b", text: "Google Search Ads" },
            { id: "c", text: "TikTok Ads" }
          ],
          correctOptionId: "b",
          points: 2
        },
        {
          _id: "m-int-4",
          text: "What does CAC stand for and why is it important?",
          options: [
            { id: "a", text: "Customer Average Cost — for design budgeting" },
            { id: "b", text: "Customer Acquisition Cost — to measure ROI of channels" },
            { id: "c", text: "Content Acquisition Channel — a marketing channel" }
          ],
          correctOptionId: "b",
          points: 2
        },
        {
          _id: "m-int-5",
          text: "Which A/B test result is statistically significant?",
          options: [
            { id: "a", text: "When sample size is tiny but lift is large" },
            { id: "b", text: "When p-value < 0.05 and sample sizes are adequate" },
            { id: "c", text: "When conversions increase by any amount" }
          ],
          correctOptionId: "b",
          points: 2
        }
      ]
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
    },

    // Unique intermediate quiz (UI/UX)
    quiz: {
      _id: "local-q-ux-3",
      title: "UI/UX Intermediate Quiz",
      estimatedMins: 10,
      passingPercentage: 60,
      questions: [
        {
          _id: "u-int-1",
          text: "What's the main purpose of a usability test?",
          options: [
            { id: "a", text: "To test code performance" },
            { id: "b", text: "To observe real users performing tasks and find friction" },
            { id: "c", text: "To create final UI assets" }
          ],
          correctOptionId: "b",
          points: 2
        },
        {
          _id: "u-int-2",
          text: "Which UI pattern helps users recover from errors quickly?",
          options: [
            { id: "a", text: "Clear inline validation and undo actions" },
            { id: "b", text: "Hiding error messages entirely" },
            { id: "c", text: "Making forms one huge long page" }
          ],
          correctOptionId: "a",
          points: 2
        },
        {
          _id: "u-int-3",
          text: "When designing for accessibility, which practice is essential?",
          options: [
            { id: "a", text: "Use color only to convey information" },
            { id: "b", text: "Ensure sufficient color contrast and keyboard navigation" },
            { id: "c", text: "Always use tiny font sizes" }
          ],
          correctOptionId: "b",
          points: 2
        },
        {
          _id: "u-int-4",
          text: "What is a design system?",
          options: [
            { id: "a", text: "A collection of reusable components, guidelines and tokens" },
            { id: "b", text: "A single screen design" },
            { id: "c", text: "Only a CSS file" }
          ],
          correctOptionId: "a",
          points: 2
        }
      ]
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
    },

    // Unique intermediate quiz (Finance)
    quiz: {
      _id: "local-q-finance-4",
      title: "Startup Finance Intermediate Quiz",
      estimatedMins: 12,
      passingPercentage: 65,
      questions: [
        {
          _id: "f-int-1",
          text: "What does 'runway' measure for a startup?",
          options: [
            { id: "a", text: "Time until next fundraising" },
            { id: "b", text: "Months of operating cash remaining at current burn" },
            { id: "c", text: "Number of customers" }
          ],
          correctOptionId: "b",
          points: 2
        },
        {
          _id: "f-int-2",
          text: "Which statement shows cash inflows and outflows?",
          options: [
            { id: "a", text: "Balance Sheet" },
            { id: "b", text: "Income Statement" },
            { id: "c", text: "Cash Flow Statement" }
          ],
          correctOptionId: "c",
          points: 2
        },
        {
          _id: "f-int-3",
          text: "If gross margin is low, you should consider:",
          options: [
            { id: "a", text: "Reducing COGS or raising price" },
            { id: "b", text: "Hiring more salespeople only" },
            { id: "c", text: "Cutting marketing to zero" }
          ],
          correctOptionId: "a",
          points: 2
        },
        {
          _id: "f-int-4",
          text: "A reasonable financial forecast should include:",
          options: [
            { id: "a", text: "Unrealistic best-case revenue only" },
            { id: "b", text: "Revenue, costs, capital needs, and scenarios" },
            { id: "c", text: "Only funding history" }
          ],
          correctOptionId: "b",
          points: 2
        }
      ]
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
    },

    // Unique intermediate quiz (Advanced React)
    quiz: {
      _id: "local-q-react-5",
      title: "React Advanced Intermediate Quiz",
      estimatedMins: 12,
      passingPercentage: 65,
      questions: [
        {
          _id: "ra-int-1",
          text: "Which hook is used to memoize a value between renders?",
          options: [
            { id: "a", text: "useMemo" },
            { id: "b", text: "useEffect" },
            { id: "c", text: "useCallback" }
          ],
          correctOptionId: "a",
          points: 2
        },
        {
          _id: "ra-int-2",
          text: "What is the best practice for fetching data in React components?",
          options: [
            { id: "a", text: "Fetch inside useEffect and handle loading/error states" },
            { id: "b", text: "Fetch in render body synchronously" },
            { id: "c", text: "Fetch only on server without hydration" }
          ],
          correctOptionId: "a",
          points: 2
        },
        {
          _id: "ra-int-3",
          text: "For unit testing React components, which library is a common choice?",
          options: [
            { id: "a", text: "Jest with React Testing Library" },
            { id: "b", text: "Selenium only" },
            { id: "c", text: "Photoshop" }
          ],
          correctOptionId: "a",
          points: 2
        },
        {
          _id: "ra-int-4",
          text: "When using Context, which issue should you watch for?",
          options: [
            { id: "a", text: "Unnecessary re-renders of deep tree" },
            { id: "b", text: "Better performance than local state always" },
            { id: "c", text: "Context replaces redux entirely" }
          ],
          correctOptionId: "a",
          points: 2
        }
      ]
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
    },

    // Unique intermediate quiz (Personal Finance)
    quiz: {
      _id: "local-q-fin-6",
      title: "Personal Finance Intermediate Quiz",
      estimatedMins: 10,
      passingPercentage: 60,
      questions: [
        {
          _id: "pf-int-1",
          text: "What is an emergency fund recommended for?",
          options: [
            { id: "a", text: "Unexpected expenses like medical bills or job loss" },
            { id: "b", text: "Luxury purchases" },
            { id: "c", text: "Long-term retirement only" }
          ],
          correctOptionId: "a",
          points: 2
        },
        {
          _id: "pf-int-2",
          text: "Diversification means:",
          options: [
            { id: "a", text: "Putting all money into a single high-return stock" },
            { id: "b", text: "Spreading investments across asset classes to reduce risk" },
            { id: "c", text: "Keeping all money as cash" }
          ],
          correctOptionId: "b",
          points: 2
        },
        {
          _id: "pf-int-3",
          text: "What is a sensible next step after paying off high-interest debt?",
          options: [
            { id: "a", text: "Build emergency fund and then invest regularly" },
            { id: "b", text: "Take another loan" },
            { id: "c", text: "Spend the freed-up cash immediately" }
          ],
          correctOptionId: "a",
          points: 2
        }
      ]
    }
  }
];

export default courses;
