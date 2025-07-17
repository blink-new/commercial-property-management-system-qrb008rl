import { Building2, Home, Users, PoundSterling, TrendingUp, TrendingDown, Database, AlertCircle, Calendar, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { useData } from '../../context/DataContext'
import { formatCurrency } from '../../types'

export function Dashboard() {
  const { properties, units, tenancies, addProperty, addUnit, addTenancy, getPropertyById, getUnitById } = useData()

  const activeProperties = properties.filter(p => !p.isArchived)
  const activeUnits = units.filter(u => !u.isArchived)
  const activeTenancies = tenancies.filter(t => !t.isArchived && t.status === 'active')
  
  const occupiedUnits = activeUnits.filter(u => u.status === 'occupied').length
  const vacantUnits = activeUnits.filter(u => u.status === 'vacant').length
  const occupancyRate = activeUnits.length > 0 ? (occupiedUnits / activeUnits.length) * 100 : 0
  
  const totalMonthlyRent = activeTenancies.reduce((sum, tenancy) => sum + tenancy.monthlyRent, 0)
  const totalPropertyValue = activeProperties.reduce((sum, property) => sum + (property.currentValue || 0), 0)

  // Generate urgent diary events (next 30 days)
  const generateUrgentDiaryEvents = () => {
    const events: any[] = []
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    activeTenancies.forEach(tenancy => {
      const diarySettings = tenancy.diarySettings || {}

      // Lease Expiry Events
      if (diarySettings.leaseExpiry?.enabled && tenancy.leaseEndDate) {
        const leaseEndDate = new Date(tenancy.leaseEndDate)
        const monthsBefore = diarySettings.leaseExpiry.monthsBefore || 3
        const notificationDate = new Date(leaseEndDate)
        notificationDate.setMonth(notificationDate.getMonth() - monthsBefore)

        if (leaseEndDate >= today && notificationDate <= today && leaseEndDate <= thirtyDaysFromNow) {
          const unit = getUnitById(tenancy.unitId)
          const property = unit ? getPropertyById(unit.propertyId) : null
          
          events.push({
            id: `lease_expiry_${tenancy.id}`,
            type: 'lease_expiry',
            title: `Lease Expiry - ${tenancy.tenantName}`,
            description: `Lease expires on ${leaseEndDate.toLocaleDateString()}`,
            eventDate: tenancy.leaseEndDate,
            propertyName: property?.name || 'Unknown Property',
            unitNumber: unit?.unitNumber || 'Unknown Unit',
            tenantName: tenancy.tenantName,
            monthlyRent: tenancy.monthlyRent,
            daysUntil: Math.ceil((leaseEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          })
        }
      }

      // Rent Review Events
      if (diarySettings.rentReview?.enabled && tenancy.rentReviewDate) {
        const rentReviewDate = new Date(tenancy.rentReviewDate)
        const monthsBefore = diarySettings.rentReview.monthsBefore || 3
        const notificationDate = new Date(rentReviewDate)
        notificationDate.setMonth(notificationDate.getMonth() - monthsBefore)

        if (rentReviewDate >= today && notificationDate <= today && rentReviewDate <= thirtyDaysFromNow) {
          const unit = getUnitById(tenancy.unitId)
          const property = unit ? getPropertyById(unit.propertyId) : null
          
          events.push({
            id: `rent_review_${tenancy.id}`,
            type: 'rent_review',
            title: `Rent Review - ${tenancy.tenantName}`,
            description: `Rent review due on ${rentReviewDate.toLocaleDateString()}`,
            eventDate: tenancy.rentReviewDate,
            propertyName: property?.name || 'Unknown Property',
            unitNumber: unit?.unitNumber || 'Unknown Unit',
            tenantName: tenancy.tenantName,
            monthlyRent: tenancy.monthlyRent,
            daysUntil: Math.ceil((rentReviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          })
        }
      }

      // Tenancy Break Events
      if (diarySettings.tenancyBreak?.enabled && tenancy.breakDate) {
        const breakDate = new Date(tenancy.breakDate)
        const monthsBefore = diarySettings.tenancyBreak.monthsBefore || 3
        const notificationDate = new Date(breakDate)
        notificationDate.setMonth(notificationDate.getMonth() - monthsBefore)

        if (breakDate >= today && notificationDate <= today && breakDate <= thirtyDaysFromNow) {
          const unit = getUnitById(tenancy.unitId)
          const property = unit ? getPropertyById(unit.propertyId) : null
          
          events.push({
            id: `tenancy_break_${tenancy.id}`,
            type: 'tenancy_break',
            title: `Tenancy Break - ${tenancy.tenantName}`,
            description: `Break clause available from ${breakDate.toLocaleDateString()}`,
            eventDate: tenancy.breakDate,
            propertyName: property?.name || 'Unknown Property',
            unitNumber: unit?.unitNumber || 'Unknown Unit',
            tenantName: tenancy.tenantName,
            monthlyRent: tenancy.monthlyRent,
            daysUntil: Math.ceil((breakDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          })
        }
      }
    })

    // Sort by days until event (most urgent first)
    return events.sort((a, b) => a.daysUntil - b.daysUntil)
  }

  const urgentEvents = generateUrgentDiaryEvents()

  const stats = [
    {
      title: 'Total Properties',
      value: activeProperties.length,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Units',
      value: activeUnits.length,
      icon: Home,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Tenancies',
      value: activeTenancies.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(totalMonthlyRent),
      icon: PoundSterling,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ]

  const recentProperties = activeProperties
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const recentTenancies = activeTenancies
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)



  return (
    <div className="space-y-6">


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Occupancy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Occupancy Rate</span>
                <span className="text-2xl font-bold text-gray-900">{occupancyRate.toFixed(1)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-semibold text-gray-900">{occupiedUnits}</span>
                  </div>
                  <p className="text-sm text-gray-600">Occupied</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-lg font-semibold text-gray-900">{vacantUnits}</span>
                  </div>
                  <p className="text-sm text-gray-600">Vacant</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Value</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalPropertyValue)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Monthly Revenue</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(totalMonthlyRent)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Annual Revenue</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(totalMonthlyRent * 12)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Diary Events */}
      {urgentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>Urgent Events (Next 30 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentEvents.slice(0, 5).map((event) => {
                const getEventIcon = (type: string) => {
                  switch (type) {
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

                const getEventColor = (type: string) => {
                  switch (type) {
                    case 'lease_expiry':
                      return 'text-red-600 bg-red-50'
                    case 'rent_review':
                      return 'text-blue-600 bg-blue-50'
                    case 'tenancy_break':
                      return 'text-orange-600 bg-orange-50'
                    default:
                      return 'text-gray-600 bg-gray-50'
                  }
                }

                const EventIcon = getEventIcon(event.type)
                const colorClass = getEventColor(event.type)

                return (
                  <div key={event.id} className={`p-3 rounded-lg border ${event.daysUntil <= 7 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <EventIcon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <span className={`text-sm font-medium ${event.daysUntil <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                            {event.daysUntil === 0 ? 'Today' : 
                             event.daysUntil === 1 ? 'Tomorrow' :
                             `In ${event.daysUntil} days`}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>{event.propertyName}</span>
                          <span>•</span>
                          <span>Unit {event.unitNumber}</span>
                          <span>•</span>
                          <span>{formatCurrency(event.monthlyRent)}/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {urgentEvents.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">
                    And {urgentEvents.length - 5} more urgent events...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProperties.length > 0 ? (
                recentProperties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{property.name}</p>
                      <p className="text-sm text-gray-600">{property.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{property.totalUnits} units</p>
                      <p className="text-xs text-gray-500">
                        {new Date(property.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No properties yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tenancies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTenancies.length > 0 ? (
                recentTenancies.map((tenancy) => (
                  <div key={tenancy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{tenancy.tenantName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(tenancy.leaseStartDate).toLocaleDateString()} - {new Date(tenancy.leaseEndDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(tenancy.monthlyRent)}/mo</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tenancy.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No tenancies yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}