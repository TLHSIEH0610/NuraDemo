import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext(null);

const unAuthState = { user: null, token: null };

function getLocalAuth() {
  try {
    const localAuth = localStorage.getItem("auth");
    if (!localAuth) return unAuthState;
    const { token, user } = JSON.parse(localAuth);

    return {
      token,
      user,
    };
  } catch {
    return unAuthState;
  }
}

function setLocalAuth(auth) {
  localStorage.setItem("auth", JSON.stringify(auth));
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => getLocalAuth());
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      console.log({ data });
      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }

      return { token: data.token, user: data.user };
    },
    onSuccess: (data) => {
      setLocalAuth(data);
      setAuthState(data);
    },
  });

  const login = useCallback(
    async ({ username, password }) => {
      return await loginMutation.mutateAsync({ username, password });
    },
    [loginMutation.mutateAsync],
  );

  const logout = useCallback(() => {
    setLocalAuth(unAuthState);
    setAuthState(unAuthState);
    queryClient.clear();
  }, []);

  const value = useMemo(
    () => ({
      login,
      logout,
      token: authState.token,
      user: authState.user,
      isAuthed: Boolean(authState.token && authState.user),
      loginStatus: {
        isPending: loginMutation.isPending,
        isError: loginMutation.isError,
        error: loginMutation.error,
        reset: loginMutation.reset,
      },
    }),
    [
      login,
      logout,
      authState,
      loginMutation.isPending,
      loginMutation.isError,
      loginMutation.error,
      loginMutation.reset,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
}
