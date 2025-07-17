import { useState } from 'react'
import { Building2, Home, Users, Archive, BarChart3, Menu, X, Zap, Calendar, Wrench, Shield, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'properties', name: 'Properties', icon: Building2 },
  { id: 'units', name: 'Units', icon: Home },
  { id: 'tenancies', name: 'Tenancies', icon: Users },
  { id: 'diary', name: 'My Diary', icon: Calendar },
  { id: 'maintenance', name: 'Maintenance', icon: Wrench },
  { id: 'insurance', name: 'Insurance', icon: Shield },
  { id: 'epc', name: 'EPC Manager', icon: Zap },
  { id: 'archive', name: 'Archive', icon: Archive },
  { id: 'recycle-bin', name: 'Recycle Bin', icon: Trash2 },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">PropManager</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start text-left font-medium',
                activeTab === item.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={() => {
                onTabChange(item.id)
                setIsMobileOpen(false)
              }}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Button>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  )
}