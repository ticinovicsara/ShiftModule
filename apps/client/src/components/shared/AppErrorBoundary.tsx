import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  public state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Unhandled application error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 shadow-soft">
            <h1 className="text-xl font-bold text-slate-900">
              Doslo je do greške
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Aplikacija je naišla na neočekivanu grešku. Pokušaj osvježiti
              stranicu.
            </p>
            {this.state.errorMessage ? (
              <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
                {this.state.errorMessage}
              </pre>
            ) : null}
            <button
              className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
              onClick={this.handleReload}
              type="button"
            >
              Osvježi aplikaciju
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
