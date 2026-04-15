import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

const initialAuthState = {
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
  user: JSON.parse(localStorage.getItem("user") || "null")
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(initialAuthState);

  const login = ({ token, role, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(user));

    setAuth({
      token,
      role,
      user
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    setAuth({
      token: null,
      role: null,
      user: null
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
