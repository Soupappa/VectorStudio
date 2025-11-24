import { BooleanOperation } from '../utils/pathBoolean';

interface AdvancedPanelProps {
  onClose: () => void;
  onBooleanOperation: (operation: BooleanOperation) => void;
  canPerformBoolean: boolean;
}

export default function AdvancedPanel({ onClose, onBooleanOperation, canPerformBoolean }: AdvancedPanelProps) {
  return (
    <div className="fixed right-0 bottom-16 w-80 bg-white border-l border-t border-slate-200 shadow-xl z-40 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Advanced</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <div className="border border-slate-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-slate-700 mb-3">Boolean Operations</h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => onBooleanOperation('union')}
                disabled={!canPerformBoolean}
                className={`p-2 border border-slate-200 rounded transition-colors flex flex-col items-center gap-1 ${
                  canPerformBoolean ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <circle cx="10" cy="12" r="6" fill="currentColor" opacity="0.3" />
                    <circle cx="14" cy="12" r="6" fill="currentColor" opacity="0.3" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-700">Union</span>
              </button>
              <button
                onClick={() => onBooleanOperation('subtract')}
                disabled={!canPerformBoolean}
                className={`p-2 border border-slate-200 rounded transition-colors flex flex-col items-center gap-1 ${
                  canPerformBoolean ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <circle cx="10" cy="12" r="6" fill="currentColor" opacity="0.3" />
                    <circle cx="14" cy="12" r="6" fill="white" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-700">Subtract</span>
              </button>
              <button
                onClick={() => onBooleanOperation('intersect')}
                disabled={!canPerformBoolean}
                className={`p-2 border border-slate-200 rounded transition-colors flex flex-col items-center gap-1 ${
                  canPerformBoolean ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M10,9 A6,6 0 0,1 10,15 A6,6 0 0,0 14,15 A6,6 0 0,1 14,9 A6,6 0 0,0 10,9 Z" fill="currentColor" opacity="0.3" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-700">Intersect</span>
              </button>
              <button
                onClick={() => onBooleanOperation('exclude')}
                disabled={!canPerformBoolean}
                className={`p-2 border border-slate-200 rounded transition-colors flex flex-col items-center gap-1 ${
                  canPerformBoolean ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <circle cx="10" cy="12" r="6" fill="currentColor" opacity="0.15" />
                    <circle cx="14" cy="12" r="6" fill="currentColor" opacity="0.15" />
                    <path d="M10,9 A6,6 0 0,1 10,15 A6,6 0 0,0 14,15 A6,6 0 0,1 14,9 A6,6 0 0,0 10,9 Z" fill="white" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-700">Exclude</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {canPerformBoolean
                ? 'Select exactly 2 shapes to perform boolean operations.'
                : 'Please select exactly 2 shapes to enable boolean operations.'}
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-slate-700 mb-3">Blend</h4>
            <div className="flex items-center justify-center py-8 text-slate-400">
              <span className="text-xs">More to come...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
