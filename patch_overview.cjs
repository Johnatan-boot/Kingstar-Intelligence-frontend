const fs = require('fs');
const file = 'src/apps/mfe-estoque/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// The line is totally broken. Let's find everything from `<div style={{ borderBottom: '1px solid #242424', display: 'flex', gap: '2px', overflowX: 'auto' }}>` to `tab === 'movements'` and replace it.

const brokenPart = content.match(/<div style=\{\{ borderBottom: '1px solid #242424', display: 'flex', gap: '2px', overflowX: 'auto' \}\}>[\s\S]*?\{tab === 'movements'/)[0];

const fixedPart = `<div style={{ borderBottom: '1px solid #242424', display: 'flex', gap: '2px', overflowX: 'auto' }}>
        {TABS.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => setTab(id as any)} style={{
            padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: \`2px solid \${tab === id ? '#38bdf8' : 'transparent'}\`,
            color: tab === id ? '#fff' : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', outline: 'none'
          }}>
            <Icon size={16} color={tab === id ? '#38bdf8' : '#6b7280'} />
            {label}
            {badge && <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>{badge}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && <EnhancedStockTable key={\`tbl-\${refreshKey}\`} data={stockData} />}
      {tab === 'movements'`;

content = content.replace(brokenPart, fixedPart);

fs.writeFileSync(file, content);
