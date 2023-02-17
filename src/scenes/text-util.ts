export function escapeString(str: string): string {
  return str.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, c => `\\${c}`)
}

