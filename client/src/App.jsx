import { Routes, Route } from "react-router-dom";

// Auth Pages
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import VerifyEmailPending from "./pages/Auth/VerifyEmailPending";

// Dashboard Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";

// Interview Pages
import CreateInterview from "./pages/Interview/CreateInterview";
import InterviewSession from "./pages/Interview/InterviewSession";
import InterviewResult from "./pages/Interview/InterviewResult";
import InterviewHistory from "./pages/Interview/InterviewHistory";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Resume Intelligence Page
import ResumeIntelligence from "./pages/Resume/ResumeIntelligence";

// Remaining Pages
import Home from "./pages/Home";
import Profile from "./pages/Profile/Profile";
import CareerAssistant from "./pages/Chatbot/CareerAssistant";
import PreparationHub from "./pages/Preparation/PreparationHub";
import PreparationSession from "./pages/Preparation/PreparationSession";
import QuizSession from "./pages/Preparation/QuizSession";
import StudyPlanner from "./pages/StudyPlan/StudyPlanner";
import Analytics from "./pages/Analytics/Analytics";

function App() {
    return (
        <Routes>

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
                path="/verify-email/:token"
                element={<VerifyEmail />}
            />

            <Route
                path="/verify-email-pending"
                element={<VerifyEmailPending />}
            />

            {/* Student Dashboard & Core Pages wrapped in DashboardLayout */}
            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                {/* Student Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* AI Mock Interview Routes */}
                <Route path="/create-interview" element={<CreateInterview />} />
                <Route path="/interview/:id" element={<InterviewSession />} />
                <Route path="/result/:id" element={<InterviewResult />} />
                <Route path="/history" element={<InterviewHistory />} />

                {/* Resume Intelligence */}
                <Route path="/resume-intelligence" element={<ResumeIntelligence />} />

                {/* Profile Route */}
                <Route path="/profile" element={<Profile />} />

                {/* Chatbot Route */}
                <Route path="/chatbot" element={<CareerAssistant />} />

                {/* Preparation Hub Routes */}
                <Route path="/preparation" element={<PreparationHub />} />
                <Route path="/preparation/:id" element={<PreparationSession />} />
                <Route path="/preparation/:id/quiz" element={<QuizSession />} />

                {/* Study Planner Route */}
                <Route path="/study-plan" element={<StudyPlanner />} />

                {/* Analytics & Achievements Route */}
                <Route path="/analytics" element={<Analytics />} />
            </Route>

            {/* Admin Dashboard */}
            <Route
                element={
                    <ProtectedRoute adminOnly>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

        </Routes>
    );
}

export default App;