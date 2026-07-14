const fs = require('fs');
const file = 'src/apps/mfe-estoque/index.tsx';
let content = fs.readFileSync(file, 'utf8');

const newTemplate = `  const handleDownloadTemplate = () => {
    // Generate template based on current stockData (which contains the 32 mock items)
    const templateData = stockData.map(item => ({
      'SKU': item.sku_id,
      'Produto': item.description,
      'Pedido': item.order_number || '',
      'NF': item.nf_number || '',
      'Categoria': item.category,
      'Estoque Máximo': item.quantity_physical,
      'Estoque Atual': item.quantity_available,
      'Valor Unitário (R$)': item.average_cost,
      'Valor Total (R$)': item.total_value,
      'Status': item.status,
      'Localização': item.location_code || 'A01-01'
    }));`;

content = content.replace(
  /const handleDownloadTemplate = \(\) => \{[\s\S]*?'Localização': item\.location_code \|\| 'A01-01'\s*\}\)\);/,
  newTemplate
);

fs.writeFileSync(file, content);
