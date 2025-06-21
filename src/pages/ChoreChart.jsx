import { useState } from 'react'

function ChoreChart({ children, completedChores, setCompletedChores, storage }) {
  const [activeChild, setActiveChild] = useState(children[0]?.id || 1)
  const [viewMode, setViewMode] = useState('individual') // 'individual' or 'family'

  // Load available colors from storage to get hex values
  const availableColors = storage?.load('choreChart_availableColors') || [
    { name: 'primary', label: 'Blue', hex: '#0d6efd' },
    { name: 'success', label: 'Green', hex: '#198754' },
    { name: 'warning', label: 'Yellow', hex: '#ffc107' },
    { name: 'danger', label: 'Red', hex: '#dc3545' },
    { name: 'info', label: 'Cyan', hex: '#0dcaf0' },
    { name: 'secondary', label: 'Gray', hex: '#6c757d' }
  ]

  const getColorHex = (colorName) => {
    const color = availableColors.find(c => c.name === colorName)
    return color?.hex || '#6c757d'
  }

  const toggleChore = (childId, choreId) => {
    setCompletedChores(prev => {
      const childChores = prev[childId] || []
      const newChildChores = childChores.includes(choreId)
        ? childChores.filter(id => id !== choreId)
        : [...childChores, choreId]
      
      return {
        ...prev,
        [childId]: newChildChores
      }
    })
  }

  const getChildCompletedChores = (childId) => {
    return completedChores[childId] || []
  }

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return '#198754'
      case 'medium': return '#ffc107'
      case 'hard': return '#dc3545'
      default: return '#0d6efd'
    }
  }

  const getCompletionPercentage = (child) => {
    const completed = getChildCompletedChores(child.id)
    return Math.round((completed.length / child.chores.length) * 100)
  }

  const getEncouragementMessage = (percentage, childName) => {
    if (percentage === 100) return `🎉 Amazing ${childName}! You completed all chores! You're a superstar! 🌟`
    if (percentage >= 75) return `🚀 Great job ${childName}! You're almost done! Keep going! 💪`
    if (percentage >= 50) return `👍 Nice work ${childName}! You're halfway there! 🎯`
    if (percentage >= 25) return `🌱 Good start ${childName}! Keep up the great work! ✨`
    return `🎈 Ready to tackle some chores ${childName}? You've got this! 💫`
  }

  const getFamilyProgress = () => {
    const totalChores = children.reduce((sum, child) => sum + child.chores.length, 0)
    const totalCompleted = children.reduce((sum, child) => sum + getChildCompletedChores(child.id).length, 0)
    return Math.round((totalCompleted / totalChores) * 100)
  }

  const resetAllChores = () => {
    setCompletedChores({})
  }

  const resetChildChores = (childId) => {
    setCompletedChores(prev => ({
      ...prev,
      [childId]: []
    }))
  }

  const activeChildData = children.find(child => child.id === activeChild) || children[0]

  if (viewMode === 'family') {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="py-3 py-md-4 px-2 px-md-3">
              {/* View Mode Toggle - Right Aligned */}
              <div className="d-flex justify-content-end mb-3">
                <div className="btn-group" role="group">
                  <button
                    className={`btn btn-sm ${viewMode === 'individual' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('individual')}
                  >
                    <i className="bi bi-person-fill me-1"></i>
                    Individual
                  </button>
                  <button
                    className={`btn btn-sm ${viewMode === 'family' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('family')}
                  >
                    <i className="bi bi-people-fill me-1"></i>
                    Family
                  </button>
                </div>
              </div>

              {/* Family Header - Responsive */}
              <div className="text-center mb-3 mb-md-4">
                {/* Child Name Title with Color Theme */}
                <div 
                  className="bg-white rounded-4 p-4 shadow-sm border"
                  style={{
                    borderColor: 'red',
                    borderWidth: '2px'
                  }}
                >
                  {/* Content */}
                  <div className="d-flex align-items-center justify-content-center">
                      <h1 className="display-6 fw-bold text-primary">
                        <i className="bi bi-people-fill me-2"></i>
                        Family View
                      </h1>
                  </div>
                </div>
              </div>

               {/* Children Cards */}
               <div className="row g-4">
                  {children.map(child => {
                   const completed = getChildCompletedChores(child.id)
                   const childColorHex = getColorHex(child.color)
                      
                    return (
                      <div key={child.id} className="col-12 col-md-6 col-lg-4">
                        <div className="card shadow-sm" 
                           style={{
                             transform: 'none',
                             transition: 'none'
                           }}>
                          <div 
                            className="card-header text-white d-flex align-items-center justify-content-between"
                            style={{backgroundColor: childColorHex}}
                          >
                            <div className="d-flex align-items-center">
                              <span className="me-2" style={{fontSize: '1.5rem'}}>{child.avatar}</span>
                              <h5 className="mb-0">{child.name}</h5>
                            </div>
                            <span className="badge bg-light text-dark">
                              {completed.length}/{child.chores.length}
                            </span>
                          </div>
                          <div className="card-body p-0">
                            <div className="list-group list-group-flush">
                              {child.chores.map((chore, index) => {
                                const isCompleted = completed.includes(chore.id)
                                
                                return (
                                  <div 
                                    key={chore.id}
                                    className={`list-group-item d-flex align-items-center justify-content-between ${
                                      isCompleted ? 'bg-light' : ''
                                    }`}
                                    style={{
                                      borderLeft: `4px solid ${isCompleted ? '#198754' : childColorHex}`,
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => toggleChore(child.id, chore.id)}
                                  >
                                    <div className="d-flex align-items-center flex-grow-1">
                                      <div className="me-3">
                                        <span className="badge bg-secondary rounded-pill" style={{minWidth: '30px'}}>
                                          {index + 1}
                                        </span>
                                      </div>
                                      <div className="me-3">
                                        <i 
                                          className={`${chore.icon}`} 
                                          style={{
                                            fontSize: '1.5rem',
                                            color: isCompleted ? '#198754' : getDifficultyColor(chore.difficulty)
                                          }}
                                        ></i>
                                      </div>
                                      <div className="flex-grow-1">
                                        <h6 className={`mb-1 ${isCompleted ? 'text-decoration-line-through text-muted' : ''}`}>
                                          {chore.task}
                                        </h6>
                                        <div className="d-flex align-items-center gap-2">
                                          <span 
                                            className="badge"
                                            style={{
                                              fontSize: '0.7rem',
                                              backgroundColor: getDifficultyColor(chore.difficulty),
                                              color: '#fff'
                                            }}
                                          >
                                            {chore.difficulty.toUpperCase()}
                                          </span>
                                          {isCompleted && (
                                            <small className="text-success fw-semibold">
                                              <i className="bi bi-check-circle-fill me-1"></i>
                                              Completed
                                            </small>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <i 
                                        className={`bi ${isCompleted ? 'bi-check-circle-fill text-success' : 'bi-circle'}`}
                                        style={{
                                          fontSize: '1.5rem',
                                          color: isCompleted ? '#198754' : childColorHex
                                        }}
                                      ></i>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
               </div>

            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="py-3 py-md-4 px-2 px-md-3">
            {/* Child Navigation - Mobile Optimized */}
            <div className="mb-3 mb-md-4">
              {/* Mobile Dropdown for Child Selection */}
              <div className="d-md-none mb-3">
                <div className="dropdown">
                  <button 
                    className="btn dropdown-toggle w-100 text-white"
                    style={{backgroundColor: getColorHex(activeChildData.color)}}
                    type="button" 
                    data-bs-toggle="dropdown"
                  >
                    <span className="me-2" style={{fontSize: '1.2rem'}}>{activeChildData.avatar}</span>
                    {activeChildData.name}'s Chores
                    <span className="badge bg-light text-dark ms-2">
                      {getChildCompletedChores(activeChild).length}/{activeChildData.chores.length}
                    </span>
                  </button>
                  <ul className="dropdown-menu w-100">
                    {children.map(child => (
                      <li key={child.id}>
                        <button
                          className={`dropdown-item ${activeChild === child.id ? 'active' : ''}`}
                          onClick={() => setActiveChild(child.id)}
                        >
                          <span className="me-2">{child.avatar}</span>
                          {child.name}
                          <span className="badge bg-secondary ms-2">
                            {getChildCompletedChores(child.id).length}/{child.chores.length}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Desktop Navigation - Child Buttons + View Toggle */}
              <div className="d-none d-md-flex justify-content-between align-items-center">
                <div className="d-flex flex-wrap gap-2">
                  {children.map(child => {
                    const childColorHex = getColorHex(child.color)
                    return (
                      <button
                        key={child.id}
                        className={`btn rounded-pill px-3 px-lg-4 ${
                          activeChild === child.id && viewMode === 'individual'
                            ? 'text-white' 
                            : ''
                        }`}
                        style={{
                          backgroundColor: activeChild === child.id && viewMode === 'individual' ? childColorHex : 'transparent',
                          borderColor: childColorHex,
                          color: activeChild === child.id && viewMode === 'individual' ? '#fff' : childColorHex
                        }}
                        onClick={() => {
                          setActiveChild(child.id)
                          setViewMode('individual')
                        }}
                      >
                        <span className="me-2" style={{fontSize: '1.2rem'}}>{child.avatar}</span>
                        {child.name}
                        <span className="badge bg-light text-dark ms-2">
                          {getChildCompletedChores(child.id).length}/{child.chores.length}
                        </span>
                      </button>
                    )
                  })}
                </div>
                
                <div className="btn-group" role="group">
                  <button
                    className={`btn btn-sm ${viewMode === 'individual' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('individual')}
                  >
                    <i className="bi bi-person-fill me-1"></i>
                    Individual
                  </button>
                  <button
                    className={`btn btn-sm ${viewMode === 'family' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('family')}
                  >
                    <i className="bi bi-people-fill me-1"></i>
                    Family
                  </button>
                </div>
              </div>
            </div>

            {/* Individual Child Header - Responsive */}
            <div className="text-center mb-3 mb-md-4">
              {/* Child Name Title with Color Theme */}
              <div 
                className="bg-white rounded-4 p-4 mb-4 shadow-sm border"
                style={{
                  borderColor: getColorHex(activeChildData.color),
                  borderWidth: '2px'
                }}
              >
                {/* Content */}
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm"
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: getColorHex(activeChildData.color),
                      fontSize: '2.5rem'
                    }}
                  >
                    {activeChildData.avatar}
                  </div>
                  <div className="text-start">
                    <h1 className="display-6 fw-bold mb-1" style={{color: getColorHex(activeChildData.color)}}>
                      <span className="d-none d-sm-inline">{activeChildData.name}'s Chores</span>
                      <span className="d-sm-none">{activeChildData.name}</span>
                    </h1>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge text-white px-3 py-2" style={{backgroundColor: getColorHex(activeChildData.color)}}>
                        {getChildCompletedChores(activeChild).length} of {activeChildData.chores.length} done
                      </span>
                      <span 
                        className="small fw-semibold text-muted"
                      >
                        {getCompletionPercentage(activeChildData)}% Complete
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="progress position-relative mb-3" style={{height: '12px', borderRadius: '20px'}}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    style={{
                      width: `${getCompletionPercentage(activeChildData)}%`,
                      backgroundColor: getCompletionPercentage(activeChildData) === 100 ? '#198754' : getColorHex(activeChildData.color),
                      borderRadius: '20px'
                    }}
                  ></div>
                </div>
                
                {/* Encouragement Message with Clean Styling */}
                <div 
                  className="rounded-3 p-3 bg-light"
                  style={{
                    borderLeft: `4px solid ${getColorHex(activeChildData.color)}`
                  }}
                >
                  <h6 className="mb-0 lh-base fw-semibold" style={{color: getColorHex(activeChildData.color)}}>
                    {getEncouragementMessage(getCompletionPercentage(activeChildData), activeChildData.name)}
                  </h6>
                </div>
              </div>
            </div>

            {/* Chore List - Enhanced Mobile Layout */}
            <div className="row g-2 g-md-3">
              {activeChildData.chores.map(chore => {
                const completed = getChildCompletedChores(activeChild)
                const childColorHex = getColorHex(activeChildData.color)
                return (
                  <div key={chore.id} className="col-12 col-sm-6 col-lg-4">
                    <div 
                      className={`card h-100 shadow-sm border-0 ${
                        completed.includes(chore.id) 
                          ? 'bg-success text-white' 
                          : 'bg-white'
                      }`}
                      style={{
                        transform: completed.includes(chore.id) ? 'scale(0.98)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div className="card-body p-3 p-md-4">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center flex-grow-1 me-2">
                            <div className="me-2 me-md-3">
                              <i className={`${chore.icon}`} 
                                 style={{
                                   fontSize: '2rem',
                                   color: completed.includes(chore.id) 
                                     ? '#fff' 
                                     : getDifficultyColor(chore.difficulty)
                                 }}></i>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className={`mb-1 ${
                                completed.includes(chore.id) 
                                  ? 'text-decoration-line-through' 
                                  : ''
                              }`} style={{fontSize: '0.95rem', lineHeight: '1.2'}}>
                                {chore.task}
                              </h6>
                              <span className={`badge ${
                                completed.includes(chore.id) 
                                  ? 'bg-light text-success' 
                                  : ''
                              }`} 
                              style={{
                                fontSize: '0.7rem',
                                backgroundColor: completed.includes(chore.id) 
                                  ? '#f8f9fa' 
                                  : getDifficultyColor(chore.difficulty),
                                color: completed.includes(chore.id) ? '#198754' : '#fff'
                              }}>
                                {chore.difficulty.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <button
                            className={`btn btn-lg rounded-circle flex-shrink-0 ${
                              completed.includes(chore.id)
                                ? 'btn-light text-success'
                                : 'text-white'
                            }`}
                            style={{
                              backgroundColor: completed.includes(chore.id) ? '#f8f9fa' : 'transparent',
                              borderColor: completed.includes(chore.id) ? '#198754' : childColorHex,
                              color: completed.includes(chore.id) ? '#198754' : childColorHex,
                              width: window.innerWidth < 768 ? '50px' : '60px', 
                              height: window.innerWidth < 768 ? '50px' : '60px',
                              minWidth: window.innerWidth < 768 ? '50px' : '60px'
                            }}
                            onClick={() => toggleChore(activeChild, chore.id)}
                          >
                            <i className={`bi ${
                              completed.includes(chore.id) 
                                ? 'bi-check-lg' 
                                : 'bi-circle'
                            }`} style={{fontSize: window.innerWidth < 768 ? '1.2rem' : '1.5rem'}}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Completion Celebration - Responsive */}
            {getCompletionPercentage(activeChildData) === 100 && (
              <div className="text-center my-4 my-md-5">
                <div className="card bg-gradient text-white shadow-lg border-0" style={{backgroundColor: getColorHex(activeChildData.color)}}>
                  <div className="card-body p-4 p-md-5">
                    <div className="display-1 mb-3" style={{fontSize: window.innerWidth < 768 ? '4rem' : '6rem'}}>🏆</div>
                    <h2 className="fw-bold mb-3 h3 h-md-2">Congratulations {activeChildData.name}!</h2>
                    <p className="fs-6 fs-md-5 mb-4">
                      You completed all your chores today! 
                      You've earned a special reward! 🎁
                    </p>
                    <button 
                      className="btn btn-light btn-lg"
                      onClick={() => resetChildChores(activeChild)}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Start New Day
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer - Responsive */}
            <div className="text-center mt-4 mt-md-5 text-muted">
              <p className="small">
                <i className="bi bi-star-fill text-warning me-2"></i>
                <span className="d-none d-sm-inline">Great job working hard! Keep up the awesome work!</span>
                <span className="d-sm-none">Great job! Keep it up!</span>
                <i className="bi bi-star-fill text-warning ms-2"></i>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChoreChart 