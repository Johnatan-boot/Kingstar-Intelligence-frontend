const fs = require('fs');
const file = 'src/apps/mfe-estoque/index.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{tab === 'overview' && \(\s*<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '24px' \}\}>\s*<StockDashboard data=\{stockData\} \/>\s*<EnhancedStockTable key=\{\`tbl-\$\{refreshKey\}\`\} data=\{stockData\} \/>\s*<\/div>\s*\)/,
  "{tab === 'overview' && <EnhancedStockTable key={`tbl-${refreshKey}`} data={stockData} />}"
);

fs.writeFileSync(file, content);
