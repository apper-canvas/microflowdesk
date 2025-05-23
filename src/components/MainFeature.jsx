import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isSameDay, isToday, isPast, startOfDay } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = ({ activeTab, selectedDate, setSelectedDate }) => {
  // Mock current user data
  const [currentUser] = useState({
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null
  })

  const [filteredByDate, setFilteredByDate] = useState(false)
  const [items, setItems] = useState({
    users: [
      { id: 'user1', name: 'John Doe', email: 'john@example.com', avatar: null, isOnline: true },
      { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', avatar: null, isOnline: false },
      { id: 'user3', name: 'Mike Johnson', email: 'mike@example.com', avatar: null, isOnline: true },
      { id: 'user4', name: 'Sarah Wilson', email: 'sarah@example.com', avatar: null, isOnline: false },
      { id: 'user5', name: 'David Brown', email: 'david@example.com', avatar: null, isOnline: true }
    ],
    collaborators: [],
    tasks: [],
    projects: [],
    workspaces: [],
    notes: []
  })
  
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharingItem, setSharingItem] = useState(null)
  const [shareEmail, setShareEmail] = useState('')

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('flowdesk-data')
    if (savedData) {
      setItems(JSON.parse(savedData))
    }
  }, [])

  // Save data to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('flowdesk-data', JSON.stringify(items))
    // Dispatch custom event to notify calendar
    window.dispatchEvent(new CustomEvent('tasksUpdated'))
  }, [items])

  // Listen for workspace selection from collaboration sidebar
  useEffect(() => {
    const handleWorkspaceSelect = (event) => {
      const workspace = event.detail
      setSelectedWorkspace(workspace)
    }
    window.addEventListener('selectWorkspace', handleWorkspaceSelect)
    return () => window.removeEventListener('selectWorkspace', handleWorkspaceSelect)
  }, [])

  // Handle date filtering when selectedDate changes
  useEffect(() => {
    setFilteredByDate(!!selectedDate)
  }, [selectedDate])

  const generateId = () => Date.now().toString()

  const handleShare = (item, type) => {
    setSharingItem({ ...item, type })
    setShowShareModal(true)
    setShareEmail('')
  }

  const handleInviteCollaborator = (e) => {
    e.preventDefault()
    
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    // Check if user exists in mock database
    const existingUser = items.users.find(user => user.email.toLowerCase() === shareEmail.toLowerCase())
    
    if (!existingUser) {
      toast.error('User not found. Please check the email address.')
      return
    }

    // Check if already a collaborator
    const existingCollaborator = items.collaborators.find(collab => 
      collab.userId === existingUser.id && 
      collab.itemId === sharingItem.id && 
      collab.itemType === sharingItem.type
    )

    if (existingCollaborator) {
      toast.error('User is already a collaborator')
      return
    }

    const newCollaborator = {
      id: generateId(),
      userId: existingUser.id,
      itemId: sharingItem.id,
      itemType: sharingItem.type,
      permission: 'editor',
      invitedBy: currentUser.id,
      invitedAt: new Date().toISOString()
    }

    setItems(prev => ({
      ...prev,
      collaborators: [...prev.collaborators, newCollaborator]
    }))

    toast.success(`${existingUser.name} has been invited as a collaborator`)
    setShareEmail('')
  }

  const handleRemoveCollaborator = (collaboratorId) => {
    setItems(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter(collab => collab.id !== collaboratorId)
    }))
    toast.success('Collaborator removed successfully')
  }

  const getCollaborators = (itemId, itemType) => {
    return items.collaborators.filter(collab => collab.itemId === itemId && collab.itemType === itemType)
  }

  const getFormFields = () => {
    switch (activeTab) {
      case 'tasks':
        return {
          workspaceId: selectedWorkspace?.id || '',
          parentTaskId: '',
          title: '',
          description: '',
          priority: 'medium',
          status: 'pending',
          dueDate: ''
        }
      case 'projects':
        return {
          name: '',
          description: '',
          status: 'active',
          category: 'personal'
        }
      case 'workspaces':
        return {
          name: '',
          description: '',
          projectId: selectedProject?.id || ''
        }
      case 'notes':
        return {
          title: '',
          content: '',
          tags: ''
        }
      default:
        return {}
    }
  }

  const getParentTasks = () => {
    return items.tasks.filter(task => !task.parentTaskId)
  }

  const getSubtasks = (parentId) => {
    return items.tasks.filter(task => task.parentTaskId === parentId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  const getProjectWorkspaces = (projectId) => {
    return items.workspaces.filter(workspace => workspace.projectId === projectId)
  }

  const getWorkspaceTasks = (workspaceId) => {
    return items.tasks.filter(task => task.workspaceId === workspaceId && !task.parentTaskId)
  }

  const getWorkspaceNotes = (workspaceId) => {
    return items.notes.filter(note => note.workspaceId === workspaceId)
  }

  const handleCreate = () => {
    setFormData(getFormFields())
    setEditingItem(null)
    setShowForm(true)
    
    // Pre-fill date if a date is selected from calendar
    if (selectedDate && activeTab === 'tasks') {
      setFormData(prev => ({
        ...getFormFields(),
        dueDate: format(selectedDate, 'yyyy-MM-dd')
      }))
    }
  }


  const handleCreateSubtask = (parentTask) => {
    setFormData({ ...getFormFields(), parentTaskId: parentTask.id })
    setEditingItem(null)
    setShowForm(true)
  }

  const handleEdit = (item) => {
    setFormData({ ...item })
    setEditingItem(item)
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title && !formData.name) {
      toast.error('Please enter a title or name')
      return
    }

    const newItem = {
      ...formData,
      id: editingItem?.id || generateId(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: editingItem?.ownerId || currentUser.id
    }

    if (activeTab === 'notes' && typeof newItem.tags === 'string') {
      newItem.tags = newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }

    setItems(prev => ({
      ...prev,
      [activeTab]: editingItem 
        ? prev[activeTab].map(item => item.id === editingItem.id ? newItem : item)
        : [...prev[activeTab], newItem]
    }))

    // Clear workspace selection if deleting the selected workspace
    if (activeTab === 'workspaces' && selectedWorkspace?.id === newItem.id) {
      setSelectedWorkspace(null)
    }

    toast.success(editingItem ? `${activeTab.slice(0, -1)} updated successfully!` : `${activeTab.slice(0, -1)} created successfully!`)
    setShowForm(false)
    setFormData({})
    setEditingItem(null)
  }

  const handleDelete = (id) => {
    setItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(item => {
        if (activeTab === 'tasks') {
          // Also delete any subtasks of the deleted task
          return item.id !== id && item.parentTaskId !== id
        } else if (activeTab === 'projects') {
          // Also delete workspaces in the project
          if (item.id === id) {
            // Delete workspaces associated with this project
            const workspacesToDelete = prev.workspaces.filter(ws => ws.projectId === id)
            workspacesToDelete.forEach(ws => {
              // Delete tasks and notes in these workspaces
              prev.tasks = prev.tasks.filter(task => task.workspaceId !== ws.id)
              prev.notes = prev.notes.filter(note => note.workspaceId !== ws.id)
            })
            prev.workspaces = prev.workspaces.filter(ws => ws.projectId !== id)
            return false
          }
        } else if (activeTab === 'workspaces') {
          // Also delete tasks and notes in the workspace
          if (item.id === id) {
            prev.tasks = prev.tasks.filter(task => task.workspaceId !== id)
            prev.notes = prev.notes.filter(note => note.workspaceId !== id)
            return false
          }
        }
        return item.id !== id
      })
    }))
    toast.success(`${activeTab.slice(0, -1)} and any subtasks deleted successfully!`)
  }

  const handleProjectSelect = (project) => {
    setSelectedProject(project)
    setSelectedWorkspace(null)
    toast.info(`Selected project: ${project.name}`)
  }

  const handleWorkspaceSelect = (workspace) => {
    setSelectedWorkspace(workspace)
    toast.info(`Selected workspace: ${workspace.name}`)
  }

  const toggleTaskStatus = (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    setItems(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      )
    }))
    toast.success(`Task ${newStatus}!`)
  }

  const getDeadlineStatus = (dueDate) => {
    if (!dueDate) return null
    
    const taskDate = startOfDay(new Date(dueDate))
    const today = startOfDay(new Date())
    
    if (isPast(taskDate) && !isSameDay(taskDate, today)) {
      return 'overdue'
    } else if (isToday(taskDate)) {
      return 'today'
    } else {
      return 'upcoming'
    }
  }

  const getDeadlineColor = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200'
      case 'today': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'upcoming': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-surface-600 bg-surface-100 border-surface-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-secondary bg-secondary/10 border-secondary/20'
      case 'in-progress': return 'text-accent bg-accent/10 border-accent/20'
      case 'pending': return 'text-surface-600 bg-surface-100 border-surface-200'
      case 'active': return 'text-primary bg-primary/10 border-primary/20'
      case 'archived': return 'text-surface-500 bg-surface-50 border-surface-200'
      default: return 'text-surface-600 bg-surface-100 border-surface-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-accent bg-accent/10 border-accent/20'
      case 'low': return 'text-secondary bg-secondary/10 border-secondary/20'
      default: return 'text-surface-600 bg-surface-100 border-surface-200'
    }
  }

  const renderForm = () => (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            {editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}
          </h3>
          <button
            onClick={() => setShowForm(false)}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <ApperIcon name="X" className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'tasks' && (
            <>
              {items.workspaces.length > 0 && (
                <select
                  value={formData.workspaceId || ''}
                  onChange={(e) => setFormData({ ...formData, workspaceId: e.target.value })}
                  className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
                >
                  <option value="">Select workspace (optional)</option>
                  {items.workspaces.map(workspace => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              )}
              {getParentTasks().length > 0 && (
                <select
                  value={formData.parentTaskId || ''}
                  onChange={(e) => setFormData({ ...formData, parentTaskId: e.target.value })}
                  className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
                >
                  <option value="">Select parent task (optional)</option>
                  {getParentTasks().map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                placeholder="Task title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700 h-24"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.priority || 'medium'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select
                  value={formData.status || 'pending'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => {
                  setFormData({ ...formData, dueDate: e.target.value })
                  // Update selected date when user changes date in form
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value))
                  }
                }}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
                placeholder="Select due date"
              />
              {selectedDate && (
                <div className="flex items-center justify-between text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-700/50 rounded-lg p-2">
                  <span>Selected: {format(selectedDate, 'MMM dd, yyyy')}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="text-surface-400 hover:text-surface-600"
                  >
                    <ApperIcon name="X" className="h-3 w-3" />
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'projects' && (
            <>
              <input
                type="text"
                placeholder="Project name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
                required
              />
              <textarea
                placeholder="Project description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700 h-24"
              />
              <select
                value={formData.category || 'personal'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="education">Education</option>
                <option value="hobby">Hobby</option>
                <option value="other">Other</option>
              </select>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </>
          )}

          {activeTab === 'workspaces' && (
            <>
              {items.projects.length > 0 && (
                <select
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
                  required
                >
                  <option value="">Select project</option>
                  {items.projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                placeholder="Workspace name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
                required
              />
              <textarea
                placeholder="Workspace description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700 h-24"
              />
            </>
          )}

          {activeTab === 'notes' && (
            <>
              {items.workspaces.length > 0 && (
                <select
                  value={formData.workspaceId || ''}
                  onChange={(e) => setFormData({ ...formData, workspaceId: e.target.value })}
                  className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
                >
                  <option value="">Select workspace (optional)</option>
                  {items.workspaces.map(workspace => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                placeholder="Note title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
                required
              />
              <textarea
                placeholder="Note content"
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700 h-32"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={formData.tags || ''}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
              />
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {editingItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )

  const renderShareModal = () => (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            Share {sharingItem?.name || sharingItem?.title}
          </h3>
          <button
            onClick={() => setShowShareModal(false)}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <ApperIcon name="X" className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleInviteCollaborator} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Invite collaborator by email
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="flex-1 px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <ApperIcon name="Send" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>

        <div className="border-t border-surface-200 dark:border-surface-600 pt-6">
          <h4 className="font-medium text-surface-900 dark:text-surface-100 mb-4">
            Current Collaborators ({getCollaborators(sharingItem?.id, sharingItem?.type).length})
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {/* Owner */}
            <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-surface-900 dark:text-surface-100">
                    {currentUser.name} (You)
                  </div>
                  <div className="text-sm text-surface-500">{currentUser.email}</div>
                </div>
              </div>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                Owner
              </span>
            </div>

            {/* Collaborators */}
            {getCollaborators(sharingItem?.id, sharingItem?.type).map(collaborator => {
              const user = items.users.find(u => u.id === collaborator.userId)
              if (!user) return null
              
              return (
                <div key={collaborator.id} className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      {user.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-surface-800"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-surface-900 dark:text-surface-100">
                        {user.name}
                      </div>
                      <div className="text-sm text-surface-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={collaborator.permission}
                      onChange={(e) => {
                        setItems(prev => ({
                          ...prev,
                          collaborators: prev.collaborators.map(collab =>
                            collab.id === collaborator.id 
                              ? { ...collab, permission: e.target.value }
                              : collab
                          )
                        }))
                        toast.success('Permission updated')
                      }}
                      className="text-xs px-2 py-1 border border-surface-200 dark:border-surface-600 rounded bg-white dark:bg-surface-700"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                    >
                      <ApperIcon name="X" className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            })}

            {getCollaborators(sharingItem?.id, sharingItem?.type).length === 0 && (
              <div className="text-center py-6 text-surface-500">
                No collaborators yet. Invite someone to get started!
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  const renderTaskCard = (task) => (
    <div className={task.parentTaskId ? 'ml-8 relative' : ''}>
      {task.parentTaskId && (
        <div className="absolute -left-6 top-6 w-4 h-px bg-surface-300 dark:bg-surface-600"></div>
      )}
      <motion.div
      key={task.id}
      className={`bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card hover:shadow-soft transition-all duration-200 border border-surface-200 dark:border-surface-700 ${
        task.parentTaskId ? 'border-l-4 border-l-primary/30' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => toggleTaskStatus(task)}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              task.status === 'completed' 
                ? 'bg-secondary border-secondary text-white' 
                : 'border-surface-300 hover:border-secondary'
            }`}
          >
            {task.status === 'completed' && <ApperIcon name="Check" className="h-3 w-3" />}
          </button>
          <div className="flex-1">
            <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-surface-500' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-surface-600 dark:text-surface-400 text-sm mt-1">{task.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!task.parentTaskId && (
            <button
              onClick={() => handleCreateSubtask(task)}
              className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
              title="Add Subtask"
            >
              <ApperIcon name="Plus" className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleEdit(task)}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <ApperIcon name="Edit3" className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(task.id)}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <ApperIcon name="Trash2" className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
        {task.dueDate && (
          <div className={`flex items-center space-x-2`}>
            <span className={`px-2 py-1 rounded-full text-xs border ${getDeadlineColor(getDeadlineStatus(task.dueDate))}`}>
              {getDeadlineStatus(task.dueDate) === 'overdue' && 'Overdue'}
              {getDeadlineStatus(task.dueDate) === 'today' && 'Due Today'}
              {getDeadlineStatus(task.dueDate) === 'upcoming' && 'Upcoming'}
              {!getDeadlineStatus(task.dueDate) && 'Scheduled'}
            </span>
            <div className="flex items-center space-x-1 text-surface-500">
              <ApperIcon name="Calendar" className="h-3 w-3" />
              <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
          </div>
        )}
      </div>
      </motion.div>
      
      {/* Render subtasks */}
      {!task.parentTaskId && getSubtasks(task.id).length > 0 && (
        <div className="mt-4 space-y-4">
          {getSubtasks(task.id).map(subtask => renderTaskCard(subtask))}
        </div>
      )}
    </div>
  )

  const renderProjectCard = (project) => (
    <motion.div
      key={project.id}
      className="bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card hover:shadow-soft transition-all duration-200 border border-surface-200 dark:border-surface-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-lg">{project.name}</h3>
            {getCollaborators(project.id, 'projects').length > 0 && (
              <div className="flex items-center space-x-1">
                <ApperIcon name="Users" className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary font-medium">
                  {getCollaborators(project.id, 'projects').length + 1}
                </span>
              </div>
            )}
            <span className={`px-2 py-1 rounded-full text-xs border ${project.category === 'work' ? 'text-blue-600 bg-blue-50 border-blue-200' : project.category === 'personal' ? 'text-green-600 bg-green-50 border-green-200' : 'text-purple-600 bg-purple-50 border-purple-200'}`}>
              {project.category}
            </span>
          </div>
          {project.description && (
            <p className="text-surface-600 dark:text-surface-400 text-sm mb-3">{project.description}</p>
          )}
          <div className="text-sm text-surface-500">
            {getProjectWorkspaces(project.id).length} workspace(s)
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleShare(project, 'projects')}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
            title="Share Project"
          >
            <ApperIcon name="Share2" className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleProjectSelect(project)}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
            title="Select Project"
          >
            <ApperIcon name="FolderOpen" className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(project)}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <ApperIcon name="Edit3" className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(project.id)}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <ApperIcon name="Trash2" className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
        <div className="flex items-center space-x-1 text-surface-500 text-sm">
          <ApperIcon name="Calendar" className="h-3 w-3" />
          <span>{format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
        </div>
      </div>
    </motion.div>
  )

  const renderWorkspaceCard = (workspace) => {
    const project = items.projects.find(p => p.id === workspace.projectId)
    const taskCount = getWorkspaceTasks(workspace.id).length
    const noteCount = getWorkspaceNotes(workspace.id).length
    const collaborators = getCollaborators(workspace.id, 'workspaces')

    return (
    <motion.div
      key={workspace.id}
      className="bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card hover:shadow-soft transition-all duration-200 border border-surface-200 dark:border-surface-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-lg">{workspace.name}</h3>
            {collaborators.length > 0 && (
              <div className="flex items-center space-x-1">
                <ApperIcon name="Users" className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary font-medium">
                  {collaborators.length + 1}
                </span>
              </div>
            )}
          </div>
          {project && (
            <p className="text-primary text-sm font-medium mb-1">in {project.name}</p>
          )}
          {workspace.description && (
            <p className="text-surface-600 dark:text-surface-400 text-sm mb-3">{workspace.description}</p>
          )}
          )}
          <div className="flex items-center space-x-4 text-sm text-surface-500">
            <span>{taskCount} task(s)</span>
            <span>{noteCount} note(s)</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleShare(workspace, 'workspaces')}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
            title="Share Workspace"
          >
            <ApperIcon name="Share2" className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleWorkspaceSelect(workspace)}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
            title="Select Workspace"
          >
            <ApperIcon name="Layers" className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(workspace)}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <ApperIcon name="Edit3" className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(workspace.id)}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <ApperIcon name="Trash2" className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-1 text-surface-500 text-sm">
          <ApperIcon name="Calendar" className="h-3 w-3" />
          <span>{format(new Date(workspace.createdAt), 'MMM dd, yyyy')}</span>
        </div>
      </div>
    </motion.div>
    )
  }

  const renderNoteCard = (note) => (
    <motion.div
      key={note.id}
      className="bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card hover:shadow-soft transition-all duration-200 border border-surface-200 dark:border-surface-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{note.title}</h3>
          <p className="text-surface-600 dark:text-surface-400 text-sm mt-2 line-clamp-3">
            {note.content}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(note)}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <ApperIcon name="Edit3" className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(note.id)}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <ApperIcon name="Trash2" className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-1 bg-surface-100 text-surface-600 text-xs rounded-full">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center space-x-1 text-surface-500 text-sm">
          <ApperIcon name="Clock" className="h-3 w-3" />
          <span>{format(new Date(note.updatedAt), 'MMM dd')}</span>
        </div>
      </div>
    </motion.div>
  )

  // Filter items based on selected date (only for tasks)
  const getCurrentItems = () => {
    const allItems = items[activeTab] || []
    
    // Filter by workspace if one is selected
    if (selectedWorkspace && (activeTab === 'tasks' || activeTab === 'notes')) {
      return allItems.filter(item => item.workspaceId === selectedWorkspace.id)
    }
    
    if (activeTab === 'tasks' && selectedDate) {
      const filteredTasks = allItems.filter(task => 
        task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
      )
      // When filtering by date, show both parent tasks and their subtasks that match the date
      return filteredTasks
    }
    
    if (activeTab === 'tasks') {
      // For tasks, only show parent tasks (subtasks will be rendered within parents)
      return allItems.filter(task => !task.parentTaskId)
    }
    
    return allItems
  }

  const currentItems = getCurrentItems()
  const totalItems = items[activeTab]?.length || 0
  const totalParentTasks = activeTab === 'tasks' ? items.tasks.filter(task => !task.parentTaskId).length : totalItems
  const isFiltered = activeTab === 'tasks' && selectedDate
  const isWorkspaceFiltered = selectedWorkspace && (activeTab === 'tasks' || activeTab === 'notes')

  return (
    <div className="space-y-6">
      {/* Workspace/Project Selection */}
      {(selectedProject || selectedWorkspace) && (
        <div className="flex items-center space-x-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center space-x-2">
            {selectedProject && (
              <>
                <ApperIcon name="FolderOpen" className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Project: {selectedProject.name}</span>
              </>
            )}
            {selectedWorkspace && (
              <>
                <ApperIcon name="Layers" className="h-4 w-4 text-primary ml-4" />
                <span className="text-sm font-medium text-primary">Workspace: {selectedWorkspace.name}</span>
              </>
            )}
          </div>
          <div className="flex space-x-2">
            {selectedWorkspace && (
              <button
                onClick={() => setSelectedWorkspace(null)}
                className="px-3 py-1 text-xs bg-surface-200 hover:bg-surface-300 rounded-lg transition-colors"
              >
                Clear Workspace
              </button>
            )}
            {selectedProject && (
              <button
                onClick={() => {
                  setSelectedProject(null)
                  setSelectedWorkspace(null)
                }}
                className="px-3 py-1 text-xs bg-surface-200 hover:bg-surface-300 rounded-lg transition-colors"
              >
                Clear Project
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            {isFiltered ? `${currentItems.length} of ${totalParentTasks}` : currentItems.length} {activeTab}
            {isFiltered && (
              <span className="text-sm font-normal text-surface-500 ml-2">
                for {format(selectedDate, 'MMM dd, yyyy')}
              </span>
            )}
            {isWorkspaceFiltered && (
              <span className="text-sm font-normal text-surface-500 ml-2">
                in {selectedWorkspace.name}
              </span>
            )}
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            {isFiltered 
              ? `Tasks due on ${format(selectedDate, 'MMM dd, yyyy')}` 
              : isWorkspaceFiltered
                ? `${activeTab} in ${selectedWorkspace.name} workspace`
              : currentItems.length === 0 
                ? `Create your first ${activeTab.slice(0, -1)} to get started` 
                : `Manage your ${activeTab} efficiently`
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isFiltered && (
            <button
              onClick={() => setSelectedDate(null)}
              className="flex items-center space-x-2 px-4 py-2 text-surface-600 hover:text-surface-800 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="h-4 w-4" />
              <span className="text-sm">Clear Filter</span>
            </button>
          )}
          
          {/* Create workspace button for projects tab */}
          {activeTab === 'projects' && selectedProject && (
            <motion.button
              onClick={() => {
                setActiveTab('workspaces')
                setFormData({ ...getFormFields(), projectId: selectedProject.id })
                setEditingItem(null)
                setShowForm(true)
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-secondary to-secondary-dark text-white px-4 py-2 rounded-xl font-medium shadow-card hover:shadow-soft transform hover:scale-105 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="Plus" className="h-4 w-4" />
              <span className="text-sm">Add Workspace</span>
            </motion.button>
          )}
        
        <motion.button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-medium shadow-card hover:shadow-soft transform hover:scale-105 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span className="hidden sm:inline">Create {activeTab.slice(0, -1)}</span>
          <span className="sm:hidden">Create</span>
        </motion.button>
        </div>
      </div>

      {/* Items Grid */}
      {currentItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map(item => {
            switch (activeTab) {
              case 'workspaces':
                return renderWorkspaceCard(item)
              case 'tasks':
                return renderTaskCard(item)
              case 'projects':
                return renderProjectCard(item)
              case 'notes':
                return renderNoteCard(item)
              default:
                return null
            }
          })}
        </div>
      ) : (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-24 h-24 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <ApperIcon 
              name={activeTab === 'tasks' ? 'CheckSquare' : activeTab === 'projects' ? 'FolderOpen' : activeTab === 'workspaces' ? 'Layers' : 'FileText'} 
              className="h-10 w-10 text-surface-400" 
            />
          </div>
          <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
            No {activeTab} yet
          </h3>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            Start organizing your work by creating your first {activeTab.slice(0, -1)}.
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <ApperIcon name="Plus" className="h-4 w-4" />
            <span>Create {activeTab.slice(0, -1)}</span>
          </button>
        </motion.div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && renderForm()}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && renderShareModal()}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature