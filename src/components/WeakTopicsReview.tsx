import React from 'react';
import type { Question, Confidence } from '../types';

interface WeakTopicsReviewProps {
  questions: Question[];
  onUpdateConfidence: (id: string, newConfidence: Confidence) => void;
}

export const WeakTopicsReview: React.FC<WeakTopicsReviewProps> = ({
  questions,
  onUpdateConfidence,
}) => {
  // Filter questions to only those with Low confidence
  const weakQuestions = React.useMemo(() => {
    return questions.filter((q) => q.confidence === 'Low');
  }, [questions]);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [slideDirection, setSlideDirection] = React.useState<'left' | 'right' | null>(null);

  // If list shrinks and index is out of bounds, adjust it
  React.useEffect(() => {
    if (currentIndex >= weakQuestions.length && weakQuestions.length > 0) {
      setCurrentIndex(weakQuestions.length - 1);
    }
  }, [weakQuestions.length, currentIndex]);

  const activeCard = weakQuestions[currentIndex];

  const handleNext = React.useCallback(() => {
    if (weakQuestions.length <= 1) return;
    setIsFlipped(false);
    setSlideDirection('left');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % weakQuestions.length);
      setSlideDirection(null);
    }, 400);
  }, [weakQuestions.length]);

  const handlePrev = React.useCallback(() => {
    if (weakQuestions.length <= 1) return;
    setIsFlipped(false);
    setSlideDirection('right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + weakQuestions.length) % weakQuestions.length);
      setSlideDirection(null);
    }, 400);
  }, [weakQuestions.length]);

  const handleRate = React.useCallback((rating: Confidence) => {
    if (!activeCard) return;

    // Trigger slide out if confidence is improved (graduates the card)
    if (rating !== 'Low') {
      setSlideDirection('left');
      setTimeout(() => {
        onUpdateConfidence(activeCard.id, rating);
        setIsFlipped(false);
        setSlideDirection(null);
        // Index will auto-correct via useEffect if we shrink the array
      }, 400);
    } else {
      // Just progress to the next card to cycle if they want to keep it Low
      onUpdateConfidence(activeCard.id, rating);
      handleNext();
    }
  }, [activeCard, onUpdateConfidence, handleNext]);

  // Keyboard Shortcuts handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if user is typing in inputs or textareas
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (!activeCard) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1') {
        handleRate('Low');
      } else if (e.key === '2') {
        handleRate('Medium');
      } else if (e.key === '3') {
        handleRate('High');
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCard, handleRate, handleNext, handlePrev]);

  // Parse inline backticks and blocks for answer text display inside review card
  // Helper to parse bold and inline code backticks in a single string returning React nodes
  const parseInlineMarkdown = (text: string) => {
    if (!text) return '';
    
    // First split by backticks to separate inline code
    const codeParts = text.split('`');
    
    return codeParts.map((codePart, codeIdx) => {
      const isCode = codeIdx % 2 !== 0;
      
      if (isCode) {
        return (
          <code 
            key={`code-${codeIdx}`} 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '0.125rem 0.25rem', 
              borderRadius: '4px', 
              color: '#f472b6', 
              fontFamily: 'monospace',
              fontSize: '0.85em'
            }}
          >
            {codePart}
          </code>
        );
      }
      
      // For non-code segments, split by double asterisks for bolding
      const boldParts = codePart.split('**');
      return boldParts.map((boldPart, boldIdx) => {
        const isBold = boldIdx % 2 !== 0;
        
        if (isBold) {
          return (
            <strong key={`bold-${codeIdx}-${boldIdx}`} style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              {boldPart}
            </strong>
          );
        }
        
        return boldPart;
      });
    });
  };

  // Parse inline backticks and blocks for answer text display inside review card
  const renderSimpleFormattedText = (text: string) => {
    if (!text) return null;

    // Split by triple-backtick fenced blocks
    const segments = text.split(/(```[\s\S]*?```)/g);
    return segments.map((segment, index) => {
      if (segment.startsWith('```')) {
        const match = segment.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] || 'code' : 'code';
        const codeContent = match ? match[2].trim() : segment.replace(/```/g, '').trim();

        return (
          <div key={index} style={{ position: 'relative', margin: '0.75rem 0' }}>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.4)',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: 'var(--text-muted)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <span>{language.toUpperCase()}</span>
            </div>
            <pre style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: '0.75rem 1rem', background: '#09090b', border: '1.5px solid var(--neo-border-color)' }}>
              <code style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Normal text: process line-by-line
      const lines = segment.split(/\r?\n/);
      return lines.map((line, lIdx) => {
        if (!line.trim()) {
          return <div key={lIdx} style={{ height: '0.5rem' }} />;
        }

        const isHeader = line.trim().startsWith('###');
        const isBullet = line.trim().startsWith('-');
        const isNumbered = /^\d+\.\s+/.test(line.trim());

        if (isHeader) {
          const content = line.replace(/^###\s*/, '');
          return (
            <h4 
              key={lIdx} 
              style={{ 
                margin: '0.875rem 0 0.5rem 0', 
                fontWeight: 800, 
                color: 'var(--text-primary)',
                fontSize: '1.1rem' 
              }}
            >
              {parseInlineMarkdown(content)}
            </h4>
          );
        }

        if (isBullet || isNumbered) {
          let content = line.trim();
          let prefix = '•';

          if (isBullet) {
            content = content.replace(/^-\s*/, '');
          } else {
            const numMatch = content.match(/^(\d+\.\s+)/);
            prefix = numMatch ? numMatch[1] : '1. ';
            content = content.replace(/^\d+\.\s+/, '');
          }

          return (
            <div 
              key={lIdx} 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '0.5rem',
                margin: '0.375rem 0',
                paddingLeft: '1rem'
              }}
            >
              <span style={{ color: 'var(--primary-hover)', fontWeight: 800 }}>
                {prefix}
              </span>
              <span style={{ flex: 1 }}>{parseInlineMarkdown(content)}</span>
            </div>
          );
        }

        // Regular line
        return (
          <p key={lIdx} style={{ margin: '0.375rem 0', lineHeight: '1.6', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
            {parseInlineMarkdown(line)}
          </p>
        );
      });
    });
  };

  if (weakQuestions.length === 0) {
    return (
      <div className="empty-state-card glass-panel" id="review-empty-state">
        <div className="empty-state-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3>All Caught Up! 🎉</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.9375rem' }}>
          Excellent work! You have no questions rated with <strong>Low</strong> confidence. You\'re fully prepared for these topics.
        </p>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Tip: Add more questions or adjust confidence levels on the main dashboard to seed your drill queue.
        </span>
      </div>
    );
  }

  const slideClass = slideDirection === 'left' 
    ? 'slide-out-left' 
    : slideDirection === 'right' 
      ? 'slide-out-right' 
      : '';

  return (
    <div className="review-mode-layout" id="review-layout-root">
      
      {/* Header Info */}
      <div className="review-header-section">
        <h2>Focus Queue Drill</h2>
        <span className="review-counter" id="review-progress-counter">
          Question {currentIndex + 1} of {weakQuestions.length}
        </span>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Reviewing topics where you rated your confidence as Low.
        </p>
      </div>

      {/* 3D Flashcard */}
      <div className={`flashcard-wrapper ${slideClass}`}>
        <div 
          className={`flashcard ${isFlipped ? 'flipped' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
          id="active-review-flashcard"
        >
          {/* Front Face: Question */}
          <div className="flashcard-front glass-panel">
            <div className="flashcard-header-badge">
              <span className="topic-tag">{activeCard.topic}</span>
              <span className={`difficulty-badge ${activeCard.difficulty}`}>{activeCard.difficulty}</span>
            </div>
            
            <div className="flashcard-scroll-area">
              <h3 className="flashcard-question-text">{activeCard.question}</h3>
            </div>

            <div className="flashcard-hint">
              <span>Click card or press <kbd className="keyboard-hint-badge">Space</kbd> to reveal answer</span>
            </div>
          </div>

          {/* Back Face: Answer */}
          <div className="flashcard-back glass-panel">
            <div className="flashcard-header-badge">
              <span className="topic-tag">{activeCard.topic}</span>
              <span className={`difficulty-badge ${activeCard.difficulty}`}>{activeCard.difficulty}</span>
            </div>

            <div className="flashcard-scroll-area left-align">
              <div className="flashcard-answer-text">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Answer Overview
                </div>
                {renderSimpleFormattedText(activeCard.answer)}
              </div>
            </div>

            <div className="flashcard-hint">
              <span>Click card or press <kbd className="keyboard-hint-badge">Space</kbd> to return to question</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="study-controls">
        {weakQuestions.length > 1 && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.25rem' }}>
            <button className="btn btn-secondary" onClick={handlePrev} id="btn-review-prev" title="Previous Question">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Previous
            </button>
            <button className="btn btn-secondary" onClick={handleNext} id="btn-review-next" title="Next Question">
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        )}

        <div className="instruction-text">
          <span>Keyboard shortcuts active: </span>
          <kbd className="keyboard-hint-badge">Space</kbd> Flip | 
          <kbd className="keyboard-hint-badge">←</kbd> Prev | 
          <kbd className="keyboard-hint-badge">→</kbd> Next
        </div>

        <div 
          style={{ 
            width: '100%', 
            borderTop: '2px solid var(--neo-border-color)', 
            paddingTop: '1.25rem', 
            marginTop: '0.5rem',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            Rate your confidence to update queue:
          </div>
          <div className="study-action-row">
            <button 
              className="btn" 
              style={{ background: 'rgba(244, 63, 94, 0.15)', border: '2px solid var(--low)', color: '#fb7185', boxShadow: '3px 3px 0px 0px var(--low)' }}
              onClick={() => handleRate('Low')}
              id="btn-review-rate-low"
            >
              <kbd className="keyboard-hint-badge" style={{ color: '#fb7185', border: '2px solid rgba(244, 63, 94, 0.3)' }}>1</kbd>
              Low (Keep in Queue)
            </button>
            <button 
              className="btn" 
              style={{ background: 'rgba(251, 146, 60, 0.15)', border: '2px solid var(--mid)', color: '#fdba74', boxShadow: '3px 3px 0px 0px var(--mid)' }}
              onClick={() => handleRate('Medium')}
              id="btn-review-rate-medium"
            >
              <kbd className="keyboard-hint-badge" style={{ color: '#fdba74', border: '2px solid rgba(251, 146, 60, 0.3)' }}>2</kbd>
              Medium (Graduate)
            </button>
            <button 
              className="btn" 
              style={{ background: 'rgba(52, 211, 153, 0.15)', border: '2px solid var(--high)', color: '#86efac', boxShadow: '3px 3px 0px 0px var(--high)' }}
              onClick={() => handleRate('High')}
              id="btn-review-rate-high"
            >
              <kbd className="keyboard-hint-badge" style={{ color: '#86efac', border: '2px solid rgba(52, 211, 153, 0.3)' }}>3</kbd>
              High (Graduate)
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
