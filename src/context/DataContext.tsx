import React, { createContext, useContext, ReactNode, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Property, Unit, Tenancy, EPCData, MaintenanceIssue, InsurancePolicy, PropertyFormData, UnitFormData, TenancyFormData, EPCFormData, MaintenanceFormData, InsuranceFormData } from '../types'
import { generateSampleData } from '../utils/sampleData'
import { toast } from 'react-hot-toast'

interface DataContextType {
  // Properties
  properties: Property[]
  addProperty: (property: PropertyFormData) => void
  updateProperty: (id: string, property: Partial<Property>) => void
  archiveProperty: (id: string) => void
  restoreProperty: (id: string) => void
  deleteProperty: (id: string) => void
  softDeleteProperty: (id: string) => void // New: Move to recycle bin

  // Units
  units: Unit[]
  addUnit: (unit: UnitFormData) => void
  updateUnit: (id: string, unit: Partial<Unit>) => void
  archiveUnit: (id: string) => void
  restoreUnit: (id: string) => void
  deleteUnit: (id: string) => void
  softDeleteUnit: (id: string) => void // New: Move to recycle bin

  // Tenancies
  tenancies: Tenancy[]
  addTenancy: (tenancy: TenancyFormData) => void
  updateTenancy: (id: string, tenancy: Partial<Tenancy>) => void
  archiveTenancy: (id: string) => void
  restoreTenancy: (id: string) => void
  deleteTenancy: (id: string) => void
  softDeleteTenancy: (id: string) => void // New: Move to recycle bin

  // EPC Data
  epcData: EPCData[]
  addEPCData: (epc: EPCFormData) => void
  updateEPCData: (id: string, epc: Partial<EPCData>) => void
  archiveEPCData: (id: string) => void
  restoreEPCData: (id: string) => void
  deleteEPCData: (id: string) => void

  // Maintenance Issues
  maintenanceIssues: MaintenanceIssue[]
  addMaintenanceIssue: (maintenance: MaintenanceFormData) => void
  updateMaintenanceIssue: (id: string, maintenance: Partial<MaintenanceIssue>) => void
  archiveMaintenanceIssue: (id: string) => void
  restoreMaintenanceIssue: (id: string) => void
  deleteMaintenanceIssue: (id: string) => void

  // Insurance Policies
  insurancePolicies: InsurancePolicy[]
  addInsurancePolicy: (insurance: InsuranceFormData) => void
  updateInsurancePolicy: (id: string, insurance: Partial<InsurancePolicy>) => void
  archiveInsurancePolicy: (id: string) => void
  restoreInsurancePolicy: (id: string) => void
  deleteInsurancePolicy: (id: string) => void

  // Utility functions
  getUnitsForProperty: (propertyId: string) => Unit[]
  getTenanciesForUnit: (unitId: string) => Tenancy[]
  getEPCForUnit: (unitId: string) => EPCData | undefined
  getPropertyById: (id: string) => Property | undefined
  getUnitById: (id: string) => Unit | undefined
  getAnnualRentForProperty: (propertyId: string) => number
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

interface DataProviderProps {
  children: ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const [properties, setProperties] = useLocalStorage<Property[]>('properties', [])
  const [units, setUnits] = useLocalStorage<Unit[]>('units', [])
  const [tenancies, setTenancies] = useLocalStorage<Tenancy[]>('tenancies', [])
  const [epcData, setEpcData] = useLocalStorage<EPCData[]>('epcData', [])
  const [maintenanceIssues, setMaintenanceIssues] = useLocalStorage<MaintenanceIssue[]>('maintenanceIssues', [])
  const [insurancePolicies, setInsurancePolicies] = useLocalStorage<InsurancePolicy[]>('insurancePolicies', [])

  // Initialize with sample data if no data exists
  useEffect(() => {
    if (properties.length === 0 && units.length === 0 && tenancies.length === 0) {
      const sampleData = generateSampleData()
      setProperties(sampleData.properties)
      setUnits(sampleData.units)
      setTenancies(sampleData.tenancies)
      setMaintenanceIssues(sampleData.maintenanceIssues)
      setInsurancePolicies(sampleData.insurancePolicies)
      console.log('Loaded sample data including maintenance and insurance')
    }
  }, [properties.length, units.length, tenancies.length, setProperties, setUnits, setTenancies, setMaintenanceIssues, setInsurancePolicies])

