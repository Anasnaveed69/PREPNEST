import React from 'react';

interface HomeIntroProps {
  onEnterVault: () => void;
  onEnterDrill: () => void;
  lowConfidenceCount: number;
}

export const HomeIntro: React.FC<HomeIntroProps> = ({
  onEnterVault,
  onEnterDrill,
  lowConfidenceCount,
}) => {
  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'fadeIn 0.4s ease-out' }}>

      {/* Spectacular Neobrutalist Hero Banner */}
      <div className="hero-banner">
        {/* Neon accent top border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to right, var(--primary), var(--secondary), var(--easy))'
          }}
        />

        {/* Modern logo lightning badge */}
        <div
          style={{
            background: 'var(--card-bg-elevated)',
            border: '2px solid var(--neo-border-color)',
            borderRadius: '12px',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '3px 3px 0px 0px var(--neo-border-color)',
            marginBottom: '0.5rem',
            transform: 'rotate(-3deg)'
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#hero-bolt-grad)" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="hero-bolt-grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="hero-heading">
          Conquer Engineering Interviews with PrepNest
        </h1>

        <p className="hero-subtext">
          An offline-first spaced repetition engine engineered for elite developers. Organize system design, algorithm, and coding blueprints and drill them with lightning keyboard shortcuts.
        </p>

        <div className="hero-cta-row">
          <button
            className="btn btn-primary"
            style={{
              padding: '0.875rem 2.25rem',
              fontSize: '1rem',
              borderRadius: '10px',
              border: '2px solid #ffffff',
              boxShadow: '4px 4px 0px 0px rgba(255,255,255,0.2)'
            }}
            onClick={onEnterVault}
          >
            Enter Questions Vault
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          {lowConfidenceCount > 0 && (
            <button
              className="btn"
              style={{
                padding: '0.875rem 2.25rem',
                fontSize: '1rem',
                borderRadius: '10px',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '2px solid var(--low)',
                color: '#fb7185',
                boxShadow: '4px 4px 0px 0px var(--low)'
              }}
              onClick={onEnterDrill}
            >
              Start Focus Drill ({lowConfidenceCount})
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Feature Columns Grid */}
      <div className="features-grid">

        {/* Core Pillar 1 */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              background: 'var(--card-bg-elevated)',
              border: '2px solid var(--neo-border-color)',
              borderRadius: '10px',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2.5px 2.5px 0 0 var(--neo-border-color)'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Vault Organizer</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Add, update, search, and categorize system design architectural notes, React hooks patterns, or algorithmic blueprints. Instantly sort by difficulty or current mastery confidence.
          </p>
        </div>

        {/* Core Pillar 2 */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              background: 'var(--card-bg-elevated)',
              border: '2px solid var(--neo-border-color)',
              borderRadius: '10px',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2.5px 2.5px 0 0 var(--neo-border-color)'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-hover)" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Lightning Drills</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Flip active flashcards in 3D to recall detailed answers and code syntax. Submitting feedback adapts cards dynamically inside our spaced repetition engine loop.
          </p>
        </div>

        {/* Core Pillar 3 */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              background: 'var(--card-bg-elevated)',
              border: '2px solid var(--neo-border-color)',
              borderRadius: '10px',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2.5px 2.5px 0 0 var(--neo-border-color)'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--easy)" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Offline Backups</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Securely save and retrieve JSON backups through OS-level native File Access APIs (`showSaveFilePicker`). Complete isolation ensures organization security systems never sandbox backups.
          </p>
        </div>

      </div>

    </div>
  );
};
