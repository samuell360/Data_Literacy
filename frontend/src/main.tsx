
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress browser extension errors that interfere with the console
const originalError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';
  
  // Filter out known browser extension errors
  const extensionErrors = [
    'sidebar.cc1d36ec.js',
    'root-container.e09813a7.js',
    'A listener indicated an asynchronous response by returning true',
    'PC plat undefined',
    'AskAI Debug',
    'chrome-extension://',
    'moz-extension://'
  ];
  
  const isExtensionError = extensionErrors.some(pattern => 
    message.includes(pattern)
  );
  
  // Only log errors that are actually from our application
  if (!isExtensionError) {
    originalError.apply(console, args);
  }
};

// Also suppress unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.toString() || '';
  const extensionErrors = [
    'A listener indicated an asynchronous response',
    'chrome-extension',
    'moz-extension'
  ];
  
  const isExtensionError = extensionErrors.some(pattern => 
    message.includes(pattern)
  );
  
  if (isExtensionError) {
    event.preventDefault(); // Suppress the error
  }
});

// Development helper: Add a clean console method
if (import.meta.env.DEV) {
  (window as any).clearExtensionErrors = () => {
    console.clear();
    console.log('🧹 Console cleared of extension errors');
    console.log('🚀 Your Data Literacy app is running at http://localhost:5173');
  };
  
  // Auto-clear on startup in development
  setTimeout(() => {
    console.clear();
    console.log('🎓 Data Literacy Learning Platform');
    console.log('🚀 Frontend: http://localhost:5173');
    console.log('🔧 Backend API: http://localhost:8000');
    console.log('📚 API Docs: http://localhost:8000/docs');
    console.log('💡 Tip: Type clearExtensionErrors() to clean console');
  }, 1000);
}

createRoot(document.getElementById("root")!).render(<App />);
  