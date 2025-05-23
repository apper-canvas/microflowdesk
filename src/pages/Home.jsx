import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'
import MainFeature from '../components/MainFeature'

const Home = ({ darkMode, toggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('tasks')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showCollabSidebar, setShowCollabSidebar] = useState(false)
  const [collaborationData, setCollaborationData] = useState({
    teamMembers: [],
    sharedWorkspaces: [],
    recentActivity: []
  })

  // Mock current user
  const currentUser = { id: 'user1', name: 'John Doe', email: 'john@example.com', avatar: null }

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: 'CheckSquare' },
    { id: 'projects', label: 'Projects & Workspaces', icon: 'FolderOpen' },
    { id: 'notes', label: 'Notes', icon: 'FileText' }
  ]

  // Load collaboration data
  useEffect(() => {
    const mockTeamMembers = [
      { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', avatar: null, isOnline: false, lastSeen: '2 hours ago', role: 'Designer' },
      { id: 'user3', name: 'Mike Johnson', email: 'mike@example.com', avatar: null, isOnline: true, lastSeen: 'now', role: 'Developer' },
      { id: 'user4', name: 'Sarah Wilson', email: 'sarah@example.com', avatar: null, isOnline: false, lastSeen: '1 day ago', role: 'Manager' },
      { id: 'user5', name: 'David Brown', email: 'david@example.com', avatar: null, isOnline: true, lastSeen: 'now', role: 'Analyst' }
    ]

    const mockSharedWorkspaces = [
      { id: 'ws1', name: 'Marketing Campaign', memberCount: 4, lastActivity: '30 minutes ago' },
      { id: 'ws2', name: 'Product Development', memberCount: 6, lastActivity: '2 hours ago' },
      { id: 'ws3', name: 'Client Project', memberCount: 3, lastActivity: '1 day ago' }
    ]

    const mockRecentActivity = [
      { id: 1, user: 'Mike Johnson', action: 'completed task', item: 'UI Design Review', time: '5 minutes ago', type: 'task' },
      { id: 2, user: 'Jane Smith', action: 'added note', item: 'Meeting Notes', time: '15 minutes ago', type: 'note' },
      { id: 3, user: 'Sarah Wilson', action: 'created workspace', item: 'Q4 Planning', time: '1 hour ago', type: 'workspace' },
      { id: 4, user: 'David Brown', action: 'shared project', item: 'Analytics Dashboard', time: '2 hours ago', type: 'project' }
    ]

    setCollaborationData({
      teamMembers: mockTeamMembers,
      sharedWorkspaces: mockSharedWorkspaces,
      recentActivity: mockRecentActivity
    })
  }, [])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task': return 'CheckSquare'
      case 'note': return 'FileText'
      case 'workspace': return 'Layers'
      case 'project': return 'FolderOpen'
      default: return 'Activity'
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-surface-50 via-surface-100 to-surface-200 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      {/* Collaboration Sidebar */}
      <AnimatePresence>
        {showCollabSidebar && (
          <motion.div
            className="w-80 bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl border-r border-surface-200 dark:border-surface-700 flex flex-col relative z-20"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Collaboration Header */}
            <div className="p-4 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Users" className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-surface-900 dark:text-surface-100">
                    Team Collaboration
                  </h2>
                </div>
                <button
                  onClick={() => setShowCollabSidebar(false)}
                  className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  <ApperIcon name="X" className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Collaboration Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Current User */}
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
              <div>
                <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Your Profile</h3>
                <div className="flex items-center space-x-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {currentUser.name.charAt(0)}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-surface-800 online-indicator"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-surface-900 dark:text-surface-100">
                      {currentUser.name}
                    </div>
                    <div className="text-sm text-surface-500">Online</div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                  Team Members ({collaborationData.teamMembers.length})
                </h3>
                <div className="space-y-2">
                  {collaborationData.teamMembers.map(member => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        {member.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-surface-800 online-indicator"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-surface-900 dark:text-surface-100 text-sm">
                          {member.name}
                        </div>
                        <div className="text-xs text-surface-500">
                          {member.isOnline ? 'Online' : `Last seen ${member.lastSeen}`}
                        </div>
                      </div>
                      <div className="text-xs text-surface-400 bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-full">
                        {member.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared Workspaces */}
              <div>
                <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                  Shared Workspaces ({collaborationData.sharedWorkspaces.length})
                </h3>
                <div className="space-y-2">
                  {collaborationData.sharedWorkspaces.map(workspace => (
                    <div key={workspace.id} className="p-3 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-surface-900 dark:text-surface-100 text-sm">
                          {workspace.name}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-primary">
                          <ApperIcon name="Users" className="h-3 w-3" />
                          <span>{workspace.memberCount}</span>
                        </div>
                      </div>
                      <div className="text-xs text-surface-500">
                        Last activity: {workspace.lastActivity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {collaborationData.recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mt-0.5">
                        <ApperIcon name={getActivityIcon(activity.type)} className="h-3 w-3 text-surface-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-medium text-surface-900 dark:text-surface-100">
                            {activity.user}
                          </span>
                          <span className="text-surface-600 dark:text-surface-400">
                            {' '}{activity.action}{' '}
                          </span>
                          <span className="font-medium text-surface-900 dark:text-surface-100">
                            {activity.item}
                          </span>
                        </div>
                        <div className="text-xs text-surface-500 mt-1">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
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

        {/* Collaboration & Theme Toggle */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-700 space-y-2">
          <button
            onClick={() => setShowCollabSidebar(!showCollabSidebar)}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-all duration-200"
          >
            <ApperIcon 
              name="Users" 
              className="h-5 w-5 text-surface-600 dark:text-surface-400" 
            />
            {!sidebarCollapsed && (
              <span className="font-medium text-surface-700 dark:text-surface-300">
                Team
              </span>
            )}
            {!sidebarCollapsed && collaborationData.teamMembers.filter(m => m.isOnline).length > 0 && (
              <div className="ml-auto flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full online-indicator"></div>
                <span className="ml-1 text-xs text-surface-500">
                  {collaborationData.teamMembers.filter(m => m.isOnline).length}
                </span>
              </div>
            )}
          </button>
          
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