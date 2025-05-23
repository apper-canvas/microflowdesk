import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'
import MainFeature from '../components/MainFeature'

const Home = ({ darkMode, toggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('tasks')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: 'CheckSquare' },
    { id: 'projects', label: 'Projects', icon: 'FolderOpen' },
    { id: 'notes', label: 'Notes', icon: 'FileText' }
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-surface-50 via-surface-100 to-surface-200 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      {/* Sidebar */}
      <motion.div 
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl border-r border-surface-200 dark:border-surface-700 flex flex-col transition-all duration-300 relative z-10`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <ApperIcon name="Zap" className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  FlowDesk
                </h1>
              </motion.div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            >
              <ApperIcon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-primary/10 to-primary-light/10 text-primary border border-primary/20 shadow-soft' 
                    : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ApperIcon 
                  name={tab.icon} 
                  className={`h-5 w-5 ${activeTab === tab.id ? 'text-primary' : 'text-surface-600 dark:text-surface-400'}`} 
                />
                {!sidebarCollapsed && (
                  <span className={`font-medium ${activeTab === tab.id ? 'text-primary' : ''}`}>
                    {tab.label}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-700">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-all duration-200"
          >
            <ApperIcon 
              name={darkMode ? "Sun" : "Moon"} 
              className="h-5 w-5 text-surface-600 dark:text-surface-400" 
            />
            {!sidebarCollapsed && (
              <span className="font-medium text-surface-700 dark:text-surface-300">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header 
          className="bg-white/60 dark:bg-surface-800/60 backdrop-blur-xl border-b border-surface-200 dark:border-surface-700 px-6 py-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 capitalize">
                {activeTab}
              </h2>
              <p className="text-surface-600 dark:text-surface-400 mt-1">
                Manage your {activeTab} in a distraction-free workspace
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  className="pl-10 pr-4 py-2 bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 w-64"
                />
              </div>
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MainFeature activeTab={activeTab} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default Home