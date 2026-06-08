import React from 'react';
export default function AboutPage() {
  return (
    <div>
      <div style={{ background: '#0a0a0a', padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: 'clamp(36px,5vw,56px)', fontWeight: 900, marginBottom: 16 }}>Our <span style={{ color: '#f59e0b' }}>Story</span></h1>
        <p style={{ color: '#9ca3af', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>Founded in 2019, HY Nutrition is India's premium sports nutrition brand trusted by 50,000+ athletes.</p>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 20px' }}>
        <div className="grid-2" style={{ gap: 64, alignItems: 'center', marginBottom: 80 }}>
          <div>
            <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 20 }}>Built for <span style={{ color: '#f59e0b' }}>Champions</span></h2>
            <p style={{ color: '#6b7280', fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>HY Nutrition was born from a simple frustration — the Indian supplement market was flooded with overpriced, under-dosed products that failed to deliver results.</p>
            <p style={{ color: '#6b7280', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>We set out to create supplements that are transparent, effective, and affordable. Every formula is backed by science, every batch is third-party tested, and every product is made with athletes in mind.</p>
            <div className="grid-2" style={{ gap: 16 }}>
              {[['50K+','Happy Customers'],['100+','Products'],['4.8★','Average Rating'],['5 Years','Of Excellence']].map(([n,l]) => (
                <div key={l} style={{ background: '#fffbeb', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#f59e0b' }}>{n}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: 24, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120 }}>💪</div>
        </div>
        <div style={{ background: '#0a0a0a', borderRadius: 24, padding: '60px 48px', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: 36, fontWeight: 900, marginBottom: 16 }}>Our <span style={{ color: '#f59e0b' }}>Mission</span></h2>
          <p style={{ color: '#9ca3af', fontSize: 18, maxWidth: 700, margin: '0 auto', lineHeight: 1.8 }}>To make world-class sports nutrition accessible to every Indian athlete — from the gym beginner to the elite competitor. No compromises on quality, no hidden fillers, no false promises.</p>
        </div>
      </div>
    </div>
  );
}
