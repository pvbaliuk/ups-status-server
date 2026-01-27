export function formatError(e: Error, detailed: boolean = true): string {
    return `${e?.constructor?.name ? e.constructor.name : 'Error'}(name: ${e?.name ?? 'unknown'}; message: ${e?.message ?? 'unknown'})${detailed ? ` stack:\n${e?.stack ?? 'unknown'}` : ''}`;
}
