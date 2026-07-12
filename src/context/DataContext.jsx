import { createContext, useContext, useEffect, useState } from 'react'
import {
  seedVehicles, seedDrivers, seedTrips, seedMaintenance, seedFuelLogs, seedExpenses,
} from '../data/mockData'
import { isRegNumberUnique, validateDispatch } from '../utils/businessRules'

const DataContext = createContext(null)

function useStoredState(key, seed) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : seed
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])
  return [state, setState]
}

let idCounter = 1000
const nextId = (prefix) => `${prefix}${idCounter++}`

export function DataProvider({ children }) {
  const [vehicles, setVehicles] = useStoredState('to_vehicles', seedVehicles)
  const [drivers, setDrivers] = useStoredState('to_drivers', seedDrivers)
  const [trips, setTrips] = useStoredState('to_trips', seedTrips)
  const [maintenanceLogs, setMaintenanceLogs] = useStoredState('to_maintenance', seedMaintenance)
  const [fuelLogs, setFuelLogs] = useStoredState('to_fuel', seedFuelLogs)
  const [expenses, setExpenses] = useStoredState('to_expenses', seedExpenses)

  // ---------- Vehicles ----------
  const addVehicle = (payload) => {
    if (!isRegNumberUnique(vehicles, payload.regNumber)) {
      return { ok: false, error: `Registration number "${payload.regNumber}" is already in use.` }
    }
    const vehicle = { id: nextId('v'), status: 'Available', ...payload }
    setVehicles((v) => [...v, vehicle])
    return { ok: true }
  }

  const updateVehicle = (id, patch) => {
    if (patch.regNumber && !isRegNumberUnique(vehicles, patch.regNumber, id)) {
      return { ok: false, error: `Registration number "${patch.regNumber}" is already in use.` }
    }
    setVehicles((v) => v.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    return { ok: true }
  }

  const deleteVehicle = (id) => setVehicles((v) => v.filter((x) => x.id !== id))

  // ---------- Drivers ----------
  const addDriver = (payload) => {
    const driver = { id: nextId('d'), status: 'Available', ...payload }
    setDrivers((d) => [...d, driver])
    return { ok: true }
  }
  const updateDriver = (id, patch) => {
    setDrivers((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    return { ok: true }
  }
  const deleteDriver = (id) => setDrivers((d) => d.filter((x) => x.id !== id))

  // ---------- Trips ----------
  const createTripDraft = (payload) => {
    const trip = { id: nextId('t'), status: 'Draft', createdAt: new Date().toISOString().slice(0, 10), ...payload }
    setTrips((t) => [...t, trip])
    return { ok: true, trip }
  }

  const dispatchTrip = (tripId) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return { ok: false, error: 'Trip not found.' }
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId)
    const driver = drivers.find((d) => d.id === trip.driverId)
    const errors = validateDispatch({ vehicle, driver, cargoWeightKg: trip.cargoWeightKg })
    if (errors.length) return { ok: false, error: errors.join(' ') }

    setVehicles((vs) => vs.map((v) => (v.id === vehicle.id ? { ...v, status: 'On Trip' } : v)))
    setDrivers((ds) => ds.map((d) => (d.id === driver.id ? { ...d, status: 'On Trip' } : d)))
    setTrips((ts) => ts.map((t) => (t.id === tripId ? { ...t, status: 'Dispatched' } : t)))
    return { ok: true }
  }

  const completeTrip = (tripId, { finalOdometer, fuelConsumedL } = {}) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return { ok: false, error: 'Trip not found.' }
    setVehicles((vs) => vs.map((v) => {
      if (v.id !== trip.vehicleId) return v
      return { ...v, status: 'Available', odometer: finalOdometer ? Number(finalOdometer) : v.odometer }
    }))
    setDrivers((ds) => ds.map((d) => (d.id === trip.driverId ? { ...d, status: 'Available' } : d)))
    setTrips((ts) => ts.map((t) => (t.id === tripId ? { ...t, status: 'Completed', finalOdometer: Number(finalOdometer) || t.finalOdometer, fuelConsumedL: Number(fuelConsumedL) || t.fuelConsumedL } : t)))
    if (fuelConsumedL) {
      setFuelLogs((f) => [...f, { id: nextId('f'), vehicleId: trip.vehicleId, liters: Number(fuelConsumedL), cost: 0, date: new Date().toISOString().slice(0, 10) }])
    }
    return { ok: true }
  }

  const cancelTrip = (tripId) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return { ok: false, error: 'Trip not found.' }
    if (trip.status === 'Dispatched') {
      setVehicles((vs) => vs.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'Available' } : v)))
      setDrivers((ds) => ds.map((d) => (d.id === trip.driverId ? { ...d, status: 'Available' } : d)))
    }
    setTrips((ts) => ts.map((t) => (t.id === tripId ? { ...t, status: 'Cancelled' } : t)))
    return { ok: true }
  }

  // ---------- Maintenance ----------
  const addMaintenance = (payload) => {
    const record = { id: nextId('m'), status: 'Active', ...payload }
    setMaintenanceLogs((m) => [...m, record])
    setVehicles((vs) => vs.map((v) => (v.id === payload.vehicleId ? { ...v, status: 'In Shop' } : v)))
    return { ok: true }
  }

  const closeMaintenance = (id) => {
    const record = maintenanceLogs.find((m) => m.id === id)
    if (!record) return { ok: false, error: 'Record not found.' }
    setMaintenanceLogs((m) => m.map((x) => (x.id === id ? { ...x, status: 'Closed' } : x)))
    setVehicles((vs) => vs.map((v) => {
      if (v.id !== record.vehicleId) return v
      if (v.status === 'Retired') return v
      return { ...v, status: 'Available' }
    }))
    return { ok: true }
  }

  // ---------- Fuel & Expenses ----------
  const addFuelLog = (payload) => {
    setFuelLogs((f) => [...f, { id: nextId('f'), ...payload }])
    return { ok: true }
  }
  const addExpense = (payload) => {
    setExpenses((e) => [...e, { id: nextId('e'), ...payload }])
    return { ok: true }
  }

  const value = {
    vehicles, drivers, trips, maintenanceLogs, fuelLogs, expenses,
    addVehicle, updateVehicle, deleteVehicle,
    addDriver, updateDriver, deleteDriver,
    createTripDraft, dispatchTrip, completeTrip, cancelTrip,
    addMaintenance, closeMaintenance,
    addFuelLog, addExpense,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
