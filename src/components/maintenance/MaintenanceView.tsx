import { useState } from 'react'
import { Plus, Search, Filter, Wrench, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { MaintenanceForm } from './MaintenanceForm'
import { MaintenanceDetailsModal } from './MaintenanceDetailsModal'
import { useData } from '../../context/DataContext'
import { MaintenanceIssue } from '../../types'
import { formatCurrency } from '../../types'

interface MaintenanceViewProps {
  searchValue: string
}

export function MaintenanceView({ searchValue }: MaintenanceViewProps) {
  const { maintenanceIssues, properties, units } = useData()
  const [showForm, setShowForm] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<MaintenanceIssue | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const getStatusIcon = (status: MaintenanceIssue['status']) => {
    switch (status) {
      case 'reported':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusColor = (status: MaintenanceIssue['status']) => {
    switch (status) {
      case 'reported':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
    }
  }

  const getPriorityColor = (priority: MaintenanceIssue['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
    }
  }

  const filteredIssues = maintenanceIssues
    .filter(issue => !issue.isArchived)
    .filter(issue => {
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false
      if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false
      
      const property = properties.find(p => p.id === issue.propertyId)
      const unit = issue.unitId ? units.find(u => u.id === issue.unitId) : null
      
      const searchLower = searchValue.toLowerCase()
      return (
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower) ||
        property?.name.toLowerCase().includes(searchLower) ||
        unit?.unitNumber.toLowerCase().includes(searchLower) ||
        issue.assignedTo?.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      // Sort by priority first (urgent > high > medium > low), then by date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      return new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime()
    })

  const getPropertyName = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.name || 'Unknown Property'
  }

  const getUnitNumber = (unitId?: string) => {
    if (!unitId) return null
    return units.find(u => u.id === unitId)?.unitNumber
  }

  const stats = {
    total: filteredIssues.length,
    reported: filteredIssues.filter(i => i.status === 'reported').length,
    inProgress: filteredIssues.filter(i => i.status === 'in_progress').length,
    completed: filteredIssues.filter(i => i.status === 'completed').length,
    overdue: filteredIssues.filter(i => 
      i.deadline && new Date(i.deadline) < new Date() && i.status !== 'completed'
    ).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance & Repairs</h1>
          <p className="text-gray-600">Track and manage property maintenance issues</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Log Issue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Reported</p>
                <p className="text-2xl font-bold text-red-600">{stats.reported}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search maintenance issues..."
              value={searchValue}
              className="pl-10"
              readOnly
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Issues List */}
      <div className="grid gap-4">
        {filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance issues found</h3>
              <p className="text-gray-600 mb-4">
                {searchValue ? 'Try adjusting your search or filters.' : 'Get started by reporting your first maintenance issue.'}
              </p>
              {!searchValue && (
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Issue
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredIssues.map((issue) => {
            const property = properties.find(p => p.id === issue.propertyId)
            const unit = issue.unitId ? units.find(u => u.id === issue.unitId) : null
            const isOverdue = issue.deadline && new Date(issue.deadline) < new Date() && issue.status !== 'completed'
            
            return (
              <Card 
                key={issue.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}
                onClick={() => setSelectedIssue(issue)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(issue.status)}
                        <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority.toUpperCase()}
                        </Badge>
                        {isOverdue && (
                          <Badge className="bg-red-100 text-red-800">OVERDUE</Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>
                          <strong>Property:</strong> {property?.name}
                          {unit && <span> - Unit {unit.unitNumber}</span>}
                        </span>
                        <span>
                          <strong>Reported:</strong> {new Date(issue.reportedDate).toLocaleDateString()}
                        </span>
                        {issue.deadline && (
                          <span>
                            <strong>Deadline:</strong> {new Date(issue.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {issue.assignedTo && (
                          <span>
                            <strong>Assigned to:</strong> {issue.assignedTo}
                          </span>
                        )}
                      </div>
                      
                      {(issue.estimatedCost || issue.actualCost) && (
                        <div className="flex gap-4 mt-2 text-sm">
                          {issue.estimatedCost && (
                            <span className="text-gray-600">
                              <strong>Est. Cost:</strong> {formatCurrency(issue.estimatedCost)}
                            </span>
                          )}
                          {issue.actualCost && (
                            <span className="text-gray-600">
                              <strong>Actual Cost:</strong> {formatCurrency(issue.actualCost)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <MaintenanceForm
          onClose={() => setShowForm(false)}
        />
      )}
      
      {selectedIssue && (
        <MaintenanceDetailsModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  )
}