import { useState } from 'react'
import { X, Edit, Archive, MessageSquare, Paperclip, Upload, Download, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useData } from '../../context/DataContext'
import { MaintenanceIssue, MaintenanceComment, MaintenanceAttachment } from '../../types'
import { formatCurrency } from '../../types'
import toast from 'react-hot-toast'

interface MaintenanceDetailsModalProps {
  issue: MaintenanceIssue
  onClose: () => void
}

export function MaintenanceDetailsModal({ issue, onClose }: MaintenanceDetailsModalProps) {
  const { properties, units, updateMaintenanceIssue, archiveMaintenanceIssue } = useData()
  const [isEditing, setIsEditing] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editData, setEditData] = useState({
    title: issue.title,
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    deadline: issue.deadline || '',
    assignedTo: issue.assignedTo || '',
    estimatedCost: issue.estimatedCost || '',
    actualCost: issue.actualCost || ''
  })

  const property = properties.find(p => p.id === issue.propertyId)
  const unit = issue.unitId ? units.find(u => u.id === issue.unitId) : null

  const handleSave = () => {
    const updates: Partial<MaintenanceIssue> = {
      title: editData.title,
      description: editData.description,
      status: editData.status,
      priority: editData.priority,
      deadline: editData.deadline || undefined,
      assignedTo: editData.assignedTo || undefined,
      estimatedCost: editData.estimatedCost ? parseFloat(editData.estimatedCost.toString()) : undefined,
      actualCost: editData.actualCost ? parseFloat(editData.actualCost.toString()) : undefined
    }

    if (editData.status === 'completed' && !issue.completedDate) {
      updates.completedDate = new Date().toISOString()
    }

    updateMaintenanceIssue(issue.id, updates)
    setIsEditing(false)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: MaintenanceComment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newComment,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User' // In real app, get from auth
    }

    updateMaintenanceIssue(issue.id, {
      comments: [...issue.comments, comment]
    })

    setNewComment('')
  }

  const handleArchive = () => {
    if (confirm('Are you sure you want to archive this maintenance issue?')) {
      archiveMaintenanceIssue(issue.id)
      onClose()
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

  const isOverdue = issue.deadline && new Date(issue.deadline) < new Date() && issue.status !== 'completed'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">{issue.title}</CardTitle>
            <Badge className={getPriorityColor(issue.priority)}>
              {issue.priority.toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(issue.status)}>
              {issue.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {isOverdue && (
              <Badge className="bg-red-100 text-red-800">OVERDUE</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Property</Label>
                <p className="text-sm">{property?.name}</p>
              </div>
              
              {unit && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Unit</Label>
                  <p className="text-sm">Unit {unit.unitNumber}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Reported Date</Label>
                <p className="text-sm">{new Date(issue.reportedDate).toLocaleDateString()}</p>
              </div>
              
              {issue.deadline && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Deadline</Label>
                  <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                    {new Date(issue.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {issue.assignedTo && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                  <p className="text-sm">{issue.assignedTo}</p>
                </div>
              )}
              
              {issue.estimatedCost && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estimated Cost</Label>
                  <p className="text-sm">{formatCurrency(issue.estimatedCost)}</p>
                </div>
              )}
              
              {issue.actualCost && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Actual Cost</Label>
                  <p className="text-sm">{formatCurrency(issue.actualCost)}</p>
                </div>
              )}
              
              {issue.completedDate && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Completed Date</Label>
                  <p className="text-sm">{new Date(issue.completedDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-500 mb-2 block">Description</Label>
            {isEditing ? (
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{issue.description}</p>
            )}
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editTitle">Title</Label>
                  <Input
                    id="editTitle"
                    value={editData.title}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="editAssignedTo">Assigned To</Label>
                  <Input
                    id="editAssignedTo"
                    value={editData.assignedTo}
                    onChange={(e) => setEditData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select 
                    value={editData.status} 
                    onValueChange={(value: 'reported' | 'in_progress' | 'completed') => 
                      setEditData(prev => ({ ...prev, status: value }))
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
                
                <div>
                  <Label htmlFor="editPriority">Priority</Label>
                  <Select 
                    value={editData.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                      setEditData(prev => ({ ...prev, priority: value }))
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editDeadline">Deadline</Label>
                  <Input
                    id="editDeadline"
                    type="date"
                    value={editData.deadline}
                    onChange={(e) => setEditData(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="editEstimatedCost">Estimated Cost (£)</Label>
                  <Input
                    id="editEstimatedCost"
                    type="number"
                    step="0.01"
                    value={editData.estimatedCost}
                    onChange={(e) => setEditData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="editActualCost">Actual Cost (£)</Label>
                  <Input
                    id="editActualCost"
                    type="number"
                    step="0.01"
                    value={editData.actualCost}
                    onChange={(e) => setEditData(prev => ({ ...prev, actualCost: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-500">Attachments</Label>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
            
            {issue.attachments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No attachments</p>
            ) : (
              <div className="space-y-2">
                {issue.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-gray-500">
                          {attachment.type.toUpperCase()} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Comments */}
          <div>
            <Label className="text-sm font-medium text-gray-500 mb-4 block">Comments</Label>
            
            {/* Add Comment */}
            <div className="flex gap-3 mb-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="flex-1"
              />
              <Button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            
            {/* Comments List */}
            {issue.comments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {issue.comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{comment.createdBy}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}