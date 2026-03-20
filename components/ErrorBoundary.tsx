import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="bg-slate-800 rounded-lg p-8 shadow-xl border border-slate-700">
              {/* Error Icon */}
              <div className="mb-6">
                <svg
                  className="w-16 h-16 mx-auto text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Error Message */}
              <h2 className="text-xl font-semibold text-white mb-2">
                Algo salió mal
              </h2>
              <p className="text-gray-400 mb-6">
                Ocurrió un error inesperado. Por favor, intenta recargar la página.
              </p>

              {/* Error Details (collapsed by default in production) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-6 bg-slate-900 rounded p-4 border border-slate-600">
                  <summary className="text-sm text-gray-300 cursor-pointer mb-2">
                    Detalles del error
                  </summary>
                  <pre className="text-xs text-red-400 overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              {/* Reload Button */}
              <button
                onClick={this.handleReload}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium
                         px-6 py-3 rounded-lg transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                         focus:ring-offset-slate-800"
              >
                Recargar página
              </button>

              {/* Support Link */}
              <p className="mt-4 text-sm text-gray-500">
                Si el problema persiste,{' '}
                <a
                  href="#/support"
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  contacta con soporte
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
