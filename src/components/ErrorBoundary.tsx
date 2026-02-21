/**
 * ErrorBoundary - Composant de gestion des erreurs React
 * Capture les erreurs JavaScript dans l'arbre des composants enfants
 * et affiche une interface de secours
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Logger } from "../lib/logger";
import { Config } from "../constants/config";

// Props du composant
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

// État du composant
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * Utilise les méthodes du cycle de vie React pour capturer les erreurs
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Méthode statique appelée lors d'une erreur
   * Met à jour l'état pour afficher l'UI de secours
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Méthode appelée après qu'une erreur ait été capturée
   * Utilisée pour le logging et le reporting
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Logger l'erreur
    Logger.logError(error, {
      componentStack: errorInfo.componentStack,
    }, "ErrorBoundary");

    // Mettre à jour l'état avec les infos d'erreur
    this.setState({ errorInfo });

    // Appeler le callback optionnel
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // En production, envoyer l'erreur à un service de monitoring
    if (Config.features.enableCrashReporting) {
      this.reportError(error, errorInfo);
    }
  }

  /**
   * Envoie l'erreur à un service de monitoring
   */
  private reportError(error: Error, errorInfo: ErrorInfo): void {
    // TODO: Intégrer avec un service comme Sentry, Bugsnag, etc.
    Logger.info("Error reported to monitoring service", {
      errorMessage: error.message,
      componentStack: errorInfo.componentStack?.substring(0, 500),
    });
  }

  /**
   * Réinitialise l'état d'erreur
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = Config.app.env !== "production" } = this.props;

    if (hasError) {
      // Si un fallback personnalisé est fourni, l'utiliser
      if (fallback) {
        return fallback;
      }

      // Interface de secours par défaut
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Icône d'erreur */}
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={64} color="#EF4444" />
            </View>

            {/* Titre */}
            <Text style={styles.title}>Oups ! Une erreur est survenue</Text>

            {/* Message */}
            <Text style={styles.message}>
              Nous sommes désolés, quelque chose s'est mal passé.
              {"\n"}
              Veuillez réessayer ou contacter le support si le problème persiste.
            </Text>

            {/* Bouton de réessai */}
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Réessayer</Text>
            </TouchableOpacity>

            {/* Détails de l'erreur (mode développement) */}
            {showDetails && error && (
              <ScrollView style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Détails de l'erreur:</Text>
                <Text style={styles.errorName}>{error.name}</Text>
                <Text style={styles.errorMessage}>{error.message}</Text>
                {errorInfo?.componentStack && (
                  <Text style={styles.stackTrace}>
                    {errorInfo.componentStack.substring(0, 1000)}
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      );
    }

    return children;
  }
}

/**
 * HOC pour envelopper un composant avec ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

/**
 * Hook pour reset manuel d'une ErrorBoundary
 * Note: Ce hook ne peut pas réellement reset une ErrorBoundary parente,
 * il fournit juste un callback pour la logique de reset
 */
export const useErrorHandler = (
  givenError?: Error
): ((error: Error) => void) => {
  const [error, setError] = React.useState<Error | null>(null);

  if (givenError) {
    throw givenError;
  }

  if (error) {
    throw error;
  }

  return React.useCallback((err: Error) => {
    setError(err);
  }, []);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  detailsContainer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    maxHeight: 200,
    width: "100%",
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 8,
  },
  errorName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 11,
    color: "#B91C1C",
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 10,
    color: "#7F1D1D",
    fontFamily: "monospace",
  },
});

export default ErrorBoundary;
