import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Something went wrong.</h1>
          <p className="text-red-600">{this.state.error?.message}</p>
          <pre className="mt-4 p-2 bg-red-100 text-red-800 rounded">{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
