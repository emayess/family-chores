import { useState, useEffect } from 'react'

function Dashboard({ children, setChildren, completedChores, setCompletedChores, storage }) {
  const [showAddChild, setShowAddChild] = useState(false)
  const [editingChild, setEditingChild] = useState(null)
  const [showColorManager, setShowColorManager] = useState(false)
  const [newChild, setNewChild] = useState({
    name: '',
    avatar: '👶',
    color: 'primary'
  })

  const availableAvatars = ['👶', '👧', '👦', '🧒', '👩', '👨', '🧑', '🐱', '🐶', '🦊', '🐼', '🦄']
  
  // Default color palette with more options
  const defaultColors = [
    { name: 'primary', label: 'Blue', hex: '#0d6efd' },
    { name: 'success', label: 'Green', hex: '#198754' },
    { name: 'warning', label: 'Yellow', hex: '#ffc107' },
    { name: 'danger', label: 'Red', hex: '#dc3545' },
    { name: 'info', label: 'Cyan', hex: '#0dcaf0' },
    { name: 'secondary', label: 'Gray', hex: '#6c757d' },
    { name: 'purple', label: 'Purple', hex: '#6f42c1' },
    { name: 'pink', label: 'Pink', hex: '#d63384' },
    { name: 'teal', label: 'Teal', hex: '#20c997' },
    { name: 'orange', label: 'Orange', hex: '#fd7e14' },
    { name: 'indigo', label: 'Indigo', hex: '#6610f2' },
    { name: 'lime', label: 'Lime', hex: '#32cd32' }
  ]

  // Load available colors from storage or use defaults
  const [availableColors, setAvailableColors] = useState(() => {
    const savedColors = storage.load('choreChart_availableColors')
    return savedColors && savedColors.length > 0 ? savedColors : defaultColors
  })

  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#000000')
  const [newColorLabel, setNewColorLabel] = useState('')

  // Save available colors to storage whenever they change
  useEffect(() => {
    storage.save('choreChart_availableColors', availableColors)
  }, [availableColors, storage])

  const defaultChores = [
    { id: 1, task: "Make your bed", icon: "bi-house-door", difficulty: "easy" },
    { id: 2, task: "Brush your teeth", icon: "bi-droplet", difficulty: "easy" },
    { id: 3, task: "Put toys away", icon: "bi-box", difficulty: "easy" },
    { id: 4, task: "Help with dishes", icon: "bi-cup", difficulty: "medium" },
  ]

  const addChild = () => {
    if (newChild.name.trim() === '') return

    const newId = Math.max(...children.map(c => c.id), 0) + 1
    const childToAdd = {
      id: newId,
      name: newChild.name.trim(),
      avatar: newChild.avatar,
      color: newChild.color,
      chores: defaultChores.map(chore => ({
        ...chore,
        id: chore.id
      }))
    }

    setChildren(prev => [...prev, childToAdd])
    setNewChild({ name: '', avatar: '👶', color: availableColors[0]?.name || 'primary' })
    setShowAddChild(false)
  }

  const removeChild = (childId) => {
    if (children.length <= 1) {
      alert("You must have at least one child!")
      return
    }

    if (window.confirm("Are you sure you want to remove this child? This will delete all their chore progress.")) {
      setChildren(prev => prev.filter(child => child.id !== childId))
      
      // Clean up completed chores for this child
      setCompletedChores(prev => {
        const newCompletedChores = { ...prev }
        delete newCompletedChores[childId]
        return newCompletedChores
      })
    }
  }

  const editChild = (child) => {
    setEditingChild(child)
    setNewChild({
      name: child.name,
      avatar: child.avatar,
      color: child.color
    })
    setShowAddChild(true)
  }

  const updateChild = () => {
    if (newChild.name.trim() === '') return

    setChildren(prev => prev.map(child => 
      child.id === editingChild.id 
        ? { ...child, name: newChild.name.trim(), avatar: newChild.avatar, color: newChild.color }
        : child
    ))
    setEditingChild(null)
    setNewChild({ name: '', avatar: '👶', color: availableColors[0]?.name || 'primary' })
    setShowAddChild(false)
  }

  const resetChildProgress = (childId) => {
    if (window.confirm("Are you sure you want to reset this child's progress? This will clear all completed chores.")) {
      setCompletedChores(prev => ({
        ...prev,
        [childId]: []
      }))
    }
  }

  const resetAllProgress = () => {
    if (window.confirm("Are you sure you want to reset ALL children's progress? This will clear all completed chores for everyone.")) {
      setCompletedChores({})
    }
  }

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear ALL data? This will remove all children and progress. This action cannot be undone!")) {
      if (storage.clear()) {
        // Reload the page to reset to default state
        window.location.reload()
      } else {
        alert("Error clearing data. Please try again.")
      }
    }
  }

  const exportData = () => {
    const dataString = storage.export()
    if (dataString) {
      const blob = new Blob([dataString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `chore-chart-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      alert("Error exporting data. Please try again.")
    }
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const jsonString = e.target.result
      if (storage.import(jsonString)) {
        if (window.confirm("Data imported successfully! The page will reload to apply changes.")) {
          window.location.reload()
        }
      } else {
        alert("Error importing data. Please check the file format and try again.")
      }
    }
    reader.readAsText(file)
    // Reset file input
    event.target.value = ''
  }

  // Color management functions
  const addCustomColor = () => {
    if (!newColorName.trim() || !newColorLabel.trim()) {
      alert("Please enter both a color name and label.")
      return
    }

    if (availableColors.some(color => color.name === newColorName.trim())) {
      alert("A color with this name already exists.")
      return
    }

    const newColor = {
      name: newColorName.trim().toLowerCase().replace(/\s+/g, '-'),
      label: newColorLabel.trim(),
      hex: newColorHex,
      custom: true
    }

    setAvailableColors(prev => [...prev, newColor])
    setNewColorName('')
    setNewColorLabel('')
    setNewColorHex('#000000')
  }

  const removeColor = (colorName) => {
    // Don't allow removing if it would leave less than 3 colors
    if (availableColors.length <= 3) {
      alert("You must have at least 3 colors available.")
      return
    }

    // Check if any children are using this color
    const childrenUsingColor = children.filter(child => child.color === colorName)
    if (childrenUsingColor.length > 0) {
      if (!window.confirm(`${childrenUsingColor.length} child(ren) are using this color. They will be changed to the first available color. Continue?`)) {
        return
      }

      // Update children using this color to use the first available color
      const newColor = availableColors.find(c => c.name !== colorName)?.name || 'primary'
      setChildren(prev => prev.map(child => 
        child.color === colorName ? { ...child, color: newColor } : child
      ))
    }

    setAvailableColors(prev => prev.filter(color => color.name !== colorName))
  }

  const resetColorsToDefault = () => {
    if (window.confirm("Reset to default color palette? This will update any children using custom colors.")) {
      // Update children using removed colors to use primary
      const defaultColorNames = defaultColors.map(c => c.name)
      setChildren(prev => prev.map(child => 
        !defaultColorNames.includes(child.color) ? { ...child, color: 'primary' } : child
      ))
      
      setAvailableColors(defaultColors)
    }
  }

  const getChildCompletedChores = (childId) => {
    return completedChores[childId] || []
  }

  const getCompletionPercentage = (child) => {
    const completed = getChildCompletedChores(child.id)
    return Math.round((completed.length / child.chores.length) * 100)
  }

  const getStorageInfo = () => {
    try {
      const lastSaved = storage.load('choreChart_lastSaved')
      const totalChores = children.reduce((sum, child) => sum + child.chores.length, 0)
      const totalCompleted = Object.values(completedChores).reduce((sum, chores) => sum + chores.length, 0)
      
      return {
        lastSaved: lastSaved ? new Date(lastSaved).toLocaleString() : 'Never',
        totalChores,
        totalCompleted,
        storageUsed: new Blob([storage.export()]).size
      }
    } catch (error) {
      return {
        lastSaved: 'Error',
        totalChores: 0,
        totalCompleted: 0,
        storageUsed: 0
      }
    }
  }

  const storageInfo = getStorageInfo()

  return (
      <div className="container-fluid">
    <div className="row justify-content-center">
      <div className="col-12 col-xxl-11">
          <div className="py-3 py-md-4 px-2 px-md-3">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="display-5 fw-bold text-primary mb-3">
                <i className="bi bi-gear-fill me-3"></i>
                Dashboard
              </h1>
              <p className="text-muted">Manage your family's chore chart settings and children</p>
            </div>

            {/* Storage Status */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-info">
                  <div className="card-header bg-info text-white">
                    <h6 className="mb-0">
                      <i className="bi bi-database-fill me-2"></i>
                      Data Storage Status
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-6 col-md-3">
                        <small className="text-muted">Last Saved</small>
                        <div className="fw-bold text-success">{storageInfo.lastSaved}</div>
                      </div>
                      <div className="col-6 col-md-3">
                        <small className="text-muted">Total Chores</small>
                        <div className="fw-bold">{storageInfo.totalChores}</div>
                      </div>
                      <div className="col-6 col-md-3">
                        <small className="text-muted">Completed Today</small>
                        <div className="fw-bold text-primary">{storageInfo.totalCompleted}</div>
                      </div>
                      <div className="col-6 col-md-3">
                        <small className="text-muted">Storage Used</small>
                        <div className="fw-bold">{(storageInfo.storageUsed / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Management */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-warning">
                  <div className="card-header bg-warning text-dark">
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0">
                        <i className="bi bi-palette-fill me-2"></i>
                        Color Palette Management ({availableColors.length} colors)
                      </h6>
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => setShowColorManager(!showColorManager)}
                      >
                        <i className={`bi bi-chevron-${showColorManager ? 'up' : 'down'}`}></i>
                      </button>
                    </div>
                  </div>
                  {showColorManager && (
                    <div className="card-body">
                      {/* Current Colors */}
                      <div className="mb-4">
                        <h6 className="mb-3">Available Colors</h6>
                        <div className="row g-2">
                          {availableColors.map(color => (
                            <div key={color.name} className="col-6 col-sm-4 col-md-3 col-lg-2">
                              <div className="card h-100">
                                <div 
                                  className="card-body p-2 text-center position-relative"
                                  style={{backgroundColor: color.hex, minHeight: '80px'}}
                                >
                                  <div className="text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>
                                    <small className="fw-bold d-block">{color.label}</small>
                                    <small className="opacity-75">{color.name}</small>
                                  </div>
                                  {color.custom && (
                                    <button
                                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                      onClick={() => removeColor(color.name)}
                                      style={{width: '24px', height: '24px', padding: '0', fontSize: '0.7rem'}}
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                                <div className="card-footer p-1 text-center">
                                  <small className="text-muted">{color.hex}</small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add Custom Color */}
                      <div className="border-top pt-4">
                        <h6 className="mb-3">Add Custom Color</h6>
                        <div className="row g-3">
                          <div className="col-md-3">
                            <label className="form-label">Color Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newColorName}
                              onChange={(e) => setNewColorName(e.target.value)}
                              placeholder="e.g., royal-blue"
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Display Label</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newColorLabel}
                              onChange={(e) => setNewColorLabel(e.target.value)}
                              placeholder="e.g., Royal Blue"
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Color</label>
                            <div className="d-flex gap-2">
                              <input
                                type="color"
                                className="form-control form-control-color"
                                value={newColorHex}
                                onChange={(e) => setNewColorHex(e.target.value)}
                              />
                              <input
                                type="text"
                                className="form-control"
                                value={newColorHex}
                                onChange={(e) => setNewColorHex(e.target.value)}
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                          <div className="col-md-3 d-flex align-items-end">
                            <button
                              className="btn btn-success w-100"
                              onClick={addCustomColor}
                            >
                              <i className="bi bi-plus-lg me-2"></i>
                              Add Color
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Color Management Actions */}
                      <div className="border-top pt-4 mt-4">
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-outline-warning"
                            onClick={resetColorsToDefault}
                          >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Reset to Defaults
                          </button>
                          <div className="text-muted small align-self-center">
                            <i className="bi bi-info-circle me-1"></i>
                            Custom colors are saved automatically. Remove custom colors with the × button.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-lightning-fill me-2"></i>
                      Quick Actions
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-6 col-lg-2">
                        <button 
                          className="btn btn-success w-100"
                          onClick={() => {
                            setEditingChild(null)
                            setNewChild({ name: '', avatar: '👶', color: availableColors[0]?.name || 'primary' })
                            setShowAddChild(true)
                          }}
                        >
                          <i className="bi bi-person-plus-fill me-2"></i>
                          <span className="d-none d-sm-inline">Add Child</span>
                          <span className="d-sm-none">Add</span>
                        </button>
                      </div>
                      <div className="col-6 col-lg-2">
                        <button 
                          className="btn btn-warning w-100"
                          onClick={resetAllProgress}
                        >
                          <i className="bi bi-arrow-clockwise me-2"></i>
                          <span className="d-none d-sm-inline">Reset All</span>
                          <span className="d-sm-none">Reset</span>
                        </button>
                      </div>
                      <div className="col-6 col-lg-2">
                        <button 
                          className="btn btn-info w-100"
                          onClick={exportData}
                        >
                          <i className="bi bi-download me-2"></i>
                          <span className="d-none d-sm-inline">Export</span>
                          <span className="d-sm-none">Export</span>
                        </button>
                      </div>
                      <div className="col-6 col-lg-2">
                        <label className="btn btn-secondary w-100 mb-0">
                          <i className="bi bi-upload me-2"></i>
                          <span className="d-none d-sm-inline">Import</span>
                          <span className="d-sm-none">Import</span>
                          <input 
                            type="file" 
                            accept=".json" 
                            onChange={importData}
                            style={{display: 'none'}}
                          />
                        </label>
                      </div>
                      <div className="col-6 col-lg-2">
                        <button 
                          className="btn btn-danger w-100"
                          onClick={clearAllData}
                        >
                          <i className="bi bi-trash3-fill me-2"></i>
                          <span className="d-none d-sm-inline">Clear All</span>
                          <span className="d-sm-none">Clear</span>
                        </button>
                      </div>
                      <div className="col-6 col-lg-2">
                        <div className="text-center">
                          <div className="fw-bold text-success fs-4">
                            {Math.round(children.reduce((sum, child) => sum + getCompletionPercentage(child), 0) / children.length) || 0}%
                          </div>
                          <small className="text-muted">Avg Progress</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Children Management */}
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-secondary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-people-fill me-2"></i>
                      Manage Children ({children.length})
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-4">
                      {children.map(child => {
                        const percentage = getCompletionPercentage(child)
                        const completed = getChildCompletedChores(child.id)
                        const childColor = availableColors.find(c => c.name === child.color)
                        
                        return (
                          <div key={child.id} className="col-12 col-md-6 col-lg-4">
                            <div className={`card h-100`} style={{borderColor: childColor?.hex || '#6c757d', borderWidth: '2px'}}>
                              <div className={`card-header text-white`} style={{backgroundColor: childColor?.hex || '#6c757d'}}>
                                <div className="d-flex align-items-center justify-content-between">
                                  <h6 className="mb-0">
                                    <span className="me-2" style={{fontSize: '1.3rem'}}>{child.avatar}</span>
                                    {child.name}
                                  </h6>
                                  <div className="dropdown">
                                    <button
                                      className="btn btn-sm btn-outline-light"
                                      type="button"
                                      data-bs-toggle="dropdown"
                                    >
                                      <i className="bi bi-three-dots-vertical"></i>
                                    </button>
                                    <ul className="dropdown-menu">
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={() => editChild(child)}
                                        >
                                          <i className="bi bi-pencil-square me-2"></i>
                                          Edit
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={() => resetChildProgress(child.id)}
                                        >
                                          <i className="bi bi-arrow-clockwise me-2"></i>
                                          Reset Progress
                                        </button>
                                      </li>
                                      <li><hr className="dropdown-divider" /></li>
                                      <li>
                                        <button
                                          className="dropdown-item text-danger"
                                          onClick={() => removeChild(child.id)}
                                        >
                                          <i className="bi bi-trash3 me-2"></i>
                                          Remove
                                        </button>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div className="card-body">
                                <div className="row mb-3">
                                  <div className="col-6">
                                    <small className="text-muted">Progress</small>
                                    <div className={`fw-bold`} style={{color: percentage === 100 ? '#198754' : (childColor?.hex || '#6c757d')}}>
                                      {percentage}%
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <small className="text-muted">Completed</small>
                                    <div className="fw-bold">
                                      {completed.length} / {child.chores.length}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="progress mb-3" style={{height: '10px'}}>
                                  <div 
                                    className="progress-bar"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: percentage === 100 ? '#198754' : (childColor?.hex || '#6c757d')
                                    }}
                                  ></div>
                                </div>

                                <div className="mb-3">
                                  <small className="text-muted">Chores ({child.chores.length})</small>
                                  <div className="mt-1">
                                    {child.chores.slice(0, 3).map(chore => (
                                      <span key={chore.id} className="badge bg-light text-dark me-1 mb-1" style={{fontSize: '0.7rem'}}>
                                        <i className={`${chore.icon} me-1`}></i>
                                        {chore.task.length > 15 ? `${chore.task.substring(0, 15)}...` : chore.task}
                                      </span>
                                    ))}
                                    {child.chores.length > 3 && (
                                      <span className="badge bg-secondary" style={{fontSize: '0.7rem'}}>
                                        +{child.chores.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="d-flex gap-2">
                                  <button
                                    className={`btn btn-sm flex-fill text-white`}
                                    style={{backgroundColor: childColor?.hex || '#6c757d'}}
                                    onClick={() => editChild(child)}
                                  >
                                    <i className="bi bi-pencil me-1"></i>
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => removeChild(child.id)}
                                  >
                                    <i className="bi bi-trash3"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      
                      {/* Add Child Card */}
                      <div className="col-12 col-md-6 col-lg-4">
                        <div className="card border-dashed h-100 d-flex align-items-center justify-content-center" style={{borderStyle: 'dashed', borderWidth: '2px'}}>
                          <div className="text-center p-4">
                            <i className="bi bi-person-plus display-1 text-muted mb-3"></i>
                            <h5 className="text-muted mb-3">Add New Child</h5>
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                setEditingChild(null)
                                setNewChild({ name: '', avatar: '👶', color: availableColors[0]?.name || 'primary' })
                                setShowAddChild(true)
                              }}
                            >
                              <i className="bi bi-plus-lg me-2"></i>
                              Add Child
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Child Modal */}
      {showAddChild && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`bi ${editingChild ? 'bi-pencil-square' : 'bi-person-plus'} me-2`}></i>
                  {editingChild ? 'Edit Child' : 'Add New Child'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowAddChild(false)
                    setEditingChild(null)
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  editingChild ? updateChild() : addChild();
                }}>
                  <div className="mb-3">
                    <label htmlFor="childName" className="form-label">Child's Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="childName"
                      value={newChild.name}
                      onChange={(e) => setNewChild(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter child's name"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Choose Avatar</label>
                    <div className="d-flex flex-wrap gap-2">
                      {availableAvatars.map(avatar => (
                        <button
                          key={avatar}
                          type="button"
                          className={`btn ${newChild.avatar === avatar ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setNewChild(prev => ({ ...prev, avatar }))}
                          style={{fontSize: '1.5rem', width: '50px', height: '50px'}}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Choose Color Theme</label>
                    <div className="d-flex flex-wrap gap-2">
                      {availableColors.map(color => (
                        <button
                          key={color.name}
                          type="button"
                          className={`btn text-white ${newChild.color === color.name ? 'border border-dark border-3' : ''}`}
                          style={{
                            backgroundColor: color.hex,
                            width: '60px', 
                            height: '60px',
                            position: 'relative'
                          }}
                          onClick={() => setNewChild(prev => ({ ...prev, color: color.name }))}
                          title={color.label}
                        >
                          {newChild.color === color.name && <i className="bi bi-check-lg"></i>}
                          <div 
                            className="position-absolute bottom-0 start-0 end-0 text-center"
                            style={{fontSize: '0.6rem', textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}
                          >
                            {color.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowAddChild(false)
                    setEditingChild(null)
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={editingChild ? updateChild : addChild}
                  disabled={newChild.name.trim() === ''}
                >
                  <i className={`bi ${editingChild ? 'bi-check-lg' : 'bi-person-plus'} me-2`}></i>
                  {editingChild ? 'Update Child' : 'Add Child'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard 