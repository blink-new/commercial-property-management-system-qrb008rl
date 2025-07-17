import { X, Building2, MapPin, Calendar, PoundSterling, Users, Home, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Property, formatCurrency } from '../../types'
import { useData } from '../../context/DataContext'

interface PropertyDetailsModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
}

export function PropertyDetailsModal({ property, isOpen, onClose }: PropertyDetailsModalProps) {
  const { getUnitsForProperty, getTenanciesForUnit, getAnnualRentForProperty } = useData()
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)

  if (!property) return null

  const units = getUnitsForProperty(property.id)
  const activeUnits = units.filter(u => !u.isArchived)
  const occupiedUnits = activeUnits.filter(u => u.status === 'occupied')
  const vacantUnits = activeUnits.filter(u => u.status === 'vacant')
  const maintenanceUnits = activeUnits.filter(u => u.status === 'maintenance')
  
  const occupancyRate = activeUnits.length > 0 ? (occupiedUnits.length / activeUnits.length) * 100 : 0
  const annualRent = getAnnualRentForProperty(property.id)
  const monthlyRent = annualRent / 12

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

  const getTenureColor = (tenure?: string) => {
    switch (tenure) {
      case 'freehold':
        return 'bg-blue-100 text-blue-800'
      case 'leasehold':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const nextGalleryImage = () => {
    if (property.photoGallery && property.photoGallery.length > 0) {
      setCurrentGalleryIndex((prev) => 
        prev === property.photoGallery!.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevGalleryImage = () => {
    if (property.photoGallery && property.photoGallery.length > 0) {
      setCurrentGalleryIndex((prev) => 
        prev === 0 ? property.photoGallery!.length - 1 : prev - 1
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{property.name}</h2>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.address}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Photos */}
          {(property.photoUrl || (property.photoGallery && property.photoGallery.length > 0)) && (
            <div className="space-y-4">
              {/* Cover Photo */}
              {property.photoUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Cover Photo</h3>
                  <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={property.photoUrl}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Photo Gallery */}
              {property.photoGallery && property.photoGallery.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Photo Gallery ({property.photoGallery.length} photos)
                  </h3>
                  <div className="relative">
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={property.photoGallery[currentGalleryIndex]}
                        alt={`${property.name} - Photo ${currentGalleryIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {property.photoGallery.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={prevGalleryImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={nextGalleryImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                          {currentGalleryIndex + 1} / {property.photoGallery.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Gallery Thumbnails */}
                  {property.photoGallery.length > 1 && (
                    <div className="flex space-x-2 mt-2 overflow-x-auto pb-2">
                      {property.photoGallery.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentGalleryIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                            index === currentGalleryIndex 
                              ? 'border-blue-500' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={photo}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <Badge className={getStatusColor(property.status)}>
                {property.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Property Type</p>
              <p className="text-sm text-gray-900">{property.propertyType}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tenure</p>
              {property.tenure ? (
                <Badge className={getTenureColor(property.tenure)}>
                  {property.tenure}
                </Badge>
              ) : (
                <p className="text-sm text-gray-500">Not specified</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Created</p>
              <div className="flex items-center text-sm text-gray-900">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(property.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Title Number and Property Manager */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Title Number</p>
              <p className="text-sm text-gray-900">{property.titleNumber || 'Not specified'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Property Manager</p>
              <p className="text-sm text-gray-900">{property.propertyManager || 'Not assigned'}</p>
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Purchase Price</p>
              <div className="flex items-center space-x-1">
                <PoundSterling className="h-4 w-4 text-gray-600" />
                <p className="text-lg font-semibold text-gray-900">
                  {property.purchasePrice ? formatCurrency(property.purchasePrice) : 'Not specified'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <div className="flex items-center space-x-1">
                <PoundSterling className="h-4 w-4 text-blue-600" />
                <p className="text-lg font-semibold text-blue-600">
                  {property.currentValue ? formatCurrency(property.currentValue) : 'Not specified'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Annual Rent</p>
              <div className="flex items-center space-x-1">
                <PoundSterling className="h-4 w-4 text-green-600" />
                <p className="text-lg font-semibold text-green-600">
                  {annualRent > 0 ? formatCurrency(annualRent) : 'No active tenancies'}
                </p>
              </div>
            </div>
          </div>

          {/* Occupancy Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Occupancy Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{activeUnits.length}</span>
                </div>
                <p className="text-sm text-blue-600 font-medium">Total Units</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{occupiedUnits.length}</span>
                </div>
                <p className="text-sm text-green-600 font-medium">Occupied</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Home className="h-5 w-5 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-600">{vacantUnits.length}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Vacant</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">{maintenanceUnits.length}</span>
                </div>
                <p className="text-sm text-orange-600 font-medium">Maintenance</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Occupancy Rate</span>
                <span className="font-medium text-gray-900">{occupancyRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Purchase and Valuation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Purchase Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Purchase Date</p>
                  <p className="text-sm text-gray-900">
                    {property.purchaseDate ? new Date(property.purchaseDate).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Purchase Price</p>
                  <p className="text-sm text-gray-900">
                    {property.purchasePrice ? formatCurrency(property.purchasePrice) : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Valuation Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valuation Date</p>
                  <p className="text-sm text-gray-900">
                    {property.valuationDate ? new Date(property.valuationDate).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Valued By</p>
                  <p className="text-sm text-gray-900">{property.valuedBy || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Value</p>
                  <p className="text-sm text-gray-900">
                    {property.currentValue ? formatCurrency(property.currentValue) : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          {(property.description || property.propertyDescription || property.locationDescription) && (
            <div className="space-y-4">
              {property.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}

              {property.propertyDescription && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">Property Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{property.propertyDescription}</p>
                </div>
              )}

              {property.locationDescription && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">Location Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{property.locationDescription}</p>
                </div>
              )}
            </div>
          )}

          {/* Units Summary */}
          {activeUnits.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Units Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeUnits.slice(0, 6).map((unit) => {
                  const tenancies = getTenanciesForUnit(unit.id).filter(t => !t.isArchived && t.status === 'active')
                  const currentTenancy = tenancies[0]
                  
                  return (
                    <div key={unit.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">Unit {unit.unitNumber}</p>
                        <Badge className={
                          unit.status === 'occupied' ? 'bg-green-100 text-green-800' :
                          unit.status === 'vacant' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }>
                          {unit.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Type: {unit.unitType}</p>
                        {unit.sizeSqft && <p>Size: {unit.sizeSqft} sq ft</p>}
                        {currentTenancy && (
                          <p>Tenant: {currentTenancy.tenantName}</p>
                        )}
                        {currentTenancy && (
                          <p>Rent: {formatCurrency(currentTenancy.monthlyRent)}/month</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {activeUnits.length > 6 && (
                <p className="text-sm text-gray-500 text-center">
                  And {activeUnits.length - 6} more units...
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}