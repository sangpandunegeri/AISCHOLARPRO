
import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, label }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div>
      {label && <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</div>}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div
          className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${clampedValue}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
