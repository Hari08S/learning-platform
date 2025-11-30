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
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
