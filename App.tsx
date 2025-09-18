
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Project, DocumentSection, AppState, ModalType, EducationLevel, Status } from './types';
import { DOCUMENT_STRUCTURE, DEFAULT_PROJECT } from './constants';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import { generateSectionContent, proofreadText, paraphraseText } from './services/geminiService';

export const AppContext = React.createContext<{
  project: Project | null;
  // FIX: Updated setProject type to match the `initializeNewProject` function signature.
  // The context's `setProject` is used to create a new project from form data,
  // which is a partial Project object.
  setProject: (details: Omit<Project, 'id' | 'sections' | 'stats'>) => void;
  updateSectionContent: (sectionId: string, content: string, groundingChunks?: any[]) => void;
  generateContentForSection: (sectionId: string) => Promise<void>;
  updateSectionStatus: (sectionId: string, status: Status) => void;
  proofread: (text: string) => Promise<{ correctedText: string; changes: any[] }>;
  paraphrase: (text: string, style: string) => Promise<string>;
  activeModal: ModalType | null;
  setActiveModal: (modal: ModalType | null) => void;
  modalContent: any;
  setModalContent: (content: any) => void;
  isLoading: boolean;
}>({
  project: null,
  setProject: () => {},
  updateSectionContent: () => {},
  generateContentForSection: async () => {},
  updateSectionStatus: () => {},
  proofread: async () => ({ correctedText: '', changes: [] }),
  paraphrase: async () => '',
  activeModal: null,
  setActiveModal: () => {},
  modalContent: null,
  setModalContent: () => {},
  isLoading: false,
});

const App: React.FC = () => {
  const [project, setProject] = useLocalStorage<Project | null>('ai-scholar-project', null);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [modalContent, setModalContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appState, setAppState] = useState<AppState>(project ? AppState.EDITOR : AppState.DASHBOARD);
  
  useEffect(() => {
    setAppState(project ? AppState.EDITOR : AppState.DASHBOARD);
  }, [project]);

  const initializeNewProject = (details: Omit<Project, 'id' | 'sections' | 'stats'>): void => {
    const newProject: Project = {
      ...DEFAULT_PROJECT,
      ...details,
      id: Date.now().toString(),
      sections: DOCUMENT_STRUCTURE.map(section => ({
        ...section,
        content: '',
        status: Status.PENDING,
      })),
    };
    setProject(newProject);
  };

  const updateSectionStatus = useCallback((sectionId: string, status: Status): void => {
    if (!project) return;
    const updatedSections = project.sections.map(s =>
      s.id === sectionId ? { ...s, status } : s
    );
    setProject({ ...project, sections: updatedSections });
  }, [project, setProject]);

  const updateSectionContent = useCallback((sectionId: string, content: string, groundingChunks?: any[]): void => {
    if (!project) return;
    const updatedSections = project.sections.map(s =>
      s.id === sectionId ? { ...s, content, status: Status.DONE, groundingChunks } : s
    );
    const totalWords = updatedSections.reduce((acc, sec) => acc + (sec.content?.split(/\s+/).filter(Boolean).length || 0), 0);
    const completedSections = updatedSections.filter(s => s.status === Status.DONE).length;
    const completionPercentage = Math.round((completedSections / updatedSections.length) * 100);

    setProject({
      ...project,
      sections: updatedSections,
      stats: {
        ...project.stats,
        totalWords,
        completionPercentage,
      }
    });
  }, [project, setProject]);

  const generateContentForSection = useCallback(async (sectionId: string): Promise<void> => {
    if (!project) return;
    
    const section = project.sections.find(s => s.id === sectionId);
    if (!section) return;

    setIsLoading(true);
    updateSectionStatus(sectionId, Status.GENERATING);

    try {
      const result = await generateSectionContent(project, sectionId);
      updateSectionContent(sectionId, result.text, result.groundingChunks);
    } catch (error) {
      console.error('Failed to generate content:', error);
      updateSectionStatus(sectionId, Status.PENDING);
      alert('An error occurred while generating content. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  }, [project, updateSectionContent, updateSectionStatus]);
  
  const proofread = useCallback(async (text: string): Promise<{ correctedText: string; changes: any[] }> => {
    setIsLoading(true);
    try {
      return await proofreadText(text);
    } catch(e) {
      console.error(e);
      alert('Failed to proofread.');
      return { correctedText: text, changes: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const paraphrase = useCallback(async (text: string, style: string): Promise<string> => {
    if (!project) return text;
    setIsLoading(true);
    try {
      return await paraphraseText(project, text, style);
    } catch(e) {
      console.error(e);
      alert('Failed to paraphrase.');
      return text;
    } finally {
      setIsLoading(false);
    }
  }, [project]);

  const handleNewProject = () => {
    if(window.confirm("Are you sure you want to start a new project? All unsaved data will be lost.")) {
      setProject(null);
    }
  };

  const appContextValue = useMemo(() => ({
    project,
    setProject: initializeNewProject,
    updateSectionContent,
    generateContentForSection,
    updateSectionStatus,
    proofread,
    paraphrase,
    activeModal,
    setActiveModal,
    modalContent,
    setModalContent,
    isLoading,
  }), [project, updateSectionContent, generateContentForSection, updateSectionStatus, proofread, paraphrase, activeModal, modalContent, isLoading]);

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
        {appState === AppState.DASHBOARD ? (
          <Dashboard />
        ) : (
          <Editor onNewProject={handleNewProject} />
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;
