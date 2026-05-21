import React from 'react';
import type { Question, Confidence } from '../types';

interface QuestionCardProps {
  question: Question;
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
  onUpdateConfidence: (id: string, newConfidence: Confidence) => void;
  onCopySuccess: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onEdit,
  onDelete,
  onUpdateConfidence,
  onCopySuccess,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

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

  // Helper to parse and render answers (Zero-Dependency MD & Code-Block Parser)
  const renderFormattedAnswer = (text: string) => {
    if (!text) return null;

    // Split by triple-backtick fenced blocks
    const segments = text.split(/(```[\s\S]*?```)/g);
    return segments.map((segment, index) => {
      if (segment.startsWith('```')) {
        // Find language header if specified (first word)
        const match = segment.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] || 'code' : 'code';
        const codeContent = match ? match[2].trim() : segment.replace(/```/g, '').trim();

        const handleCopy = () => {
          navigator.clipboard.writeText(codeContent);
          onCopySuccess();
        };

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
              <button 
                className="btn-ghost" 
                style={{ fontSize: '0.7rem', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}
                onClick={handleCopy}
                title="Copy code to clipboard"
                type="button"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </button>
            </div>
            <pre style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <code>{codeContent}</code>
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

  return (
    <div className="question-card glass-panel" id={`question-card-${question.id}`}>
      {/* Card Header Tag Badges */}
      <div className="card-header">
        <span className="topic-tag" id={`tag-${question.id}`}>
          {question.topic}
        </span>
        <span className={`difficulty-badge ${question.difficulty}`} id={`difficulty-${question.id}`}>
          {question.difficulty}
        </span>
      </div>

      {/* Card Body Question text */}
      <div className="card-body">
        <h3 className="question-text" id={`question-text-${question.id}`}>
          {question.question}
        </h3>

        {/* Confidence dot display */}
        <div className="confidence-indicator" id={`confidence-indicator-${question.id}`}>
          <span>Confidence Score:</span>
          <span className={`confidence-dot ${question.confidence}`}></span>
          <strong style={{ 
            color: question.confidence === 'High' 
              ? 'var(--high)' 
              : question.confidence === 'Medium' 
                ? 'var(--mid)' 
                : 'var(--low)'
          }}>
            {question.confidence}
          </strong>
        </div>

        {/* Controls and Expand trigger */}
        <div className="card-actions-row">
          {/* Quick inline confidence adjustment buttons */}
          <div className="confidence-selector" title="Quick adjust confidence level">
            {(['Low', 'Medium', 'High'] as Confidence[]).map((c) => (
              <button
                key={c}
                type="button"
                className={`confidence-btn ${question.confidence === c ? `active ${c}` : ''}`}
                onClick={() => onUpdateConfidence(question.id, c)}
                id={`btn-card-conf-${question.id}-${c.toLowerCase()}`}
              >
                {c.substring(0, 3)}
              </button>
            ))}
          </div>

          <div className="action-buttons">
            {/* Answer Expander Toggle */}
            <button
              className="toggle-drawer-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              id={`btn-card-expand-${question.id}`}
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? 'Hide Answer' : 'Reveal Answer'}</span>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
                style={{ 
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Edit Question button */}
            <button
              className="btn-ghost"
              onClick={() => onEdit(question)}
              title="Edit Question"
              id={`btn-card-edit-${question.id}`}
              style={{ borderRadius: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            {/* Delete Question button */}
            <button
              className="btn-ghost"
              onClick={() => onDelete(question.id)}
              title="Delete Question"
              id={`btn-card-delete-${question.id}`}
              style={{ borderRadius: '6px', color: 'rgba(239, 68, 68, 0.7)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Answer Collapsible Drawer */}
      <div 
        className={`answer-drawer ${isExpanded ? 'expanded' : ''}`}
        id={`drawer-answer-${question.id}`}
      >
        <div className="answer-inner">
          <div className="answer-title">Explanation & Code</div>
          <div className="answer-content">{renderFormattedAnswer(question.answer)}</div>
        </div>
      </div>
    </div>
  );
};
