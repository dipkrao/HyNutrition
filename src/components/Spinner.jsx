import React from 'react';
export default function Spinner({ size = 40, center = false }) {
  const s = { width: size, height: size, border: `${size/8}px solid #f0f0f0`, borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.7s linear infinite' };
  if (center) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}><div style={s}></div></div>;
  return <div style={s}></div>;
}
