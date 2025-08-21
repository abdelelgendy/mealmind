import { AuthProvider } from "./contexts/AuthContext";
import { PlanProvider } from "./plan/PlanContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "./components/Header";
import AppRoutes from "./routes/AppRoutes";

/**
 * Main application content component 
 * Contains layout structure and routes
 */
function AppContent() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content container fade-in">
        <AppRoutes />
      </main>
    </div>
  );
}

/**
 * Root App component that sets up providers
 * Provides authentication and meal plan context to the entire app
 */
export default function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <DndProvider backend={HTML5Backend}>
          <AppContent />
        </DndProvider>
      </PlanProvider>
    </AuthProvider>
  );
}
