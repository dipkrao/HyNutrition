import React from 'react';
const POSTS = [
  { title: 'The Ultimate Guide to Whey Protein', cat: 'Nutrition', date: 'Jan 20, 2024', readTime: '8 min', img: '💪', excerpt: 'Everything you need to know about whey protein - types, benefits, and when to take it.' },
  { title: 'Creatine: Myths vs Science', cat: 'Performance', date: 'Jan 15, 2024', readTime: '6 min', img: '⚡', excerpt: 'We break down the most common misconceptions about creatine supplementation.' },
  { title: 'Top 5 Recovery Supplements for Athletes', cat: 'Recovery', date: 'Jan 10, 2024', readTime: '5 min', img: '🌿', excerpt: 'Faster recovery means more training. Here are the best supplements to speed up muscle repair.' },
  { title: 'How to Build a Supplement Stack', cat: 'Lifestyle', date: 'Jan 5, 2024', readTime: '10 min', img: '🔬', excerpt: 'From beginner to advanced: how to choose and combine supplements for your specific goals.' },
  { title: 'Pre-Workout: Do You Really Need It?', cat: 'Pre-Workout', date: 'Dec 28, 2023', readTime: '7 min', img: '🔥', excerpt: "An honest look at pre-workout supplements - what works, what doesn't, and who needs them." },
  { title: 'Plant-Based Protein: Complete Guide', cat: 'Vegan', date: 'Dec 20, 2023', readTime: '9 min', img: '🌱', excerpt: "Vegan athletes, rejoice! Here's how to hit your protein goals on a plant-based diet." },
];
export default function BlogPage() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>HY <span style={{ color: '#f59e0b' }}>Blog</span></h1>
        <p style={{ color: '#6b7280', fontSize: 16 }}>Expert nutrition advice, workout tips, and supplement guides.</p>
      </div>
      <div className="grid-2" style={{ gap: 28 }}>
        {POSTS.map(p => (
          <div key={p.title} className="card" style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
            <div style={{ height: 160, background: 'linear-gradient(135deg,#fef3c7,#fffbeb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>{p.img}</div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>{p.cat}</span>
                <span style={{ color: '#9ca3af', fontSize: 12 }}>{p.date} · {p.readTime} read</span>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, lineHeight: 1.3 }}>{p.title}</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.6, fontSize: 14, margin: 0 }}>{p.excerpt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
