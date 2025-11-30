"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("INR");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("mney_theme") || "light";
    const savedLanguage = localStorage.getItem("mney_language") || "en";
    const savedCurrency = localStorage.getItem("mney_currency") || "INR";

    setTheme(savedTheme);
    setLanguage(savedLanguage);
    setCurrency(savedCurrency);

    // Apply theme to document
    applyTheme(savedTheme);

    setIsLoaded(true);
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme) => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Update theme
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("mney_theme", newTheme);
    applyTheme(newTheme);
  };

  // Update language
  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("mney_language", newLanguage);
  };

  // Update currency
  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem("mney_currency", newCurrency);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        updateTheme,
        language,
        updateLanguage,
        currency,
        updateCurrency,
        isLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook to use app context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    // Return safe defaults instead of throwing so client components can
    // render without crashing if the provider isn't available during
    // some SSR/hydration scenarios.
    return {
      theme: "light",
      updateTheme: () => {},
      language: "en",
      updateLanguage: () => {},
      currency: "USD",
      updateCurrency: () => {},
      isLoaded: false,
    };
  }
  return context;
}

