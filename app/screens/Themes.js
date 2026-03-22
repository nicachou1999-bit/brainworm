'use client'

const themes = [
  { id: 1, emoji: '🎨', name: 'UI 靈感', count: 38, color: '#7C6AF7', shared: false },
  { id: 2, emoji: '⚡', name: '深度工作', count: 24, color: '#4ECDC4', shared: true },
  { id: 3, emoji: '🚀', name: '創業點子', count: 31, color: '#FF6B6B', shared: false },
  { id: 4, emoji: '🧠', name: 'Brainworm App', count: 16, color: '#FFD93D', shared: true },
  { id: 5, emoji: '🛠️', name: '生產力工具', count: 22, color: '#4ADE80', shared: false },
  { id: 6, emoji: '✍️', name: '寫作靈感', count: 11, color: '#7C6AF7', shared: false },
]

export default function Themes({ onThemeClick }) {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 16px 8px'
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '800' }}>主題牆</div>
          <div style={{ fontSize: '12px', color: '#9B9AAF', marginTop: '2px' }}>6 個主題 · 142 張卡片</div>
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: '#1C1C22', border: '1px solid #2A2A36',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', cursor: 'pointer'
        }}>🔍</div>
      </div>

      <div style={{ padding: '8px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {themes.map(theme => (
          <div key={theme.id} onClick={onThemeClick} style={{
            background: '#1C1C22', border: '1px solid #2A2A36',
            borderRadius: '14px', padding: '14px 12px',
            cursor: 'pointer', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: theme.color, borderRadius: '14px 14px 0 0'
            }}></div>
            {theme.shared && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '12px', opacity: 0.6 }}>👥</div>
            )}
            <div style={{ fontSize: '22px', marginBottom: '8px', marginTop: '4px' }}>{theme.emoji}</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#F0EFF8', marginBottom: '4px', lineHeight: '1.3' }}>{theme.name}</div>
            <div style={{ fontSize: '10px', color: '#5C5B70' }}>{theme.count} 張卡片</div>
          </div>
        ))}
        <div style={{
          background: 'transparent', border: '1px dashed #2A2A36',
          borderRadius: '14px', padding: '14px 12px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '4px', minHeight: '100px'
        }}>
          <div style={{ fontSize: '20px', color: '#5C5B70' }}>＋</div>
          <div style={{ fontSize: '12px', color: '#5C5B70' }}>建立新主題</div>
        </div>
      </div>
    </div>
  )
}
