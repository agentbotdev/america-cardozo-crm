import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-500 text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">¡Ups! Algo salió mal</h1>
            <p className="text-slate-500 mb-8 text-sm">
              Ocurrió un error inesperado en la aplicación. Por favor, intentá recargar la página.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full bg-slate-900 text-white font-black py-4 px-4 rounded-2xl hover:bg-indigo-600 transition-colors shadow-lg active:scale-95"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
