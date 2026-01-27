// Função para converter um array de objetos JSON para o formato CSV
function convertToCSV(data: any[], headers: { key: string, label: string }[]): string {
  if (!data || data.length === 0) {
    return headers.map(h => h.label).join(';') + '\n';
  }

  // 1. Criar o cabeçalho (labels)
  const headerRow = headers.map(h => `"${h.label}"`).join(';');

  // 2. Criar as linhas de dados
  const dataRows = data.map(row => {
    return headers.map(h => {
      let value = row[h.key];
      
      // Tratar valores nulos ou indefinidos
      if (value === null || value === undefined) {
        value = '';
      }

      // Formatar números (especialmente moeda)
      if (typeof value === 'number') {
        value = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      
      // Envolver strings em aspas e escapar aspas internas
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
        return `"${value}"`;
      }

      return `"${value}"`;
    }).join(';');
  }).join('\n');

  return headerRow + '\n' + dataRows;
}

// Função principal para exportar o CSV
export function exportToCSV(data: any[], headers: { key: string, label: string }[], filename: string) {
  const csvContent = convertToCSV(data, headers);
  
  // Criar um Blob com o conteúdo CSV (usando UTF-8 para caracteres especiais)
  const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  
  // Criar um link temporário para download
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}