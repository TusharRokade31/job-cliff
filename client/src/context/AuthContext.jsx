import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [userType, setUserType] = useState(null); // "employee" | "employer"
  const [token,    setToken]    = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedType = localStorage.getItem("userType");
    if (savedUser) { setUser(JSON.parse(savedUser)); setUserType(savedType); }
  }, []);

  const login = (userData, type, authToken) => {
    setUser(userData);
    setUserType(type);
    setToken(authToken);
    localStorage.setItem("token",    authToken);
    localStorage.setItem("user",     JSON.stringify(userData));
    localStorage.setItem("userType", type);
  };

  const logout = () => {
    setUser(null); setUserType(null); setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
  };

  return (
    <AuthContext.Provider value={{ user, userType, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
