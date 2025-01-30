import { EOL } from 'node:os';

export function parseMenusStr(menuStr: string, config?: Partial<{
    lineDelimiter: string;
    strictIndexing: boolean;
}>): string[] {
    const lines = menuStr.trim()
        .split(config?.lineDelimiter ?? EOL)
        .filter(line => line.trim() !== ''); // Clean up empty lines

    const menus: string[] = [];
    
    lines.forEach((line, index) => {
        const [menuIndex, ...menuName] = line.split(',');
        if(config?.strictIndexing && Number.isNaN(+menuIndex)) {
            throw new Error(`Invalid menu item on line ${index + 1}. Expected an index`);
        }
        if(Number.isNaN(+menuIndex)) {
            menus.push(menuIndex.trim());
        } else {
            menus[(+menuIndex - 1)] = menuName.join(',').trim();
        }
    });

    return menus;
}