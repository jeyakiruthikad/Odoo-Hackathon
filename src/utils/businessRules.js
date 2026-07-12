// Mandatory business rules (Section 4 of the brief), isolated here so both
// the UI (disabling actions, filtering pickers) and the data layer (final
// guard before mutating state) enforce the same logic.

export function isLicenseExpired(driver, today = new Date()) {
  if (!driver.licenseExpiry) return false
  return new Date(driver.licenseExpiry) < today
}

export function vehicleEligibleForDispatch(vehicle) {
  return vehicle.status === 'Available'
}

export function driverEligibleForDispatch(driver) {
  return (
    driver.status === 'Available' &&
    driver.status !== 'Suspended' &&
    !isLicenseExpired(driver)
  )
}

export function isRegNumberUnique(vehicles, regNumber, excludeId = null) {
  const norm = regNumber.trim().toUpperCase()
  return !vehicles.some((v) => v.id !== excludeId && v.regNumber.trim().toUpperCase() === norm)
}

export function validateTripDraft({ vehicle, driver, cargoWeightKg }) {
  const errors = []
  if (!vehicle) errors.push('Select a vehicle.')
  if (!driver) errors.push('Select a driver.')
  if (vehicle && !vehicleEligibleForDispatch(vehicle) && vehicle.status !== 'Available') {
    // allowed to save as Draft even if not currently available; hard block is at dispatch time
  }
  if (vehicle && cargoWeightKg > vehicle.maxLoadKg) {
    errors.push(`Cargo weight (${cargoWeightKg} kg) exceeds ${vehicle.name}'s max load of ${vehicle.maxLoadKg} kg.`)
  }
  if (!cargoWeightKg || cargoWeightKg <= 0) errors.push('Cargo weight must be greater than 0.')
  return errors
}

export function validateDispatch({ vehicle, driver, cargoWeightKg }) {
  const errors = []
  if (!vehicle) errors.push('No vehicle assigned.')
  if (!driver) errors.push('No driver assigned.')
  if (vehicle && vehicle.status === 'Retired') errors.push(`${vehicle.name} is retired and cannot be dispatched.`)
  if (vehicle && vehicle.status === 'In Shop') errors.push(`${vehicle.name} is in maintenance and cannot be dispatched.`)
  if (vehicle && vehicle.status === 'On Trip') errors.push(`${vehicle.name} is already on another trip.`)
  if (driver && driver.status === 'Suspended') errors.push(`${driver.name} is suspended and cannot be assigned.`)
  if (driver && driver.status === 'On Trip') errors.push(`${driver.name} is already on another trip.`)
  if (driver && isLicenseExpired(driver)) errors.push(`${driver.name}'s license expired on ${driver.licenseExpiry}.`)
  if (vehicle && cargoWeightKg > vehicle.maxLoadKg) {
    errors.push(`Cargo weight (${cargoWeightKg} kg) exceeds ${vehicle.name}'s max load of ${vehicle.maxLoadKg} kg.`)
  }
  return errors
}
