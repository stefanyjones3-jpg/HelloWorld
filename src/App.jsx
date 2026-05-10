import { useState } from 'react'
import Home from './components/Home'
import FamilyFaces from './components/FamilyFaces'
import Medications from './components/Medications'
import Schedule from './components/Schedule'
import EmergencyContacts from './components/EmergencyContacts'
import NavBar from './components/NavBar'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="app">
      <main className="main-content">
        {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
        {activeTab === 'family' && <FamilyFaces />}
        {activeTab === 'medications' && <Medications />}
        {activeTab === 'schedule' && <Schedule />}
        {activeTab === 'emergency' && <EmergencyContacts />}
      </main>
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
