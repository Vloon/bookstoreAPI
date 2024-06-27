const validFilters: string[] = ['=', 'is', 'contains'] as const;
export type Filter = typeof validFilters[number];

export function isValidFilter(filter: string): boolean {
    return validFilters.includes(filter);
}