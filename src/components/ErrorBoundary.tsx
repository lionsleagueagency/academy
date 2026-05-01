import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4"
          style={{ background: 'var(--bg)', color: 'var(--text)' }}
        >
          <div className="max-w-md w-full text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Algo deu errado</h1>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <pre className="text-left text-xs p-4 rounded-xl mb-6 overflow-auto max-h-48"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-primary"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
