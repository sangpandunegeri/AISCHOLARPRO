import React, { useState, useContext, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppContext } from '../App';
import { DocumentSection } from '../types';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import SelectionToolbar from './ui/SelectionToolbar';

interface ContentPanelProps {
  section: DocumentSection;
}

const ContentPanel: React.FC<ContentPanelProps> = ({ section }) => {
  const { updateSectionContent, generateContentForSection, isLoading, setActiveModal, setModalContent } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(true);
  const [content, setContent] = useState(section.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number; text: string; top: number; left: number } | null>(null);

  useEffect(() => {
    setContent(section.content);
  }, [section]);
  
  const handleMouseUp = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const { selectionStart, selectionEnd } = textarea;

    // A brief timeout helps prevent the toolbar from appearing for simple clicks
    setTimeout(() => {
      if (textarea.selectionStart === selectionStart && textarea.selectionEnd === selectionEnd) {
        if (selectionStart !== selectionEnd) {
          const selectedText = textarea.value.substring(selectionStart, selectionEnd);
          if (selectedText.trim().length > 5) { // Only show for selections longer than 5 chars
              setSelection({
                  start: selectionStart,
                  end: selectionEnd,
                  text: selectedText,
                  top: event.clientY,
                  left: event.clientX,
              });
          }
        } else {
            setSelection(null);
        }
      }
    }, 10);
  };
  
  const handleRephraseSelection = () => {
    if (!selection) return;
    setModalContent({
        text: selection.text,
        sectionId: section.id,
        selection: { start: selection.start, end: selection.end }
    });
    setActiveModal('paraphrase');
    setSelection(null); // Hide toolbar after opening modal
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  const handleSave = () => {
    updateSectionContent(section.id, content);
  }

  const handleGenerate = () => {
    generateContentForSection(section.id);
  }
  
  const handleProofread = () => {
    setModalContent({ text: content, sectionId: section.id });
    setActiveModal('proofread');
  };

  const handleParaphrase = () => {
    setModalContent({ text: content, sectionId: section.id });
    setActiveModal('paraphrase');
  };


  return (
    <div className="flex-1 flex flex-col p-6 bg-white dark:bg-slate-900 overflow-y-auto">
      {selection && <SelectionToolbar top={selection.top} left={selection.left} onRephrase={handleRephraseSelection} />}
      <header className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold">{section.title}</h2>
        <div className="flex items-center space-x-2">
            <Button variant={isEditing ? 'primary' : 'secondary'} size="sm" onClick={() => setIsEditing(true)}>
                <i className="fas fa-edit mr-2"></i> Edit
            </Button>
            <Button variant={!isEditing ? 'primary' : 'secondary'} size="sm" onClick={() => { handleSave(); setIsEditing(false); }}>
                <i className="fas fa-eye mr-2"></i> Preview
            </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col relative">
        {section.content === '' && !isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
            <i className="fas fa-wand-magic-sparkles text-5xl text-primary-500 mb-4"></i>
            <h3 className="text-xl font-semibold">This section is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-md">Let AIScholar kickstart the writing process for you. Click the button below to generate a draft for "{section.title}".</p>
            <Button onClick={handleGenerate} variant="primary" size="lg">
              <i className="fas fa-robot mr-2"></i> Generate Content
            </Button>
          </div>
        ) : isLoading && section.status === 'Sedang Dibuat' ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Spinner />
            <p className="mt-4 text-slate-500">Generating content for "{section.title}"...</p>
          </div>
        ) : isEditing ? (
          <>
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-t-md border-b border-slate-200 dark:border-slate-700 flex items-center space-x-2">
              <Button size="sm" variant="ghost" onClick={handleParaphrase}><i className="fas fa-pen-nib mr-1"></i> Paraphrase Section</Button>
              <Button size="sm" variant="ghost" onClick={handleProofread}><i className="fas fa-spell-check mr-1"></i> Proofread Section</Button>
              <Button size="sm" variant="ghost" onClick={handleSave}><i className="fas fa-save mr-1"></i> Save</Button>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onMouseUp={handleMouseUp}
              onScroll={() => setSelection(null)}
              onBlur={() => setSelection(null)}
              className="w-full flex-1 p-4 bg-white dark:bg-slate-800/50 rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-base leading-relaxed resize-none"
              placeholder={`Start writing for ${section.title}...`}
            />
          </>
        ) : (
          <div className="prose prose-slate dark:prose-invert max-w-none p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || 'No content to preview.'}</ReactMarkdown>
          </div>
        )}
      </div>
      {section.groundingChunks && section.groundingChunks.length > 0 && (
          <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold text-lg mb-2">Sources</h4>
              <ul className="list-disc pl-5 space-y-1">
                  {section.groundingChunks.map((chunk, index) => (
                      <li key={index} className="text-sm">
                          <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline dark:text-primary-400">
                              {chunk.web.title || chunk.web.uri}
                          </a>
                      </li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
};

export default ContentPanel;