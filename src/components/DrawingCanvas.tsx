import { useEffect, useRef, useState } from 'react';
import paper from 'paper';
import { Pen, Minus, Square, Circle, Triangle, Star, Hexagon, Eraser } from 'lucide-react';

interface DrawingCanvasProps {
  onSavePath: (svg: string, name: string) => void;
}

type Tool = 'pen' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'star' | 'hexagon' | 'eraser';

export default function DrawingCanvas({ onSavePath }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [strokeColor, setStrokeColor] = useState('#1e293b');
  const [fillColor, setFillColor] = useState('none');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const paperScopeRef = useRef<paper.PaperScope | null>(null);
  const currentPathRef = useRef<paper.Path | null>(null);
  const startPointRef = useRef<paper.Point | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scope = new paper.PaperScope();
    scope.setup(canvasRef.current);
    paperScopeRef.current = scope;

    return () => {
      scope.remove();
    };
  }, []);

  useEffect(() => {
    if (!paperScopeRef.current) return;
    const scope = paperScopeRef.current;

    scope.view.onMouseDown = handleMouseDown;
    scope.view.onMouseDrag = handleMouseDrag;
    scope.view.onMouseUp = handleMouseUp;
  }, [activeTool, strokeColor, fillColor, strokeWidth]);

  const handleMouseDown = (event: paper.MouseEvent) => {
    if (!paperScopeRef.current) return;
    const scope = paperScopeRef.current;

    startPointRef.current = event.point;

    if (activeTool === 'pen') {
      if (!currentPathRef.current) {
        currentPathRef.current = new scope.Path({
          strokeColor: strokeColor,
          strokeWidth: strokeWidth,
          fillColor: fillColor === 'none' ? null : fillColor,
        });
      }
      currentPathRef.current.add(event.point);
    } else if (activeTool === 'eraser') {
      const hitResult = scope.project.hitTest(event.point, {
        stroke: true,
        fill: true,
        tolerance: 5,
      });
      if (hitResult?.item) {
        hitResult.item.remove();
      }
    }
  };

  const handleMouseDrag = (event: paper.MouseEvent) => {
    if (!paperScopeRef.current || !startPointRef.current) return;
    const scope = paperScopeRef.current;

    if (activeTool === 'pen') {
      if (currentPathRef.current) {
        currentPathRef.current.add(event.point);
      }
    } else if (activeTool === 'line') {
      if (currentPathRef.current) {
        currentPathRef.current.remove();
      }
      currentPathRef.current = new scope.Path.Line({
        from: startPointRef.current,
        to: event.point,
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
      });
    } else if (activeTool === 'rectangle') {
      if (currentPathRef.current) {
        currentPathRef.current.remove();
      }
      const rect = new scope.Rectangle(startPointRef.current, event.point);
      currentPathRef.current = new scope.Path.Rectangle(rect, {
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
        fillColor: fillColor === 'none' ? null : fillColor,
      });
    } else if (activeTool === 'circle') {
      if (currentPathRef.current) {
        currentPathRef.current.remove();
      }
      const center = startPointRef.current.add(event.point).divide(2);
      const radius = startPointRef.current.getDistance(event.point) / 2;
      currentPathRef.current = new scope.Path.Circle({
        center: center,
        radius: radius,
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
        fillColor: fillColor === 'none' ? null : fillColor,
      });
    } else if (activeTool === 'eraser') {
      const hitResult = scope.project.hitTest(event.point, {
        stroke: true,
        fill: true,
        tolerance: 5,
      });
      if (hitResult?.item) {
        hitResult.item.remove();
      }
    }
  };

  const handleMouseUp = (event: paper.MouseEvent) => {
    if (!paperScopeRef.current || !startPointRef.current) return;
    const scope = paperScopeRef.current;

    if (activeTool === 'triangle' && currentPathRef.current) {
      currentPathRef.current.remove();
    }

    if (activeTool === 'triangle') {
      const point1 = startPointRef.current;
      const point2 = event.point;
      const point3 = new scope.Point(
        point1.x + (point2.x - point1.x) / 2,
        point1.y - Math.abs(point2.y - point1.y)
      );
      currentPathRef.current = new scope.Path({
        segments: [point1, point3, point2],
        closed: true,
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
        fillColor: fillColor === 'none' ? null : fillColor,
      });
    } else if (activeTool === 'star') {
      const center = startPointRef.current.add(event.point).divide(2);
      const radius = startPointRef.current.getDistance(event.point) / 2;
      const points = 5;
      const innerRadius = radius * 0.5;
      const path = new scope.Path({
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
        fillColor: fillColor === 'none' ? null : fillColor,
      });

      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const r = i % 2 === 0 ? radius : innerRadius;
        const x = center.x + r * Math.cos(angle);
        const y = center.y + r * Math.sin(angle);
        path.add(new scope.Point(x, y));
      }
      path.closed = true;
      currentPathRef.current = path;
    } else if (activeTool === 'hexagon') {
      const center = startPointRef.current.add(event.point).divide(2);
      const radius = startPointRef.current.getDistance(event.point) / 2;
      const sides = 6;
      const path = new scope.Path({
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
        fillColor: fillColor === 'none' ? null : fillColor,
      });

      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        path.add(new scope.Point(x, y));
      }
      path.closed = true;
      currentPathRef.current = path;
    }

    if (activeTool === 'pen' && currentPathRef.current) {
      currentPathRef.current.simplify(10);
    }

    currentPathRef.current = null;
    startPointRef.current = null;
  };

  const handleClear = () => {
    if (paperScopeRef.current) {
      paperScopeRef.current.project.activeLayer.removeChildren();
    }
  };

  const handleSave = () => {
    if (!paperScopeRef.current) return;

    const svg = paperScopeRef.current.project.exportSVG({ asString: true }) as string;
    const name = `Drawing-${Date.now()}`;
    onSavePath(svg, name);
  };

  const tools = [
    { id: 'pen' as Tool, icon: Pen, label: 'Pen' },
    { id: 'line' as Tool, icon: Minus, label: 'Line' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rect' },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
    { id: 'triangle' as Tool, icon: Triangle, label: 'Triangle' },
    { id: 'star' as Tool, icon: Star, label: 'Star' },
    { id: 'hexagon' as Tool, icon: Hexagon, label: 'Hex' },
    { id: 'eraser' as Tool, icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-1.5 rounded transition-colors ${
                activeTool === tool.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
              title={tool.label}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 w-12">Stroke</span>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 w-12">Fill</span>
          <input
            type="color"
            value={fillColor === 'none' ? '#ffffff' : fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
            disabled={fillColor === 'none'}
          />
          <button
            onClick={() => setFillColor(fillColor === 'none' ? '#ffffff' : 'none')}
            className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            {fillColor === 'none' ? 'None' : 'Fill'}
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-600">Stroke Width</span>
          <span className="text-xs text-slate-900 font-mono">{strokeWidth}px</span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-full h-1.5"
        />
      </div>

      <div className="bg-slate-50 rounded-lg border border-slate-200 p-2">
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className="w-full bg-white rounded"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleClear}
          className="flex-1 px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-3 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors"
        >
          Save to Canvas
        </button>
      </div>
    </div>
  );
}
