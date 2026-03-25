"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

export class CardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Card error caught:", error, errorInfo);
  }

  private readonly handleRetry = () => {
    this.setState({ hasError: false });
    // This will trigger a re-render of the children
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/20 bg-destructive/5 h-full">
          <CardContent className="flex h-full flex-col items-center justify-center space-y-4 p-6 text-center">
            <div className="bg-destructive/10 text-destructive rounded-full p-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-foreground text-sm font-semibold">
                {this.props.fallbackTitle || "Something went wrong"}
              </h3>
              <p className="text-muted-foreground text-xs">
                We couldn&apos;t load this section.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive h-8 gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
