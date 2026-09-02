/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  label: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.warn(`[ErrorBoundary] ${this.props.label} failed:`, error, info);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="relative min-h-[60vh] bg-[radial-gradient(circle_at_top,#1a1a2e_0%,#000_70%)] text-white flex flex-col items-center justify-center gap-5 px-6 text-center">
          <span className="text-[10px] tracking-[4px] text-white/40 uppercase font-mono">
            [LAYER {this.props.label} OFFLINE]
          </span>
          <h2 className="font-heading italic text-4xl md:text-6xl text-white/90">
            This section failed to load
          </h2>
          <p className="text-sm text-white/50 font-body font-light max-w-sm leading-relaxed">
            Something went wrong behind the scenes while rendering this layer. The rest of the
            portfolio is unaffected.
          </p>
          <button
            onClick={this.handleRetry}
            className="mt-2 px-6 py-2.5 rounded-full border border-white/20 bg-white/5 text-xs uppercase tracking-widest font-mono text-white/80 hover:border-white/50 hover:bg-white/10 transition-all"
          >
            Reload Layer
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}