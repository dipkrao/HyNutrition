import React from 'react';
export default function StarRating({ rating = 0, size = 16, showCount, count }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#f59e0b', fontSize: size, letterSpacing: 1 }}>
        {[1,2,3,4,5].map(s => <span key={s}>{s <= Math.round(rating) ? '★' : '☆'}</span>)}
      </span>
      {showCount && <span style={{ fontSize: size - 2, color: '#6b7280' }}>({count || 0})</span>}
    </span>
  );
}
