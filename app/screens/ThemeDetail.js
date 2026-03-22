'use client'

const members = [
  { id: 1, emoji: '😊', name: '你（擁有者）', role: 'owner', roleLabel: '擁有者', contributed: 12 },
  { id: 2, emoji: '🐱', name: '小明', role: 'editor', roleLabel: '編輯者', contributed: 8 },
  { id: 3, emoji: '🦊', name: '小華', role: 'viewer', roleLabel: '觀看者', contributed: 0 },
]

const cards = [
  { id: 1, type: '📄', typeLabel: 'PDF', time: '3 天前', title: 'Deep Work', summary: '四條深度工作規則：專注哲學、擁抱無聊、遠離社群...', contributor: '你', contributorColor: '#9B9AAF' },
  { id: 2, type: '🔗', typeLabel: '網址', time: '1 天前', title: '番茄工作法的科學根據', summary: '25分鐘工作區塊與注意力恢復週期的關聯研究...', contributor: '小明', contributorColor: '#4ECDC4' },
  { id: 3, type: '🎙️', typeLabel: '語音', time: '5 小時前', title: '語音筆記 1分32秒', summary: '關於深度工作和手機成癮的關聯想法...', contributor: '你', contributorColor: '#9B9AAF' },
]

export default function ThemeDetail({ onBack }) {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 16px 8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div onClick={onBack} style={{
            fontSize: '18px', cursor: 'pointer', color: '#9B9AAF', padding: '0 4px'
          }}>‹</div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800' }}>⚡ 深度工作</div>
            <div style={{ fontSize: '12px', color: '#9B9AAF', marginTop: '2px' }}>24 張卡片 · 共享中</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#1C1C22', border: '1px solid #2A2A36',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', cursor: 'pointer'
          }}>📦</div>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#1C1C22', border: '1px solid #2A2A36',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', cursor: 'pointer'
          }}>👥</div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#5C5B70', margin: '8px 0'
        }}>成員</div>

        {members.map(member => (
          <div key={member.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#1C1C22', border: '1px solid #2A2A36',
            borderRadius: '12px', padding: '10px 12px', marginBottom: '8px'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C6AF7, #4ECDC4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', flexShrink: 0
            }}>{member.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#F0EFF8' }}>{member.name}</div>
              <div style={{ fontSize: '10px', color: '#5C5B70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
                {member.contributed > 0 ? `貢獻 ${member.contributed} 張` : '觀看中'}
              </div>
            </div>
            <div style={{
              padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600',
              background: member.role === 'owner' ? 'rgba(124,106,247,0.15)' : member.role === 'editor' ? 'rgba(74,222,128,0.15)' : 'rgba(155,154,175,0.15)',
              color: member.role === 'owner' ? '#7C6AF7' : member.role === 'editor' ? '#4ADE80' : '#9B9AAF'
            }}>{member.roleLabel}</div>
          </div>
        ))}

        <div style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#5C5B70', margin: '16px 0 8px'
        }}>卡片（24）</div>

        {cards.map(card => (
          <div key={card.id} style={{
            background: '#1C1C22', border: '1px solid #2A2A36',
            borderRadius: '16px', padding: '14px', marginBottom: '10px', cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>{card.type}</span>
              <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C5B70', flex: 1 }}>{card.typeLabel}</span>
              <span style={{ fontSize: '10px', color: '#5C5B70' }}>{card.time}</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0EFF8', marginBottom: '6px', lineHeight: '1.4' }}>{card.title}</div>
            <div style={{ fontSize: '12px', color: '#9B9AAF', lineHeight: '1.6', marginBottom: '8px' }}>{card.summary}</div>
            <div style={{ fontSize: '10px', color: card.contributorColor }}>貢獻者：{card.contributor}</div>
          </div>
        ))}

        <div style={{
          padding: '14px',
          background: 'linear-gradient(135deg, rgba(124,106,247,0.15), rgba(78,205,196,0.1))',
          border: '1px solid rgba(124,106,247,0.3)',
          borderRadius: '14px', cursor: 'pointer', marginTop: '8px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EFF8', marginBottom: '4px' }}>📦 生成整理包</div>
          <div style={{ fontSize: '11px', color: '#9B9AAF' }}>AI 會先問你用途，再決定怎麼打包並匯出到 NotebookLM</div>
        </div>
      </div>
    </div>
  )
}
