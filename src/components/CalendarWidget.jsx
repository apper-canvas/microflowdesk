import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Calendar from 'react-calendar'
import { format, isSameDay, isToday, isPast, startOfDay } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import 'react-calendar/dist/Calendar.css'

const CalendarWidget = ({ sidebarCollapsed, selectedDate, setSelectedDate }) => {
  const [tasks, setTasks] = useState([])
  const [hoveredDate, setHoveredDate] = useState(null)

  // Load tasks from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('flowdesk-data')
    if (savedData) {
      const data = JSON.parse(savedData)
      setTasks(data.tasks || [])
    }
  }, [])

  // Listen for storage changes to update tasks
  useEffect(() => {
    const handleStorageChange = () => {
      const savedData = localStorage.getItem('flowdesk-data')
      if (savedData) {
        const data = JSON.parse(savedData)
        setTasks(data.tasks || [])
      }
    }

    window.addEventListener('storage', handleStorageChange)
    // Also listen for custom events from the app
    window.addEventListener('tasksUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tasksUpdated', handleStorageChange)
    }
  }, [])

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    )
  }

  // Get deadline status for a date
  const getDeadlineStatus = (date) => {
    const dateTasks = getTasksForDate(date)
    if (dateTasks.length === 0) return null
    
    const dateStart = startOfDay(date)
    const today = startOfDay(new Date())
    
    if (isPast(dateStart) && !isSameDay(dateStart, today)) {
      return 'overdue'
    } else if (isToday(dateStart)) {
      return 'today'
    } else {
      return 'upcoming'
    }
  }

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date)
    const dateTasks = getTasksForDate(date)
    
    if (dateTasks.length > 0) {
      toast.info(`${dateTasks.length} task${dateTasks.length > 1 ? 's' : ''} due on ${format(date, 'MMM dd, yyyy')}`)
    } else {
      toast.info(`No tasks due on ${format(date, 'MMM dd, yyyy')}`)
    }
  }

  // Custom tile content for calendar
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null
    
    const status = getDeadlineStatus(date)
    const taskCount = getTasksForDate(date).length
    
    if (!status || taskCount === 0) return null

    return (
      <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
        status === 'overdue' ? 'bg-red-500' :
        status === 'today' ? 'bg-orange-500' :
        'bg-blue-500'
      }`} />
    )
  }

  // Custom tile class name for styling
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return ''
    
    const status = getDeadlineStatus(date)
    const taskCount = getTasksForDate(date).length
    
    if (!status || taskCount === 0) return ''

    return `deadline-tile deadline-${status}`
  }

  if (sidebarCollapsed) {
    return (
      <div className="p-2">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <ApperIcon name="Calendar" className="h-4 w-4 text-primary" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="p-4 border-t border-surface-200 dark:border-surface-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-2 mb-3">
        <ApperIcon name="Calendar" className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm text-surface-700 dark:text-surface-300">Calendar</span>
      </div>
      
      <Calendar
        onChange={handleDateSelect}
        value={selectedDate}
        tileContent={tileContent}
        tileClassName={tileClassName}
        className="calendar-widget"
      />
    </motion.div>
  )
}

export default CalendarWidget