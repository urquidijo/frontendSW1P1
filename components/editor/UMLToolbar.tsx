'use client';

import React from 'react';
import {
  Save,
  Users,
  FileCode,
  Radio
} from 'lucide-react';

interface UMLToolbarProps {
  onAddClass: () => void;
  onSave: () => void;
  onEditClass: () => void;
  hasSelectedNode: boolean;
  isConnected: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onGenerateCode?: () => void;
  onOpenChat?: () => void;
  onOpenXmiModal?: () => void;
}

export default function UMLToolbar({
  onSave,
  isConnected,
  onOpenXmiModal,
}: UMLToolbarProps) {
  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-xs">
      {/* Collaboration Status Indicator */}
      <div className="flex items-center space-x-2.5">
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          isConnected
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
            : 'bg-slate-100 text-slate-600 border-slate-200/60'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
          }`} />
          <Users className="w-3.5 h-3.5" />
          <span>{isConnected ? 'Colaborando en vivo' : 'Modo local'}</span>
        </div>
      </div>

      {/* Center Label */}
      <div className="hidden sm:flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400">
        Lienzo de Modelado
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        {/* Enterprise Architect XMI Button */}
        <button
          onClick={onOpenXmiModal}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs transition-all"
          title="Exportar / Importar XMI (Enterprise Architect)"
        >
          <FileCode className="w-3.5 h-3.5 text-indigo-600" />
          <span>EA / XMI</span>
        </button>

        {/* Save Diagram Button */}
        <button
          onClick={onSave}
          className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-sm hover:shadow-md shadow-indigo-500/20 transition-all"
          title="Guardar cambios del diagrama"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar</span>
        </button>
      </div>
    </div>
  );
}