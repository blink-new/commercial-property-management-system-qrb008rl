import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { UnitCard } from './UnitCard'
import { UnitForm } from './UnitForm'
import { UnitDetailsModal } from './UnitDetailsModal'
import { useData } from '../../context/DataContext'
import { Unit } from '../../types'

interface UnitsViewProps {
  searchValue: string
}

export function UnitsView({ searchValue }: UnitsViewProps) {
  const { units, properties } = useData()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>()
  const [selectedUnit, setSelectedUnit] = useState<Unit | undefined>()
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [propertyFilter, setPropertyFilter] = useState<string>('all')

  const activeUnits = units.filter(u => !u.isArchived)
  const activeProperties = properties.filter(p => !p.isArchived)

  const filteredUnits = activeUnits.filter(unit => {
    const property = activeProperties.find(p => p.id === unit.propertyId)
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
                         unit.unitType.toLowerCase().includes(searchValue.toLowerCase()) ||
                         (property?.name.toLowerCase().includes(searchValue.toLowerCase()) || false)
    
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter
    const matchesProperty = propertyFilter === 'all' || unit.propertyId === propertyFilter
    
    return matchesSearch && matchesStatus && matchesProperty
  })

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setIsFormOpen(true)
  }

  const handleViewDetails = (unit: Unit) => {
    setSelectedUnit(unit)
    setIsDetailsModalOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingUnit(undefined)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedUnit(undefined)
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
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
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

        <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>

      {/* Units Grid */}
      {filteredUnits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No units found</h3>
          <p className="text-gray-500 mb-4">
            {searchValue || statusFilter !== 'all' || propertyFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : activeProperties.length === 0
              ? 'Create a property first, then add units to it'
              : 'Get started by creating your first unit'
            }
          </p>
          {activeProperties.length > 0 && (
            <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          )}
        </div>
      )}

      {/* Unit Form Modal */}
      <UnitForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        unit={editingUnit}
      />

      {/* Unit Details Modal */}
      <UnitDetailsModal
        unit={selectedUnit || null}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onEdit={handleEdit}
      />
    </div>
  )
}