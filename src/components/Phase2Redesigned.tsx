'use client';

import React, { useState } from 'react';
import {
  Play,
  Upload,
  CheckCircle,
  BookOpen,
  Users,
  Zap,
  Moon,
  Sun,
  Menu,
  X,
  Download,
} from 'lucide-react';

export default function Phase2Redesigned() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const isDark = theme === 'dark';

  // CSS-in-JS for comprehensive theming
  const styles = `
    :root {
      /* Light mode defaults */
      --color-primary: #3434FF;
      --color-primary-hover: #2525E6;
      --color-primary-light: #F0F0FF;

      --color-accent: #10B981;
      --color-accent-light: #D1FAE5;

      --color-text-primary: #0F172A;
      --color-text-secondary: #475569;
      --color-text-muted: #64748B;

      --color-bg-primary: #FFFFFF;
      --color-bg-secondary: #F8FAFC;
      --color-bg-tertiary: #F1F5F9;

      --color-border: #E2E8F0;
      --color-border-light: #CBD5E1;

      --color-shadow: rgba(15, 23, 42, 0.08);
      --color-shadow-md: rgba(15, 23, 42, 0.12);

      --color-success: #10B981;
      --color-warning: #F59E0B;
      --color-error: #EF4444;

      /* Typography */
      --font-display: 'Sora', system-ui, sans-serif;
      --font-body: 'Inter', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      /* Spacing */
      --space-xs: 0.25rem;
      --space-sm: 0.5rem;
      --space-md: 1rem;
      --space-lg: 1.5rem;
      --space-xl: 2rem;
      --space-2xl: 3rem;
      --space-3xl: 4rem;

      /* Border radius */
      --radius-sm: 0.375rem;
      --radius-md: 0.5rem;
      --radius-lg: 1rem;
      --radius-xl: 1.5rem;
      --radius-2xl: 2rem;
    }

    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        --color-primary: #6366F1;
        --color-primary-hover: #818CF8;
        --color-primary-light: #1E1B4B;

        --color-accent: #84CC16;
        --color-accent-light: #365314;

        --color-text-primary: #F1F5F9;
        --color-text-secondary: #CBD5E1;
        --color-text-muted: #94A3B8;

        --color-bg-primary: #020617;
        --color-bg-secondary: #1E293B;
        --color-bg-tertiary: #334155;

        --color-border: #334155;
        --color-border-light: #475569;

        --color-shadow: rgba(0, 0, 0, 0.3);
        --color-shadow-md: rgba(0, 0, 0, 0.4);
      }
    }

    [data-theme="dark"] {
      --color-primary: #6366F1;
      --color-primary-hover: #818CF8;
      --color-primary-light: #1E1B4B;

      --color-accent: #84CC16;
      --color-accent-light: #365314;

      --color-text-primary: #F1F5F9;
      --color-text-secondary: #CBD5E1;
      --color-text-muted: #94A3B8;

      --color-bg-primary: #020617;
      --color-bg-secondary: #1E293B;
      --color-bg-tertiary: #334155;

      --color-border: #334155;
      --color-border-light: #475569;

      --color-shadow: rgba(0, 0, 0, 0.3);
      --color-shadow-md: rgba(0, 0, 0, 0.4);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: var(--font-body);
      color: var(--color-text-primary);
      background: var(--color-bg-primary);
      line-height: 1.6;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-display);
      font-weight: 600;
      line-height: 1.2;
      letter-spacing: -0.01em;
    }

    h1 {
      font-size: 3rem;
      font-weight: 700;
    }

    h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-top: var(--space-2xl);
      margin-bottom: var(--space-lg);
    }

    h3 {
      font-size: 1.5rem;
      font-weight: 600;
    }

    p {
      margin-bottom: var(--space-md);
      color: var(--color-text-secondary);
      max-width: 65ch;
    }

    /* Utilities */
    .gradient-text {
      background: linear-gradient(135deg, var(--color-primary) 0%, #6366F1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .card {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-lg);
      transition: all 0.3s ease;
      box-shadow: 0 1px 3px var(--color-shadow);
    }

    .card:hover {
      box-shadow: 0 10px 25px var(--color-shadow-md);
      transform: translateY(-2px);
    }

    .glass {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    [data-theme="dark"] .glass {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.1);
    }

    .button {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md) var(--space-lg);
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-lg);
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .button:hover {
      background: var(--color-primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(52, 52, 255, 0.3);
    }

    .button:active {
      transform: translateY(0);
    }

    .button-secondary {
      background: var(--color-bg-secondary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .button-secondary:hover {
      background: var(--color-bg-tertiary);
      box-shadow: none;
    }

    .badge {
      display: inline-block;
      padding: var(--space-xs) var(--space-sm);
      background: var(--color-primary-light);
      color: var(--color-primary);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
    }

    [data-theme="dark"] .badge {
      background: rgba(99, 102, 241, 0.2);
      color: #A5B4FC;
    }
  `;

  return (
    <div data-theme={theme} style={{ minHeight: '100vh' }}>
      <style>{styles}</style>

      {/* Navigation */}
      <nav
        style={{
          background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid var(--color-border)`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: 'var(--space-md) var(--space-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <BookOpen size={32} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Learn+</h1>
              <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--color-text-muted)' }}>
                Phase 2
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-lg)',
              alignItems: 'center',
              '@media (max-width: 768px)': {
                display: 'none',
              },
            }}
          >
            {['Courses', 'Progress', 'Community', 'Settings'].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  paddingBottom: '4px',
                  borderBottom: item === 'Courses' ? '2px solid var(--color-primary)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (item !== 'Courses') {
                    (e.target as HTMLElement).style.color = 'var(--color-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (item !== 'Courses') {
                    (e.target as HTMLElement).style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-sm)',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget).style.background = 'var(--color-bg-secondary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget).style.background = 'none';
              }}
              title="Toggle theme"
            >
              {isDark ? (
                <Sun size={20} style={{ color: 'var(--color-accent)' }} />
              ) : (
                <Moon size={20} style={{ color: 'var(--color-primary)' }} />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'none',
                '@media (max-width: 768px)': {
                  display: 'flex',
                },
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          background:
            theme === 'dark'
              ? 'linear-gradient(135deg, #020617 0%, #1E293B 50%, #0F172A 100%)'
              : 'linear-gradient(135deg, #FFFFFF 0%, #F0F0FF 50%, #E0E0FF 100%)',
          padding: 'var(--space-3xl) var(--space-lg)',
          textAlign: 'center',
          borderBottom: `1px solid var(--color-border)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            right: '-200px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52, 52, 255, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <span className="badge">NEW</span>
          </div>
          <h1 style={{ marginBottom: 'var(--space-lg)' }}>
            <span className="gradient-text">Learn at your pace</span>
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-2xl)',
              maxWidth: '100%',
            }}
          >
            Upload courses, track progress, and build your learning community with our premium
            platform.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
            <button className="button">Get Started</button>
            <button className="button button-secondary">Learn More</button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-3xl) var(--space-lg)' }}>
        {/* Stats Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-lg)',
            marginBottom: 'var(--space-3xl)',
          }}
        >
          {[
            { icon: BookOpen, label: 'Courses', value: '24', color: 'var(--color-primary)' },
            { icon: Users, label: 'Learners', value: '1,240', color: 'var(--color-accent)' },
            { icon: CheckCircle, label: 'Completions', value: '890', color: '#10B981' },
            { icon: Zap, label: 'Hours', value: '2,340', color: '#F59E0B' },
          ].map((stat, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <stat.icon
                size={32}
                style={{
                  margin: '0 auto var(--space-md)',
                  color: stat.color,
                }}
              />
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
                {stat.label}
              </p>
              <h3 style={{ margin: 0, fontSize: '2rem' }}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Upload Section */}
        <section style={{ marginBottom: 'var(--space-3xl)' }}>
          <h2>Upload a New Course</h2>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {!uploadComplete ? (
              <div>
                {/* Upload Area */}
                <div
                  style={{
                    padding: 'var(--space-3xl) var(--space-lg)',
                    textAlign: 'center',
                    background:
                      isDark &&
                      'radial-gradient(circle at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
                    borderBottom: `1px dashed var(--color-border)`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDark) {
                      (e.currentTarget).style.background = 'rgba(52, 52, 255, 0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isDark) {
                      (e.currentTarget).style.background =
                        'radial-gradient(circle at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%)';
                    } else {
                      (e.currentTarget).style.background = '';
                    }
                  }}
                >
                  <Upload
                    size={48}
                    style={{
                      margin: '0 auto var(--space-md)',
                      color: 'var(--color-primary)',
                      opacity: 0.7,
                    }}
                  />
                  <h3 style={{ marginTop: 0 }}>Drag and drop your course files</h3>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    or click to browse. Support for ZIP, MP4, PDF, and more.
                  </p>
                </div>

                {/* File Form */}
                <div style={{ padding: 'var(--space-lg)' }}>
                  <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 'var(--space-sm)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      Course Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Introduction to React"
                      style={{
                        width: '100%',
                        padding: 'var(--space-md)',
                        border: `1px solid var(--color-border)`,
                        borderRadius: 'var(--radius-lg)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '1rem',
                        color: 'var(--color-text-primary)',
                        background: 'var(--color-bg-primary)',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.boxShadow =
                          '0 0 0 3px var(--color-primary-light)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <button
                    className="button"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      let progress = 0;
                      const interval = setInterval(() => {
                        progress += Math.random() * 30;
                        if (progress >= 100) {
                          progress = 100;
                          clearInterval(interval);
                          setUploadProgress(100);
                          setTimeout(() => setUploadComplete(true), 500);
                        } else {
                          setUploadProgress(progress);
                        }
                      }, 300);
                    }}
                  >
                    Upload Course
                  </button>
                </div>

                {/* Progress Bar */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div style={{ padding: 'var(--space-lg)', paddingTop: 0 }}>
                    <div
                      style={{
                        height: '8px',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: `linear-gradient(90deg, var(--color-primary) 0%, #6366F1 100%)`,
                          width: `${uploadProgress}%`,
                          transition: 'width 0.3s ease',
                          borderRadius: 'var(--radius-md)',
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)',
                        marginTop: 'var(--space-sm)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Success State */
              <div
                style={{
                  padding: 'var(--space-3xl) var(--space-lg)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto var(--space-lg)',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, var(--color-accent) 0%, #059669 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'scale-in 0.4s ease-out',
                  }}
                >
                  <CheckCircle size={48} style={{ color: 'white' }} />
                </div>
                <h3 style={{ marginTop: 0 }}>Course Uploaded Successfully!</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Your course is now live and ready for learners to enroll.
                </p>

                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                  <button className="button">View Course</button>
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setUploadProgress(0);
                      setUploadComplete(false);
                    }}
                  >
                    Upload Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Course Overview */}
        <section>
          <h2>React Essentials Course</h2>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-lg)',
              borderBottom: `1px solid var(--color-border)`,
              marginBottom: 'var(--space-2xl)',
              overflowX: 'auto',
            }}
          >
            {['overview', 'lessons', 'progress', 'discussion'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-md) 0',
                  paddingBottom: 'var(--space-md)',
                  borderBottom:
                    activeTab === tab ? '2px solid var(--color-primary)' : 'none',
                  color:
                    activeTab === tab
                      ? 'var(--color-primary)'
                      : 'var(--color-text-secondary)',
                  fontWeight: activeTab === tab ? 600 : 500,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    (e.currentTarget).style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    (e.currentTarget).style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: 'var(--space-lg)',
              '@media (max-width: 1024px)': {
                gridTemplateColumns: '1fr',
              },
            }}
          >
            {/* Main Content */}
            <div>
              {activeTab === 'overview' && (
                <div>
                  <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div
                      style={{
                        width: '100%',
                        height: '300px',
                        borderRadius: 'var(--radius-lg)',
                        background: `linear-gradient(135deg, var(--color-primary) 0%, #6366F1 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        marginBottom: 'var(--space-lg)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget).style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget).style.transform = 'scale(1)';
                      }}
                    >
                      <Play size={64} fill="currentColor" />
                    </div>

                    <h3 style={{ marginTop: 0 }}>Welcome to React</h3>
                    <p>
                      Learn the fundamentals of React, including components, hooks, and state
                      management. This comprehensive course covers everything you need to build
                      modern web applications.
                    </p>

                    <div style={{ marginTop: 'var(--space-lg)' }}>
                      <h4 style={{ marginBottom: 'var(--space-md)' }}>What you'll learn</h4>
                      <ul
                        style={{
                          listStyle: 'none',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 'var(--space-md)',
                        }}
                      >
                        {[
                          'Component Basics',
                          'Hooks & State',
                          'Performance',
                          'Testing',
                          'Deployment',
                          'Best Practices',
                        ].map((item, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircle
                              size={18}
                              style={{
                                marginRight: 'var(--space-sm)',
                                color: 'var(--color-accent)',
                              }}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'lessons' && (
                <div>
                  {[1, 2, 3].map((lesson) => (
                    <div
                      key={lesson}
                      className="card"
                      style={{ marginBottom: 'var(--space-lg)', cursor: 'pointer' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '40px',
                              height: '40px',
                              borderRadius: 'var(--radius-lg)',
                              background: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                              fontWeight: 700,
                              marginBottom: 'var(--space-sm)',
                            }}
                          >
                            {lesson}
                          </div>
                          <h4 style={{ margin: 0, marginBottom: 'var(--space-sm)' }}>
                            Lesson {lesson}: Component Basics
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.875rem' }}>
                            45 min • 3,240 learners • 4.8 ★
                          </p>
                        </div>
                        <Play
                          size={24}
                          style={{
                            color: 'var(--color-primary)',
                            opacity: 0.6,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'progress' && (
                <div>
                  <div className="card">
                    <h3 style={{ marginTop: 0 }}>Your Progress</h3>

                    {[
                      { label: 'Lessons Completed', current: 12, total: 24 },
                      { label: 'Quizzes Passed', current: 8, total: 12 },
                      { label: 'Overall Course', current: 65, total: 100 },
                    ].map((item, i) => (
                      <div key={i} style={{ marginBottom: 'var(--space-lg)' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 'var(--space-sm)',
                          }}
                        >
                          <label style={{ fontWeight: 600 }}>{item.label}</label>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                            {item.current}/{item.total}
                          </span>
                        </div>
                        <div
                          style={{
                            height: '8px',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              background: `linear-gradient(90deg, var(--color-accent) 0%, #059669 100%)`,
                              width: `${(item.current / item.total) * 100}%`,
                              transition: 'width 0.5s ease',
                              borderRadius: 'var(--radius-md)',
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    <div
                      style={{
                        marginTop: 'var(--space-2xl)',
                        padding: 'var(--space-lg)',
                        background: 'var(--color-primary-light)',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ margin: 0, color: 'var(--color-primary)', fontWeight: 600 }}>
                        You're on a 7-day streak! Keep it up!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'discussion' && (
                <div>
                  <div className="card">
                    <h3 style={{ marginTop: 0 }}>Discussion Forum</h3>
                    <p>Join the community, ask questions, and share your learning journey.</p>
                    <button className="button">Open Discussion Forum</button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div
              style={{
                display: 'grid',
                gridAutoRows: 'fit-content',
                gap: 'var(--space-lg)',
              }}
            >
              {/* Info Card */}
              <div className="card">
                <h4 style={{ marginTop: 0, marginBottom: 'var(--space-lg)' }}>Course Info</h4>

                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-muted)',
                      margin: 0,
                      marginBottom: 'var(--space-xs)',
                    }}
                  >
                    Instructor
                  </p>
                  <p style={{ margin: 0, fontWeight: 600 }}>Sarah Johnson</p>
                </div>

                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-muted)',
                      margin: 0,
                      marginBottom: 'var(--space-xs)',
                    }}
                  >
                    Level
                  </p>
                  <p style={{ margin: 0, fontWeight: 600 }}>Intermediate</p>
                </div>

                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-muted)',
                      margin: 0,
                      marginBottom: 'var(--space-xs)',
                    }}
                  >
                    Duration
                  </p>
                  <p style={{ margin: 0, fontWeight: 600 }}>12 weeks</p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-muted)',
                      margin: 0,
                      marginBottom: 'var(--space-xs)',
                    }}
                  >
                    Enrollment
                  </p>
                  <p style={{ margin: 0, fontWeight: 600 }}>1,240 learners</p>
                </div>
              </div>

              {/* Learner Stats */}
              <div className="card">
                <h4 style={{ marginTop: 0, marginBottom: 'var(--space-lg)' }}>
                  Community Achievements
                </h4>

                <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                  {['🏆', '⭐', '🔥'].map((emoji, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        padding: 'var(--space-md)',
                        background: 'var(--color-bg-primary)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)' }}>
                        {emoji}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600 }}>
                        {i === 0 ? '342' : i === 1 ? '1.2K' : '7'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Resources */}
              <div className="card">
                <h4 style={{ marginTop: 0, marginBottom: 'var(--space-lg)' }}>
                  Course Materials
                </h4>

                <button
                  className="button button-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  <Download size={18} />
                  Download All
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid var(--color-border)`,
          padding: 'var(--space-2xl) var(--space-lg)',
          marginTop: 'var(--space-3xl)',
          background: 'var(--color-bg-secondary)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-2xl)',
              marginBottom: 'var(--space-2xl)',
            }}
          >
            {['Product', 'Company', 'Resources', 'Legal'].map((section) => (
              <div key={section}>
                <h4 style={{ marginBottom: 'var(--space-md)' }}>{section}</h4>
                <ul style={{ listStyle: 'none' }}>
                  {['Link', 'Link', 'Link'].map((link, i) => (
                    <li key={i} style={{ marginBottom: 'var(--space-sm)' }}>
                      <a
                        href="#"
                        style={{
                          color: 'var(--color-text-secondary)',
                          textDecoration: 'none',
                          transition: 'color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget).style.color = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget).style.color = 'var(--color-text-secondary)';
                        }}
                      >
                        {section} {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: `1px solid var(--color-border)`,
              paddingTop: 'var(--space-lg)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.875rem',
            }}
          >
            <p>© 2024 Learn+. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
