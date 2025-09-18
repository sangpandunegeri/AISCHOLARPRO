import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Modal from './Modal';

const PARAPHRASE_STYLES = [
  'More Formal & Academic',
  'Simpler & Clearer',
  'More Concise',
  'Expand and Elaborate',
  'Alternative Phrasing'
];

const ParaphraseModal: React.FC = () => {
    const { project, activeModal, setActiveModal, modalContent, paraphrase, updateSectionContent } = useContext(AppContext);
    const [selectedStyle, setSelectedStyle] = useState(PARAPHRASE_STYLES[0]);
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleParaphrase = async () => {
      if (modalContent?.text && selectedStyle) {
        setIsLoading(true);
        setResult(null);
        const paraphrasedText = await paraphrase(modalContent.text, selectedStyle);
        setResult(paraphrasedText);
        setIsLoading(false);
      }
    };

    const handleAccept = () => {
        if (result && modalContent?.sectionId && project) {
            // New logic for in-line replacement of selected text
            if (modalContent.selection) {
                const originalSection = project.sections.find(s => s.id === modalContent.sectionId);
                if (originalSection) {
                    const originalContent = originalSection.content;
                    const { start, end } = modalContent.selection;
                    const newContent = originalContent.substring(0, start) + result + originalContent.substring(end);
                    updateSectionContent(modalContent.sectionId, newContent);
                }
            } else { // Fallback to original behavior (replace entire section)
                updateSectionContent(modalContent.sectionId, result);
            }
        }
        handleClose();
    };

    const handleClose = () => {
        setActiveModal(null);
        setResult(null);
        setIsLoading(false);
    };

    // Reset result when style changes
    useEffect(() => {
        setResult(null);
    }, [selectedStyle]);

    return (
        <Modal
            isOpen={activeModal === 'paraphrase'}
            onClose={handleClose}
            title="Paraphrase Text"
        >
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Paraphrasing Style</label>
                <select 
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  {PARAPHRASE_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                </select>
            </div>
            
            <Button onClick={handleParaphrase} disabled={isLoading} className="w-full mb-4">
                {isLoading ? 'Paraphrasing...' : 'Generate Paraphrased Text'}
            </Button>

            {isLoading && (
              <div className="flex items-center justify-center h-40">
                  <Spinner />
              </div>
            )}
            
            {result && (
              <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg max-h-64 overflow-y-auto">
                  <h4 className="font-semibold mb-2">Result:</h4>
                  <p className="text-sm leading-relaxed">{result}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleAccept} disabled={!result || isLoading}>Accept & Replace</Button>
            </div>
        </Modal>
    );
};

export default ParaphraseModal;