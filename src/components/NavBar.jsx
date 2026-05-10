import './NavBar.css'

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { id: 'medications', label: 'Medicines', icon: '💊' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
  { id: 'emergency', label: 'Help', icon: '🆘' },
]

export default function NavBar({ activeTab, setActiveTab }) {
  return (
    <nav className="navbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          aria-label={tab.label}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
