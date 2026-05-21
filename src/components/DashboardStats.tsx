import React from 'react';
import type { Question, FilterState, Difficulty, Confidence } from '../types';

interface DashboardStatsProps {
  questions: Question[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  questions,
  filters,
  onFilterChange,
}) => {
  // Collect unique topics
  const uniqueTopics = React.useMemo(() => {
    const topicsSet = new Set<string>();
    questions.forEach((q) => {
      if (q.topic.trim()) {
        topicsSet.add(q.topic.trim());
      }
    });
    return Array.from(topicsSet).sort();
  }, [questions]);

  // Compute metrics
  const stats = React.useMemo(() => {
    const total = questions.length;
    
    const difficultyBreakdown: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
    const confidenceBreakdown: Record<Confidence, number> = { Low: 0, Medium: 0, High: 0 };
    let weakTopicsCount = 0;

    questions.forEach((q) => {
      if (difficultyBreakdown[q.difficulty] !== undefined) {
        difficultyBreakdown[q.difficulty]++;
      }
      if (confidenceBreakdown[q.confidence] !== undefined) {
        confidenceBreakdown[q.confidence]++;
      }
      if (q.confidence === 'Low') {
        weakTopicsCount++;
      }
    });

    // Weighted Interview Readiness index
    // Easy weight: 1, Medium weight: 2, Hard weight: 3
    // Confidence score: High = 1.0, Medium = 0.5, Low = 0
    let totalPossibleWeight = 0;
    let earnedWeight = 0;

    questions.forEach((q) => {
      let qWeight = 1;
      if (q.difficulty === 'Medium') qWeight = 2;
      if (q.difficulty === 'Hard') qWeight = 3;

      let confScore = 0;
      if (q.confidence === 'Medium') confScore = 0.5;
      if (q.confidence === 'High') confScore = 1.0;

      totalPossibleWeight += qWeight;
      earnedWeight += confScore * qWeight;
    });

    const readinessScore = totalPossibleWeight > 0 
      ? Math.round((earnedWeight / totalPossibleWeight) * 100) 
      : 0;

    return {
      total,
      difficultyBreakdown,
      confidenceBreakdown,
      weakTopicsCount,
      readinessScore,
    };
  }, [questions]);

  // Quick stat filters
  const handleStatClick = (type: 'difficulty' | 'confidence' | 'total', value: string) => {
    if (type === 'total') {
      onFilterChange({
        ...filters,
        difficulty: 'All',
        confidence: 'All',
        topic: 'All',
      });
    } else if (type === 'difficulty') {
      onFilterChange({
        ...filters,
        difficulty: value as Difficulty,
      });
    } else if (type === 'confidence') {
      onFilterChange({
        ...filters,
        confidence: value as Confidence,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Stats Widgets Grid */}
      <div className="stats-grid">
        {/* Total stats */}
        <div className="stat-card glass-panel" onClick={() => handleStatClick('total', 'All')} id="stat-card-total">
          <div className="stat-label">Total Vault</div>
          <div className="stat-val">{stats.total}</div>
          <div className="stat-footer">
            <span>All topics combined</span>
          </div>
        </div>

        {/* Easy questions stats */}
        <div className="stat-card stat-easy glass-panel" onClick={() => handleStatClick('difficulty', 'Easy')} id="stat-card-easy">
          <div className="stat-label" style={{ color: 'var(--easy)' }}>Easy Topics</div>
          <div className="stat-val">{stats.difficultyBreakdown.Easy}</div>
          <div className="stat-footer">
            <span>High confidence: {questions.filter(q => q.difficulty === 'Easy' && q.confidence === 'High').length}</span>
          </div>
        </div>

        {/* Medium questions stats */}
        <div className="stat-card stat-medium glass-panel" onClick={() => handleStatClick('difficulty', 'Medium')} id="stat-card-medium">
          <div className="stat-label" style={{ color: 'var(--medium)' }}>Medium Topics</div>
          <div className="stat-val">{stats.difficultyBreakdown.Medium}</div>
          <div className="stat-footer">
            <span>High confidence: {questions.filter(q => q.difficulty === 'Medium' && q.confidence === 'High').length}</span>
          </div>
        </div>

        {/* Hard questions stats */}
        <div className="stat-card stat-hard glass-panel" onClick={() => handleStatClick('difficulty', 'Hard')} id="stat-card-hard">
          <div className="stat-label" style={{ color: 'var(--hard)' }}>Hard Topics</div>
          <div className="stat-val">{stats.difficultyBreakdown.Hard}</div>
          <div className="stat-footer">
            <span>High confidence: {questions.filter(q => q.difficulty === 'Hard' && q.confidence === 'High').length}</span>
          </div>
        </div>

        {/* Focus queue / Weak topics */}
        <div className="stat-card stat-weak glass-panel" onClick={() => handleStatClick('confidence', 'Low')} id="stat-card-weak">
          <div className="stat-label" style={{ color: 'var(--low)' }}>Weak Topics</div>
          <div className="stat-val">{stats.weakTopicsCount}</div>
          <div className="stat-footer">
            <span>Need immediate review</span>
          </div>
        </div>

        {/* Readiness Index Bar */}
        <div className="readiness-card glass-panel" id="stat-card-readiness">
          <div className="readiness-header">
            <div className="readiness-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-hover)" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Interview Readiness Index</span>
            </div>
            <div className="readiness-percentage">{stats.readinessScore}%</div>
          </div>
          <div className="readiness-bar-bg">
            <div 
              className="readiness-bar-fill" 
              style={{ width: `${stats.readinessScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="filter-bar glass-panel">
        {/* Text Search input */}
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search questions or answers..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            id="vault-search-input"
          />
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        {/* Options Selectors */}
        <div className="filter-selects">
          {/* Topic Select */}
          <div className="select-wrapper">
            <select
              className="select-control"
              value={filters.topic}
              onChange={(e) => onFilterChange({ ...filters, topic: e.target.value })}
              id="filter-select-topic"
            >
              <option value="All">All Topics</option>
              {uniqueTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {/* Difficulty Select */}
          <div className="select-wrapper">
            <select
              className="select-control"
              value={filters.difficulty}
              onChange={(e) => onFilterChange({ ...filters, difficulty: e.target.value as any })}
              id="filter-select-difficulty"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {/* Confidence Select */}
          <div className="select-wrapper">
            <select
              className="select-control"
              value={filters.confidence}
              onChange={(e) => onFilterChange({ ...filters, confidence: e.target.value as any })}
              id="filter-select-confidence"
            >
              <option value="All">All Confidences</option>
              <option value="Low">Low Confidence</option>
              <option value="Medium">Medium Confidence</option>
              <option value="High">High Confidence</option>
            </select>
            <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {/* Sort selection */}
          <div className="select-wrapper">
            <select
              className="select-control"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
              id="filter-select-sort"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="difficulty">Difficulty (H-E)</option>
              <option value="confidence">Confidence (L-H)</option>
            </select>
            <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
