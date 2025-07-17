import { useState } from 'react'
import { X, Upload, Calendar } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { useData } from '../../context/DataContext'
import { MaintenanceFormData } from '../../types'
import { toast } from 'react-hot-toast'

interface MaintenanceFormProps {
  onClose: () => void
}

export function MaintenanceForm({ onClose }: MaintenanceFormProps) {
  const { properties, units, addMaintenanceIssue } = useData()
  const [formData, setFormData] = useState<MaintenanceFormData>({
    propertyId: '',
    unitId: '',
    title: '',
    description: '',
    status: 'reported',
    priority: 'medium',
    reportedDate: new Date().toISOString().split('T')[0],
    deadline: '',
    assignedTo: '',
    estimatedCost: undefined,
    actualCost: undefined,
    diarySettings: {
      enabled: false,
      daysBefore: 7
    }
  })

  const activeProperties = properties.filter(p => !p.isArchived)
  const availableUnits = formData.propertyId 
    ? units.filter(u => u.propertyId === formData.propertyId && !u.isArchived)
    : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.propertyId || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    addMaintenanceIssue(formData)
    onClose()
  }

  const handlePropertyChange = (propertyId: string) => {
    setFormData(prev => ({
      ...prev,
      propertyId,
      unitId: '' // Reset unit when property changes
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Log Maintenance Issue</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property *</Label>
                <Select value={formData.propertyId} onValueChange={handlePropertyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProperties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit (Optional)</Label>
                <Select 
                  value={formData.unitId || 'none'} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unitId: value === 'none' ? undefined : value }))}
                  disabled={!formData.propertyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific unit</SelectItem>
                    {availableUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        Unit {unit.unitNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Issue Details */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the maintenance issue"
                rows={4}
                required
              />
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'reported' | 'in_progress' | 'completed') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates and Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportedDate">Reported Date</Label>
                <Input
                  id="reportedDate"
                  type="date"
                  value={formData.reportedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportedDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value || undefined }))}
                placeholder="Contractor, maintenance person, etc."
              />
            </div>

            {/* Cost Estimates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost (£)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estimatedCost || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estimatedCost: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualCost">Actual Cost (£)</Label>
                <Input
                  id="actualCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.actualCost || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    actualCost: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Diary Reminder Settings */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="diaryEnabled">Diary Reminder</Label>
                  <p className="text-sm text-gray-600">Get reminded about the deadline in your diary</p>
                </div>
                <Switch
                  id="diaryEnabled"
                  checked={formData.diarySettings?.enabled || false}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      diarySettings: {
                        ...prev.diarySettings,
                        enabled: checked,
                        daysBefore: prev.diarySettings?.daysBefore || 7
                      }
                    }))
                  }
                />
              </div>

              {formData.diarySettings?.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="daysBefore">Remind me (days before deadline)</Label>
                  <Select 
                    value={formData.diarySettings.daysBefore.toString()} 
                    onValueChange={(value) => 
                      setFormData(prev => ({
                        ...prev,
                        diarySettings: {
                          ...prev.diarySettings!,
                          daysBefore: parseInt(value)
                        }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day before</SelectItem>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="7">1 week before</SelectItem>
                      <SelectItem value="14">2 weeks before</SelectItem>
                      <SelectItem value="30">1 month before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Log Issue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}