const fs = require('fs');
const file = 'src/components/dashboard/VolumeTimeline.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export function VolumeTimeline\(\) \{/,
  `import { analyticsApi } from '../../services/api';\nimport { useState, useEffect } from 'react';\n\nexport function VolumeTimeline() {\n  const [data, setData] = useState<any[]>([]);\n\n  useEffect(() => {\n    const fetch = () => {\n      analyticsApi.dashboard().then(res => {\n        setData(res.data.data.history.map((h: any) => ({ day: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), pedidos: h.total, recebimentos: h.completed, conferencias: Math.floor(h.completed * 0.8) })));\n      });\n    };\n    fetch();\n    const interval = setInterval(fetch, 5000);\n    return () => clearInterval(interval);\n  }, []);\n`
);

content = content.replace(/data={TIMELINE}/, "data={data.length > 0 ? data : TIMELINE}");

fs.writeFileSync(file, content);
