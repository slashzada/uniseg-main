import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface ReportItem {
  data_liquidacao: string;
  vendedor_nome: string;
  beneficiario_nome: string;
  operadora_nome?: string;
  plano_nome: string;
  valor_pagamento: number;
  comissao_percentual: number;
  valor_comissao: number;
  mes_referencia_liquidacao: string;
}

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function drawText(page: any, text: string, x: number, y: number, size: number, font: any, color = rgb(0, 0, 0)) {
  page.drawText(text, { x, y, size, font, color });
}

function uint8ToBlob(uint8: Uint8Array, mime: string): Blob {
  const ab = new ArrayBuffer(uint8.byteLength);
  const view = new Uint8Array(ab);
  view.set(uint8);
  return new Blob([ab], { type: mime });
}

export async function exportComissoesPDF(
  data: ReportItem[],
  filename: string,
  params: { timeframeLabel: string; vendedorLabel: string }
) {
  const doc = await PDFDocument.create();
  const pages: any[] = [];
  const addPage = () => {
    const p = doc.addPage([842, 595]); // A4 landscape
    pages.push(p);
    return p;
  };
  let page = addPage();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Branding (Uniseguros)
  const brandPrimary = rgb(0.0, 0.45, 0.40);
  const brandDark = rgb(0.0, 0.25, 0.25);
  const headerHeight = 64;
  const drawBrandHeader = (pg: any) => {
    pg.drawRectangle({ x: 0, y: 595 - headerHeight, width: 842, height: headerHeight, color: brandPrimary });
    drawText(pg, 'UNISEGUROS', 40, 595 - 38, 20, bold, rgb(1, 1, 1));
    drawText(pg, 'Relatório de Comissões', 40, 595 - 60, 12, bold, rgb(1, 1, 1));
  };
  drawBrandHeader(page);

  // Header meta
  drawText(page, `Período: ${params.timeframeLabel}`, 40, 595 - headerHeight - 18, 11, font, brandDark);
  drawText(page, `Vendedor: ${params.vendedorLabel}`, 40, 595 - headerHeight - 34, 11, font, brandDark);
  const createdAt = new Date().toLocaleString('pt-BR');
  drawText(page, `Gerado em: ${createdAt}`, 680, 595 - headerHeight - 18, 10, font, rgb(0.35, 0.35, 0.35));

  // Summary
  const totalComissao = data.reduce((sum, r) => sum + (r.valor_comissao || 0), 0);
  const totalVendas = data.reduce((sum, r) => sum + (r.valor_pagamento || 0), 0);
  page.drawRectangle({ x: 40, y: 595 - headerHeight - 76, width: 300, height: 32, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 1 });
  page.drawRectangle({ x: 360, y: 595 - headerHeight - 76, width: 300, height: 32, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 1 });
  drawText(page, `Total Vendas: ${formatCurrency(totalVendas)}`, 48, 595 - headerHeight - 58, 12, bold);
  drawText(page, `Total Comissões: ${formatCurrency(totalComissao)}`, 368, 595 - headerHeight - 58, 12, bold, brandPrimary);

  // Table headers
  const columns = [
    { key: 'data_liquidacao', label: 'Vigência', width: 70 },
    { key: 'vendedor_nome', label: 'Vendedor', width: 110 },
    { key: 'beneficiario_nome', label: 'Beneficiário', width: 140 },
    { key: 'operadora_nome', label: 'Operadora', width: 90 },
    { key: 'plano_nome', label: 'Plano', width: 100 },
    { key: 'valor_pagamento', label: 'Venda (R$)', width: 85 },
    { key: 'comissao_percentual', label: 'Com.(%)', width: 60 },
    { key: 'valor_comissao', label: 'Valor Com.', width: 90 },
  ] as const;

  const x = 40;
  let y = 595 - headerHeight - 100;

  page.drawRectangle({ x, y: y - 4, width: 762, height: 24, color: rgb(0.95, 0.97, 1) });
  let cx = x + 8;
  columns.forEach((col) => {
    drawText(page, col.label, cx, y, 10, bold, rgb(0.1, 0.2, 0.4));
    cx += col.width;
  });

  // Rows
  y -= 26;
  data.forEach((row, idx) => {
    const isStripe = idx % 2 === 0;
    if (y < 60) {
      // New page
      page = addPage();
      drawBrandHeader(page);
      // Re-draw headers on new page
      const headerY = 595 - headerHeight - 18;
      drawText(page, `Período: ${params.timeframeLabel}`, 40, headerY, 11, font, brandDark);
      drawText(page, `Vendedor: ${params.vendedorLabel}`, 40, headerY - 16, 11, font, brandDark);

      y = 595 - headerHeight - 52;
      page.drawRectangle({ x, y: y - 4, width: 762, height: 24, color: rgb(0.95, 0.97, 1) });
      let ncx = x + 8;
      columns.forEach((col) => {
        drawText(page, col.label, ncx, y, 10, bold, rgb(0.1, 0.2, 0.4));
        ncx += col.width;
      });
      y -= 26;
    }

    if (isStripe) page.drawRectangle({ x, y: y - 2, width: 762, height: 18, color: rgb(0.985, 0.985, 0.985) });
    let rx = x + 8;

    const values: (string | number)[] = [
      row.data_liquidacao || '-',
      row.vendedor_nome || '-',
      row.beneficiario_nome || '-',
      row.operadora_nome || '-',
      row.plano_nome || '-',
      formatCurrency(row.valor_pagamento || 0),
      `${(row.comissao_percentual || 0).toFixed(0)}%`,
      formatCurrency(row.valor_comissao || 0),
    ];

    values.forEach((val, i) => {
      const text = String(val);
      drawText(page, text.length > 35 ? text.slice(0, 34) + '…' : text, rx, y, 10, font);
      rx += columns[i].width;
    });
    y -= 20;
  });

  // Footer with page numbers and brand
  const totalPages = pages.length;
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: 40, y: 40 }, end: { x: 802, y: 40 }, color: rgb(0.92, 0.92, 0.92), thickness: 1 });
    drawText(p, 'Uniseguros • Relatório de Comissões', 40, 24, 9, font, rgb(0.4, 0.4, 0.4));
    drawText(p, `Página ${i + 1} de ${totalPages}`, 760, 24, 9, font, rgb(0.4, 0.4, 0.4));
  });

  const pdfBytes = await doc.save();
  const blob = uint8ToBlob(pdfBytes, 'application/pdf');
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface FinanceiroReportItem {
  beneficiario: string;
  plano: string;
  valor: number;
  vencimento: string;
  status: string;
}

