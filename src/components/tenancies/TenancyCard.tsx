import { Users, MapPin, Calendar, PoundSterling, Edit, Archive, Trash2, RotateCcw, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tenancy, formatCurrency } from '../../types'
import { useData } from '../../context/DataContext'

interface TenancyCardProps {
  tenancy: Tenancy
  onEdit: (tenancy: Tenancy) => void
  onViewDetails?: (tenancy: Tenancy) => void
  showArchived?: boolean
}

export function TenancyCard({ tenancy, onEdit, onViewDetails, showArchived = false }: TenancyCardProps) {
  const { archiveTenancy, restoreTenancy, deleteTenancy, getUnitById, getPropertyById } = useData()
  
  const unit = getUnitById(tenancy.unitId)
  const property = unit ? getPropertyById(unit.propertyId) : undefined

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-yellow-100 text-yellow-800'
      case 'terminated':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'expired':
        return 'Expired'
      case 'terminated':
        return 'Terminated'
      default:
        return status
    }
  }

  const isLeaseExpiring = () => {
    const endDate = new Date(tenancy.leaseEndDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isLeaseExpired = () => {
    const endDate = new Date(tenancy.leaseEndDate)
    const today = new Date()
    return endDate < today
  }

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md cursor-pointer ${tenancy.isArchived ? 'opacity-60' : ''}`}
      onClick={() => onViewDetails?.(tenancy)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{tenancy.tenantName}</h3>
              {property && unit && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.name} - Unit {unit.unitNumber}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={getStatusColor(tenancy.status)}>
              {getStatusLabel(tenancy.status)}
            </Badge>
            {isLeaseExpiring() && (
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                Expiring Soon
              </Badge>
            )}
            {isLeaseExpired() && tenancy.status === 'active' && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                Expired
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <PoundSterling className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Monthly Rent</p>
            <p className="font-semibold text-gray-900">{formatCurrency(tenancy.monthlyRent)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Lease Period</p>
              <p className="font-medium text-gray-900">
                {new Date(tenancy.leaseStartDate).toLocaleDateString()} - {new Date(tenancy.leaseEndDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {(tenancy.tenantEmail || tenancy.tenantPhone) && (
          <div className="space-y-2">
            {tenancy.tenantEmail && (
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{tenancy.tenantEmail}</span>
              </div>
            )}
            {tenancy.tenantPhone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{tenancy.tenantPhone}</span>
              </div>
            )}
          </div>
        )}

        {tenancy.securityDeposit && (
          <div>
            <p className="text-sm text-gray-600">Security Deposit</p>
            <p className="font-medium text-gray-900">{formatCurrency(tenancy.securityDeposit)}</p>
          </div>
        )}

        {tenancy.notes && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Notes</p>
            <p className="text-sm text-gray-900 mt-1">{tenancy.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Created {new Date(tenancy.createdAt).toLocaleDateString()}
          </div>
          
          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(tenancy)
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            {showArchived ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  restoreTenancy(tenancy.id)
                }}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  archiveTenancy(tenancy.id)
                }}
                className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                deleteTenancy(tenancy.id)
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}