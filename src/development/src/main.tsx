import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./scaffold/index.css";
import App from "./scaffold/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
