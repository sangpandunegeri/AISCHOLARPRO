
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import Header from './Header';
import Sidebar from './Sidebar';
import ContentPanel from './ContentPanel';
import ProofreadModal from './modals/ProofreadModal';
import ParaphraseModal from './modals/ParaphraseModal';
import Spinner from './ui/Spinner';

interface EditorProps {
    onNewProject: () => void;
}

const Editor: React.FC<EditorProps> = ({ onNewProject }) => {
  const { project, isLoading, activeModal } = useContext(AppContext);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (project && project.sections.length > 0 && !activeSectionId) {
      setActiveSectionId(project.sections[0].id);
    }
  }, [project, activeSectionId]);

  if (!project) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Spinner />
            <p className="ml-4">Loading project...</p>
        </div>
    );
  }

  const activeSection = project.sections.find(s => s.id === activeSectionId);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-800">
      <Header onNewProject={onNewProject} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          sections={project.sections} 
          activeSectionId={activeSectionId} 
          onSelectSection={setActiveSectionId} 
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeSection ? (
            <ContentPanel section={activeSection} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <p>Select a section to begin writing.</p>
            </div>
          )}
        </main>
      </div>
      {isLoading && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"><Spinner /></div>}
      {activeModal === 'proofread' && <ProofreadModal />}
      {activeModal === 'paraphrase' && <ParaphraseModal />}
    </div>
  );
};

export default Editor;
