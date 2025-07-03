import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import DesignStudio from '@/components/pages/DesignStudio'
import Error from '@/components/ui/Error'

// Error Boundary Component for Canvas errors
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Canvas Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Error
          message="3D Canvas Error"
          description="There was an error rendering the 3D scene. Please refresh the page."
          onRetry={() => this.setState({ hasError: false, error: null })}
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