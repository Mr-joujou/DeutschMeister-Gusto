import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erreur capturée:', error, errorInfo);
    // Sauvegarde de la progression avant de rediriger
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0d0f14]">
          <div className="max-w-md w-full bg-[#151820] border border-[#2a2e3a] rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Oups ! Une erreur est survenue</h1>
            <p className="text-gray-400 mb-6">
              Une erreur technique s'est produite. Ne vous inquiétez pas, votre progression est sauvegardée !
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = '/';
                }}
                className="flex-1 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Retour à l'accueil
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-[#1c2030] text-gray-300 rounded-xl font-medium hover:bg-[#242840] transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recharger
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Si le problème persiste, contactez : gustaveamoule8@gmail.com
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;