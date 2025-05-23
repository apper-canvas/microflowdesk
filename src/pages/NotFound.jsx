import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-surface-100 to-surface-200 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900 flex items-center justify-center p-4">
      <motion.div 
        className="text-center max-w-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-8"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <ApperIcon name="FileQuestion" className="h-24 w-24 text-primary mx-auto" />
        </motion.div>
        
        <h1 className="text-6xl font-bold text-surface-900 dark:text-surface-100 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-surface-700 dark:text-surface-300 mb-4">Page Not Found</h2>
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          The page you are looking for does not exist. Let us get you back to your productive workspace.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <ApperIcon name="ArrowLeft" className="h-4 w-4" />
          <span>Back to FlowDesk</span>
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound