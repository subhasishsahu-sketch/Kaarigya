import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  MapPin, 
  Lock 
} from 'lucide-react';
import { ProductPassport } from '../../types';

interface PolicySimulatorProps {
  products: ProductPassport[];
  onShowNotification: (msg: string, type?: 'success' | 'info') => void;
}

export const PolicySimulator: React.FC<PolicySimulatorProps> = ({
  products,
  onShowNotification
}) => {
  // Policy State
  const [minWageFloor, setMinWageFloor] = useState<number>(60);
  const [geoLockEnforced, setGeoLockEnforced] = useState<boolean>(true);
  const [singleItemPhysicalLock, setSingleItemPhysicalLock] = useState<boolean>(true);
  const [multilingualVoiceMandate, setMultilingualVoiceMandate] = useState<boolean>(true);
  const [autoTakedownDispatch, setAutoTakedownDispatch] = useState<boolean>(true);

  // Simulation Sandbox Inputs
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.productId || 'CRAFT-00124');
  const [simulatedRetail, setSimulatedRetail] = useState<number>(5000);
  const [simulatedArtisanWage, setSimulatedArtisanWage] = useState<number>(3250);
  const [simulatedGpsWithinBounds, setSimulatedGpsWithinBounds] = useState<boolean>(true);
  const [simulatedScanCount, setSimulatedScanCount] = useState<number>(1);
  const [simulatedVoiceConfirmed, setSimulatedVoiceConfirmed] = useState<boolean>(true);

  // Simulation Result State
  const [simulationRan, setSimulationRan] = useState<boolean>(false);
  const [compliancePassed, setCompliancePassed] = useState<boolean>(true);
  const [ruleEvaluationDetails, setRuleEvaluationDetails] = useState<Array<{ rule: string; passed: boolean; message: string }>>([]);

  const handleProductSelect = (pId: string) => {
    setSelectedProductId(pId);
    const prod = products.find(p => p.productId === pId);
    if (prod) {
      setSimulatedRetail(prod.price.retail);
      setSimulatedArtisanWage(prod.price.artisanCompensation);
    }
  };

  const handleRunSimulation = () => {
    const calculatedWagePct = (simulatedArtisanWage / simulatedRetail) * 100;
    
    const results = [
      {
        rule: `Minimum ${minWageFloor}% Direct Artisan Wage Floor`,
        passed: calculatedWagePct >= minWageFloor,
        message: calculatedWagePct >= minWageFloor 
          ? `Compliant: Artisan receives ${calculatedWagePct.toFixed(1)}% (Threshold is ${minWageFloor}%)`
          : `Non-Compliant: Artisan receives ${calculatedWagePct.toFixed(1)}%, which is below the mandatory ${minWageFloor}% floor.`
      },
      {
        rule: 'Geographic Indication GPS Cluster Boundary',
        passed: !geoLockEnforced || simulatedGpsWithinBounds,
        message: simulatedGpsWithinBounds 
          ? 'Passed: Creation coordinates match registered GI cluster polygon bounds.' 
          : 'Failed: Creation coordinates are outside authorized GI cluster territory.'
      },
      {
        rule: 'One-Passport One-Physical Item Lock',
        passed: !singleItemPhysicalLock || simulatedScanCount <= 3,
        message: simulatedScanCount <= 3 
          ? 'Passed: Physical tag scan velocity is within normal buyer verification tolerances.' 
          : 'Violation: High scan velocity across multiple regions detected. Triggering counterfeit quarantine.'
      },
      {
        rule: 'Multilingual Voice Testimony Confirmation',
        passed: !multilingualVoiceMandate || simulatedVoiceConfirmed,
        message: simulatedVoiceConfirmed 
          ? 'Passed: Master artisan native language voice testimony verified.' 
          : 'Failed: Missing required voice biometric confirmation from master artisan.'
      }
    ];

    const allPassed = results.every(r => r.passed);
    setRuleEvaluationDetails(results);
    setCompliancePassed(allPassed);
    setSimulationRan(true);

    if (allPassed) {
      onShowNotification('Policy Simulation: Sovereign GI Verification PASSED', 'success');
    } else {
      onShowNotification('Policy Simulation: Quarantine Violations Detected', 'info');
    }
  };

  const handleSavePolicy = () => {
    onShowNotification(`Sovereign Policy Rules Updated (Wage Floor: ${minWageFloor}%, GeoLock: ${geoLockEnforced ? 'ON' : 'OFF'})`, 'success');
  };

  return (
    <div className="space-y-8">
      
      {/* Top Config Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Policy Configuration Controls */}
        <div className="lg:col-span-6 bg-white border border-[#DCD7CF] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8E4DD] pb-4">
            <div>
              <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
                Sovereign Governance Rules Engine
              </h3>
              <p className="text-xs text-[#73776A]">
                Programmable rules enforced automatically across all cooperative nodes.
              </p>
            </div>
            <Sliders className="w-5 h-5 text-[#5D634C]" />
          </div>

          <div className="space-y-5 text-xs">
            
            {/* Wage Floor Slider */}
            <div className="space-y-2 p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DD]">
              <div className="flex justify-between font-semibold">
                <span className="text-[#2C2E29]">Mandatory Artisan Direct Wage Floor:</span>
                <span className="font-serif italic text-base text-[#5D634C] font-bold">{minWageFloor}% of Retail MRP</span>
              </div>
              <input
                type="range"
                min="50"
                max="80"
                step="5"
                value={minWageFloor}
                onChange={(e) => setMinWageFloor(parseInt(e.target.value))}
                className="w-full accent-[#5D634C] cursor-pointer"
              />
              <p className="text-[11px] text-[#73776A]">
                Passports with compensation below this ratio are automatically quarantined from the national registry.
              </p>
            </div>

            {/* Rule Toggles */}
            <div className="space-y-3">
              
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DD] cursor-pointer">
                <div>
                  <div className="font-bold text-[#2C2E29]">Geographic Cluster Boundary Lock</div>
                  <p className="text-[11px] text-[#73776A]">Require GPS coordinates to fall inside registered GI boundaries.</p>
                </div>
                <input
                  type="checkbox"
                  checked={geoLockEnforced}
                  onChange={(e) => setGeoLockEnforced(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5D634C] accent-[#5D634C]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DD] cursor-pointer">
                <div>
                  <div className="font-bold text-[#2C2E29]">One-Passport One-Physical Item Lock</div>
                  <p className="text-[11px] text-[#73776A]">Detect duplicated QR/NFC scans across distant regions.</p>
                </div>
                <input
                  type="checkbox"
                  checked={singleItemPhysicalLock}
                  onChange={(e) => setSingleItemPhysicalLock(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5D634C] accent-[#5D634C]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DD] cursor-pointer">
                <div>
                  <div className="font-bold text-[#2C2E29]">Artisan Native Voice Confirmation Mandate</div>
                  <p className="text-[11px] text-[#73776A]">Artisan voice narrative required for tier-1 GI certification.</p>
                </div>
                <input
                  type="checkbox"
                  checked={multilingualVoiceMandate}
                  onChange={(e) => setMultilingualVoiceMandate(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5D634C] accent-[#5D634C]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DD] cursor-pointer">
                <div>
                  <div className="font-bold text-[#2C2E29]">Automated Takedown Notice Dispatch</div>
                  <p className="text-[11px] text-[#73776A]">Auto-serve copyright & GI notice on counterfeit marketplace clones.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoTakedownDispatch}
                  onChange={(e) => setAutoTakedownDispatch(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5D634C] accent-[#5D634C]"
                />
              </label>

            </div>

            <button
              onClick={handleSavePolicy}
              className="w-full py-3 bg-[#5D634C] hover:bg-[#4A4F3C] text-[#FAF8F5] font-bold rounded-full transition-colors shadow-xs"
            >
              Apply & Deploy Policy to All 142 Nodes
            </button>

          </div>
        </div>

        {/* Live Simulation Sandbox */}
        <div className="lg:col-span-6 bg-white border border-[#DCD7CF] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8E4DD] pb-4">
            <div>
              <h3 className="font-serif italic text-xl font-bold text-[#2C2E29]">
                Policy Evaluation Sandbox
              </h3>
              <p className="text-xs text-[#73776A]">
                Test sovereign rules against live products or hypothetical craft parameters.
              </p>
            </div>
            <Play className="w-5 h-5 text-[#BC8E6D]" />
          </div>

          <div className="space-y-4 text-xs">
            
            <div className="space-y-1">
              <label className="font-semibold text-[#2C2E29]">Select Benchmark Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl text-[#2C2E29] focus:outline-none focus:border-[#5D634C]"
              >
                {products.map(p => (
                  <option key={p.productId} value={p.productId}>
                    {p.productId} - {p.name} ({p.artisan.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#2C2E29]">Simulated Retail (MRP ₹)</label>
                <input
                  type="number"
                  value={simulatedRetail}
                  onChange={(e) => setSimulatedRetail(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl text-[#2C2E29]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#2C2E29]">Simulated Artisan Wage (₹)</label>
                <input
                  type="number"
                  value={simulatedArtisanWage}
                  onChange={(e) => setSimulatedArtisanWage(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl text-[#2C2E29]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <label className="flex items-center space-x-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulatedGpsWithinBounds}
                  onChange={(e) => setSimulatedGpsWithinBounds(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5D634C] accent-[#5D634C]"
                />
                <span className="text-[11px] font-semibold text-[#2C2E29]">GPS in Cluster Bounds</span>
              </label>

              <label className="flex items-center space-x-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulatedVoiceConfirmed}
                  onChange={(e) => setSimulatedVoiceConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5D634C] accent-[#5D634C]"
                />
                <span className="text-[11px] font-semibold text-[#2C2E29]">Voice Audio Attached</span>
              </label>
            </div>

            <button
              onClick={handleRunSimulation}
              className="w-full py-3 bg-[#BC8E6D] hover:bg-[#A77756] text-white font-bold rounded-full transition-colors flex items-center justify-center space-x-2 shadow-xs"
            >
              <Play className="w-4 h-4" />
              <span>Run Rule Evaluation Engine</span>
            </button>

            {/* Simulation Results Output */}
            {simulationRan && (
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#E8E4DD] pb-2">
                  <span className="font-bold text-[#2C2E29]">Evaluation Outcome:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    compliancePassed 
                      ? 'bg-[#5D634C]/10 text-[#5D634C] border border-[#5D634C]/30' 
                      : 'bg-[#A25247]/10 text-[#A25247] border border-[#A25247]/30'
                  }`}>
                    {compliancePassed ? '✓ FULLY COMPLIANT' : '⚠ QUARANTINE TRIGGERED'}
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  {ruleEvaluationDetails.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#5D634C] shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#A25247] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className={item.passed ? 'text-[#2C2E29]' : 'text-[#A25247]'}>
                          {item.rule}:
                        </strong>{' '}
                        <span className="text-[#73776A]">{item.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
