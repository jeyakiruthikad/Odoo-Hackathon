export default function KpiCard({ label, value, unit, accent = false, icon: Icon }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-concrete-300 bg-white p-4 ${
        accent ? 'ring-1 ring-lane' : ''
      }`}
    >
      {accent && <div className="absolute inset-x-0 top-0 h-1 bg-hazard" />}
      <div className="flex items-start justify-between">
        <p className="font-body text-xs uppercase tracking-wide text-asphalt-500">{label}</p>
        {Icon && <Icon size={16} className="text-asphalt-500" />}
      </div>
      <p className="mt-2 font-display text-3xl font-medium tabular text-asphalt">
        {value}
        {unit && <span className="ml-1 font-body text-sm font-normal text-asphalt-500">{unit}</span>}
      </p>
    </div>
  )
}
