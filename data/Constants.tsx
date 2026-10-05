import dedent from 'dedent';
export default {
    PROMPT_OLD: dedent`
    You are an expert frontend frontend React developer. You will be given a description of a website from the user, and then you will return code for it  using React Javascript and Tailwind CSS. Follow the instructions carefully, it is very important for my job. I will tip you $1 million if you do a good job:

- Think carefully step by step about how to recreate the UI described in the prompt.
- Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
- Feel free to have multiple components in the file, but make sure to have one main component that uses all the other components
- Make sure to describe where everything is in the UI so the developer can recreate it and if how elements are aligned
- Pay close attention to background color, text color, font size, font family, padding, margin, border, etc. Match the colors and sizes exactly.
- If its just wireframe then make sure add colors and make some real life colorfull web page
- Make sure to mention every part of the screenshot including any headers, footers, sidebars, etc.
- Make sure to use the exact text from the screenshot.
- Make sure the website looks exactly like the screenshot described in the prompt.
- Pay close attention to background color, text color, font size, font family, padding, margin, border, etc. Match the colors and sizes exactly.
- Make sure to code every part of the description including any headers, footers, etc.
- Use the exact text from the description for the UI elements.
- Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code. WRITE THE FULL CODE.
- Repeat elements as needed to match the description. For example, if there are 15 items, the code should have 15 items. DO NOT LEAVE comments like "<!-- Repeat for each news item -->" or bad things will happen.
- For all images, please use image placeholder from :https://redthread.uoregon.edu/files/original/affd16fd5264cab9197da4cd1a996f820e601ee4.png
- Make sure the React app is interactive and functional by creating state when needed and having no required props
- If you use any imports from React like useState or useEffect, make sure to import them directly
- Use Javascript (.js) as the language for the React component
- Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \h-[600px]\). Make sure to use a consistent color palette.
- Use margin and padding to style the components and ensure the components are spaced out nicely
- Please ONLY return the full React code starting with the imports, nothing else. It's very important for my job that you only return the React code with imports. 
- DO NOT START WITH \\\jsx or \\\`typescript or \\\`javascript or \\\`tsx or \\\.`,
    PROMPT: dedent`You are an expert React developer and UI/UX designer. Turn the attached wireframe image into a working web page.
- Follow the wireframe's layout: keep its sections, their order and their positions. Use the description for the content, purpose and style.
- If the wireframe has no header or footer, add ones that fit the description.
- Write a single file of React (JavaScript, not TypeScript) styled only with Tailwind CSS classes.
- The file must have a default export: export default function App() with no required props.
- Only import from 'react' and 'lucide-react' (for icons). No other libraries and no CSS files.
- Only use icon names that really exist in lucide-react, such as ShoppingCart (not Cart), Search, Menu, User, Star, Heart, X, ChevronDown, ArrowRight, Mail, Phone, MapPin, Check. If unsure an icon exists, leave it out.
- Have exactly one default export. Do not also add "export default App;" at the end.
- For images use 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg'
- Make it modern and professional: one consistent color palette, good spacing, hover states, and a responsive layout that works on mobile.
- Write all of the content. Never leave comments like "add more items here" in place of real code.
- Reply with only the code in a single \`\`\`jsx block and no explanation.
`,
    CHANGES_PROMPT: dedent`You are an expert React developer and UI/UX designer. Below is the current code of a web page and the changes the user wants.
- Apply exactly the requested changes and keep everything else (layout, content, colors) the same.
- Keep it a single file of React (JavaScript) styled only with Tailwind CSS classes, with export default function App() and no required props.
- Only import from 'react' and 'lucide-react'. No other libraries and no CSS files. Only use icon names that really exist in lucide-react.
- Return the complete updated file, not just the changed parts. Never leave comments like "rest of the code stays the same".
- Reply with only the code in a single \`\`\`jsx block and no explanation.
`,

    // Free OpenRouter vision models, tested Oct 2026. Gemma 4 and dots-3 were dropped: Gemma's free
    // endpoint was rate-limited on every try and dots-3 spends its whole budget reasoning.
    AiModelList: [
        {
            name: 'Qwen 3.8 27B (Alibaba)',
            icon: '/qwen.svg',
            modelName: 'qwen/qwen3.8-27b:free',
            hint: 'Fast, recommended'
        },
        {
            name: 'Nemotron 3 Nano Omni (NVIDIA)',
            icon: '/nvidia.svg',
            modelName: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
            hint: 'Slower, can take up to 2 minutes'
        }
    ],
    // Not offered in the picker, only tried if the models above all fail
    FallbackModels: ['google/gemma-4-31b-it:free'],
    // The prompt only allows react + lucide-react, and Tailwind comes from the CDN script,
    // so the preview doesn't need to install anything else
    DEPENDANCY: {
        "lucide-react": "^0.469.0",
    },
    FILES: {
        '/App.css': {
            code: `
            @tailwind base;
@tailwind components;
@tailwind utilities;`
        },
        '/tailwind.config.js': {
            code: `
            /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
        },
        '/postcss.config.js': {
            code: `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },`
        }
    }

}