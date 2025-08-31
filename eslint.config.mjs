import globals from "globals";
import js from "@eslint/js";

export default [
  {
    // This section applies to all JavaScript files in your project.
    files: ["src/assets/js/**/*.js"],
    
    // This applies the recommended set of rules from ESLint.
    ...js.configs.recommended,
    
    languageOptions: {
      // This tells ESLint that your code runs in a browser environment
      // and that you are using modern JavaScript (ES2021).
      ecmaVersion: 2021,
      sourceType: "module",
      
      // This is where we define the known global variables.
      globals: {
        ...globals.browser, // Includes standard browser globals like `document`, `window`, etc.
        "dataLayer": "readonly",
        "gtag": "readonly"
      }
    }
  }
];
