import { useState, useEffect } from 'react'
import { Archive, Filter, Calendar, AlertCircle, Clock, Building2, Home } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { PropertyCard } from '../properties/PropertyCard'
import { UnitCard } from '../units/UnitCard'
import { TenancyCard } from '../tenancies/TenancyCard'
import { PropertyForm } from '../properties/PropertyForm'
import { UnitForm } from '../units/UnitForm'
import { TenancyForm } from '../tenancies/TenancyForm'
import { useData } from '../../context/DataContext'
import { Property, Unit, Tenancy, DiaryEvent, formatCurrency } from '../../types'

interface ArchiveViewProps {
  searchValue: string
}

interface DiaryEventWithDetails extends DiaryEvent {
  propertyName: string
  unitNumber?: string
  tenantName?: string
  monthlyRent?: number
}

export function ArchiveView({ searchValue }: ArchiveViewProps) {
  const { properties, units, tenancies, getPropertyById, getUnitById } = useData()
  const [activeTab, setActiveTab] = useState('properties')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [archivedDiaryEvents, setArchivedDiaryEvents] = useState<DiaryEventWithDetails[]>([])
  
  // Form states
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false)
  const [isUnitFormOpen, setIsUnitFormOpen] = useState(false)
  const [isTenancyFormOpen, setIsTenancyFormOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | undefined>()
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>()
  const [editingTenancy, setEditingTenancy] = useState<Tenancy | undefined>()

  const archivedProperties = properties.filter(p => p.isArchived)
  const archivedUnits = units.filter(u => u.isArchived)
  const archivedTenancies = tenancies.filter(t => t.isArchived)

  // Generate archived diary events (simulated from localStorage or other storage)
  useEffect(() => {
    // In a real app, this would come from a database or localStorage
    // For now, we'll simulate some archived events
    const mockArchivedEvents: DiaryEventWithDetails[] = []
    
    // You could load archived events from localStorage here
    const storedArchivedEvents = localStorage.getItem('archivedDiaryEvents')
    if (storedArchivedEvents) {
      try {
        const parsed = JSON.parse(storedArchivedEvents)
        setArchivedDiaryEvents(parsed)
      } catch (error) {
        console.error('Error parsing archived diary events:', error)
        setArchivedDiaryEvents([])
      }
    } else {
      setArchivedDiaryEvents(mockArchivedEvents)
    }
  }, [])

  const filteredProperties = archivedProperties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchValue.toLowerCase()) ||
                         property.propertyType.toLowerCase().includes(searchValue.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const filteredUnits = archivedUnits.filter(unit => {
    const property = properties.find(p => p.id === unit.propertyId)
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
                         unit.unitType.toLowerCase().includes(searchValue.toLowerCase()) ||
                         (property?.name.toLowerCase().includes(searchValue.toLowerCase()) || false)
    
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const filteredTenancies = archivedTenancies.filter(tenancy => {
    const unit = units.find(u => u.id === tenancy.unitId)
    const property = unit ? properties.find(p => p.id === unit.propertyId) : undefined
    
    const matchesSearch = tenancy.tenantName.toLowerCase().includes(searchValue.toLowerCase()) ||
                         (tenancy.tenantEmail?.toLowerCase().includes(searchValue.toLowerCase()) || false) ||
                         (unit?.unitNumber.toLowerCase().includes(searchValue.toLowerCase()) || false) ||
                         (property?.name.toLowerCase().includes(searchValue.toLowerCase()) || false)
    
    const matchesStatus = statusFilter === 'all' || tenancy.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const filteredDiaryEvents = archivedDiaryEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchValue.toLowerCase()) ||
                         event.propertyName.toLowerCase().includes(searchValue.toLowerCase()) ||
                         event.tenantName?.toLowerCase().includes(searchValue.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property)
    setIsPropertyFormOpen(true)
  }

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit)
    setIsUnitFormOpen(true)
  }

  const handleEditTenancy = (tenancy: Tenancy) => {
    setEditingTenancy(tenancy)
    setIsTenancyFormOpen(true)
  }

  const getStatusOptions = () => {
    switch (activeTab) {
      case 'properties':
        return [
          { value: 'all', label: 'All Status' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]
      case 'units':
        return [
          { value: 'all', label: 'All Status' },
          { value: 'vacant', label: 'Vacant' },
          { value: 'occupied', label: 'Occupied' },
          { value: 'maintenance', label: 'Maintenance' }
        ]
      case 'tenancies':
        return [
          { value: 'all', label: 'All Status' },
          { value: 'active', label: 'Active' },
          { value: 'expired', label: 'Expired' },
          { value: 'terminated', label: 'Terminated' }
        ]
      case 'diary':
        return [
          { value: 'all', label: 'All Status' },
          { value: 'pending', label: 'Pending' },
          { value: 'vacating', label: 'Vacating' },
          { value: 'in_talks_directly', label: 'In Talks Directly' },
          { value: 'in_negotiations', label: 'In Negotiations' },
          { value: 'in_legals', label: 'In Legals' }
        ]
      default:
        return [{ value: 'all', label: 'All Status' }]
    }
  }

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

  const EmptyState = ({ type, count }: { type: string; count: number }) => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Archive className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No archived {type} found</h3>
      <p className="text-gray-500">
        {searchValue || statusFilter !== 'all'
          ? `Try adjusting your search or filters`
          : count === 0
          ? `No ${type} have been archived yet`
          : `All archived ${type} match your current filters`
        }
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {archivedProperties.length + archivedUnits.length + archivedTenancies.length + archivedDiaryEvents.length} archived items
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="properties" className="flex items-center space-x-2">
            <span>Properties</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {archivedProperties.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center space-x-2">
            <span>Units</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {archivedUnits.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tenancies" className="flex items-center space-x-2">
            <span>Tenancies</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {archivedTenancies.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="diary" className="flex items-center space-x-2">
            <span>Diary Events</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {archivedDiaryEvents.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6">
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onEdit={handleEditProperty}
                  showArchived={true}
                />
              ))}
            </div>
          ) : (
            <EmptyState type="properties" count={archivedProperties.length} />
          )}
        </TabsContent>

        <TabsContent value="units" className="mt-6">
          {filteredUnits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUnits.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  onEdit={handleEditUnit}
                  showArchived={true}
                />
              ))}
            </div>
          ) : (
            <EmptyState type="units" count={archivedUnits.length} />
          )}
        </TabsContent>

        <TabsContent value="tenancies" className="mt-6">
          {filteredTenancies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTenancies.map((tenancy) => (
                <TenancyCard
                  key={tenancy.id}
                  tenancy={tenancy}
                  onEdit={handleEditTenancy}
                  showArchived={true}
                />
              ))}
            </div>
          ) : (
            <EmptyState type="tenancies" count={archivedTenancies.length} />
          )}
        </TabsContent>

        <TabsContent value="diary" className="mt-6">
          {filteredDiaryEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredDiaryEvents.map((event) => {
                const EventIcon = getEventTypeIcon(event.eventType)

                return (
                  <Card key={event.id} className="transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <EventIcon className="h-5 w-5 text-gray-600" />
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
                              <Badge className="bg-amber-100 text-amber-800">
                                ARCHIVED
                              </Badge>
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
                              <span className="text-gray-500">
                                Event Date: {new Date(event.eventDate).toLocaleDateString()}
                              </span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-500">
                                Archived: {new Date(event.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {event.comments && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{event.comments}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <EmptyState type="diary events" count={archivedDiaryEvents.length} />
          )}
        </TabsContent>
      </Tabs>

      {/* Forms */}
      <PropertyForm
        isOpen={isPropertyFormOpen}
        onClose={() => {
          setIsPropertyFormOpen(false)
          setEditingProperty(undefined)
        }}
        property={editingProperty}
      />

      <UnitForm
        isOpen={isUnitFormOpen}
        onClose={() => {
          setIsUnitFormOpen(false)
          setEditingUnit(undefined)
        }}
        unit={editingUnit}
      />

      <TenancyForm
        isOpen={isTenancyFormOpen}
        onClose={() => {
          setIsTenancyFormOpen(false)
          setEditingTenancy(undefined)
        }}
        tenancy={editingTenancy}
      />
    </div>
  )
}