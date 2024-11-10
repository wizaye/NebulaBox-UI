import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {SpeedInsights} from '@vercel/speed-insights/react';
import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
        <SpeedInsights/>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
