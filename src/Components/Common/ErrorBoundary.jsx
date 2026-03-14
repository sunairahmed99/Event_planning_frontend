import React from 'react';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You could also log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <div className="error-icon-wrapper">
              <AlertTriangle size={64} color="#ef4444" />
            </div>
            <h1>Something went wrong</h1>
            <p>
              We're sorry, but an unexpected error occurred. Our team has been notified.
            </p>
            <div className="error-actions">
              <button onClick={this.handleReload} className="btn-error reload">
                <RefreshCcw size={18} /> Reload Page
              </button>
              <button onClick={this.handleReset} className="btn-error home">
                <Home size={18} /> Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
