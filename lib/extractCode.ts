// Pull the code out of a (possibly partial) model reply wrapped in ``` fences
export const extractCode = (raw: string) => {
    const start = raw.indexOf('```');
    if (start === -1) return raw;
    const body = raw.slice(start + 3).replace(/^[a-zA-Z]*\r?\n?/, '');
    const end = body.lastIndexOf('```');
    return end === -1 ? body : body.slice(0, end);
}
