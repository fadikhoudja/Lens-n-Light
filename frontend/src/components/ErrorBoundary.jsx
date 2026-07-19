import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-ink-muted">Something went wrong</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-warm border border-warm/30 px-4 py-2 rounded-full hover:bg-warm/10 transition-all cursor-pointer bg-transparent"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
