// Turns the generated React component into a single HTML file that opens in any browser
// (no Node or build step). React, lucide-react and Tailwind load from CDNs, and Babel compiles
// the JSX in the page.
export const toStandaloneHtml = (code: string, title = 'BlueprintAI page') => {
    // Bind the default export to a name we can render, whatever form the model used
    const appCode = code.replace(/export\s+default\s+/, 'const __App = ')
        + `\nimport { createRoot as __createRoot } from 'react-dom/client';\n__createRoot(document.getElementById('root')).render(<__App />);\n`;
    // The code sits in a text/plain script, which only ends at "</script"
    const escaped = appCode.replace(/<\/script/gi, '<\\/script');
    const safeTitle = title.replace(/[<>&"]/g, '');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${safeTitle}</title>
<script src="https://cdn.tailwindcss.com"></script>
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.3.1",
    "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
    "react-dom/client": "https://esm.sh/react-dom@18.3.1/client?external=react",
    "lucide-react": "https://esm.sh/lucide-react@0.469.0?external=react"
  }
}
</script>
<script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
</head>
<body>
<div id="root"></div>
<script type="text/plain" id="app-code">
${escaped}
</script>
<script type="module">
const source = document.getElementById('app-code').textContent;
const compiled = Babel.transform(source, { presets: [['react', { runtime: 'automatic' }]] }).code;
import(URL.createObjectURL(new Blob([compiled], { type: 'text/javascript' })));
</script>
</body>
</html>
`;
}

export const downloadFile = (filename: string, content: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// "Landing page for a coffee shop" -> "landing-page-for-a-coffee-shop"
export const toFileSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'blueprint-page';
