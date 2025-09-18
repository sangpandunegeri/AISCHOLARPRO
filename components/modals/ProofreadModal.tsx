
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Modal from './Modal';

const ProofreadModal: React.FC = () => {
    const { activeModal, setActiveModal, modalContent, proofread, updateSectionContent } = useContext(AppContext);
    const [result, setResult] = useState<{ correctedText: string; changes: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeModal === 'proofread' && modalContent?.text) {
            setIsLoading(true);
            proofread(modalContent.text).then(res => {
                setResult(res);
                setIsLoading(false);
            });
        }
    }, [activeModal, modalContent, proofread]);

    const handleAccept = () => {
        if (result && modalContent?.sectionId) {
            updateSectionContent(modalContent.sectionId, result.correctedText);
        }
        handleClose();
    };

    const handleClose = () => {
        setActiveModal(null);
        setResult(null);
    };

    return (
        <Modal
            isOpen={activeModal === 'proofread'}
            onClose={handleClose}
            title="Proofread Results"
        >
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <Spinner />
                    <p className="mt-4 text-slate-500">Analyzing text...</p>
                </div>
            ) : result ? (
                <div className="max-h-[70vh] overflow-y-auto">
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                        <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Corrected Text</h4>
                        <p className="text-sm leading-relaxed">{result.correctedText}</p>
                    </div>
                    
                    <h4 className="font-semibold mb-2">Changes ({result.changes.length})</h4>
                    <div className="space-y-3">
                        {result.changes.map((change, index) => (
                            <div key={index} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md">
                                <p className="text-sm text-red-600 dark:text-red-400"><strong>Original:</strong> <del>{change.original}</del></p>
                                <p className="text-sm text-green-600 dark:text-green-400"><strong>Suggestion:</strong> {change.suggestion}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1"><em>Explanation: {change.explanation}</em></p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center h-64">
                    <p>No results to display.</p>
                </div>
            )}
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleAccept} disabled={!result || isLoading}>Accept Changes</Button>
            </div>
        </Modal>
    );
};

export default ProofreadModal;
