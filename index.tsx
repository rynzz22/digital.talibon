import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Fixed: Explicitly use React.Component to ensure props are correctly recognized by TypeScript in class components.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">System Error</h1>
            <p className="text-gray-600 mb-4">The application encountered a critical error during runtime.</p>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 overflow-auto max-h-64 mb-6">
              <code className="text-sm text-red-800 font-mono">
                {this.state.error?.toString()}
              </code>
            </div>
            <button 
              onClick={() => {
                  localStorage.clear();
                  window.location.reload();
              }}
              className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-bold text-sm"
            >
              Clear Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log("Mounting LGU Talibon Enterprise Portal...");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);