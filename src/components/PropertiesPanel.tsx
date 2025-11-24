import { useState } from 'react';
import { Copy, Trash2, FlipHorizontal, FlipVertical, Group, Ungroup, Grid3x3, CircleDot, ChevronsUp, ChevronsDown, ArrowUp, ArrowDown, X, Save, Wand2, Lock, Unlock } from 'lucide-react';
import { CanvasElement } from '../types';
import ColorPicker from './ColorPicker';
import AdvancedPanel from './AdvancedPanel';
import { changeSvgColor } from '../utils/svgColor';
import { BooleanOperation } from '../utils/pathBoolean';

interface PropertiesPanelProps {
  elements: CanvasElement[];
  selectedElementIds: string[];
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (ids: string[]) => void;
  onDeselect?: () => void;
  onDuplicate: (ids: string[]) => void;
  onGroup: (ids: string[]) => void;
  onUngroup: (ids: string[]) => void;
  onArrayDuplicate: (ids: string[], type: 'rectangular' | 'radial', spacing?: { x: number; y: number; radius: number }) => void;
  onReorder: (ids: string[], direction: 'front' | 'forward' | 'backward' | 'back') => void;
  onBooleanOperation: (operation: BooleanOperation) => void;
  showBbox: boolean;
  onToggleBbox: (value: boolean) => void;
  onSaveToGallery?: (element: CanvasElement) => void;
  bboxOffsetX: number;
  bboxOffsetY: number;
  bboxScaleX: number;
  bboxScaleY: number;
  onBboxOffsetXChange: (value: number) => void;
  onBboxOffsetYChange: (value: number) => void;
  onBboxScaleXChange: (value: number) => void;
  onBboxScaleYChange: (value: number) => void;
}

