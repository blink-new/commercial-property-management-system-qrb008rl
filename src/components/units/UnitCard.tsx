import { Home, MapPin, Users, Edit, Archive, Trash2, RotateCcw, PoundSterling } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Unit, formatCurrency } from '../../types'
import { useData } from '../../context/DataContext'

interface UnitCardProps {
  unit: Unit
  onEdit: (unit: Unit) => void
  onViewDetails: (unit: Unit) => void
  showArchived?: boolean
}

export function UnitCard({ unit, onEdit, onViewDetails, showArchived = false }: UnitCardProps) {
  const { archiveUnit, restoreUnit, softDeleteUnit, getPropertyById, getTenanciesForUnit } = useData()
  
  const property = getPropertyById(unit.propertyId)
  const tenancies = getTenanciesForUnit(unit.id)
  const activeTenancy = tenancies.find(t => t.status === 'active' && !t.isArchived)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-green-100 text-green-800'
      case 'vacant':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Occupied'
      case 'vacant':
        return 'Vacant'
      default:
        return status
    }
  }

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md cursor-pointer ${unit.isArchived ? 'opacity-60' : ''}`}
      onClick={() => onViewDetails(unit)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Home className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Unit {unit.unitNumber}</h3>
              {property && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.name}
                </div>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(unit.status)}>
            {getStatusLabel(unit.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Unit Type</p>
            <p className="font-medium text-gray-900">{unit.unitType}</p>
          </div>
          {unit.floorNumber && (
            <div>
              <p className="text-sm text-gray-600">Floor</p>
              <p className="font-medium text-gray-900">{unit.floorNumber}</p>
            </div>
          )}
        </div>

        {(unit.bedrooms || unit.bathrooms) && (
          <div className="grid grid-cols-2 gap-4">
            {unit.bedrooms && (
              <div>
                <p className="text-sm text-gray-600">Bedrooms</p>
                <p className="font-medium text-gray-900">{unit.bedrooms}</p>
              </div>
            )}
            {unit.bathrooms && (
              <div>
                <p className="text-sm text-gray-600">Bathrooms</p>
                <p className="font-medium text-gray-900">{unit.bathrooms}</p>
              </div>
            )}
          </div>
        )}

        {unit.sizeSqft && (
          <div>
            <p className="text-sm text-gray-600">Size</p>
            <p className="font-medium text-gray-900">{unit.sizeSqft.toLocaleString()} sq ft</p>
          </div>
        )}

        {unit.rentAmount && (
          <div className="flex items-center space-x-2">
            <PoundSterling className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Rent</p>
              <p className="font-semibold text-gray-900">{formatCurrency(unit.rentAmount)}/month</p>
            </div>
          </div>
        )}

        {activeTenancy && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Current Tenant</p>
            <p className="text-sm text-blue-700">{activeTenancy.tenantName}</p>
            <p className="text-xs text-blue-600">
              Lease: {new Date(activeTenancy.leaseStartDate).toLocaleDateString()} - {new Date(activeTenancy.leaseEndDate).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            {tenancies.length} tenancies
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(unit)
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
                  restoreUnit(unit.id)
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
                  archiveUnit(unit.id)
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
                softDeleteUnit(unit.id)
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