import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { PropertyCard } from './PropertyCard'
import { PropertyForm } from './PropertyForm'
import { PropertyDetailsModal } from './PropertyDetailsModal'
import { useData } from '../../context/DataContext'
import { Property } from '../../types'

interface PropertiesViewProps {
  searchValue: string
}

export function PropertiesView({ searchValue }: PropertiesViewProps) {
  const { properties } = useData()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | undefined>()
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const activeProperties = properties.filter(p => !p.isArchived)

  const filteredProperties = activeProperties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchValue.toLowerCase()) ||
                         property.propertyType.toLowerCase().includes(searchValue.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter
    const matchesType = typeFilter === 'all' || property.propertyType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const propertyTypes = [...new Set(activeProperties.map(p => p.propertyType))]

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingProperty(undefined)
  }

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedProperty(null)
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
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {propertyTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-4">
            {searchValue || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first property'
            }
          </p>
          <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      )}

      {/* Property Form Modal */}
      <PropertyForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        property={editingProperty}
      />

      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  )
}