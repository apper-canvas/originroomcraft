import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-surface to-white">
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 3D Cube Loading Animation */}
        <div className="relative w-24 h-24 mb-8">
          <motion.div
            className="absolute inset-0 border-4 border-primary rounded-lg"
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              transformStyle: "preserve-3d",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            }}
          />
          
          <motion.div
            className="absolute inset-2 border-2 border-accent rounded-md"
            animate={{
              rotateX: [360, 0],
              rotateY: [360, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              transformStyle: "preserve-3d",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
          />
        </div>

        {/* Loading Text */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Loading 3D Engine
          </h3>
          <p className="text-gray-600 font-medium">
            Preparing your design studio...
          </p>
        </motion.div>

        {/* Progress Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Skeleton UI Elements */}
      <div className="absolute inset-0 p-6 flex">
        {/* Left Sidebar Skeleton */}
        <div className="w-80 bg-white/50 rounded-xl mr-4 p-4 space-y-4">
          <div className="h-6 bg-gray-200 rounded-lg shimmer" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg shimmer" />
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded-lg shimmer" />
          <div className="h-32 bg-gray-200 rounded-lg shimmer" />
        </div>

        {/* Main Viewport Skeleton */}
        <div className="flex-1 bg-white/50 rounded-xl mr-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 shimmer" />
          <div className="absolute bottom-4 left-4 flex space-x-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-10 h-10 bg-gray-200 rounded-lg shimmer" />
            ))}
          </div>
        </div>

        {/* Right Properties Skeleton */}
        <div className="w-80 bg-white/50 rounded-xl p-4 space-y-4">
          <div className="h-6 bg-gray-200 rounded-lg shimmer" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 bg-gray-200 rounded shimmer" />
                <div className="h-8 bg-gray-200 rounded-lg shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;