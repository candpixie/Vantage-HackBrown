import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Calendar, MapPin, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';
import { toast } from 'sonner';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

// Mock locations data for reports - matches App.tsx structure
const LOCATIONS = [
  {
    id: 1,
    name: 'Chelsea Highline',
    score: 98,
    status: 'HIGH' as const,
    metrics: [
      { label: 'Demographics', score: 92, confidence: 'HIGH' as const },
      { label: 'Foot Traffic', score: 95, confidence: 'HIGH' as const },
      { label: 'Competition', score: 88, confidence: 'HIGH' as const }
    ],
    competitors: [
      { name: 'Blue Bottle Coffee', rating: 4.6, distance: '0.1 mi', weakness: 'Premium pricing' },
      { name: 'Joe Coffee', rating: 4.4, distance: '0.2 mi', weakness: 'Limited seating' }
    ],
    revenue: [
      { scenario: 'Conservative', monthly: '$28,500', annual: '$342k', margin: '22%' },
      { scenario: 'Moderate', monthly: '$42,200', annual: '$506k', margin: '28%' },
      { scenario: 'Optimistic', monthly: '$58,800', annual: '$706k', margin: '32%' }
    ]
  },
  {
    id: 2,
    name: 'Tribeca Lofts',
    score: 87,
    status: 'MEDIUM' as const,
    metrics: [
      { label: 'Demographics', score: 85, confidence: 'HIGH' as const },
      { label: 'Foot Traffic', score: 78, confidence: 'MEDIUM' as const },
      { label: 'Competition', score: 94, confidence: 'HIGH' as const }
    ],
    competitors: [
      { name: 'Stumptown Coffee', rating: 4.5, distance: '0.3 mi', weakness: 'Crowded peak hours' }
    ],
    revenue: [
      { scenario: 'Conservative', monthly: '$25,000', annual: '$300k', margin: '20%' },
      { scenario: 'Moderate', monthly: '$38,200', annual: '$458k', margin: '26%' },
      { scenario: 'Optimistic', monthly: '$52,000', annual: '$624k', margin: '30%' }
    ]
  },
  {
    id: 3,
    name: 'SoHo Artisan',
    score: 76,
    status: 'MEDIUM' as const,
    metrics: [
      { label: 'Demographics', score: 82, confidence: 'MEDIUM' as const },
      { label: 'Foot Traffic', score: 65, confidence: 'MEDIUM' as const },
      { label: 'Competition', score: 72, confidence: 'MEDIUM' as const }
    ],
    competitors: [],
    revenue: [
      { scenario: 'Conservative', monthly: '$22,000', annual: '$264k', margin: '18%' },
      { scenario: 'Moderate', monthly: '$35,400', annual: '$425k', margin: '24%' },
      { scenario: 'Optimistic', monthly: '$48,000', annual: '$576k', margin: '28%' }
    ]
  }
];

interface ReportsTabProps {
  businessType: string;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ businessType }) => {
  const [generating, setGenerating] = useState<number | null>(null);

  const reports = LOCATIONS.map((loc, idx) => ({
    id: loc.id,
    locationName: loc.name,
    generatedAt: new Date(Date.now() - (idx * 2 * 60 * 60 * 1000)), // 2 hours ago, 4 hours ago, etc.
    score: loc.score,
    status: idx === 0 ? 'completed' as const : 'completed' as const,
    size: '2.4 MB'
  }));

  const handleDownload = async (reportId: number) => {
    const location = LOCATIONS.find(l => l.id === reportId);
    if (!location) return;

    setGenerating(reportId);
    try {
      await exportToPDF({
        businessType: businessType,
        targetDemo: 'Gen Z Students',
        budget: 8500,
        location: {
          name: location.name,
          score: location.score,
          confidence: location.status,
          metrics: location.metrics.map(m => ({
            label: m.label,
            score: m.score,
            confidence: m.confidence
          })),
          competitors: location.competitors || [],
          revenue: location.revenue || []
        },
        generatedAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
      // No toast - silent download
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Generated Reports</h2>
          <p className="text-slate-600 dark:text-slate-400">Download comprehensive location analysis reports</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <MotionDiv
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-teal-100 dark:bg-teal-500/20 rounded-lg">
                    <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 break-words">
                      {report.locationName} Analysis Report
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{report.generatedAt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>Manhattan, NY</span>
                      </div>
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <TrendingUp className="w-4 h-4 flex-shrink-0" />
                        <span>Score: {report.score}/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-14">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Complete</span>
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {report.size} • PDF Format
                  </div>
                </div>
              </div>

              <MotionButton
                onClick={() => handleDownload(report.id)}
                disabled={generating === report.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-4 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating === report.id ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </MotionButton>
            </div>
          </MotionDiv>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 rounded-xl p-6">
        <h4 className="font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2 break-words">
          <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
          <span>Report Contents</span>
        </h4>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0">•</span>
            <span className="break-words">Comprehensive location scoring and metrics breakdown</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0">•</span>
            <span className="break-words">Detailed competitor analysis and market positioning</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0">•</span>
            <span className="break-words">Revenue projections across multiple scenarios</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0">•</span>
            <span className="break-words">Demographic insights and foot traffic analysis</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0">•</span>
            <span className="break-words">Data sources and methodology documentation</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
