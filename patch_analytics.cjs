const fs = require('fs');
const file = 'src/apps/mfe-analytics/index.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /useEffect\(\(\) => \{\n    analyticsApi.dashboard\(\)\n      .then\(res => setData\(res.data.data\)\)\n      .catch\(\(\) => \{\}\)\n      .finally\(\(\) => setLoading\(false\)\);\n  \}, \[\]\);/,
  `useEffect(() => {
    const fetch = () => {
      analyticsApi.dashboard()
        .then(res => { setData(res.data.data); setLoading(false); })
        .catch(() => setLoading(false));
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);`
);

fs.writeFileSync(file, content);
