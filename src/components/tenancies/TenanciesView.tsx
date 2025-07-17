import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { TenancyCard } from './TenancyCard'
import { TenancyForm } from './TenancyForm'
import { TenancyDetailsModal } from './TenancyDetailsModal'
import { useData } from '../../context/DataContext'
import { Tenancy } from '../../types'

interface TenanciesViewProps {
  searchValue: string
}

export function TenanciesView({ searchValue }: TenanciesViewProps) {
  const { tenancies, units, properties } = useData()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTenancy, setEditingTenancy] = useState<Tenancy | undefined>()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [propertyFilter, setPropertyFilter] = useState<string>('all')
  const [selectedTenancy, setSelectedTenancy] = useState<Tenancy | null>(null)
  const [isTenancyModalOpen, setIsTenancyModalOpen] = useState(false)

  const activeTenancies = tenancies.filter(t => !t.isArchived)
  const activeUnits = units.filter(u => !u.isArchived)
  const activeProperties = properties.filter(p => !p.isArchived)

  const filteredTenancies = activeTenancies.filter(tenancy => {
    const unit = activeUnits.find(u => u.id === tenancy.unitId)
    const property = unit ? activeProperties.find(p => p.id === unit.propertyId) : undefined
    
    const matchesSearch = tenancy.tenantName.toLowerCase().includes(searchValue.toLowerCase()) ||
                         (tenancy.tenantEmail?.toLowerCase().includes(searchValue.toLowerCase()) || false) ||
                         (unit?.unitNumber.toLowerCase().includes(searchValue.toLowerCase()) || false) ||
                         (property?.name.toLowerCase().includes(searchValue.toLowerCase()) || false)
    
    const matchesStatus = statusFilter === 'all' || tenancy.status === statusFilter
    const matchesProperty = propertyFilter === 'all' || (unit && unit.propertyId === propertyFilter)
    
    return matchesSearch && matchesStatus && matchesProperty
  })

  const availableUnits = activeUnits.filter(unit => unit.status === 'vacant')

  const handleEdit = (tenancy: Tenancy) => {
    setEditingTenancy(tenancy)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTenancy(undefined)
  }

  const handleViewDetails = (tenancy: Tenancy) => {
    setSelectedTenancy(tenancy)
    setIsTenancyModalOpen(true)
  }

  const handleCloseTenancyModal = () => {
    setIsTenancyModalOpen(false)
    setSelectedTenancy(null)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {activeProperties.map(property => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={() => setIsFormOpen(true)} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={availableUnits.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tenancy
        </Button>
      </div>

      {availableUnits.length === 0 && activeUnits.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            No vacant units available. All units are currently occupied or under maintenance.
          </p>
        </div>
      )}

      {/* Tenancies Grid */}
      {filteredTenancies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenancies.map((tenancy) => (
            <TenancyCard
              key={tenancy.id}
              tenancy={tenancy}
              onEdit={handleEdit}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenancies found</h3>
          <p className="text-gray-500 mb-4">
            {searchValue || statusFilter !== 'all' || propertyFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : activeUnits.length === 0
              ? 'Create properties and units first, then add tenancies'
              : availableUnits.length === 0
              ? 'All units are currently occupied'
              : 'Get started by creating your first tenancy'
            }
          </p>
          {availableUnits.length > 0 && (
            <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Tenancy
            </Button>
          )}
        </div>
      )}

      {/* Tenancy Form Modal */}
      <TenancyForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        tenancy={editingTenancy}
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