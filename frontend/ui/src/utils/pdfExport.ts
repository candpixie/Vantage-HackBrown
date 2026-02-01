export interface PDFReportData {
  businessType?: string;
  targetDemo?: string;
  budget?: number;
  location: {
    name: string;
    score: number;
    confidence: string;
    metrics: Array<{ label: string; score: number; confidence: string }>;
    competitors: Array<{ name: string; rating?: number; distance: string; weakness: string }>;
    revenue: Array<{ scenario: string; monthly: string; annual: string; margin: string }>;
  };
  generatedAt: string;
}

export const exportToPDF = async (data: PDFReportData) => {
  try {
    console.log('Starting PDF export...', data);

    // Dynamic import to avoid loading the library if not needed
    const html2pdf = (await import('html2pdf.js')).default;

    // Create HTML content for PDF
    const htmlContent = generatePDFHTML(data);

    // Create a temporary container that's off-screen but rendered
    const container = document.createElement('div');
    container.id = 'pdf-export-container';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '816px'; // 8.5in at 96dpi
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#0f172a'; // slate-900
    container.style.zIndex = '-9999';
    container.style.overflow = 'visible';
    container.innerHTML = htmlContent;

    document.body.appendChild(container);

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number], // 0.5 inch margins
      filename: `Vantage_Report_${data.location.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'in' as const,
        format: 'letter' as const,
        orientation: 'portrait' as const,
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as any }
    };

    console.log('Generating PDF with html2pdf...');

    await html2pdf()
      .set(opt)
      .from(container)
      .save();

    // Clean up
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }

    console.log('PDF export completed');
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
};

const generatePDFHTML = (data: PDFReportData): string => {
  const metricsHTML = data.location.metrics && data.location.metrics.length > 0
    ? data.location.metrics.map(m =>
      `<div style="margin: 12px 0; padding: 12px; background: #f0fdfa; border-left: 4px solid #14b8a6; border-radius: 4px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 15px;">${m.label}</div>
          <div style="color: #0d9488; font-size: 18px; font-weight: 700; margin-top: 4px;">
            ${m.score}/100 <span style="color: #64748b; font-size: 13px; font-weight: 400;">(${m.confidence})</span>
          </div>
        </div>`
    ).join('')
    : '<p style="color: #64748b;">No metrics available</p>';

  const competitorsHTML = data.location.competitors && data.location.competitors.length > 0
    ? data.location.competitors.map(c =>
      `<div style="margin: 12px 0; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-weight: 700; color: #0f172a; font-size: 15px;">${c.name}</div>
          ${c.rating ? `<div style="color: #f59e0b; font-size: 14px; margin: 4px 0;">${'★'.repeat(Math.floor(c.rating))} ${c.rating}</div>` : ''}
          <div style="color: #64748b; font-size: 13px;">${c.distance}</div>
          <div style="color: #e11d48; font-size: 13px; margin-top: 4px;">
            <strong>Weakness:</strong> ${c.weakness}
          </div>
        </div>`
    ).join('')
    : '<p style="color: #64748b;">No competitors found in the immediate area.</p>';

  const revenueHTML = data.location.revenue && data.location.revenue.length > 0
    ? data.location.revenue.map(r =>
      `<div style="margin: 16px 0; padding: 16px; background: #f0fdf4; border-radius: 12px; border: 2px solid #10b981;">
          <div style="font-weight: 800; color: #065f46; margin-bottom: 8px; font-size: 16px;">${r.scenario}</div>
          <div style="color: #334155; font-size: 14px; line-height: 1.8;">
            <div><strong>Monthly Revenue:</strong> <span style="color: #10b981; font-weight: 700;">${r.monthly}</span></div>
            <div><strong>Annual Revenue:</strong> <span style="color: #10b981; font-weight: 700;">${r.annual}</span></div>
            <div><strong>Profit Margin:</strong> <span style="color: #059669; font-weight: 700;">${r.margin}</span></div>
          </div>
        </div>`
    ).join('')
    : '<p style="color: #64748b;">Revenue projections not available</p>';

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; padding: 0; background: #ffffff;">
      <!-- Header -->
      <div style="border-bottom: 4px solid #14b8a6; padding-bottom: 24px; margin-bottom: 32px;">
        <h1 style="color: #0d9488; font-size: 36px; font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.5px;">
          VANTAGE
        </h1>
        <p style="color: #475569; font-size: 18px; font-weight: 600; margin: 0;">Location Intelligence Report</p>
        <p style="color: #94a3b8; font-size: 12px; margin: 12px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Generated: ${data.generatedAt}</p>
      </div>

      <!-- Analysis Parameters -->
      ${data.businessType || data.targetDemo || data.budget ? `
      <div style="background: #f1f5f9; padding: 24px; border-radius: 12px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
        <h3 style="margin: 0 0 16px 0; color: #334155; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Analysis Parameters</h3>
        <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 12px;">
          ${data.businessType ? `<p style="margin: 0; color: #475569; font-size: 14px;"><strong>Business:</strong> ${data.businessType}</p>` : ''}
          ${data.targetDemo ? `<p style="margin: 0; color: #475569; font-size: 14px;"><strong>Target:</strong> ${data.targetDemo}</p>` : ''}
          ${data.budget ? `<p style="margin: 0; color: #475569; font-size: 14px;"><strong>Budget:</strong> $${data.budget.toLocaleString()}/mo</p>` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Main Score Hero -->
      <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 40px; border-radius: 16px; margin-bottom: 40px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">
          ${data.location.name}
        </h2>
        <div style="font-size: 80px; font-weight: 900; color: #ffffff; margin: 8px 0; line-height: 1;">
          ${data.location.score}
        </div>
        <div style="display: inline-block; margin-top: 16px; padding: 8px 20px; background: rgba(255, 255, 255, 0.15); border-radius: 9999px; color: #ffffff; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border: 1px solid rgba(255, 255, 255, 0.3);">
          ${data.location.confidence} CONFIDENCE
        </div>
      </div>

      <!-- Two Column Layout for Metrics & Competitors -->
      <div style="display: flex; gap: 40px; margin-bottom: 40px;">
        <div style="flex: 1;">
          <h3 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 3px solid #f1f5f9;">
            📊 Metrics Breakdown
          </h3>
          ${metricsHTML}
        </div>
        <div style="flex: 1;">
          <h3 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 3px solid #f1f5f9;">
            🏪 Market Competition
          </h3>
          ${competitorsHTML}
        </div>
      </div>

      <!-- Revenue Full Width -->
      <div style="margin-bottom: 40px; page-break-before: auto;">
        <h3 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 3px solid #f1f5f9;">
          💰 Revenue Projections
        </h3>
        <div style="display: flex; gap: 20px;">
          ${data.location.revenue.map(r => `
            <div style="flex: 1; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bcf0da;">
              <div style="font-weight: 800; color: #065f46; margin-bottom: 12px; font-size: 14px; text-transform: uppercase;">${r.scenario}</div>
              <div style="color: #059669; font-size: 20px; font-weight: 900;">${r.monthly}</div>
              <div style="color: #64748b; font-size: 12px; margin-top: 4px;">per month</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 60px; padding-top: 32px; border-top: 2px solid #f1f5f9; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0; font-weight: 600;">
          VANTAGE LOCATION INTELLIGENCE
        </p>
        <p style="color: #cbd5e1; font-size: 12px; margin: 8px 0 0 0;">
          © ${new Date().getFullYear()} Vantage. Advanced Market Analysis Platform.
        </p>
      </div>
    </div>
  `;
};
