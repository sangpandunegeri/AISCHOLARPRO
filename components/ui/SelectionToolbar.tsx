import React from 'react';
import Button from './Button';

interface SelectionToolbarProps {
  top: number;
  left: number;
  onRephrase: () => void;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ top, left, onRephrase }) => {
  return (
    <div
      className="fixed z-20 p-1 bg-slate-800 dark:bg-slate-900 rounded-md shadow-lg flex items-center space-x-1 animate-fade-in-fast"
      style={{
        top: `${top - 55}px`, // Offset to appear above the cursor
        left: `${left}px`,
        transform: 'translateX(-50%)', // Center on the cursor
      }}
    >
      <Button variant="ghost" size="sm" onClick={onRephrase} className="text-white hover:bg-slate-700">
        <i className="fas fa-pen-nib mr-2"></i> Rephrase
      </Button>
    </div>
  );
};

export default SelectionToolbar;
