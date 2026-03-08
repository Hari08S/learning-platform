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
      { id: 1, title: "Introduction to React", mins: 8, preview: true, type: "text", content: "<h2>What is React?</h2><p>React is a JavaScript library created by Facebook (now Meta) for building user interfaces. It lets you compose complex UIs from small, isolated pieces of code called <strong>components</strong>.</p><h3>Why React?</h3><ul><li><strong>Component-Based:</strong> Build encapsulated components that manage their own state, then compose them to make complex UIs.</li><li><strong>Declarative:</strong> You describe what the UI should look like for a given state, and React efficiently updates the DOM.</li><li><strong>Virtual DOM:</strong> React maintains a lightweight copy of the real DOM. When state changes, it calculates the minimal set of changes needed — making updates extremely fast.</li><li><strong>Unidirectional Data Flow:</strong> Data flows from parent to child via props, making your app predictable and easy to debug.</li></ul><h3>Setting Up</h3><p>To create a new React project, run: <code>npx create-react-app my-app</code> or use Vite: <code>npm create vite@latest my-app -- --template react</code>. Vite is faster and recommended for modern projects.</p><h3>Your First Component</h3><pre>function Welcome() {\n  return &lt;h1&gt;Hello, World!&lt;/h1&gt;;\n}\nexport default Welcome;</pre><p>Every React component is just a JavaScript function that returns JSX (HTML-like syntax). Components must start with a capital letter.</p>" },
      { id: 2, title: "JSX & Rendering", mins: 8, preview: true, type: "text", content: "<h2>Understanding JSX</h2><p>JSX stands for <strong>JavaScript XML</strong>. It lets you write HTML-like code directly inside JavaScript. Under the hood, JSX is transformed into <code>React.createElement()</code> calls.</p><h3>JSX Rules</h3><ul><li>Every JSX expression must have <strong>one parent element</strong>. Use <code>&lt;div&gt;</code> or <code>&lt;&gt;...&lt;/&gt;</code> (Fragment) to wrap siblings.</li><li>Use <code>className</code> instead of <code>class</code> for CSS classes.</li><li>JavaScript expressions go inside <code>{ curly braces }</code>.</li><li>Self-closing tags must end with <code>/&gt;</code>, e.g. <code>&lt;img /&gt;</code>.</li></ul><h3>Embedding Expressions</h3><pre>const name = 'Priya';\nconst element = &lt;h1&gt;Hello, {name}!&lt;/h1&gt;;</pre><p>You can put any valid JavaScript expression inside the curly braces — variable references, function calls, ternary operators, and more.</p><h3>Conditional Rendering</h3><pre>function Greeting({ isLoggedIn }) {\n  return isLoggedIn ? &lt;h1&gt;Welcome back!&lt;/h1&gt; : &lt;h1&gt;Please sign in.&lt;/h1&gt;;\n}</pre><p>React re-renders a component whenever its state or props change. The Virtual DOM efficiently diffs the old and new trees to minimize actual DOM mutations.</p>" },
      { id: 3, title: "State & Props", mins: 10, preview: false, type: "text", content: "<h2>Props: Passing Data Down</h2><p><strong>Props</strong> (short for properties) are read-only inputs passed from a parent component to a child. They make components reusable.</p><pre>function UserCard({ name, age }) {\n  return &lt;div&gt;{name} is {age} years old&lt;/div&gt;;\n}\n// Usage: &lt;UserCard name='Hari' age={22} /&gt;</pre><h3>Key Rules of Props</h3><ul><li>Props are <strong>read-only</strong> — a component must never modify its own props.</li><li>Props can be any data type: strings, numbers, arrays, objects, functions, or even other components.</li><li>Use <code>children</code> prop to pass nested JSX content.</li></ul><h2>State: Managing Internal Data</h2><p><strong>State</strong> is mutable data managed within a component. When state changes, React re-renders the component.</p><pre>import { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return &lt;button onClick={() =&gt; setCount(count + 1)}&gt;Count: {count}&lt;/button&gt;;\n}</pre><h3>State vs Props</h3><table><tr><th>Props</th><th>State</th></tr><tr><td>Passed from parent</td><td>Managed within component</td></tr><tr><td>Read-only</td><td>Mutable via setter function</td></tr><tr><td>Trigger re-render when changed by parent</td><td>Trigger re-render when updated</td></tr></table>" },
      { id: 4, title: "Hooks: useState & useEffect", mins: 10, preview: false, type: "text", content: "<h2>React Hooks</h2><p>Hooks are functions that let you use React features (state, lifecycle, context) in functional components. They were introduced in React 16.8.</p><h3>useState</h3><p>Adds state to a functional component. Returns a pair: the current value and a setter function.</p><pre>const [value, setValue] = useState(initialValue);</pre><p><strong>Important:</strong> Never mutate state directly. Always use the setter. For objects/arrays, create a new copy:</p><pre>setItems([...items, newItem]); // correct\nsetUser({ ...user, name: 'New' }); // correct</pre><h3>useEffect</h3><p>Runs side effects after render. Think of it as componentDidMount + componentDidUpdate combined.</p><pre>useEffect(() =&gt; {\n  document.title = `Count: ${count}`;\n}, [count]); // Only re-runs when count changes</pre><h3>Dependency Array Rules</h3><ul><li><code>[]</code> — runs once on mount only</li><li><code>[a, b]</code> — runs when a or b changes</li><li>No array — runs after every render (avoid this)</li></ul><h3>Cleanup</h3><pre>useEffect(() =&gt; {\n  const timer = setInterval(tick, 1000);\n  return () =&gt; clearInterval(timer); // cleanup\n}, []);</pre>" },
      { id: 5, title: "Routing with React Router", mins: 8, preview: false, type: "text", content: "<h2>Client-Side Routing</h2><p>In a Single Page Application (SPA), routing happens on the client without full page reloads. <strong>React Router</strong> is the most popular routing library.</p><h3>Setup</h3><pre>npm install react-router-dom</pre><h3>Basic Configuration</h3><pre>import { BrowserRouter, Routes, Route } from 'react-router-dom';\n\nfunction App() {\n  return (\n    &lt;BrowserRouter&gt;\n      &lt;Routes&gt;\n        &lt;Route path='/' element={&lt;Home /&gt;} /&gt;\n        &lt;Route path='/about' element={&lt;About /&gt;} /&gt;\n        &lt;Route path='/users/:id' element={&lt;UserProfile /&gt;} /&gt;\n        &lt;Route path='*' element={&lt;NotFound /&gt;} /&gt;\n      &lt;/Routes&gt;\n    &lt;/BrowserRouter&gt;\n  );\n}</pre><h3>Navigation</h3><p>Use <code>&lt;Link to='/about'&gt;</code> instead of <code>&lt;a href&gt;</code> to prevent full page reloads.</p><h3>Dynamic Parameters</h3><pre>import { useParams } from 'react-router-dom';\nfunction UserProfile() {\n  const { id } = useParams();\n  return &lt;h1&gt;User #{id}&lt;/h1&gt;;\n}</pre><h3>Protected Routes</h3><p>Wrap routes in a guard component that checks authentication before rendering the child route.</p>" },
      { id: 6, title: "Building a Todo App", mins: 10, preview: false, type: "text", content: "<h2>Project: Build a Todo App</h2><p>Apply everything you've learned to build a complete CRUD Todo application.</p><h3>Features to Implement</h3><ol><li><strong>Add Todo:</strong> Text input + button. Use useState to manage a todos array.</li><li><strong>Display Todos:</strong> Map over the array and render each item with a checkbox and delete button.</li><li><strong>Toggle Complete:</strong> Click a todo to mark it done (strikethrough styling).</li><li><strong>Delete Todo:</strong> Remove item from the array using filter().</li><li><strong>Filter:</strong> Show All / Active / Completed tabs.</li></ol><h3>Component Structure</h3><pre>App\n├── TodoInput (form with input + add button)\n├── FilterBar (All | Active | Completed)\n└── TodoList\n    └── TodoItem (checkbox + text + delete btn)</pre><h3>State Shape</h3><pre>const [todos, setTodos] = useState([]);\n// Each todo: { id: Date.now(), text: '...', completed: false }</pre><h3>Key Patterns Used</h3><ul><li><code>useState</code> for managing todo list and filter</li><li><code>Array.map()</code> for rendering list</li><li><code>Array.filter()</code> for deleting and filtering</li><li>Conditional CSS classes for completed items</li><li>Controlled input with <code>onChange</code> handler</li></ul><p>Try building this on your own first before looking at any solution!</p>" }
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
      { id: 1, title: "Marketing Fundamentals", mins: 8, preview: true, type: "text", content: "<h2>What is Digital Marketing?</h2><p>Digital marketing is the promotion of products or brands via electronic media. Unlike traditional marketing, it allows you to track and measure results in real time.</p><h3>Inbound vs Outbound</h3><ul><li><strong>Outbound:</strong> Pushing messages out — ads, cold emails, TV commercials. Interruptive.</li><li><strong>Inbound:</strong> Attracting customers via valuable content — blogs, SEO, social media. Permission-based.</li></ul><h3>The Marketing Funnel</h3><ol><li><strong>Awareness:</strong> Prospect discovers your brand (SEO, social, ads).</li><li><strong>Interest:</strong> They engage with content (blogs, videos, emails).</li><li><strong>Consideration:</strong> They compare solutions (case studies, reviews).</li><li><strong>Conversion:</strong> They purchase or sign up.</li><li><strong>Retention:</strong> Post-purchase engagement (email, community).</li></ol><h3>Key Metrics</h3><p>Track <strong>CAC</strong> (Customer Acquisition Cost), <strong>LTV</strong> (Lifetime Value), <strong>CTR</strong> (Click-Through Rate), and <strong>Conversion Rate</strong> to measure success.</p>" },
      { id: 2, title: "Market Research & Target Audience", mins: 8, preview: true, type: "text", content: "<h2>Understanding Your Audience</h2><p>Effective marketing starts with knowing exactly who you're talking to. The better you understand your audience, the more effective your messaging.</p><h3>Creating Buyer Personas</h3><p>A buyer persona is a semi-fictional representation of your ideal customer based on data and research.</p><ul><li><strong>Demographics:</strong> Age, gender, location, income, education</li><li><strong>Psychographics:</strong> Values, interests, lifestyle, pain points</li><li><strong>Behavior:</strong> Buying patterns, preferred channels, decision triggers</li></ul><h3>Research Methods</h3><ol><li><strong>Surveys:</strong> Use Google Forms or Typeform to gather quantitative data.</li><li><strong>Interviews:</strong> 1-on-1 conversations for deep qualitative insights.</li><li><strong>Analytics:</strong> Study existing website/social data for behavioral patterns.</li><li><strong>Competitor Analysis:</strong> Analyze what's working for competitors.</li></ol><h3>Segmentation</h3><p>Divide your audience into distinct groups based on shared characteristics. Target each segment with tailored messaging for maximum impact.</p>" },
      { id: 3, title: "SEO Basics", mins: 10, preview: false, type: "text", content: "<h2>Search Engine Optimization</h2><p>SEO is the practice of optimizing your website to rank higher in search engine results, driving organic (free) traffic.</p><h3>On-Page SEO</h3><ul><li><strong>Title Tags:</strong> Include primary keyword, keep under 60 characters.</li><li><strong>Meta Descriptions:</strong> Compelling summaries under 160 characters.</li><li><strong>Header Tags:</strong> Use H1 for main title, H2-H3 for sections.</li><li><strong>Keyword Placement:</strong> Naturally in first 100 words, headings, and throughout content.</li><li><strong>Internal Linking:</strong> Link to your own relevant pages to spread authority.</li></ul><h3>Off-Page SEO</h3><ul><li><strong>Backlinks:</strong> Links from other reputable sites — the #1 ranking factor.</li><li><strong>Guest Posting:</strong> Write articles on other blogs to earn backlinks.</li><li><strong>Social Signals:</strong> Shares and engagement indirectly boost authority.</li></ul><h3>Technical SEO</h3><ul><li>Fast page load speed (under 3 seconds)</li><li>Mobile-friendly responsive design</li><li>XML sitemap and robots.txt</li><li>HTTPS security</li></ul>" },
      { id: 4, title: "Content Marketing Strategies", mins: 10, preview: false, type: "text", content: "<h2>Content Marketing</h2><p>Content marketing is about creating valuable, relevant content to attract and retain your target audience — instead of directly pitching products.</p><h3>Content Types</h3><ul><li><strong>Blog Posts:</strong> Great for SEO and establishing thought leadership.</li><li><strong>Infographics:</strong> Visual content that's highly shareable.</li><li><strong>Case Studies:</strong> Demonstrate real results to build trust.</li><li><strong>Ebooks/Whitepapers:</strong> In-depth guides used as lead magnets.</li><li><strong>Social Posts:</strong> Short-form content for engagement.</li></ul><h3>The Content Calendar</h3><p>Plan content 4-6 weeks ahead. For each piece, define: topic, target keyword, format, publish date, distribution channels, and responsible team member.</p><h3>The 80/20 Rule</h3><p>80% of your content should educate, entertain, or inspire. Only 20% should be promotional. This builds trust first, then converts.</p><h3>Measuring Content Performance</h3><ul><li>Page views and time on page</li><li>Social shares and comments</li><li>Lead generation (downloads, signups)</li><li>Conversion rate from content to purchase</li></ul>" },
      { id: 5, title: "Social Media Marketing", mins: 8, preview: false, type: "text", content: "<h2>Organic Social Media Growth</h2><p>Social media marketing involves creating content on platforms like Instagram, LinkedIn, Twitter, and TikTok to build community and drive engagement.</p><h3>Platform Strategy</h3><ul><li><strong>Instagram:</strong> Visual storytelling. Use Reels, Stories, and carousels. Best for B2C brands.</li><li><strong>LinkedIn:</strong> Professional content. Best for B2B, thought leadership, and hiring.</li><li><strong>Twitter/X:</strong> Real-time engagement, threads, and industry conversations.</li><li><strong>TikTok:</strong> Short-form video. Massive organic reach for creative content.</li></ul><h3>Posting Best Practices</h3><ol><li>Post consistently — 3-5 times per week minimum.</li><li>Engage with comments within the first hour.</li><li>Use 3-5 relevant hashtags (not 30).</li><li>Share behind-the-scenes and user-generated content.</li><li>Tell stories, don't just broadcast.</li></ol><h3>Growth Tactics</h3><p>Collaborate with micro-influencers, cross-promote across platforms, run contests, and repurpose top-performing content into different formats.</p>" },
      { id: 6, title: "Paid Advertising", mins: 10, preview: false, type: "text", content: "<h2>Paid Digital Advertising</h2><p>Paid ads accelerate growth by putting your message in front of the right audience instantly.</p><h3>Google Search Ads</h3><ul><li>Best for <strong>intent-driven</strong> traffic — people actively searching for solutions.</li><li>You bid on keywords. Pay per click (PPC).</li><li>Write compelling ad copy with clear call-to-action.</li><li>Use negative keywords to exclude irrelevant searches.</li></ul><h3>Social Media Ads</h3><ul><li><strong>Facebook/Instagram:</strong> Powerful targeting by demographics, interests, behaviors.</li><li><strong>LinkedIn:</strong> Best for B2B targeting by job title, company, industry.</li><li>Use lookalike audiences to find similar customers.</li></ul><h3>Key Metrics to Track</h3><table><tr><th>Metric</th><th>What It Measures</th></tr><tr><td>CTR</td><td>Click-Through Rate — ad engagement</td></tr><tr><td>CPC</td><td>Cost Per Click — efficiency</td></tr><tr><td>ROAS</td><td>Return on Ad Spend — profitability</td></tr><tr><td>CPL</td><td>Cost Per Lead — lead generation</td></tr></table><h3>A/B Testing</h3><p>Always test 2 versions of your ad (different headlines, images, or CTAs). Run for at least 7 days before choosing a winner.</p>" },
      { id: 7, title: "Email Marketing Funnels", mins: 8, preview: false, type: "text", content: "<h2>Email Marketing</h2><p>Email marketing has the highest ROI of any digital channel — averaging $42 for every $1 spent.</p><h3>Building Your List</h3><ul><li>Offer a <strong>lead magnet</strong> (free ebook, checklist, template) in exchange for email.</li><li>Use pop-ups, landing pages, and content upgrades.</li><li>Never buy email lists — only use opt-in subscribers.</li></ul><h3>Types of Email Campaigns</h3><ol><li><strong>Welcome Series:</strong> 3-5 emails introducing your brand to new subscribers.</li><li><strong>Nurture Sequence:</strong> Educational emails that build trust over time.</li><li><strong>Promotional:</strong> Product launches, discounts, limited-time offers.</li><li><strong>Re-engagement:</strong> Win back inactive subscribers.</li></ol><h3>Writing Effective Emails</h3><ul><li>Subject line is 80% of success — keep it under 50 characters, create curiosity.</li><li>Personalize with the subscriber's name.</li><li>One clear call-to-action per email.</li><li>Mobile-friendly design (60%+ open on mobile).</li></ul><h3>Key Metrics</h3><p>Open Rate (target 20-30%), Click Rate (2-5%), Unsubscribe Rate (under 0.5%).</p>" },
      { id: 8, title: "Analytics & Measuring ROI", mins: 8, preview: false, type: "text", content: "<h2>Marketing Analytics</h2><p>Data-driven marketing is not optional — it's the difference between guessing and growing.</p><h3>Google Analytics Essentials</h3><ul><li><strong>Users vs Sessions:</strong> A user can have multiple sessions (visits).</li><li><strong>Bounce Rate:</strong> % of visitors who leave after viewing just one page.</li><li><strong>Acquisition:</strong> Where traffic comes from (organic, paid, social, direct).</li><li><strong>Conversion Goals:</strong> Track specific actions (signups, purchases, downloads).</li></ul><h3>UTM Parameters</h3><p>Add UTM tags to your URLs to track exactly which campaigns drive results:</p><pre>?utm_source=instagram&utm_medium=social&utm_campaign=summer_sale</pre><h3>Calculating ROI</h3><pre>ROI = (Revenue - Cost) / Cost × 100</pre><p>Example: Spent ₹10,000 on ads, generated ₹45,000 revenue. ROI = 350%.</p><h3>Key Dashboards to Build</h3><ol><li>Traffic sources and trends</li><li>Conversion funnel drop-off points</li><li>Cost per acquisition by channel</li><li>Monthly revenue attribution</li></ol>" }
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
      { id: 1, title: "Design Fundamentals & Principles", mins: 8, preview: true, type: "text", content: "<h2>Core Design Principles</h2><p>Great design isn't subjective — it follows proven principles that guide the eye and create harmony.</p><h3>The 4 Pillars</h3><ul><li><strong>Alignment:</strong> Every element should be visually connected to something else on the page. Nothing should be placed arbitrarily.</li><li><strong>Contrast:</strong> Make different elements look noticeably different. Use size, color, weight, or spacing to create hierarchy.</li><li><strong>Hierarchy:</strong> Guide the user's eye from most important to least important. Larger = more important. Bold = emphasis.</li><li><strong>Balance:</strong> Distribute visual weight evenly. Can be symmetrical (formal) or asymmetrical (dynamic).</li></ul><h3>White Space</h3><p>Also called negative space. It's the empty area between elements. More white space = cleaner, more premium feel. Don't fill every pixel!</p><h3>The 60-30-10 Color Rule</h3><ul><li>60% — Dominant color (background, large areas)</li><li>30% — Secondary color (cards, sidebars)</li><li>10% — Accent color (buttons, CTAs, highlights)</li></ul><p>These principles apply whether you're designing a website, mobile app, poster, or presentation.</p>" },
      { id: 2, title: "Intro to UX Research", mins: 8, preview: true, type: "text", content: "<h2>What is UX Research?</h2><p>UX Research is the systematic study of target users to understand their behaviors, needs, and motivations. It informs every design decision.</p><h3>Research Methods</h3><ul><li><strong>User Interviews:</strong> 30-60 minute conversations. Ask open-ended questions like 'Walk me through how you...'</li><li><strong>Surveys:</strong> Quantitative data from many users. Good for validating hypotheses.</li><li><strong>Usability Testing:</strong> Watch real users perform tasks. Note where they struggle or get confused.</li><li><strong>Card Sorting:</strong> Users organize content into categories. Helps design navigation.</li><li><strong>A/B Testing:</strong> Compare two design variations with real traffic.</li></ul><h3>Key Questions to Ask</h3><ol><li>What problem are users trying to solve?</li><li>What's their current workflow?</li><li>Where do they experience frustration?</li><li>What would make their experience ideal?</li></ol><h3>Synthesizing Findings</h3><p>After research, group insights into themes using affinity mapping. Look for patterns, not individual opinions.</p>" },
      { id: 3, title: "User Personas & Journey Maps", mins: 8, preview: false, type: "text", content: "<h2>Building User Personas</h2><p>A persona is a fictional character representing a key user segment, based on real research data.</p><h3>Persona Template</h3><ul><li><strong>Name & Photo:</strong> Makes the persona feel real.</li><li><strong>Demographics:</strong> Age, job title, location, tech comfort.</li><li><strong>Goals:</strong> What they want to achieve with your product.</li><li><strong>Pain Points:</strong> Frustrations with current solutions.</li><li><strong>Behaviors:</strong> How they currently solve the problem.</li><li><strong>Quote:</strong> A representative statement in their voice.</li></ul><h3>Customer Journey Map</h3><p>A journey map visualizes the end-to-end experience across touchpoints.</p><h3>Journey Map Structure</h3><table><tr><th>Stage</th><th>Actions</th><th>Emotions</th><th>Opportunities</th></tr><tr><td>Awareness</td><td>Discovers product via search</td><td>Curious</td><td>Clear value proposition</td></tr><tr><td>Consideration</td><td>Compares features, reads reviews</td><td>Uncertain</td><td>Social proof, FAQs</td></tr><tr><td>Purchase</td><td>Signs up, pays</td><td>Hopeful</td><td>Smooth onboarding</td></tr><tr><td>Usage</td><td>Uses core features</td><td>Satisfied or frustrated</td><td>In-app guidance</td></tr><tr><td>Retention</td><td>Returns regularly or churns</td><td>Loyal or disengaged</td><td>Engagement features</td></tr></table>" },
      { id: 4, title: "Information Architecture", mins: 8, preview: false, type: "text", content: "<h2>Structuring Information</h2><p>Information Architecture (IA) is the practice of organizing content so users can find what they need intuitively.</p><h3>Key Concepts</h3><ul><li><strong>Navigation:</strong> How users move through your app. Types: top nav, sidebar, breadcrumbs, tabs.</li><li><strong>Hierarchy:</strong> Parent-child relationships between pages/sections.</li><li><strong>Labeling:</strong> Use clear, familiar words. Avoid jargon that users wouldn't understand.</li><li><strong>Search:</strong> For large sites, search is essential alongside navigation.</li></ul><h3>Card Sorting</h3><p>Give users content items on cards and ask them to group and label them. This reveals their mental model.</p><h3>Site Map Example</h3><pre>Home\n├── Courses\n│   ├── Course Detail\n│   └── Lesson Page\n├── Dashboard\n│   ├── Progress\n│   └── Certificates\n├── Settings\n└── Help</pre><h3>Navigation Best Practices</h3><ol><li>Limit top-level items to 5-7</li><li>Use descriptive labels (not 'Services', but 'What We Offer')</li><li>Show current location (active states, breadcrumbs)</li><li>Keep depth to 3 levels max</li></ol>" },
      { id: 5, title: "Wireframing & Prototyping", mins: 10, preview: false, type: "text", content: "<h2>From Sketch to Prototype</h2><p>Wireframes are low-fidelity blueprints that show layout and structure without visual design details.</p><h3>Wireframe Levels</h3><ul><li><strong>Low-fidelity:</strong> Hand-drawn sketches or basic boxes. Fast, disposable. Great for brainstorming.</li><li><strong>Mid-fidelity:</strong> Grayscale digital layouts in Figma/Sketch. Shows spacing, hierarchy, content placement.</li><li><strong>High-fidelity:</strong> Pixel-perfect designs with real content, colors, and images.</li></ul><h3>What to Include in Wireframes</h3><ol><li>Page title and navigation</li><li>Content blocks (headings, paragraphs, images)</li><li>Call-to-action buttons</li><li>Form fields and inputs</li><li>Footer elements</li></ol><h3>Prototyping</h3><p>A prototype adds interactivity to wireframes — clickable buttons, page transitions, hover states.</p><h3>Tools</h3><ul><li><strong>Figma:</strong> Industry standard. Free for individuals. Real-time collaboration.</li><li><strong>Sketch:</strong> Mac-only. Popular with agencies.</li><li><strong>Adobe XD:</strong> Good integration with Creative Cloud.</li></ul><p>Always test prototypes with real users before building. It's 100x cheaper to fix a wireframe than production code.</p>" },
      { id: 6, title: "Visual Design & Typography", mins: 8, preview: false, type: "text", content: "<h2>Visual Design Essentials</h2><p>Visual design is where aesthetics meet function. It's about making interfaces both beautiful and usable.</p><h3>Typography</h3><ul><li><strong>Font Pairing:</strong> Use 2 fonts max — one for headings, one for body text. Pair a serif with a sans-serif.</li><li><strong>Size Scale:</strong> Use a consistent scale like 12, 14, 16, 20, 24, 32, 48px.</li><li><strong>Line Height:</strong> Body text should have 1.5-1.75x line height for readability.</li><li><strong>Hierarchy:</strong> Differentiate headings from body using size, weight, and color.</li></ul><h3>Color Theory</h3><ul><li><strong>Primary Color:</strong> Your brand color, used for CTAs and key elements.</li><li><strong>Neutral Palette:</strong> Grays for text, backgrounds, borders.</li><li><strong>Semantic Colors:</strong> Green for success, red for error, yellow for warning.</li><li><strong>Accessibility:</strong> Ensure 4.5:1 contrast ratio between text and background (WCAG AA).</li></ul><h3>Spacing System</h3><p>Use a 4px or 8px grid. All spacings should be multiples: 4, 8, 12, 16, 24, 32, 48, 64px. This creates visual rhythm and consistency.</p>" },
      { id: 7, title: "Design Systems", mins: 8, preview: false, type: "text", content: "<h2>What is a Design System?</h2><p>A design system is a collection of reusable components, guidelines, and design tokens that ensure consistency across products.</p><h3>Components of a Design System</h3><ul><li><strong>Design Tokens:</strong> Colors, spacing, typography values stored as variables.</li><li><strong>Components:</strong> Buttons, inputs, cards, modals — reusable building blocks.</li><li><strong>Patterns:</strong> How components combine — forms, navigation, data tables.</li><li><strong>Guidelines:</strong> When and how to use each component.</li></ul><h3>Benefits</h3><ol><li><strong>Consistency:</strong> Every page looks and feels unified.</li><li><strong>Speed:</strong> Designers and developers reuse instead of recreating.</li><li><strong>Quality:</strong> Components are tested and accessible by default.</li><li><strong>Scale:</strong> New features ship faster as the library grows.</li></ol><h3>Famous Design Systems</h3><ul><li>Google Material Design</li><li>Apple Human Interface Guidelines</li><li>IBM Carbon</li><li>Atlassian Design System</li></ul><p>In Figma, create shared component libraries that your entire team can reference and update centrally.</p>" },
      { id: 8, title: "Final Project: App Prototype", mins: 10, preview: false, type: "text", content: "<h2>Project: Design a Mobile App</h2><p>Apply everything you've learned to design a complete mobile app prototype in Figma.</p><h3>Project Brief</h3><p>Design a <strong>Habit Tracker App</strong> with the following screens:</p><ol><li><strong>Onboarding:</strong> 3 screens introducing the app's value.</li><li><strong>Home Dashboard:</strong> Show today's habits with progress indicators.</li><li><strong>Add Habit:</strong> Form with name, frequency, reminder time, and icon picker.</li><li><strong>Statistics:</strong> Weekly/monthly charts showing streaks and completion rates.</li><li><strong>Settings:</strong> Profile, notifications, theme toggle.</li></ol><h3>Deliverables</h3><ul><li>User persona document</li><li>Low-fidelity wireframes (sketches or gray boxes)</li><li>High-fidelity UI screens in Figma</li><li>Interactive prototype with navigation flows</li><li>Brief presentation of design decisions</li></ul><h3>Evaluation Criteria</h3><ul><li>Consistency with design principles</li><li>Typography and color usage</li><li>Intuitive navigation and information architecture</li><li>Attention to micro-interactions</li></ul>" }
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
      { id: 1, title: "Startup Finance Basics", mins: 8, preview: true, type: "text", content: "<h2>Introduction to Startup Finance</h2><p>Understanding finance is critical whether you're building a bootstrapped side project or raising venture capital.</p><h3>Bootstrapping vs Venture Capital</h3><ul><li><strong>Bootstrapping:</strong> Self-funded from revenue. You keep 100% equity but grow slower. Best for profitable niches.</li><li><strong>Venture Capital:</strong> External funding in exchange for equity. Designed for high-growth businesses that can return 10-100x.</li><li><strong>Angel Investment:</strong> Individual investors providing early-stage capital, usually ₹10L-₹1Cr ($25K-$250K).</li></ul><h3>Key Financial Terms</h3><ul><li><strong>Revenue:</strong> Total income before expenses.</li><li><strong>Gross Margin:</strong> Revenue minus cost of goods sold (COGS). Indicates business efficiency.</li><li><strong>Burn Rate:</strong> Monthly cash outflow. How fast you're spending.</li><li><strong>Runway:</strong> Months until you run out of cash = Cash Balance ÷ Monthly Burn.</li><li><strong>Break-even:</strong> Point where revenue equals expenses — no profit, no loss.</li></ul><p>Rule of thumb: Always maintain at least 12-18 months of runway.</p>" },
      { id: 2, title: "Financial Statements 101", mins: 10, preview: true, type: "text", content: "<h2>Reading Financial Statements</h2><p>Every business has three core financial statements. Understanding them is non-negotiable for founders.</p><h3>1. Income Statement (P&L)</h3><p>Shows revenue, expenses, and profit over a period.</p><pre>Revenue:           ₹50,00,000\n- COGS:            ₹15,00,000\n= Gross Profit:    ₹35,00,000\n- Operating Exp:   ₹20,00,000\n= Net Profit:      ₹15,00,000</pre><h3>2. Balance Sheet</h3><p>Snapshot of what you own (assets), owe (liabilities), and the remaining value (equity).</p><pre>Assets = Liabilities + Equity</pre><h3>3. Cash Flow Statement</h3><p>Tracks actual cash moving in and out. Divided into:</p><ul><li><strong>Operating:</strong> Cash from core business activities.</li><li><strong>Investing:</strong> Cash spent on assets (equipment, acquisitions).</li><li><strong>Financing:</strong> Cash from investors or loans.</li></ul><h3>Why Cash Flow Matters Most</h3><p>A company can be profitable on paper but still die from poor cash flow. Revenue is vanity, profit is sanity, but <strong>cash is king</strong>.</p>" },
      { id: 3, title: "Forecasting & Unit Economics", mins: 10, preview: false, type: "text", content: "<h2>Unit Economics</h2><p>Unit economics measure the profitability of a single unit of your business — one customer, one transaction, one subscription.</p><h3>Key Metrics</h3><ul><li><strong>CAC (Customer Acquisition Cost):</strong> Total sales & marketing spend ÷ new customers acquired.</li><li><strong>LTV (Lifetime Value):</strong> Average revenue per customer × average customer lifespan.</li><li><strong>LTV:CAC Ratio:</strong> Should be at least 3:1 for a healthy business.</li><li><strong>Payback Period:</strong> Months to recover CAC. Under 12 months is ideal.</li></ul><h3>Financial Forecasting</h3><p>Build a 12-24 month forecast with these assumptions:</p><ol><li>Monthly user growth rate (be conservative: 10-20%)</li><li>Conversion rate from free to paid</li><li>Average revenue per user (ARPU)</li><li>Churn rate (% of customers leaving monthly)</li><li>Operating expenses by category</li></ol><h3>Scenario Planning</h3><table><tr><th>Scenario</th><th>Growth</th><th>Runway</th></tr><tr><td>Best Case</td><td>25% MoM</td><td>24 months</td></tr><tr><td>Base Case</td><td>15% MoM</td><td>16 months</td></tr><tr><td>Worst Case</td><td>5% MoM</td><td>10 months</td></tr></table>" },
      { id: 4, title: "Budgeting & Runway Management", mins: 8, preview: false, type: "text", content: "<h2>Managing Your Startup's Money</h2><p>Most startups don't die from bad products — they die from running out of cash. Budget management is survival.</p><h3>Creating a Budget</h3><ol><li>List all fixed costs (rent, salaries, subscriptions, hosting).</li><li>Estimate variable costs (marketing spend, freelancers, events).</li><li>Add a 15-20% buffer for unexpected expenses.</li><li>Review monthly — adjust based on actual vs planned.</li></ol><h3>Burn Rate Calculation</h3><pre>Monthly Burn = Total Monthly Expenses - Total Monthly Revenue\nRunway = Cash in Bank ÷ Monthly Burn</pre><p>Example: ₹30L cash, ₹3L monthly burn = 10 months runway.</p><h3>Cost Cutting Strategies</h3><ul><li>Use free/open-source tools where possible.</li><li>Hire contractors before full-time employees.</li><li>Defer office space — work remotely initially.</li><li>Negotiate annual billing for 20-40% savings.</li></ul><h3>When to Raise More Money</h3><p>Start fundraising when you have 6-8 months of runway left. The process takes 3-6 months, and you don't want to negotiate from desperation.</p>" },
      { id: 5, title: "Valuation Methods", mins: 10, preview: false, type: "text", content: "<h2>How Startups Are Valued</h2><p>Startup valuation is more art than science at early stages. Here are the common approaches.</p><h3>Pre-Money vs Post-Money</h3><pre>Post-Money Valuation = Pre-Money + Investment Amount\nFounder Dilution = Investment ÷ Post-Money × 100</pre><p>Example: ₹4Cr pre-money + ₹1Cr investment = ₹5Cr post-money. Investor gets 20%.</p><h3>Valuation Methods</h3><ul><li><strong>Comparable Companies:</strong> Value based on similar companies' multiples (Revenue × 5-15x for SaaS).</li><li><strong>DCF (Discounted Cash Flow):</strong> Future cash flows discounted to present value. Better for later stages.</li><li><strong>Berkus Method:</strong> Assign ₹0-50L value for: idea, prototype, team, relationships, revenue.</li><li><strong>Scorecard Method:</strong> Compare to typical angel deal in your region and adjust for strengths/weaknesses.</li></ul><h3>What Investors Look For</h3><ol><li>Large addressable market (TAM > ₹1000Cr)</li><li>Strong founding team with relevant experience</li><li>Product-market fit signals (retention, NPS)</li><li>Clear path to profitability or next funding round</li></ol>" },
      { id: 6, title: "Raising Capital", mins: 10, preview: false, type: "text", content: "<h2>The Fundraising Process</h2><p>Raising capital is a structured process. Understanding it saves months of wasted effort.</p><h3>Funding Stages</h3><table><tr><th>Stage</th><th>Typical Amount</th><th>Investors</th></tr><tr><td>Pre-Seed</td><td>₹25L - ₹1Cr</td><td>Friends, family, angels</td></tr><tr><td>Seed</td><td>₹1Cr - ₹5Cr</td><td>Angel networks, micro VCs</td></tr><tr><td>Series A</td><td>₹5Cr - ₹25Cr</td><td>Venture capital firms</td></tr><tr><td>Series B+</td><td>₹25Cr+</td><td>Growth-stage VCs, PE firms</td></tr></table><h3>The Process</h3><ol><li><strong>Prepare:</strong> Deck, financials, data room, target investor list.</li><li><strong>Outreach:</strong> Warm introductions are 10x more effective than cold emails.</li><li><strong>First Meeting:</strong> 30 min pitch. Focus on problem, solution, traction, team.</li><li><strong>Due Diligence:</strong> Investor reviews financials, legal, customer references.</li><li><strong>Term Sheet:</strong> Non-binding agreement outlining deal terms.</li><li><strong>Closing:</strong> Legal documents, wire transfer, board seat.</li></ol><h3>Key Term Sheet Terms</h3><ul><li><strong>Valuation:</strong> Pre-money company value.</li><li><strong>Liquidation Preference:</strong> Who gets paid first in an exit.</li><li><strong>Anti-dilution:</strong> Protects investors in down rounds.</li><li><strong>Board Composition:</strong> Who has decision-making power.</li></ul>" },
      { id: 7, title: "Pitching to Investors", mins: 8, preview: false, type: "text", content: "<h2>The Perfect Pitch Deck</h2><p>Your pitch deck is a 10-12 slide presentation that tells a compelling story about your startup.</p><h3>The 10-Slide Framework</h3><ol><li><strong>Cover:</strong> Company name, tagline, your name.</li><li><strong>Problem:</strong> What pain point exists? Make it relatable.</li><li><strong>Solution:</strong> How you solve it. Keep it simple.</li><li><strong>Market Size:</strong> TAM, SAM, SOM with credible sources.</li><li><strong>Business Model:</strong> How you make money.</li><li><strong>Traction:</strong> Revenue, users, growth rate — the proof.</li><li><strong>Competition:</strong> 2x2 matrix showing your positioning.</li><li><strong>Team:</strong> Why YOUR team can execute this.</li><li><strong>Financials:</strong> 3-year projections, unit economics.</li><li><strong>The Ask:</strong> How much, what will you do with it.</li></ol><h3>Pitch Tips</h3><ul><li>Tell a story, not a lecture. Start with a real customer pain.</li><li>Keep slides visual — minimal text, max 6 words per bullet.</li><li>Know your numbers cold — CAC, LTV, runway, growth rate.</li><li>Practice the 2-minute, 5-minute, and 15-minute versions.</li><li>End with conviction: 'This is why now is the time.'</li></ul>" }
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
      { id: 1, title: "React Basics Refresher", mins: 8, preview: true, type: "text", content: "<h2>React 18 Core Concepts</h2><p>This refresher covers the essential building blocks you need before diving into advanced topics.</p><h3>The Component Model</h3><p>React apps are built from components — self-contained units that manage their own state and UI. Think of them like LEGO blocks.</p><h3>Functional Components (Modern Standard)</h3><pre>function Greeting({ user }) {\n  return (\n    &lt;div&gt;\n      &lt;h1&gt;Hello, {user.name}!&lt;/h1&gt;\n      &lt;p&gt;Welcome back to the platform.&lt;/p&gt;\n    &lt;/div&gt;\n  );\n}</pre><h3>React 18 New Features</h3><ul><li><strong>Automatic Batching:</strong> State updates in event handlers, promises, and timeouts are now batched automatically.</li><li><strong>Concurrent Rendering:</strong> React can prepare multiple versions of the UI simultaneously.</li><li><strong>Suspense:</strong> Declaratively handle loading states for async operations.</li><li><strong>useId:</strong> Generate unique IDs for accessibility attributes.</li></ul><h3>Component Lifecycle</h3><ol><li><strong>Mount:</strong> Component appears in the DOM (useEffect with []).</li><li><strong>Update:</strong> Props or state change — component re-renders.</li><li><strong>Unmount:</strong> Component removed — cleanup runs.</li></ol>" },
      { id: 2, title: "State Management with Context", mins: 10, preview: true, type: "text", content: "<h2>The Context API</h2><p>Context provides a way to share values between components without explicitly passing props through every level.</p><h3>When to Use Context</h3><ul><li>Theme (dark/light mode)</li><li>Authenticated user data</li><li>Language/locale preferences</li><li>Any data needed by many components at different nesting levels</li></ul><h3>Creating Context</h3><pre>// 1. Create\nconst ThemeContext = createContext('light');\n\n// 2. Provide\nfunction App() {\n  const [theme, setTheme] = useState('dark');\n  return (\n    &lt;ThemeContext.Provider value={{ theme, setTheme }}&gt;\n      &lt;MainContent /&gt;\n    &lt;/ThemeContext.Provider&gt;\n  );\n}\n\n// 3. Consume\nfunction Button() {\n  const { theme } = useContext(ThemeContext);\n  return &lt;button className={theme}&gt;Click me&lt;/button&gt;;\n}</pre><h3>Performance Warning</h3><p>Every component consuming a Context re-renders when the Context value changes. Split contexts by concern (AuthContext, ThemeContext, etc.) rather than a single global context.</p>" },
      { id: 3, title: "Advanced Hooks", mins: 10, preview: false, type: "text", content: "<h2>Beyond useState and useEffect</h2><h3>useMemo</h3><p>Memoizes an expensive computation. Only recalculates when dependencies change.</p><pre>const sortedList = useMemo(() =&gt; {\n  return items.sort((a, b) =&gt; a.name.localeCompare(b.name));\n}, [items]);</pre><h3>useCallback</h3><p>Memoizes a function reference. Prevents child components from re-rendering unnecessarily.</p><pre>const handleClick = useCallback(() =&gt; {\n  setCount(c =&gt; c + 1);\n}, []);</pre><h3>useRef</h3><p>Holds a mutable value that persists across renders WITHOUT causing re-renders.</p><pre>const inputRef = useRef(null);\n// Later: inputRef.current.focus();</pre><h3>useReducer</h3><p>Alternative to useState for complex state logic — similar to Redux reducers.</p><pre>const [state, dispatch] = useReducer(reducer, initialState);\ndispatch({ type: 'INCREMENT' });</pre><h3>Custom Hooks</h3><p>Extract reusable logic into custom hooks. Name must start with 'use'.</p><pre>function useWindowSize() {\n  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });\n  useEffect(() =&gt; {\n    const handler = () =&gt; setSize({ w: window.innerWidth, h: window.innerHeight });\n    window.addEventListener('resize', handler);\n    return () =&gt; window.removeEventListener('resize', handler);\n  }, []);\n  return size;\n}</pre>" },
      { id: 4, title: "Routing and Navigation", mins: 8, preview: false, type: "text", content: "<h2>Advanced Routing Patterns</h2><h3>Lazy Loading Routes</h3><p>Load route components on demand to reduce initial bundle size.</p><pre>const Dashboard = lazy(() =&gt; import('./pages/Dashboard'));\n\n&lt;Suspense fallback={&lt;Spinner /&gt;}&gt;\n  &lt;Routes&gt;\n    &lt;Route path='/dashboard' element={&lt;Dashboard /&gt;} /&gt;\n  &lt;/Routes&gt;\n&lt;/Suspense&gt;</pre><h3>Protected Routes</h3><pre>function ProtectedRoute({ children }) {\n  const { user } = useAuth();\n  if (!user) return &lt;Navigate to='/login' /&gt;;\n  return children;\n}</pre><h3>Nested Routes</h3><pre>&lt;Route path='/settings' element={&lt;SettingsLayout /&gt;}&gt;\n  &lt;Route path='profile' element={&lt;Profile /&gt;} /&gt;\n  &lt;Route path='security' element={&lt;Security /&gt;} /&gt;\n&lt;/Route&gt;</pre><p>The parent component uses <code>&lt;Outlet /&gt;</code> to render child routes.</p><h3>URL Parameters & Search Params</h3><ul><li><code>useParams()</code> — access :id from /users/:id</li><li><code>useSearchParams()</code> — access ?page=2&sort=name</li><li><code>useNavigate()</code> — programmatic navigation</li><li><code>useLocation()</code> — current URL info</li></ul>" },
      { id: 5, title: "Performance Optimization", mins: 10, preview: false, type: "text", content: "<h2>Making React Apps Fast</h2><p>Performance optimization is about doing less work. React is already fast, but large apps need intentional optimization.</p><h3>Identifying Problems</h3><ul><li>Use <strong>React DevTools Profiler</strong> to see which components re-render and how long they take.</li><li>Look for components that render often but rarely change visually.</li></ul><h3>Optimization Techniques</h3><h4>1. React.memo</h4><p>Wraps a component so it only re-renders when its props actually change.</p><pre>const ExpensiveList = React.memo(function ExpensiveList({ items }) {\n  return items.map(i =&gt; &lt;Item key={i.id} data={i} /&gt;);\n});</pre><h4>2. Virtualization</h4><p>For long lists (100+ items), only render visible items using libraries like <code>react-window</code>.</p><h4>3. Code Splitting</h4><p>Split your bundle so users only download code they need right now.</p><h4>4. Debounce Expensive Operations</h4><pre>const debouncedSearch = useMemo(\n  () =&gt; debounce(handleSearch, 300),\n  [handleSearch]\n);</pre><h3>Bundle Analysis</h3><p>Use <code>source-map-explorer</code> or <code>webpack-bundle-analyzer</code> to find large dependencies that can be replaced or lazy-loaded.</p>" },
      { id: 6, title: "Global State (Zustand/Redux)", mins: 10, preview: false, type: "text", content: "<h2>Global State Management</h2><p>For large apps, you need state shared across many components. Context works for simple cases, but dedicated state libraries handle complex scenarios better.</p><h3>Zustand (Lightweight)</h3><pre>import { create } from 'zustand';\n\nconst useStore = create((set) =&gt; ({\n  count: 0,\n  increment: () =&gt; set((state) =&gt; ({ count: state.count + 1 })),\n  reset: () =&gt; set({ count: 0 }),\n}));\n\n// In any component:\nfunction Counter() {\n  const { count, increment } = useStore();\n  return &lt;button onClick={increment}&gt;{count}&lt;/button&gt;;\n}</pre><h3>Redux Toolkit (Enterprise)</h3><pre>const counterSlice = createSlice({\n  name: 'counter',\n  initialState: { value: 0 },\n  reducers: {\n    increment: (state) =&gt; { state.value += 1; },\n    decrement: (state) =&gt; { state.value -= 1; },\n  },\n});</pre><h3>When to Use What</h3><table><tr><th>Tool</th><th>Best For</th></tr><tr><td>useState</td><td>Component-local state</td></tr><tr><td>Context</td><td>Theme, auth, locale</td></tr><tr><td>Zustand</td><td>Medium apps, simple global state</td></tr><tr><td>Redux Toolkit</td><td>Large apps, complex state, devtools</td></tr></table>" },
      { id: 7, title: "Testing React Apps", mins: 10, preview: false, type: "text", content: "<h2>Testing in React</h2><p>Testing gives you confidence that your code works and keeps working as you make changes.</p><h3>Testing Pyramid</h3><ul><li><strong>Unit Tests:</strong> Test individual functions/components in isolation. Fast, many.</li><li><strong>Integration Tests:</strong> Test components working together. Moderate speed, moderate count.</li><li><strong>E2E Tests:</strong> Test full user flows in a real browser. Slow, few.</li></ul><h3>Jest + React Testing Library</h3><pre>import { render, screen, fireEvent } from '@testing-library/react';\nimport Counter from './Counter';\n\ntest('increments count on click', () =&gt; {\n  render(&lt;Counter /&gt;);\n  const button = screen.getByRole('button');\n  fireEvent.click(button);\n  expect(screen.getByText('Count: 1')).toBeInTheDocument();\n});</pre><h3>Key Testing Principles</h3><ol><li><strong>Test behavior, not implementation.</strong> The user doesn't care about state variable names.</li><li><strong>Query by role first</strong> (getByRole), then text, then testId as last resort.</li><li><strong>Arrange → Act → Assert</strong> pattern for every test.</li><li><strong>Mock external dependencies</strong> (APIs, timers) but keep internal logic real.</li></ol><h3>What to Test</h3><ul><li>Component renders correctly with given props</li><li>User interactions trigger expected changes</li><li>Error states display properly</li><li>Conditional rendering logic</li></ul>" },
      { id: 8, title: "Deploying to Production", mins: 8, preview: false, type: "text", content: "<h2>Deployment & DevOps for React</h2><p>Getting your app from localhost to the real world.</p><h3>Build Process</h3><pre>npm run build</pre><p>This creates an optimized production bundle in the <code>dist/</code> or <code>build/</code> folder with minified JS, CSS, and assets.</p><h3>Hosting Options</h3><table><tr><th>Platform</th><th>Best For</th><th>Cost</th></tr><tr><td>Vercel</td><td>Next.js, React SPAs</td><td>Free tier available</td></tr><tr><td>Netlify</td><td>Static sites, React SPAs</td><td>Free tier available</td></tr><tr><td>AWS S3 + CloudFront</td><td>High-traffic, custom setup</td><td>Pay per usage</td></tr><tr><td>Railway/Render</td><td>Full-stack with backend</td><td>Free tier + paid</td></tr></table><h3>Environment Variables</h3><p>Never hardcode API keys. Use <code>.env</code> files and platform-specific env settings.</p><pre>VITE_API_URL=https://api.myapp.com\nVITE_STRIPE_KEY=pk_live_xxx</pre><h3>CI/CD Pipeline</h3><ol><li>Push code to GitHub</li><li>CI runs tests and linting automatically</li><li>If tests pass, auto-deploy to staging</li><li>Manual approval → deploy to production</li></ol><h3>Post-Deploy Checklist</h3><ul><li>Error monitoring (Sentry)</li><li>Performance monitoring (Web Vitals)</li><li>SSL certificate active</li><li>Redirects for SPA routing configured</li></ul>" }
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
      { id: 1, title: "Financial Goal Setting", mins: 8, preview: true, type: "text", content: "<h2>Setting SMART Financial Goals</h2><p>Without clear goals, money management feels aimless. The SMART framework turns vague wishes into actionable plans.</p><h3>SMART Goals</h3><ul><li><strong>Specific:</strong> 'Save ₹5L for emergency fund' vs 'Save more money'.</li><li><strong>Measurable:</strong> Track with exact numbers and percentages.</li><li><strong>Achievable:</strong> Based on your income and expenses, not fantasy.</li><li><strong>Relevant:</strong> Aligned with your life stage and priorities.</li><li><strong>Time-bound:</strong> Set deadlines — '₹5L by December 2027'.</li></ul><h3>Goal Categories</h3><table><tr><th>Timeframe</th><th>Examples</th></tr><tr><td>Short-term (1 year)</td><td>Emergency fund, vacation, gadget</td></tr><tr><td>Mid-term (1-5 years)</td><td>Car, wedding, down payment</td></tr><tr><td>Long-term (5+ years)</td><td>Retirement, children's education, home</td></tr></table><h3>Priority Order</h3><ol><li>Build emergency fund (3-6 months of expenses)</li><li>Pay off high-interest debt</li><li>Start retirement contributions</li><li>Save for mid-term goals</li><li>Invest for wealth building</li></ol>" },
      { id: 2, title: "Budgeting & Saving", mins: 8, preview: true, type: "text", content: "<h2>Mastering Your Budget</h2><p>A budget isn't about restriction — it's about giving every rupee a purpose.</p><h3>The 50/30/20 Rule</h3><ul><li><strong>50% Needs:</strong> Rent, groceries, utilities, insurance, EMIs.</li><li><strong>30% Wants:</strong> Dining out, entertainment, shopping, subscriptions.</li><li><strong>20% Savings:</strong> Emergency fund, investments, debt repayment.</li></ul><h3>Zero-Based Budgeting</h3><p>Assign every rupee of income to a category. Income minus all allocated amounts should equal zero. This eliminates 'where did my money go?' moments.</p><h3>Saving Strategies</h3><ol><li><strong>Pay yourself first:</strong> Auto-transfer 20% to savings on payday, before spending anything.</li><li><strong>Track expenses:</strong> Use apps or a simple spreadsheet for 30 days to see where money really goes.</li><li><strong>Cut subscriptions:</strong> Audit all recurring charges. Cancel what you haven't used in 30 days.</li><li><strong>The 24-hour rule:</strong> Wait 24 hours before any non-essential purchase over ₹2,000.</li></ol><h3>Building an Emergency Fund</h3><p>Target 3-6 months of essential expenses. Keep it in a high-yield savings account or liquid mutual fund — accessible but separate from daily spending.</p>" },
      { id: 3, title: "Debt Management", mins: 8, preview: false, type: "text", content: "<h2>Getting Out of Debt</h2><p>Not all debt is bad. A home loan at 8% can build wealth. Credit card debt at 36% destroys it.</p><h3>Good Debt vs Bad Debt</h3><ul><li><strong>Good:</strong> Home loans, education loans, business loans — build future value.</li><li><strong>Bad:</strong> Credit cards, personal loans for lifestyle, payday loans — high interest, no asset.</li></ul><h3>Debt Snowball Method</h3><ol><li>List debts from smallest to largest balance.</li><li>Pay minimum on all except the smallest.</li><li>Put all extra money toward the smallest debt.</li><li>When it's paid off, roll that payment to the next smallest.</li></ol><p><strong>Advantage:</strong> Quick wins build motivation.</p><h3>Debt Avalanche Method</h3><ol><li>List debts by interest rate (highest first).</li><li>Pay minimum on all except the highest-rate debt.</li><li>Put all extra money toward the highest-rate debt.</li></ol><p><strong>Advantage:</strong> Mathematically saves the most money.</p><h3>Key Rules</h3><ul><li>Never take new debt to pay old debt.</li><li>Negotiate lower interest rates with your bank.</li><li>Consider balance transfers for credit card debt.</li><li>Build an emergency fund to avoid future debt cycles.</li></ul>" },
      { id: 4, title: "Investing Basics", mins: 10, preview: false, type: "text", content: "<h2>The Power of Investing</h2><p>Saving keeps your money safe. Investing makes it grow. The difference is massive over time.</p><h3>The Magic of Compounding</h3><pre>₹10,000/month at 12% for 25 years = ₹1.89 Crore\n₹10,000/month at 12% for 35 years = ₹6.49 Crore</pre><p>Starting 10 years earlier multiplies your wealth by 3.4x!</p><h3>Asset Classes</h3><table><tr><th>Type</th><th>Risk</th><th>Expected Return</th></tr><tr><td>Fixed Deposits</td><td>Low</td><td>6-7%</td></tr><tr><td>Bonds/Debt Funds</td><td>Low-Medium</td><td>7-9%</td></tr><tr><td>Index Funds</td><td>Medium</td><td>10-12%</td></tr><tr><td>Individual Stocks</td><td>High</td><td>12-18%+</td></tr><tr><td>Real Estate</td><td>Medium</td><td>8-12%</td></tr></table><h3>Risk vs Return</h3><p>Higher potential returns always come with higher risk. Your job is to find the right balance based on your age, goals, and risk tolerance.</p><h3>The Golden Rules</h3><ul><li>Start early — time is your biggest advantage.</li><li>Invest regularly (SIP) — don't try to time the market.</li><li>Diversify — don't put all eggs in one basket.</li><li>Stay invested — ignore short-term volatility.</li></ul>" },
      { id: 5, title: "Stock Market Fundamentals", mins: 10, preview: false, type: "text", content: "<h2>Understanding the Stock Market</h2><p>The stock market lets you buy ownership in companies. When companies grow, your investment grows with them.</p><h3>Key Concepts</h3><ul><li><strong>Share:</strong> A unit of ownership in a company.</li><li><strong>BSE/NSE:</strong> Stock exchanges where shares are traded in India.</li><li><strong>Sensex/Nifty:</strong> Market indices tracking top 30/50 companies.</li><li><strong>Bull Market:</strong> Prices rising. <strong>Bear Market:</strong> Prices falling.</li></ul><h3>How to Evaluate Stocks</h3><ul><li><strong>P/E Ratio:</strong> Price ÷ Earnings. Lower = potentially undervalued.</li><li><strong>Revenue Growth:</strong> Is the company growing year-over-year?</li><li><strong>Debt-to-Equity:</strong> Lower is better. High debt = high risk.</li><li><strong>ROE:</strong> Return on Equity. How efficiently the company uses capital.</li></ul><h3>Index Funds vs Individual Stocks</h3><table><tr><th>Index Funds</th><th>Individual Stocks</th></tr><tr><td>Broad diversification</td><td>Concentrated bets</td></tr><tr><td>Low fees (0.1-0.5%)</td><td>No management fee</td></tr><tr><td>Passive management</td><td>Active research required</td></tr><tr><td>Great for beginners</td><td>Requires expertise</td></tr></table><p>For most people, 80% in index funds + 20% in carefully chosen stocks is a solid strategy.</p>" },
      { id: 6, title: "Mutual Funds & Real Estate", mins: 10, preview: false, type: "text", content: "<h2>Mutual Funds</h2><p>A mutual fund pools money from many investors and invests it across a diversified portfolio managed by professionals.</p><h3>Types of Mutual Funds</h3><ul><li><strong>Equity Funds:</strong> Invest in stocks. Higher risk, higher return.</li><li><strong>Debt Funds:</strong> Invest in bonds. Lower risk, stable returns.</li><li><strong>Hybrid Funds:</strong> Mix of equity and debt. Balanced approach.</li><li><strong>Index Funds:</strong> Track market indices. Lowest fees, great long-term.</li><li><strong>ELSS:</strong> Tax-saving equity funds with 3-year lock-in.</li></ul><h3>SIP (Systematic Investment Plan)</h3><p>Invest a fixed amount monthly. Benefits: rupee cost averaging, discipline, starts with just ₹500/month.</p><h2>Real Estate</h2><h3>Direct Property</h3><ul><li>Requires large capital upfront.</li><li>Income from rent + appreciation.</li><li>Illiquid — hard to sell quickly.</li></ul><h3>REITs (Real Estate Investment Trusts)</h3><ul><li>Buy real estate exposure like stocks.</li><li>Regular dividend income.</li><li>Highly liquid — trade on stock exchange.</li><li>Start with as little as ₹300.</li></ul>" },
      { id: 7, title: "Tax Planning", mins: 8, preview: false, type: "text", content: "<h2>Smart Tax Planning</h2><p>Tax planning is legal. Tax evasion is not. Smart planning can save you lakhs every year.</p><h3>Tax-Saving Sections (India)</h3><table><tr><th>Section</th><th>Limit</th><th>Instruments</th></tr><tr><td>80C</td><td>₹1.5L</td><td>ELSS, PPF, EPF, Life Insurance, Tuition</td></tr><tr><td>80D</td><td>₹25K-₹1L</td><td>Health Insurance premiums</td></tr><tr><td>80E</td><td>No limit</td><td>Education loan interest</td></tr><tr><td>24(b)</td><td>₹2L</td><td>Home loan interest</td></tr><tr><td>NPS</td><td>₹50K extra</td><td>National Pension System</td></tr></table><h3>Old vs New Tax Regime</h3><ul><li><strong>Old Regime:</strong> Higher rates but allows deductions (80C, 80D, HRA, etc.).</li><li><strong>New Regime:</strong> Lower rates but no deductions. Better if you don't have many investments.</li></ul><h3>Tax-Efficient Investing</h3><ul><li>Hold equity investments for 1+ year — LTCG taxed at 10% vs 15% for STCG.</li><li>Use ELSS for both tax saving and wealth building.</li><li>Maximize EPF/PPF for guaranteed tax-free returns.</li></ul>" },
      { id: 8, title: "Retirement Planning", mins: 8, preview: false, type: "text", content: "<h2>Planning for Financial Freedom</h2><p>Retirement planning isn't about being old — it's about having the freedom to choose whether to work.</p><h3>How Much Do You Need?</h3><pre>Annual expenses × 25 = Retirement corpus needed\nExample: ₹6L/year × 25 = ₹1.5 Crore</pre><p>This is based on the <strong>4% Rule</strong> — withdraw 4% of your portfolio annually, and it should last 30+ years.</p><h3>Retirement Vehicles</h3><ul><li><strong>EPF:</strong> If employed. Employer matches contribution. Tax-free at maturity.</li><li><strong>PPF:</strong> 15-year lock-in. 7-8% guaranteed. Completely tax-free.</li><li><strong>NPS:</strong> Market-linked pension. Extra ₹50K tax deduction under 80CCD.</li><li><strong>Mutual Funds:</strong> Flexible, liquid, potential for higher returns.</li></ul><h3>Age-Based Asset Allocation</h3><table><tr><th>Age</th><th>Equity %</th><th>Debt %</th></tr><tr><td>20-35</td><td>80-90%</td><td>10-20%</td></tr><tr><td>35-50</td><td>60-70%</td><td>30-40%</td></tr><tr><td>50-60</td><td>40-50%</td><td>50-60%</td></tr><tr><td>60+</td><td>20-30%</td><td>70-80%</td></tr></table><h3>The FIRE Movement</h3><p><strong>Financial Independence, Retire Early.</strong> Save 50-70% of income, invest aggressively, and reach financial freedom in 10-15 years instead of 40.</p>" }
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
