import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import Auth from "./components/Auth.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth>
      <App />
    </Auth>
  </React.StrictMode>
);
