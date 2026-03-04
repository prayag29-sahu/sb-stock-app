import React, { createContext, useState } from "react";
import axiosInstance from "../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const GeneralContext = createContext();

const GeneralContextProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState("");

  const inputs = { username, email, usertype, password };
  const navigate = useNavigate();

  // Helper — navigate based on usertype coming from server response
  const navigateByRole = (type) => {
    if (type === "customer") {
      navigate("/home");
    } else if (type === "admin") {
      navigate("/admin");
    } else {
      // fallback — should not happen
      toast.error("Unknown user type: " + type);
    }
  };

  const login = async () => {
    try {
      const res = await axiosInstance.post("/login", { email, password });

      localStorage.setItem("userId",   res.data._id);
      localStorage.setItem("userType", res.data.usertype);   // "admin" or "customer"
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email",    res.data.email);
      localStorage.setItem("balance",  res.data.balance);

      toast.success(`Welcome back, ${res.data.username}!`);
      navigateByRole(res.data.usertype);
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(message);
      console.error("Login failed:", err);
    }
  };

  const register = async () => {
    // Client-side guard
    if (!usertype) {
      toast.error("Please select a user type before registering.");
      return;
    }

    try {
      const res = await axiosInstance.post("/register", inputs);

      localStorage.setItem("userId",   res.data._id);
      localStorage.setItem("userType", res.data.usertype);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email",    res.data.email);
      localStorage.setItem("balance",  res.data.balance);

      toast.success(`Registered successfully! Welcome, ${res.data.username}!`);
      navigateByRole(res.data.usertype);
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
      console.error("Registration failed:", err);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch (err) {
      console.log(err);
    } finally {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <GeneralContext.Provider
      value={{
        login,
        register,
        logout,
        username, setUsername,
        email,    setEmail,
        password, setPassword,
        usertype, setUsertype,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export default GeneralContextProvider;
