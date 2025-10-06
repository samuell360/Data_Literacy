/**
 * Slide Error Boundary
 * 
 * Catches and handles errors in slide rendering
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SlideErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Slide rendering error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We encountered an error while loading this slide. This has been logged and we'll fix it soon.
            </p>
            {this.state.error && (
              <details className="text-left bg-gray-50 p-4 rounded-lg mb-6">
                <summary className="cursor-pointer font-medium text-sm text-gray-700">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <Button onClick={this.handleReset} size="lg">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