export default function PropertiesPanel({
  elements,
  selectedElementIds,
  onUpdate,
  onDelete,
  onDeselect,
  onDuplicate,
  onGroup,
  onUngroup,
  onArrayDuplicate,
  onReorder,
  onBooleanOperation,
  showBbox,
  onToggleBbox,
  onSaveToGallery,
  bboxOffsetX,
  bboxOffsetY,
  bboxScaleX,
  bboxScaleY,
  onBboxOffsetXChange,
  onBboxOffsetYChange,
  onBboxScaleXChange,
  onBboxScaleYChange,
}: PropertiesPanelProps) {
  const [showArrayMenu, setShowArrayMenu] = useState(false);
  const [arraySpacing, setArraySpacing] = useState({ x: 120, y: 120, radius: 200 });
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [scaleRatioLocked, setScaleRatioLocked] = useState(true);

  const selectedElements = elements.filter((el) => selectedElementIds.includes(el.id));
  const singleElement = selectedElements.length === 1 ? selectedElements[0] : null;

  const allSameGroup = selectedElements.length > 1 &&
    selectedElements.every(el => el.groupId && el.groupId === selectedElements[0].groupId);

  const displayElement = selectedElements[0] || null;

  const updateElementOrGroup = (updates: Partial<CanvasElement>) => {
    if (allSameGroup) {
      selectedElements.forEach(el => onUpdate(el.id, updates));
    } else if (singleElement) {
      const element = elements.find(el => el.id === singleElement.id);
      if (element?.groupId) {
        const groupedElements = elements.filter(el => el.groupId === element.groupId);
        groupedElements.forEach(el => onUpdate(el.id, updates));
      } else {
        onUpdate(singleElement.id, updates);
      }
    }
  };

  const handleScaleXChange = (newScaleX: number) => {
    if (!displayElement) return;

    if (scaleRatioLocked) {
      const ratio = newScaleX / (displayElement.scaleX || 1);
      updateElementOrGroup({
        scaleX: newScaleX,
        scaleY: (displayElement.scaleY || 1) * ratio,
      });
    } else {
      updateElementOrGroup({ scaleX: newScaleX });
    }
  };

  const handleScaleYChange = (newScaleY: number) => {
    if (!displayElement) return;

    if (scaleRatioLocked) {
      const ratio = newScaleY / (displayElement.scaleY || 1);
      updateElementOrGroup({
        scaleY: newScaleY,
        scaleX: (displayElement.scaleX || 1) * ratio,
      });
    } else {
      updateElementOrGroup({ scaleY: newScaleY });
    }
  };

  const hasGroup = selectedElements.length > 0 && selectedElements.some(el => el.groupId);
  const canGroup = selectedElements.length > 1 && !allSameGroup;

  if (selectedElements.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <p className="text-xs">Select an element</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex items-center px-4 py-2 gap-3 bg-white">
        {displayElement && (
          <div className="flex items-center h-full border-r border-slate-200 pr-3">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded flex items-center justify-center overflow-hidden">
              {allSameGroup ? (
                <span className="text-xs font-semibold text-slate-600">Groupe</span>
              ) : (
                <div
                  dangerouslySetInnerHTML={{ __html: displayElement.color ? changeSvgColor(displayElement.svg, displayElement.color) : displayElement.svg }}
                  className="w-full h-full flex items-center justify-center"
                  style={{ transform: 'scale(0.8)' }}
                />
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <button
            onClick={() => onDeselect?.()}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            title="Deselect"
          >
            <X className="w-3.5 h-3.5 text-slate-600" />
          </button>
          <button
            onClick={() => onToggleBbox(!showBbox)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            title="Toggle Viewbox"
          >
            <Lock className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>

        <div className="h-12 w-px bg-slate-300" />

        {displayElement && (
          <>
            {allSameGroup ? (
              <div className="text-xs text-slate-600 w-20">
                {selectedElements.length} elements
              </div>
            ) : (
              <input
                type="text"
                value={displayElement.name}
                onChange={(e) => onUpdate(displayElement.id, { name: e.target.value })}
                className="w-20 px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:border-transparent"
                placeholder="Name"
              />
            )}

            <div className="h-12 w-px bg-slate-300" />

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-600 font-medium w-12">Scale X</span>
              <div className="relative flex items-center gap-1.5 w-40">
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.05"
                  value={displayElement.scaleX || 1}
                  onChange={(e) => handleScaleXChange(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-track]:bg-slate-200 [&::-webkit-slider-track]:rounded-lg"
                  style={{
                    background: `linear-gradient(to right,
                      #e2e8f0 0%, #e2e8f0 ${((displayElement.scaleX || 1) - 0.1) / 9.9 * 100}%,
                      #cbd5e1 ${((displayElement.scaleX || 1) - 0.1) / 9.9 * 100}%, #cbd5e1 100%)`
                  }}
                />
                <span className="text-[10px] text-slate-900 font-mono w-8 text-right">{(displayElement.scaleX || 1).toFixed(2)}</span>
              </div>
              <button
                onClick={() => setScaleRatioLocked(!scaleRatioLocked)}
                className={`p-1 rounded transition-colors ${
                  scaleRatioLocked ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={scaleRatioLocked ? 'Unlock Ratio' : 'Lock Ratio'}
              >
                {scaleRatioLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-600 font-medium w-12">Scale Y</span>
              <div className="relative flex items-center gap-1.5 w-40">
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.05"
                  value={displayElement.scaleY || 1}
                  onChange={(e) => handleScaleYChange(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900"
                  style={{
                    background: `linear-gradient(to right,
                      #e2e8f0 0%, #e2e8f0 ${((displayElement.scaleY || 1) - 0.1) / 9.9 * 100}%,
                      #cbd5e1 ${((displayElement.scaleY || 1) - 0.1) / 9.9 * 100}%, #cbd5e1 100%)`
                  }}
                />
                <span className="text-[10px] text-slate-900 font-mono w-8 text-right">{(displayElement.scaleY || 1).toFixed(2)}</span>
              </div>
            </div>

            <div className="h-12 w-px bg-slate-300" />

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-600 font-medium w-14">Rotation</span>
              <div className="relative flex items-center gap-1.5 w-32">
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="0.5"
                  value={displayElement.rotation}
                  onChange={(e) => updateElementOrGroup({ rotation: Number(e.target.value) })}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900"
                  style={{
                    background: `linear-gradient(to right,
                      #e2e8f0 0%, #e2e8f0 ${displayElement.rotation / 360 * 100}%,
                      #cbd5e1 ${displayElement.rotation / 360 * 100}%, #cbd5e1 100%)`
                  }}
                />
                <span className="text-[10px] text-slate-900 font-mono w-8 text-right">{Math.round(displayElement.rotation)}°</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-5"></div>
              <span className="text-xs text-slate-600 font-medium w-12">Opacity</span>
              <div className="relative flex items-center gap-1.5 w-36">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={displayElement.opacity}
                  onChange={(e) => updateElementOrGroup({ opacity: Number(e.target.value) })}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900"
                  style={{
                    background: `linear-gradient(to right,
                      #e2e8f0 0%, #e2e8f0 ${displayElement.opacity * 100}%,
                      #cbd5e1 ${displayElement.opacity * 100}%, #cbd5e1 100%)`
                  }}
                />
                <span className="text-[10px] text-slate-900 font-mono w-8 text-right">{Math.round(displayElement.opacity * 100)}%</span>
              </div>
            </div>
          </>
        )}

        <div className="flex-1" />

        {displayElement && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-600">Color</span>
              <ColorPicker
                value={displayElement.color || '#1e293b'}
                onChange={(color) => updateElementOrGroup({ color })}
              />
            </div>

            <div className="h-12 w-px bg-slate-300" />

            <div className="flex items-center gap-1">
              <button
                onClick={() => updateElementOrGroup({ flipX: !displayElement.flipX })}
                className={`p-1 rounded border transition-colors ${
                  displayElement.flipX
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Flip Horizontal"
              >
                <FlipHorizontal className="w-3 h-3" />
              </button>
              <button
                onClick={() => updateElementOrGroup({ flipY: !displayElement.flipY })}
                className={`p-1 rounded border transition-colors ${
                  displayElement.flipY
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Flip Vertical"
              >
                <FlipVertical className="w-3 h-3" />
              </button>
            </div>

            <div className="h-12 w-px bg-slate-300" />

            <button
              onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
              className="px-2 py-1 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Advanced
            </button>
          </>
        )}

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onReorder(selectedElementIds, 'front')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
              title="Bring to Front"
            >
              <ChevronsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onReorder(selectedElementIds, 'forward')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
              title="Bring Forward"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onReorder(selectedElementIds, 'backward')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
              title="Send Backward"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => onReorder(selectedElementIds, 'back')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
              title="Send to Back"
            >
              <ChevronsDown className="w-3 h-3" />
            </button>
          </div>

          <div className="h-12 w-px bg-slate-300" />

          <button
            onClick={() => onDuplicate(selectedElementIds)}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
            title="Duplicate"
          >
            <Copy className="w-3 h-3" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowArrayMenu(!showArrayMenu)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
              title="Array Duplicate"
            >
              <Grid3x3 className="w-3 h-3" />
            </button>
            {showArrayMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg p-2 min-w-48 z-50">
                <div className="space-y-2">
                  <div>
                    <button
                      onClick={() => {
                        onArrayDuplicate(selectedElementIds, 'rectangular', arraySpacing);
                        setShowArrayMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded text-xs font-medium"
                    >
                      <Grid3x3 className="w-3 h-3" />
                      Rectangular
                    </button>
                    <div className="px-3 py-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-600 w-12">X Gap:</label>
                        <input
                          type="number"
                          value={arraySpacing.x}
                          onChange={(e) => setArraySpacing({ ...arraySpacing, x: Number(e.target.value) })}
                          className="w-16 px-1 py-0.5 border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-600 w-12">Y Gap:</label>
                        <input
                          type="number"
                          value={arraySpacing.y}
                          onChange={(e) => setArraySpacing({ ...arraySpacing, y: Number(e.target.value) })}
                          className="w-16 px-1 py-0.5 border border-slate-300 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div>
                    <button
                      onClick={() => {
                        onArrayDuplicate(selectedElementIds, 'radial', arraySpacing);
                        setShowArrayMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded text-xs font-medium"
                    >
                      <CircleDot className="w-3 h-3" />
                      Radial
                    </button>
                    <div className="px-3 py-1">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-600 w-12">Radius:</label>
                        <input
                          type="number"
                          value={arraySpacing.radius}
                          onChange={(e) => setArraySpacing({ ...arraySpacing, radius: Number(e.target.value) })}
                          className="w-16 px-1 py-0.5 border border-slate-300 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {singleElement && (
            <>
              <div className="h-12 w-px bg-slate-300" />
              {onSaveToGallery && (
                <button
                  onClick={() => onSaveToGallery(singleElement)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
                  title="Save to Gallery"
                >
                  <Save className="w-3 h-3" />
                </button>
              )}
              <button
                className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
                title="Refine"
              >
                <Wand2 className="w-3 h-3" />
              </button>
            </>
          )}

          {canGroup && (
            <button
              onClick={() => onGroup(selectedElementIds)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
              title="Group"
            >
              <Group className="w-3 h-3" />
            </button>
          )}
          {hasGroup && (
            <button
              onClick={() => onUngroup(selectedElementIds)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
              title="Ungroup"
            >
              <Ungroup className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => onDelete(selectedElementIds)}
            className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showAdvancedPanel && (
        <AdvancedPanel
          onClose={() => setShowAdvancedPanel(false)}
          onBooleanOperation={onBooleanOperation}
          canPerformBoolean={selectedElementIds.length === 2}
        />
      )}
    </>
  );
}
