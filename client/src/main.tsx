import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/auth-context";

// Set title and meta descriptions directly
document.title = "قاسيون إكسترا - منصة تعليمية";
const metaDesc = document.createElement('meta');
metaDesc.name = "description";
metaDesc.content = "منصة قاسيون إكسترا التعليمية لربط الطلاب بالمدرسين وتحقيق التميز الأكاديمي";
document.head.appendChild(metaDesc);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);
