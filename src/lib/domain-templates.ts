import { DomainTemplate } from "@/types/sequential-thinking"

export const domainTemplates: DomainTemplate[] = [
  {
    id: "finance",
    name: "Finance & Accounting",
    icon: "📊",
    color: "bg-emerald-100 text-emerald-800",
    description: "Financial analysis, accounting procedures, and audit reasoning",
    sampleProblems: [
      "A company has $5M in revenue, $3M in operating expenses, and $1M in interest expenses. Calculate and analyze the company's net profit margin and interest coverage ratio. What do these ratios indicate about the company's financial health?",
      "Analyze the impact of a 10% increase in interest rates on a company with $20M in variable-rate debt. Consider the effects on cash flow, profitability, and financial ratios.",
      "Evaluate the accounting treatment for a complex merger transaction where Company A acquires Company B for $50M. Company B has net assets of $30M and identifiable intangible assets of $15M. Calculate goodwill and discuss amortization implications.",
      "Assess the financial health of ABC Corporation using ratio analysis. Given: Current Assets = $200K, Current Liabilities = $100K, Total Assets = $500K, Total Debt = $200K, Net Income = $50K. Calculate and interpret key ratios."
    ],
    commonTools: ["financial_calculator", "accounting_standards", "audit_procedures", "ratio_analyzer", "cash_flow_modeler"],
    reasoningFramework: ["Identify", "Analyze", "Calculate", "Interpret", "Conclude"]
  },
  {
    id: "law",
    name: "Law",
    icon: "⚖️",
    color: "bg-blue-100 text-blue-800",
    description: "Legal reasoning, case analysis, and statutory interpretation",
    sampleProblems: [
      "Analyze breach of contract under common law. Party A promised to deliver 100 units by June 1st but delivered only 80 units on June 3rd. Party B refused payment and sued for damages. Apply the four elements of breach of contract and determine liability.",
      "Determine liability in a negligence case where a customer slipped on a wet floor in a supermarket. The store had a 'wet floor' sign but it was knocked over 30 minutes before the incident. Apply the elements of negligence and discuss duty of care.",
      "Interpret ambiguous statutory language: 'No vehicles in the park'. Apply to various scenarios including bicycles, wheelchairs, and maintenance vehicles. Use statutory interpretation principles.",
      "A tenant signed a 12-month lease but moved out after 6 months due to job relocation. The landlord refused to return the security deposit and sued for remaining rent. Analyze the contractual obligations and potential defenses."
    ],
    commonTools: ["legal_database", "case_law_search", "statute_analyzer", "precedent_finder", "legal_argument_builder"],
    reasoningFramework: ["Identify Issue", "Find Law", "Apply Law", "Conclusion", "Policy Considerations"]
  },
  {
    id: "medicine",
    name: "Medicine",
    icon: "🏥",
    color: "bg-red-100 text-red-800",
    description: "Clinical reasoning, diagnosis, and treatment planning",
    sampleProblems: [
      "A 45-year-old male presents with chest pain radiating to left arm, shortness of breath, and diaphoresis. Vital signs: BP 160/100, HR 110, RR 24. Develop a differential diagnosis and immediate treatment plan.",
      "A 65-year-old female with type 2 diabetes (HbA1c 8.5%) complains of fatigue and blurred vision. Current medications: metformin 1000mg BID. Develop a comprehensive treatment plan including medication adjustments and lifestyle modifications.",
      "Analyze drug interactions in a polypharmacy case: 70-year-old male taking warfarin, aspirin, simvastatin, and omeprazole. Presenting with bruising and INR of 4.5. Evaluate interactions and recommend management.",
      "A 30-year-old female presents with headache, fever, and neck stiffness. CSF shows elevated WBC, high protein, and low glucose. Develop diagnostic and treatment approach for suspected meningitis."
    ],
    commonTools: ["medical_database", "diagnostic_tools", "treatment_guidelines", "drug_interaction_checker", "clinical_calculator"],
    reasoningFramework: ["Symptoms", "Differential Diagnosis", "Tests", "Diagnosis", "Treatment"]
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: "⚙️",
    color: "bg-gray-100 text-gray-800",
    description: "Technical problem-solving and design analysis",
    sampleProblems: [
      "Design a simply supported steel beam to carry a uniformly distributed load of 20 kN/m over a span of 6 meters. Use A36 steel with Fy = 250 MPa. Calculate required section modulus and select appropriate W-shape.",
      "Analyze a simple RC circuit with R = 1kΩ, C = 100μF, and V = 12V. Calculate time constant, voltage across capacitor at t = 0.1s, and current at t = 0.05s. Sketch voltage vs time curve.",
      "Optimize a manufacturing process for efficiency: Current process produces 100 units/hour with 5% defect rate. Identify bottlenecks and propose improvements to increase output to 150 units/hour while reducing defects to 2%.",
      "Design a water supply system for a small town of 10,000 people. Average daily consumption is 150 liters/person. Calculate required pump capacity, pipe sizes, and storage tank volume considering peak demand factors."
    ],
    commonTools: ["engineering_calculator", "design_standards", "simulation_tools", "material_selector", "safety_analyzer"],
    reasoningFramework: ["Problem Definition", "Analysis", "Design", "Verification", "Implementation"]
  },
  {
    id: "data-science",
    name: "Data Science",
    icon: "📈",
    color: "bg-indigo-100 text-indigo-800",
    description: "Data analysis, machine learning, and statistical reasoning",
    sampleProblems: [
      "Predict customer churn using machine learning. Dataset includes 10,000 customers with features: age, tenure, monthly charges, and service usage. Build and evaluate classification models, identify key churn predictors.",
      "Analyze sales trends and forecast future performance. Given 3 years of monthly sales data with seasonality and trend, apply time series analysis to forecast next 6 months sales with 95% confidence intervals.",
      "Design an A/B test for a new website feature. Current conversion rate is 5%. Determine sample size needed to detect 1% absolute improvement with 80% power and 95% significance. Outline test methodology and analysis approach.",
      "Analyze customer segmentation using clustering. Dataset contains demographic and behavioral data for 50,000 customers. Apply K-means clustering, determine optimal number of clusters, and develop segment profiles."
    ],
    commonTools: ["data_analyzer", "ml_model_selector", "visualization_tools", "statistical_tester", "feature_engineer"],
    reasoningFramework: ["Data Understanding", "Preprocessing", "Modeling", "Evaluation", "Deployment"]
  },
  {
    id: "business",
    name: "Business",
    icon: "💼",
    color: "bg-amber-100 text-amber-800",
    description: "Strategic analysis and business decision-making",
    sampleProblems: [
      "Develop a market entry strategy for a new electric vehicle in Southeast Asia. Analyze market size, competition, regulatory environment, and consumer preferences. Recommend entry mode and positioning strategy.",
      "Analyze competitive position and recommend actions for a traditional retailer facing e-commerce disruption. Evaluate strengths, weaknesses, opportunities, and threats. Develop 3-year strategic plan.",
      "Evaluate a potential merger between two companies in the same industry. Company A: Revenue $100M, EBITDA $15M. Company B: Revenue $80M, EBITDA $12M. Estimate synergies and assess deal feasibility.",
      "Design a new product launch strategy for a tech startup. Product: AI-powered productivity app. Target market: professionals aged 25-45. Develop pricing, distribution, and marketing strategy."
    ],
    commonTools: ["swot_analyzer", "financial_modeler", "market_research", "competitor_analyzer", "strategy_planner"],
    reasoningFramework: ["Situation Analysis", "Strategy Formulation", "Implementation", "Evaluation", "Control"]
  }
]

export const getDomainById = (id: string): DomainTemplate | undefined => {
  return domainTemplates.find(domain => domain.id === id)
}

export const getDomainsByCategory = (category: string): DomainTemplate[] => {
  // Could categorize domains by type (e.g., 'professional', 'technical', 'analytical')
  return domainTemplates
}