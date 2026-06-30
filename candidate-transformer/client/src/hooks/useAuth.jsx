import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, logoutSession, setAuthToken, signin, signup } from "../services/api";

const AuthContext = createContext(null);
const storageKey = "candidate-transformer-session";

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = session?.token;
    setAuthToken(token);
    if (token) {
      window.localStorage.setItem(storageKey, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [session]);

  useEffect(() => {
    async function restore() {
      if (!session?.token) {
        setBooting(false);
        return;
      }

      try {
        setAuthToken(session.token);
        const user = await fetchMe();
        setSession((current) => ({ ...current, user }));
      } catch {
        setSession(null);
      } finally {
        setBooting(false);
      }
    }

    restore();
  }, []);

  async function signUp(values) {
    const nextSession = await signup(values);
    setSession(nextSession);
    return nextSession;
  }

  async function signIn(values) {
    const nextSession = await signin(values);
    setSession(nextSession);
    return nextSession;
  }

  async function logOut() {
    try {
      if (session?.token) await logoutSession();
    } finally {
      setSession(null);
      setAuthToken(null);
    }
  }

  const value = useMemo(() => ({
    user: session?.user || null,
    token: session?.token || null,
    booting,
    signUp,
    signIn,
    logOut
  }), [session, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
