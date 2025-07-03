import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import DesignStudio from '@/components/pages/DesignStudio'
import Error from '@/components/ui/Error'

// Enhanced Error Boundary Component for Canvas and Three.js errors
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      isThreeJsError: false
    };
  }

  static getDerivedStateFromError(error) {
    // Detect Three.js/WebGL specific errors
    const isThreeJsError = error.message?.includes('WebGL') || 
                          error.message?.includes('THREE') ||
                          error.message?.includes('primitive') ||
                          error.message?.includes('geometry') ||
                          error.stack?.includes('@react-three/fiber');
    
    return { 
      hasError: true, 
      error,
      isThreeJsError
    };
  }

  componentDidCatch(error, errorInfo) {
    console.group('🚨 Canvas Error Boundary');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Stack:', error.stack);
    
    // Log specific details for Three.js errors
    if (this.state.isThreeJsError) {
      console.error('Three.js Error Details:', {
        message: error.message,
        name: error.name,
        webGLSupported: this.checkWebGLSupport(),
        userAgent: navigator.userAgent
      });
    }
    console.groupEnd();
    
    this.setState({ errorInfo });
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    } catch (e) {
      return false;
    }
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.isThreeJsError 
        ? "3D rendering engine encountered an error"
        : "Application error occurred";
        
      const errorDescription = this.state.isThreeJsError
        ? "This appears to be a WebGL or Three.js related issue. Please check your browser's WebGL support."
        : "An unexpected error occurred. Please try refreshing the page.";

      return (
        <Error
          message={errorMessage}
          description={errorDescription}
          onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          technicalDetails={{
            error: this.state.error?.message,
            webGLSupported: this.checkWebGLSupport(),
            isThreeJsError: this.state.isThreeJsError
          }}
        />
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <Router>
      <div className="App">
        <CanvasErrorBoundary>
          <Routes>
            <Route path="/" element={<DesignStudio />} />
          </Routes>
        </CanvasErrorBoundary>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </Router>
  );
}

export default App;