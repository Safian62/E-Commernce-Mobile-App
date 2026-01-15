import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter } from "react-router";
import * as Sentry from "@sentry/react";
import { AuthProvider } from "./context/AuthContext.jsx";

const queryClient = new QueryClient();

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  enableLogs: true,

  integrations: [Sentry.replayIntegration()],
  // Session Replay
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
