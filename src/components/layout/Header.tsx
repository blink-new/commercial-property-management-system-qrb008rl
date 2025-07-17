import { Bell, Search, User, LogOut } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { blink } from '../../blink/client'

interface HeaderProps {
  title: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
}

export function Header({ title, searchValue = '', onSearchChange, showSearch = true }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}
          
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => blink.auth.logout()}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}