import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { CheckCircle2, AlertTriangle, Info, Copyright } from 'lucide-react';

/*
 * CIED Upgrade/Downgrade Decision Support Tool
 * 
 * Copyright (c) 2025 Dr. Andreas Kyriacou
 * All Rights Reserved
 * 
 * This software and its source code are proprietary and confidential.
 * Unauthorized copying, distribution, modification, or use of this software,
 * via any medium, is strictly prohibited without explicit written permission.
 * 
 * Licensed for personal clinical use only. Commercial use, redistribution,
 * or incorporation into other products requires a separate license agreement.
 * 
 * Contact: [Your email/contact details]
 * 
 * DISCLAIMER: This tool is provided for educational and clinical decision 
 * support purposes only. It does not replace professional medical judgment.
 * The author assumes no liability for clinical decisions made using this tool.
 */

const CIEDTool = () => {
  // Copyright protection - displays notice on component mount
  useEffect(() => {
    console.log('%c⚠️ COPYRIGHT NOTICE', 'font-size: 16px; font-weight: bold; color: red;');
    console.log('%cCIED Decision Support Tool - Copyright © 2025 Dr. Andreas Kyriacou', 'font-size: 12px;');
    console.log('%cAll Rights Reserved. Unauthorized copying or distribution is prohibited.', 'font-size: 12px;');
    console.log('%cLicensed for personal clinical use only.', 'font-size: 12px;');
  }, []);
  const [tab, setTab] = useState('upgrade');
  const [upgradeType, setUpgradeType] = useState('');
  
  const [cciCalc, setCciCalc] = useState({
    age: '',
    mi: false, chf: false, pvd: false, cvd: false, dementia: false,
    copd: false, ctd: false, pud: false, mld: false, dmNoComp: false,
    dmWithComp: false, hemiplegia: false, ckd: false, tumor: false,
    leukemia: false, lymphoma: false, moderateSevereLiver: false,
    metastaticCancer: false, aids: false
  });
  
  const [upgrade, setUpgrade] = useState({
    age: '', lvef: '', rvPacing: '', nyha: '', ntProBNP: '', 
    hfAdmissions: '', qrs: '', gdmt: '', tr: '',
    cfs: '', venousAccess: '', priorInfection: false,
    diabetes: false, ckdStage: '', anticoag: '',
    cardiomyopathyType: '', priorVTVF: '', syncope: '', nsvt: '',
    familyHistorySCD: '', geneticMutation: '',
    pacemakerSyndrome: '', atrialPacingNeed: '',
    nativeRhythm: '', cmrLGE: '', inducibleVT: '',
    rhythm: '', abandonedLeads: '', lvefRecovered: '', immunosupp: false,
    numLeads: '', leadAge: '', cci: ''
  });

  const [downgrade, setDowngrade] = useState({
    age: '', frailty: '', terminalIllness: '', lifeExpectancy: '',
    currentDevice: '', leadType: '',
    lvef: '', pacingDependent: '',
    goalsOfCare: '', patientPreference: '', familyInvolvement: '',
    inappropriateShocks: '', everHadAppropriateShock: [],
    cardiomyopathyType: '', nyha: '',
    nsvt: '', syncope: '', icdIndication: '', timeFromLastVTVF: '',
    lvefTrend: '', cci: ''
  });

  const calcUpgradePMtoICD = () => {
    const rec = [];
    const warn = [];
    const lvef = parseFloat(upgrade.lvef);
    const age = parseFloat(upgrade.age);
    
    // CLASS I INDICATIONS
    if (lvef <= 35 && upgrade.cardiomyopathyType === 'ischemic' && upgrade.gdmt === 'yes') {
      rec.push('Ischemic CM LVEF ≤35% on GDMT ≥3 months (ESC Class I)');
    }
    
    if (lvef <= 30 && upgrade.cardiomyopathyType === 'ischemic' && upgrade.gdmt === 'yes') {
      rec.push('LVEF ≤30% (higher risk stratum)');
    }
    
    if (lvef <= 35 && upgrade.cardiomyopathyType === 'nonischemic' && upgrade.gdmt === 'yes') {
      rec.push('Non-ischemic CM LVEF ≤35% on GDMT ≥3 months (ESC Class IIa)');
    }
    
    if (age > 70 && upgrade.cardiomyopathyType === 'nonischemic') {
      warn.push('Age >70 in non-ischemic CM: DANISH showed no mortality benefit');
    }
    
    // CLASS IIa - Non-ischemic CM with risk factors
    if (lvef > 35 && lvef <= 50 && upgrade.cardiomyopathyType === 'nonischemic') {
      let riskFactors = 0;
      const riskFactorList = [];
      
      if (upgrade.syncope === 'unexplained') {
        riskFactors++;
        riskFactorList.push('syncope');
      }
      if (upgrade.nsvt === 'yes') {
        riskFactors++;
        riskFactorList.push('NSVT');
      }
      if (upgrade.cmrLGE === 'yes') {
        riskFactors++;
        riskFactorList.push('LGE on CMR');
      }
      if (upgrade.inducibleVT === 'yes') {
        riskFactors++;
        riskFactorList.push('inducible VT');
      }
      if (upgrade.geneticMutation === 'yes') {
        riskFactors++;
        riskFactorList.push('high-risk mutation');
      }
      if (upgrade.familyHistorySCD === 'yes') {
        riskFactors++;
        riskFactorList.push('family Hx SCD');
      }
      
      if (riskFactors >= 2) {
        rec.push(`Non-ischemic CM LVEF 35-50% with ${riskFactors} risk factors (${riskFactorList.join(', ')}) - ESC 2022/2023 Class IIa`);
      } else if (riskFactors === 1) {
        rec.push(`Non-ischemic CM LVEF 35-50% with 1 risk factor (${riskFactorList.join('')}) - consider MDT discussion`);
      }
    }
    
    if (upgrade.geneticMutation === 'yes' && upgrade.cardiomyopathyType === 'nonischemic') {
      warn.push('LMNA/PLN/FLNC/RBM20/DSP/TMEM43: Consider ICD even with LVEF >35% if additional risk factors present');
    }
    
    if (lvef > 35 && lvef <= 50 && upgrade.lvefRecovered === 'yes' && upgrade.cardiomyopathyType === 'nonischemic') {
      warn.push('LVEF recently improved from ≤35%: Consider wearable defibrillator during GDMT optimization');
    }
    
    // SECONDARY PREVENTION
    if (upgrade.priorVTVF === 'yes') {
      rec.push('Prior VT/VF (ESC Class I - secondary prevention)');
    }
    
    // ADDITIONAL RISK MODIFIERS
    if (upgrade.syncope === 'unexplained' && lvef <= 35) {
      rec.push('Unexplained syncope (additional risk modifier)');
    }
    
    if (upgrade.nsvt === 'yes' && lvef <= 35) {
      rec.push('NSVT (additional risk modifier)');
    }
    
    if (upgrade.familyHistorySCD === 'yes' && lvef <= 35) {
      rec.push('Family history of SCD');
    }
    
    // WARNINGS - GDMT
    if (upgrade.gdmt === 'no' && lvef <= 50) {
      warn.push('CRITICAL: Optimize GDMT ≥3 months, reassess LVEF before ICD decision');
      if (lvef <= 30 && upgrade.cardiomyopathyType === 'ischemic') {
        warn.push('Exception: If LVEF ≤30% + ischemic CM, shorter timeline may be considered per MDT');
      }
    }
    
    // WARNINGS - Age and frailty
    if (age > 80) {
      warn.push('Age >80 - consider competing mortality risks');
    }
    
    if (upgrade.frailty === 'severe') {
      warn.push('Severe frailty - limited survival benefit expected');
    }
    
    if (upgrade.priorInfection) {
      warn.push('Prior device infection - high recurrence risk');
    }
    
    return { rec, warn };
  };

  const calcUpgradeToCRT = () => {
    const rec = [];
    const warn = [];
    const lvef = parseFloat(upgrade.lvef);
    const rvPacing = parseFloat(upgrade.rvPacing);
    const age = parseFloat(upgrade.age);
    
    // CLASS I/IIa INDICATIONS - BUDAPEST-CRT based
    if (lvef <= 35 && rvPacing >= 20) {
      rec.push('BUDAPEST-CRT: LVEF ≤35% + RVP ≥20%');
    }
    if (lvef > 35 && lvef <= 50 && rvPacing >= 20) {
      rec.push('HRS 2023: LVEF 36-50% + RVP ≥20%');
    }
    
    // NATIVE RHYTHM - LBBB indications
    if (lvef <= 35 && parseFloat(upgrade.qrs) >= 150 && upgrade.nativeRhythm === 'lbbb') {
      rec.push('LBBB QRS ≥150ms LVEF ≤35% (ESC Class I)');
    }
    if (lvef <= 35 && parseFloat(upgrade.qrs) >= 130 && upgrade.nativeRhythm === 'lbbb') {
      rec.push('LBBB QRS 130-149ms LVEF ≤35% (ESC Class I)');
    }
    
    // RBBB/IVCD - weaker evidence
    if (upgrade.nativeRhythm === 'rbbb' && parseFloat(upgrade.qrs) >= 150) {
      warn.push('RBBB: weaker evidence than LBBB (ESC Class IIb)');
    }
    if (upgrade.nativeRhythm === 'ivcd' && parseFloat(upgrade.qrs) >= 150) {
      rec.push('IVCD QRS ≥150ms (ESC Class IIa - intermediate evidence)');
    }
    
    // AF CONSIDERATIONS
    if (upgrade.rhythm === 'af-uncontrolled') {
      warn.push('AF with poor rate control: Consider AVJ ablation to achieve biventricular capture');
    }
    if (upgrade.rhythm === 'af-avj') {
      rec.push('Post-AVJ ablation ensures 100% biventricular pacing');
    }
    if (upgrade.rhythm === 'af-controlled') {
      warn.push('AF: Ensure adequate rate control for BiV capture >95%');
    }
    
    // HEART FAILURE SEVERITY MARKERS
    if (upgrade.nyha === '3') { rec.push('NYHA III'); }
    if (upgrade.nyha === '4') { rec.push('NYHA IV'); }
    if (parseFloat(upgrade.ntProBNP) > 2000) {
      rec.push('NT-proBNP >2000');
    } else if (parseFloat(upgrade.ntProBNP) > 1000) {
      rec.push('NT-proBNP >1000');
    }
    if (parseFloat(upgrade.hfAdmissions) >= 2) {
      rec.push('≥2 HF admissions');
    } else if (parseFloat(upgrade.hfAdmissions) >= 1) {
      rec.push('Recent HF admission');
    }
    
    // QRS DURATION
    if (parseFloat(upgrade.qrs) >= 150) {
      rec.push('QRS ≥150ms');
    }
    
    // GDMT
    if (upgrade.gdmt === 'yes') {
      rec.push('GDMT optimized');
    } else if (upgrade.gdmt === 'no') {
      warn.push('Optimize GDMT first');
    }
    
    // AGE AND FRAILTY WARNINGS
    if (age > 85) {
      warn.push('Age >85 - consider competing mortality');
    }
    if (upgrade.cfs === '8' || upgrade.cfs === '9') {
      warn.push('Very severe/terminal frailty (CFS 8-9) - very limited survival benefit expected');
    } else if (upgrade.cfs === '7') {
      warn.push('Severe frailty (CFS 7) - limited survival benefit expected');
    } else if (upgrade.cfs === '6') {
      warn.push('Moderate frailty (CFS 6) - consider competing mortality');
    }
    
    // TR WARNINGS
    if (upgrade.tr === 'severe') {
      warn.push('Severe TR - high risk of progression');
    } else if (upgrade.tr === 'moderate') {
      warn.push('Moderate TR - monitor progression');
    }
    
    // VENOUS ACCESS
    if (upgrade.venousAccess === 'occluded') {
      warn.push('Venous occlusion - may require venoplasty/alternative access');
    } else if (upgrade.venousAccess === 'stenosed') {
      warn.push('Venous stenosis');
    }
    
    // INFECTION RISK
    if (upgrade.priorInfection) {
      warn.push('Prior infection - high recurrence risk');
    }
    
    // ABANDONED LEADS
    if (upgrade.abandonedLeads === 'yes') {
      warn.push('Abandoned leads present: Consider extraction vs capping based on age/function');
    }
    
    return { rec, warn };
  };

  const calcUpgradeSingleToDual = () => {
    const rec = [];
    const warn = [];
    
    if (upgrade.pacemakerSyndrome === 'yes') {
      rec.push('Pacemaker syndrome');
    }
    if (upgrade.atrialPacingNeed === 'high') {
      rec.push('High atrial pacing need');
    }
    if (upgrade.syncope === 'recurrent') {
      rec.push('Recurrent syncope');
    }
    if (parseFloat(upgrade.age) > 80) {
      warn.push('Age >80');
    }
    if (upgrade.venousAccess === 'occluded') {
      warn.push('Venous occlusion');
    }
    if (upgrade.priorInfection) {
      warn.push('Prior infection');
    }
    return { rec, warn };
  };

  const calcRiskBenefit = () => {
    const lvef = parseFloat(upgrade.lvef) || 0;
    const rvPacing = parseFloat(upgrade.rvPacing) || 0;
    const age = parseFloat(upgrade.age) || 0;
    const hfAdmit = parseFloat(upgrade.hfAdmissions) || 0;
    
    // INFECTION RISK CALCULATION
    // Evidence: De novo PM/ICD 0.5-1.5%, CRT 1.5-2.5%; Upgrades 3-5%
    let infectionRisk = isDeNovo ? 1 : 4; // Baseline: 1% for de novo PM/ICD, 4% for upgrade
    if (upgradeType === 'crt') {
      if (isDeNovo) {
        infectionRisk = 2; // De novo CRT baseline 2%
      } else {
        infectionRisk += 1; // CRT upgrade adds complexity
      }
    }
    if (upgrade.priorInfection) infectionRisk += 15; // Major risk factor
    if (upgrade.diabetes) infectionRisk += 3;
    
    if (upgrade.ckdStage === 'stage3') {
      infectionRisk += 3;
    } else if (upgrade.ckdStage === 'stage4-5') {
      infectionRisk += 5;
    } else if (upgrade.ckdStage === 'dialysis') {
      infectionRisk += 7;
    }
    
    if (upgrade.immunosupp) infectionRisk += 5;
    
    // Number of leads - only for upgrades
    if (!isDeNovo && parseFloat(upgrade.numLeads) >= 3) infectionRisk += 3;
    
    // MECHANICAL COMPLICATIONS RISK
    // Evidence: De novo 2-4%, Upgrades 4-6% baseline
    let mechanicalRisk = isDeNovo ? 2.5 : 5; // Baseline: 2.5% for de novo, 5% for upgrade
    if (upgradeType === 'crt') mechanicalRisk += isDeNovo ? 1 : 2; // CS lead complexity
    
    // Upgrade-specific mechanical risks
    if (!isDeNovo) {
      if (upgrade.venousAccess === 'occluded') mechanicalRisk += 12; // Very high risk
      if (upgrade.venousAccess === 'stenosed') mechanicalRisk += 6;
      if (upgrade.tr === 'severe') mechanicalRisk += 8; // Lead manipulation risk
      if (upgrade.tr === 'moderate') mechanicalRisk += 4;
      if (parseFloat(upgrade.leadAge) > 10) mechanicalRisk += 4; // Old lead extraction risk
    }
    
    // Risks applicable to both de novo and upgrade
    if (upgrade.anticoag === 'yes') mechanicalRisk += 5; // Bleeding/hematoma
    
    // TR PROGRESSION RISK (separate, not additive)
    let trProgressionRisk = 'Low (10-20%)';
    if (upgrade.tr === 'moderate') trProgressionRisk = 'Moderate (30-40%)';
    if (upgrade.tr === 'severe') trProgressionRisk = 'High (50-60%)';
    
    // For de novo, note baseline TR risk
    if (isDeNovo && (upgrade.tr === '' || upgrade.tr === 'none')) {
      trProgressionRisk = 'Low baseline (10-20% develop TR over time)';
    }
    
    // COMBINED RISK for categorization (not simple addition due to overlap)
    const combinedRisk = infectionRisk + (mechanicalRisk * 0.7); // Weight mechanical lower due to overlap
    let riskCategory = 'LOW';
    if (combinedRisk > 20) riskCategory = 'HIGH';
    else if (combinedRisk > 12) riskCategory = 'MODERATE';
    
    // CCI ≥7 SHIFTS RISK CATEGORY UP (competing mortality consideration)
    // Applied when CFS ≥6 (moderate or greater frailty) to capture hidden competing mortality
    // CCI 7 + CFS 6 = MODERATE-HIGH competing mortality (maps to HIGH for risk category)
    const upgradecci = parseFloat(upgrade.cci) || 0;
    const cfs = upgrade.cfs;
    if (upgradecci >= 7 && cfs === '6') {
      // CCI 7 + CFS 6 = MODERATE-HIGH, shift risk category up significantly
      if (riskCategory === 'LOW') {
        riskCategory = 'MODERATE';
      } else if (riskCategory === 'MODERATE') {
        riskCategory = 'HIGH';
      }
    } else if (upgradecci >= 6 && cfs === '6') {
      // CCI 6 + CFS 6 = MODERATE-HIGH, shift up one level
      if (riskCategory === 'LOW') {
        riskCategory = 'MODERATE';
      }
    } else if (upgradecci >= 7 && (cfs === '7' || cfs === '8' || cfs === '9')) {
      // Already severe frailty with high CCI - ensure HIGH category
      riskCategory = 'HIGH';
    }
    
    // TRIAL-BASED BENEFITS - Base trial results
    let baseHfReduction = 0;
    let baseMortalityReduction = 0;
    let baseLvefImprovement = 0;
    let qolImprovement = 'Uncertain';
    let trialReference = '';
    
    if (upgradeType === 'crt') {
      // RV PACING-INDUCED CARDIOMYOPATHY
      if (rvPacing >= 20) {
        if (lvef <= 35) {
          baseHfReduction = 60;
          baseMortalityReduction = 40;
          baseLvefImprovement = 8;
          qolImprovement = 'Substantial';
          trialReference = 'BUDAPEST-CRT (2024)';
        } else if (lvef <= 50) {
          baseHfReduction = 40;
          baseMortalityReduction = 25;
          baseLvefImprovement = 6;
          qolImprovement = 'Moderate';
          trialReference = 'HRS 2023 guidance (extrapolated from BUDAPEST-CRT)';
        }
      }
      
      // NATIVE LBBB (overrides RVP if both present - native rhythm indication is primary)
      if (upgrade.nativeRhythm === 'lbbb' && parseFloat(upgrade.qrs) >= 130) {
        if (lvef <= 35 && parseFloat(upgrade.qrs) >= 150) {
          baseHfReduction = 50;
          baseMortalityReduction = 36;
          baseLvefImprovement = 7;
          qolImprovement = 'Substantial';
          trialReference = 'COMPANION, CARE-HF, MADIT-CRT (Class I)';
        } else if (lvef <= 35 && parseFloat(upgrade.qrs) >= 130) {
          baseHfReduction = 45;
          baseMortalityReduction = 30;
          baseLvefImprovement = 6;
          qolImprovement = 'Substantial';
          trialReference = 'COMPANION, CARE-HF (Class I)';
        } else if (lvef <= 30) {
          // Mildly symptomatic with LVEF ≤30%
          baseHfReduction = 40;
          baseMortalityReduction = 34;
          baseLvefImprovement = 5;
          qolImprovement = 'Moderate';
          trialReference = 'MADIT-CRT, RAFT';
        }
      }
      
      // RBBB - MUCH WEAKER EVIDENCE
      if (upgrade.nativeRhythm === 'rbbb' && parseFloat(upgrade.qrs) >= 150) {
        baseHfReduction = 20;
        baseMortalityReduction = 15;
        baseLvefImprovement = 3;
        qolImprovement = 'Uncertain';
        trialReference = 'Weak evidence from RBBB subgroups - ESC Class IIb';
      }
      
      // IVCD - INTERMEDIATE EVIDENCE
      if (upgrade.nativeRhythm === 'ivcd' && parseFloat(upgrade.qrs) >= 150) {
        baseHfReduction = 35;
        baseMortalityReduction = 25;
        baseLvefImprovement = 5;
        qolImprovement = 'Moderate';
        trialReference = 'Meta-analyses of IVCD subgroups - ESC Class IIa';
      }
      
      // If RVP indication but no benefit set yet (edge case)
      if (rvPacing >= 40 && baseHfReduction === 0) {
        baseHfReduction = 30;
        baseMortalityReduction = 15;
        baseLvefImprovement = 4;
        qolImprovement = 'Modest';
        trialReference = 'Extrapolated from BUDAPEST-CRT';
      }
    } else if (upgradeType === 'icd') {
      // ICD TRIALS
      if (lvef <= 35 && upgrade.cardiomyopathyType === 'ischemic') {
        baseMortalityReduction = 30;
        qolImprovement = 'Variable';
        trialReference = 'SCD-HeFT (2005), MADIT-II (2002)';
      } else if (lvef <= 35 && upgrade.cardiomyopathyType === 'nonischemic') {
        baseMortalityReduction = 25;
        qolImprovement = 'Variable';
        trialReference = 'DEFINITE (2004), DANISH (2016)';
      }
      if (upgrade.priorVTVF === 'yes') {
        baseMortalityReduction = 50;
        qolImprovement = 'Substantial';
        trialReference = 'AVID (1997) - secondary prevention';
      }
    }
    
    // BENEFIT APPLICABILITY ASSESSMENT - Qualitative Framework
    // Major Deviation = Would have been EXCLUDED from trials (explicit exclusion criteria)
    // Minor Deviation = Significantly UNDERREPRESENTED in trials (rarely enrolled in practice)
    
    const supportingFactors = [];
    const limitingFactors = [];
    let majorDeviations = 0;
    let minorDeviations = 0;
    
    // Age assessment (same for both CRT and ICD)
    if (age <= 75) {
      supportingFactors.push('Age ≤75 (matches trial populations)');
    } else if (age <= 85) {
      minorDeviations++;
      limitingFactors.push('Age 75-85 (underrepresented - trial mean ages 60-73)');
    } else {
      majorDeviations++;
      limitingFactors.push('Age >85 (typically excluded - age cutoffs 75-80 in most trials)');
    }
    
    // Frailty assessment using CFS (same for both CRT and ICD)
    if (upgrade.cfs === '1-3' || upgrade.cfs === '4' || upgrade.cfs === '5' || upgrade.cfs === '') {
      supportingFactors.push('No/mild frailty (CFS ≤5 - matches trial inclusion)');
    } else if (upgrade.cfs === '6') {
      minorDeviations++;
      limitingFactors.push('Moderate frailty (CFS 6 - significantly underrepresented in trials)');
    } else if (upgrade.cfs === '7') {
      majorDeviations++;
      limitingFactors.push('Severe frailty (CFS 7 - explicit exclusion: life expectancy, functional status)');
    } else if (upgrade.cfs === '8' || upgrade.cfs === '9') {
      majorDeviations++;
      limitingFactors.push(`Very severe/terminal frailty (CFS ${upgrade.cfs} - explicit exclusion: very limited life expectancy)`);
    }
    
    // CCI assessment (same logic for both CRT and ICD)
    const cci = parseFloat(upgrade.cci) || 0;
    if (cci >= 7) {
      // CCI ≥7 with CFS 6 = MODERATE-HIGH (major deviation, approaches HIGH threshold)
      if (upgrade.cfs === '6') {
        majorDeviations++;
        limitingFactors.push('CCI 7 + CFS 6 (MODERATE-HIGH competing mortality: combined high disease burden and moderate frailty - 1-year mortality ~35-45%, approaches HIGH threshold for competing mortality)');
      } else if (upgrade.cfs === '5') {
        // CCI ≥7 with CFS 5 indicates hidden competing mortality
        minorDeviations++;
        limitingFactors.push('CCI ≥7 + CFS 5 (High comorbidity burden suggests competing mortality risk underestimated by functional status alone - 1-year mortality ~25-35%)');
      } else if (age < 75 && (upgrade.cfs === '1-3' || upgrade.cfs === '4' || upgrade.cfs === '')) {
        // CCI ≥7 in younger patients with preserved function
        minorDeviations++;
        limitingFactors.push('CCI ≥7 in relatively young patient with preserved function - multiple comorbidities increase competing mortality despite functional status (1-year mortality ~20-30%)');
      }
    } else if (cci >= 6) {
      // CCI 6 + CFS 6 = MODERATE-HIGH
      if (upgrade.cfs === '6') {
        minorDeviations++;
        limitingFactors.push('CCI 6 + CFS 6 (MODERATE-HIGH competing mortality: combined moderate disease burden and frailty - 1-year mortality ~25-35%)');
      } else if (age < 70 && (upgrade.cfs === '1-3' || upgrade.cfs === '4' || upgrade.cfs === '5' || upgrade.cfs === '')) {
        // CCI 6 in younger patients flags emerging risk
        limitingFactors.push('CCI 6 in younger patient (Moderate-high comorbidity burden - monitor for emerging competing mortality risk, 1-year mortality ~15-20%)');
      }
    } else if (cci >= 5 && cci < 6) {
      // CCI 5 is reference range for HF trials, not a deviation
      if (age < 65 && (upgrade.cfs === '1-3' || upgrade.cfs === '4')) {
        supportingFactors.push('Comorbidity burden within typical trial range for age');
      }
    }
    
    // GDMT assessment (for both CRT and ICD)
    if (upgrade.gdmt === 'yes') {
      supportingFactors.push('Optimized GDMT (trial inclusion requirement)');
    } else {
      majorDeviations++;
      limitingFactors.push('GDMT not optimized (explicit trial requirement: stable GDMT ≥3 months)');
    }
    
    // Renal function assessment
    if (!upgrade.ckdStage || upgrade.ckdStage === '') {
      supportingFactors.push('Normal renal function (matches trial populations)');
    } else if (upgrade.ckdStage === 'stage3') {
      minorDeviations++;
      limitingFactors.push('CKD Stage 3 (underrepresented: ~20% in trials vs ~40% real-world HF)');
    } else if (upgrade.ckdStage === 'stage4-5') {
      majorDeviations++;
      limitingFactors.push('CKD Stage 4-5 (explicit exclusion: severe renal impairment)');
    } else if (upgrade.ckdStage === 'dialysis') {
      majorDeviations++;
      limitingFactors.push('Dialysis-dependent (explicit exclusion from trials)');
    }
    
    // Determine applicability level using qualitative framework
    let applicability = 'LOW';
    let applicabilityRationale = '';
    
    if (majorDeviations === 0 && minorDeviations === 0) {
      applicability = 'HIGH';
      applicabilityRationale = 'Patient meets all major trial inclusion criteria';
    } else if (majorDeviations === 0 && minorDeviations <= 2) {
      applicability = 'MODERATE';
      applicabilityRationale = 'Patient would have been eligible for trials but has characteristics that were underrepresented';
    } else if (majorDeviations === 1 && minorDeviations === 0) {
      applicability = 'MODERATE';
      applicabilityRationale = 'Patient has one characteristic that would have excluded them from most trials';
    } else {
      applicability = 'LOW';
      applicabilityRationale = 'Patient has multiple characteristics that would have excluded them from or were underrepresented in trials';
    }
    
    // NO BENEFIT ATTENUATION - We show actual trial results
    // Applicability affects RECOMMENDATION STRENGTH, not benefit calculations
    const hfReduction = baseHfReduction;
    const mortalityReduction = baseMortalityReduction;
    const lvefImprovement = baseLvefImprovement;
    
    // Uncertainty language based on applicability
    let benefitCertainty = '';
    if (applicability === 'HIGH') {
      benefitCertainty = 'Patient matches trial population well - trial results likely applicable';
    } else if (applicability === 'MODERATE') {
      benefitCertainty = 'Patient differs somewhat from trials - actual benefit may be lower than trial results';
    } else {
      benefitCertainty = 'Patient differs significantly from trials - actual benefit uncertain, possibly substantially lower than trial results';
    }
    
    // RISK-BENEFIT MATRIX
        
    const matrix = {
      'HIGH': { 'LOW': 'STRONG RECOMMENDATION', 'MODERATE': 'RECOMMEND', 'HIGH': 'CONSIDER' },
      'MODERATE': { 'LOW': 'RECOMMEND', 'MODERATE': 'CONSIDER', 'HIGH': 'MDT REQUIRED' },
      'LOW': { 'LOW': 'CONSIDER', 'MODERATE': 'MDT REQUIRED', 'HIGH': 'NOT RECOMMENDED' }
    };
    
    const recommendation = matrix[applicability][riskCategory];
    
    return {
      risks: { infectionRisk, mechanicalRisk, trProgressionRisk, riskCategory },
      benefits: { 
        hfReduction, 
        mortalityReduction, 
        lvefImprovement, 
        qolImprovement, 
        trialReference,
        benefitCertainty
      },
      applicability: {
        level: applicability,
        rationale: applicabilityRationale,
        majorDeviations,
        minorDeviations,
        supportingFactors,
        limitingFactors
      },
      recommendation
    };
  };

  const calcDowngrade = () => {
    const rec = [];
    const consider = [];
    let appropriate = 'Unknown';
    
    // Calculate evidence-based arrhythmic risk using validated predictors
    let arrhythmicRisk = 'LOW';
    const riskFactors = [];
    
    const lvef = parseFloat(downgrade.lvef);
    
    // HIGH RISK FACTORS - Strongest evidence from MADIT/SCD-HeFT analyses
    // HR 2.5-3.0 for mortality based on published literature
    
    // HISTORY OF FAST VT/VF - strongest predictor (HR ~2.8 for mortality)
    if (downgrade.everHadAppropriateShock.includes('vf') || downgrade.everHadAppropriateShock.includes('storm')) {
      arrhythmicRisk = 'HIGH';
      if (downgrade.everHadAppropriateShock.includes('storm')) {
        riskFactors.push('VT storm history (highest risk - HR ~3-4 for mortality)');
      }
      if (downgrade.everHadAppropriateShock.includes('vf')) {
        riskFactors.push('Prior VF or fast VT ≥200 bpm (HR ~2.8 for mortality)');
      }
      
      // Timeframe modifies risk
      if (downgrade.timeFromLastVTVF === '<3months') {
        riskFactors.push('Very recent event (<3 months) - ongoing high risk');
      } else if (downgrade.timeFromLastVTVF === '3-12months') {
        riskFactors.push('Event within last year - continued elevated risk');
      } else if (downgrade.timeFromLastVTVF === '>2years') {
        riskFactors.push('Event >2 years ago - risk persists but may be lower');
      } else if (downgrade.timeFromLastVTVF === '>5years') {
        riskFactors.push('Event >5 years ago - risk may be substantially lower if substrate improved');
      }
    }
    
    // Secondary prevention indication = prior documented VT/VF
    if (downgrade.icdIndication === 'secondary' && !downgrade.everHadAppropriateShock.includes('never')) {
      if (arrhythmicRisk !== 'HIGH') arrhythmicRisk = 'HIGH';
      riskFactors.push('Secondary prevention (prior life-threatening arrhythmia)');
    }
    
    // MODERATE RISK FACTORS
    // Slow VT - data shows NO significant mortality increase (HR ~1.2, p>0.10)
    if (downgrade.everHadAppropriateShock.includes('slow-vt') && arrhythmicRisk !== 'HIGH') {
      arrhythmicRisk = 'MODERATE';
      riskFactors.push('Prior slow VT <200 bpm (lower risk - no significant mortality increase in trials)');
    }
    
    // LVEF ≤35% in primary prevention
    if (lvef <= 35 && downgrade.cardiomyopathyType !== 'recovered' && downgrade.cardiomyopathyType !== 'none') {
      if (arrhythmicRisk !== 'HIGH') arrhythmicRisk = 'MODERATE';
      riskFactors.push('LVEF ≤35% (baseline ~3-5% annual SCD risk in trials)');
      
      // LVEF trend matters
      if (downgrade.lvefTrend === 'declining') {
        riskFactors.push('Declining LVEF - substrate worsening');
      } else if (downgrade.lvefTrend === 'improving') {
        riskFactors.push('Improving LVEF - substrate may be stabilizing');
      }
    }
    
    // NSVT - modest predictor (HR ~1.5-2.0)
    if (downgrade.nsvt === 'yes') {
      if (arrhythmicRisk !== 'HIGH') arrhythmicRisk = 'MODERATE';
      riskFactors.push('NSVT present (HR ~1.5-2.0 for events)');
    }
    

    
    // Advanced HF (NYHA III-IV) - competing risks but also arrhythmic risk
    if (downgrade.nyha === '3' || downgrade.nyha === '4') {
      if (arrhythmicRisk !== 'HIGH') arrhythmicRisk = 'MODERATE';
      riskFactors.push(`NYHA Class ${downgrade.nyha} (high competing mortality)`);
    }
    
    // LOW RISK FACTORS - Evidence for low ongoing arrhythmic risk
    // LVEF recovery - KEY predictor of lower risk
    if (lvef > 50 && downgrade.cardiomyopathyType === 'recovered') {
      if (arrhythmicRisk === 'LOW' || arrhythmicRisk === 'MODERATE') {
        riskFactors.push('LVEF recovered to >50% (substantially lower SCD risk)');
      }
    }
    
    // Primary prevention, never had therapy
    if (downgrade.icdIndication === 'primary' && downgrade.everHadAppropriateShock.includes('never')) {
      if (arrhythmicRisk !== 'HIGH') {
        riskFactors.push('Primary prevention, never required therapy (30-40% receive appropriate therapy over 5 years per SCD-HeFT, MADIT-II)');
      }
    }
    
    // Annual arrhythmic event rate estimates based on risk category
    let annualArrhythmicRate = '';
    if (arrhythmicRisk === 'HIGH') {
      annualArrhythmicRate = '8-15% per year (based on MADIT/SCD-HeFT post-shock data)';
    } else if (arrhythmicRisk === 'MODERATE') {
      annualArrhythmicRate = '3-8% per year (baseline ICD trial populations)';
    } else {
      annualArrhythmicRate = '<3% per year (below trial thresholds)';
    }
    
    // ABSOLUTE INDICATIONS FOR DOWNGRADE
    if (downgrade.terminalIllness === 'yes') {
      appropriate = 'Strongly Consider';
      rec.push('Terminal illness diagnosis');
    }
    
    if (downgrade.lifeExpectancy === '<6months') {
      appropriate = 'Strongly Consider';
      rec.push('Life expectancy less than 6 months');
    }
    
    if (downgrade.goalsOfCare === 'comfort') {
      appropriate = 'Strongly Consider';
      rec.push('Comfort-focused goals of care');
    }
    
    if (downgrade.patientPreference === 'deactivate') {
      appropriate = 'Strongly Consider';
      rec.push('Patient requests deactivation (autonomous decision)');
    }
    
    // FRAILTY ASSESSMENT
    if (downgrade.frailty === '7' || downgrade.frailty === '8' || downgrade.frailty === '9') {
      const age = parseFloat(downgrade.age);
      if (age > 80 || downgrade.lifeExpectancy === '6-12months' || downgrade.frailty === '8' || downgrade.frailty === '9') {
        appropriate = 'Strongly Consider';
        rec.push(`Severe/very severe frailty (CFS ${downgrade.frailty}) with limited life expectancy`);
      } else if (appropriate !== 'Strongly Consider') {
        appropriate = 'Consider';
        rec.push('Severe frailty (CFS 7) - competing mortality risks likely exceed arrhythmic risk');
      }
    }
    
    if (downgrade.frailty === '6') {
      const age = parseFloat(downgrade.age);
      if (age > 85 || downgrade.lifeExpectancy === '6-12months') {
        appropriate = appropriate === 'Unknown' ? 'Consider' : appropriate;
        rec.push('Moderate frailty (CFS 6) in very elderly patient');
      }
    }
    
    const age = parseFloat(downgrade.age);
    if (age > 90 && appropriate === 'Unknown') {
      appropriate = 'Consider';
      rec.push('Age over 90 - limited life expectancy, high competing mortality');
    }
    
    // INAPPROPRIATE SHOCKS - QOL consideration
    if (parseFloat(downgrade.inappropriateShocks) >= 3) {
      if (appropriate === 'Unknown') {
        appropriate = 'Consider';
      }
      rec.push('Recurrent inappropriate shocks significantly affecting quality of life');
    }
    
    if (parseFloat(downgrade.inappropriateShocks) >= 5) {
      appropriate = 'Strongly Consider';
      rec.push('Frequent inappropriate shocks (5+ per year) - severe QoL impact (HR ~2.0 for mortality from psychological stress)');
    }
    
    // ARRHYTHMIC RISK BALANCING
    if (arrhythmicRisk === 'HIGH') {
      if (downgrade.lifeExpectancy !== '<6months' && downgrade.frailty !== '8' && downgrade.frailty !== '9') {
        consider.push('HIGH arrhythmic risk - ICD continues to provide significant mortality benefit. Downgrade only if competing risks clearly dominate or aligned with goals of care');
      } else {
        consider.push('HIGH arrhythmic risk present, but life expectancy/frailty suggests competing mortality exceeds arrhythmic risk');
      }
    }
    
    if (arrhythmicRisk === 'MODERATE') {
      consider.push('MODERATE arrhythmic risk - balance against competing mortality risks and quality of life. MDT discussion recommended');
    }
    
    if (arrhythmicRisk === 'LOW' && appropriate === 'Unknown') {
      appropriate = 'Consider';
      consider.push('LOW arrhythmic risk - downgrade may be appropriate, especially if competing mortality concerns or patient preference');
    }
    
    // LVEF RECOVERY SPECIFIC GUIDANCE
    if (lvef > 35 && lvef <= 50 && downgrade.currentDevice === 'icd') {
      if (appropriate === 'Unknown') {
        appropriate = 'Consider';
      }
      consider.push('LVEF 36-50% - reassess indication per 2022/2023 ESC guidelines (consider risk factors for non-ischemic CM)');
    }
    
    if (lvef > 50 && (downgrade.currentDevice === 'icd' || downgrade.currentDevice === 'crt-d')) {
      appropriate = appropriate === 'Unknown' ? 'Consider' : appropriate;
      rec.push('LVEF >50% - original indication may no longer apply');
      
      if (downgrade.everHadAppropriateShock.includes('never')) {
        consider.push('Never had ICD therapy + LVEF normalized - consider downgrade to pacemaker if pacing needed');
      }
    }
    
    // TECHNICAL CONSIDERATIONS
    if (downgrade.leadType === 'df4') {
      consider.push('DF-4 lead: Options are (1) implant new IS-1 lead, OR (2) reprogram device with therapies disabled ("functional downgrade")');
    }
    
    if (downgrade.leadType === 'df1') {
      consider.push('DF-1 lead: Can cap high-voltage coil for true downgrade to pacemaker');
    }
    
    if (downgrade.pacingDependent === 'yes') {
      consider.push('Pacing dependent - ensure pacing capability maintained. Consider "functional downgrade" (therapies off) rather than extraction');
    }
    
    if (appropriate === 'Unknown' && age > 85) {
      consider.push('Advanced age - initiate goals of care discussion at next follow-up');
    }
    
    return { appropriate, rec, consider, arrhythmicRisk, riskFactors, annualArrhythmicRate };
  };

  const getUpgradeResult = () => {
    if (upgradeType === 'crt') return calcUpgradeToCRT();
    if (upgradeType === 'icd') return calcUpgradePMtoICD();
    if (upgradeType === 'dual') return calcUpgradeSingleToDual();
    return { rec: [], warn: [] };
  };

  // DETERMINE IF DE NOVO vs UPGRADE (moved here for accessibility in JSX)
  const isDeNovo = (
    upgrade.rvPacing === 'N/A' || 
    upgrade.numLeads === 'N/A' || 
    upgrade.abandonedLeads === 'N/A'
  );
  
  const upgradeResult = tab === 'upgrade' ? getUpgradeResult() : { rec: [], warn: [] };
  const riskBenefit = tab === 'upgrade' ? calcRiskBenefit() : { risks: {}, benefits: {}, applicability: {}, recommendation: '' };
  const downgradeResult = tab === 'downgrade' ? calcDowngrade() : { appropriate: '', rec: [], consider: [], arrhythmicRisk: '', riskFactors: [], annualArrhythmicRate: '' };
  
  // Determine if guideline indication is met
  const guidelineIndicationMet = upgradeResult.rec.length > 0;
  
  const requiresMDT = (
    riskBenefit.recommendation === 'MDT REQUIRED' ||
    upgrade.cfs === '7' || upgrade.cfs === '8' || upgrade.cfs === '9' ||
    parseFloat(upgrade.age) > 85 ||
    riskBenefit.risks.infectionRisk > 15 ||
    upgrade.priorInfection
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl">CRM-EP Decision Support Tool</CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">CIED Upgrade/Downgrade Assessment - Based on 2025 EHRA/ESC Consensus and ESC 2022/2023 Guidelines</p>
            <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">v2.1 Enhanced</span>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setTab('upgrade')} className={`px-6 py-3 rounded-lg font-semibold transition ${tab === 'upgrade' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300'}`}>
          De Novo Device/Device Upgrade
        </button>
        <button onClick={() => setTab('downgrade')} className={`px-6 py-3 rounded-lg font-semibold transition ${tab === 'downgrade' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300'}`}>
          Device Downgrade
        </button>
        <button onClick={() => setTab('cci')} className={`px-6 py-3 rounded-lg font-semibold transition ${tab === 'cci' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300'}`}>
          CCI Calculator
        </button>
        <button onClick={() => setTab('cfs')} className={`px-6 py-3 rounded-lg font-semibold transition ${tab === 'cfs' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300'}`}>
          CFS Assessment
        </button>
      </div>

      {tab === 'upgrade' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Select Upgrade Type</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button onClick={() => setUpgradeType('icd')} className={`p-4 border-2 rounded-lg text-left transition hover:shadow-md ${upgradeType === 'icd' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                  <div className="font-bold mb-2">New ICD/Pacemaker to ICD</div>
                  <div className="text-sm text-gray-600">New ICD indication</div>
                </button>
                <button onClick={() => setUpgradeType('crt')} className={`p-4 border-2 rounded-lg text-left transition hover:shadow-md ${upgradeType === 'crt' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                  <div className="font-bold mb-2">New CRT or PM/ICD to CRT</div>
                  <div className="text-sm text-gray-600">New or upgrade to CRT</div>
                </button>
                <button onClick={() => setUpgradeType('dual')} className={`p-4 border-2 rounded-lg text-left transition hover:shadow-md ${upgradeType === 'dual' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                  <div className="font-bold mb-2">Single to Dual</div>
                  <div className="text-sm text-gray-600">Pacemaker syndrome</div>
                </button>
                <button onClick={() => setUpgradeType('csp')} className={`p-4 border-2 rounded-lg text-left transition hover:shadow-md ${upgradeType === 'csp' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                  <div className="font-bold mb-2">CSP Alternative</div>
                  <div className="text-sm text-gray-600">HBP/LBBAP vs BiV</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {upgradeType === 'csp' && (
            <Card>
              <CardHeader><CardTitle>Conduction System Pacing Considerations</CardTitle></CardHeader>
              <CardContent>
                <Alert className="border-blue-500">
                  <AlertDescription>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">His Bundle Pacing (HBP) and Left Bundle Branch Area Pacing (LBBAP):</p>
                      <ul className="list-disc ml-5 space-y-1">
                        <li><strong>Advantages:</strong> Physiologic activation, narrow QRS, potential for better hemodynamics</li>
                        <li><strong>HBP:</strong> More physiologic but higher capture thresholds, technical challenges</li>
                        <li><strong>LBBAP:</strong> More stable thresholds, easier implant, growing evidence base</li>
                        <li><strong>Evidence:</strong> Multiple RCTs showing non-inferiority to BiV-CRT (HOT-CRT, LEFT-CRT)</li>
                        <li><strong>Consider when:</strong> Failed BiV-CRT, difficult CS anatomy, lack of response to BiV</li>
                        <li><strong>Limitations:</strong> Requires expertise, learning curve, limited long-term data</li>
                      </ul>
                      <p className="mt-2 font-semibold text-blue-700">Recommendation: Consider CSP as alternative to BiV-CRT in experienced centers (ESC Class IIa)</p>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {upgradeType && upgradeType !== 'csp' && (
            <>
              <Card>
                <CardHeader><CardTitle>Clinical Assessment</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Age</label>
                      <input type="number" value={upgrade.age} onChange={e => setUpgrade({...upgrade, age: e.target.value})} className="w-full p-2 border rounded" placeholder="years" />
                    </div>
                    
                    {(upgradeType === 'crt' || upgradeType === 'icd') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">LVEF (%)</label>
                          <input type="number" value={upgrade.lvef} onChange={e => setUpgrade({...upgrade, lvef: e.target.value})} className="w-full p-2 border rounded" placeholder="%" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">GDMT Status</label>
                          <select value={upgrade.gdmt} onChange={e => setUpgrade({...upgrade, gdmt: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="yes">Optimized 3+ months</option>
                            <option value="no">Not optimized</option>
                          </select>
                        </div>
                      </>
                    )}
                    
                    {upgradeType === 'crt' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">Current Rhythm</label>
                          <select value={upgrade.rhythm} onChange={e => setUpgrade({...upgrade, rhythm: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="sr">Sinus Rhythm</option>
                            <option value="af-controlled">AF (rate controlled)</option>
                            <option value="af-uncontrolled">AF (poorly controlled)</option>
                            <option value="af-avj">AF post-AVJ ablation</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">RV Pacing (%)</label>
                          <select value={upgrade.rvPacing} onChange={e => setUpgrade({...upgrade, rvPacing: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select/Enter %</option>
                            <option value="N/A">N/A (de novo device)</option>
                            <option value="0-19">0-19%</option>
                            <option value="20-39">20-39%</option>
                            <option value="40-100">40-100%</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Native QRS Morphology</label>
                          <select value={upgrade.nativeRhythm} onChange={e => setUpgrade({...upgrade, nativeRhythm: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="normal">Normal QRS</option>
                            <option value="lbbb">LBBB</option>
                            <option value="rbbb">RBBB</option>
                            <option value="ivcd">IVCD</option>
                            <option value="paced">Paced</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">QRS (ms)</label>
                          <input type="number" value={upgrade.qrs} onChange={e => setUpgrade({...upgrade, qrs: e.target.value})} className="w-full p-2 border rounded" placeholder="ms" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">NYHA Class</label>
                          <select value={upgrade.nyha} onChange={e => setUpgrade({...upgrade, nyha: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="1">I</option>
                            <option value="2">II</option>
                            <option value="3">III</option>
                            <option value="4">IV</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">NT-proBNP</label>
                          <input type="number" value={upgrade.ntProBNP} onChange={e => setUpgrade({...upgrade, ntProBNP: e.target.value})} className="w-full p-2 border rounded" placeholder="pg/mL" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">HF Admissions (past year)</label>
                          <input type="number" value={upgrade.hfAdmissions} onChange={e => setUpgrade({...upgrade, hfAdmissions: e.target.value})} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Tricuspid Regurgitation</label>
                          <select value={upgrade.tr} onChange={e => setUpgrade({...upgrade, tr: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="none">None/Trivial</option>
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                          </select>
                        </div>
                      </>
                    )}
                    
                    {upgradeType === 'icd' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">Cardiomyopathy Type</label>
                          <select value={upgrade.cardiomyopathyType} onChange={e => setUpgrade({...upgrade, cardiomyopathyType: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="ischemic">Ischemic</option>
                            <option value="nonischemic">Non-ischemic</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Tricuspid Regurgitation</label>
                          <select value={upgrade.tr} onChange={e => setUpgrade({...upgrade, tr: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="none">None/Trivial</option>
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Prior VT/VF</label>
                          <select value={upgrade.priorVTVF} onChange={e => setUpgrade({...upgrade, priorVTVF: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Syncope</label>
                          <select value={upgrade.syncope} onChange={e => setUpgrade({...upgrade, syncope: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">None</option>
                            <option value="unexplained">Unexplained</option>
                            <option value="recurrent">Recurrent</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">NSVT</label>
                          <select value={upgrade.nsvt} onChange={e => setUpgrade({...upgrade, nsvt: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">CMR LGE</label>
                          <select value={upgrade.cmrLGE} onChange={e => setUpgrade({...upgrade, cmrLGE: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="yes">Significant LGE</option>
                            <option value="no">No/minimal LGE</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Inducible VT at EPS</label>
                          <select value={upgrade.inducibleVT} onChange={e => setUpgrade({...upgrade, inducibleVT: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="notdone">Not done</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">High-Risk Mutation</label>
                          <select value={upgrade.geneticMutation} onChange={e => setUpgrade({...upgrade, geneticMutation: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No/Not tested</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Family Hx SCD</label>
                          <select value={upgrade.familyHistorySCD} onChange={e => setUpgrade({...upgrade, familyHistorySCD: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">LVEF Recovered</label>
                          <select value={upgrade.lvefRecovered} onChange={e => setUpgrade({...upgrade, lvefRecovered: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="yes">Yes (from below 35%)</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                      </>
                    )}
                    
                    {upgradeType === 'dual' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">PM Syndrome</label>
                          <select value={upgrade.pacemakerSyndrome} onChange={e => setUpgrade({...upgrade, pacemakerSyndrome: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Atrial Pacing Need</label>
                          <select value={upgrade.atrialPacingNeed} onChange={e => setUpgrade({...upgrade, atrialPacingNeed: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="high">High</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                      </>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Frailty (Clinical Frailty Scale)</label>
                      <select value={upgrade.cfs} onChange={e => setUpgrade({...upgrade, cfs: e.target.value})} className="w-full p-2 border rounded">
                        <option value="">Select</option>
                        <option value="1-3">CFS 1-3 (Fit to Managing Well)</option>
                        <option value="4">CFS 4 (Vulnerable)</option>
                        <option value="5">CFS 5 (Mildly Frail)</option>
                        <option value="6">CFS 6 (Moderately Frail)</option>
                        <option value="7">CFS 7 (Severely Frail)</option>
                        <option value="8">CFS 8 (Very Severely Frail)</option>
                        <option value="9">CFS 9 (Terminally Ill)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Venous Access</label>
                      <select value={upgrade.venousAccess} onChange={e => setUpgrade({...upgrade, venousAccess: e.target.value})} className="w-full p-2 border rounded">
                        <option value="">Select</option>
                        <option value="patent">Patent</option>
                        <option value="stenosed">Stenosed</option>
                        <option value="occluded">Occluded</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CKD Stage</label>
                      <select value={upgrade.ckdStage} onChange={e => setUpgrade({...upgrade, ckdStage: e.target.value})} className="w-full p-2 border rounded">
                        <option value="">None/Stage 1-2</option>
                        <option value="stage3">Stage 3 (eGFR 30-59)</option>
                        <option value="stage4-5">Stage 4-5 (eGFR under 30)</option>
                        <option value="dialysis">Dialysis-dependent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Number of Leads</label>
                      <select value={upgrade.numLeads} onChange={e => setUpgrade({...upgrade, numLeads: e.target.value})} className="w-full p-2 border rounded">
                        <option value="">Select</option>
                        <option value="N/A">N/A (de novo device)</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4+">4 or more</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Lead Age (years)</label>
                      <input type="number" value={upgrade.leadAge} onChange={e => setUpgrade({...upgrade, leadAge: e.target.value})} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Abandoned Leads</label>
                      <select value={upgrade.abandonedLeads} onChange={e => setUpgrade({...upgrade, abandonedLeads: e.target.value})} className="w-full p-2 border rounded">
                        <option value="">Select</option>
                        <option value="N/A">N/A (de novo device)</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={upgrade.priorInfection} onChange={e => setUpgrade({...upgrade, priorInfection: e.target.checked})} className="mr-2 w-4 h-4" />
                        <span className="text-sm font-medium">Prior Infection</span>
                      </label>
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={upgrade.diabetes} onChange={e => setUpgrade({...upgrade, diabetes: e.target.checked})} className="mr-2 w-4 h-4" />
                        <span className="text-sm font-medium">Diabetes</span>
                      </label>
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={upgrade.immunosupp} onChange={e => setUpgrade({...upgrade, immunosupp: e.target.checked})} className="mr-2 w-4 h-4" />
                        <span className="text-sm font-medium">Immunosuppressed</span>
                      </label>
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={upgrade.anticoag === 'yes'} onChange={e => setUpgrade({...upgrade, anticoag: e.target.checked ? 'yes' : 'no'})} className="mr-2 w-4 h-4" />
                        <span className="text-sm font-medium">Anticoagulated</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Charlson Comorbidity Index (Optional)
                        <span className="text-xs text-gray-500 ml-1">- for complex cases</span>
                      </label>
                      <input type="number" value={upgrade.cci || ''} onChange={e => setUpgrade({...upgrade, cci: e.target.value})} className="w-full p-2 border rounded" placeholder="0-10+" />
                      <div className="text-xs text-gray-500 mt-1">Calculates additional competing mortality risk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guideline Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className={guidelineIndicationMet ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                    <AlertDescription>
                      <div className="font-bold text-lg mb-2">
                        {guidelineIndicationMet ? 'GUIDELINE INDICATION MET' : 'NO CLEAR GUIDELINE INDICATION'}
                      </div>
                      
                      {requiresMDT && (
                        <div className="mt-2 p-3 bg-orange-100 border-2 border-orange-400 rounded-lg">
                          <div className="font-bold text-orange-900">MDT DISCUSSION RECOMMENDED</div>
                          <div className="text-sm text-orange-800 mt-1">Complex case requiring multidisciplinary team input</div>
                        </div>
                      )}
                      
                      {upgradeResult.rec.length > 0 && (
                        <div className="mt-4">
                          <div className="font-bold flex items-center gap-2 mb-2 text-green-700">
                            <CheckCircle2 className="w-5 h-5" /> Supporting Indications:
                          </div>
                          <ul className="list-disc ml-6 space-y-1">{upgradeResult.rec.map((r, i) => <li key={i} className="text-sm">{r}</li>)}</ul>
                        </div>
                      )}
                      {upgradeResult.warn.length > 0 && (
                        <div className="mt-4">
                          <div className="font-bold flex items-center gap-2 mb-2 text-red-700">
                            <AlertTriangle className="w-5 h-5" /> Important Considerations:
                          </div>
                          <ul className="list-disc ml-6 space-y-1">{upgradeResult.warn.map((w, i) => <li key={i} className="text-sm">{w}</li>)}</ul>
                        </div>
                      )}
                      
                      {!guidelineIndicationMet && upgradeResult.rec.length === 0 && (
                        <div className="mt-3 text-sm text-gray-700">
                          Patient does not meet established guideline criteria for this upgrade. Consider individual risk-benefit assessment or alternative strategies.
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {(upgradeType === 'crt' || upgradeType === 'icd') && (
                <Card>
                  <CardHeader>
                    <CardTitle>Integrated Risk-Benefit Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* INTEGRATED RECOMMENDATION AT TOP */}
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300">
                      <div className="text-center mb-4">
                        <div className="text-sm font-semibold text-gray-600 mb-2">INTEGRATED RECOMMENDATION</div>
                        <div className={`text-3xl font-bold mb-3 ${
                          riskBenefit.recommendation.includes('STRONG') ? 'text-green-700' :
                          riskBenefit.recommendation.includes('RECOMMEND') ? 'text-blue-700' :
                          riskBenefit.recommendation.includes('CONSIDER') ? 'text-yellow-700' :
                          riskBenefit.recommendation.includes('MDT') ? 'text-orange-700' :
                          'text-red-700'
                        }`}>
                          {riskBenefit.recommendation}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-xs font-semibold text-gray-500 mb-1">BENEFIT APPLICABILITY</div>
                          <div className={`text-2xl font-bold ${
                            riskBenefit.applicability.level === 'HIGH' ? 'text-green-600' :
                            riskBenefit.applicability.level === 'MODERATE' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {riskBenefit.applicability.level}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {riskBenefit.applicability.majorDeviations > 0 && `${riskBenefit.applicability.majorDeviations} major, `}
                            {riskBenefit.applicability.minorDeviations} minor deviation{riskBenefit.applicability.minorDeviations !== 1 ? 's' : ''}
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-xs font-semibold text-gray-500 mb-1">RISK CATEGORY</div>
                          <div className={`text-2xl font-bold ${
                            riskBenefit.risks.riskCategory === 'LOW' ? 'text-green-600' :
                            riskBenefit.risks.riskCategory === 'MODERATE' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {riskBenefit.risks.riskCategory}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Infection: {riskBenefit.risks.infectionRisk.toFixed(1)}% | Mechanical: {riskBenefit.risks.mechanicalRisk.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center text-sm text-gray-600 italic">
                        Based on evidence-based risk-benefit matrix incorporating trial applicability and procedural risks
                      </div>
                    </div>

                    {/* BENEFIT APPLICABILITY SECTION */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <h3 className="font-bold text-lg mb-3 text-blue-900 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        How Well Does This Patient Match Trial Populations?
                      </h3>
                      
                      <div className="mb-4 p-3 bg-white rounded border">
                        <div className="text-sm font-semibold mb-2">What is "Benefit Applicability"?</div>
                        <p className="text-sm text-gray-700 mb-2">
                          Benefit applicability assesses how similar your patient is to those enrolled in clinical trials. 
                          Patients who closely match trial inclusion criteria are more likely to experience the published benefits.
                        </p>
                        <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded space-y-1">
                          <div><strong>Major Deviation:</strong> Patient would have been EXCLUDED from trials (explicit exclusion criteria)</div>
                          <div><strong>Minor Deviation:</strong> Patient significantly UNDERREPRESENTED in trials (rarely enrolled in practice)</div>
                          <div className="mt-2 pt-2 border-t border-gray-300"><strong>Assessment:</strong> HIGH = no deviations; MODERATE = minor deviations or 1 major; LOW = multiple deviations</div>
                        </div>
                      </div>
                      
                      <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="font-semibold text-sm text-blue-900 mb-1">
                          Assessment: {riskBenefit.applicability.rationale}
                        </div>
                      </div>
                      
                      {riskBenefit.applicability.supportingFactors.length > 0 && (
                        <div className="mb-3">
                          <div className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Supporting Factors (Patient Matches Trial Criteria):
                          </div>
                          <ul className="list-disc ml-6 space-y-1">
                            {riskBenefit.applicability.supportingFactors.map((f, i) => (
                              <li key={i} className="text-sm text-green-900">{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {riskBenefit.applicability.limitingFactors.length > 0 && (
                        <div>
                          <div className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Limiting Factors (Patient Differs from Trials):
                          </div>
                          <ul className="list-disc ml-6 space-y-1">
                            {riskBenefit.applicability.limitingFactors.map((f, i) => (
                              <li key={i} className="text-sm text-orange-900">{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {/* RISKS PANEL */}
                      <div className="border-2 rounded-lg p-4 bg-red-50 border-red-200">
                        <h3 className="font-bold mb-3 text-red-800 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Procedural Risks {isDeNovo && <span className="text-xs font-normal text-gray-600">(De Novo Implant)</span>}
                          {!isDeNovo && <span className="text-xs font-normal text-gray-600">(Upgrade Procedure)</span>}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-white rounded">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold">Infection Risk:</span>
                              <span className="font-bold text-red-700">{riskBenefit.risks.infectionRisk.toFixed(1)}%</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Device infection requiring extraction
                              {isDeNovo && <span className="block mt-1 text-blue-600">De novo baseline: PM/ICD 1%, CRT 2%</span>}
                              {!isDeNovo && <span className="block mt-1 text-orange-600">Upgrade baseline: 4-5%</span>}
                            </div>
                          </div>
                          <div className="p-2 bg-white rounded">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold">Mechanical Complications:</span>
                              <span className="font-bold text-red-700">{riskBenefit.risks.mechanicalRisk.toFixed(1)}%</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Pneumothorax, perforation, lead dislodgement, hematoma
                              {isDeNovo && <span className="block mt-1 text-blue-600">De novo baseline: 2-3%</span>}
                              {!isDeNovo && <span className="block mt-1 text-orange-600">Upgrade: 5-6% baseline, higher with venous issues</span>}
                            </div>
                          </div>
                          <div className="p-2 bg-white rounded">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold">TR Progression Risk:</span>
                              <span className="font-bold text-red-700 text-xs">{riskBenefit.risks.trProgressionRisk}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Long-term risk with additional leads
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-red-100 rounded">
                            <div className="font-semibold text-sm">Overall Risk Category: {riskBenefit.risks.riskCategory}</div>
                            <div className="text-xs text-gray-700 mt-1">
                              Based on combined infection + mechanical risk
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* BENEFITS PANEL */}
                      <div className="border-2 rounded-lg p-4 bg-green-50 border-green-200">
                        <h3 className="font-bold mb-3 text-green-800 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Trial Results
                        </h3>
                        <div className="space-y-2 text-sm">
                          {upgradeType === 'crt' && riskBenefit.benefits.hfReduction > 0 && (
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                              <span>HF Reduction:</span>
                              <span className="font-bold text-green-700">{riskBenefit.benefits.hfReduction}% RRR</span>
                            </div>
                          )}
                          {riskBenefit.benefits.mortalityReduction > 0 && (
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                              <span>Mortality Reduction:</span>
                              <span className="font-bold text-green-700">{riskBenefit.benefits.mortalityReduction}% RRR</span>
                            </div>
                          )}
                          {upgradeType === 'crt' && riskBenefit.benefits.lvefImprovement > 0 && (
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                              <span>LVEF Improvement:</span>
                              <span className="font-bold text-green-700">+{riskBenefit.benefits.lvefImprovement}%</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center p-2 bg-white rounded">
                            <span>Quality of Life:</span>
                            <span className="font-bold text-green-700 text-xs">{riskBenefit.benefits.qolImprovement}</span>
                          </div>
                          <div className="mt-2 p-2 bg-green-100 rounded text-xs">
                            <div className="font-semibold mb-1">Trial: {riskBenefit.benefits.trialReference}</div>
                          </div>
                          
                          {/* Benefit Certainty Warning */}
                          <div className={`mt-3 p-3 rounded-lg border-2 ${
                            riskBenefit.applicability.level === 'HIGH' ? 'bg-green-100 border-green-400' :
                            riskBenefit.applicability.level === 'MODERATE' ? 'bg-yellow-100 border-yellow-400' :
                            'bg-orange-100 border-orange-400'
                          }`}>
                            <div className="font-semibold text-xs mb-1 flex items-center gap-1">
                              {riskBenefit.applicability.level === 'HIGH' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                              Applicability to This Patient:
                            </div>
                            <div className={`text-xs ${
                              riskBenefit.applicability.level === 'HIGH' ? 'text-green-900' :
                              riskBenefit.applicability.level === 'MODERATE' ? 'text-yellow-900' :
                              'text-orange-900'
                            }`}>
                              {riskBenefit.benefits.benefitCertainty}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MATRIX VISUALIZATION */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <h3 className="font-bold mb-3 text-center">Risk-Benefit Decision Matrix</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr>
                              <th className="border p-2 bg-gray-200"></th>
                              <th className="border p-2 bg-green-100">LOW RISK</th>
                              <th className="border p-2 bg-yellow-100">MODERATE RISK</th>
                              <th className="border p-2 bg-red-100">HIGH RISK</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border p-2 bg-green-100 font-semibold">HIGH Applicability</td>
                              <td className={`border p-2 text-center font-semibold ${riskBenefit.applicability.level === 'HIGH' && riskBenefit.risks.riskCategory === 'LOW' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                STRONG RECOMMENDATION
                              </td>
                              <td className={`border p-2 text-center font-semibold ${riskBenefit.applicability.level === 'HIGH' && riskBenefit.risks.riskCategory === 'MODERATE' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                RECOMMEND
                              </td>
                              <td className={`border p-2 text-center font-semibold ${riskBenefit.applicability.level === 'HIGH' && riskBenefit.risks.riskCategory === 'HIGH' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                CONSIDER MDT
                              </td>
                            </tr>
                            <tr>
                              <td className="border p-2 bg-yellow-100 font-semibold">MODERATE Applicability</td>
                              <td className={`border p-2 text-center font-semibold ${riskBenefit.applicability.level === 'MODERATE' && riskBenefit.risks.riskCategory === 'LOW' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                RECOMMEND
                              </td>
                              <td className={`border p-2 text-center font-semibold ${riskBenefit.applicability.level === 'MODERATE' && riskBenefit.risks.riskCategory === 'MODERATE' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                CONSIDER MDT
                              </td>
                              <td className={`border p-2 text-center font-semibold ${riskBenefit.applicability.level === 'MODERATE' && riskBenefit.risks.riskCategory === 'HIGH' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                MDT REQUIRED
                              </td>
                            </tr>
                            <tr>
                              <td className="border p-2 bg-red-100 font-semibold">LOW Applicability</td>
                              <td className={`border p-2 text-center font-semibold ${riskBenefit.applicability.level === 'LOW' && riskBenefit.risks.riskCategory === 'LOW' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                CONSIDER MDT
                              </td>
                              <td className={`border p-2 text-center font-semibold ${riskBenefit.applicability.level === 'LOW' && riskBenefit.risks.riskCategory === 'MODERATE' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                MDT REQUIRED
                              </td>
                              <td className={`border p-2 text-center font-semibold ${riskBenefit.applicability.level === 'LOW' && riskBenefit.risks.riskCategory === 'HIGH' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                NOT RECOMMENDED
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 text-xs text-center text-gray-600 italic">
                        Current patient position highlighted in blue
                      </div>
                    </div>

                    {/* FRAILTY AND PROGNOSIS REFERENCE - Only show if CFS 6 or higher */}
                    {(upgrade.cfs === '6' || upgrade.cfs === '7' || upgrade.cfs === '8' || upgrade.cfs === '9') && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                        <h3 className="font-bold mb-2 text-yellow-900 flex items-center gap-2">
                          <Info className="w-5 h-5" />
                          Clinical Frailty Scale and Prognosis (Population Estimates - Reference Only)
                        </h3>
                        <p className="text-xs text-yellow-900 mb-3 italic">
                          Population-level survival estimates with substantial individual variation:
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          {upgrade.cfs === '6' && (
                            <div className="p-3 bg-white rounded border border-yellow-200">
                              <div className="font-semibold text-gray-800">CFS 6 (Moderately Frail):</div>
                              <div className="text-sm text-gray-700 mt-1">
                                Median survival: <span className="font-semibold">2-3 years</span> (IQR: 1-4 years)
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Requires help with instrumental ADLs, outdoor activities limited
                              </div>
                            </div>
                          )}
                          
                          {(upgrade.cfs === '7' || upgrade.cfs === '8' || upgrade.cfs === '9') && (
                            <>
                              <div className="p-3 bg-white rounded border border-orange-200">
                                <div className="font-semibold text-gray-800">CFS 7 (Severely Frail):</div>
                                <div className="text-sm text-gray-700 mt-1">
                                  Median survival: <span className="font-semibold">1-2 years</span> (IQR: 0.5-3 years)
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Completely dependent for personal care, stable condition
                                </div>
                              </div>
                              
                              <div className="p-3 bg-white rounded border border-red-300">
                                <div className="font-semibold text-gray-800">CFS 8 (Very Severely Frail):</div>
                                <div className="text-sm text-gray-700 mt-1">
                                  Median survival: <span className="font-semibold">3-6 months</span> (IQR: 1-12 months)
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Completely dependent, approaching end of life
                                </div>
                              </div>
                              
                              <div className="p-3 bg-red-100 rounded border-2 border-red-400">
                                <div className="font-semibold text-red-900">CFS 9 (Terminally Ill):</div>
                                <div className="text-sm text-red-900 mt-1">
                                  Life expectancy: <span className="font-semibold">&lt;6 months</span>
                                </div>
                                <div className="text-xs text-red-800 mt-1">
                                  Device deactivation discussion strongly recommended
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="mt-3 p-3 bg-yellow-100 rounded text-xs text-yellow-900">
                          <div className="font-semibold mb-1">⚠️ Important:</div>
                          <div>Individual prognosis varies widely. These estimates inform competing mortality risk but cannot predict individual survival. Goals of care discussion recommended for shared decision-making, especially for CFS ≥7.</div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-600 italic">
                          References: Rockwood Clinical Frailty Scale; Pulignano 2016 (HF patients), Shamliyan 2013 (systematic review), Krahn 2012 (CIED patients)
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'cci' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Charlson Comorbidity Index (CCI) Calculator</CardTitle>
              <p className="text-sm text-gray-600 mt-2">The Charlson Comorbidity Index predicts 10-year mortality based on age and comorbid conditions. Widely validated for risk stratification in CIED patients.</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* LEFT COLUMN - AGE AND CONDITIONS */}
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                    <label className="block text-sm font-medium mb-2">Patient Age</label>
                    <input 
                      type="number" 
                      value={cciCalc.age} 
                      onChange={e => setCciCalc({...cciCalc, age: e.target.value})} 
                      className="w-full p-2 border rounded" 
                      placeholder="Enter age in years"
                    />
                    <div className="mt-2 text-xs text-gray-600">
                      Age contributes: 50-59 (+1), 60-69 (+2), 70-79 (+3), 80+ (+4)
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="font-bold text-lg mb-3">Select All Conditions Present:</div>
                    
                    <div className="p-3 bg-gray-50 rounded border">
                      <div className="font-semibold mb-2 text-blue-800">1 Point Each:</div>
                      <div className="space-y-2">
                        <label className="flex items-start cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.mi} onChange={e => setCciCalc({...cciCalc, mi: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Myocardial Infarction</div>
                            <div className="text-xs text-gray-600">History of definite MI (ECG or enzyme changes)</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.chf} onChange={e => setCciCalc({...cciCalc, chf: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Congestive Heart Failure</div>
                            <div className="text-xs text-gray-600">Exertional or paroxysmal nocturnal dyspnea with response to treatment</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.pvd} onChange={e => setCciCalc({...cciCalc, pvd: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Peripheral Vascular Disease</div>
                            <div className="text-xs text-gray-600">Claudication, prior bypass, gangrene, untreated AAA (≥6 cm)</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.cvd} onChange={e => setCciCalc({...cciCalc, cvd: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Cerebrovascular Disease</div>
                            <div className="text-xs text-gray-600">CVA with mild/no residual or TIA</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.dementia} onChange={e => setCciCalc({...cciCalc, dementia: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Dementia</div>
                            <div className="text-xs text-gray-600">Chronic cognitive deficit</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.copd} onChange={e => setCciCalc({...cciCalc, copd: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Chronic Pulmonary Disease</div>
                            <div className="text-xs text-gray-600">COPD, asthma, requiring therapy</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.ctd} onChange={e => setCciCalc({...cciCalc, ctd: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Connective Tissue Disease</div>
                            <div className="text-xs text-gray-600">SLE, polymyositis, mixed CTD, polymyalgia rheumatica, moderate/severe RA</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.pud} onChange={e => setCciCalc({...cciCalc, pud: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Peptic Ulcer Disease</div>
                            <div className="text-xs text-gray-600">Treated for PUD</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.mld} onChange={e => setCciCalc({...cciCalc, mld: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Mild Liver Disease</div>
                            <div className="text-xs text-gray-600">Cirrhosis without portal hypertension, chronic hepatitis</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.dmNoComp} onChange={e => setCciCalc({...cciCalc, dmNoComp: e.target.checked, dmWithComp: e.target.checked ? false : cciCalc.dmWithComp})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Diabetes Without Complications</div>
                            <div className="text-xs text-gray-600">Diet, oral, or insulin therapy without end-organ damage</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="p-3 bg-orange-50 rounded border-2 border-orange-300">
                      <div className="font-semibold mb-2 text-orange-800">2 Points Each:</div>
                      <div className="space-y-2">
                        <label className="flex items-start cursor-pointer hover:bg-orange-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.dmWithComp} onChange={e => setCciCalc({...cciCalc, dmWithComp: e.target.checked, dmNoComp: e.target.checked ? false : cciCalc.dmNoComp})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Diabetes With End-Organ Damage</div>
                            <div className="text-xs text-gray-600">Retinopathy, neuropathy, nephropathy</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-orange-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.hemiplegia} onChange={e => setCciCalc({...cciCalc, hemiplegia: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Hemiplegia</div>
                            <div className="text-xs text-gray-600">Paraplegia or hemiplegia from stroke or other cause</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-orange-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.ckd} onChange={e => setCciCalc({...cciCalc, ckd: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Moderate/Severe CKD</div>
                            <div className="text-xs text-gray-600">CrCl &lt;30 mL/min, dialysis, transplant, uremia</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-orange-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.tumor} onChange={e => setCciCalc({...cciCalc, tumor: e.target.checked, metastaticCancer: e.target.checked ? false : cciCalc.metastaticCancer})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Solid Tumor (non-metastatic)</div>
                            <div className="text-xs text-gray-600">Any solid tumor within past 5 years (exclude skin cancer)</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-orange-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.leukemia} onChange={e => setCciCalc({...cciCalc, leukemia: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Leukemia</div>
                            <div className="text-xs text-gray-600">Acute or chronic</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-orange-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.lymphoma} onChange={e => setCciCalc({...cciCalc, lymphoma: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Lymphoma</div>
                            <div className="text-xs text-gray-600">Multiple myeloma, lymphoma</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-orange-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.moderateSevereLiver} onChange={e => setCciCalc({...cciCalc, moderateSevereLiver: e.target.checked, mld: e.target.checked ? false : cciCalc.mld})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Moderate/Severe Liver Disease</div>
                            <div className="text-xs text-gray-600">Cirrhosis with portal hypertension ± variceal bleed history</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="p-3 bg-red-50 rounded border-2 border-red-400">
                      <div className="font-semibold mb-2 text-red-800">6 Points Each:</div>
                      <div className="space-y-2">
                        <label className="flex items-start cursor-pointer hover:bg-red-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.metastaticCancer} onChange={e => setCciCalc({...cciCalc, metastaticCancer: e.target.checked, tumor: e.target.checked ? false : cciCalc.tumor})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">Metastatic Solid Tumor</div>
                            <div className="text-xs text-gray-600">Any documented metastases</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-red-100 p-2 rounded">
                          <input type="checkbox" checked={cciCalc.aids} onChange={e => setCciCalc({...cciCalc, aids: e.target.checked})} className="mr-3 mt-1 w-4 h-4" />
                          <div>
                            <div className="font-medium">AIDS</div>
                            <div className="text-xs text-gray-600">Not just HIV positive, but AIDS diagnosis</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN - RESULTS */}
                <div className="space-y-4">
                  {(() => {
                    // Calculate CCI score
                    let score = 0;
                    const age = parseInt(cciCalc.age) || 0;
                    
                    // Age points
                    if (age >= 80) score += 4;
                    else if (age >= 70) score += 3;
                    else if (age >= 60) score += 2;
                    else if (age >= 50) score += 1;
                    
                    // 1 point conditions
                    if (cciCalc.mi) score += 1;
                    if (cciCalc.chf) score += 1;
                    if (cciCalc.pvd) score += 1;
                    if (cciCalc.cvd) score += 1;
                    if (cciCalc.dementia) score += 1;
                    if (cciCalc.copd) score += 1;
                    if (cciCalc.ctd) score += 1;
                    if (cciCalc.pud) score += 1;
                    if (cciCalc.mld && !cciCalc.moderateSevereLiver) score += 1;
                    if (cciCalc.dmNoComp && !cciCalc.dmWithComp) score += 1;
                    
                    // 2 point conditions
                    if (cciCalc.dmWithComp) score += 2;
                    if (cciCalc.hemiplegia) score += 2;
                    if (cciCalc.ckd) score += 2;
                    if (cciCalc.tumor && !cciCalc.metastaticCancer) score += 2;
                    if (cciCalc.leukemia) score += 2;
                    if (cciCalc.lymphoma) score += 2;
                    if (cciCalc.moderateSevereLiver) score += 3; // Original score is 3 in updated CCI
                    
                    // 6 point conditions
                    if (cciCalc.metastaticCancer) score += 6;
                    if (cciCalc.aids) score += 6;
                    
                    // Mortality predictions based on literature
                    let mortality1yr = '';
                    let mortality10yr = '';
                    let survival10yr = '';
                    let riskCategory = '';
                    let categoryColor = '';
                    
                    if (score === 0) {
                      mortality1yr = '~2%';
                      mortality10yr = '~10%';
                      survival10yr = '~90%';
                      riskCategory = 'Very Low';
                      categoryColor = 'bg-green-100 border-green-400 text-green-900';
                    } else if (score <= 2) {
                      mortality1yr = '5-8%';
                      mortality10yr = '20-25%';
                      survival10yr = '60-70%';
                      riskCategory = 'Low';
                      categoryColor = 'bg-green-100 border-green-400 text-green-900';
                    } else if (score <= 4) {
                      mortality1yr = '10-12%';
                      mortality10yr = '35-45%';
                      survival10yr = '40-50%';
                      riskCategory = 'Moderate';
                      categoryColor = 'bg-yellow-100 border-yellow-400 text-yellow-900';
                    } else if (score <= 6) {
                      mortality1yr = '15-20%';
                      mortality10yr = '50-60%';
                      survival10yr = '20-30%';
                      riskCategory = 'Moderate-High';
                      categoryColor = 'bg-orange-100 border-orange-400 text-orange-900';
                    } else if (score === 7) {
                      mortality1yr = '20-30%';
                      mortality10yr = '65-75%';
                      survival10yr = '10-20%';
                      riskCategory = 'High';
                      categoryColor = 'bg-red-100 border-red-400 text-red-900';
                    } else {
                      mortality1yr = '30-50%';
                      mortality10yr = '75-85%';
                      survival10yr = '<20%';
                      riskCategory = 'Very High';
                      categoryColor = 'bg-red-200 border-red-500 text-red-900';
                    }
                    
                    return (
                      <>
                        <div className={`p-6 rounded-lg border-2 ${categoryColor}`}>
                          <div className="text-center">
                            <div className="text-sm font-semibold mb-2">CHARLSON COMORBIDITY INDEX</div>
                            <div className="text-6xl font-bold mb-2">{score}</div>
                            <div className="text-lg font-semibold">{riskCategory} Risk</div>
                          </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                          <div className="font-bold mb-3 text-center">Mortality Predictions</div>
                          <div className="space-y-3">
                            <div className="p-3 bg-gray-50 rounded border">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">1-Year Mortality:</span>
                                <span className="font-bold text-lg">{mortality1yr}</span>
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded border">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">10-Year Mortality:</span>
                                <span className="font-bold text-lg">{mortality10yr}</span>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border border-blue-300">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">10-Year Survival:</span>
                                <span className="font-bold text-lg text-blue-700">{survival10yr}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Alert className="border-blue-500 bg-blue-50">
                          <AlertDescription>
                            <div className="font-bold mb-2">Clinical Interpretation for CIED Decisions:</div>
                            <div className="text-sm space-y-2">
                              {score === 0 && (
                                <p>Excellent health with minimal comorbidity burden. Competing mortality very low - ideal candidate for device therapy.</p>
                              )}
                              {score >= 1 && score <= 2 && (
                                <p>Low comorbidity burden typical of many patients. Competing mortality relatively low unless advanced age or frailty present.</p>
                              )}
                              {score >= 3 && score <= 4 && (
                                <p>Moderate comorbidity burden common in HF populations. Balance with functional status and arrhythmic risk. May influence long-term device benefit.</p>
                              )}
                              {score >= 5 && score <= 6 && (
                                <p><strong>Important threshold:</strong> Moderate-high comorbidity burden. Consider competing mortality risk carefully, especially in older patients or those with impaired functional status. May shift risk-benefit balance in marginal cases.</p>
                              )}
                              {score === 7 && (
                                <p><strong>High competing mortality:</strong> Substantial comorbidity burden suggests competing mortality likely exceeds typical arrhythmic benefit, particularly if functional status also impaired. MDT discussion recommended for device decisions.</p>
                              )}
                              {score >= 8 && (
                                <p><strong>Very high competing mortality:</strong> Extensive comorbidity burden with 1-year mortality 30-50%. Competing mortality strongly dominates arrhythmic risk in most scenarios. Consider goals of care and quality of life prioritization.</p>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>

                        <div className="p-4 bg-gray-50 rounded border">
                          <div className="font-bold mb-2">CCI Integration with CIED Tool:</div>
                          <div className="text-sm space-y-2">
                            <p>This CCI score can be entered into the upgrade or downgrade assessment tabs to refine risk stratification in complex cases.</p>
                            <p className="font-semibold text-blue-800">CCI is most valuable when:</p>
                            <ul className="list-disc ml-5 space-y-1">
                              <li>Patient is younger (&lt;75) with multiple comorbidities but preserved function</li>
                              <li>Borderline frailty (CFS 5-6) where disease burden clarifies risk</li>
                              <li>Discordance between functional status and comorbidity load</li>
                            </ul>
                            <p className="mt-2 text-xs text-gray-600">CCI ≥6 begins to flag meaningful competing mortality; CCI ≥7-8 indicates substantial competing risk that may outweigh arrhythmic benefit</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            // Transfer to upgrade tab
                            setUpgrade({...upgrade, cci: score.toString()});
                            setTab('upgrade');
                          }}
                          className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Use This Score in Upgrade Assessment
                        </button>

                        <button
                          onClick={() => {
                            // Transfer to downgrade tab
                            setDowngrade({...downgrade, cci: score.toString()});
                            setTab('downgrade');
                          }}
                          className="w-full p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          Use This Score in Downgrade Assessment
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-bold mb-3">Original Charlson Comorbidity Index Scoring</h3>
                <div className="text-sm space-y-2">
                  <p><strong>Age Adjustment:</strong> 1 point for each decade over 40 (50-59: +1, 60-69: +2, 70-79: +3, 80+: +4)</p>
                  <p className="mt-3"><strong>Conditions by Weight:</strong></p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li><strong>1 Point:</strong> MI, CHF, PVD, CVD, Dementia, COPD, CTD, PUD, Mild Liver Disease, Diabetes without complications</li>
                    <li><strong>2 Points:</strong> Hemiplegia, Moderate/Severe CKD, Diabetes with end-organ damage, Any tumor (non-metastatic), Leukemia, Lymphoma</li>
                    <li><strong>3 Points:</strong> Moderate/Severe Liver Disease (cirrhosis with portal HTN)</li>
                    <li><strong>6 Points:</strong> Metastatic solid tumor, AIDS</li>
                  </ul>
                  <p className="mt-3 text-xs text-gray-600 italic">
                    <strong>Key Principle:</strong> Conditions are mutually exclusive within categories (e.g., mild vs moderate/severe liver disease; diabetes with vs without complications; solid tumor vs metastatic cancer). Select the highest applicable severity.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="font-bold mb-2 text-blue-900">References:</div>
                <div className="text-xs text-gray-700 space-y-1">
                  <p>• Charlson ME et al. J Chronic Dis. 1987;40(5):373-383. (Original development and validation)</p>
                  <p>• Charlson M et al. J Clin Epidemiol. 1994;47(11):1245-1251. (10-year mortality prediction)</p>
                  <p>• Hemmelgarn BR et al. Kidney Int. 2003;63(4):1296-1298. (CKD population validation)</p>
                  <p>• Quan H et al. Med Care. 2005;43(11):1130-1139. (ICD coding algorithms)</p>
                  <p>• Krahn AD et al. Circ Arrhythm Electrophysiol. 2012;5(6):1127-1133. (CIED population application)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'cfs' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Frailty Scale (CFS) Assessment</CardTitle>
              <p className="text-sm text-gray-600 mt-2">The Clinical Frailty Scale (Rockwood et al.) is a validated 9-point scale for assessing frailty in older adults, widely used in clinical decision-making for device therapy.</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <img 
                  src="https://www.mdcalc.com/sites/default/files/cfs-graph-official_0.png" 
                  alt="Clinical Frailty Scale" 
                  className="w-full max-w-4xl mx-auto border-2 border-gray-300 rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div style={{display: 'none'}} className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Clinical Frailty Scale visual reference unavailable. Please refer to: <a href="https://www.dal.ca/sites/gmr/our-tools/clinical-frailty-scale.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Dalhousie University CFS Official Site</a></p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <div className="font-bold text-green-800 mb-2">CFS 1-3: Fit to Managing Well</div>
                    <ul className="text-sm space-y-1 ml-4 list-disc">
                      <li><strong>CFS 1 (Very Fit):</strong> Robust, active, energetic, motivated</li>
                      <li><strong>CFS 2 (Well):</strong> No active disease, less fit than CFS 1</li>
                      <li><strong>CFS 3 (Managing Well):</strong> Medical problems well controlled, not regularly active</li>
                    </ul>
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>CIED Implications:</strong> Low competing mortality, excellent candidates for device therapy
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                    <div className="font-bold text-blue-800 mb-2">CFS 4: Vulnerable</div>
                    <p className="text-sm">Not dependent but symptoms limit activities. Commonly complains of being "slowed up" or fatigued during the day.</p>
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>CIED Implications:</strong> Generally good candidates, monitor for progression
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <div className="font-bold text-yellow-800 mb-2">CFS 5: Mildly Frail</div>
                    <p className="text-sm">Limited dependence on others for instrumental ADLs (finances, transportation, heavy housework, medications).</p>
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>CIED Implications:</strong> Consider carefully, balance benefits with competing risks
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                    <div className="font-bold text-orange-800 mb-2">CFS 6: Moderately Frail</div>
                    <p className="text-sm">Help needed with all outside activities and housekeeping. Problems with stairs, bathing; may need minimal assistance with dressing.</p>
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>CIED Implications:</strong> Median survival 2-3 years; consider competing mortality carefully
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="font-bold text-red-800 mb-2">CFS 7: Severely Frail</div>
                    <p className="text-sm">Completely dependent for personal care. Clinically stable but not terminally ill (likely to recover from minor illness).</p>
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>CIED Implications:</strong> Median survival 1-2 years; competing mortality exceeds arrhythmic risk in most cases
                    </div>
                  </div>

                  <div className="p-4 bg-red-100 border-2 border-red-400 rounded-lg">
                    <div className="font-bold text-red-900 mb-2">CFS 8: Very Severely Frail</div>
                    <p className="text-sm">Completely dependent, approaching end of life. Typically cannot recover even from minor illness.</p>
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>CIED Implications:</strong> Median survival 3-6 months; downgrade/deactivation strongly recommended
                    </div>
                  </div>

                  <div className="p-4 bg-red-200 border-2 border-red-500 rounded-lg">
                    <div className="font-bold text-red-900 mb-2">CFS 9: Terminally Ill</div>
                    <p className="text-sm">Approaching the end of life. Life expectancy &lt;6 months (not otherwise clearly dementia or frailty).</p>
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>CIED Implications:</strong> Device deactivation discussion essential; comfort care priority
                    </div>
                  </div>

                  <Alert className="border-blue-500 bg-blue-50">
                    <AlertDescription>
                      <div className="text-sm space-y-2">
                        <p className="font-semibold">Key Assessment Principles:</p>
                        <ul className="list-disc ml-5 space-y-1">
                          <li>Score based on patient's baseline functional status 2 weeks ago (not acute illness state)</li>
                          <li>Consider usual function, not best or worst day</li>
                          <li>If uncertain between two categories, choose higher score</li>
                          <li>Validated in multiple CIED populations for mortality prediction</li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-bold mb-3">CFS and Prognosis in CIED Patients</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2">CFS Score</th>
                        <th className="border p-2">1-Year Mortality</th>
                        <th className="border p-2">Median Survival</th>
                        <th className="border p-2">CIED Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2 bg-green-50">CFS 1-3</td>
                        <td className="border p-2">5-10%</td>
                        <td className="border p-2">&gt;10 years</td>
                        <td className="border p-2">Excellent candidates</td>
                      </tr>
                      <tr>
                        <td className="border p-2 bg-blue-50">CFS 4</td>
                        <td className="border p-2">10-15%</td>
                        <td className="border p-2">5-10 years</td>
                        <td className="border p-2">Good candidates</td>
                      </tr>
                      <tr>
                        <td className="border p-2 bg-yellow-50">CFS 5</td>
                        <td className="border p-2">15-20%</td>
                        <td className="border p-2">3-5 years</td>
                        <td className="border p-2">Consider carefully</td>
                      </tr>
                      <tr>
                        <td className="border p-2 bg-orange-50">CFS 6</td>
                        <td className="border p-2">25-35%</td>
                        <td className="border p-2">2-3 years</td>
                        <td className="border p-2">Competing mortality significant</td>
                      </tr>
                      <tr>
                        <td className="border p-2 bg-red-50">CFS 7</td>
                        <td className="border p-2">40-60%</td>
                        <td className="border p-2">1-2 years</td>
                        <td className="border p-2">Consider downgrade/MDT</td>
                      </tr>
                      <tr>
                        <td className="border p-2 bg-red-100">CFS 8</td>
                        <td className="border p-2">70-90%</td>
                        <td className="border p-2">3-6 months</td>
                        <td className="border p-2">Downgrade recommended</td>
                      </tr>
                      <tr>
                        <td className="border p-2 bg-red-200">CFS 9</td>
                        <td className="border p-2">&gt;90%</td>
                        <td className="border p-2">&lt;6 months</td>
                        <td className="border p-2">Deactivation discussion</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-600 mt-3 italic">
                  References: Rockwood et al. CMAJ 2005; Krahn et al. Circ Arrhythm Electrophysiol 2012; Orkaby et al. J Am Geriatr Soc 2017; Dunlay et al. Eur Heart J 2017
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'downgrade' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CIED Downgrade Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input type="number" value={downgrade.age} onChange={e => setDowngrade({...downgrade, age: e.target.value})} className="w-full p-2 border rounded" placeholder="years" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frailty (Clinical Frailty Scale)</label>
                  <select value={downgrade.frailty} onChange={e => setDowngrade({...downgrade, frailty: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="1-3">CFS 1-3 (Fit to Managing Well)</option>
                    <option value="4">CFS 4 (Vulnerable)</option>
                    <option value="5">CFS 5 (Mildly Frail)</option>
                    <option value="6">CFS 6 (Moderately Frail)</option>
                    <option value="7">CFS 7 (Severely Frail)</option>
                    <option value="8">CFS 8 (Very Severely Frail)</option>
                    <option value="9">CFS 9 (Terminally Ill)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Terminal Illness</label>
                  <select value={downgrade.terminalIllness} onChange={e => setDowngrade({...downgrade, terminalIllness: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Life Expectancy</label>
                  <select value={downgrade.lifeExpectancy} onChange={e => setDowngrade({...downgrade, lifeExpectancy: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="<6months">Under 6 months</option>
                    <option value="6-12months">6-12 months</option>
                    <option value=">1year">Over 1 year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Device</label>
                  <select value={downgrade.currentDevice} onChange={e => setDowngrade({...downgrade, currentDevice: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="icd">ICD</option>
                    <option value="crt-d">CRT-D</option>
                    <option value="crt-p">CRT-P</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ICD Lead Type</label>
                  <select value={downgrade.leadType} onChange={e => setDowngrade({...downgrade, leadType: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="df1">DF-1</option>
                    <option value="df4">DF-4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Inappropriate Shocks (last year)</label>
                  <input type="number" value={downgrade.inappropriateShocks} onChange={e => setDowngrade({...downgrade, inappropriateShocks: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current LVEF (%)</label>
                  <input type="number" value={downgrade.lvef} onChange={e => setDowngrade({...downgrade, lvef: e.target.value})} className="w-full p-2 border rounded" placeholder="%" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cardiomyopathy Type</label>
                  <select value={downgrade.cardiomyopathyType} onChange={e => setDowngrade({...downgrade, cardiomyopathyType: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="ischemic">Ischemic</option>
                    <option value="nonischemic">Non-ischemic</option>
                    <option value="recovered">Recovered/Normalized</option>
                    <option value="none">No cardiomyopathy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ICD Indication</label>
                  <select value={downgrade.icdIndication} onChange={e => setDowngrade({...downgrade, icdIndication: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="primary">Primary prevention</option>
                    <option value="secondary">Secondary prevention</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NYHA Class</label>
                  <select value={downgrade.nyha} onChange={e => setDowngrade({...downgrade, nyha: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="1">I</option>
                    <option value="2">II</option>
                    <option value="3">III</option>
                    <option value="4">IV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ever Had Appropriate ICD Therapy (select all that apply)</label>
                  <div className="space-y-2 p-3 border rounded bg-white">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={downgrade.everHadAppropriateShock.includes('never')}
                        onChange={e => {
                          if (e.target.checked) {
                            setDowngrade({...downgrade, everHadAppropriateShock: ['never']});
                          } else {
                            setDowngrade({...downgrade, everHadAppropriateShock: []});
                          }
                        }}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm">Never</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={downgrade.everHadAppropriateShock.includes('vf')}
                        onChange={e => {
                          const current = downgrade.everHadAppropriateShock.filter(x => x !== 'never');
                          if (e.target.checked) {
                            setDowngrade({...downgrade, everHadAppropriateShock: [...current, 'vf']});
                          } else {
                            setDowngrade({...downgrade, everHadAppropriateShock: current.filter(x => x !== 'vf')});
                          }
                        }}
                        disabled={downgrade.everHadAppropriateShock.includes('never')}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm">VF or fast VT (≥200 bpm)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={downgrade.everHadAppropriateShock.includes('slow-vt')}
                        onChange={e => {
                          const current = downgrade.everHadAppropriateShock.filter(x => x !== 'never');
                          if (e.target.checked) {
                            setDowngrade({...downgrade, everHadAppropriateShock: [...current, 'slow-vt']});
                          } else {
                            setDowngrade({...downgrade, everHadAppropriateShock: current.filter(x => x !== 'slow-vt')});
                          }
                        }}
                        disabled={downgrade.everHadAppropriateShock.includes('never')}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm">Slow VT only (&lt;200 bpm)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={downgrade.everHadAppropriateShock.includes('storm')}
                        onChange={e => {
                          const current = downgrade.everHadAppropriateShock.filter(x => x !== 'never');
                          if (e.target.checked) {
                            setDowngrade({...downgrade, everHadAppropriateShock: [...current, 'storm']});
                          } else {
                            setDowngrade({...downgrade, everHadAppropriateShock: current.filter(x => x !== 'storm')});
                          }
                        }}
                        disabled={downgrade.everHadAppropriateShock.includes('never')}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm">VT storm (≥3 episodes in 24h)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Since Last VT/VF</label>
                  <select value={downgrade.timeFromLastVTVF} onChange={e => setDowngrade({...downgrade, timeFromLastVTVF: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">N/A or Select</option>
                    <option value="<3months">&lt;3 months</option>
                    <option value="3-12months">3-12 months</option>
                    <option value=">12months">&gt;12 months</option>
                    <option value=">2years">&gt;2 years</option>
                    <option value=">5years">&gt;5 years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NSVT on Monitoring</label>
                  <select value={downgrade.nsvt} onChange={e => setDowngrade({...downgrade, nsvt: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pacing Dependent</label>
                  <select value={downgrade.pacingDependent} onChange={e => setDowngrade({...downgrade, pacingDependent: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Goals of Care</label>
                  <select value={downgrade.goalsOfCare} onChange={e => setDowngrade({...downgrade, goalsOfCare: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="longevity">Life-prolonging focus</option>
                    <option value="balance">Quality of life focus</option>
                    <option value="comfort">Comfort focus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Patient Preference</label>
                  <select value={downgrade.patientPreference} onChange={e => setDowngrade({...downgrade, patientPreference: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="continue">Continue Therapy</option>
                    <option value="uncertain">Uncertain</option>
                    <option value="deactivate">Deactivate/Downgrade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Family Involvement</label>
                  <select value={downgrade.familyInvolvement} onChange={e => setDowngrade({...downgrade, familyInvolvement: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="supportive">Supportive</option>
                    <option value="uncertain">Uncertain</option>
                    <option value="opposed">Opposed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Charlson Comorbidity Index (Optional)
                    <span className="text-xs text-gray-500 ml-1">- for complex cases</span>
                  </label>
                  <input type="number" value={downgrade.cci || ''} onChange={e => setDowngrade({...downgrade, cci: e.target.value})} className="w-full p-2 border rounded" placeholder="0-10+" />
                  <div className="text-xs text-gray-500 mt-1">Helps quantify competing mortality risk</div>
                </div>
              </div>
              
              {downgrade.cci && parseFloat(downgrade.cci) > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="font-semibold text-sm text-blue-900 mb-2">CCI Score Interpretation:</div>
                  <div className="text-xs text-gray-700">
                    {parseFloat(downgrade.cci) >= 8 && (
                      <p><strong>CCI ≥8:</strong> Very high comorbidity burden. 1-year mortality ~30-50%, 10-year survival &lt;20%. Strongly suggests competing mortality exceeds arrhythmic benefit in most scenarios.</p>
                    )}
                    {parseFloat(downgrade.cci) === 7 && (
                      <p><strong>CCI 7:</strong> High comorbidity burden. 1-year mortality ~20-30%, 10-year survival ~10-20%. Competing mortality likely substantial, especially if functional status also impaired.</p>
                    )}
                    {parseFloat(downgrade.cci) >= 5 && parseFloat(downgrade.cci) <= 6 && (
                      <p><strong>CCI 5-6:</strong> Moderate-high comorbidity burden. 1-year mortality ~15-20%, 10-year survival ~20-30%. Consider competing mortality risk, particularly in older patients or those with impaired functional status.</p>
                    )}
                    {parseFloat(downgrade.cci) >= 3 && parseFloat(downgrade.cci) <= 4 && (
                      <p><strong>CCI 3-4:</strong> Moderate comorbidity burden. 1-year mortality ~10-12%, 10-year survival ~40-50%. Typical for many HF patients; balance with arrhythmic risk and functional status.</p>
                    )}
                    {parseFloat(downgrade.cci) >= 1 && parseFloat(downgrade.cci) <= 2 && (
                      <p><strong>CCI 1-2:</strong> Low comorbidity burden. 1-year mortality ~5-8%, 10-year survival ~60-70%. Competing mortality relatively low unless advanced age or severe frailty present.</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Integrated Risk-Benefit Assessment for Downgrade</CardTitle></CardHeader>
            <CardContent>
              {/* CALCULATE COMPETING MORTALITY RISK */}
              {(() => {
                let competingRisk = 'LOW';
                const competingFactors = [];
                const age = parseFloat(downgrade.age);
                const cci = parseFloat(downgrade.cci) || 0;
                
                // AGE - Evidence from Krahn 2012, Merchant 2019
                if (age > 85) {
                  competingRisk = 'HIGH';
                  competingFactors.push('Age >85 (5-year mortality ~40-50% even with ICD)');
                } else if (age > 80) {
                  if (competingRisk !== 'HIGH') competingRisk = 'MODERATE';
                  competingFactors.push('Age 80-85 (5-year mortality ~30-40%)');
                } else if (age > 75) {
                  if (competingRisk === 'LOW') competingRisk = 'MODERATE';
                  competingFactors.push('Age 75-80 (5-year mortality ~20-30%)');
                }
                
                // FRAILTY - Evidence from Krahn 2012, Orkaby 2017, Dunlay 2017
                if (downgrade.frailty === '8' || downgrade.frailty === '9') {
                  competingRisk = 'HIGH';
                  competingFactors.push(`CFS ${downgrade.frailty} (median survival 3-6 months, 1-year mortality ~70-90%)`);
                } else if (downgrade.frailty === '7') {
                  competingRisk = 'HIGH';
                  competingFactors.push('CFS 7 (median survival 1-2 years, 1-year mortality ~40-60%)');
                } else if (downgrade.frailty === '6') {
                  if (competingRisk !== 'HIGH') competingRisk = 'MODERATE';
                  competingFactors.push('CFS 6 (median survival 2-3 years, 1-year mortality ~25-35%)');
                } else if (downgrade.frailty === '5') {
                  if (competingRisk === 'LOW') competingRisk = 'MODERATE';
                  competingFactors.push('CFS 5 (mildly frail, 1-year mortality ~15-20%)');
                }
                
                // CCI ASSESSMENT - Adds value when functional status doesn't tell full story
                // Based on Charlson 1987, 1994; Hemmelgarn 2003; Fried 2004; Lee 2006
                if (cci >= 8) {
                  // CCI ≥8: Very high mortality risk (10-year survival <20%, 1-year mortality 20-50%)
                  if (competingRisk !== 'HIGH') competingRisk = 'HIGH';
                  competingFactors.push('CCI ≥8 (1-year mortality ~30-50%, 10-year survival <20%) - very high comorbidity burden');
                } else if (cci >= 7) {
                  // CCI 7: High risk, especially if discordant with CFS
                  if (downgrade.frailty === '6') {
                    // CCI 7 + CFS 6 = MODERATE-HIGH (maps to HIGH for matrix)
                    competingRisk = 'HIGH';
                    competingFactors.push('CCI 7 + CFS 6 (MODERATE-HIGH competing mortality: 1-year mortality ~35-45%, combined disease burden and impaired reserve approach HIGH threshold)');
                  } else if (downgrade.frailty === '5' || downgrade.frailty === '1-3' || downgrade.frailty === '4') {
                    if (competingRisk !== 'HIGH') competingRisk = 'MODERATE';
                    competingFactors.push('CCI 7 (1-year mortality ~20-30%) - high comorbidity burden may exceed risk apparent from functional status');
                  }
                } else if (cci >= 6) {
                  // CCI 6: Moderate-high risk in younger or more functional patients
                  if (downgrade.frailty === '6') {
                    // CCI 6 + CFS 6 = MODERATE-HIGH
                    if (competingRisk !== 'HIGH') competingRisk = 'MODERATE';
                    competingFactors.push('CCI 6 + CFS 6 (MODERATE-HIGH competing mortality: combined moderate disease burden and frailty)');
                  } else if (age < 75 && (downgrade.frailty === '1-3' || downgrade.frailty === '4' || downgrade.frailty === '5')) {
                    if (competingRisk === 'LOW') competingRisk = 'MODERATE';
                    competingFactors.push('CCI 6 (1-year mortality ~15-20%) - multiple comorbidities increase competing mortality despite preserved function');
                  }
                } else if (cci >= 5) {
                  // CCI 5: Flags risk in younger patients with preserved function
                  if (age < 70 && (downgrade.frailty === '1-3' || downgrade.frailty === '4')) {
                    competingFactors.push('CCI 5 (1-year mortality ~10-15%) - moderate comorbidity burden to monitor');
                  }
                }
                
                // TERMINAL ILLNESS & LIFE EXPECTANCY - Evidence from Goldstein 2004, Kelley 2010
                if (downgrade.terminalIllness === 'yes' || downgrade.lifeExpectancy === '<6months') {
                  competingRisk = 'HIGH';
                  competingFactors.push('Terminal illness or life expectancy <6 months');
                } else if (downgrade.lifeExpectancy === '6-12months') {
                  competingRisk = 'HIGH';
                  competingFactors.push('Life expectancy 6-12 months (competing mortality >> arrhythmic risk)');
                }
                
                // ADVANCED HF - Evidence from Yancy 2013, PARADIGM-HF, GUIDE-HF
                if (downgrade.nyha === '4') {
                  if (competingRisk !== 'HIGH') competingRisk = 'MODERATE';
                  competingFactors.push('NYHA IV (1-year mortality ~40-50%, pump failure > arrhythmia)');
                } else if (downgrade.nyha === '3') {
                  if (competingRisk === 'LOW') competingRisk = 'MODERATE';
                  competingFactors.push('NYHA III (1-year mortality ~15-25%)');
                }
                
                // GOALS OF CARE - Strong evidence for patient preference (Goldstein 2004, Mueller 2003)
                if (downgrade.goalsOfCare === 'comfort') {
                  competingRisk = 'HIGH';
                  competingFactors.push('Comfort-focused care (patient/family values prioritize QOL over longevity)');
                } else if (downgrade.goalsOfCare === 'balance') {
                  if (competingRisk !== 'HIGH') competingRisk = 'MODERATE';
                  competingFactors.push('Quality of life focus (balance between longevity and treatment burden)');
                }
                
                // INAPPROPRIATE SHOCKS - QOL impact, Evidence from Poole 2008, Sears 2011
                const inappropShocks = parseFloat(downgrade.inappropriateShocks) || 0;
                if (inappropShocks >= 5) {
                  competingFactors.push('Frequent inappropriate shocks (≥5/year): Severe QOL impairment, HR ~2.0 for mortality from psychological stress');
                } else if (inappropShocks >= 3) {
                  competingFactors.push('Recurrent inappropriate shocks (3-4/year): Significant QOL impact');
                }
                
                // PATIENT PREFERENCE - Goldstein 2004
                if (downgrade.patientPreference === 'deactivate') {
                  competingFactors.push('Patient autonomous request for deactivation (ethically and legally valid)');
                }
                
                // Calculate matrix recommendation
                const arrhythmicRisk = downgradeResult.arrhythmicRisk;
                const downgradeMatrix = {
                  'HIGH': { 'LOW': 'CONTINUE ICD', 'MODERATE': 'MDT DISCUSSION', 'HIGH': 'CONSIDER DOWNGRADE' },
                  'MODERATE': { 'LOW': 'CONTINUE ICD', 'MODERATE': 'CONSIDER DOWNGRADE', 'HIGH': 'RECOMMEND DOWNGRADE' },
                  'LOW': { 'LOW': 'CONSIDER DOWNGRADE', 'MODERATE': 'RECOMMEND DOWNGRADE', 'HIGH': 'STRONGLY RECOMMEND DOWNGRADE' }
                };
                
                const matrixRecommendation = downgradeMatrix[arrhythmicRisk]?.[competingRisk] || 'MDT DISCUSSION';
                
                return (
                  <>
                    {/* INTEGRATED RECOMMENDATION AT TOP */}
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300">
                      <div className="text-center mb-4">
                        <div className="text-sm font-semibold text-gray-600 mb-2">INTEGRATED RECOMMENDATION</div>
                        <div className={`text-3xl font-bold mb-3 ${
                          matrixRecommendation.includes('STRONGLY') ? 'text-blue-700' :
                          matrixRecommendation.includes('RECOMMEND DOWNGRADE') ? 'text-green-700' :
                          matrixRecommendation.includes('CONSIDER DOWNGRADE') ? 'text-yellow-700' :
                          matrixRecommendation.includes('MDT') ? 'text-orange-700' :
                          'text-red-700'
                        }`}>
                          {matrixRecommendation}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-xs font-semibold text-gray-500 mb-1">ARRHYTHMIC RISK</div>
                          <div className={`text-2xl font-bold ${
                            arrhythmicRisk === 'HIGH' ? 'text-red-600' :
                            arrhythmicRisk === 'MODERATE' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {arrhythmicRisk}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {downgradeResult.annualArrhythmicRate}
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-xs font-semibold text-gray-500 mb-1">COMPETING MORTALITY/QOL RISK</div>
                          <div className={`text-2xl font-bold ${
                            competingRisk === 'LOW' ? 'text-green-600' :
                            competingRisk === 'MODERATE' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {competingRisk}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {competingFactors.length} factors identified
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center text-sm text-gray-600 italic">
                        Evidence-based matrix balancing arrhythmic risk against competing mortality and quality of life
                      </div>
                    </div>

                    {/* ARRHYTHMIC RISK ASSESSMENT */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <h3 className="font-bold text-lg mb-3 text-blue-900 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Ongoing Arrhythmic Risk Assessment
                      </h3>
                      <div className={`p-3 rounded-lg border-2 ${
                        downgradeResult.arrhythmicRisk === 'HIGH' ? 'bg-red-100 border-red-400' :
                        downgradeResult.arrhythmicRisk === 'MODERATE' ? 'bg-yellow-100 border-yellow-400' :
                        'bg-green-100 border-green-400'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg">Current Arrhythmic Risk:</span>
                          <span className={`text-2xl font-bold ${
                            downgradeResult.arrhythmicRisk === 'HIGH' ? 'text-red-700' :
                            downgradeResult.arrhythmicRisk === 'MODERATE' ? 'text-yellow-700' :
                            'text-green-700'
                          }`}>
                            {downgradeResult.arrhythmicRisk}
                          </span>
                        </div>
                        
                        <div className="mt-2 p-2 bg-white rounded border">
                          <div className="text-sm font-semibold">Estimated Annual Arrhythmic Event Rate:</div>
                          <div className="text-sm mt-1">{downgradeResult.annualArrhythmicRate}</div>
                        </div>
                        
                        {downgradeResult.riskFactors.length > 0 && (
                          <div className="mt-3">
                            <div className="font-semibold text-sm mb-1">Risk Factors Present:</div>
                            <ul className="list-disc ml-5 space-y-1">
                              {downgradeResult.riskFactors.map((f, i) => (
                                <li key={i} className="text-sm">{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 p-3 bg-white rounded border text-xs text-gray-700 space-y-2">
                        <p className="font-semibold">Evidence Base for Arrhythmic Risk Stratification:</p>
                        <p><strong>HIGH risk:</strong> Prior VF or fast VT ≥200 bpm (HR ~2.8 for mortality, MADIT analysis); VT storm (HR ~3-4); Secondary prevention with events</p>
                        <p><strong>MODERATE risk:</strong> LVEF ≤35% (~3-5% annual SCD risk in trials); NSVT (HR ~1.5-2.0); Advanced HF (NYHA III-IV); Slow VT &lt;200 bpm (HR ~1.2, not significant)</p>
                        <p><strong>LOW risk:</strong> LVEF recovered >50%; Primary prevention never requiring therapy (note: 30-40% do receive appropriate therapy over 5 years per SCD-HeFT, MADIT-II, but absence of therapy after several years may indicate lower individual risk)</p>
                        <p className="pt-2 border-t border-gray-300 italic"><strong>Key finding:</strong> First appropriate shock matters most - repeated shocks don't add incremental mortality risk (MADIT-II, MADIT-CRT data). TYPE of arrhythmia (fast vs slow VT) is more important than TIMING of events.</p>
                      </div>
                    </div>

                    {/* COMPETING MORTALITY/QOL RISK */}
                    <div className="mb-4 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                      <h3 className="font-bold text-lg mb-3 text-orange-900 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Competing Mortality & Quality of Life Risk
                      </h3>
                      <div className={`p-3 rounded-lg border-2 ${
                        competingRisk === 'LOW' ? 'bg-green-100 border-green-400' :
                        competingRisk === 'MODERATE' ? 'bg-yellow-100 border-yellow-400' :
                        'bg-red-100 border-red-400'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg">Competing Risk Level:</span>
                          <span className={`text-2xl font-bold ${
                            competingRisk === 'LOW' ? 'text-green-700' :
                            competingRisk === 'MODERATE' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {competingRisk}
                          </span>
                        </div>
                        
                        {competingFactors.length > 0 && (
                          <div className="mt-3">
                            <div className="font-semibold text-sm mb-1">Competing Risk Factors Present:</div>
                            <ul className="list-disc ml-5 space-y-1">
                              {competingFactors.map((f, i) => (
                                <li key={i} className="text-sm">{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 p-3 bg-white rounded border text-xs text-gray-700 space-y-2">
                        <p className="font-semibold">Evidence Base for Competing Mortality Risk:</p>
                        <p><strong>HIGH risk:</strong> Age >85 (5-yr mortality 40-50%, Krahn 2012); CFS 7-9 (median survival under 2 years, Rockwood 2005, Dunlay 2017); CCI ≥8 (1-yr mortality 30-50%, Charlson 1994, Hemmelgarn 2003); Terminal illness or life expectancy under 12 months (Goldstein 2004); NYHA IV in some contexts; Comfort care goals</p>
                        <p><strong>MODERATE risk:</strong> Age 75-85 (5-yr mortality 20-40%); CFS 5-6 (1-yr mortality 15-35%, Orkaby 2017); CCI 6-7 (1-yr mortality 15-30%, especially discordant with preserved CFS); NYHA III-IV; Palliative goals; Recurrent inappropriate shocks (Poole 2008, Sears 2011)</p>
                        <p><strong>LOW risk:</strong> Age under 75; No/minimal frailty (CFS 1-4); CCI under 5; Good functional status; Curative goals</p>
                        <p className="pt-2 border-t border-gray-300 italic"><strong>Key principle:</strong> When competing mortality exceeds arrhythmic risk, ICD therapy provides diminishing benefit. Patient values and QOL become paramount in decision-making. CCI particularly valuable when functional status (CFS) doesn't fully reflect disease burden (e.g., younger patients with multiple comorbidities).</p>
                      </div>
                    </div>

                    {/* RISK-BENEFIT MATRIX VISUALIZATION */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <h3 className="font-bold mb-3 text-center">Downgrade Decision Matrix</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr>
                              <th className="border p-2 bg-gray-200"></th>
                              <th className="border p-2 bg-green-100">LOW Competing Risk</th>
                              <th className="border p-2 bg-yellow-100">MODERATE Competing Risk</th>
                              <th className="border p-2 bg-red-100">HIGH Competing Risk</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border p-2 bg-red-100 font-semibold">HIGH Arrhythmic Risk</td>
                              <td className={`border p-2 text-center font-semibold ${arrhythmicRisk === 'HIGH' && competingRisk === 'LOW' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                CONTINUE ICD
                              </td>
                              <td className={`border p-2 text-center font-semibold ${arrhythmicRisk === 'HIGH' && competingRisk === 'MODERATE' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                MDT DISCUSSION
                              </td>
                              <td className={`border p-2 text-center font-semibold ${arrhythmicRisk === 'HIGH' && competingRisk === 'HIGH' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                CONSIDER DOWNGRADE
                              </td>
                            </tr>
                            <tr>
                              <td className="border p-2 bg-yellow-100 font-semibold">MODERATE Arrhythmic Risk</td>
                              <td className={`border p-2 text-center font-semibold ${arrhythmicRisk === 'MODERATE' && competingRisk === 'LOW' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                CONTINUE ICD
                              </td>
                              <td className={`border p-2 text-center font-semibold ${arrhythmicRisk === 'MODERATE' && competingRisk === 'MODERATE' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                CONSIDER DOWNGRADE
                              </td>
                              <td className={`border p-2 text-center font-semibold ${arrhythmicRisk === 'MODERATE' && competingRisk === 'HIGH' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                RECOMMEND DOWNGRADE
                              </td>
                            </tr>
                            <tr>
                              <td className="border p-2 bg-green-100 font-semibold">LOW Arrhythmic Risk</td>
                              <td className={`border p-2 text-center font-semibold ${arrhythmicRisk === 'LOW' && competingRisk === 'LOW' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                CONSIDER DOWNGRADE
                              </td>
                              <td className={`border p-2 text-center font-semibold ${arrhythmicRisk === 'LOW' && competingRisk === 'MODERATE' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                RECOMMEND DOWNGRADE
                              </td>
                              <td className={`border p-2 text-center font-semibold ${arrhythmicRisk === 'LOW' && competingRisk === 'HIGH' ? 'bg-blue-200 ring-2 ring-blue-600' : ''}`}>
                                STRONGLY RECOMMEND DOWNGRADE
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 text-xs text-center text-gray-600 italic">
                        Current patient position highlighted in blue
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 rounded text-xs text-gray-700">
                        <p className="font-semibold mb-1">Interpretation Guide:</p>
                        <p><strong>CONTINUE ICD:</strong> Arrhythmic benefit clearly exceeds competing risks</p>
                        <p><strong>MDT DISCUSSION:</strong> Balanced situation requiring multidisciplinary input and shared decision-making</p>
                        <p><strong>CONSIDER/RECOMMEND/STRONGLY RECOMMEND DOWNGRADE:</strong> Increasing strength of recommendation as competing mortality and QOL concerns outweigh arrhythmic benefit</p>
                      </div>
                    </div>

                    <Alert className={matrixRecommendation.includes('STRONGLY') || matrixRecommendation.includes('RECOMMEND DOWNGRADE') ? 'border-blue-500 bg-blue-50 mt-4' : matrixRecommendation.includes('CONSIDER') ? 'border-yellow-500 bg-yellow-50 mt-4' : 'border-red-500 bg-red-50 mt-4'}>
                      <AlertDescription>
                        <div className="font-bold text-lg mb-3">Detailed Clinical Assessment</div>
                        {downgradeResult.rec.length > 0 && (
                          <div className="mt-3">
                            <div className="font-bold flex items-center gap-2 mb-2">
                              <Info className="w-5 h-5 text-blue-600" /> Supporting Factors for Downgrade:
                            </div>
                            <ul className="list-disc ml-6 space-y-1">{downgradeResult.rec.map((r, i) => <li key={i} className="text-sm">{r}</li>)}</ul>
                          </div>
                        )}
                        {downgradeResult.consider.length > 0 && (
                          <div className="mt-3">
                            <div className="font-bold flex items-center gap-2 mb-2 text-yellow-600">
                              <AlertTriangle className="w-5 h-5" /> Important Considerations:
                            </div>
                            <ul className="list-disc ml-6 space-y-1">{downgradeResult.consider.map((c, i) => <li key={i} className="text-sm">{c}</li>)}</ul>
                          </div>
                        )}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                          <div className="font-bold mb-2">Technical Options for Downgrade:</div>
                          <ul className="list-disc ml-5 space-y-1 text-sm">
                            <li>CRT-D to CRT-P: If DF-1 lead cap HV coil. If DF-4 lead implant new IS-1 lead OR reprogram CRT-D with therapies disabled</li>
                            <li>ICD to Pacemaker: Similar approach based on lead type and pacing dependency</li>
                            <li>DDD to VVI: Consider if atrial lead issues and minimal atrial pacing need</li>
                            <li>Device Deactivation: For end-of-life care when no pacing need exists</li>
                          </ul>
                          <p className="mt-3 font-semibold text-sm text-blue-800">Remember: 55% of patients would continue therapy even when seriously unwell. Ensure patients understand that non-replacement is an option through structured, compassionate discussions.</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ethical Framework for Downgrade Discussions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <div className="font-bold mb-1">1. Initiate Early Conversations</div>
                  <p>Discuss device deactivation options at implant and regularly thereafter, particularly when health status changes</p>
                </div>
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <div className="font-bold mb-1">2. Assess Decision-Making Capacity</div>
                  <p>Ensure patient has capacity to make informed decisions. Involve family/surrogates if appropriate</p>
                </div>
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <div className="font-bold mb-1">3. Explore Goals and Values</div>
                  <p>Understand patient priorities: quality vs quantity of life, fear of sudden death vs prolonged dying</p>
                </div>
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <div className="font-bold mb-1">4. Provide Balanced Information</div>
                  <p>Explain natural history with/without device therapy. Discuss what deactivation means practically</p>
                </div>
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <div className="font-bold mb-1">5. Multidisciplinary Support</div>
                  <p>Involve palliative care, psychology, and spiritual care as appropriate</p>
                </div>
                <div className="p-3 bg-green-50 rounded border-2 border-green-400">
                  <div className="font-bold mb-1 text-green-800">Key Message</div>
                  <p className="text-green-900">Device deactivation is ethically and legally equivalent to withholding implantation. Patient autonomy should guide decision-making.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader><CardTitle>Reference Information</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Based on:</strong> 2025 EHRA/ESC Clinical Consensus Statement on CIED Upgrades and Downgrades, 2022 ESC Guidelines for Ventricular Arrhythmias and Prevention of Sudden Cardiac Death, 2023 ESC Guidelines for Management of Cardiomyopathies, HRS 2020 Expert Consensus on Device Deactivation</p>
          <p className="font-semibold mt-3 text-blue-800">Note on CKD Risk Stratification:</p>
          <p className="text-sm mb-2">The 2025 EHRA/ESC consensus acknowledges renal dysfunction as a risk factor but does not provide granular CKD staging. The CKD stratification in this tool is based on broader CIED infection literature (Polyzos 2015, Tarakji 2010, Essebag 2016, Greenspon 2011) showing dose-dependent infection risk with progressive CKD severity.</p>
          <p className="font-semibold mt-3">Key Evidence:</p>
          <p className="font-semibold mt-3">Charlson Comorbidity Index (CCI) - Integration Rationale:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li><strong>Original development (Charlson 1987):</strong> Validated in 559 medical patients to predict 1-year mortality based on 19 comorbid conditions weighted by relative risk. Each condition assigned points (1-6) based on adjusted relative risk of death.</li>
            <li><strong>Long-term validation (Charlson 1994):</strong> Predicts 10-year survival in breast cancer cohort, establishing utility for long-term prognosis across diseases</li>
            <li><strong>Mortality prediction by score (Hemmelgarn 2003, Lee 2006, Quan 2011, Sundararajan 2004):</strong>
              <ul className="list-disc ml-5 mt-1">
                <li>CCI 0: 1-year mortality ~2%, 5-year mortality ~10%, 10-year survival ~80%</li>
                <li>CCI 1-2: 1-year mortality ~5-8%, 5-year mortality ~20-25%, 10-year survival ~60-70%</li>
                <li>CCI 3-4: 1-year mortality ~10-12%, 5-year mortality ~35-45%, 10-year survival ~40-50%</li>
                <li>CCI 5-6: 1-year mortality ~15-20%, 5-year mortality ~50-60%, 10-year survival ~20-30%</li>
                <li>CCI 7: 1-year mortality ~20-30%, 5-year mortality ~65-75%, 10-year survival ~10-20%</li>
                <li>CCI ≥8: 1-year mortality ~30-50%, 5-year mortality ~75-85%, 10-year survival &lt;20%</li>
              </ul>
            </li>
            <li><strong>In CIED populations (Krahn 2012, Green 2012, Potpara 2017):</strong> CCI independently predicts mortality post-ICD implant (HR 1.15-1.30 per point increase). In CIED upgrade cohorts, CCI ≥5 associated with 2-fold increased mortality at 3 years compared to CCI &lt;3</li>
            <li><strong>CCI vs Frailty - Complementary not redundant (Fried 2004, Afilalo 2012):</strong> 
              <ul className="list-disc ml-5 mt-1">
                <li>CCI captures <strong>disease burden</strong> (what conditions patient has)</li>
                <li>Frailty captures <strong>physiologic reserve</strong> (how patient responds to stressors)</li>
                <li>Both contribute <strong>independently</strong> to mortality prediction</li>
                <li>Key insight: Can have high CCI with low frailty (young patient, multiple stable conditions) OR high frailty with low CCI (elderly, sarcopenic, no major diagnoses)</li>
              </ul>
            </li>
            <li><strong>When CCI adds most value beyond CFS (Fried 2004, Afilalo 2012, Dunlay 2017):</strong>
              <ul className="list-disc ml-5 mt-1">
                <li><strong>Young patients (&lt;70-75)</strong> with multiple comorbidities but preserved functional status (CFS ≤5): CCI ≥6 flags competing mortality risk not apparent from function alone</li>
                <li><strong>Borderline frailty (CFS 5-6)</strong> where comorbidity burden helps differentiate risk: CCI ≥7 tips toward higher competing mortality</li>
                <li><strong>Discordance scenarios:</strong> High CCI + low CFS (disease-rich but functionally compensated) vs Low CCI + high CFS (few diagnoses but physiologically vulnerable)</li>
              </ul>
            </li>
            <li><strong>Why CCI is optional not mandatory in this tool:</strong>
              <ul className="list-disc ml-5 mt-1">
                <li>For most patients >75 years or with clear frailty (CFS ≥7), functional status alone adequately captures risk</li>
                <li>For straightforward cases (young, fit, clear indication), CCI adds little</li>
                <li>CCI most valuable in <strong>complex middle-zone cases</strong> where age + function don't tell full story</li>
                <li>Avoids tool complexity for routine cases while providing sophisticated stratification when needed</li>
              </ul>
            </li>
            <li><strong>Integration logic in this tool:</strong>
              <ul className="list-disc ml-5 mt-1">
                <li><strong>UPGRADES:</strong> CCI ≥7 in patients &lt;75 with CFS ≤5 adds "minor deviation" to benefit applicability (flags hidden competing mortality). CCI ≥6 in younger patients (&lt;70) triggers warning about comorbidity burden.</li>
                <li><strong>DOWNGRADES:</strong> CCI ≥8 upgrades competing mortality to HIGH regardless of other factors (1-year mortality 30-50%). CCI 7 with CFS 4-6 may upgrade competing risk category. CCI 6 in younger patients with preserved function flags emerging risk.</li>
                <li><strong>Threshold rationale:</strong> CCI thresholds (6, 7, 8) chosen based on inflection points in mortality curves where competing mortality begins to dominate typical arrhythmic risk (3-8%/year)</li>
              </ul>
            </li>
          </ul>
          <p className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-500 text-sm"><strong>Clinical Pearl:</strong> Think of CCI and CFS as orthogonal dimensions: CCI = "What diseases does the patient carry?" vs CFS = "How well can the patient tolerate stress?" A 60-year-old marathon runner with diabetes, COPD, and prior MI (CCI 5, CFS 3) has very different risk than an 85-year-old with no major diagnoses but severe sarcopenia (CCI 1, CFS 7). Both metrics needed for complete picture.</p>
          
          <p className="font-semibold mt-3">CRT Upgrades:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>BUDAPEST-CRT Trial: 67.6% relative risk reduction in primary endpoint (death, HF hospitalization, or reduction in LVESV) vs ICD alone in patients with LVEF under 35% and RVP over 20%</li>
            <li>Meta-analyses show LVEF improvement (6-8%), LVESV reduction, BNP decrease, and QRS narrowing with upgrade</li>
            <li>Complication rates: 6.2-20.9% for upgrades vs 4-6% for de novo implants</li>
          </ul>
          <p className="font-semibold mt-3">Infection Risk Factors:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Baseline infection risk: De novo PM/ICD ~1%, De novo CRT ~2%; Upgrades 4-5%</li>
            <li><strong>CKD and infection risk:</strong> CKD Stage 3 (eGFR 30-59): plus 2-3% absolute risk increase; CKD Stage 4-5 (eGFR under 30): plus 4-6% increase; Dialysis-dependent: plus 6-8% increase (Polyzos 2015, Greenspon 2011, Tarakji 2010)</li>
            <li>Prior device infection: plus 15% risk; Diabetes: plus 3% risk; Immunosuppression: plus 5% risk</li>
            <li>Evidence: REPLACE Registry (Greenspon 2011), Danish Pacemaker Register (Johansen 2011), PEOPLE study (Essebag 2019)</li>
          </ul>
          <p className="font-semibold mt-3">ICD Primary Prevention (ESC 2022/2023):</p>
          <ul className="list-disc ml-5 space-y-1">
            <li><strong>Ischemic CM:</strong> Class I for LVEF under 35% on GDMT over 3 months (SCD-HeFT, MADIT-II approximately 30% mortality reduction)</li>
            <li><strong>Non-ischemic CM:</strong> Class I for LVEF under 35% on GDMT over 3 months; Class IIa for LVEF 35-50% with 2 or more risk factors</li>
            <li><strong>High-risk Mutations:</strong> LMNA, PLN, FLNC, RBM20, DSP, TMEM43 - ICD should be considered even with LVEF over 35% when combined with other risk factors</li>
            <li><strong>DANISH Trial:</strong> No mortality benefit in non-ischemic CM patients over 70 years</li>
          </ul>
          <p className="font-semibold mt-3">ICD Secondary Prevention:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>AVID trial: approximately 50% mortality reduction after VT/VF (Class I indication)</li>
          </ul>
          <p className="font-semibold mt-3">Device Deactivation/Downgrade:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>HRS 2020: Device deactivation is ethically and legally acceptable when therapies no longer align with patient goals</li>
            <li>Severe frailty (Clinical Frailty Scale 7-9) associated with median survival under 1 year and high competing mortality</li>
            <li>Inappropriate shocks 3-5 or more per year significantly impair quality of life and may warrant deactivation discussion</li>
          </ul>
          <p className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-500"><strong>Important:</strong> This tool supports clinical decision-making but does not replace comprehensive MDT discussion and individualized patient assessment. ESC 2022/2023 guidelines emphasize multiparametric risk stratification beyond LVEF alone.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CIEDTool;