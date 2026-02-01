import React from 'react';
import { Shield, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const MotionDiv = motion.div as any;

interface VisaStatusProps {
  dataSource?: string;
  merchantCount?: number;
  confidence?: string;
  assumptions?: string[];
}

export const VisaIntegrationStatus: React.FC<VisaStatusProps> = ({
  dataSource = "Industry-standard benchmarks",
  merchantCount = 0,
  confidence = "medium",
  assumptions = []
}) => {
  const isVisaData = dataSource?.toLowerCase().includes('visa');
  const hasMerchantData = merchantCount > 0;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className={`w-5 h-5 ${isVisaData ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Data Integration Status
          </h3>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isVisaData
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
          {isVisaData ? (
            <>
              <CheckCircle className="w-3 h-3" />
              <span>Visa Active</span>
            </>
          ) : (
            <>
              <Activity className="w-3 h-3" />
              <span>Benchmarks</span>
            </>
          )}
        </div>
      </div>

      {/* Data Source Indicator */}
      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isVisaData ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
            }`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Data Source:</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white break-words">{dataSource}</p>
          </div>
        </div>

        {isVisaData && hasMerchantData && (
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Merchant Data:</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {merchantCount} nearby merchants analyzed
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2">
          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${confidence === 'high' ? 'bg-green-500' :
            confidence === 'medium' ? 'bg-yellow-500' : 'bg-orange-500'
            }`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Confidence:</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{confidence}</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      {!isVisaData && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Using Industry Benchmarks
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect Visa Merchant Search API for real-time merchant data and enhanced accuracy.
              </p>
            </div>
          </div>
        </MotionDiv>
      )}

      {isVisaData && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
        >
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Visa API Connected
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Revenue projections enhanced with real merchant and transaction data.
              </p>
            </div>
          </div>
        </MotionDiv>
      )}

      {/* Assumptions List */}
      {assumptions && assumptions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Analysis Assumptions:
          </p>
          <ul className="space-y-1">
            {assumptions.slice(0, 3).map((assumption, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="leading-relaxed">{assumption}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </MotionDiv>
  );
};
