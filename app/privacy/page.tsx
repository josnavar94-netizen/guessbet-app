import PrivacyContent from './Content';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 'calc(1.5rem + env(safe-area-inset-top)) 1.25rem 5rem', color: '#f0ece0', lineHeight: 1.7 }}>
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#c9a84c', marginBottom: '1.5rem', textDecoration: 'none' }}>← Volver a GuessBet</a>
      <PrivacyContent />
    </div>
  );
}
