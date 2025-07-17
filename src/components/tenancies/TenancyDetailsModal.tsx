import { X, Users, MapPin, Calendar, PoundSterling, Phone, Mail, FileText, AlertCircle, Clock, Building } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Tenancy, formatCurrency } from '../../types'
import { useData } from '../../context/DataContext'

interface TenancyDetailsModalProps {
  tenancy: Tenancy | null
  isOpen: boolean
  onClose: () => void
}

export function TenancyDetailsModal({ tenancy, isOpen, onClose }: TenancyDetailsModalProps) {
  const { getUnitById, getPropertyById } = useData()

  if (!tenancy) return null

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

  const getDaysUntilExpiry = () => {
    const endDate = new Date(tenancy.leaseEndDate)
    const today = new Date()
    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getLeaseDuration = () => {
    const startDate = new Date(tenancy.leaseStartDate)
    const endDate = new Date(tenancy.leaseEndDate)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const months = Math.floor(diffDays / 30)
    const years = Math.floor(months / 12)
    
    if (years > 0) {
      const remainingMonths = months % 12
      return remainingMonths > 0 ? `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : `${years} year${years > 1 ? 's' : ''}`
    }
    return `${months} month${months > 1 ? 's' : ''}`
  }

  const getRepairingObligationLabel = (obligation?: string) => {
    switch (obligation) {
      case 'fri':
        return 'Full Repairing and Insuring (FRI)'
      case 'iri':
        return 'Internal Repairing and Insuring (IRI)'
      default:
        return 'Not specified'
    }
  }

  const getRentReviewTypeLabel = (type?: string) => {
    switch (type) {
      case 'fixed':
        return 'Fixed'
      case 'indexed_rpi':
        return 'Indexed to RPI'
      case 'indexed_cpi':
        return 'Indexed to CPI'
      case 'open_market':
        return 'Open Market'
      case 'upwards_only_open_market':
        return 'Upwards Only Open Market'
      default:
        return 'Not specified'
    }
  }

  const getBreakTypeLabel = (type?: string) => {
    switch (type) {
      case 'mutual':
        return 'Mutual Break'
      case 'landlord_only':
        return 'Landlord Only'
      case 'tenant_only':
        return 'Tenant Only'
      default:
        return 'Not specified'
    }
  }

  const getInsideActLabel = (insideAct?: string) => {
    switch (insideAct) {
      case 'yes':
        return 'Yes - Inside the Act'
      case 'no':
        return 'No - Outside the Act'
      case 'na_scotland':
        return 'N/A - Scotland'
      default:
        return 'Not specified'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{tenancy.tenantName}</h2>
                {property && unit && (
                  <p className="text-sm text-gray-600">{property.name} - Unit {unit.unitNumber}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(tenancy.status)}>
                {getStatusLabel(tenancy.status)}
              </Badge>
              {isLeaseExpiring() && (
                <Badge className="bg-orange-100 text-orange-800">
                  Expiring Soon
                </Badge>
              )}
              {isLeaseExpired() && tenancy.status === 'active' && (
                <Badge className="bg-red-100 text-red-800">
                  Expired
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property & Unit Information */}
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

              {unit && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Unit Number</p>
                    <p className="font-medium">Unit {unit.unitNumber}</p>
                  </div>
                  {unit.floorNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Floor</p>
                      <p className="font-medium">Floor {unit.floorNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Unit Type</p>
                    <p className="font-medium">{unit.unitType}</p>
                  </div>
                  {unit.sizeSqft && (
                    <div>
                      <p className="text-sm text-gray-600">Size</p>
                      <p className="font-medium">{unit.sizeSqft.toLocaleString()} sq ft</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tenant Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Tenant Information</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tenant Name</p>
                  <p className="font-medium">{tenancy.tenantName}</p>
                </div>
                
                {tenancy.tenantEmail && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{tenancy.tenantEmail}</p>
                    </div>
                  </div>
                )}
                
                {tenancy.tenantPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{tenancy.tenantPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Lease Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Lease Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Lease Start Date</p>
                <p className="font-medium">{new Date(tenancy.leaseStartDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Lease End Date</p>
                <p className="font-medium">{new Date(tenancy.leaseEndDate).toLocaleDateString()}</p>
                {isLeaseExpiring() && (
                  <p className="text-xs text-orange-600 mt-1">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Expires in {getDaysUntilExpiry()} days
                  </p>
                )}
                {isLeaseExpired() && (
                  <p className="text-xs text-red-600 mt-1">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Expired {Math.abs(getDaysUntilExpiry())} days ago
                  </p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Lease Duration</p>
                <p className="font-medium">{getLeaseDuration()}</p>
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
              <div>
                <p className="text-sm text-gray-600">Monthly Rent</p>
                <p className="font-medium text-lg">{formatCurrency(tenancy.monthlyRent)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Annual Rent</p>
                <p className="font-medium text-lg">{formatCurrency(tenancy.monthlyRent * 12)}</p>
              </div>
              
              {tenancy.securityDeposit && (
                <div>
                  <p className="text-sm text-gray-600">Security Deposit</p>
                  <p className="font-medium">{formatCurrency(tenancy.securityDeposit)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Commercial Lease Specific Information */}
          {(tenancy.insideAct || tenancy.breakDate || tenancy.rentReviewDate || tenancy.repairingObligation) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <span>Commercial Lease Terms</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tenancy.insideAct && (
                    <div>
                      <p className="text-sm text-gray-600">Inside Landlord & Tenant Act 1954</p>
                      <p className="font-medium">{getInsideActLabel(tenancy.insideAct)}</p>
                    </div>
                  )}
                  
                  {tenancy.repairingObligation && (
                    <div>
                      <p className="text-sm text-gray-600">Repairing Obligation</p>
                      <p className="font-medium">{getRepairingObligationLabel(tenancy.repairingObligation)}</p>
                    </div>
                  )}
                  
                  {tenancy.rentReviewDate && (
                    <div>
                      <p className="text-sm text-gray-600">Next Rent Review</p>
                      <p className="font-medium">{new Date(tenancy.rentReviewDate).toLocaleDateString()}</p>
                      {tenancy.rentReviewType && (
                        <p className="text-xs text-gray-500">{getRentReviewTypeLabel(tenancy.rentReviewType)}</p>
                      )}
                    </div>
                  )}
                  
                  {tenancy.breakDate && (
                    <div>
                      <p className="text-sm text-gray-600">Break Date</p>
                      <p className="font-medium">{new Date(tenancy.breakDate).toLocaleDateString()}</p>
                      {tenancy.breakType && (
                        <p className="text-xs text-gray-500">{getBreakTypeLabel(tenancy.breakType)}</p>
                      )}
                      {tenancy.breakNoticePeriod && (
                        <p className="text-xs text-gray-500">
                          {tenancy.breakNoticePeriod} {tenancy.breakNoticePeriodUnit} notice required
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Documents */}
          {tenancy.tenancyDocuments && tenancy.tenancyDocuments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span>Tenancy Documents ({tenancy.tenancyDocuments.length})</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tenancy.tenancyDocuments.map((doc, index) => {
                    const getDocumentType = (dataUrl: string) => {
                      if (dataUrl.includes('data:application/pdf')) return 'PDF'
                      if (dataUrl.includes('data:application/msword') || dataUrl.includes('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'Word'
                      if (dataUrl.includes('data:image/')) return 'Image'
                      return 'Document'
                    }

                    const getDocumentIcon = (type: string) => {
                      switch (type) {
                        case 'PDF':
                          return '📄'
                        case 'Word':
                          return '📝'
                        case 'Image':
                          return '🖼️'
                        default:
                          return '📎'
                      }
                    }

                    const docType = getDocumentType(doc)
                    const docIcon = getDocumentIcon(docType)

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{docIcon}</span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {docType} Document {index + 1}
                            </p>
                            <p className="text-sm text-gray-500">
                              Uploaded document
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc, '_blank')}
                          className="flex items-center space-x-1"
                        >
                          <FileText className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {tenancy.notes && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notes</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{tenancy.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500">
            <div>
              <p>Created: {new Date(tenancy.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p>Last Updated: {new Date(tenancy.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}