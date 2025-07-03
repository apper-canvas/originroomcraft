import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Empty = ({ 
  title = "No Content", 
  description = "Nothing to show here yet",
  actionLabel = "Get Started",
  onAction,
  icon = "Package"
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-surface to-white">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Empty State Icon */}
        <motion.div
          className="relative mb-8"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl">
            <ApperIcon name={icon} size={48} className="text-white" />
          </div>
          
          {/* Floating Accent Elements */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-accent rounded-full"
              style={{
                top: `${15 + i * 15}%`,
                left: `${75 + i * 8}%`,
              }}
              animate={{
                y: [-8, 8, -8],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </motion.div>

        {/* Empty State Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {title}
          </h3>
          <p className="text-gray-600 mb-8 font-medium">
            {description}
          </p>
        </motion.div>

        {/* Action Button */}
        {onAction && (
          <motion.button
            onClick={onAction}
            className="btn-primary flex items-center justify-center gap-2 px-8 py-3 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="Plus" size={20} />
            {actionLabel}
          </motion.button>
        )}

        {/* Decorative Elements */}
        <motion.div
          className="mt-12 flex justify-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { icon: "Home", color: "from-primary to-blue-600" },
            { icon: "Palette", color: "from-secondary to-purple-600" },
            { icon: "Box", color: "from-accent to-green-600" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
              animate={{
                y: [-5, 5, -5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.5,
              }}
            >
              <ApperIcon name={item.icon} size={24} className="text-white" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Empty;