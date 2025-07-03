import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Error = ({ message = "Something went wrong", description, onRetry, technicalDetails }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-red-50 to-orange-50">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Error Icon */}
        <motion.div
          className="relative mb-8"
          initial={{ rotateZ: -10 }}
          animate={{ rotateZ: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-error to-red-600 rounded-full flex items-center justify-center shadow-2xl">
            <ApperIcon name="AlertTriangle" size={48} className="text-white" />
          </div>
          
          {/* Floating Error Particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-error rounded-full"
              style={{
                top: `${20 + i * 10}%`,
                left: `${80 + i * 5}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
<h3 className="text-2xl font-bold text-gray-800 mb-2">
            {technicalDetails?.isThreeJsError ? '3D Engine Error' : 'Application Error'}
          </h3>
          <p className="text-gray-600 mb-4 font-medium">
            {message}
          </p>
          {description && (
            <p className="text-sm text-gray-500 mb-6">
              {description}
            </p>
          )}
          
          {/* Technical Details for Three.js errors */}
          {technicalDetails && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Technical Details:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                {technicalDetails.webGLSupported !== undefined && (
                  <div>WebGL Support: {technicalDetails.webGLSupported ? '✅ Supported' : '❌ Not Supported'}</div>
                )}
                {technicalDetails.isThreeJsError && (
                  <div>Error Type: Three.js/WebGL Related</div>
                )}
                {technicalDetails.error && (
                  <div className="break-all">Error: {technicalDetails.error}</div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {onRetry && (
            <motion.button
              onClick={onRetry}
              className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="RotateCcw" size={20} />
              Try Again
            </motion.button>
          )}
          
          <motion.button
            onClick={() => window.location.reload()}
            className="btn-ghost flex items-center justify-center gap-2 px-6 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="RefreshCw" size={20} />
            Reload Page
          </motion.button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          className="mt-8 p-4 bg-white/50 rounded-xl backdrop-blur-sm border border-gray-200/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
<h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Make sure your browser supports WebGL</p>
            <p>• Try refreshing the page</p>
            <p>• Update your graphics drivers</p>
            <p>• Try a different browser (Chrome, Firefox, Safari)</p>
            {technicalDetails?.isThreeJsError && (
              <p>• Check browser console for detailed error messages</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Error;