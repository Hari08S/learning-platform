// src/App.jsx

import React, { useEffect, useState, Suspense } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

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

// ✅ FIXED HERE
import Settings from './components/settings.jsx';

import InternshipsList from './components/InternshipsList.jsx';
import InternshipDetails from './components/InternshipDetails.jsx';
import InternPortal from './components/InternPortal.jsx';
import NotFound from './components/NotFound.jsx';
import Pricing from './components/Pricing.jsx';
import { Toaster } from 'react-hot-toast';
import { startPresenceTracker, stopPresenceTracker } from './utils/presenceTracker';
import ScrollToTop from './ScrollToTop.jsx';
import useStore from './store';
import LessonPage from './components/LessonPage.jsx';
import QuizPage from './components/QuizPage.jsx';

// NEW COMPONENTS
import Leaderboard from './components/Leaderboard.jsx';
import InterviewPrep from './components/InterviewPrep.jsx';
import PortfolioPage from './components/PortfolioPage.jsx';

// Security and Reliability
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import SEO from './components/SEO.jsx';

// ===== ADMIN IMPORTS =====
import AdminLayout from './admin/AdminLayout.jsx';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminCourses from './admin/AdminCourses';
import AdminPurchases from "./admin/AdminPurchases";
import AdminProfile from "./admin/AdminProfile";
import AdminInternships from "./admin/AdminInternships";

function Home({ loggedIn }) {
  return (
    <>
      <SEO title="Home" description="Welcome to UPWISE. Start learning today!" />
      <Hero loggedIn={loggedIn} />
      <Feature />
    </>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Presence tracker
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const cleanup = startPresenceTracker({
      intervalSeconds: 60,
      minActiveSecondsToSend: 60,
    });

    return () => {
      if (cleanup) cleanup();
      stopPresenceTracker();
    };
  }, []);

  const storeIsLoggedIn = useStore(state => state.isLoggedIn);
  const setInternshipEnrollments = useStore(state => state.setInternshipEnrollments);
  const addXP = useStore(state => state.addXP);
  const setXPData = useStore(state => state.setXPData);

  // Load XP when logging in
  useEffect(() => {
    if (loggedIn) {
      const loadXP = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const res = await fetch(
            `${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api/me/xp`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (res.ok) {
            const data = await res.json();
            setXPData(data.xp);
          }
        } catch (err) {}
      };

      // Daily login XP
      const today = new Date().toISOString().slice(0, 10);
      const lastLogin = localStorage.getItem('lastLoginDate');

      if (lastLogin !== today) {
        localStorage.setItem('lastLoginDate', today);
        addXP(5, "Daily Login Bonus");
      }

      loadXP();
    }
  }, [loggedIn, setXPData, addXP]);

  // Restore login state
  useEffect(() => {
    const saved = localStorage.getItem('isLoggedIn');

    if (saved === 'true') {
      setLoggedIn(true);
    }
  }, []);

  // Sync internships
  useEffect(() => {
    if (loggedIn) {
      const fetchMyInternships = async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api/user/internships/my`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );

          if (res.ok) {
            const data = await res.json();

            const ids = (data.applications || [])
              .map(app => (app.internshipId?._id || app.internshipId))
              .filter(Boolean);

            setInternshipEnrollments(ids);
          }
        } catch (err) {
          console.error("Failed to sync status from DB", err);
        }
      };

      fetchMyInternships();
    } else {
      setInternshipEnrollments([]);
    }
  }, [loggedIn, setInternshipEnrollments]);

  return (
    <ErrorBoundary>
      <ScrollToTop />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px'
          }
        }}
      />

      <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      <main style={{ minHeight: 'calc(100vh - 140px)' }}>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home loggedIn={loggedIn} />} />
            <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/pricing" element={<Pricing />} />

            <Route path="/portfolio/:username" element={<PortfolioPage />} />

            {/* USER ROUTES */}
            <Route element={<ProtectedRoute requireAdmin={false} />}>

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/courses" element={<Courses />} />

              <Route path="/courses/:id" element={<CourseDetail />} />

              <Route path="/certificates" element={<CertificatesPage />} />

              <Route
                path="/settings"
                element={<Settings setLoggedIn={setLoggedIn} />}
              />

              <Route path="/internships" element={<InternshipsList />} />

              <Route
                path="/internships/:id"
                element={<InternshipDetails />}
              />

              <Route
                path="/internships/:id/portal"
                element={<InternPortal />}
              />

              <Route
                path="/courses/:courseId/module/:moduleId"
                element={<LessonPage />}
              />

              <Route
                path="/courses/:courseId/quiz"
                element={<QuizPage />}
              />

              <Route path="/leaderboard" element={<Leaderboard />} />

              <Route
                path="/interview-prep"
                element={<InterviewPrep />}
              />
            </Route>

            {/* ADMIN ROUTES */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>

              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />

              <Route path="/admin/*" element={<AdminLayout />}>

                <Route
                  path="dashboard"
                  element={<AdminDashboard />}
                />

                <Route
                  path="users"
                  element={<AdminUsers />}
                />

                <Route
                  path="courses"
                  element={<AdminCourses />}
                />

                <Route
                  path="internships"
                  element={<AdminInternships />}
                />

                <Route
                  path="purchases"
                  element={<AdminPurchases />}
                />

                <Route
                  path="profile"
                  element={<AdminProfile />}
                />

              </Route>
            </Route>

            {/* FALLBACK */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </main>

      <Footer />
    </ErrorBoundary>
  );
}

export default App;