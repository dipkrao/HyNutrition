import React from 'react';
import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: 100, marginBottom: 24 }}>🔍</div>
      <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 12 }}>404 — Page Not Found</h1>
      <p style={{ color: '#6b7280', fontSize: 18, marginBottom: 32 }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}
