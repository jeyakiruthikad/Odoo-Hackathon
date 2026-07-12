import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-asphalt/60 p-4" role="dialog" aria-modal="true">
      <div className={`max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-md'} overflow-y-auto rounded-lg bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-concrete-300 px-5 py-4">
          <h2 className="font-display text-lg font-medium text-asphalt">{title}</h2>
          <button
            onClick={onClose}
            className="focus-ring rounded p-1 text-asphalt-500 hover:bg-concrete-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
