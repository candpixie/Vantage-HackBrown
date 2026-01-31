/**
 * PDF Export Utility for SiteSelect Reports
 * Uses html2pdf.js to generate PDFs from HTML content
 */

export interface PDFReportData {
  businessType: string;
  targetDemo: string;
  budget: number;
  location: {
    name: string;
    score: number;
    confidence: string;
    metrics: Array<{ label: string; score: number; confidence: string }>;
    competitors: Array<{ name: string; rating: number; distance: string; weakness: string }>;
    revenue: Array<{ scenario: string; monthly: string; annual: string; margin: string }>;
  };
  generatedAt: string;
}

export const exportToPDF = async (data: PDFReportData) => {
  // Dynamic import to avoid loading the library if not needed
  const html2pdf = (await import('html2pdf.js')).default;

  // Create HTML content for PDF
  const htmlContent = generatePDFHTML(data);

  // Create a temporary element
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  document.body.appendChild(element);

  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `SiteSelect_Report_${data.location.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'portrait' 
    }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  } finally {
    document.body.removeChild(element);
  }
};

const generatePDFHTML = (data: PDFReportData): string => {
  const metricsHTML = data.location.metrics.map(m => 
    `• ${m.label}: ${m.score}/100 (${m.confidence})`
  ).join('<br>');

  const competitorsHTML = data.location.competitors.map(c => 
    `• ${c.name} (${c.rating}★, ${c.distance}) - ${c.weakness}`
  ).join('<br>');

  const revenueHTML = data.location.revenue.map(r => 
    `${r.scenario}: ${r.monthly}/mo (${r.annual}/yr) - ${r.margin} margin`
  ).join('<br>');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          color: #111827;
          line-height: 1.6;
          padding: 40px;
        }
        .header {
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1E3A8A;
          font-size: 32px;
          font-weight: 900;
          margin: 0 0 10px 0;
        }
        .header p {
          color: #6B7280;
          font-size: 14px;
          margin: 0;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          color: #1E40AF;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 15px;
          border-left: 4px solid #3B82F6;
          padding-left: 10px;
        }
        .highlight-box {
          background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
          border: 2px solid #3B82F6;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .score {
          font-size: 48px;
          font-weight: 900;
          color: #3B82F6;
          margin: 10px 0;
        }
        .confidence {
          display: inline-block;
          background: #10B981;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .metrics, .competitors, .revenue {
          background: #F9FAFB;
          border-left: 3px solid #3B82F6;
          padding: 15px;
          margin: 10px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          text-align: center;
          color: #6B7280;
          font-size: 12px;
        }
        .data-source {
          font-size: 11px;
          color: #9CA3AF;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #E5E7EB;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SITESELECT OPPORTUNITY REPORT</h1>
        <p>Generated: ${data.generatedAt}</p>
      </div>

      <div class="section">
        <div class="section-title">BUSINESS PROFILE</div>
        <p><strong>Business Type:</strong> ${data.businessType}</p>
        <p><strong>Target Demographic:</strong> ${data.targetDemo}</p>
        <p><strong>Monthly Budget:</strong> $${data.budget.toLocaleString()}</p>
      </div>

      <div class="section">
        <div class="section-title">#1 RECOMMENDATION</div>
        <div class="highlight-box">
          <h2 style="margin: 0 0 10px 0; color: #1E3A8A; font-size: 24px;">${data.location.name}</h2>
          <div class="score">${data.location.score}/100</div>
          <span class="confidence">${data.location.confidence} CONFIDENCE</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">SCORE BREAKDOWN</div>
        <div class="metrics">
          ${metricsHTML}
        </div>
      </div>

      <div class="section">
        <div class="section-title">COMPETITOR ANALYSIS</div>
        <div class="competitors">
          <p><strong>Found ${data.location.competitors.length} competitors within 0.5 miles:</strong></p>
          ${competitorsHTML}
        </div>
      </div>

      <div class="section">
        <div class="section-title">REVENUE PROJECTION</div>
        <div class="revenue">
          ${revenueHTML}
        </div>
      </div>

      <div class="data-source">
        <p><strong>Data Sources:</strong></p>
        <p>• Foot traffic: NYC Open Data, Business Licenses 2024</p>
        <p>• Competitors: Google Places API (live data)</p>
        <p>• Demographics: Census ACS 2023</p>
      </div>

      <div class="footer">
        Generated by SiteSelect | siteselect.tech
      </div>
    </body>
    </html>
  `;
};
