const OPENING_FENCE = /^\s*```[\w-]*[ \t]*(\r?\n|$)/;

// Pull the code out of a (possibly partial) model reply wrapped in ``` fences.
// Models sometimes repeat the opening fence or add text after the code, so this strips every
// leading fence line and stops at the first closing fence.
export const extractCode = (raw: string) => {
    const start = raw.indexOf('```');
    if (start === -1) return fixDuplicateDefaultExport(raw);

    let code = raw.slice(start);
    while (OPENING_FENCE.test(code)) code = code.replace(OPENING_FENCE, '');

    const end = code.indexOf('\n```');
    if (end !== -1) code = code.slice(0, end + 1);
    return fixDuplicateDefaultExport(code);
}

// "export default function App() {...}" plus a trailing "export default App;" won't compile,
// so drop the trailing statement when there's more than one default export
const fixDuplicateDefaultExport = (code: string) => {
    if ((code.match(/export\s+default\s+/g) || []).length < 2) return code;
    return code.replace(/\n\s*export\s+default\s+[A-Za-z_$][\w$]*\s*;?\s*$/, '\n');
}
