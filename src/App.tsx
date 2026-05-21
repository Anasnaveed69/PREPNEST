import React from 'react';
import type { Question, FilterState, Difficulty, Confidence, ToastMessage, ToastType } from './types';
import { loadQuestions, saveQuestions, exportBackup, validateAndImportBackup } from './utils/storage';
import { DashboardStats } from './components/DashboardStats';
import { QuestionCard } from './components/QuestionCard';
import { AddEditModal } from './components/AddEditModal';
import { Toast } from './components/Toast';
import { WeakTopicsReview } from './components/WeakTopicsReview';
import { HomeIntro } from './components/HomeIntro';

export default function App() {
  // Core state
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentTab, setCurrentTab] = React.useState<'home' | 'vault' | 'review'>('home');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<Question | null>(null);
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('prepnest_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Apply theme to HTML data-theme attribute
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('prepnest_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load questions on mount
  React.useEffect(() => {
    const loaded = loadQuestions();
    setQuestions(loaded);
  }, []);

  // Filter state
  const [filters, setFilters] = React.useState<FilterState>({
    searchQuery: '',
    topic: 'All',
    difficulty: 'All',
    confidence: 'All',
    sortBy: 'newest',
  });

  // Helper to add toast messages
  const addToast = React.useCallback((text: string, type: ToastType = 'success') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // CRUD handlers
  const handleSaveQuestion = (qData: {
    question: string;
    answer: string;
    topic: string;
    difficulty: Difficulty;
    confidence: Confidence;
  }) => {
    let updatedList: Question[] = [];

    if (editingQuestion) {
      // Edit operation
      updatedList = questions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              ...qData,
              updatedAt: new Date().toISOString(),
            }
          : q
      );
      addToast(`Updated question: "${qData.question.substring(0, 30)}..."`, 'success');
    } else {
      // Create operation
      const newQuestion: Question = {
        id: 'q-' + Math.random().toString(36).substring(2, 9),
        ...qData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedList = [newQuestion, ...questions];
      addToast(`Added new question: "${qData.question.substring(0, 30)}..."`, 'success');
    }

    setQuestions(updatedList);
    saveQuestions(updatedList);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    const targetQ = questions.find((q) => q.id === id);
    if (!targetQ) return;

    if (window.confirm(`Are you sure you want to delete the question: "${targetQ.question.substring(0, 40)}..."?`)) {
      const updatedList = questions.filter((q) => q.id !== id);
      setQuestions(updatedList);
      saveQuestions(updatedList);
      addToast('Deleted interview question from vault', 'warning');
    }
  };

  const handleUpdateConfidence = (id: string, newConfidence: Confidence) => {
    const updatedList = questions.map((q) =>
      q.id === id
        ? {
            ...q,
            confidence: newConfidence,
            updatedAt: new Date().toISOString(),
          }
        : q
    );
    setQuestions(updatedList);
    saveQuestions(updatedList);
    addToast(`Confidence updated to ${newConfidence}`, 'info');
  };

  const handleEditClick = (q: Question) => {
    setEditingQuestion(q);
    setIsAddModalOpen(true);
  };

  // Import / Export backup triggers
  const handleExportBackup = async () => {
    try {
      await exportBackup(questions);
      addToast('Vault backup JSON file downloaded successfully!', 'success');
    } catch (e) {
      addToast('Backup download failed.', 'error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = validateAndImportBackup(text);
        
        // Merge or overwrite. Let's merge unique IDs or just overwrite to restore exact state.
        if (window.confirm(`Successfully parsed ${imported.length} questions. Do you want to restore them, overwriting your current vault?`)) {
          setQuestions(imported);
          saveQuestions(imported);
          addToast(`Restored backup with ${imported.length} questions successfully!`, 'success');
        }
      } catch (err: any) {
        addToast(`Import failed: ${err.message || 'Corrupt JSON data'}`, 'error');
      }
    };
    reader.readAsText(file);
    
    // Clear input
    e.target.value = '';
  };

  // Perform multi-criteria filter and sorting logic
  const filteredQuestions = React.useMemo(() => {
    let result = [...questions];

    // Search query
    if (filters.searchQuery.trim()) {
      const qLower = filters.searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.question.toLowerCase().includes(qLower) ||
          q.answer.toLowerCase().includes(qLower) ||
          q.topic.toLowerCase().includes(qLower)
      );
    }

    // Topic tag filter
    if (filters.topic !== 'All') {
      result = result.filter((q) => q.topic.trim() === filters.topic.trim());
    }

    // Difficulty filter
    if (filters.difficulty !== 'All') {
      result = result.filter((q) => q.difficulty === filters.difficulty);
    }

    // Confidence filter
    if (filters.confidence !== 'All') {
      result = result.filter((q) => q.confidence === filters.confidence);
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (filters.sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (filters.sortBy === 'difficulty') {
        const diffWeight = { Easy: 1, Medium: 2, Hard: 3 };
        return diffWeight[b.difficulty] - diffWeight[a.difficulty]; // Hardest first
      }
      if (filters.sortBy === 'confidence') {
        const confWeight = { Low: 1, Medium: 2, High: 3 };
        return confWeight[a.confidence] - confWeight[b.confidence]; // Weakest first
      }
      return 0;
    });

    return result;
  }, [questions, filters]);

  return (
    <div className="app-container">
      {/* Dynamic Toast system */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Hidden file input for imports */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleImportFileChange}
        id="import-backup-file-input"
      />

      {/* Professional Glassmorphic Header */}
      <header className="app-header glass-panel">
        <div className="logo-section">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="lightning-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <path 
                d="M17 2H7L5 12h5l-3 10 12-11h-5z" 
                fill="url(#lightning-logo-grad)" 
              />
            </svg>
          </div>
          <div className="logo-text">
            <h1>PrepNest</h1>
            <p>Persistent Interview Prep Vault</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="view-tabs">
          <button
            className={`tab-btn ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentTab('home')}
            id="tab-view-home"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </button>
          <button
            className={`tab-btn ${currentTab === 'vault' ? 'active' : ''}`}
            onClick={() => setCurrentTab('vault')}
            id="tab-view-dashboard"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </button>
          <button
            className={`tab-btn ${currentTab === 'review' ? 'active' : ''}`}
            onClick={() => setCurrentTab('review')}
            id="tab-view-review"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Focus Drill ({questions.filter((q) => q.confidence === 'Low').length})
          </button>
        </div>

        {/* Backup and Add Utilities */}
        <div className="header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            id="btn-theme-toggle"
            style={{
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px'
            }}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.4s ease' }}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-15deg)', transition: 'transform 0.4s ease' }}>
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
          <button className="btn btn-secondary" onClick={handleImportClick} title="Restore from backup JSON file" id="btn-import-backup">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import
          </button>
          <button className="btn btn-secondary" onClick={handleExportBackup} title="Export entire vault as JSON" id="btn-export-backup">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingQuestion(null);
              setIsAddModalOpen(true);
            }}
            id="btn-add-question"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Question
          </button>
        </div>
      </header>

      {/* Main Content routing */}
      <main style={{ minHeight: '65vh' }} id="app-main-content">
        {currentTab === 'home' ? (
          <HomeIntro
            onEnterVault={() => setCurrentTab('vault')}
            onEnterDrill={() => setCurrentTab('review')}
            lowConfidenceCount={questions.filter((q) => q.confidence === 'Low').length}
          />
        ) : currentTab === 'vault' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Dashboard metrics and Search panels */}
            <DashboardStats
              questions={questions}
              filters={filters}
              onFilterChange={setFilters}
            />

            {/* Questions Vault Cards Grid */}
            {filteredQuestions.length > 0 ? (
              <div className="questions-grid" id="vault-questions-grid">
                {filteredQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteQuestion}
                    onUpdateConfidence={handleUpdateConfidence}
                    onCopySuccess={() => addToast('Code snippet copied to clipboard!', 'info')}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state-card glass-panel" style={{ padding: '4rem 2rem' }} id="vault-empty-state">
                <div className="empty-state-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3>No Matching Vault Items</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '350px', fontSize: '0.9375rem' }}>
                  We couldn't find any questions that match your current search terms or selected tag filters.
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setFilters({
                      searchQuery: '',
                      topic: 'All',
                      difficulty: 'All',
                      confidence: 'All',
                      sortBy: 'newest',
                    })
                  }
                  style={{ marginTop: '0.5rem' }}
                  id="btn-reset-filters"
                >
                  Reset Active Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Focus Drill Interactive Session */
          <WeakTopicsReview
            questions={questions}
            onUpdateConfidence={handleUpdateConfidence}
          />
        )}
      </main>

      {/* Footer System Credits */}
      <footer 
        style={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
          paddingTop: '1.5rem', 
          marginTop: '2rem', 
          textAlign: 'center', 
          fontSize: '0.8125rem', 
          color: 'var(--text-muted)' 
        }}
        id="app-footer-bar"
      >
        <span>PrepNest Vault Engine © 2026 — Local Storage Sandbox Active</span>
      </footer>

      {/* CRUD dialog popup */}
      <AddEditModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        editingQuestion={editingQuestion}
      />
    </div>
  );
}
