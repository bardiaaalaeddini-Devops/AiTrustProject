import Link from "next/link";

interface WelcomeCardProps {
  /** The next-page URL contains the IDs until a consent/session API exists. */
  consentHref: string;
  /** Only local development can use the participant-free demo mode. */
  isDemo: boolean;
}

/**
 * The first screen seen by a participant after following the Prolific link.
 *
 * Research safeguards:
 * - Do not reveal the study's hypotheses about trust or reliance.
 * - Do not display ground truth, model outputs, or uncertainty conditions.
 * - Do not collect answers or store participant IDs on this screen.
 * - The Continue link goes to informed consent, not directly to trials.
 */
export function WelcomeCard({ consentHref, isDemo }: WelcomeCardProps) {
  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="brand-lockup" aria-label="AI Quality Inspection Study">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <circle cx="12" cy="12" r="3.4" />
              <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" />
            </svg>
          </div>
          <span>AI Quality Inspection</span>
        </div>
        <span className="research-label">RESEARCH STUDY</span>
      </header>

      {isDemo && (
        <div className="demo-banner" role="status">
          <span className="demo-dot" aria-hidden="true" />
          Development preview — no Prolific participant is connected.
        </div>
      )}

      <section className="hero" aria-labelledby="welcome-title">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> HUMAN + AI DECISION-MAKING</div>
          <h1 id="welcome-title">Welcome to the <span>Quality Inspection Study.</span></h1>
          <p className="intro-text">
            In this research study, you will inspect images of manufactured items,
            make quality decisions, and review assistance from an AI system.
          </p>
          <p className="support-text">
            No specialist knowledge is required. You will receive instructions
            and a short practice before the main task.
          </p>

          <div className="facts" aria-label="Study overview">
            <div className="fact">
              <span className="fact-icon" aria-hidden="true">▦</span>
              <span><strong>12 inspection rounds</strong><small>After a short practice</small></span>
            </div>
            <div className="fact">
              <span className="fact-icon" aria-hidden="true">◎</span>
              <span><strong>Individual decisions</strong><small>With AI assistance</small></span>
            </div>
          </div>

          <Link className="start-link" href={consentHref}>
            Continue to consent <span aria-hidden="true">→</span>
          </Link>
          <p className="privacy-note">
            Participation is voluntary. You will review the study information
            before choosing whether to take part.
          </p>
        </div>

        <aside className="visual-column" aria-label="Illustration of the inspection interface">
          <div className="visual-glow" aria-hidden="true" />
          <div className="preview-card">
            <div className="preview-topbar">
              <span className="preview-dots" aria-hidden="true"><i /><i /><i /></span>
              <span>INTERFACE PREVIEW</span>
              <span className="preview-step">01 / 12</span>
            </div>
            <div className="preview-body">
              <div className="preview-label-row"><strong>Visual inspection</strong><span>Sample interface</span></div>
              <div className="sample-image" aria-hidden="true">
                <svg viewBox="0 0 360 225" role="presentation">
                  <defs>
                    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#edf1f5" />
                      <stop offset="100%" stopColor="#d7dfe9" />
                    </linearGradient>
                    <linearGradient id="part" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#aab7c6" />
                    </linearGradient>
                  </defs>
                  <rect width="360" height="225" rx="12" fill="url(#bg)" />
                  <g stroke="#c4cdd9" opacity="0.65" strokeWidth="1">
                    <path d="M0 42H360M0 86H360M0 130H360M0 174H360M36 0V225M108 0V225M180 0V225M252 0V225M324 0V225" />
                  </g>
                  <ellipse cx="180" cy="177" rx="100" ry="15" fill="#a2afbf" opacity="0.22" />
                  <rect x="111" y="44" width="138" height="133" rx="22" fill="url(#part)" stroke="#94a2b3" strokeWidth="2.5" />
                  <rect x="133" y="66" width="94" height="88" rx="13" fill="#e7edf4" stroke="#a3b0bf" strokeWidth="2" />
                  <circle cx="180" cy="110" r="28" fill="#c7d2de" stroke="#7c8a9b" strokeWidth="3" />
                  <circle cx="180" cy="110" r="13" fill="#eaf0f6" stroke="#8e9bab" strokeWidth="2" />
                  <circle cx="124" cy="58" r="4" fill="#7f8b9a" /><circle cx="236" cy="58" r="4" fill="#7f8b9a" />
                  <circle cx="124" cy="163" r="4" fill="#7f8b9a" /><circle cx="236" cy="163" r="4" fill="#7f8b9a" />
                </svg>
              </div>
              <span className="preview-question">Is this item normal or anomalous?</span>
              <div className="preview-options" aria-hidden="true">
                <span>Normal</span><span>Anomalous</span>
              </div>
              <div className="preview-caption">Illustration only — not a real study image</div>
            </div>
          </div>
          <div className="floating-tag"><span className="floating-pulse" /> Human decision first</div>
        </aside>
      </section>

      <footer className="footer">
        <span>Academic research prototype</span>
        <span>Designed for desktop and laptop use</span>
      </footer>
    </main>
  );
}
