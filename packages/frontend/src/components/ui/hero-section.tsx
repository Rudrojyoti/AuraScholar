import React, { useState } from 'react';
import AccretionDiskBackground from './AccretionDiskBackground';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<'abstract' | 'methodology' | 'breakthroughs'>('abstract');
  const [ingestInput, setIngestInput] = useState('');
  const [terminalPrompt, setTerminalPrompt] = useState('Identify experimental testing parameters proposed in Section 5...');

  const handleBenchmarkClick = (id: string) => {
    setIngestInput(id);
  };

  const handleIngestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGetStarted();
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGetStarted();
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md antialiased relative min-h-screen overflow-x-hidden selection:bg-primary selection:text-on-primary">
      {/* WebGL ACCRETION DISK SHADER BACKGROUND */}
      <AccretionDiskBackground />

      {/* FLOATING NAVIGATION BAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl rounded-full bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/30 shadow-[0_0_24px_-4px_rgba(56,189,248,0.15)] flex justify-between items-center px-6 py-3 z-50 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]">
        {/* Brand Anchor */}
        <div className="flex items-center gap-3">
          <div className="text-headline-sm font-headline-sm font-semibold tracking-wider text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">flare</span>
            <span className="tracking-tight">AuraScholar</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/40 border border-secondary/30 text-secondary text-[10px] font-label-sm tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            AI v2.5
          </span>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-7">
          <a className="text-primary font-medium border-b border-primary/50 text-label-md font-label-md hover:text-primary transition-colors duration-200" href="#platform">
            Platform
          </a>
          <a className="text-on-surface-variant font-normal text-label-md font-label-md hover:text-primary transition-colors duration-200" href="#workspace">
            Synthesis Engine
          </a>
          <a className="text-on-surface-variant font-normal text-label-md font-label-md hover:text-primary transition-colors duration-200" href="#platform">
            Constellations
          </a>
          <a className="text-on-surface-variant font-normal text-label-md font-label-md hover:text-primary transition-colors duration-200" href="#analysis">
            Observatory
          </a>
          <a className="text-on-surface-variant font-normal text-label-md font-label-md hover:text-primary transition-colors duration-200" href="#footer">
            Docs
          </a>
        </div>

        {/* Trailing Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onGetStarted}
            className="hidden sm:inline-block text-on-surface-variant hover:text-primary text-label-md font-label-md transition-colors duration-150 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="relative group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] active:scale-95 cursor-pointer"
          >
            <span>Launch Terminal</span>
            <span className="material-symbols-outlined text-sm transition-transform duration-200 group-hover:translate-x-0.5">
              arrow_forward
            </span>
          </button>
        </div>
      </nav>

      {/* MAIN CANVAS */}
      <main className="relative z-10 pt-36 md:pt-44 pb-20 overflow-hidden">
        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
          {/* Top Pulsating Pill Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-tier-1 text-primary-fixed-dim text-label-sm font-label-sm border border-primary/20 mb-8 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
            </span>
            <span>MULTI-MODEL ANALYSIS • SEMANTIC SEARCH</span>
          </div>

          {/* Monumental Headline */}
          <h1 className="font-headline-xl text-headline-xl max-w-4xl tracking-tight text-glow text-on-surface mb-6 sm:mb-8 text-3xl sm:text-5xl md:text-6xl font-semibold leading-tight">
            Decipher The Universe Of Scientific Literature
          </h1>

          {/* Atmospheric Subheadline */}
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-10 leading-relaxed text-base sm:text-lg">
            Turn dense research papers into clear summaries, extracted methodologies, and interactive AI-powered Q&A.
          </p>

          {/* Primary Hero CTA Cluster */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-16">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-[#030308] font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-2.5 shadow-[0_0_24px_rgba(56,189,248,0.35)] hover:shadow-[0_0_35px_rgba(56,189,248,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              <span>Initialize Analysis</span>
            </button>

            <a
              href="#workspace"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full glass-tier-1 text-on-surface hover:text-primary font-headline-sm text-headline-sm font-medium border border-outline-variant/40 hover:border-primary/50 flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">description</span>
              <span>Explore Demo Paper</span>
            </a>
          </div>

          {/* Live Metric Ticker Bar */}
          <div className="w-full max-w-4xl glass-tier-1 rounded-2xl p-4 sm:p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-left border border-white/5 shadow-2xl">
            <div className="flex flex-col border-r border-outline-variant/20 last:border-r-0 pl-2">
              <span className="font-headline-md text-headline-md text-primary font-bold text-2xl">50M+</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5 text-xs">
                Papers Synthesized
              </span>
              <span className="font-code-sm text-[10px] text-outline font-mono mt-1">LAT: 12.449 // VEC: 1536</span>
            </div>

            <div className="flex flex-col border-r border-outline-variant/20 last:border-r-0 pl-2">
              <span className="font-headline-md text-headline-md text-primary font-bold text-2xl">&lt; 1.2s</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5 text-xs">
                Retrieval Latency
              </span>
              <span className="font-code-sm text-[10px] text-outline font-mono mt-1">P99_BENCH: 0.89s</span>
            </div>

            <div className="flex flex-col border-r border-outline-variant/20 last:border-r-0 pl-2">
              <span className="font-headline-md text-headline-md text-primary font-bold text-2xl">100%</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5 text-xs">
                Citation Grounded
              </span>
              <span className="font-code-sm text-[10px] text-outline font-mono mt-1">CONF: STRICT_VERIFIED</span>
            </div>

            <div className="flex flex-col pl-2">
              <span className="font-headline-md text-headline-md text-tertiary font-bold text-2xl">Zero</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5 text-xs">
                Vector Hallucination
              </span>
              <span className="font-code-sm text-[10px] text-outline font-mono mt-1">POLICY: ZERO_RET_EPSILON</span>
            </div>
          </div>
        </section>

        {/* INTERACTIVE WORKSTATION PREVIEW (Hero Showcase) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24" id="workspace">
          <div className="text-center mb-6">
            <span className="font-label-sm text-label-sm text-outline tracking-widest uppercase text-xs">
              Autonomous Analytical Workspace
            </span>
          </div>

          {/* Glassmorphic Terminal Window */}
          <div className="glass-tier-2 rounded-2xl border border-white/15 shadow-[0_0_60px_rgba(56,189,248,0.15)] overflow-hidden">
            {/* Terminal Header Bar */}
            <div className="px-5 py-3 bg-surface-container-lowest/80 border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-primary/70" />
                <span className="ml-4 font-code-sm text-code-sm text-on-surface-variant flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">science</span>
                  Quantum_Gravity_Hydrodynamics.pdf (arXiv:2502.0911)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-code-sm bg-primary/10 border border-primary/30 text-primary">
                  SYNTHESIS ACTIVE
                </span>
                <span className="material-symbols-outlined text-outline text-[18px] cursor-pointer hover:text-on-surface">
                  more_horiz
                </span>
              </div>
            </div>

            {/* Split Analytical Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-outline-variant/30 min-h-[520px]">
              {/* LEFT PANE: Paper Excerpt with Mathematical Badges */}
              <div className="lg:col-span-5 p-6 bg-surface-container-lowest/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-label-sm text-label-sm text-primary tracking-wider uppercase font-semibold text-xs">
                      arXiv Source Document
                    </span>
                    <span className="text-xs text-outline font-code-sm">Page 4 of 28</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 font-medium text-lg">
                    4.2 Schwarzschild Acoustic Horizons in Degenerate Metric Flux
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4 text-xs sm:text-sm">
                    Assuming an irrotational barotropic fluid governed by continuous metric tensor variations, the effective acoustic spacetime generates apparent horizons conforming to:
                  </p>

                  {/* Math Equation Display Box */}
                  <div className="p-4 rounded-lg bg-surface-container-low/80 border border-outline-variant/40 font-code-sm text-code-sm text-primary-fixed-dim my-4 flex items-center justify-between">
                    <span className="font-mono text-xs sm:text-sm text-primary">ds² = (ρ / cₛ) [ - (cₛ² - v²) dt² - 2v·dr dt + dr² ]</span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] text-outline">Eq. 19</span>
                  </div>

                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed text-xs sm:text-sm">
                    The resultant radiation spectrum mirrors the semi-classical Hawking temperature vector where emission density relies strictly on surface gravity gradients{' '}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary-container/20 text-primary text-[11px] font-mono border border-primary/30 cursor-pointer hover:bg-primary/30 ml-1" title="Unruh 1981 Physical Review D">
                      [Ref 14]
                    </span>{' '}
                    and holographic horizon constraints{' '}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary-container/20 text-primary text-[11px] font-mono border border-primary/30 cursor-pointer hover:bg-primary/30 ml-1" title="Visser 1998 Classical Quantum Gravity">
                      [Ref 28]
                    </span>.
                  </p>
                </div>

                {/* Page Telemetry */}
                <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-outline text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                    SHA-256: 9b2d...f71c
                  </span>
                  <span className="font-code-sm text-[11px] text-primary">Vector Confidence: 99.8%</span>
                </div>
              </div>

              {/* RIGHT PANE: Real-time AI Synthesis & Dialog */}
              <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-surface-container-lowest/20">
                {/* Tabbed Breakdown Bar */}
                <div>
                  <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3 mb-6">
                    <button
                      onClick={() => setActiveTab('abstract')}
                      className={`px-3.5 py-1.5 rounded-full text-label-sm font-label-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
                        activeTab === 'abstract'
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">summarize</span>
                      Executive Abstract
                    </button>
                    <button
                      onClick={() => setActiveTab('methodology')}
                      className={`px-3.5 py-1.5 rounded-full text-label-sm font-label-sm transition-colors cursor-pointer text-xs ${
                        activeTab === 'methodology'
                          ? 'bg-primary/20 text-primary border border-primary/40 font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Methodology &amp; Architecture
                    </button>
                    <button
                      onClick={() => setActiveTab('breakthroughs')}
                      className={`px-3.5 py-1.5 rounded-full text-label-sm font-label-sm transition-colors cursor-pointer text-xs ${
                        activeTab === 'breakthroughs'
                          ? 'bg-primary/20 text-primary border border-primary/40 font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Key Breakthroughs
                    </button>
                  </div>

                  {/* Interactive Prompt & Multi-Model Inference Dialog */}
                  <div className="space-y-4">
                    {/* User Query */}
                    <div className="flex items-start gap-3 justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-none p-3.5 bg-secondary-container/30 border border-secondary/20 text-on-surface text-body-sm font-body-sm text-xs sm:text-sm">
                        <p className="text-primary font-medium text-[11px] mb-1">Researcher Query</p>
                        Compare theorem 4.2 against standard Schwarzschild metrics and check for mathematical divergence.
                      </div>
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-on-secondary shrink-0">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                      </div>
                    </div>

                    {/* Multi-LLM Consensus Output */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-surface-dim shrink-0">
                        <span className="material-symbols-outlined text-[16px] text-[#030308]">smart_toy</span>
                      </div>
                      <div className="max-w-[90%] rounded-2xl rounded-tl-none p-4 glass-tier-1 border border-primary/20 text-on-surface text-body-sm font-body-sm shadow-[0_0_15px_rgba(56,189,248,0.1)] text-xs sm:text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-primary font-semibold text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Consensus Engine (3 Frontier Models Validated)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono border border-primary/20">
                            Confidence: 99.4%
                          </span>
                        </div>

                        {activeTab === 'abstract' && (
                          <p className="text-on-surface leading-relaxed mb-3">
                            Theorem 4.2 strictly reproduces the kinematic aspects of Schwarzschild horizons without requiring general relativistic Einstein field equations. The acoustic metric divergence occurs at the sonic trans-critical point <span className="font-mono text-primary font-medium">v(r) = cₛ</span>.
                          </p>
                        )}
                        {activeTab === 'methodology' && (
                          <p className="text-on-surface leading-relaxed mb-3">
                            The tensor decomposition utilizes transonic Laval nozzle geometries mapped to 3+1 ADM Hamiltonian formulations. Hydrodynamic simulation confirms localized event boundary formation with zero singular mass density.
                          </p>
                        )}
                        {activeTab === 'breakthroughs' && (
                          <p className="text-on-surface leading-relaxed mb-3">
                            Laboratory analog black hole testing is viable using superfluid helium-4 and Bose-Einstein condensates. Acoustic phonons experience genuine analogue Hawking flux directly measurable via laser interferometry.
                          </p>
                        )}

                        {/* Exact Citation Cross-Checks */}
                        <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1.5 text-xs text-on-surface-variant">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <span className="material-symbols-outlined text-[14px]">verified</span>
                              Grounded on Page 4, Eq. 19 &amp; Ref 14
                            </span>
                            <span className="text-outline font-mono text-[10px]">Delta Latency: 0.82ms</span>
                          </div>
                          <span className="text-[11px] text-outline">Cross-referenced with 418 citations across astrophysics corpus.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* In-Terminal Prompt Input Box */}
                <form onSubmit={handleTerminalSubmit} className="mt-6 pt-4 border-t border-outline-variant/20">
                  <div className="relative flex items-center">
                    <input
                      className="w-full bg-surface-container-low/70 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-body-sm font-body-sm text-on-surface pr-28 focus:outline-none focus:border-primary/50 text-xs sm:text-sm"
                      type="text"
                      value={terminalPrompt}
                      onChange={(e) => setTerminalPrompt(e.target.value)}
                      placeholder="Ask the consensus engine..."
                    />
                    <button
                      type="submit"
                      className="absolute right-2 px-3 py-1 rounded-lg bg-primary-container text-on-primary-container text-label-sm font-label-sm font-medium flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all cursor-pointer text-xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">send</span>
                      Synthesize
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* LITERATURE INGESTION BAR */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-20" id="analysis">
          <form onSubmit={handleIngestSubmit} className="glass-tier-1 p-3 sm:p-4 rounded-2xl border border-primary/30 shadow-[0_0_30px_rgba(56,189,248,0.15)] flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center pl-3 text-primary">
              <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
            </div>
            <input
              className="w-full bg-transparent border-none text-body-md font-body-md text-on-surface placeholder:text-outline focus:ring-0 focus:outline-none text-sm sm:text-base"
              placeholder="Drop arXiv ID, DOI, or PDF URL to synthesize instant knowledge graph..."
              type="text"
              value={ingestInput}
              onChange={(e) => setIngestInput(e.target.value)}
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-md text-label-md font-semibold shrink-0 transition-colors cursor-pointer text-sm"
            >
              Synthesize Graph
            </button>
          </form>

          {/* Ingestion Sample Chips */}
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            <span className="text-xs text-outline font-label-sm">Try instant arXiv benchmarks:</span>
            <button
              type="button"
              onClick={() => handleBenchmarkClick('arXiv:2403.1018')}
              className="px-2.5 py-1 rounded-full bg-secondary-container/30 border border-secondary/30 text-secondary text-xs font-mono hover:border-primary transition-colors cursor-pointer"
            >
              arXiv:2403.1018 (Quantum ML)
            </button>
            <button
              type="button"
              onClick={() => handleBenchmarkClick('arXiv:2401.0742')}
              className="px-2.5 py-1 rounded-full bg-secondary-container/30 border border-secondary/30 text-secondary text-xs font-mono hover:border-primary transition-colors cursor-pointer"
            >
              arXiv:2401.0742 (Astrophysics)
            </button>
            <button
              type="button"
              onClick={() => handleBenchmarkClick('arXiv:2311.1823')}
              className="px-2.5 py-1 rounded-full bg-secondary-container/30 border border-secondary/30 text-secondary text-xs font-mono hover:border-primary transition-colors cursor-pointer"
            >
              arXiv:2311.1823 (Biophysics)
            </button>
          </div>
        </section>

        {/* FEATURE CONSTELLATION (3 CORE PILLARS GRID) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-32" id="platform">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-semibold text-xs">
              Architectural Capabilities
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-2 mb-4 text-2xl sm:text-3xl font-semibold">
              Built for Accuracy, Verification & Research Privacy
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm sm:text-base leading-relaxed">
              Standard LLMs hallucinate citations and misread equations. AuraScholar uses multiple AI models to cross-check findings and flag inconsistencies.
            </p>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Gravitational Vector Search */}
            <div className="group glass-tier-1 p-8 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[26px]">travel_explore</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-code-sm text-[11px] text-primary uppercase tracking-wider font-semibold">
                    Pillar 01 // Retrieval
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3 font-semibold text-xl">
                  Gravitational Vector Search
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-6 text-sm">
                  Deep semantic search combining dense embeddings with sparse BM25 indexing across arXiv, bioRxiv, and IEEE Xplore. Finds conceptually related passages even when exact keywords don't match.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="font-mono text-xs text-outline">SEMANTIC SEARCH ACTIVE</span>
                <span className="material-symbols-outlined text-primary text-[18px]">hub</span>
              </div>
            </div>

            {/* Feature 2: Multi-LLM Synthesis */}
            <div className="group glass-tier-1 p-8 rounded-2xl border border-primary/30 bg-surface-container-lowest/80 hover:border-primary/70 transition-all duration-300 hover:shadow-[0_0_35px_rgba(56,189,248,0.25)] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-secondary-container/40 border border-secondary/40 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[26px]">mediation</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-code-sm text-[11px] text-secondary uppercase tracking-wider font-semibold">
                    Pillar 02 // Verification
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3 font-semibold text-xl">
                  Multi-LLM Synthesis
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-6 text-sm">
                  Multiple AI models analyze in parallel. Each model checks equations, verifies derivations, and flags where sources disagree — before surfacing results.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="font-mono text-xs text-secondary">MODELS: 3 ACTIVE</span>
                <span className="material-symbols-outlined text-secondary text-[18px]">schema</span>
              </div>
            </div>

            {/* Feature 3: Sovereign Research Privacy */}
            <div className="group glass-tier-1 p-8 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[26px]">shield</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-code-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
                    Pillar 03 // Sovereignty
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3 font-semibold text-xl">
                  Sovereign Research Privacy
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-6 text-sm">
                  Academic-grade cryptographic isolation with client-held vector keys. Zero data retention policies prevent your proprietary unpublished pre-prints or experimental datasets from training model weights.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="font-mono text-xs text-outline">DATA RETENTION: NONE</span>
                <span className="material-symbols-outlined text-on-surface text-[18px]">lock</span>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-32 text-center">
          <div className="glass-tier-2 p-10 sm:p-14 rounded-3xl border border-primary/40 relative overflow-hidden shadow-[0_0_60px_rgba(56,189,248,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent pointer-events-none" />
            <h2 className="font-headline-xl text-headline-xl text-on-surface mb-4 text-3xl sm:text-4xl font-semibold">
              Start Analysing Papers
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto mb-8 text-base sm:text-lg">
              Join researchers and academics using AuraScholar to work through scientific literature faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-3.5 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm font-semibold hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all cursor-pointer"
              >
                Get Started Free
              </button>
              <a
                href="#workspace"
                className="px-6 py-3.5 rounded-full glass-tier-1 text-on-surface hover:text-primary font-headline-sm text-headline-sm font-medium border border-outline-variant transition-colors cursor-pointer"
              >
                View Documentation
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* INSTITUTIONAL FOOTER */}
      <footer id="footer" className="w-full bg-surface-container-lowest border-t border-outline-variant/20 relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 py-16 flex flex-col gap-8">
          {/* Top Row: Brand & Observatory Telemetry Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <span className="text-headline-sm font-headline-sm font-semibold tracking-wider text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">flare</span>
                AuraScholar
              </span>
              <span className="text-outline text-body-sm font-body-sm hidden sm:inline text-xs">
                | Deep Research Systems
              </span>
            </div>

            {/* Live System Status Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-on-surface font-mono">Observatory Systems Operational</span>
              <span className="text-outline font-mono pl-2 border-l border-outline-variant/30">PING: 14ms</span>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-xs">
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-150" href="#analysis">
              arXiv Integration
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-150" href="#workspace">
              Vector Observability
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-150" href="#platform">
              Security Protocols
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-150" href="#workspace">
              Telemetry Status
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-150" href="#">
              Terms of Analysis
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-150" href="#">
              Privacy Policy
            </a>
          </div>

          {/* Bottom Row: Copyright & Verification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 text-outline font-body-sm text-body-sm text-xs">
            <p>© 2025 AuraScholar Deep Research Labs. All astrophysical vectors and telemetry verified.</p>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span>PROTO: ED25519-SIG</span>
              <span>CITATIONS: IEEE / CROSSREF</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HeroSection;
