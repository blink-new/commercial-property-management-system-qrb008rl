import { useState, useEffect } from 'react'
import { Calendar, Plus, MessageSquare, Archive, Trash2, Edit, AlertCircle, Clock, Building2, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useData } from '../../context/DataContext'
import { DiaryEvent, formatCurrency } from '../../types'

interface DiaryViewProps {
  searchValue: string
}

interface DiaryEventWithDetails extends DiaryEvent {
  propertyName: string
  unitNumber?: string
  tenantName?: string
  monthlyRent?: number
}

export function DiaryView({ searchValue }: DiaryViewProps) {
  const { properties, units, tenancies, getPropertyById, getUnitById } = useData()
  const [diaryEvents, setDiaryEvents] = useState<DiaryEventWithDetails[]>([])
  const [selectedEvent, setSelectedEvent] = useState<DiaryEventWithDetails | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [eventStatus, setEventStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('all')

  // Get current user's properties (filtered by property manager)
  const currentUser = 'current-user' // In real app, get from auth

  useEffect(() => {
    const generateDiaryEvents = () => {
      const events: DiaryEventWithDetails[] = []
      const today = new Date()

      // Get current user's properties (filtered by property manager)
      const currentUserProperties = properties.filter(p => 
        !p.isArchived
      )

      // Load saved events from localStorage first
      const savedEvents = localStorage.getItem('diaryEvents')
      const savedEventsMap = new Map()
      if (savedEvents) {
        try {
          const parsed = JSON.parse(savedEvents)
          parsed.forEach((event: any) => {
            savedEventsMap.set(event.id, event)
          })
        } catch (error) {
          console.error('Error parsing saved diary events:', error)
        }
      }

      console.log('Generating diary events...')
      console.log('User managed properties:', currentUserProperties.length)
      console.log('Total tenancies:', tenancies.length)

      currentUserProperties.forEach(property => {
        const propertyUnits = units.filter(u => u.propertyId === property.id && !u.isArchived)
        console.log(`Property ${property.name} has ${propertyUnits.length} units`)
        
        propertyUnits.forEach(unit => {
          const unitTenancies = tenancies.filter(t => 
            t.unitId === unit.id && 
            !t.isArchived && 
            t.status === 'active'
          )
          console.log(`Unit ${unit.unitNumber} has ${unitTenancies.length} active tenancies`)

          unitTenancies.forEach(tenancy => {
            console.log(`Processing tenancy for ${tenancy.tenantName}:`)
            console.log('- Lease End Date:', tenancy.leaseEndDate)
            console.log('- Rent Review Date:', tenancy.rentReviewDate)
            console.log('- Break Date:', tenancy.breakDate)
            console.log('- Diary Settings:', tenancy.diarySettings)

            const diarySettings = tenancy.diarySettings || {}

            // Lease Expiry Events
            if (diarySettings.leaseExpiry?.enabled && tenancy.leaseEndDate) {
              const leaseEndDate = new Date(tenancy.leaseEndDate)
              const monthsBefore = diarySettings.leaseExpiry.monthsBefore || 3
              const notificationDate = new Date(leaseEndDate)
              notificationDate.setMonth(notificationDate.getMonth() - monthsBefore)

              console.log(`Lease Expiry Check:`)
              console.log('- Event Date:', leaseEndDate.toDateString())
              console.log('- Notification Date:', notificationDate.toDateString())
              console.log('- Today:', today.toDateString())
              console.log('- Should show?', leaseEndDate >= today && notificationDate <= today)

              // Show event if we're now within the notification period (X months before the event)
              // and the actual event date is still in the future
              if (leaseEndDate >= today && notificationDate <= today) {
                const eventId = `lease_expiry_${tenancy.id}`
                const savedEvent = savedEventsMap.get(eventId)
                
                events.push({
                  id: eventId,
                  userId: currentUser,
                  propertyId: property.id,
                  unitId: unit.id,
                  tenancyId: tenancy.id,
                  eventType: 'lease_expiry',
                  eventDate: tenancy.leaseEndDate,
                  title: `Lease Expiry - ${tenancy.tenantName}`,
                  description: `Lease expires on ${new Date(tenancy.leaseEndDate).toLocaleDateString()}`,
                  comments: savedEvent?.comments || '',
                  status: savedEvent?.status || 'pending',
                  isArchived: false,
                  createdAt: savedEvent?.createdAt || new Date().toISOString(),
                  updatedAt: savedEvent?.updatedAt || new Date().toISOString(),
                  propertyName: property.name,
                  unitNumber: unit.unitNumber,
                  tenantName: tenancy.tenantName,
                  monthlyRent: tenancy.monthlyRent
                })
                console.log('✓ Added lease expiry event')
              }
            }

            // Rent Review Events
            if (diarySettings.rentReview?.enabled && tenancy.rentReviewDate) {
              const rentReviewDate = new Date(tenancy.rentReviewDate)
              const monthsBefore = diarySettings.rentReview.monthsBefore || 3
              const notificationDate = new Date(rentReviewDate)
              notificationDate.setMonth(notificationDate.getMonth() - monthsBefore)

              console.log(`Rent Review Check:`)
              console.log('- Event Date:', rentReviewDate.toDateString())
              console.log('- Notification Date:', notificationDate.toDateString())
              console.log('- Should show?', rentReviewDate >= today && notificationDate <= today)

              // Show event if we're now within the notification period (X months before the event)
              // and the actual event date is still in the future
              if (rentReviewDate >= today && notificationDate <= today) {
                const eventId = `rent_review_${tenancy.id}`
                const savedEvent = savedEventsMap.get(eventId)
                
                events.push({
                  id: eventId,
                  userId: currentUser,
                  propertyId: property.id,
                  unitId: unit.id,
                  tenancyId: tenancy.id,
                  eventType: 'rent_review',
                  eventDate: tenancy.rentReviewDate,
                  title: `Rent Review - ${tenancy.tenantName}`,
                  description: `Rent review due on ${new Date(tenancy.rentReviewDate).toLocaleDateString()}${tenancy.rentReviewType ? ` (${tenancy.rentReviewType.replace('_', ' ').toUpperCase()})` : ''}`,
                  comments: savedEvent?.comments || '',
                  status: savedEvent?.status || 'pending',
                  isArchived: false,
                  createdAt: savedEvent?.createdAt || new Date().toISOString(),
                  updatedAt: savedEvent?.updatedAt || new Date().toISOString(),
                  propertyName: property.name,
                  unitNumber: unit.unitNumber,
                  tenantName: tenancy.tenantName,
                  monthlyRent: tenancy.monthlyRent
                })
                console.log('✓ Added rent review event')
              }
            }

            // Tenancy Break Events
            if (diarySettings.tenancyBreak?.enabled && tenancy.breakDate) {
              const breakDate = new Date(tenancy.breakDate)
              const monthsBefore = diarySettings.tenancyBreak.monthsBefore || 3
              const notificationDate = new Date(breakDate)
              notificationDate.setMonth(notificationDate.getMonth() - monthsBefore)

              console.log(`Tenancy Break Check:`)
              console.log('- Event Date:', breakDate.toDateString())
              console.log('- Notification Date:', notificationDate.toDateString())
              console.log('- Should show?', breakDate >= today && notificationDate <= today)

              // Show event if we're now within the notification period (X months before the event)
              // and the actual event date is still in the future
              if (breakDate >= today && notificationDate <= today) {
                const eventId = `tenancy_break_${tenancy.id}`
                const savedEvent = savedEventsMap.get(eventId)
                
                events.push({
                  id: eventId,
                  userId: currentUser,
                  propertyId: property.id,
                  unitId: unit.id,
                  tenancyId: tenancy.id,
                  eventType: 'tenancy_break',
                  eventDate: tenancy.breakDate,
                  title: `Tenancy Break - ${tenancy.tenantName}`,
                  description: `Break clause available from ${new Date(tenancy.breakDate).toLocaleDateString()}${tenancy.breakType ? ` (${tenancy.breakType.replace('_', ' ')})` : ''}`,
                  comments: savedEvent?.comments || '',
                  status: savedEvent?.status || 'pending',
                  isArchived: false,
                  createdAt: savedEvent?.createdAt || new Date().toISOString(),
                  updatedAt: savedEvent?.updatedAt || new Date().toISOString(),
                  propertyName: property.name,
                  unitNumber: unit.unitNumber,
                  tenantName: tenancy.tenantName,
                  monthlyRent: tenancy.monthlyRent
                })
                console.log('✓ Added tenancy break event')
              }
            }
          })
        })
      })

      console.log(`Generated ${events.length} diary events:`, events)
      // Sort events by date (closest first)
      events.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      setDiaryEvents(events)
    }

    generateDiaryEvents()
  }, [properties, units, tenancies])

  const filteredEvents = diaryEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchValue.toLowerCase()) ||
                         event.propertyName.toLowerCase().includes(searchValue.toLowerCase()) ||
                         event.tenantName?.toLowerCase().includes(searchValue.toLowerCase())
    
    const matchesType = filterType === 'all' || event.eventType === filterType
    
    return matchesSearch && matchesType && !event.isArchived
  })

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'lease_expiry':
        return 'bg-red-100 text-red-800'
      case 'rent_review':
        return 'bg-blue-100 text-blue-800'
      case 'tenancy_break':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'lease_expiry':
        return AlertCircle
      case 'rent_review':
        return Clock
      case 'tenancy_break':
        return Calendar
      default:
        return Calendar
    }
  }

  const getDaysUntilEvent = (eventDate: string) => {
    const today = new Date()
    const event = new Date(eventDate)
    const diffTime = event.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleEventClick = (event: DiaryEventWithDetails) => {
    setSelectedEvent(event)
    setCommentText(event.comments || '')
    setEventStatus(event.status || 'pending')
    setIsEventModalOpen(true)
  }

  const handleSaveEvent = () => {
    if (selectedEvent) {
      const updatedEvents = diaryEvents.map(event =>
        event.id === selectedEvent.id
          ? { ...event, comments: commentText, status: eventStatus as any, updatedAt: new Date().toISOString() }
          : event
      )
      setDiaryEvents(updatedEvents)
      
      // Also save to localStorage for persistence
      const existingArchivedEvents = localStorage.getItem('diaryEvents')
      let allEvents = []
      if (existingArchivedEvents) {
        try {
          allEvents = JSON.parse(existingArchivedEvents)
        } catch (error) {
          console.error('Error parsing diary events:', error)
        }
      }
      
      // Update or add the event
      const eventIndex = allEvents.findIndex((e: any) => e.id === selectedEvent.id)
      const updatedEvent = { ...selectedEvent, comments: commentText, status: eventStatus, updatedAt: new Date().toISOString() }
      
      if (eventIndex >= 0) {
        allEvents[eventIndex] = updatedEvent
      } else {
        allEvents.push(updatedEvent)
      }
      
      localStorage.setItem('diaryEvents', JSON.stringify(allEvents))
      
      setIsEventModalOpen(false)
      setSelectedEvent(null)
      setCommentText('')
      setEventStatus('')
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'vacating':
        return 'bg-red-100 text-red-800'
      case 'in_talks_directly':
        return 'bg-blue-100 text-blue-800'
      case 'in_negotiations':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_legals':
        return 'bg-purple-100 text-purple-800'
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'vacating':
        return 'Vacating'
      case 'in_talks_directly':
        return 'In Talks Directly'
      case 'in_negotiations':
        return 'In Negotiations'
      case 'in_legals':
        return 'In Legals'
      case 'pending':
      default:
        return 'Pending'
    }
  }

  const handleArchiveEvent = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    
    // Find the event to archive
    const eventToArchive = diaryEvents.find(event => event.id === eventId)
    if (eventToArchive) {
      // Update the event as archived
      const archivedEvent = { ...eventToArchive, isArchived: true, updatedAt: new Date().toISOString() }
      
      // Save to localStorage for archive view
      const existingArchivedEvents = localStorage.getItem('archivedDiaryEvents')
      let archivedEvents = []
      if (existingArchivedEvents) {
        try {
          archivedEvents = JSON.parse(existingArchivedEvents)
        } catch (error) {
          console.error('Error parsing archived events:', error)
        }
      }
      
      archivedEvents.push(archivedEvent)
      localStorage.setItem('archivedDiaryEvents', JSON.stringify(archivedEvents))
      
      // Remove from current events
      const updatedEvents = diaryEvents.filter(event => event.id !== eventId)
      setDiaryEvents(updatedEvents)
    }
  }

  const handleDeleteEvent = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setDiaryEvents(diaryEvents.filter(event => event.id !== eventId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Diary</h1>
          <p className="text-gray-600">Upcoming lease events and important dates</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            <option value="lease_expiry">Lease Expiry</option>
            <option value="rent_review">Rent Review</option>
            <option value="tenancy_break">Tenancy Break</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{filteredEvents.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent (Next 30 days)</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredEvents.filter(e => getDaysUntilEvent(e.eventDate) <= 30).length}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Properties Managed</p>
                <p className="text-2xl font-bold text-gray-900">{properties.filter(p => !p.isArchived).length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const daysUntil = getDaysUntilEvent(event.eventDate)
            const isUrgent = daysUntil <= 30
            const EventIcon = getEventTypeIcon(event.eventType)

            return (
              <Card 
                key={event.id} 
                className={`transition-all duration-200 hover:shadow-md cursor-pointer ${isUrgent ? 'border-red-200 bg-red-50' : ''}`}
                onClick={() => handleEventClick(event)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <EventIcon className={`h-5 w-5 ${isUrgent ? 'text-red-600' : 'text-gray-600'}`} />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <Badge className={getEventTypeColor(event.eventType)}>
                            {event.eventType.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(event.status)}>
                            {getStatusLabel(event.status)}
                          </Badge>
                          {isUrgent && (
                            <Badge className="bg-red-100 text-red-800">
                              URGENT
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600">{event.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4" />
                            <span>{event.propertyName}</span>
                          </div>
                          {event.unitNumber && (
                            <div className="flex items-center space-x-1">
                              <Home className="h-4 w-4" />
                              <span>Unit {event.unitNumber}</span>
                            </div>
                          )}
                          {event.monthlyRent && (
                            <div className="flex items-center space-x-1">
                              <span>Rent: {formatCurrency(event.monthlyRent)}/mo</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`font-medium ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                            {daysUntil === 0 ? 'Today' : 
                             daysUntil === 1 ? 'Tomorrow' :
                             daysUntil > 0 ? `In ${daysUntil} days` : 
                             `${Math.abs(daysUntil)} days overdue`}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">
                            {new Date(event.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {event.comments && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{event.comments}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleArchiveEvent(event.id, e)}
                        className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                        title="Archive Event"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteEvent(event.id, e)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Delete Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No diary events</h3>
            <p className="text-gray-500 mb-4">
              {searchValue || filterType !== 'all'
                ? 'No events match your current filters'
                : 'No upcoming events found. Configure diary settings in your tenancies to get notifications.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Event Details Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedEvent && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{selectedEvent.title}</h3>
                  <Badge className={getEventTypeColor(selectedEvent.eventType)}>
                    {selectedEvent.eventType.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{selectedEvent.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Property:</span> {selectedEvent.propertyName}
                  </div>
                  {selectedEvent.unitNumber && (
                    <div>
                      <span className="font-medium">Unit:</span> {selectedEvent.unitNumber}
                    </div>
                  )}
                  {selectedEvent.tenantName && (
                    <div>
                      <span className="font-medium">Tenant:</span> {selectedEvent.tenantName}
                    </div>
                  )}
                  {selectedEvent.monthlyRent && (
                    <div>
                      <span className="font-medium">Rent:</span> {formatCurrency(selectedEvent.monthlyRent)}/mo
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={eventStatus} onValueChange={setEventStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="vacating">Vacating</SelectItem>
                  <SelectItem value="in_talks_directly">In Talks Directly</SelectItem>
                  <SelectItem value="in_negotiations">In Negotiations</SelectItem>
                  <SelectItem value="in_legals">In Legals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Comments</label>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add your notes or comments about this event..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsEventModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEvent}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}