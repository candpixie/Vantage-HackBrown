/**
 * PDF Export Utility for Vantage Reports
 * Uses html2pdf.js to generate PDFs from HTML content
 */

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
    console.log('HTML content generated, length:', htmlContent.length);

    // Create a temporary container that's visible
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '8.5in';
    container.style.padding = '0.5in';
    container.style.backgroundColor = '#ffffff';
    container.style.zIndex = '10000';
    container.style.overflow = 'auto';
    container.innerHTML = htmlContent;
    
    document.body.appendChild(container);
    console.log('Container added to DOM');

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    const opt = {
      margin: 0,
      filename: `Vantage_Report_${data.location.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait'
      }
    };

    console.log('Generating PDF...');
    await html2pdf().from(container).set(opt).save();
    console.log('PDF generated successfully');
    
    // Clean up
    document.body.removeChild(container);
    console.log('Cleaned up');
    
  } catch (error) {
    console.error('PDF export failed:', error);
    alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const generatePDFHTML = (data: PDFReportData): string => {
  const metricsHTML = data.location.metrics && data.location.metrics.length > 0
    ? data.location.metrics.map(m => 
        `<div style="margin: 12px 0; padding: 12px; background: #f3f4f6; border-left: 4px solid #f59e0b;">
          <div style="font-weight: 700; color: #111827; font-size: 15px;">${m.label}</div>
          <div style="color: #374151; font-size: 18px; font-weight: 700; margin-top: 4px;">
            ${m.score}/100 <span style="color: #6b7280; font-size: 13px; font-weight: 400;">(${m.confidence})</span>
          </div>
        </div>`
      ).join('')
    : '<p style="color: #6b7280;">No metrics available</p>';

  const competitorsHTML = data.location.competitors && data.location.competitors.length > 0
    ? data.location.competitors.map(c => 
        `<div style="margin: 12px 0; padding: 12px; background: #f9fafb; border-radius: 6px;">
          <div style="font-weight: 700; color: #111827; font-size: 15px;">${c.name}</div>
          ${c.rating ? `<div style="color: #f59e0b; font-size: 14px; margin: 4px 0;">${'★'.repeat(Math.floor(c.rating))} ${c.rating}</div>` : ''}
          <div style="color: #6b7280; font-size: 13px;">${c.distance}</div>
          <div style="color: #dc2626; font-size: 13px; margin-top: 4px;">
            <strong>Weakness:</strong> ${c.weakness}
          </div>
        </div>`
      ).join('')
    : '<p style="color: #6b7280;">No competitors found in the immediate area.</p>';

  const revenueHTML = data.location.revenue && data.location.revenue.length > 0
    ? data.location.revenue.map(r => 
        `<div style="margin: 16px 0; padding: 16px; background: #f0fdf4; border-radius: 8px; border: 2px solid #10b981;">
          <div style="font-weight: 800; color: #065f46; margin-bottom: 8px; font-size: 16px;">${r.scenario}</div>
          <div style="color: #374151; font-size: 14px; line-height: 1.8;">
            <div><strong>Monthly Revenue:</strong> <span style="color: #10b981; font-weight: 700;">${r.monthly}</span></div>
            <div><strong>Annual Revenue:</strong> <span style="color: #10b981; font-weight: 700;">${r.annual}</span></div>
            <div><strong>Profit Margin:</strong> <span style="color: #10b981; font-weight: 700;">${r.margin}</span></div>
          </div>
        </div>`
      ).join('')
    : '<p style="color: #6b7280;">Revenue projections not available</p>';

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6; padding: 40px; background: #ffffff;">
      
      <!-- Header -->
      <div style="border-bottom: 4px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #92400e; font-size: 32px; font-weight: 900; margin: 0 0 8px 0;">
          VANTAGE
        </h1>
        <p style="color: #6b7280; font-size: 16px; margin: 0;">Location Intelligence Report</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">Generated: ${data.generatedAt}</p>
      </div>

      <!-- Business Info -->
      ${data.businessType || data.targetDemo || data.budget ? `
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 700;">ANALYSIS PARAMETERS</h3>
        ${data.businessType ? `<p style="margin: 4px 0; color: #78350f;"><strong>Business Type:</strong> ${data.businessType}</p>` : ''}
        ${data.targetDemo ? `<p style="margin: 4px 0; color: #78350f;"><strong>Target Demographic:</strong> ${data.targetDemo}</p>` : ''}
        ${data.budget ? `<p style="margin: 4px 0; color: #78350f;"><strong>Budget:</strong> $${data.budget.toLocaleString()}/month</p>` : ''}
      </div>
      ` : ''}

      <!-- Location Score -->
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
        <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 24px; font-weight: 900;">
          ${data.location.name}
        </h2>
        <div style="font-size: 64px; font-weight: 900; color: #ffffff; margin: 12px 0;">
          ${data.location.score}
        </div>
        <p style="margin: 0; color: #fef3c7; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
          ${data.location.confidence} CONFIDENCE
        </p>
      </div>

      <!-- Metrics Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #111827; font-size: 20px; font-weight: 800; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
          📊 LOCATION METRICS
        </h3>
        ${metricsHTML}
      </div>

      <!-- Competitors Section -->
      <div style="margin-bottom: 30px; page-break-before: auto;">
        <h3 style="color: #111827; font-size: 20px; font-weight: 800; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
          🏪 NEARBY COMPETITORS
        </h3>
        ${competitorsHTML}
      </div>

      <!-- Revenue Section -->
      <div style="margin-bottom: 30px; page-break-before: auto;">
        <h3 style="color: #111827; font-size: 20px; font-weight: 800; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
          💰 REVENUE PROJECTIONS
        </h3>
        ${revenueHTML}
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          This report was generated by Vantage Location Intelligence Platform
        </p>
        <p style="color: #9ca3af; font-size: 11px; margin: 4px 0 0 0;">
          © ${new Date().getFullYear()} Vantage. All rights reserved.
        </p>
      </div>

    </div>
  `;
};
