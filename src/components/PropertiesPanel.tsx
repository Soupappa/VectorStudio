import { useState } from 'react';
import { Copy, Trash2, FlipHorizontal, FlipVertical, Group, Ungroup, Grid3x3, CircleDot, ChevronsUp, ChevronsDown, ArrowUp, ArrowDown, X, Lock, Unlock, Sparkles, Wand2 } from 'lucide-react';
import { CanvasElement } from '../types';
import ColorPicker from './ColorPicker';
import { changeSvgColor } from '../utils/svgColor';

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
  showBbox: boolean;
  onToggleBbox: (value: boolean) => void;
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
  showBbox,
  onToggleBbox,
}: PropertiesPanelProps) {
  const [showArrayMenu, setShowArrayMenu] = useState(false);
  const [arraySpacing, setArraySpacing] = useState({ x: 120, y: 120, radius: 200 });
  const [scaleRatioLocked, setScaleRatioLocked] = useState(true);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);

  const selectedElements = elements.filter((el) => selectedElementIds.includes(el.id));
  const singleElement = selectedElements.length === 1 ? selectedElements[0] : null;

  const allSameGroup = selectedElements.length > 1 &&
    selectedElements.every(el => el.groupId && el.groupId === selectedElements[0].groupId);

  const displayElement = singleElement || (allSameGroup ? selectedElements[0] : null);

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

  const handleScaleXChange = (value: number) => {
    if (scaleRatioLocked && displayElement) {
      const ratio = value / (displayElement.scaleX || 1);
      updateElementOrGroup({
        scaleX: value,
        scaleY: (displayElement.scaleY || 1) * ratio
      });
    } else {
      updateElementOrGroup({ scaleX: value });
    }
  };

  const handleScaleYChange = (value: number) => {
    if (scaleRatioLocked && displayElement) {
      const ratio = value / (displayElement.scaleY || 1);
      updateElementOrGroup({
        scaleY: value,
        scaleX: (displayElement.scaleX || 1) * ratio
      });
    } else {
      updateElementOrGroup({ scaleY: value });
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
    <div className="h-full flex items-center px-4 py-2 gap-3 bg-white relative">
      {displayElement && (
        <>
          {/* Thumbnail */}
          <div
            className="w-14 h-14 border border-slate-300 rounded bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0"
            title={displayElement.name}
          >
            <div
              className="w-12 h-12 flex items-center justify-center"
              dangerouslySetInnerHTML={{
                __html: displayElement.color ? changeSvgColor(displayElement.svg, displayElement.color) : displayElement.svg
              }}
              style={{
                opacity: displayElement.opacity,
              }}
            />
          </div>

          {/* Deselect + BBox buttons (overlapping visually) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDeselect?.()}
              className="p-1.5 hover:bg-slate-100 rounded transition-colors"
              title="Deselect"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => onToggleBbox(!showBbox)}
              className={`p-1.5 rounded border transition-colors ${
                showBbox
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Toggle BBox Tuning"
            >
              {showBbox ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="h-6 w-px bg-slate-300" />

          {/* Scale X + Lock + Scale Y */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600">Scale X</span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={displayElement.scaleX || 1}
              onChange={(e) => handleScaleXChange(Number(e.target.value))}
              className="tech-slider w-16 flex-shrink-0"
            />
            <span className="text-xs text-slate-900 font-mono w-8">{(displayElement.scaleX || 1).toFixed(1)}</span>
          </div>

          <button
            onClick={() => setScaleRatioLocked(!scaleRatioLocked)}
            className={`p-1 rounded border transition-colors ${
              scaleRatioLocked
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title={scaleRatioLocked ? 'Unlock Scale Ratio' : 'Lock Scale Ratio'}
          >
            {scaleRatioLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600">Scale Y</span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={displayElement.scaleY || 1}
              onChange={(e) => handleScaleYChange(Number(e.target.value))}
              className="tech-slider w-16 flex-shrink-0"
            />
            <span className="text-xs text-slate-900 font-mono w-8">{(displayElement.scaleY || 1).toFixed(1)}</span>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600">Rotation</span>
            <input
              type="range"
              min="0"
              max="360"
              value={displayElement.rotation}
              onChange={(e) => updateElementOrGroup({ rotation: Number(e.target.value) })}
              className="tech-slider w-16 flex-shrink-0"
            />
            <span className="text-xs text-slate-900 font-mono w-8">{Math.round(displayElement.rotation)}°</span>
          </div>

          {/* Opacity */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600">Opacity</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={displayElement.opacity}
              onChange={(e) => updateElementOrGroup({ opacity: Number(e.target.value) })}
              className="tech-slider w-16 flex-shrink-0"
            />
            <span className="text-xs text-slate-900 font-mono w-8">{Math.round(displayElement.opacity * 100)}%</span>
          </div>

          <div className="h-6 w-px bg-slate-300" />

          {/* Color */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600">Color</span>
            <ColorPicker
              value={displayElement.color || '#1e293b'}
              onChange={(color) => updateElementOrGroup({ color })}
            />
          </div>

          <div className="h-6 w-px bg-slate-300" />

          {/* Flip H/V */}
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

          {/* Advanced button */}
          <button
            onClick={() => setShowAdvancedModal(!showAdvancedModal)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              showAdvancedModal
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Advanced Options"
          >
            <Wand2 className="w-3 h-3" />
          </button>

          {/* Advanced Modal */}
          {showAdvancedModal && (
            <div className="absolute bottom-full left-1/4 mb-2 bg-white border border-slate-200 rounded-lg shadow-xl p-4 min-w-80 z-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Advanced</h3>
                <button
                  onClick={() => setShowAdvancedModal(false)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">Boolean Operations</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled
                      className="px-3 py-2 bg-slate-50 text-slate-400 rounded text-xs font-medium cursor-not-allowed"
                    >
                      Union
                    </button>
                    <button
                      disabled
                      className="px-3 py-2 bg-slate-50 text-slate-400 rounded text-xs font-medium cursor-not-allowed"
                    >
                      Subtract
                    </button>
                    <button
                      disabled
                      className="px-3 py-2 bg-slate-50 text-slate-400 rounded text-xs font-medium cursor-not-allowed"
                    >
                      Intersect
                    </button>
                    <button
                      disabled
                      className="px-3 py-2 bg-slate-50 text-slate-400 rounded text-xs font-medium cursor-not-allowed"
                    >
                      Exclude
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Please select exactly 2 shapes to enable boolean operations
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">Blend</h4>
                  <p className="text-xs text-slate-500 text-center py-2">
                    More to come...
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {selectedElements.length > 1 && !displayElement && (
        <div className="text-xs text-slate-600">
          {selectedElements.length} elements{allSameGroup ? ' (Grouped)' : ''} selected
        </div>
      )}

      {/* Right side controls */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Layer ordering */}
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

        <div className="h-6 w-px bg-slate-300" />

        {/* Duplicate */}
        <button
          onClick={() => onDuplicate(selectedElementIds)}
          className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </button>

        {/* Array Duplicate */}
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

        {/* Magic button */}
        <button
          disabled
          className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-400 rounded text-xs font-medium cursor-not-allowed"
          title="Magic (Coming soon)"
        >
          <Sparkles className="w-3 h-3" />
        </button>

        {/* Group/Ungroup */}
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

        {/* Delete */}
        <button
          onClick={() => onDelete(selectedElementIds)}
          className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
