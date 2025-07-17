import { Building2, MapPin, Users, Edit, Archive, Trash2, RotateCcw, PoundSterling } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Property, formatCurrency } from '../../types'
import { useData } from '../../context/DataContext'

interface PropertyCardProps {
  property: Property
  onEdit: (property: Property) => void
  onViewDetails?: (property: Property) => void
  showArchived?: boolean
}

export function PropertyCard({ property, onEdit, onViewDetails, showArchived = false }: PropertyCardProps) {
  const { archiveProperty, restoreProperty, softDeleteProperty, getAnnualRentForProperty } = useData()

  const occupancyRate = property.totalUnits > 0 
    ? (property.occupiedUnits / property.totalUnits) * 100 
    : 0

  const annualRent = getAnnualRentForProperty(property.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${property.isArchived ? 'opacity-60' : ''} ${onViewDetails ? 'cursor-pointer' : ''}`}
      onClick={() => onViewDetails?.(property)}
    >
      {property.photoUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={property.photoUrl}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{property.name}</h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {property.address}
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(property.status)}>
            {property.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Property Type</p>
            <p className="font-medium text-gray-900">{property.propertyType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Units</p>
            <p className="font-medium text-gray-900">{property.totalUnits}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Occupancy</span>
            <span className="font-medium text-gray-900">
              {property.occupiedUnits}/{property.totalUnits} ({occupancyRate.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        {property.currentValue && (
          <div>
            <p className="text-sm text-gray-600">Current Value</p>
            <p className="font-semibold text-gray-900">{formatCurrency(property.currentValue)}</p>
          </div>
        )}

        {annualRent > 0 && (
          <div>
            <p className="text-sm text-gray-600">Annual Rent</p>
            <div className="flex items-center space-x-1">
              <PoundSterling className="h-4 w-4 text-green-600" />
              <p className="font-semibold text-green-600">{formatCurrency(annualRent)}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            {property.occupiedUnits} tenants
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(property)
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
                  restoreProperty(property.id)
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
                  archiveProperty(property.id)
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
                softDeleteProperty(property.id)
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