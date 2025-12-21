import "./polyfill.ts";

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SolanaProvider } from "./providers/SolanaProvider";
import "./index.css";
import { routeTree } from "./routeTree.gen";
import { Toaster } from "react-hot-toast";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <SolanaProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster
            position="bottom-left"
            toastOptions={{
              duration: 3000,
              style: {
                background: "white",
                color: "black",
                borderRadius: "10px",
                border: "1px solid #E5E5E5",
                padding: "10px",
                fontSize: "16px",
                textAlign: "center",
                fontFamily: "Inter",
                lineHeight: "1.5",
                letterSpacing: "0.01em",
                textTransform: "capitalize",
                position: "relative",
                bottom: "50px",
              },
            }}
          />
        </QueryClientProvider>
      </SolanaProvider>
    </StrictMode>
  );
}
