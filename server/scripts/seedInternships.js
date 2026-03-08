require('dotenv').config();
const mongoose = require('mongoose');
const Internship = require('../src/models/Internship');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';

const internships = [
    {
        title: "Full Stack Web Development (MERN)",
        description: "Join us for an intensive 2-month internship focusing on building modern web applications using MongoDB, Express, React, and Node.js. You'll move from basic component design to advanced state management and secure backend implementation.",
        company: "Upwise Interns Program",
        domain: "tech",
        duration: "2 Months",
        mode: "Remote",
        stipend: "Unpaid / Experience Based",
        fee: 49,
        seats: 100,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
        skills: ["React", "Node.js", "Express", "MongoDB", "Redux", "REST API"],
        mentorName: "Arun Kumar",
        mentorBio: "Senior Software Architect with 10+ years of experience in JavaScript frameworks.",
        mentorAvatar: "https://i.pravatar.cc/150?u=arun",
        status: "published",
        tasks: [
            { order: 1, title: "Environment Setup & Static UI", description: "Set up your developer environment and build a static landing page using React components.", dueInDays: 7, resources: ["https://reactjs.org/docs/getting-started.html"] },
            { order: 2, title: "State Management & API Integration", description: "Implement global state management and fetch data from a public REST API.", dueInDays: 14, resources: ["https://redux-toolkit.js.org/introduction/getting-started"] },
            { order: 3, title: "Backend Foundations", description: "Build a secure REST API with Node.js and Express including JWT authentication.", dueInDays: 21, resources: ["https://nodejs.org/en/docs/"] },
            { order: 4, title: "Database Architecture", description: "Design a MongoDB schema and implement CRUD operations for a blogging platform.", dueInDays: 30, resources: ["https://mongoosejs.com/docs/guide.html"] },
            { order: 5, title: "Final Capstone Deployment", description: "Deploy your full-stack application to Vercel/Render and prepare for final review.", dueInDays: 60, resources: ["https://vercel.com/docs"] }
        ]
    },
    {
        title: "UI/UX Product Design Mastery",
        description: "Bridge the gap between aesthetics and functionality. This program focuses on user research, wireframing, high-fidelity prototyping using Figma, and usability testing.",
        company: "Upwise Interns Program",
        domain: "design",
        duration: "3 Months",
        mode: "Remote",
        stipend: "Unpaid / Experience Based",
        fee: 39,
        seats: 50,
        thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563cc4c?q=80&w=800&auto=format&fit=crop",
        skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"],
        mentorName: "Priya Sharma",
        mentorBio: "Lead Product Designer at a top-tier fintech company. Expert in Design Systems.",
        mentorAvatar: "https://i.pravatar.cc/150?u=priya",
        status: "published",
        tasks: [
            { order: 1, title: "User Research & Personas", description: "Conduct user interviews and build detailed user personas for a delivery app.", dueInDays: 10, resources: ["https://www.nngroup.com/articles/persona-types/"] },
            { order: 2, title: "Low-Fidelity Wireframing", description: "Translate research into basic screen structures and user flows.", dueInDays: 20, resources: ["https://www.figma.com/resource-library/wireframing-guide/"] },
            { order: 3, title: "Advanced Prototyping", description: "Build high-fidelity, interactive prototypes with micro-interactions.", dueInDays: 45, resources: ["https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma"] },
            { order: 4, title: "Final Portfolio Case Study", description: "Document your entire design process into a professional case study.", dueInDays: 90, resources: ["https://www.casestudy.club/"] }
        ]
    },
    {
        title: "Data Science & AI Analyst",
        description: "Dive deep into data. This internship covers data cleaning, exploratory data analysis (EDA), predictive modeling using Python, and data visualization.",
        company: "Upwise Interns Program",
        domain: "tech",
        duration: "2 Months",
        mode: "Remote",
        stipend: "Unpaid / Experience Based",
        fee: 59,
        seats: 75,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
        skills: ["Python", "Pandas", "Scikit-Learn", "Matplotlib", "SQL", "Statistics"],
        mentorName: "Siddharth Raj",
        mentorBio: "PhD in Data Science. Consultant for Fortune 500 AI strategies.",
        mentorAvatar: "https://i.pravatar.cc/150?u=sid",
        status: "published",
        tasks: [
            { order: 1, title: "Data Cleaning Lab", description: "Take a messy real-world dataset and perform rigorous cleaning and imputation.", dueInDays: 10, resources: ["https://pandas.pydata.org/docs/user_guide/dsintro.html"] },
            { order: 2, title: "Predictive Sales Model", description: "Build a regression model to predict quarterly sales with >85% accuracy.", dueInDays: 25, resources: ["https://scikit-learn.org/stable/tutorial/basic/tutorial.html"] },
            { order: 3, title: "Visual Dashboarding", description: "Present your findings through an interactive dashboard using Streamlit.", dueInDays: 40, resources: ["https://docs.streamlit.io/"] },
            { order: 4, title: "Customer Churn Analysis", description: "Analyze behavior patterns to predict which customers are likely to leave.", dueInDays: 60, resources: [] }
        ]
    },
    {
        title: "Digital Marketing & Brand Strategy",
        description: "Master growth hacking. Learn SEO, SEM, content strategy, social media analytics, and conversion rate optimization (CRO) through real campaigns.",
        company: "Upwise Interns Program",
        domain: "marketing",
        duration: "2 Months",
        mode: "Remote",
        stipend: "Unpaid / Experience Based",
        fee: 29,
        seats: 150,
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
        skills: ["SEO", "Google Analytics", "FB Ads Manager", "Copywriting", "Email Marketing"],
        mentorName: "Neha Verma",
        mentorBio: "Growth Marketer who helped scale several startups from $0 to $1M ARR.",
        mentorAvatar: "https://i.pravatar.cc/150?u=neha",
        status: "published",
        tasks: [
            { order: 1, title: "SEO Audit", description: "Perform a complete SEO audit on a given website and suggest keyword strategies.", dueInDays: 7, resources: ["https://ahrefs.com/blog/seo-audit/"] },
            { order: 2, title: "Content Calendar & Copy", description: "Develop a 30-day content strategy for LinkedIn and Instagram.", dueInDays: 14, resources: ["https://buffer.com/library/social-media-content-calendar/"] },
            { order: 3, title: "Ad Campaign Design", description: "Design and simulate a $500/day Facebook Ad campaign with specific targeting.", dueInDays: 30, resources: ["https://www.facebook.com/business/help"] },
            { order: 4, title: "Performance Reports", description: "Analyze campaign data and produce a growth recommendation report.", dueInDays: 60, resources: ["https://analytics.google.com/analytics/academy/"] }
        ]
    },
    {
        title: "Cloud Computing & DevOps Associate",
        description: "Learn to deploy and scale. This program covers AWS/Azure fundamentals, Docker, Kubernetes, CI/CD pipelines, and infrastructure as code.",
        company: "Upwise Interns Program",
        domain: "tech",
        duration: "3 Months",
        mode: "Remote",
        stipend: "Unpaid / Experience Based",
        fee: 69,
        seats: 40,
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
        skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform", "CI/CD"],
        mentorName: "Vikram Das",
        mentorBio: "Multi-cloud certified architect. Specialist in high-availability systems.",
        mentorAvatar: "https://i.pravatar.cc/150?u=vikram",
        status: "published",
        tasks: [
            { order: 1, title: "Containerization with Docker", description: "Dockerize a sample Node.js application and manage images.", dueInDays: 15, resources: ["https://docs.docker.com/get-started/"] },
            { order: 2, title: "CI/CD Pipeline Setup", description: "Build a GitHub Actions workflow to automate testing and deployment.", dueInDays: 30, resources: ["https://docs.github.com/en/actions"] },
            { order: 3, title: "AWS Infrastructure (IAC)", description: "Provision VPC, S3, and EC2 instances using Terraform.", dueInDays: 60, resources: ["https://developer.hashicorp.com/terraform/tutorials"] },
            { order: 4, title: "Kubernetes Orchestration", description: "Deploy a microservices cluster with auto-scaling and self-healing.", dueInDays: 90, resources: ["https://kubernetes.io/docs/tutorials/kubernetes-basics/"] }
        ]
    }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);

        console.log('Cleaning existing internships...');
        await Internship.deleteMany({});

        console.log(`Seeding ${internships.length} internships...`);
        await Internship.insertMany(internships);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding internships:', err);
        process.exit(1);
    }
}

seed();
