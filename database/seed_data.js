const seedData = {
  patients: [
    {
      id: "PAT-8801",
      name: "Eleanor Vance",
      age: 64,
      gender: "Female",
      dob: "1962-04-12",
      insuranceProvider: "BlueCross BlueShield",
      policyNumber: "BCBS-99482103",
      groupNumber: "GRP-4412",
      primaryDiagnosis: "M17.11 - Primary osteoarthritis, right knee",
      bmi: 28.4
    },
    {
      id: "PAT-8802",
      name: "Marcus Holloway",
      age: 48,
      gender: "Male",
      dob: "1978-11-20",
      insuranceProvider: "Aetna Health",
      policyNumber: "AET-77381920",
      groupNumber: "GRP-9012",
      primaryDiagnosis: "G35 - Multiple sclerosis",
      bmi: 24.1
    },
    {
      id: "PAT-8803",
      name: "Sophia Rodriguez",
      age: 55,
      gender: "Female",
      dob: "1971-08-05",
      insuranceProvider: "UnitedHealthcare Premier",
      policyNumber: "UHC-11928405",
      groupNumber: "GRP-3301",
      primaryDiagnosis: "C50.911 - Malignant neoplasm of right female breast",
      bmi: 26.8
    },
    {
      id: "PAT-8804",
      name: "David Kim",
      age: 39,
      gender: "Male",
      dob: "1987-03-15",
      insuranceProvider: "Humana Gold Choice",
      policyNumber: "HUM-55291847",
      groupNumber: "GRP-8821",
      primaryDiagnosis: "M50.10 - Cervical disc disorder with radiculopathy",
      bmi: 31.2
    }
  ],

  payers: [
    { id: "PAYER-01", name: "BlueCross BlueShield", logo: "🛡️", avgResponseTime: "45 seconds (AI)" },
    { id: "PAYER-02", name: "Aetna Health", logo: "🏥", avgResponseTime: "1.2 minutes (AI)" },
    { id: "PAYER-03", name: "UnitedHealthcare", logo: "🌐", avgResponseTime: "50 seconds (AI)" },
    { id: "PAYER-04", name: "Humana Choice", logo: "💚", avgResponseTime: "2.1 minutes (AI)" }
  ],

  icd10Codes: [
    { code: "M17.11", description: "Primary osteoarthritis, right knee", category: "Orthopedics" },
    { code: "M17.12", description: "Primary osteoarthritis, left knee", category: "Orthopedics" },
    { code: "G35", description: "Multiple sclerosis", category: "Neurology" },
    { code: "C50.911", description: "Malignant neoplasm of right female breast", category: "Oncology" },
    { code: "M50.10", description: "Cervical disc disorder with radiculopathy", category: "Spine" },
    { code: "I25.10", description: "Atherosclerotic heart disease of native coronary artery", category: "Cardiology" }
  ],

  cptCodes: [
    { code: "27447", description: "Total Knee Arthroplasty (Replacement)", category: "Surgery", requiresAuth: true, defaultEstCost: "$34,500" },
    { code: "70553", description: "MRI Brain with & without Contrast", category: "Radiology", requiresAuth: true, defaultEstCost: "$2,850" },
    { code: "96413", description: "Chemotherapy Infusion Treatment (1st hour)", category: "Oncology", requiresAuth: true, defaultEstCost: "$8,400" },
    { code: "22857", description: "Total Disc Arthroplasty Cervical", category: "Spine Surgery", requiresAuth: true, defaultEstCost: "$42,000" },
    { code: "93000", description: "Electrocardiogram (EKG) complete", category: "Cardiology", requiresAuth: false, defaultEstCost: "$250" }
  ],

  requests: [
    {
      id: "PA-2026-901",
      patientId: "PAT-8801",
      patientName: "Eleanor Vance",
      patientAge: 64,
      patientBmi: 28.4,
      payerName: "BlueCross BlueShield",
      policyNumber: "BCBS-99482103",
      icd10Code: "M17.11",
      icd10Desc: "Primary osteoarthritis, right knee",
      cptCode: "27447",
      cptDesc: "Total Knee Arthroplasty (Replacement)",
      conservativeTherapyWeeks: 14,
      uploadedDocuments: ["X-Ray Report (Weight-bearing)", "Physician Clinical Notes", "Physical Therapy Log"],
      clinicalNotes: "Patient suffers from severe refractory pain in right knee affecting weight-bearing mobility. Failed 14 weeks of physical therapy and intra-articular steroid injections. X-Ray confirms severe Grade 4 Kellgren-Lawrence joint space narrowing.",
      submittedAt: "2026-09-23T18:30:00Z",
      status: "APPROVED",
      statusLabel: "Auto Approved by AI",
      confidenceScore: 0.96,
      scoreTotal: 96,
      decisionRationale: "All medical necessity guidelines satisfied with 96% confidence. Conservative therapy exceeds required 12 weeks. Complete weight-bearing X-ray and PT documentation attached.",
      matchedCriteria: [
        "Diagnosis code M17.11 aligns with payer medical necessity guidelines for CPT 27447.",
        "Conservative therapy requirement met (14 weeks completed vs 12 weeks required).",
        "Clinical documentation complete (3 of 3 verified).",
        "NLP extracted medical necessity evidence keywords: severe pain, refractory, failed."
      ],
      missingCriteria: [],
      riskFactors: [],
      processingTimeMs: 420
    },
    {
      id: "PA-2026-902",
      patientId: "PAT-8802",
      patientName: "Marcus Holloway",
      patientAge: 48,
      patientBmi: 24.1,
      payerName: "Aetna Health",
      policyNumber: "AET-77381920",
      icd10Code: "G35",
      icd10Desc: "Multiple sclerosis",
      cptCode: "70553",
      cptDesc: "MRI Brain with & without Contrast",
      conservativeTherapyWeeks: 3,
      uploadedDocuments: ["Neurological Assessment"],
      clinicalNotes: "Patient presenting with acute optic neuritis and right arm dysmetria. Urgent MRI brain ordered to evaluate suspected demyelinating disease plaque burden progression.",
      submittedAt: "2026-09-23T20:15:00Z",
      status: "IN_REVIEW",
      statusLabel: "Flagged for Peer Review",
      confidenceScore: 0.68,
      scoreTotal: 68,
      decisionRationale: "Partial criteria met (68% confidence). Flagged for peer-to-peer physician review due to missing prior CT/EEG baseline study report.",
      matchedCriteria: [
        "Diagnosis code G35 aligns with payer medical necessity guidelines for CPT 70553.",
        "Conservative therapy requirement met (3 weeks completed vs 2 weeks required).",
        "NLP extracted medical necessity evidence keywords: acute, optic neuritis, demyelinating."
      ],
      missingCriteria: [
        "Missing required clinical attachment: Previous CT Scan or EEG"
      ],
      riskFactors: [],
      processingTimeMs: 510
    },
    {
      id: "PA-2026-903",
      patientId: "PAT-8804",
      patientName: "David Kim",
      patientAge: 39,
      patientBmi: 31.2,
      payerName: "Humana Gold Choice",
      policyNumber: "HUM-55291847",
      icd10Code: "M50.10",
      icd10Desc: "Cervical disc disorder with radiculopathy",
      cptCode: "22857",
      cptDesc: "Total Disc Arthroplasty Cervical",
      conservativeTherapyWeeks: 2,
      uploadedDocuments: ["Physician Clinical Notes"],
      clinicalNotes: "Cervical pain radiating to arm for 2 weeks.",
      submittedAt: "2026-09-23T21:00:00Z",
      status: "REJECTED",
      statusLabel: "Denied (Insufficient Evidence)",
      confidenceScore: 0.35,
      scoreTotal: 35,
      decisionRationale: "Failed to meet mandatory payer coverage policy thresholds (35% score). Missing required 6-week physical therapy trial and electrodiagnostic study.",
      matchedCriteria: [
        "Diagnosis code M50.10 accepted under general coverage policy."
      ],
      missingCriteria: [
        "Insufficient conservative therapy duration (2 weeks reported vs 6 weeks required).",
        "Missing required clinical attachment: MRI Spine",
        "Missing required clinical attachment: Physical Therapy 6wk Record"
      ],
      riskFactors: [],
      processingTimeMs: 380
    }
  ],

  analytics: {
    totalRequests: 1420,
    autoApprovalRatePct: 78.4,
    avgProcessingTimeSec: 0.8,
    legacyAvgProcessingTimeDays: 14,
    administrativeCostSavingsUSD: 248500,
    errorReductionRatePct: 94.2,
    byCategory: [
      { name: "Orthopedics", approved: 420, reviewed: 45, rejected: 35 },
      { name: "Radiology", approved: 380, reviewed: 30, rejected: 15 },
      { name: "Oncology", approved: 210, reviewed: 10, rejected: 5 },
      { name: "Spine", approved: 95, reviewed: 40, rejected: 25 },
      { name: "Cardiology", approved: 80, reviewed: 15, rejected: 10 }
    ],
    timelineData: [
      { month: "Jan", legacyTimeDays: 14, aiTimeSec: 4.5, requests: 180 },
      { month: "Feb", legacyTimeDays: 14, aiTimeSec: 2.1, requests: 210 },
      { month: "Mar", legacyTimeDays: 14, aiTimeSec: 1.4, requests: 240 },
      { month: "Apr", legacyTimeDays: 14, aiTimeSec: 0.9, requests: 290 },
      { month: "May", legacyTimeDays: 14, aiTimeSec: 0.8, requests: 350 },
      { month: "Jun", legacyTimeDays: 14, aiTimeSec: 0.8, requests: 410 }
    ]
  }
};

export default seedData;
