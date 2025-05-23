import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = ({ activeTab }) => {
  const [items, setItems] = useState({
    tasks: [],
    projects: [],
    notes: []
  })
  
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})

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
  }, [items])

  const generateId = () => Date.now().toString()

  const getFormFields = () => {
    switch (activeTab) {
      case 'tasks':
        return {
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
          status: 'active'
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

  const handleCreate = () => {
    setFormData(getFormFields())
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
      updatedAt: new Date().toISOString()
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

    toast.success(editingItem ? `${activeTab.slice(0, -1)} updated successfully!` : `${activeTab.slice(0, -1)} created successfully!`)
    setShowForm(false)
    setFormData({})
    setEditingItem(null)
  }

  const handleDelete = (id) => {
    setItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(item => item.id !== id)
    }))
    toast.success(`${activeTab.slice(0, -1)} deleted successfully!`)
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
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-surface-700"
              />
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

          {activeTab === 'notes' && (
            <>
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

  const renderTaskCard = (task) => (
    <motion.div
      key={task.id}
      className="bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card hover:shadow-soft transition-all duration-200 border border-surface-200 dark:border-surface-700"
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
          <div className="flex items-center space-x-1 text-surface-500">
            <ApperIcon name="Calendar" className="h-3 w-3" />
            <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
          </div>
        )}
      </div>
    </motion.div>
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
          <h3 className="font-semibold text-lg">{project.name}</h3>
          {project.description && (
            <p className="text-surface-600 dark:text-surface-400 text-sm mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
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

  const currentItems = items[activeTab] || []

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            {currentItems.length} {activeTab}
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            {currentItems.length === 0 ? `Create your first ${activeTab.slice(0, -1)} to get started` : `Manage your ${activeTab} efficiently`}
          </p>
        </div>
        
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

      {/* Items Grid */}
      {currentItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map(item => {
            switch (activeTab) {
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
              name={activeTab === 'tasks' ? 'CheckSquare' : activeTab === 'projects' ? 'FolderOpen' : 'FileText'} 
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
    </div>
  )
}

export default MainFeature