export async function exportFinanceiroPDF(
  data: FinanceiroReportItem[],
  filename: string,
  params: { statusLabel: string; buscaLabel?: string }
) {
  const doc = await PDFDocument.create();
  const pages: any[] = [];
  const addPage = () => {
    const p = doc.addPage([842, 595]); // A4 landscape
    pages.push(p);
    return p;
  };
  let page = addPage();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const brandPrimary = rgb(0.0, 0.45, 0.40);
  const brandDark = rgb(0.0, 0.25, 0.25);
  const headerHeight = 64;
  
  const drawBrandHeader = (pg: any) => {
    pg.drawRectangle({ x: 0, y: 595 - headerHeight, width: 842, height: headerHeight, color: brandPrimary });
    drawText(pg, 'UNISEGUROS', 40, 595 - 38, 20, bold, rgb(1, 1, 1));
    drawText(pg, 'Relatório Financeiro', 40, 595 - 60, 12, bold, rgb(1, 1, 1));
  };
  drawBrandHeader(page);

  const statusCapitalized = params.statusLabel.charAt(0).toUpperCase() + params.statusLabel.slice(1);
  drawText(page, `Status: ${statusCapitalized}`, 40, 595 - headerHeight - 18, 11, font, brandDark);
  if (params.buscaLabel) {
    drawText(page, `Busca: ${params.buscaLabel}`, 40, 595 - headerHeight - 34, 11, font, brandDark);
  }
  
  const createdAt = new Date().toLocaleString('pt-BR');
  drawText(page, `Gerado em: ${createdAt}`, 680, 595 - headerHeight - 18, 10, font, rgb(0.35, 0.35, 0.35));

  const totais = {
    aReceber: data.filter(p => p.status !== "Pago").reduce((acc, p) => acc + (p.valor || 0), 0),
    recebido: data.filter(p => p.status === "Pago").reduce((acc, p) => acc + (p.valor || 0), 0),
    pendente: data.filter(p => p.status === "Pendente" || p.status === "Vencido").reduce((acc, p) => acc + (p.valor || 0), 0),
    emAnalise: data.filter(p => p.status === "Em Análise").reduce((acc, p) => acc + (p.valor || 0), 0),
  };

  const drawStatBox = (x: number, label: string, value: number, color: any) => {
    page.drawRectangle({ x, y: 595 - headerHeight - 76, width: 178, height: 36, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 1 });
    drawText(page, label, x + 8, 595 - headerHeight - 54, 9, font, rgb(0.4, 0.4, 0.4));
    drawText(page, formatCurrency(value), x + 8, 595 - headerHeight - 68, 12, bold, color);
  };

  drawStatBox(40, "A Receber (Total)", totais.aReceber, brandDark);
  drawStatBox(234, "Recebido", totais.recebido, rgb(0.1, 0.6, 0.3));
  drawStatBox(428, "Pendente/Vencido", totais.pendente, rgb(0.8, 0.5, 0.1));
  drawStatBox(622, "Em Análise", totais.emAnalise, brandPrimary);

  const columns = [
    { key: 'beneficiario', label: 'Beneficiário', width: 220 },
    { key: 'plano', label: 'Plano', width: 180 },
    { key: 'valor', label: 'Valor (R$)', width: 120 },
    { key: 'vencimento', label: 'Vencimento', width: 120 },
    { key: 'status', label: 'Status', width: 120 },
  ] as const;

  const x = 40;
  let y = 595 - headerHeight - 100;

  page.drawRectangle({ x, y: y - 4, width: 762, height: 24, color: rgb(0.95, 0.97, 1) });
  let cx = x + 8;
  columns.forEach((col) => {
    drawText(page, col.label, cx, y, 10, bold, rgb(0.1, 0.2, 0.4));
    cx += col.width;
  });

  y -= 26;
  data.forEach((row, idx) => {
    const isStripe = idx % 2 === 0;
    if (y < 60) {
      page = addPage();
      drawBrandHeader(page);
      
      drawText(page, `Status: ${statusCapitalized}`, 40, 595 - headerHeight - 18, 11, font, brandDark);
      if (params.buscaLabel) {
        drawText(page, `Busca: ${params.buscaLabel}`, 40, 595 - headerHeight - 34, 11, font, brandDark);
      }

      y = 595 - headerHeight - 52;
      page.drawRectangle({ x, y: y - 4, width: 762, height: 24, color: rgb(0.95, 0.97, 1) });
      let ncx = x + 8;
      columns.forEach((col) => {
        drawText(page, col.label, ncx, y, 10, bold, rgb(0.1, 0.2, 0.4));
        ncx += col.width;
      });
      y -= 26;
    }

    if (isStripe) page.drawRectangle({ x, y: y - 2, width: 762, height: 18, color: rgb(0.985, 0.985, 0.985) });
    let rx = x + 8;

    const values = [
      row.beneficiario || '-',
      row.plano || '-',
      formatCurrency(row.valor || 0),
      row.vencimento || '-',
      row.status || '-',
    ];

    values.forEach((val, i) => {
      const text = String(val);
      drawText(page, text.length > 45 ? text.slice(0, 44) + '…' : text, rx, y, 10, font);
      rx += columns[i].width;
    });
    y -= 20;
  });

  const totalPages = pages.length;
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: 40, y: 40 }, end: { x: 802, y: 40 }, color: rgb(0.92, 0.92, 0.92), thickness: 1 });
    drawText(p, 'Uniseguros • Relatório Financeiro', 40, 24, 9, font, rgb(0.4, 0.4, 0.4));
    drawText(p, `Página ${i + 1} de ${totalPages}`, 760, 24, 9, font, rgb(0.4, 0.4, 0.4));
  });

  const pdfBytes = await doc.save();
  const blob = uint8ToBlob(pdfBytes, 'application/pdf');
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
