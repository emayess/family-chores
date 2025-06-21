import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import ChoreChart from './pages/ChoreChart'
import Dashboard from './pages/Dashboard'
import './App.css'

function Navigation() {
  const location = useLocation()
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid px-3 px-md-4">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-house-heart-fill me-2"></i>
          Family Chore Chart
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
              >
                <i className="bi bi-list-check me-1"></i>
                Chore Chart
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} 
                to="/dashboard"
              >
                <i className="bi bi-gear-fill me-1"></i>
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

// Default children data
const defaultChildren = [
  {
    id: 1,
    name: "Adalee",
    avatar: "🐱",
    color: "purple",
    chores: [
      { id: 1, task: "Make your bed", icon: "bi-house-door", difficulty: "easy" },
      { id: 2, task: "Brush your teeth", icon: "bi-droplet", difficulty: "easy" },
      { id: 3, task: "Put toys away", icon: "bi-box", difficulty: "easy" },
      { id: 4, task: "Feed the goldfish", icon: "bi-heart", difficulty: "medium" },
      { id: 5, task: "Set the table", icon: "bi-cup", difficulty: "medium" },
      { id: 6, task: "Water the plants", icon: "bi-flower1", difficulty: "hard" },
    ]
  },
  {
    id: 2,
    name: "Braelynn",
    avatar: "🐱",
    color: "pink",
    chores: [
      { id: 1, task: "Make your bed", icon: "bi-house-door", difficulty: "easy" },
      { id: 2, task: "Brush your teeth", icon: "bi-droplet", difficulty: "easy" },
      { id: 3, task: "Organize bookshelf", icon: "bi-book", difficulty: "medium" },
      { id: 4, task: "Feed the cat", icon: "bi-heart", difficulty: "medium" },
      { id: 5, task: "Take out trash", icon: "bi-trash", difficulty: "hard" },
      { id: 6, task: "Vacuum bedroom", icon: "bi-house", difficulty: "hard" },
    ]
  },
  {
    id: 3,
    name: "Calvin",
    avatar: "🐶",
    color: "primary",
    chores: [
      { id: 1, task: "Put away toys", icon: "bi-box", difficulty: "easy" },
      { id: 2, task: "Brush your teeth", icon: "bi-droplet", difficulty: "easy" },
      { id: 3, task: "Help set napkins", icon: "bi-cup", difficulty: "easy" },
      { id: 4, task: "Put shoes away", icon: "bi-shoe", difficulty: "easy" },
    ]
  }
]

// Local storage keys
const STORAGE_KEYS = {
  CHILDREN: 'choreChart_children',
  COMPLETED_CHORES: 'choreChart_completedChores',
  LAST_SAVED: 'choreChart_lastSaved'
}

// Local storage utilities
const storage = {
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString())
      return true
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      return false
    }
  },
  
  load: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      return defaultValue
    }
  },
  
  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  },
  
  export: () => {
    try {
      const data = {
        children: storage.load(STORAGE_KEYS.CHILDREN, []),
        completedChores: storage.load(STORAGE_KEYS.COMPLETED_CHORES, {}),
        lastSaved: storage.load(STORAGE_KEYS.LAST_SAVED),
        exportDate: new Date().toISOString()
      }
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Error exporting data:', error)
      return null
    }
  },
  
  import: (jsonString) => {
    try {
      const data = JSON.parse(jsonString)
      if (data.children && Array.isArray(data.children)) {
        storage.save(STORAGE_KEYS.CHILDREN, data.children)
        storage.save(STORAGE_KEYS.COMPLETED_CHORES, data.completedChores || {})
        return true
      }
      return false
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
}

function App() {
  // Load initial data from localStorage or use defaults
  const [children, setChildren] = useState(() => {
    const savedChildren = storage.load(STORAGE_KEYS.CHILDREN)
    return savedChildren && savedChildren.length > 0 ? savedChildren : defaultChildren
  })

  const [completedChores, setCompletedChores] = useState(() => {
    return storage.load(STORAGE_KEYS.COMPLETED_CHORES, {})
  })

  // Save children data to localStorage whenever it changes
  useEffect(() => {
    storage.save(STORAGE_KEYS.CHILDREN, children)
  }, [children])

  // Save completed chores to localStorage whenever they change
  useEffect(() => {
    storage.save(STORAGE_KEYS.COMPLETED_CHORES, completedChores)
  }, [completedChores])

  // Enhanced setChildren function that also handles localStorage
  const updateChildren = (newChildren) => {
    if (typeof newChildren === 'function') {
      setChildren(prev => {
        const updated = newChildren(prev)
        storage.save(STORAGE_KEYS.CHILDREN, updated)
        return updated
      })
    } else {
      setChildren(newChildren)
      storage.save(STORAGE_KEYS.CHILDREN, newChildren)
    }
  }

  // Enhanced setCompletedChores function that also handles localStorage
  const updateCompletedChores = (newCompletedChores) => {
    if (typeof newCompletedChores === 'function') {
      setCompletedChores(prev => {
        const updated = newCompletedChores(prev)
        storage.save(STORAGE_KEYS.COMPLETED_CHORES, updated)
        return updated
      })
    } else {
      setCompletedChores(newCompletedChores)
      storage.save(STORAGE_KEYS.COMPLETED_CHORES, newCompletedChores)
    }
  }

  return (
    <Router basename="/family-chores">
      <div className="min-vh-100 bg-light">
        <Navigation />
        <Routes>
          <Route 
            path="/" 
            element={
              <ChoreChart 
                children={children} 
                completedChores={completedChores}
                setCompletedChores={updateCompletedChores}
                storage={storage}
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                children={children}
                setChildren={updateChildren}
                completedChores={completedChores}
                setCompletedChores={updateCompletedChores}
                storage={storage}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
