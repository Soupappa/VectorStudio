import { useState, useRef } from 'react';
import { CanvasElement } from '../types';
import { changeSvgColor } from '../utils/svgColor';

interface CanvasProps {
  elements: CanvasElement[];
  selectedElementIds: string[];
  onSelectElements: (ids: string[], isShiftKey: boolean) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateElements: (updates: Array<{ id: string } & Partial<CanvasElement>>) => void;
  showBbox: boolean;
  cleanMode: boolean;
  onToggleCleanMode: () => void;
  zoom: number;
  onExport: () => void;
  onZoomChange: (zoom: number) => void;
}

type DragMode = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | 'rotate' | 'select-rect' | null;

export default function Canvas({
  elements,
  selectedElementIds,
  onSelectElements,
  onUpdateElement,
  onUpdateElements,
  showBbox,
  cleanMode,
  onToggleCleanMode,
  zoom,
  onExport,
  onZoomChange,
}: CanvasProps) {
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState<any>(null);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [justFinishedDrag, setJustFinishedDrag] = useState(false);
  const [editBoxMode, setEditBoxMode] = useState(false);
  const [bboxOffsetX, setBboxOffsetX] = useState(0);
  const [bboxOffsetY, setBboxOffsetY] = useState(0);
  const [bboxScaleX, setBboxScaleX] = useState(1);
  const [bboxScaleY, setBboxScaleY] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedElements = elements.filter((el) => selectedElementIds.includes(el.id));

  const updateElementOrGroup = (id: string, updates: Partial<CanvasElement>) => {
    const element = elements.find(el => el.id === id);
    if (element?.groupId) {
      const groupedElements = elements.filter(el => el.groupId === element.groupId);
      const groupUpdates = groupedElements.map(el => ({ id: el.id, ...updates }));
      onUpdateElements(groupUpdates);
    } else {
      onUpdateElement(id, updates);
    }
  };

  const getSVGCoords = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as any;
    if (target === e.currentTarget || target.tagName === 'svg' || target.tagName === 'rect') {
      if (!isDragging && !justFinishedDrag) {
        onSelectElements([], false);
      }
      setTimeout(() => setJustFinishedDrag(false), 10);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Middle mouse button for panning
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY, panX, panY });
      return;
    }

    const target = e.target as any;
    if (target === e.currentTarget || target.tagName === 'svg' || target.tagName === 'rect') {
      const coords = getSVGCoords(e);
      setIsDragging(true);
      setDragMode('select-rect');
      setDragStart({ x: coords.x, y: coords.y });
      setSelectionRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
      setJustFinishedDrag(false);
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();

    const clickedElement = elements.find(el => el.id === elementId);
    if (!clickedElement) return;

    const isShift = e.shiftKey;

    if (isShift) {
      if (selectedElementIds.includes(elementId)) {
        onSelectElements(selectedElementIds.filter(id => id !== elementId), false);
      } else {
        onSelectElements([...selectedElementIds, elementId], true);
      }
      return;
    }

    let elementsToMove = [elementId];
    if (clickedElement.groupId) {
      const groupedElements = elements.filter(el => el.groupId === clickedElement.groupId);
      elementsToMove = groupedElements.map(el => el.id);
    } else if (selectedElementIds.includes(elementId)) {
      elementsToMove = [...selectedElementIds];
    }

    if (!selectedElementIds.includes(elementId) ||
        (clickedElement.groupId && selectedElementIds.length !== elementsToMove.length)) {
      onSelectElements(elementsToMove, false);
    }

    const coords = getSVGCoords(e);
    const selectedEls = elements.filter(el => elementsToMove.includes(el.id));

    setIsDragging(true);
    setDragMode('move');
    setDragStart({
      x: coords.x,
      y: coords.y,
      elements: selectedEls.map(el => ({ id: el.id, x: el.x, y: el.y })),
    });
  };

  const handleHandleMouseDown = (e: React.MouseEvent, mode: DragMode) => {
    e.stopPropagation();
    if (selectedElements.length !== 1) return;

    const element = selectedElements[0];
    const coords = getSVGCoords(e);

    setIsDragging(true);
    setDragMode(mode);
    setDragStart({
      x: coords.x,
      y: coords.y,
      element: {
        id: element.id,
        x: element.x,
        y: element.y,
        scale: element.scale,
        rotation: element.rotation,
      },
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPanX(dragStart.panX + dx);
      setPanY(dragStart.panY + dy);
      return;
    }

    if (!isDragging || !dragStart) return;

    const coords = getSVGCoords(e);
    const dx = coords.x - dragStart.x;
    const dy = coords.y - dragStart.y;

    if (dragMode === 'select-rect') {
      setSelectionRect({
        x: Math.min(dragStart.x, coords.x),
        y: Math.min(dragStart.y, coords.y),
        width: Math.abs(coords.x - dragStart.x),
        height: Math.abs(coords.y - dragStart.y),
      });
    } else if (dragMode === 'move' && dragStart.elements) {
      const updates = dragStart.elements.map((el: any) => ({
        id: el.id,
        x: el.x + dx,
        y: el.y + dy,
      }));
      onUpdateElements(updates);
    } else if (dragMode === 'rotate' && dragStart.element) {
      const el = dragStart.element;
      const angle = Math.atan2(coords.y - el.y, coords.x - el.x) * (180 / Math.PI);
      updateElementOrGroup(el.id, { rotation: angle });
    } else if (dragMode?.startsWith('resize-') && dragStart.element) {
      const el = dragStart.element;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const direction = dx > 0 ? 1 : -1;
      const scaleDelta = (distance / 100) * direction;
      const newScale = Math.max(0.1, el.scale + scaleDelta);
      updateElementOrGroup(el.id, { scale: newScale });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setDragStart(null);
      return;
    }

    const wasDragging = isDragging;
    const wasSelectingRect = dragMode === 'select-rect';

    if (wasSelectingRect && selectionRect && selectionRect.width > 5 && selectionRect.height > 5) {
      const selectedIds = elements
        .filter(el => {
          const inRect =
            el.x >= selectionRect.x &&
            el.x <= selectionRect.x + selectionRect.width &&
            el.y >= selectionRect.y &&
            el.y <= selectionRect.y + selectionRect.height;
          return inRect;
        })
        .map(el => el.id);
      onSelectElements(selectedIds, false);
      setJustFinishedDrag(true);
    } else if (wasDragging) {
      setJustFinishedDrag(true);
    }

    setIsDragging(false);
    setDragMode(null);
    setDragStart(null);
    setSelectionRect(null);
  };

  const getSvgDimensions = (svgString: string): { width: number; height: number; minX: number; minY: number } => {
    const viewBoxMatch = svgString.match(/viewBox=["']([^"']+)["']/);
    if (viewBoxMatch) {
      const values = viewBoxMatch[1].split(/[\s,]+/).map(Number);
      if (values.length === 4) {
        return {
          minX: values[0] || 0,
          minY: values[1] || 0,
          width: values[2] || 100,
          height: values[3] || 100
        };
      }
    }

    const widthMatch = svgString.match(/width=["']?(\d+(?:\.\d+)?)["']?/);
    const heightMatch = svgString.match(/height=["']?(\d+(?:\.\d+)?)["']?/);

    if (widthMatch && heightMatch) {
      return {
        minX: 0,
        minY: 0,
        width: Number(widthMatch[1]),
        height: Number(heightMatch[1])
      };
    }

    return { minX: 0, minY: 0, width: 100, height: 100 };
  };

  const getBoundingBox = () => {
    if (selectedElements.length === 0) return null;

    if (selectedElements.length === 1) {
      const element = selectedElements[0];
      const dims = getSvgDimensions(element.svg);

      const actualWidth = dims.width * element.scale * (element.scaleX || 1) * bboxScaleX;
      const actualHeight = dims.height * element.scale * (element.scaleY || 1) * bboxScaleY;

      return {
        x: element.x - actualWidth / 2 + bboxOffsetX,
        y: element.y - actualHeight / 2 + bboxOffsetY,
        width: actualWidth,
        height: actualHeight,
        element,
      };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedElements.forEach(el => {
      const dims = getSvgDimensions(el.svg);
      const actualWidth = dims.width * el.scale * (el.scaleX || 1);
      const actualHeight = dims.height * el.scale * (el.scaleY || 1);

      minX = Math.min(minX, el.x - actualWidth / 2);
      minY = Math.min(minY, el.y - actualHeight / 2);
      maxX = Math.max(maxX, el.x + actualWidth / 2);
      maxY = Math.max(maxY, el.y + actualHeight / 2);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      element: selectedElements[0],
    };
  };

  const bbox = getBoundingBox();

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(zoom + delta, 0.1), 3);
    onZoomChange(newZoom);
  };

  return (
    <div
      ref={containerRef}
      className="h-full relative bg-slate-200 overflow-hidden"
      onWheel={handleWheel}
    >
      {showBbox && bbox && selectedElements.length === 1 && (
        <div className="absolute bottom-20 left-4 bg-white border border-slate-300 rounded-lg p-3 shadow-lg z-10 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-700">BBox Debug</span>
            <button
              onClick={() => setEditBoxMode(!editBoxMode)}
              className={`text-xs px-2 py-1 rounded ${editBoxMode ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              {editBoxMode ? 'Edit ON' : 'Edit OFF'}
            </button>
          </div>

          {editBoxMode && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-16">Offset X:</span>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="1"
                  value={bboxOffsetX}
                  onChange={(e) => setBboxOffsetX(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-xs font-mono text-slate-900 w-12">{bboxOffsetX}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-16">Offset Y:</span>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="1"
                  value={bboxOffsetY}
                  onChange={(e) => setBboxOffsetY(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-xs font-mono text-slate-900 w-12">{bboxOffsetY}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-16">Scale X:</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={bboxScaleX}
                  onChange={(e) => setBboxScaleX(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-xs font-mono text-slate-900 w-12">{bboxScaleX.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-16">Scale Y:</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={bboxScaleY}
                  onChange={(e) => setBboxScaleY(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-xs font-mono text-slate-900 w-12">{bboxScaleY.toFixed(2)}</span>
              </div>

              <button
                onClick={() => {
                  setBboxOffsetX(0);
                  setBboxOffsetY(0);
                  setBboxScaleX(1);
                  setBboxScaleY(1);
                }}
                className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 w-full"
              >
                Reset
              </button>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="text-xs text-slate-700">
                  <strong>Current values:</strong>
                </div>
                <div className="text-xs font-mono text-blue-600">
                  offsetX: {bboxOffsetX}
                </div>
                <div className="text-xs font-mono text-blue-600">
                  offsetY: {bboxOffsetY}
                </div>
                <div className="text-xs font-mono text-blue-600">
                  scaleX: {bboxScaleX.toFixed(2)}
                </div>
                <div className="text-xs font-mono text-blue-600">
                  scaleY: {bboxScaleY.toFixed(2)}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div
        className="absolute inset-0 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="-2500 -2500 5000 5000"
          className="w-full h-full"
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
        >
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="#e5e7eb" />
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,3" />
            </pattern>
          </defs>
          <rect x="-10000" y="-10000" width="20000" height="20000" fill="url(#grid)" />
          <g transform={`translate(${panX / zoom}, ${panY / zoom}) scale(${zoom})`}>
            {elements.map((element) => {
              const svg = element.color ? changeSvgColor(element.svg, element.color) : element.svg;
              const dims = getSvgDimensions(element.svg);
              const centerX = dims.minX + dims.width / 2;
              const centerY = dims.minY + dims.height / 2;

              const scaleTransform = `scale(${element.scale * (element.scaleX || 1)}, ${element.scale * (element.scaleY || 1)})`;
              const outerTransform = `translate(${element.x}, ${element.y}) ${scaleTransform} rotate(${element.rotation})`;
              const innerTransform = [
                (element.flipX || element.flipY) &&
                  `scale(${element.flipX ? -1 : 1}, ${element.flipY ? -1 : 1})`,
                `translate(${-centerX}, ${-centerY})`,
              ]
                .filter(Boolean)
                .join(' ');

              const isSelected = selectedElementIds.includes(element.id);

              return (
                <g
                  key={element.id}
                  transform={outerTransform}
                  opacity={element.opacity}
                  onMouseDown={(e) => handleElementMouseDown(e as any, element.id)}
                  className="cursor-move"
                  style={{
                    pointerEvents: 'painted',
                    outline: isSelected && selectedElements.length > 1 ? '3px solid #ef4444' : 'none',
                    outlineOffset: '8px',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                  }}
                >
                  <g
                    transform={innerTransform}
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                </g>
              );
            })}

            {showBbox && bbox && (
              <g>
                <rect
                  x={bbox.x}
                  y={bbox.y}
                  width={bbox.width}
                  height={bbox.height}
                  fill="rgba(239, 68, 68, 0.15)"
                  stroke="#ef4444"
                  strokeWidth="5"
                  strokeDasharray="10 5"
                  pointerEvents="none"
                />

                {selectedElements.length === 1 && (
                  <>
                    <circle
                      cx={bbox.x}
                      cy={bbox.y}
                      r="12"
                      fill="white"
                      stroke="#ef4444"
                      strokeWidth="4"
                  className="cursor-nw-resize"
                  onMouseDown={(e) => handleHandleMouseDown(e as any, 'resize-nw')}
                  style={{ pointerEvents: 'all' }}
                />

                    <circle
                      cx={bbox.x + bbox.width}
                      cy={bbox.y}
                      r="12"
                      fill="white"
                      stroke="#ef4444"
                      strokeWidth="4"
                  className="cursor-ne-resize"
                  onMouseDown={(e) => handleHandleMouseDown(e as any, 'resize-ne')}
                  style={{ pointerEvents: 'all' }}
                />

                    <circle
                      cx={bbox.x}
                      cy={bbox.y + bbox.height}
                      r="12"
                      fill="white"
                      stroke="#ef4444"
                      strokeWidth="4"
                  className="cursor-sw-resize"
                  onMouseDown={(e) => handleHandleMouseDown(e as any, 'resize-sw')}
                  style={{ pointerEvents: 'all' }}
                />

                    <circle
                      cx={bbox.x + bbox.width}
                      cy={bbox.y + bbox.height}
                      r="12"
                      fill="white"
                      stroke="#ef4444"
                      strokeWidth="4"
                      className="cursor-se-resize"
                      onMouseDown={(e) => handleHandleMouseDown(e as any, 'resize-se')}
                      style={{ pointerEvents: 'all' }}
                    />

                    <circle
                      cx={bbox.x + bbox.width / 2}
                      cy={bbox.y + bbox.height / 2}
                      r="15"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="4"
                      className="cursor-move"
                      onMouseDown={(e) => handleElementMouseDown(e as any, bbox.element.id)}
                      style={{ pointerEvents: 'all' }}
                    />
                  </>
                )}

                {selectedElements.length === 1 && (
                  <g
                    transform={`translate(${bbox.x + bbox.width / 2}, ${bbox.y - 30})`}
                    className="cursor-pointer"
                    onMouseDown={(e) => handleHandleMouseDown(e as any, 'rotate')}
                    style={{ pointerEvents: 'all' }}
                  >
                    <line
                      x1={0}
                      y1={0}
                      x2={0}
                      y2={-25}
                      stroke="#ef4444"
                      strokeWidth="4"
                    />
                    <circle
                      cx={0}
                      cy={-25}
                      r="12"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="4"
                    />
                  </g>
                )}
              </g>
            )}

            {selectionRect && (
              <rect
                x={selectionRect.x}
                y={selectionRect.y}
                width={selectionRect.width}
                height={selectionRect.height}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5 5"
                pointerEvents="none"
              />
            )}
          </g>
        </svg>
      </div>

      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-slate-400">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-slate-400 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <p className="text-lg font-medium">Empty Canvas</p>
            <p className="text-sm mt-1">Open a panel to add elements</p>
          </div>
        </div>
      )}
    </div>
  );
}
