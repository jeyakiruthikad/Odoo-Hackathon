const STYLES = {
  Available: { dot: 'bg-signal', text: 'text-signal', bg: 'bg-signal-100' },
  'On Trip': { dot: 'bg-steel', text: 'text-steel', bg: 'bg-steel-100' },
  'In Shop': { dot: 'bg-lane-600', text: 'text-lane-600', bg: 'bg-lane/20' },
  Retired: { dot: 'bg-asphalt-500', text: 'text-asphalt-500', bg: 'bg-concrete-300' },
  'Off Duty': { dot: 'bg-asphalt-500', text: 'text-asphalt-500', bg: 'bg-concrete-300' },
  Suspended: { dot: 'bg-beacon', text: 'text-beacon', bg: 'bg-beacon-100' },
  Draft: { dot: 'bg-asphalt-500', text: 'text-asphalt-500', bg: 'bg-concrete-300' },
  Dispatched: { dot: 'bg-steel', text: 'text-steel', bg: 'bg-steel-100' },
  Completed: { dot: 'bg-signal', text: 'text-signal', bg: 'bg-signal-100' },
  Cancelled: { dot: 'bg-beacon', text: 'text-beacon', bg: 'bg-beacon-100' },
  Active: { dot: 'bg-lane-600', text: 'text-lane-600', bg: 'bg-lane/20' },
  Closed: { dot: 'bg-signal', text: 'text-signal', bg: 'bg-signal-100' },
}

export default function StatusBadge({ status }) {
  const s = STYLES[status] || STYLES.Draft
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {status}
    </span>
  )
}
