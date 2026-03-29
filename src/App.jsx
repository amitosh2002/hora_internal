import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector, useDispatch } from "react-redux";
import store from "./store/store";
import { getMe } from "./services/api";
import { setUser } from "./store/authSlice";
import LoginPage from "./pages/Auth/LoginPage";
import ToolBoxDashboard from "./pages/Dashboard/ToolBoxDashboard";
import HoraServiceManagement from "./pages/Services/HoraServiceManagement";
import ToolBoxLayout from "./components/Layout/ToolBoxLayout";
import OnboardingPage from "./pages/Auth/OnboardingPage";
import "./styles/main.scss";
import FeatureFlagsPanel from "./pages/KVP/keyvaluepairs";
import KeyValuePairPage from "./pages/KVP/KeyValuePairPage";

// Component to handle protected routes using Redux state
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <ToolBoxLayout>
      {children}
    </ToolBoxLayout>
  );
};

// Internal router component to use Redux hooks
const AppRouter = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    const initUser = async () => {
      if (isAuthenticated && !user) {
        try {
          const data = await getMe();
          if (data.success) {
            dispatch(setUser(data.user));
          }
        } catch (err) {
          console.error("Failed to hydrate user:", err);
        }
      }
    };
    initUser();
  }, [isAuthenticated, user, dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Dashboard/Services routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ToolBoxDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services" 
          element={
            <ProtectedRoute>
              <HoraServiceManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/featureflag"
          element={
            <ProtectedRoute>
              <FeatureFlagsPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/config"
          element={
            <ProtectedRoute>
              <KeyValuePairPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}

export default App;
