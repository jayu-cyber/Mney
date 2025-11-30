/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        destructive: "var(--destructive)",
        primary: "var(--primary)",
        'primary-foreground': "var(--primary-foreground)",
        secondary: "var(--secondary)",
        'secondary-foreground': "var(--secondary-foreground)",
        accent: "var(--accent)",
        'accent-foreground': "var(--accent-foreground)",
        muted: "var(--muted)",
        'muted-foreground': "var(--muted-foreground)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)"
      },
      borderColor: {
        border: "var(--border)"
      },
      outlineColor: {
        ring: "var(--ring)"
      }
    }
  },
  darkMode: "class",
  plugins: []
};
