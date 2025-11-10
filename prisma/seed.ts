import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding database...')

  // Create domains
  const domains = await Promise.all([
    db.domain.create({
      data: {
        name: 'Finance & Accounting',
        description: 'Financial analysis, accounting procedures, and audit reasoning',
        icon: '📊',
        color: 'bg-emerald-100 text-emerald-800'
      }
    }),
    db.domain.create({
      data: {
        name: 'Law',
        description: 'Legal reasoning, case analysis, and statutory interpretation',
        icon: '⚖️',
        color: 'bg-blue-100 text-blue-800'
      }
    }),
    db.domain.create({
      data: {
        name: 'Medicine',
        description: 'Clinical reasoning, diagnosis, and treatment planning',
        icon: '🏥',
        color: 'bg-red-100 text-red-800'
      }
    }),
    db.domain.create({
      data: {
        name: 'Engineering',
        description: 'Technical problem-solving and design analysis',
        icon: '⚙️',
        color: 'bg-gray-100 text-gray-800'
      }
    }),
    db.domain.create({
      data: {
        name: 'Data Science',
        description: 'Data analysis, machine learning, and statistical reasoning',
        icon: '📈',
        color: 'bg-indigo-100 text-indigo-800'
      }
    }),
    db.domain.create({
      data: {
        name: 'Business',
        description: 'Strategic analysis and business decision-making',
        icon: '💼',
        color: 'bg-amber-100 text-amber-800'
      }
    })
  ])

  console.log(`✅ Created ${domains.length} domains`)

  // Create tools for each domain
  const financeTools = await Promise.all([
    db.tool.create({
      data: {
        name: 'financial_calculator',
        description: 'Calculate financial ratios, metrics, and perform financial analysis',
        category: 'calculator',
        domainId: domains[0].id
      }
    }),
    db.tool.create({
      data: {
        name: 'ratio_analyzer',
        description: 'Analyze financial ratios and compare with industry benchmarks',
        category: 'analyzer',
        domainId: domains[0].id
      }
    }),
    db.tool.create({
      data: {
        name: 'accounting_standards',
        description: 'Access and apply accounting standards (GAAP, IFRS)',
        category: 'database',
        domainId: domains[0].id
      }
    }),
    db.tool.create({
      data: {
        name: 'audit_procedures',
        description: 'Step-by-step audit procedures and documentation',
        category: 'procedure',
        domainId: domains[0].id
      }
    }),
    db.tool.create({
      data: {
        name: 'cash_flow_modeler',
        description: 'Model and analyze cash flow projections',
        category: 'modeler',
        domainId: domains[0].id
      }
    })
  ])

  const lawTools = await Promise.all([
    db.tool.create({
      data: {
        name: 'legal_database',
        description: 'Search and access legal statutes, regulations, and case law',
        category: 'database',
        domainId: domains[1].id
      }
    }),
    db.tool.create({
      data: {
        name: 'case_law_search',
        description: 'Find relevant case law and legal precedents',
        category: 'search',
        domainId: domains[1].id
      }
    }),
    db.tool.create({
      data: {
        name: 'statute_analyzer',
        description: 'Analyze and interpret statutory language',
        category: 'analyzer',
        domainId: domains[1].id
      }
    }),
    db.tool.create({
      data: {
        name: 'precedent_finder',
        description: 'Find and analyze legal precedents',
        category: 'search',
        domainId: domains[1].id
      }
    }),
    db.tool.create({
      data: {
        name: 'legal_argument_builder',
        description: 'Structure and build legal arguments',
        category: 'builder',
        domainId: domains[1].id
      }
    })
  ])

  const medicineTools = await Promise.all([
    db.tool.create({
      data: {
        name: 'medical_database',
        description: 'Access medical knowledge base and clinical guidelines',
        category: 'database',
        domainId: domains[2].id
      }
    }),
    db.tool.create({
      data: {
        name: 'diagnostic_tools',
        description: 'Diagnostic assistance and differential diagnosis generator',
        category: 'diagnostic',
        domainId: domains[2].id
      }
    }),
    db.tool.create({
      data: {
        name: 'treatment_guidelines',
        description: 'Evidence-based treatment guidelines and protocols',
        category: 'guideline',
        domainId: domains[2].id
      }
    }),
    db.tool.create({
      data: {
        name: 'drug_interaction_checker',
        description: 'Check for drug interactions and contraindications',
        category: 'checker',
        domainId: domains[2].id
      }
    }),
    db.tool.create({
      data: {
        name: 'clinical_calculator',
        description: 'Medical calculations and clinical scoring systems',
        category: 'calculator',
        domainId: domains[2].id
      }
    })
  ])

  const engineeringTools = await Promise.all([
    db.tool.create({
      data: {
        name: 'engineering_calculator',
        description: 'Engineering calculations and formula applications',
        category: 'calculator',
        domainId: domains[3].id
      }
    }),
    db.tool.create({
      data: {
        name: 'design_standards',
        description: 'Access engineering design standards and codes',
        category: 'database',
        domainId: domains[3].id
      }
    }),
    db.tool.create({
      data: {
        name: 'simulation_tools',
        description: 'Engineering simulation and modeling tools',
        category: 'simulator',
        domainId: domains[3].id
      }
    }),
    db.tool.create({
      data: {
        name: 'material_selector',
        description: 'Material properties and selection guidance',
        category: 'selector',
        domainId: domains[3].id
      }
    }),
    db.tool.create({
      data: {
        name: 'safety_analyzer',
        description: 'Safety analysis and risk assessment tools',
        category: 'analyzer',
        domainId: domains[3].id
      }
    })
  ])

  const dataScienceTools = await Promise.all([
    db.tool.create({
      data: {
        name: 'data_analyzer',
        description: 'Statistical analysis and data exploration tools',
        category: 'analyzer',
        domainId: domains[4].id
      }
    }),
    db.tool.create({
      data: {
        name: 'ml_model_selector',
        description: 'Machine learning model selection and comparison',
        category: 'selector',
        domainId: domains[4].id
      }
    }),
    db.tool.create({
      data: {
        name: 'visualization_tools',
        description: 'Data visualization and chart generation',
        category: 'visualizer',
        domainId: domains[4].id
      }
    }),
    db.tool.create({
      data: {
        name: 'statistical_tester',
        description: 'Statistical testing and hypothesis validation',
        category: 'tester',
        domainId: domains[4].id
      }
    }),
    db.tool.create({
      data: {
        name: 'feature_engineer',
        description: 'Feature engineering and transformation tools',
        category: 'engineer',
        domainId: domains[4].id
      }
    })
  ])

  const businessTools = await Promise.all([
    db.tool.create({
      data: {
        name: 'swot_analyzer',
        description: 'SWOT analysis and strategic assessment tools',
        category: 'analyzer',
        domainId: domains[5].id
      }
    }),
    db.tool.create({
      data: {
        name: 'financial_modeler',
        description: 'Financial modeling and business valuation',
        category: 'modeler',
        domainId: domains[5].id
      }
    }),
    db.tool.create({
      data: {
        name: 'market_research',
        description: 'Market research and competitive analysis tools',
        category: 'research',
        domainId: domains[5].id
      }
    }),
    db.tool.create({
      data: {
        name: 'competitor_analyzer',
        description: 'Competitor analysis and benchmarking',
        category: 'analyzer',
        domainId: domains[5].id
      }
    }),
    db.tool.create({
      data: {
        name: 'strategy_planner',
        description: 'Strategic planning and business development tools',
        category: 'planner',
        domainId: domains[5].id
      }
    })
  ])

  console.log(`✅ Created tools for all domains`)
  console.log(`   - Finance: ${financeTools.length} tools`)
  console.log(`   - Law: ${lawTools.length} tools`)
  console.log(`   - Medicine: ${medicineTools.length} tools`)
  console.log(`   - Engineering: ${engineeringTools.length} tools`)
  console.log(`   - Data Science: ${dataScienceTools.length} tools`)
  console.log(`   - Business: ${businessTools.length} tools`)

  // Create a sample reasoning map
  const financeMap = await db.reasoningMap.create({
    data: {
      title: 'Financial Ratio Analysis',
      description: 'Complete guide to analyzing financial statements using ratio analysis',
      difficulty: 'intermediate',
      domainId: domains[0].id
    }
  })

  // Create reasoning steps for the map
  const steps = await Promise.all([
    db.reasoningStep.create({
      data: {
        title: 'Gather Financial Data',
        description: 'Collect balance sheet, income statement, and cash flow statement data',
        expectedOutcome: 'Organized financial data ready for analysis',
        timeEstimate: 5,
        order: 1,
        mapId: financeMap.id
      }
    }),
    db.reasoningStep.create({
      data: {
        title: 'Calculate Liquidity Ratios',
        description: 'Compute current ratio, quick ratio, and cash ratio',
        expectedOutcome: 'Understanding of short-term financial health',
        timeEstimate: 10,
        order: 2,
        mapId: financeMap.id
      }
    }),
    db.reasoningStep.create({
      data: {
        title: 'Analyze Profitability',
        description: 'Calculate and interpret profit margins, ROE, ROA',
        expectedOutcome: 'Assessment of company\'s ability to generate profits',
        timeEstimate: 15,
        order: 3,
        mapId: financeMap.id
      }
    })
  ])

  // Create step-tool associations
  await Promise.all([
    db.stepTool.create({
      data: {
        stepId: steps[0].id,
        toolId: financeTools[0].id, // financial_calculator
        confidence: 0.9,
        rationale: 'Essential for organizing and calculating financial metrics',
        priority: 1
      }
    }),
    db.stepTool.create({
      data: {
        stepId: steps[1].id,
        toolId: financeTools[1].id, // ratio_analyzer
        confidence: 0.95,
        rationale: 'Specifically designed for ratio analysis and interpretation',
        priority: 1
      }
    }),
    db.stepTool.create({
      data: {
        stepId: steps[2].id,
        toolId: financeTools[1].id, // ratio_analyzer
        confidence: 0.8,
        rationale: 'Useful for analyzing profitability ratios',
        priority: 1
      }
    }),
    db.stepTool.create({
      data: {
        stepId: steps[2].id,
        toolId: financeTools[0].id, // financial_calculator
        confidence: 0.7,
        rationale: 'Supports complex profitability calculations',
        priority: 2
      }
    })
  ])

  console.log('✅ Created sample reasoning map with steps and tool associations')
  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })