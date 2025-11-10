import { DomainScenario } from '@/types/sequential-thinking'

export const domainScenarios: DomainScenario[] = [
  {
    id: "finance",
    name: "Finance & Accounting",
    description: "Practice financial analysis, accounting principles, and investment reasoning",
    icon: "📊",
    color: "bg-emerald-100 text-emerald-800",
    sampleProblem: "A company has current assets of $500,000 and current liabilities of $200,000. Calculate the current ratio and analyze what this indicates about the company's short-term financial health.",
    tools: ["financial_calculator", "ratio_analyzer", "accounting_standards"],
    reasoningSteps: ["Identify relevant data", "Apply formula", "Calculate ratio", "Interpret results", "Consider implications"]
  },
  {
    id: "law",
    name: "Law",
    description: "Practice legal reasoning, case analysis, and statutory interpretation",
    icon: "⚖️",
    color: "bg-blue-100 text-blue-800",
    sampleProblem: "Analyze whether a contract formed through email exchange constitutes a valid agreement under common law principles. Consider the elements of offer, acceptance, and consideration.",
    tools: ["case_law_search", "statute_lookup", "legal_reasoning_framework"],
    reasoningSteps: ["Identify legal issue", "Find relevant law", "Apply law to facts", "Consider counterarguments", "Draw conclusion"]
  },
  {
    id: "medicine",
    name: "Medicine",
    description: "Practice clinical reasoning, diagnosis, and treatment planning",
    icon: "🏥",
    color: "bg-red-100 text-red-800",
    sampleProblem: "A 45-year-old patient presents with chest pain, shortness of breath, and fatigue. Develop a differential diagnosis and outline your reasoning process for determining the most likely cause.",
    tools: ["medical_database", "symptom_analyzer", "treatment_guidelines"],
    reasoningSteps: ["Gather patient information", "Identify key symptoms", "Generate differential diagnosis", "Order diagnostic tests", "Formulate treatment plan"]
  },
  {
    id: "engineering",
    name: "Engineering",
    description: "Practice technical problem-solving, design analysis, and calculations",
    icon: "⚙️",
    color: "bg-gray-100 text-gray-800",
    sampleProblem: "Design a beam to support a concentrated load of 10 kN at its center. The beam is 3 meters long and made of steel with a yield strength of 250 MPa. Determine the minimum required section modulus.",
    tools: ["engineering_calculator", "material_properties", "design_codes"],
    reasoningSteps: ["Identify loading conditions", "Apply relevant formulas", "Calculate requirements", "Check safety factors", "Verify with codes"]
  },
  {
    id: "data-science",
    name: "Data Science",
    description: "Practice data analysis, model selection, and statistical reasoning",
    icon: "📈",
    color: "bg-indigo-100 text-indigo-800",
    sampleProblem: "You have a dataset with customer churn information. Develop a step-by-step reasoning process for building a predictive model, including data preprocessing, feature selection, and model evaluation.",
    tools: ["statistical_tools", "ml_algorithms", "data_visualization"],
    reasoningSteps: ["Explore dataset", "Clean and preprocess", "Select features", "Choose model", "Evaluate performance"]
  },
  {
    id: "business",
    name: "Business",
    description: "Practice strategic thinking, case analysis, and decision-making",
    icon: "💼",
    color: "bg-amber-100 text-amber-800",
    sampleProblem: "A retail company is experiencing declining sales. Analyze the situation using SWOT analysis and develop a strategic plan to address the challenges while leveraging opportunities.",
    tools: ["business_frameworks", "market_analysis", "financial_modeling"],
    reasoningSteps: ["Analyze current situation", "Identify key factors", "Apply framework", "Develop strategy", "Create action plan"]
  }
]

export const detailedScenarios = {
  finance: [
    {
      id: "finance-1",
      title: "Liquidity Analysis",
      difficulty: "Beginner",
      problem: "ABC Corporation has the following balance sheet data: Cash: $100,000, Accounts Receivable: $200,000, Inventory: $150,000, Prepaid Expenses: $50,000, Accounts Payable: $120,000, Short-term Debt: $80,000, Accrued Expenses: $40,000. Calculate and interpret the current ratio and quick ratio.",
      expectedReasoning: [
        "Identify current assets and current liabilities",
        "Calculate current ratio = Current Assets / Current Liabilities",
        "Calculate quick ratio = (Current Assets - Inventory) / Current Liabilities",
        "Interpret ratios in context of industry standards",
        "Provide recommendations for improvement"
      ],
      tools: ["financial_calculator", "ratio_analyzer"],
      timeLimit: 15
    },
    {
      id: "finance-2",
      title: "Investment Decision Making",
      difficulty: "Intermediate",
      problem: "A company is considering two investment projects. Project A requires an initial investment of $100,000 and generates cash flows of $30,000 per year for 5 years. Project B requires $150,000 and generates $40,000 per year for 5 years. The company's cost of capital is 10%. Using NPV and IRR analysis, determine which project should be selected.",
      expectedReasoning: [
        "Calculate NPV for both projects",
        "Calculate IRR for both projects",
        "Compare results and consider qualitative factors",
        "Make recommendation with justification",
        "Consider risk factors and sensitivity"
      ],
      tools: ["financial_calculator", "npv_calculator", "irr_calculator"],
      timeLimit: 25
    },
    {
      id: "finance-3",
      title: "Financial Statement Analysis",
      difficulty: "Advanced",
      problem: "Given the following financial data for XYZ Corp: Revenue: $2,000,000, COGS: $1,200,000, Operating Expenses: $400,000, Interest Expense: $50,000, Tax Rate: 30%. Perform a comprehensive financial analysis including profitability ratios, leverage ratios, and prepare a DuPont analysis.",
      expectedReasoning: [
        "Calculate net income",
        "Compute profitability ratios (gross margin, operating margin, net margin)",
        "Calculate leverage ratios (debt-to-equity, interest coverage)",
        "Perform DuPont analysis (ROE = Profit Margin × Asset Turnover × Equity Multiplier)",
        "Synthesize findings and provide strategic insights"
      ],
      tools: ["financial_calculator", "ratio_analyzer", "dupont_analyzer"],
      timeLimit: 30
    }
  ],
  law: [
    {
      id: "law-1",
      title: "Contract Formation",
      difficulty: "Beginner",
      problem: "John sends an email to Mary offering to sell his car for $10,000. Mary replies via email saying 'I accept your offer, but I can only pay $9,500.' John then emails back saying 'I accept your offer of $9,500.' Analyze whether a valid contract has been formed and explain your reasoning using contract law principles.",
      expectedReasoning: [
        "Identify the initial offer and its terms",
        "Analyze Mary's response as a counteroffer",
        "Determine if John's acceptance is valid",
        "Apply contract formation requirements",
        "Conclusion on contract validity"
      ],
      tools: ["case_law_search", "contract_principles"],
      timeLimit: 20
    },
    {
      id: "law-2",
      title: "Negligence Analysis",
      difficulty: "Intermediate",
      problem: "A customer slips and falls in a grocery store, suffering injuries. The store had a 'wet floor' sign but it was knocked over 10 minutes before the incident. The store manager was aware of the spill but had not yet sent someone to clean it up. Analyze whether the grocery store is liable for negligence.",
      expectedReasoning: [
        "Identify elements of negligence (duty, breach, causation, damages)",
        "Analyze duty of care owed to customer",
        "Examine if there was a breach of duty",
        "Consider causation and actual damages",
        "Apply relevant case law and defenses"
      ],
      tools: ["negligence_framework", "case_law_search"],
      timeLimit: 25
    },
    {
      id: "law-3",
      title: "Constitutional Interpretation",
      difficulty: "Advanced",
      problem: "A state passes a law requiring all voters to present government-issued photo identification. Critics argue this disproportionately affects minority and low-income voters. Analyze this law under the Equal Protection Clause of the Fourteenth Amendment, considering competing state interests and individual rights.",
      expectedReasoning: [
        "Identify the constitutional provision at issue",
        "Determine the appropriate level of scrutiny",
        "Analyze state's interest in the law",
        "Examine the law's impact on protected groups",
        "Apply relevant precedent and balance interests"
      ],
      tools: ["constitutional_law", "case_law_search", "equal_protection_analysis"],
      timeLimit: 35
    }
  ],
  medicine: [
    {
      id: "medicine-1",
      title: "Basic Diagnosis",
      difficulty: "Beginner",
      problem: "A 30-year-old patient presents with fever, cough, and chest pain. The cough produces yellow-green sputum. Vital signs: Temperature 38.5°C, Heart rate 90 bpm, Respiratory rate 20/min, Blood pressure 120/80 mmHg. Develop a differential diagnosis and outline your reasoning.",
      expectedReasoning: [
        "Gather and organize patient information",
        "Identify key symptoms and vital signs",
        "Generate initial differential diagnosis",
        "Consider most likely conditions first",
        "Recommend diagnostic tests to confirm"
      ],
      tools: ["symptom_analyzer", "differential_diagnosis"],
      timeLimit: 15
    },
    {
      id: "medicine-2",
      title: "Complex Case Management",
      difficulty: "Intermediate",
      problem: "A 65-year-old diabetic patient presents with confusion, fatigue, and fruity-smelling breath. Blood glucose is 450 mg/dL, pH is 7.15, bicarbonate is 12 mEq/L. The patient has a history of poor medication compliance. Develop a comprehensive treatment plan and explain your reasoning.",
      expectedReasoning: [
        "Recognize the emergency condition",
        "Interpret laboratory values",
        "Prioritize immediate interventions",
        "Develop short and long-term management plan",
        "Consider patient education and compliance strategies"
      ],
      tools: ["clinical_guidelines", "treatment_protocols", "diabetes_management"],
      timeLimit: 25
    },
    {
      id: "medicine-3",
      title: "Multisystem Critical Care",
      difficulty: "Advanced",
      problem: "A 45-year-old patient is admitted to ICU with septic shock. Initial vitals: HR 130, BP 80/40, RR 28, Temp 39.5°C, SpO2 92% on room air. Labs show WBC 18,000, lactate 4.2, creatinine 2.1, bilirubin 3.0. Develop a comprehensive critical care management plan.",
      expectedReasoning: [
        "Assess and prioritize life threats",
        "Initiate sepsis protocol",
        "Manage organ dysfunction",
        "Consider antibiotic selection and source control",
        "Plan for hemodynamic monitoring and support"
      ],
      tools: ["sepsis_protocol", "critical_care_guidelines", "antibiotic_selector"],
      timeLimit: 30
    }
  ],
  engineering: [
    {
      id: "engineering-1",
      title: "Basic Structural Analysis",
      difficulty: "Beginner",
      problem: "A simply supported beam of length 4m carries a uniformly distributed load of 5 kN/m. The beam has a rectangular cross-section 100mm wide and 200mm deep. Calculate the maximum bending stress and determine if the beam is safe if the allowable stress is 120 MPa.",
      expectedReasoning: [
        "Identify beam type and loading conditions",
        "Calculate maximum bending moment",
        "Determine section modulus",
        "Calculate maximum bending stress",
        "Compare with allowable stress and conclude"
      ],
      tools: ["beam_calculator", "stress_analyzer"],
      timeLimit: 20
    },
    {
      id: "engineering-2",
      title: "Thermal System Design",
      difficulty: "Intermediate",
      problem: "Design a heat exchanger to cool 100 kg/min of hot water from 80°C to 40°C using cooling water available at 20°C. The overall heat transfer coefficient is 500 W/m²K. Determine the required heat transfer area and the mass flow rate of cooling water needed.",
      expectedReasoning: [
        "Calculate heat transfer rate required",
        "Apply energy balance equations",
        "Determine log mean temperature difference",
        "Calculate required heat transfer area",
        "Find cooling water flow rate"
      ],
      tools: ["heat_transfer_calculator", "thermodynamic_tables"],
      timeLimit: 25
    },
    {
      id: "engineering-3",
      title: "Complex Control System",
      difficulty: "Advanced",
      problem: "A feedback control system has the following transfer functions: Controller Gc(s) = K(1 + 1/Ti*s), Process Gp(s) = 1/(s+1)(2s+1), Sensor H(s) = 1. Design a PI controller to achieve a settling time of less than 4 seconds and overshoot less than 10% for a step input.",
      expectedReasoning: [
        "Analyze system requirements and specifications",
        "Derive closed-loop transfer function",
        "Apply control design methods (root locus or frequency response)",
        "Calculate controller parameters (K, Ti)",
        "Verify performance with simulation"
      ],
      tools: ["control_system_analyzer", "pid_tuner", "simulation_tools"],
      timeLimit: 35
    }
  ],
  "data-science": [
    {
      id: "ds-1",
      title: "Basic Data Analysis",
      difficulty: "Beginner",
      problem: "You have a dataset of 1000 customer records with features: age, income, education level, and purchase amount. Perform exploratory data analysis to understand the relationship between customer characteristics and purchasing behavior.",
      expectedReasoning: [
        "Examine data structure and quality",
        "Calculate descriptive statistics",
        "Visualize distributions and relationships",
        "Identify patterns and correlations",
        "Formulate hypotheses for further analysis"
      ],
      tools: ["descriptive_statistics", "data_visualization", "correlation_analysis"],
      timeLimit: 20
    },
    {
      id: "ds-2",
      title: "Predictive Model Development",
      difficulty: "Intermediate",
      problem: "Develop a machine learning model to predict customer churn using a dataset with 50 features and 10,000 records. Include feature selection, model training, validation, and performance evaluation in your reasoning process.",
      expectedReasoning: [
        "Preprocess and clean the dataset",
        "Perform feature selection and engineering",
        "Choose appropriate model(s) for the problem",
        "Implement cross-validation and training",
        "Evaluate model performance and interpret results"
      ],
      tools: ["feature_selection", "ml_algorithms", "model_evaluation"],
      timeLimit: 30
    },
    {
      id: "ds-3",
      title: "Advanced Time Series Analysis",
      difficulty: "Advanced",
      problem: "Analyze monthly sales data for the past 5 years to forecast next year's sales. The data shows trend, seasonality, and some irregular patterns. Develop a comprehensive forecasting approach and justify your methodological choices.",
      expectedReasoning: [
        "Decompose time series into components",
        "Test for stationarity and apply transformations",
        "Compare multiple forecasting models",
        "Validate model accuracy with backtesting",
        "Generate forecasts with confidence intervals"
      ],
      tools: ["time_series_decomposition", "forecasting_models", "model_validation"],
      timeLimit: 35
    }
  ],
  business: [
    {
      id: "business-1",
      title: "Market Entry Strategy",
      difficulty: "Beginner",
      problem: "A successful coffee shop chain is considering expanding into a new city. The city has 500,000 residents, 3 major competitors, and growing commercial areas. Develop a market entry strategy using appropriate business frameworks.",
      expectedReasoning: [
        "Analyze market size and growth potential",
        "Assess competitive landscape",
        "Evaluate company capabilities and resources",
        "Apply strategic frameworks (SWOT, Porter's Five Forces)",
        "Recommend market entry approach"
      ],
      tools: ["market_analysis", "swot_analyzer", "competitive_analysis"],
      timeLimit: 20
    },
    {
      id: "business-2",
      title: "Financial Performance Optimization",
      difficulty: "Intermediate",
      problem: "A manufacturing company has declining profit margins despite increasing revenue. Analyze the situation using financial ratios and operational metrics, then develop a strategy to improve profitability while maintaining growth.",
      expectedReasoning: [
        "Analyze financial statements and ratios",
        "Identify cost structure and efficiency issues",
        "Benchmark against industry standards",
        "Develop optimization strategies",
        "Create implementation plan with metrics"
      ],
      tools: ["financial_ratio_analyzer", "operational_metrics", "cost_analysis"],
      timeLimit: 25
    },
    {
      id: "business-3",
      title: "Digital Transformation Strategy",
      difficulty: "Advanced",
      problem: "A traditional retail company with 100 physical stores wants to develop a comprehensive digital transformation strategy. The company faces competition from e-commerce giants and changing consumer behavior. Develop a strategic plan that addresses technology, operations, and organizational change.",
      expectedReasoning: [
        "Assess current digital maturity and capabilities",
        "Analyze market trends and competitive threats",
        "Identify digital transformation opportunities",
        "Develop multi-year strategic roadmap",
        "Consider change management and investment requirements"
      ],
      tools: ["digital_maturity_assessment", "strategic_planning", "change_management"],
      timeLimit: 35
    }
  ]
}