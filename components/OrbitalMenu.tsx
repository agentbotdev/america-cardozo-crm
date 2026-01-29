import React, { useState } from 'react';
import { Home, Building, Warehouse, Key, Tag, Briefcase } from 'lucide-react';

const OrbitalMenu: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const items = [
    { icon: Home, label: 'Casas', color: 'bg-pastel-blue' },
    { icon: Building, label: 'Deptos', color: 'bg-pastel-purple' },
    { icon: Warehouse, label: 'Locales', color: 'bg-pastel-green' },
    { icon: Briefcase, label: 'Oficinas', color: 'bg-pastel-orange' },
    { icon: Tag, label: 'Lotes', color: 'bg-pastel-pink' },
  ];

  // Calculate positions in a circle
  const radius = 110; 
  const center = 150;

  return (
    <div className="relative w-[300px] h-[300px] flex items-center justify-center mx-auto my-8 animate-fade-in">
      {/* Central Hub */}
      <div className="absolute z-20 w-24 h-24 bg-white/80 backdrop-blur-xl rounded-full shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center border border-white/60">
        <div className="text-indigo-600 font-bold text-lg">CRM</div>
        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Orbital</div>
      </div>

      {/* Orbit Rings */}
      <div className="absolute w-[220px] h-[220px] rounded-full border border-indigo-100 animate-spin-slow"></div>
      <div className="absolute w-[160px] h-[160px] rounded-full border border-purple-50 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '18s' }}></div>

      {/* Nodes */}
      {items.map((item, index) => {
        const angle = (index / items.length) * 2 * Math.PI - Math.PI / 2;
        const x = center + radius * Math.cos(angle) - 24; // -24 to center the 48px div
        const y = center + radius * Math.sin(angle) - 24;

        return (
          <div
            key={index}
            className={`absolute w-12 h-12 rounded-full ${item.color} shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-125 z-10 border-2 border-white`}
            style={{ 
              left: `${x}px`, 
              top: `${y}px`,
              // This calculation is static, in a real orbital, we might want them to rotate or stay fixed while ring rotates.
              // For simplicity in this prompt, static positioning is cleaner.
              transform: `translate(-50%, -50%)`,
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <item.icon size={18} className="text-gray-700 opacity-80" />
            
            {/* Tooltip */}
            <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-1 rounded-md text-xs font-medium shadow-sm transition-opacity duration-200 pointer-events-none whitespace-nowrap
              ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}
            `}>
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrbitalMenu;