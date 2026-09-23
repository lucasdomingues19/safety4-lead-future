import React from 'react';
import { ArrowRight, Calendar, Clock, Monitor } from 'lucide-react';

export default function EventPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B0B2C', color: '#fff', fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Main Banner Section */}
      <div style={{ padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '28px' }}>»</span> SAFETYTECH ACADEMY
            </div>
            <div style={{ display: 'inline-block', background: '#9EFF1F', color: '#0B0B2C', padding: '10px 24px', borderRadius: '40px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em' }}>
              LIVE CRASH COURSE
            </div>
          </div>

          {/* Main Content Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            {/* Left Column */}
            <div>
              {/* Headline */}
              <div style={{ marginBottom: '36px' }}>
                <div style={{ fontSize: '88px', fontWeight: 800, lineHeight: 1, color: '#9EFF1F', margin: 0 }}>Copilot</div>
                <div style={{ fontSize: '88px', fontWeight: 800, lineHeight: 1, color: '#fff', margin: 0 }}>in HSE</div>
              </div>

              {/* Subtitle Badge */}
              <div style={{ background: '#fff', color: '#0B0B2C', padding: '14px 20px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #FF6B6B, #FFD93D)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  📊
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>HANDS-ON WITH</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0B0B2C' }}>Microsoft 365 Copilot</div>
                </div>
              </div>

              {/* Event Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '16px', fontWeight: 500 }}>
                  <Calendar size={22} style={{ color: '#9EFF1F', flex: 'none' }} />
                  <span>Wednesday 30 September 2026</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '16px', fontWeight: 500 }}>
                  <Clock size={22} style={{ color: '#9EFF1F', flex: 'none' }} />
                  <span>3:00 PM UK time (BST)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '16px', fontWeight: 500 }}>
                  <Monitor size={22} style={{ color: '#9EFF1F', flex: 'none' }} />
                  <span>Live online · Zoom</span>
                </div>
              </div>

              {/* CTA Button */}
              <div style={{ marginTop: '60px' }}>
                <a href="https://us06web.zoom.us/meeting/register/qqHLqHeBSvmxb0yo_u1Z8w" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#9EFF1F', color: '#0B0B2C', padding: '16px 36px', borderRadius: '40px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', transition: 'all 0.3s', cursor: 'pointer', border: 'none' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(158, 255, 31, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  Register now <ArrowRight size={20} strokeWidth={3} />
                </a>
              </div>
            </div>

            {/* Right Column - Photo and Icons */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
              {/* Blue Background Circle */}
              <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'linear-gradient(135deg, #3434FF 0%, #5555FF 100%)', borderRadius: '50%', opacity: 1, zIndex: 1 }} />

              {/* Floating App Icons */}
              <div style={{ position: 'absolute', top: '20px', right: '60px', fontSize: '48px', animation: 'float 3s ease-in-out infinite', zIndex: 3 }}>🔷</div>
              <div style={{ position: 'absolute', top: '80px', right: '30px', fontSize: '56px', animation: 'float 3s ease-in-out infinite 0.3s', zIndex: 3 }}>🟦</div>
              <div style={{ position: 'absolute', top: '200px', right: '-10px', fontSize: '48px', animation: 'float 3s ease-in-out infinite 0.6s', zIndex: 3 }}>🟩</div>
              <div style={{ position: 'absolute', top: '300px', right: '40px', fontSize: '52px', animation: 'float 3s ease-in-out infinite 0.9s', zIndex: 3 }}>🟨</div>
              <div style={{ position: 'absolute', bottom: '80px', left: '40px', fontSize: '48px', animation: 'float 3s ease-in-out infinite 0.4s', zIndex: 3 }}>🔵</div>
              <div style={{ position: 'absolute', bottom: '120px', right: '60px', fontSize: '56px', animation: 'float 3s ease-in-out infinite 0.8s', zIndex: 3 }}>🟠</div>

              {/* Lucas Photo Container */}
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <div style={{ width: '340px', height: '420px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', backgroundImage: 'url(data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 420"%3E%3Crect fill="%23333" width="340" height="420"/%3E%3C/svg%3E)' }}>
                  {/* Photo would go here - using placeholder */}
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(52, 52, 255, 0.3), rgba(85, 85, 255, 0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>
                    📸
                  </div>
                </div>

                {/* Instructor Card */}
                <div style={{ position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)', background: '#fff', color: '#0B0B2C', padding: '18px 28px', borderRadius: '14px', textAlign: 'center', width: '320px', boxShadow: '0 16px 40px rgba(0,0,0,0.3)', zIndex: 10 }}>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>Lucas Domingues</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>MSc, CMIOSH · Founder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-24px); }
        }
      `}</style>
    </div>
  );
}
