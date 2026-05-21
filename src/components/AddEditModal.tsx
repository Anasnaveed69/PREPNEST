import React from 'react';
import type { Question, Difficulty, Confidence } from '../types';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: {
    question: string;
    answer: string;
    topic: string;
    difficulty: Difficulty;
    confidence: Confidence;
  }) => void;
  editingQuestion?: Question | null;
}

export const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingQuestion,
}) => {
  const [questionText, setQuestionText] = React.useState('');
  const [answerText, setAnswerText] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [difficulty, setDifficulty] = React.useState<Difficulty>('Medium');
  const [confidence, setConfidence] = React.useState<Confidence>('Low');
  const [errorMsg, setErrorMsg] = React.useState('');

  // Load editing state when modal opens or editingQuestion changes
  React.useEffect(() => {
    if (editingQuestion) {
      setQuestionText(editingQuestion.question);
      setAnswerText(editingQuestion.answer);
      setTopic(editingQuestion.topic);
      setDifficulty(editingQuestion.difficulty);
      setConfidence(editingQuestion.confidence);
    } else {
      setQuestionText('');
      setAnswerText('');
      setTopic('');
      setDifficulty('Medium');
      setConfidence('Low');
    }
    setErrorMsg('');
  }, [editingQuestion, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setErrorMsg('Question text is required.');
      return;
    }
    if (!answerText.trim()) {
      setErrorMsg('Answer text is required.');
      return;
    }
    if (!topic.trim()) {
      setErrorMsg('Topic/Tag is required (e.g. React, DBMS, System Design).');
      return;
    }

    onSave({
      question: questionText.trim(),
      answer: answerText.trim(),
      topic: topic.trim(),
      difficulty,
      confidence,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="add-edit-modal-overlay">
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        id="add-edit-modal-content"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title-text">
            {editingQuestion ? 'Edit Question Entry' : 'Add New Question to Vault'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} id="modal-form-root">
          {errorMsg && (
            <div 
              style={{ 
                background: 'rgba(239, 68, 68, 0.15)', 
                color: '#f87171', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                padding: '0.625rem 1rem', 
                borderRadius: '8px', 
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
              id="modal-error-alert"
            >
              {errorMsg}
            </div>
          )}

          {/* Question Text Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="input-question">Question</label>
            <input
              type="text"
              id="input-question"
              className="form-control-input"
              placeholder="e.g. Explain custom hooks inside React hooks."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              autoFocus
            />
          </div>

          {/* Answer Text Area */}
          <div className="form-group">
            <label className="form-label" htmlFor="input-answer">Detailed Answer</label>
            <textarea
              id="input-answer"
              className="form-control-textarea"
              placeholder="Provide a detailed explanation. Use markdown blocks for code if needed (e.g. ```javascript console.log('hello'); ```)."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
          </div>

          {/* Tag/Topic Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="input-topic">Topic Tag</label>
            <input
              type="text"
              id="input-topic"
              className="form-control-input"
              placeholder="e.g. React, JavaScript, DBMS, System Design"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Difficulty Grid Selector */}
          <div className="form-group">
            <label className="form-label">Difficulty Category</label>
            <div className="form-grid-select">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                <button
                  type="button"
                  key={d}
                  className={`select-card-btn ${difficulty === d ? `active ${d}` : ''}`}
                  onClick={() => setDifficulty(d)}
                  id={`btn-select-diff-${d.toLowerCase()}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Grid Selector */}
          <div className="form-group">
            <label className="form-label">Current Confidence Level</label>
            <div className="form-grid-select">
              {(['Low', 'Medium', 'High'] as Confidence[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`select-card-btn ${
                    confidence === c 
                      ? c === 'Medium' 
                        ? 'active Medium-conf' 
                        : `active ${c}`
                      : ''
                  }`}
                  onClick={() => setConfidence(c)}
                  id={`btn-select-conf-${c.toLowerCase()}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              id="btn-modal-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              id="btn-modal-submit"
            >
              {editingQuestion ? 'Save Updates' : 'Add to Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
