import React from 'react';
import logo from '../assets/k-finops-logo.png';

interface BrandLogoProps {
  compact?: boolean;
  showWordmark?: boolean;
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false, showWordmark = true, className = '' }) => {
  const size = compact ? 'h-10 w-10' : 'h-14 w-14';
  const textSize = compact ? 'text-lg' : 'text-3xl';
  const subSize = compact ? 'text-[9px]' : 'text-[10px]';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative overflow-hidden rounded-2xl border border-amber-300/40 bg-black shadow-xl shadow-amber-500/10 ${size}`}>
        <img src={logo} alt="K FinOps logo" className="h-full w-full object-cover" />
      </div>
      {showWordmark && (
        <div>
          <div className={`font-black tracking-tight text-slate-900 dark:text-white ${textSize}`}>
            K<span className="text-amber-500">Control</span>
          </div>
          <div className={`font-black uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400 ${subSize}`}>
            FinOps Pro
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
