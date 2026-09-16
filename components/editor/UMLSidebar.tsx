'use client';

import React, { useState } from 'react';
import {
  Layers,
  Box,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Sparkles
} from 'lucide-react';

interface UMLTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: string;
  data: any;
}

interface SidebarSection {
  title: string;
  icon: React.ReactNode;
  items: UMLTemplate[];
  isOpen: boolean;
}

export default function UMLSidebar({ onAddElement }: { onAddElement: (element: any) => void }) {
  const [sections, setSections] = useState<SidebarSection[]>([
    {
      title: 'Clases y Entidades',
      icon: <Box className="w-4 h-4 text-indigo-600" />,
      isOpen: true,
      items: [
        {
          id: 'basic-class',
          name: 'Clase UML',
          icon: <Box className="w-4 h-4 text-indigo-600" />,
          type: 'umlClass',
          data: {
            id: `class_${Date.now()}`,
            name: 'NuevaClase',
            position: { x: 0, y: 0 },
            attributes: [
              { id: 'attr_1', name: 'id', type: 'Long', stereotype: 'id', nullable: false, unique: true }
            ],
            methods: [],
            stereotypes: ['class']
          }
        }
      ]
    }
  ]);

  const toggleSection = (index: number) => {
    setSections(prev => prev.map((section, i) =>
      i === index ? { ...section, isOpen: !section.isOpen } : section
    ));
  };

  const handleDragStart = (e: React.DragEvent, item: UMLTemplate) => {
    const newItem = {
      ...item,
      data: {
        ...item.data,
        id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    };
    e.dataTransfer.setData('application/json', JSON.stringify(newItem));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleItemClick = (item: UMLTemplate) => {
    if (onAddElement) {
      const newItem = {
        ...item,
        data: {
          ...item.data,
          id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      };
      onAddElement(newItem);
    }
  };

  return (
    <div className="w-72 bg-white/95 backdrop-blur-md border-r border-slate-200/80 h-full overflow-y-auto flex flex-col justify-between shadow-xs">
      {/* Sidebar Header */}
      <div>
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Herramientas UML
              </h2>
              <p className="text-[11px] text-slate-500">Arrastra al lienzo o haz clic</p>
            </div>
          </div>
        </div>

        {/* Categories / Sections */}
        <div className="p-3">
          {sections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-3">
              <button
                onClick={() => toggleSection(sectionIndex)}
                className="w-full flex items-center justify-between p-2 text-left hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  {section.icon}
                  <span>{section.title}</span>
                </div>
                {section.isOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {section.isOpen && (
                <div className="mt-1.5 space-y-1.5 px-1">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center p-2.5 bg-slate-50/70 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 rounded-xl cursor-grab active:cursor-grabbing transition-all group shadow-2xs"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 mr-2" />
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-slate-200/60 mr-2.5 text-indigo-600 group-hover:border-indigo-200">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400">Entidad de base de datos</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Helpful Tips Footer */}
      <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-indigo-50/60 to-slate-50 border border-indigo-100/80">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Atajos de Modelado</span>
        </div>
        <ul className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
          <li>• Arrastra nodos para reposicionarlos.</li>
          <li>• Haz clic en una clase para editar atributos.</li>
          <li>• Arrastra desde los conectores para crear relaciones.</li>
        </ul>
      </div>
    </div>
  );
}