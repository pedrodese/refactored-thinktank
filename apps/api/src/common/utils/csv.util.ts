// CSV simples, escrito à mão em vez de puxar uma lib nova (csv-stringify):
// exports do projeto são só linhas planas de string/número, sem precisar de
// streaming nem de RFC 4180 completo.
function escapeCsvField(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(','));
  return lines.join('\n');
}
