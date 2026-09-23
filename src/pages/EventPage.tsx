import React from 'react';
import { ArrowRight, Calendar, Clock, Monitor } from 'lucide-react';

export default function EventPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B0B2C', color: '#fff', fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '40px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.08em' }}>» SAFETYTECH ACADEMY</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          {/* Left Column */}
          <div>
            {/* Badge */}
            <div style={{ display: 'inline-block', background: '#9EFF1F', color: '#0B0B2C', padding: '10px 20px', borderRadius: '40px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '32px' }}>
              LIVE CRASH COURSE
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: '72px', fontWeight: 800, lineHeight: 1.1, marginBottom: '32px' }}>
              <span style={{ color: '#9EFF1F' }}>Copilot</span> in HSE
            </h1>

            {/* Subtitle Badge */}
            <div style={{ background: '#fff', color: '#0B0B2C', padding: '16px 20px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #5555ff, #3434ff)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                📊
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>HANDS-ON WITH</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0B0B2C' }}>Microsoft 365 Copilot</div>
              </div>
            </div>

            {/* Event Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '16px' }}>
                <Calendar size={20} style={{ color: '#9EFF1F', flex: 'none' }} />
                <span>Wednesday 30 September 2026</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '16px' }}>
                <Clock size={20} style={{ color: '#9EFF1F', flex: 'none' }} />
                <span>3:00 PM UK time (BST)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '16px' }}>
                <Monitor size={20} style={{ color: '#9EFF1F', flex: 'none' }} />
                <span>Live online · Zoom</span>
              </div>
            </div>

            {/* CTA Button */}
            <a href="https://us06web.zoom.us/meeting/register/qqHLqHeBSvmxb0yo_u1Z8w" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#9EFF1F', color: '#0B0B2C', padding: '16px 32px', borderRadius: '40px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', transition: 'all 0.3s', cursor: 'pointer', border: 'none' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(158, 255, 31, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              Register now <ArrowRight size={18} />
            </a>
          </div>

          {/* Right Column - Visual */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Background Circle */}
            <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'linear-gradient(135deg, #3434ff, #5555ff)', borderRadius: '50%', opacity: 0.3, blur: '40px' }} />

            {/* App Icons - Positioned around */}
            <div style={{ position: 'absolute', top: '20px', right: '40px', fontSize: '48px', animation: 'float 3s ease-in-out infinite' }}>📊</div>
            <div style={{ position: 'absolute', top: '60px', right: '20px', fontSize: '48px', animation: 'float 3s ease-in-out infinite 0.5s' }}>📈</div>
            <div style={{ position: 'absolute', top: '140px', right: '-10px', fontSize: '48px', animation: 'float 3s ease-in-out infinite 1s' }}>💼</div>

            <div style={{ position: 'absolute', bottom: '100px', left: '20px', fontSize: '48px', animation: 'float 3s ease-in-out infinite 0.3s' }}>💬</div>
            <div style={{ position: 'absolute', bottom: '40px', left: '80px', fontSize: '48px', animation: 'float 3s ease-in-out infinite 0.7s' }}>👥</div>

            {/* Profile Image Placeholder */}
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ width: '280px', height: '380px', background: 'linear-gradient(180deg, #3434ff, #5555ff)', borderRadius: '20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '24px', overflow: 'hidden' }}>
                {/* Placeholder for instructor image */}
                <div style={{ width: '240px', height: '340px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  👤
                </div>
              </div>

              {/* Instructor Info Card */}
              <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', background: '#fff', color: '#0B0B2C', padding: '16px 24px', borderRadius: '12px', textAlign: 'center', width: '280px', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Lucas Domingues</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>MSc, CMIOSH · Founder</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
