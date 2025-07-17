import { useState, useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { Dashboard } from './components/dashboard/Dashboard'
import { PropertiesView } from './components/properties/PropertiesView'
import { UnitsView } from './components/units/UnitsView'
import { TenanciesView } from './components/tenancies/TenanciesView'
import { DiaryView } from './components/diary/DiaryView'
import { MaintenanceView } from './components/maintenance/MaintenanceView'
import { InsuranceView } from './components/insurance/InsuranceView'
import { EPCView } from './components/epc/EPCView'
import { ArchiveView } from './components/archive/ArchiveView'
import { DataProvider } from './context/DataContext'
import { blink } from './blink/client'
import toast, { Toaster } from 'react-hot-toast'

const getPageTitle = (activeTab: string) => {
  switch (activeTab) {
    case 'dashboard':
      return 'Dashboard'
    case 'properties':
      return 'Properties'
    case 'units':
      return 'Units'
    case 'tenancies':
      return 'Tenancies'
    case 'diary':
      return 'My Diary'
    case 'maintenance':
      return 'Maintenance & Repairs'
    case 'insurance':
      return 'Insurance Manager'
    case 'epc':
      return 'EPC Manager'
    case 'archive':
      return 'Archive'
    default:
      return 'Dashboard'
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchValue, setSearchValue] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'properties':
        return <PropertiesView searchValue={searchValue} />
      case 'units':
        return <UnitsView searchValue={searchValue} />
      case 'tenancies':
        return <TenanciesView searchValue={searchValue} />
      case 'diary':
        return <DiaryView searchValue={searchValue} />
      case 'maintenance':
        return <MaintenanceView searchValue={searchValue} />
      case 'insurance':
        return <InsuranceView searchValue={searchValue} />
      case 'epc':
        return <EPCView searchValue={searchValue} />
      case 'archive':
        return <ArchiveView searchValue={searchValue} />
      default:
        return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Commercial Property Management</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your property portfolio</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <DataProvider>
        <div className="min-h-screen bg-gray-50">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="lg:pl-64">
            <Header
              title={getPageTitle(activeTab)}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              showSearch={activeTab !== 'dashboard'}
            />
            
            <main className="p-6">
              {renderContent()}
            </main>
          </div>
        </div>
      </DataProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  )
}

export default App