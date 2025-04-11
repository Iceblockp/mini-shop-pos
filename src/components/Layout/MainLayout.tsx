import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  AlertTitle,
} from "@mui/material";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            Something went wrong. Please try refreshing the page.
            {process.env.NODE_ENV === "development" && (
              <pre>{this.state.error?.message}</pre>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

const LoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
    }}
  >
    <CircularProgress />
  </Box>
);

export const MainLayout: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </Container>
  );
};