  // Utility function to recalculate property occupancy
  const recalculatePropertyOccupancy = (propertyId: string) => {
    const propertyUnits = units.filter(unit => 
      unit.propertyId === propertyId && 
      !unit.isArchived && 
      !unit.isDeleted
    )
    
    const occupiedUnits = propertyUnits.filter(unit => unit.status === 'occupied').length
    
    setProperties(prev => prev.map(property => 
      property.id === propertyId
        ? { 
            ...property, 
            totalUnits: propertyUnits.length,
            occupiedUnits: occupiedUnits,
            updatedAt: getCurrentTimestamp() 
          }
        : property
    ))
  }

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const getCurrentTimestamp = () => new Date().toISOString()

  // Property functions
  const addProperty = (propertyData: PropertyFormData) => {
    const newProperty: Property = {
      ...propertyData,
      id: generateId(),
      userId: 'current-user', // In real app, get from auth
      isArchived: false,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }
    setProperties(prev => [...prev, newProperty])
    toast.success('Property created successfully')
  }

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(property => 
      property.id === id 
        ? { ...property, ...updates, updatedAt: getCurrentTimestamp() }
        : property
    ))
    toast.success('Property updated successfully')
  }

  const archiveProperty = (id: string) => {
    updateProperty(id, { isArchived: true })
    toast.success('Property archived')
    // Recalculate property occupancy after archiving using setTimeout to ensure state is updated
    setTimeout(() => recalculatePropertyOccupancy(id), 0)
  }

  const restoreProperty = (id: string) => {
    const property = properties.find(p => p.id === id)
    if (property?.isDeleted) {
      updateProperty(id, { isDeleted: false, deletedAt: undefined })
      toast.success('Property restored from recycle bin')
    } else {
      updateProperty(id, { isArchived: false })
      toast.success('Property restored from archive')
    }
    // Recalculate property occupancy after restoration using setTimeout to ensure state is updated
    setTimeout(() => recalculatePropertyOccupancy(id), 0)
  }

  const softDeleteProperty = (id: string) => {
    updateProperty(id, { isDeleted: true, deletedAt: getCurrentTimestamp() })
    toast.success('Property moved to recycle bin')
    // Recalculate property occupancy after soft deletion using setTimeout to ensure state is updated
    setTimeout(() => recalculatePropertyOccupancy(id), 0)
  }

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(property => property.id !== id))
    // Also delete associated units and tenancies
    const propertyUnits = units.filter(unit => unit.propertyId === id)
    propertyUnits.forEach(unit => {
      setTenancies(prev => prev.filter(tenancy => tenancy.unitId !== unit.id))
    })
    setUnits(prev => prev.filter(unit => unit.propertyId !== id))
    toast.success('Property deleted permanently')
  }

  // Unit functions
  const addUnit = (unitData: UnitFormData) => {
    const newUnit: Unit = {
      ...unitData,
      id: generateId(),
      userId: 'current-user',
      isArchived: false,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }
    setUnits(prev => [...prev, newUnit])
    
    toast.success('Unit created successfully')
    
    // Recalculate property occupancy after adding unit using setTimeout to ensure state is updated
    setTimeout(() => recalculatePropertyOccupancy(unitData.propertyId), 0)
  }

  const updateUnit = (id: string, updates: Partial<Unit>) => {
    const unit = units.find(u => u.id === id)
    setUnits(prev => prev.map(unit => 
      unit.id === id 
        ? { ...unit, ...updates, updatedAt: getCurrentTimestamp() }
        : unit
    ))
    toast.success('Unit updated successfully')
    
    // If status was updated, recalculate property occupancy
    if (updates.status && unit) {
      setTimeout(() => recalculatePropertyOccupancy(unit.propertyId), 0)
    }
  }

  const archiveUnit = (id: string) => {
    const unit = units.find(u => u.id === id)
    updateUnit(id, { isArchived: true })
    toast.success('Unit archived')
    
    // Recalculate property occupancy after archiving unit
    if (unit) {
      setTimeout(() => recalculatePropertyOccupancy(unit.propertyId), 0)
    }
  }

  const restoreUnit = (id: string) => {
    const unit = units.find(u => u.id === id)
    if (unit?.isDeleted) {
      updateUnit(id, { isDeleted: false, deletedAt: undefined })
      
      // Recalculate property occupancy after unit restoration
      recalculatePropertyOccupancy(unit.propertyId)
      
      toast.success('Unit restored from recycle bin')
    } else {
      updateUnit(id, { isArchived: false })
      toast.success('Unit restored from archive')
    }
  }

  const softDeleteUnit = (id: string) => {
    const unit = units.find(u => u.id === id)
    if (unit) {
      updateUnit(id, { isDeleted: true, deletedAt: getCurrentTimestamp() })
      
      // Recalculate property occupancy after unit deletion
      recalculatePropertyOccupancy(unit.propertyId)
      
      toast.success('Unit moved to recycle bin')
    }
  }

  const deleteUnit = (id: string) => {
    const unit = units.find(u => u.id === id)
    if (unit) {
      setUnits(prev => prev.filter(u => u.id !== id))
      // Delete associated tenancies
      setTenancies(prev => prev.filter(tenancy => tenancy.unitId !== id))
      toast.success('Unit deleted permanently')
      
      // Recalculate property occupancy after deleting unit using setTimeout to ensure state is updated
      setTimeout(() => recalculatePropertyOccupancy(unit.propertyId), 0)
    }
  }

  // Tenancy functions
  const addTenancy = (tenancyData: TenancyFormData) => {
    const newTenancy: Tenancy = {
      ...tenancyData,
      id: generateId(),
      userId: 'current-user',
      isArchived: false,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }
    setTenancies(prev => [...prev, newTenancy])
    
    // Update unit status to occupied
    setUnits(prev => prev.map(unit => 
      unit.id === tenancyData.unitId
        ? { ...unit, status: 'occupied', updatedAt: getCurrentTimestamp() }
        : unit
    ))
    
    toast.success('Tenancy created successfully')
    
    // Recalculate property occupancy after adding tenancy using setTimeout to ensure state is updated
    const unit = units.find(u => u.id === tenancyData.unitId)
    if (unit) {
      setTimeout(() => recalculatePropertyOccupancy(unit.propertyId), 0)
    }
  }

  const updateTenancy = (id: string, updates: Partial<Tenancy>) => {
    setTenancies(prev => prev.map(tenancy => 
      tenancy.id === id 
        ? { ...tenancy, ...updates, updatedAt: getCurrentTimestamp() }
        : tenancy
    ))
    toast.success('Tenancy updated successfully')
  }

  const archiveTenancy = (id: string) => {
    const tenancy = tenancies.find(t => t.id === id)
    if (tenancy) {
      updateTenancy(id, { isArchived: true, status: 'terminated' })
      
      // Update unit status to vacant
      setUnits(prev => prev.map(unit => 
        unit.id === tenancy.unitId
          ? { ...unit, status: 'vacant', updatedAt: getCurrentTimestamp() }
          : unit
      ))
      
      toast.success('Tenancy archived')
      
      // Recalculate property occupancy after archiving tenancy using setTimeout to ensure state is updated
      const unit = units.find(u => u.id === tenancy.unitId)
      if (unit) {
        setTimeout(() => recalculatePropertyOccupancy(unit.propertyId), 0)
      }
    }
  }

  const restoreTenancy = (id: string) => {
    const tenancy = tenancies.find(t => t.id === id)
    if (tenancy) {
      if (tenancy.isDeleted) {
        updateTenancy(id, { isDeleted: false, deletedAt: undefined, status: 'active' })
        toast.success('Tenancy restored from recycle bin')
      } else {
        updateTenancy(id, { isArchived: false, status: 'active' })
        toast.success('Tenancy restored from archive')
      }
      
      // Update unit status to occupied
      setUnits(prev => prev.map(unit => 
        unit.id === tenancy.unitId
          ? { ...unit, status: 'occupied', updatedAt: getCurrentTimestamp() }
          : unit
      ))
      
      // Recalculate property occupancy after restoring tenancy using setTimeout to ensure state is updated
      const unit = units.find(u => u.id === tenancy.unitId)
      if (unit) {
        setTimeout(() => recalculatePropertyOccupancy(unit.propertyId), 0)
      }
    }
  }

  const softDeleteTenancy = (id: string) => {
    const tenancy = tenancies.find(t => t.id === id)
    if (tenancy) {
      updateTenancy(id, { isDeleted: true, deletedAt: getCurrentTimestamp(), status: 'terminated' })
      
      // Update unit status to vacant
      setUnits(prev => prev.map(unit => 
        unit.id === tenancy.unitId
          ? { ...unit, status: 'vacant', updatedAt: getCurrentTimestamp() }
          : unit
      ))
      
      toast.success('Tenancy moved to recycle bin')
      
      // Recalculate property occupancy after soft deleting tenancy using setTimeout to ensure state is updated
      const unit = units.find(u => u.id === tenancy.unitId)
      if (unit) {
        setTimeout(() => recalculatePropertyOccupancy(unit.propertyId), 0)
      }
    }
  }

  const deleteTenancy = (id: string) => {
    const tenancy = tenancies.find(t => t.id === id)
    if (tenancy) {
      setTenancies(prev => prev.filter(t => t.id !== id))
      
      // Update unit status to vacant
      setUnits(prev => prev.map(unit => 
        unit.id === tenancy.unitId
          ? { ...unit, status: 'vacant', updatedAt: getCurrentTimestamp() }
          : unit
      ))
      
      toast.success('Tenancy deleted permanently')
      
      // Recalculate property occupancy after deleting tenancy using setTimeout to ensure state is updated
      const unit = units.find(u => u.id === tenancy.unitId)
      if (unit) {
        setTimeout(() => recalculatePropertyOccupancy(unit.propertyId), 0)
      }
    }
  }

  // EPC functions
  const addEPCData = (epcFormData: EPCFormData) => {
    const newEPC: EPCData = {
      ...epcFormData,
      id: generateId(),
      userId: 'current-user',
      isArchived: false,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }
    setEpcData(prev => [...prev, newEPC])
    toast.success('EPC data added successfully')
  }

  const updateEPCData = (id: string, updates: Partial<EPCData>) => {
    setEpcData(prev => prev.map(epc => 
      epc.id === id 
        ? { ...epc, ...updates, updatedAt: getCurrentTimestamp() }
        : epc
    ))
    toast.success('EPC data updated successfully')
  }

  const archiveEPCData = (id: string) => {
    updateEPCData(id, { isArchived: true })
    toast.success('EPC data archived')
  }

  const restoreEPCData = (id: string) => {
    updateEPCData(id, { isArchived: false })
    toast.success('EPC data restored')
  }

  const deleteEPCData = (id: string) => {
    setEpcData(prev => prev.filter(epc => epc.id !== id))
    toast.success('EPC data deleted permanently')
  }

  // Maintenance functions
  const addMaintenanceIssue = (maintenanceData: MaintenanceFormData) => {
    const newMaintenance: MaintenanceIssue = {
      ...maintenanceData,
      id: generateId(),
      userId: 'current-user',
      comments: [],
      attachments: [],
      isArchived: false,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }
    setMaintenanceIssues(prev => [...prev, newMaintenance])
    toast.success('Maintenance issue logged successfully')
  }

  const updateMaintenanceIssue = (id: string, updates: Partial<MaintenanceIssue>) => {
    setMaintenanceIssues(prev => prev.map(issue => 
      issue.id === id 
        ? { ...issue, ...updates, updatedAt: getCurrentTimestamp() }
        : issue
    ))
    toast.success('Maintenance issue updated successfully')
  }

  const archiveMaintenanceIssue = (id: string) => {
    updateMaintenanceIssue(id, { isArchived: true })
    toast.success('Maintenance issue archived')
  }

  const restoreMaintenanceIssue = (id: string) => {
    updateMaintenanceIssue(id, { isArchived: false })
    toast.success('Maintenance issue restored')
  }

  const deleteMaintenanceIssue = (id: string) => {
    setMaintenanceIssues(prev => prev.filter(issue => issue.id !== id))
    toast.success('Maintenance issue deleted permanently')
  }

  // Insurance functions
  const addInsurancePolicy = (insuranceData: InsuranceFormData) => {
    const newInsurance: InsurancePolicy = {
      ...insuranceData,
      id: generateId(),
      userId: 'current-user',
      documents: [],
      isArchived: false,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }
    setInsurancePolicies(prev => [...prev, newInsurance])
    toast.success('Insurance policy added successfully')
  }

  const updateInsurancePolicy = (id: string, updates: Partial<InsurancePolicy>) => {
    setInsurancePolicies(prev => prev.map(policy => 
      policy.id === id 
        ? { ...policy, ...updates, updatedAt: getCurrentTimestamp() }
        : policy
    ))
    toast.success('Insurance policy updated successfully')
  }

  const archiveInsurancePolicy = (id: string) => {
    updateInsurancePolicy(id, { isArchived: true })
    toast.success('Insurance policy archived')
  }

  const restoreInsurancePolicy = (id: string) => {
    updateInsurancePolicy(id, { isArchived: false })
    toast.success('Insurance policy restored')
  }

  const deleteInsurancePolicy = (id: string) => {
    setInsurancePolicies(prev => prev.filter(policy => policy.id !== id))
    toast.success('Insurance policy deleted permanently')
  }

  // Utility functions
  const getUnitsForProperty = (propertyId: string) => {
    return units.filter(unit => unit.propertyId === propertyId && !unit.isDeleted)
  }

  const getTenanciesForUnit = (unitId: string) => {
    return tenancies.filter(tenancy => tenancy.unitId === unitId && !tenancy.isDeleted)
  }

  const getEPCForUnit = (unitId: string) => {
    return epcData.find(epc => epc.unitId === unitId && !epc.isArchived)
  }

  const getPropertyById = (id: string) => {
    return properties.find(property => property.id === id)
  }

  const getUnitById = (id: string) => {
    return units.find(unit => unit.id === id)
  }

  const getAnnualRentForProperty = (propertyId: string) => {
    const propertyUnits = units.filter(unit => unit.propertyId === propertyId && !unit.isArchived && !unit.isDeleted)
    let totalAnnualRent = 0
    
    propertyUnits.forEach(unit => {
      const activeTenancies = tenancies.filter(
        tenancy => tenancy.unitId === unit.id && 
        tenancy.status === 'active' && 
        !tenancy.isArchived &&
        !tenancy.isDeleted
      )
      
      activeTenancies.forEach(tenancy => {
        totalAnnualRent += tenancy.monthlyRent * 12
      })
    })
    
    return totalAnnualRent
  }

  const value: DataContextType = {
    properties,
    addProperty,
    updateProperty,
    archiveProperty,
    restoreProperty,
    deleteProperty,
    softDeleteProperty,
    units,
    addUnit,
    updateUnit,
    archiveUnit,
    restoreUnit,
    deleteUnit,
    softDeleteUnit,
    tenancies,
    addTenancy,
    updateTenancy,
    archiveTenancy,
    restoreTenancy,
    deleteTenancy,
    softDeleteTenancy,
    epcData,
    addEPCData,
    updateEPCData,
    archiveEPCData,
    restoreEPCData,
    deleteEPCData,
    maintenanceIssues,
    addMaintenanceIssue,
    updateMaintenanceIssue,
    archiveMaintenanceIssue,
    restoreMaintenanceIssue,
    deleteMaintenanceIssue,
    insurancePolicies,
    addInsurancePolicy,
    updateInsurancePolicy,
    archiveInsurancePolicy,
    restoreInsurancePolicy,
    deleteInsurancePolicy,
    getUnitsForProperty,
    getTenanciesForUnit,
    getEPCForUnit,
    getPropertyById,
    getUnitById,
    getAnnualRentForProperty,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}