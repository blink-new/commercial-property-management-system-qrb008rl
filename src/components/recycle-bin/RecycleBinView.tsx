import { useState, useEffect } from 'react'
import { Trash2, RotateCcw, AlertTriangle, Calendar, Clock, Building2, Home, Users } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { useData } from '../../context/DataContext'
import { Property, Unit, Tenancy, DiaryEvent, MaintenanceIssue, InsurancePolicy, EPCData, formatCurrency } from '../../types'

interface RecycleBinViewProps {
  searchValue: string
}

interface DeletedItem {
  id: string
  type: 'property' | 'unit' | 'tenancy' | 'diary' | 'maintenance' | 'insurance' | 'epc'
  name: string
  description: string
  deletedAt: string
  daysRemaining: number
  data: any
}

export function RecycleBinView({ searchValue }: RecycleBinViewProps) {
  const { 
    properties, units, tenancies, 
    restoreProperty, restoreUnit, restoreTenancy,
    deleteProperty, deleteUnit, deleteTenancy,
    getPropertyById, getUnitById
  } = useData()
  
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    item: DeletedItem | null
    action: 'restore' | 'delete'
  }>({
    isOpen: false,
    item: null,
    action: 'restore'
  })

  // Calculate days remaining until permanent deletion (30 days)
  const calculateDaysRemaining = (deletedAt: string): number => {
    const deletedDate = new Date(deletedAt)
    const now = new Date()
    const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - deletedDate.getTime())
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  // Load deleted items from all data sources
  useEffect(() => {
    const items: DeletedItem[] = []

    // Properties
    properties.filter(p => p.isDeleted && p.deletedAt).forEach(property => {
      const daysRemaining = calculateDaysRemaining(property.deletedAt!)
      if (daysRemaining > 0) {
        items.push({
          id: property.id,
          type: 'property',
          name: property.name,
          description: `${property.propertyType} • ${property.address}`,
          deletedAt: property.deletedAt!,
          daysRemaining,
          data: property
        })
      }
    })

    // Units
    units.filter(u => u.isDeleted && u.deletedAt).forEach(unit => {
      const property = getPropertyById(unit.propertyId)
      const daysRemaining = calculateDaysRemaining(unit.deletedAt!)
      if (daysRemaining > 0) {
        items.push({
          id: unit.id,
          type: 'unit',
          name: `Unit ${unit.unitNumber}`,
          description: `${unit.unitType} • ${property?.name || 'Unknown Property'}`,
          deletedAt: unit.deletedAt!,
          daysRemaining,
          data: unit
        })
      }
    })

    // Tenancies
    tenancies.filter(t => t.isDeleted && t.deletedAt).forEach(tenancy => {
      const unit = getUnitById(tenancy.unitId)
      const property = unit ? getPropertyById(unit.propertyId) : null
      const daysRemaining = calculateDaysRemaining(tenancy.deletedAt!)
      if (daysRemaining > 0) {
        items.push({
          id: tenancy.id,
          type: 'tenancy',
          name: tenancy.tenantName,
          description: `Unit ${unit?.unitNumber || 'Unknown'} • ${property?.name || 'Unknown Property'}`,
          deletedAt: tenancy.deletedAt!,
          daysRemaining,
          data: tenancy
        })
      }
    })

    // Sort by days remaining (most urgent first)
    items.sort((a, b) => a.daysRemaining - b.daysRemaining)
    setDeletedItems(items)
  }, [properties, units, tenancies, getPropertyById, getUnitById])

  // Auto-delete items after 30 days
  useEffect(() => {
    const checkExpiredItems = () => {
      const now = new Date()
      
      // Check properties
      properties.filter(p => p.isDeleted && p.deletedAt).forEach(property => {
        const deletedDate = new Date(property.deletedAt!)
        const daysPassed = (now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysPassed >= 30) {
          deleteProperty(property.id)
        }
      })

      // Check units
      units.filter(u => u.isDeleted && u.deletedAt).forEach(unit => {
        const deletedDate = new Date(unit.deletedAt!)
        const daysPassed = (now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysPassed >= 30) {
          deleteUnit(unit.id)
        }
      })

      // Check tenancies
      tenancies.filter(t => t.isDeleted && t.deletedAt).forEach(tenancy => {
        const deletedDate = new Date(tenancy.deletedAt!)
        const daysPassed = (now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysPassed >= 30) {
          deleteTenancy(tenancy.id)
        }
      })
    }

    // Check immediately and then every hour
    checkExpiredItems()
    const interval = setInterval(checkExpiredItems, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [properties, units, tenancies, deleteProperty, deleteUnit, deleteTenancy])

  const filteredItems = deletedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchValue.toLowerCase())
    
    const matchesTab = activeTab === 'all' || item.type === activeTab
    
    return matchesSearch && matchesTab
  })

  const handleRestore = (item: DeletedItem) => {
    setConfirmDialog({
      isOpen: true,
      item,
      action: 'restore'
    })
  }

  const handlePermanentDelete = (item: DeletedItem) => {
    setConfirmDialog({
      isOpen: true,
      item,
      action: 'delete'
    })
  }

  const confirmAction = () => {
    if (!confirmDialog.item) return

    const { item, action } = confirmDialog
    
    if (action === 'restore') {
      switch (item.type) {
        case 'property':
          restoreProperty(item.id)
          break
        case 'unit':
          restoreUnit(item.id)
          break
        case 'tenancy':
          restoreTenancy(item.id)
          break
      }
    } else {
      switch (item.type) {
        case 'property':
          deleteProperty(item.id)
          break
        case 'unit':
          deleteUnit(item.id)
          break
        case 'tenancy':
          deleteTenancy(item.id)
          break
      }
    }

    setConfirmDialog({ isOpen: false, item: null, action: 'restore' })
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'property':
        return Building2
      case 'unit':
        return Home
      case 'tenancy':
        return Users
      default:
        return Trash2
    }
  }

  const getUrgencyColor = (daysRemaining: number) => {
    if (daysRemaining <= 3) return 'bg-red-100 text-red-800'
    if (daysRemaining <= 7) return 'bg-orange-100 text-orange-800'
    if (daysRemaining <= 14) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'property':
        return 'bg-blue-100 text-blue-800'
      case 'unit':
        return 'bg-purple-100 text-purple-800'
      case 'tenancy':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const itemCounts = {
    all: deletedItems.length,
    property: deletedItems.filter(i => i.type === 'property').length,
    unit: deletedItems.filter(i => i.type === 'unit').length,
    tenancy: deletedItems.filter(i => i.type === 'tenancy').length
  }

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Items in the Recycle Bin will be permanently deleted after 30 days. 
          You can restore them before then or delete them permanently.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{deletedItems.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Urgent (≤3 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {deletedItems.filter(i => i.daysRemaining <= 3).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Warning (≤7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {deletedItems.filter(i => i.daysRemaining <= 7).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Safe (&gt;7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {deletedItems.filter(i => i.daysRemaining > 7).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <span>All Items</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {itemCounts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="property" className="flex items-center space-x-2">
            <span>Properties</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {itemCounts.property}
            </span>
          </TabsTrigger>
          <TabsTrigger value="unit" className="flex items-center space-x-2">
            <span>Units</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {itemCounts.unit}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tenancy" className="flex items-center space-x-2">
            <span>Tenancies</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {itemCounts.tenancy}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredItems.length > 0 ? (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const ItemIcon = getItemIcon(item.type)
                
                return (
                  <Card key={item.id} className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <ItemIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <Badge className={getTypeColor(item.type)}>
                                {item.type.toUpperCase()}
                              </Badge>
                              <Badge className={getUrgencyColor(item.daysRemaining)}>
                                {item.daysRemaining} days left
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600">{item.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Deleted: {new Date(item.deletedAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>Expires: {new Date(new Date(item.deletedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(item)}
                            className="flex items-center space-x-1"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>Restore</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handlePermanentDelete(item)}
                            className="flex items-center space-x-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Forever</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {deletedItems.length === 0 ? 'Recycle Bin is empty' : 'No items found'}
              </h3>
              <p className="text-gray-500">
                {searchValue 
                  ? 'Try adjusting your search terms'
                  : deletedItems.length === 0
                  ? 'Deleted items will appear here and be automatically removed after 30 days'
                  : 'All deleted items match your current filter'
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => 
        setConfirmDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === 'restore' ? 'Restore Item' : 'Delete Permanently'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === 'restore' 
                ? `Are you sure you want to restore "${confirmDialog.item?.name}"? It will be moved back to its original location.`
                : `Are you sure you want to permanently delete "${confirmDialog.item?.name}"? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button 
              variant={confirmDialog.action === 'restore' ? 'default' : 'destructive'}
              onClick={confirmAction}
            >
              {confirmDialog.action === 'restore' ? 'Restore' : 'Delete Forever'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}