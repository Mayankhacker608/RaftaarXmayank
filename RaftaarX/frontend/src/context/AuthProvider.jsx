import React, { useCallback, useEffect, useState } from "react";

import { AuthContext } from "./AuthContext.js";
import { api } from "../lib/api.js";

const STORAGE_KEY = "raftaarx_auth";

function getSavedAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [initialAuth] = useState(() => getSavedAuth());
  const [token, setToken] = useState(initialAuth?.token || null);
  const [user, setUser] = useState(initialAuth?.user || null);
  const [loading, setLoading] = useState(Boolean(initialAuth?.token));

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let active = true;

    api
      .get("/auth/me", token)
      .then((response) => {
        if (!active) {
          return;
        }
        setUser(response.user);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const persistAuth = useCallback((authData) => {
    setToken(authData.token);
    setUser(authData.user);
    setLoading(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
  }, []);

  const signup = async (payload) => {
    const response = await api.post("/auth/signup", payload);
    persistAuth(response);
    return response.user;
  };

  const login = async (payload) => {
    const response = await api.post("/auth/login", payload);
    persistAuth(response);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        setAuthSession: persistAuth,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
