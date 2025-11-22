import { useState } from 'react';
import { Pipette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  const handleHueChange = (newHue: number) => {
    setHue(newHue);
    onChange(`hsl(${newHue}, ${saturation}%, ${lightness}%)`);
  };

  const chromaticPalette = [
    // Reds
    '#ff0000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc',
    // Oranges
    '#ff6600', '#ff8533', '#ffa366', '#ffc299', '#ffe0cc',
    // Yellows
    '#ffcc00', '#ffd633', '#ffe066', '#ffeb99', '#fff5cc',
    // Greens
    '#00ff00', '#33ff33', '#66ff66', '#99ff99', '#ccffcc',
    // Cyans
    '#00ffff', '#33ffff', '#66ffff', '#99ffff', '#ccffff',
    // Blues
    '#0000ff', '#3333ff', '#6666ff', '#9999ff', '#ccccff',
    // Purples
    '#9900ff', '#ad33ff', '#c266ff', '#d699ff', '#ebccff',
    // Magentas
    '#ff00ff', '#ff33ff', '#ff66ff', '#ff99ff', '#ffccff',
    // Grays
    '#111111', '#333333', '#666666', '#999999', '#cccccc',
  ];

  const startEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        onChange(result.sRGBHex);
        setShowPicker(false);
      } catch (e) {
        console.log('EyeDropper cancelled or not supported');
      }
    } else {
      alert('EyeDropper API is not supported in this browser. Please use Chrome or Edge.');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-6 h-6 rounded border-2 border-slate-300 hover:border-slate-400 transition-colors"
        style={{ backgroundColor: value || '#1e293b' }}
        title="Change color"
      />

      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 p-3 bg-white border border-slate-300 rounded-lg shadow-lg z-20 w-56">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-medium text-slate-700 mb-1.5">Hue Spectrum</p>
                <div className="relative">
                  <div className="w-full h-8 rounded-lg overflow-hidden">
                    <div
                      className="w-full h-full"
                      style={{
                        background: `linear-gradient(to right,
                          hsl(0, 100%, 50%),
                          hsl(60, 100%, 50%),
                          hsl(120, 100%, 50%),
                          hsl(180, 100%, 50%),
                          hsl(240, 100%, 50%),
                          hsl(300, 100%, 50%),
                          hsl(360, 100%, 50%))`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={(e) => handleHueChange(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs font-medium text-slate-700 mb-1.5">Chromatic Palette</p>
                <div className="grid grid-cols-5 gap-1">
                  {chromaticPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        onChange(color);
                        setShowPicker(false);
                      }}
                      className="w-8 h-8 rounded border border-slate-200 hover:border-slate-900 transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <button
                  onClick={startEyeDropper}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded transition-colors"
                  title="Pick color from screen"
                >
                  <Pipette className="w-3.5 h-3.5" />
                  Eyedropper
                </button>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <input
                  type="color"
                  value={value || '#1e293b'}
                  onChange={(e) => {
                    onChange(e.target.value);
                    setShowPicker(false);
                  }}
                  className="w-full h-8 rounded cursor-pointer"
                  title="Custom color"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
