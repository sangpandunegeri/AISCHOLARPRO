import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import Button from './ui/Button';
import { exportToPdf, exportToDocx } from '../services/exportService';

interface HeaderProps {
    onNewProject: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewProject }) => {
  const { project } = useContext(AppContext);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setSaveStatus('Saving...');
    const timer = setTimeout(() => setSaveStatus('All changes saved'), 1000);
    return () => clearTimeout(timer);
  }, [project]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleExportPdf = async () => {
    if (project) {
        setIsExportMenuOpen(false);
        try {
            await exportToPdf(project);
        } catch (error) {
            console.error("Failed to export PDF:", error);
            alert("An error occurred while exporting to PDF.");
        }
    }
  };

  const handleExportDocx = async () => {
    if (project) {
        setIsExportMenuOpen(false);
        try {
            await exportToDocx(project);
        } catch (error) {
            console.error("Failed to export DOCX:", error);
            alert("An error occurred while exporting to DOCX.");
        }
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">AIScholar</h1>
        <div className="ml-6 text-sm text-slate-500 dark:text-slate-400">
          <i className={`fas fa-cloud ${saveStatus === 'Saving...' ? 'animate-pulse text-yellow-500' : 'text-green-500'}`}></i>
          <span className="ml-2">{saveStatus}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button onClick={onNewProject} variant="secondary" size="sm">
            <i className="fas fa-plus mr-2"></i> New Project
        </Button>
        <Button variant="secondary" size="sm" onClick={() => alert('Proofread functionality coming soon!')}>
            <i className="fas fa-spell-check mr-2"></i> Proofread Document
        </Button>
        <div className="relative" ref={exportMenuRef}>
            <Button variant="primary" size="sm" onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} disabled={!project}>
                <i className="fas fa-file-export mr-2"></i> Export <i className={`fas fa-chevron-down ml-2 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`}></i>
            </Button>
            {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-10 border border-slate-200 dark:border-slate-700">
                    <ul className="py-1">
                        <li>
                            <button onClick={handleExportPdf} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                               <i className="fas fa-file-pdf mr-2 text-red-500"></i> Export as PDF
                            </button>
                        </li>
                        <li>
                            <button onClick={handleExportDocx} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                               <i className="fas fa-file-word mr-2 text-blue-500"></i> Export as DOCX
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;