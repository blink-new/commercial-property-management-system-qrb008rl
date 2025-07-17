import { X, Home, MapPin, Users, Calendar, PoundSterling, Edit, Archive, Trash2, RotateCcw, Building, Ruler, Bed, Bath } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Unit, formatCurrency } from '../../types'
import { useData } from '../../context/DataContext'

interface UnitDetailsModalProps {
  unit: Unit | null
  isOpen: boolean
  onClose: () => void
  onEdit: (unit: Unit) => void
  showArchived?: boolean
}

export function UnitDetailsModal({ unit, isOpen, onClose, onEdit, showArchived = false }: UnitDetailsModalProps) {
  const { archiveUnit, restoreUnit, deleteUnit, getPropertyById, getTenanciesForUnit } = useData()

  if (!unit) return null

  const property = getPropertyById(unit.propertyId)
  const tenancies = getTenanciesForUnit(unit.id)
  const activeTenancy = tenancies.find(t => t.status === 'active' && !t.isArchived)
  const tenancyHistory = tenancies.filter(t => t.status !== 'active' || t.isArchived)

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

  const getTenancyStatusColor = (status: string) => {
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

  const handleArchive = () => {
    archiveUnit(unit.id)
    onClose()
  }

  const handleRestore = () => {
    restoreUnit(unit.id)
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
      deleteUnit(unit.id)
      onClose()
    }
  }

  const handleEdit = () => {
    onEdit(unit)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Home className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Unit {unit.unitNumber}</h2>
                {property && (
                  <p className="text-sm text-gray-600">{property.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(unit.status)}>
                {getStatusLabel(unit.status)}
              </Badge>
              {unit.isArchived && (
                <Badge className="bg-gray-100 text-gray-800">
                  Archived
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span>Property Details</span>
              </h3>
              
              {property && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Property Name</p>
                    <p className="font-medium">{property.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{property.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Property Type</p>
                    <p className="font-medium">{property.propertyType}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Unit Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Home className="h-5 w-5 text-green-600" />
                <span>Unit Specifications</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Unit Type</p>
                  <p className="font-medium">{unit.unitType}</p>
                </div>
                
                {unit.floorNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Floor Number</p>
                    <p className="font-medium">Floor {unit.floorNumber}</p>
                  </div>
                )}
                
                {unit.sizeSqft && (
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Size</p>
                      <p className="font-medium">{unit.sizeSqft.toLocaleString()} sq ft</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {unit.bedrooms && (
                    <div className="flex items-center space-x-2">
                      <Bed className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Bedrooms</p>
                        <p className="font-medium">{unit.bedrooms}</p>
                      </div>
                    </div>
                  )}
                  
                  {unit.bathrooms && (
                    <div className="flex items-center space-x-2">
                      <Bath className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Bathrooms</p>
                        <p className="font-medium">{unit.bathrooms}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <PoundSterling className="h-5 w-5 text-green-600" />
              <span>Financial Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {unit.rentAmount && (
                <div>
                  <p className="text-sm text-gray-600">Monthly Rent</p>
                  <p className="font-medium text-lg">{formatCurrency(unit.rentAmount)}</p>
                </div>
              )}
              
              {unit.rentAmount && (
                <div>
                  <p className="text-sm text-gray-600">Annual Rent</p>
                  <p className="font-medium text-lg">{formatCurrency(unit.rentAmount * 12)}</p>
                </div>
              )}
              
              {unit.rateableValue && (
                <div>
                  <p className="text-sm text-gray-600">Rateable Value</p>
                  <p className="font-medium">{formatCurrency(unit.rateableValue)}</p>
                </div>
              )}
              
              {unit.ratesPayable && (
                <div>
                  <p className="text-sm text-gray-600">Rates Payable</p>
                  <p className="font-medium">{formatCurrency(unit.ratesPayable)}</p>
                </div>
              )}
            </div>
          </div>

          {/* EPC Information */}
          {(unit.epcRating || unit.epcUrl) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Energy Performance Certificate</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {unit.epcRating && (
                    <div>
                      <p className="text-sm text-gray-600">EPC Rating</p>
                      <p className="font-medium text-lg">{unit.epcRating}</p>
                    </div>
                  )}
                  
                  {unit.epcUrl && (
                    <div>
                      <p className="text-sm text-gray-600">EPC Certificate</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(unit.epcUrl, '_blank')}
                        className="mt-1"
                      >
                        View Certificate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Current Tenancy */}
          {activeTenancy && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Current Tenancy</span>
                </h3>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-900">{activeTenancy.tenantName}</h4>
                    <Badge className={getTenancyStatusColor(activeTenancy.status)}>
                      {activeTenancy.status.charAt(0).toUpperCase() + activeTenancy.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Lease Period</p>
                      <p className="text-blue-600">
                        {new Date(activeTenancy.leaseStartDate).toLocaleDateString()} - {new Date(activeTenancy.leaseEndDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-blue-700 font-medium">Monthly Rent</p>
                      <p className="text-blue-600">{formatCurrency(activeTenancy.monthlyRent)}</p>
                    </div>
                    
                    {activeTenancy.securityDeposit && (
                      <div>
                        <p className="text-blue-700 font-medium">Security Deposit</p>
                        <p className="text-blue-600">{formatCurrency(activeTenancy.securityDeposit)}</p>
                      </div>
                    )}
                  </div>
                  
                  {activeTenancy.tenantEmail && (
                    <div className="mt-3">
                      <p className="text-blue-700 font-medium text-sm">Contact</p>
                      <p className="text-blue-600 text-sm">{activeTenancy.tenantEmail}</p>
                      {activeTenancy.tenantPhone && (
                        <p className="text-blue-600 text-sm">{activeTenancy.tenantPhone}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tenancy History */}
          {tenancyHistory.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span>Tenancy History</span>
                </h3>
                
                <div className="space-y-3">
                  {tenancyHistory.map((tenancy) => (
                    <div key={tenancy.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{tenancy.tenantName}</h4>
                        <Badge className={getTenancyStatusColor(tenancy.status)}>
                          {tenancy.status.charAt(0).toUpperCase() + tenancy.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Lease Period</p>
                          <p>{new Date(tenancy.leaseStartDate).toLocaleDateString()} - {new Date(tenancy.leaseEndDate).toLocaleDateString()}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">Monthly Rent</p>
                          <p>{formatCurrency(tenancy.monthlyRent)}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">Duration</p>
                          <p>{Math.ceil((new Date(tenancy.leaseEndDate).getTime() - new Date(tenancy.leaseStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Description */}
          {unit.description && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Description</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{unit.description}</p>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <p>Created: {new Date(unit.createdAt).toLocaleDateString()}</p>
              <p>Last Updated: {new Date(unit.updatedAt).toLocaleDateString()}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Unit</span>
              </Button>
              
              {showArchived ? (
                <Button
                  variant="outline"
                  onClick={handleRestore}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restore</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleArchive}
                  className="flex items-center space-x-2 text-amber-600 hover:text-amber-700"
                >
                  <Archive className="h-4 w-4" />
                  <span>Archive</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleDelete}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}