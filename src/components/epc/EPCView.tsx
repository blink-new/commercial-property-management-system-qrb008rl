import { useState } from 'react'
import { Plus, Filter, ExternalLink, Zap } from 'lucide-react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { EPCForm } from './EPCForm'
import { TenancyDetailsModal } from '../tenancies/TenancyDetailsModal'
import { useData } from '../../context/DataContext'
import { EPCData, Tenancy } from '../../types'

interface EPCViewProps {
  searchValue: string
}

const EPC_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const getRatingColor = (rating: string) => {
  switch (rating.toUpperCase()) {
    case 'A':
      return 'bg-green-600 text-white'
    case 'B':
      return 'bg-green-500 text-white'
    case 'C':
      return 'bg-yellow-500 text-white'
    case 'D':
      return 'bg-orange-500 text-white'
    case 'E':
      return 'bg-red-500 text-white'
    case 'F':
      return 'bg-red-600 text-white'
    case 'G':
      return 'bg-red-700 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

export function EPCView({ searchValue }: EPCViewProps) {
  const { epcData, units, properties, tenancies, getPropertyById, getUnitById } = useData()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEPC, setEditingEPC] = useState<EPCData | undefined>()
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [selectedTenancy, setSelectedTenancy] = useState<Tenancy | null>(null)
  const [isTenancyModalOpen, setIsTenancyModalOpen] = useState(false)

  const activeEPCData = epcData.filter(epc => !epc.isArchived)

  const filteredEPCData = activeEPCData.filter(epc => {
    const unit = getUnitById(epc.unitId)
    const property = unit ? getPropertyById(unit.propertyId) : null
    
    const matchesSearch = 
      unit?.unitNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      property?.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      epc.rating.toLowerCase().includes(searchValue.toLowerCase())
    
    const matchesRating = ratingFilter === 'all' || epc.rating === ratingFilter
    
    return matchesSearch && matchesRating
  })

  const handleEdit = (epc: EPCData) => {
    setEditingEPC(epc)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingEPC(undefined)
  }

  const handleTenancyClick = (tenancy: Tenancy) => {
    setSelectedTenancy(tenancy)
    setIsTenancyModalOpen(true)
  }

  const handleCloseTenancyModal = () => {
    setIsTenancyModalOpen(false)
    setSelectedTenancy(null)
  }

  const getUnitDisplay = (unitId: string) => {
    const unit = getUnitById(unitId)
    const property = unit ? getPropertyById(unit.propertyId) : null
    return unit && property ? `${property.name} - Unit ${unit.unitNumber}` : 'Unknown Unit'
  }

  const getUnitOccupancyInfo = (unitId: string) => {
    const unit = getUnitById(unitId)
    if (!unit) return { isOccupied: false, currentTenant: null }

    const activeTenancy = tenancies.find(
      t => t.unitId === unitId && t.status === 'active' && !t.isArchived
    )

    return {
      isOccupied: unit.status === 'occupied' && !!activeTenancy,
      currentTenant: activeTenancy
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {EPC_RATINGS.map(rating => (
                  <SelectItem key={rating} value={rating}>Rating {rating}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={() => window.open('https://find-energy-certificate.service.gov.uk/', '_blank')}
            className="flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Gov EPC Portal</span>
          </Button>
        </div>

        <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add EPC Data
        </Button>
      </div>

      {/* EPC Data Grid */}
      {filteredEPCData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEPCData.map((epc) => {
            const occupancyInfo = getUnitOccupancyInfo(epc.unitId)
            return (
              <Card key={epc.id} className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-50 rounded-lg">
                        <Zap className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{getUnitDisplay(epc.unitId)}</CardTitle>
                      </div>
                    </div>
                    <Badge className={getRatingColor(epc.rating)}>
                      {epc.rating}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Occupancy Status */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Occupancy Status</p>
                      <Badge className={occupancyInfo.isOccupied ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {occupancyInfo.isOccupied ? 'Occupied' : 'Vacant'}
                      </Badge>
                    </div>
                    {occupancyInfo.isOccupied && occupancyInfo.currentTenant && (
                      <div>
                        <p className="text-sm text-gray-600">Current Tenant</p>
                        <button
                          onClick={() => handleTenancyClick(occupancyInfo.currentTenant!)}
                          className="text-left hover:bg-blue-50 p-2 rounded-md transition-colors duration-200 w-full"
                        >
                          <p className="font-medium text-blue-600 hover:text-blue-700">{occupancyInfo.currentTenant.tenantName}</p>
                          {occupancyInfo.currentTenant.tenantEmail && (
                            <p className="text-xs text-gray-500">{occupancyInfo.currentTenant.tenantEmail}</p>
                          )}
                          <p className="text-xs text-blue-500 mt-1">Click to view details</p>
                        </button>
                      </div>
                    )}
                  </div>

                  {epc.validUntil && (
                    <div>
                      <p className="text-sm text-gray-600">Valid Until</p>
                      <p className="font-medium text-gray-900">
                        {new Date(epc.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {epc.certificateUrl && (
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(epc.certificateUrl, '_blank')}
                        className="flex items-center space-x-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Certificate</span>
                      </Button>
                    </div>
                  )}

                  {epc.governmentPortalUrl && (
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(epc.governmentPortalUrl, '_blank')}
                        className="flex items-center space-x-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Gov Portal</span>
                      </Button>
                    </div>
                  )}

                  {epc.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="text-sm text-gray-900">{epc.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(epc)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No EPC data found</h3>
          <p className="text-gray-500 mb-4">
            {searchValue || ratingFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding EPC data for your units'
            }
          </p>
          <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add EPC Data
          </Button>
        </div>
      )}

      {/* EPC Form Modal */}
      <EPCForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        epcData={editingEPC}
      />

      {/* Tenancy Details Modal */}
      <TenancyDetailsModal
        tenancy={selectedTenancy}
        isOpen={isTenancyModalOpen}
        onClose={handleCloseTenancyModal}
      />
    </div>
  )
}