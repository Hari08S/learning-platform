# UPWISE Learning Platform

UPWISE is a modern web-based learning platform that allows users to enroll in courses, earn certificates, and track their progress, while providing administrators with a powerful dashboard to manage users, courses, and purchases.

## Features

- **User Portal**: Learn seamlessly, pick up where you left off, take quizzes, and earn certificates.
- **Admin Dashboard**: Manage courses, verify user accounts, monitor sales and revenue statistics.
- **Dynamic Theming**: True Light Mode and Dark Mode support spanning all pages.
- **SEO Ready**: Automatically generating contextual meta and open graph tags per page.
- **Responsive Architecture**: Fully mobile-friendly interface built with pure CSS and React.

## Technology Stack

- **Frontend:** React 19, React Router v6, Zustand (State Management), Vite
- **Backend:** Node.js, Express, MongoDB
- **Styling:** Custom CSS with CSS Variables for cross-application theming

## Getting Started

### Prerequisites
Make sure you have Node > 18.0 installed on your computer.

### Setup Instructions

1. **Clone the Repository**
2. **Install Dependencies**
   Navigate into both the \`my-app\` (frontend) and \`server\` (backend) directories and install dependencies.
   \`\`\`bash
   cd my-app
   npm install

   cd ../server
   npm install
   \`\`\`

3. **Environment Setup**
   Update the `vite.config.js` or create a `.env` in the `my-app` directory pointing `VITE_API_BASE` to the server if not using default port. For the backend, set `MONGO_URI`, `PORT`, and your token secrets inside `.env`.

4. **Run the Development Server**
   Start both servers simultaneously.
   \`\`\`bash
   # In my-app directory
   npm run dev
   
   # In server directory
   npm run dev
   \`\`\`

### Scripts Provided
- \`npm run build\` - Compiles Vite for production
- \`npm run lint\` - Runs ESLint to verify codebase formatting
- \`npm run preview\` - Preview production build

## Architecture notes
- **Protected Routes**: Handled by `ProtectedRoute` wrapper guarding private areas.
- **Error Boundaries**: Implemented top-level crash catchers via `ErrorBoundary.jsx`.
- **Global State**: Managed securely in `store.js` via Zustand keeping local storage synced.
