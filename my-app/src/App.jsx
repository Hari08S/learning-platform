// src/App.jsx
import React, { useEffect, useState } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import ForgotPassword from './components/ForgotPassword.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Feature from './components/Feature.jsx';
import Footer from './components/Footer.jsx';
import Dashboard from './components/Dashboard.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Courses from './components/Courses.jsx';
import CourseDetail from './components/CourseDetail.jsx';
import CertificatesPage from './components/CertificatesPage.jsx';
import Settings from './components/Settings.jsx';
import LessonPage from './components/LessonPage';
import QuizPage from './components/QuizPage';
import { startPresenceTracker, stopPresenceTracker } from './utils/presenceTracker';

function Home({ loggedIn }) {
  return (
    <>
      <Hero loggedIn={loggedIn} />
      <Feature />
    </>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  // start presence tracker only when authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return undefined;

    // If your tracker accepts token param you can pass it; here we assume it reads localStorage
    const cleanup = startPresenceTracker({ intervalSeconds: 60, minActiveSecondsToSend: 60 });

    return () => {
      if (cleanup) cleanup();
      stopPresenceTracker();
    };
  }, []); // runs once; will only start if token exists

  // Load login status on refresh
  useEffect(() => {
    const saved = localStorage.getItem("isLoggedIn");
    if (saved === "true") setLoggedIn(true);
  }, []);

  return (
    <>
      <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      <main>
        <Routes>
          <Route path="/" element={<Home loggedIn={loggedIn} />} />

          {/* Protected Routes */}
          {loggedIn && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/settings" element={<Settings setLoggedIn={setLoggedIn} />} />
            </>
          )}

          {/* Public Routes */}
          <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/courses/:courseId/module/:moduleId" element={<LessonPage />} />
          <Route path="/courses/:courseId/quiz" element={<QuizPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
