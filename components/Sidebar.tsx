
import React, { useState } from 'react';
import { DocumentSection, Status } from '../types';

interface SidebarProps {
  sections: DocumentSection[];
  activeSectionId: string | null;
  onSelectSection: (id: string) => void;
}

const getStatusIndicator = (status: Status) => {
  switch (status) {
    case Status.DONE:
      return <span className="text-green-500" title="Selesai"><i className="fas fa-check-circle"></i></span>;
    case Status.GENERATING:
      return <span className="text-blue-500 animate-spin" title="Sedang Dibuat"><i className="fas fa-spinner"></i></span>;
    case Status.OUTDATED:
      return <span className="text-yellow-500" title="Usang"><i className="fas fa-exclamation-triangle"></i></span>;
    case Status.PENDING:
    default:
      return <span className="text-slate-400" title="Menunggu"><i className="far fa-circle"></i></span>;
  }
};

const Sidebar: React.FC<SidebarProps> = ({ sections, activeSectionId, onSelectSection }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-80 bg-slate-100 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-2">Document Outline</h2>
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
          />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul>
          {filteredSections.map(section => (
            <li key={section.id}>
              <button
                onClick={() => onSelectSection(section.id)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors duration-150 ${
                  activeSectionId === section.id
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span style={{ paddingLeft: `${(section.level - 1) * 1.5}rem` }} className="truncate">
                  {section.title}
                </span>
                {getStatusIndicator(section.status)}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
