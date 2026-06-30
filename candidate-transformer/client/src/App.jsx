import { ShieldCheck } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";

export function App() {
  const { user, booting } = useAuth();

  if (booting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-field px-4">
        <div className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white px-5 py-4 shadow-panel">
          <ShieldCheck className="h-5 w-5 text-moss" />
          <span className="text-sm font-semibold text-ink">Restoring secure workspace</span>
        </div>
      </main>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
}
