import { X, FolderPlus, Clock, Save } from 'lucide-react';
import { CanvasElement } from '../types';
import { useState } from 'react';

interface ProjectsPanelProps {
  onClose: () => void;
  canvasElements: CanvasElement[];
  onLoadProject: (elements: CanvasElement[]) => void;
}

export default function ProjectsPanel({ onClose, canvasElements, onLoadProject }: ProjectsPanelProps) {
  const [projectName, setProjectName] = useState('');
  const sampleProjects = [
    {
      id: '1',
      name: 'Tech Startup Logo',
      description: 'Modern minimalist design',
      updated: '2 hours ago',
    },
    {
      id: '2',
      name: 'Brand Identity Kit',
      description: 'Complete brand system',
      updated: '1 day ago',
    },
  ];

  return (
    <div className="w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col z-10">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Projects</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <button
              disabled={!projectName.trim() || canvasElements.length === 0}
              className="px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {canvasElements.length} element{canvasElements.length !== 1 ? 's' : ''} on canvas
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Saved Projects</h3>
        <div className="space-y-2">
          {sampleProjects.map((project) => (
            <div
              key={project.id}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <h3 className="font-medium text-slate-900 mb-1 text-sm">{project.name}</h3>
              <p className="text-xs text-slate-600 mb-2">{project.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                {project.updated}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
