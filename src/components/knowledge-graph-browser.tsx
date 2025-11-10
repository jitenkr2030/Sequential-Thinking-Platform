"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Database, 
  Calculator, 
  Scale, 
  Heart, 
  Cog, 
  BarChart3, 
  Briefcase,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react"

interface Tool {
  id: string
  name: string
  description: string
  category: string
  domain: {
    id: string
    name: string
    icon: string
    color: string
  }
  stepTools: Array<{
    step: {
      map: {
        title: string
        difficulty: string
      }
    }
  }>
}

interface Domain {
  id: string
  name: string
  description: string
  icon: string
  color: string
  tools: Array<{
    id: string
    name: string
    category: string
  }>
  _count: {
    tools: number
    reasoningMaps: number
    sessions: number
  }
}

interface KnowledgeGraphBrowserProps {
  onBack?: () => void
  onToolSelect?: (tool: Tool) => void
}

export function KnowledgeGraphBrowser({ onBack, onToolSelect }: KnowledgeGraphBrowserProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")

  const categories = [
    "all",
    "calculator",
    "analyzer", 
    "database",
    "search",
    "simulator",
    "modeler",
    "guideline",
    "checker",
    "selector",
    "builder",
    "planner"
  ]

  const domainIcons: Record<string, any> = {
    "Finance & Accounting": Calculator,
    "Law": Scale,
    "Medicine": Heart,
    "Engineering": Cog,
    "Data Science": BarChart3,
    "Business": Briefcase
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch domains
      const domainsResponse = await fetch('/api/knowledge-graph/domains')
      const domainsData = await domainsResponse.json()
      setDomains(domainsData)

      // Fetch tools
      const toolsResponse = await fetch('/api/knowledge-graph/tools')
      const toolsData = await toolsResponse.json()
      setTools(toolsData)
    } catch (error) {
      console.error('Error fetching knowledge graph data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory
    const matchesDomain = selectedDomain === "all" || tool.domain.name === selectedDomain
    
    return matchesSearch && matchesCategory && matchesDomain
  })

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      calculator: Calculator,
      analyzer: BarChart3,
      database: Database,
      search: Search,
      simulator: Cog,
      modeler: Database,
      guideline: Scale,
      checker: Heart,
      selector: Filter,
      builder: Plus,
      planner: Briefcase
    }
    return iconMap[category] || Database
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Knowledge Graph...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Knowledge Graph</h2>
            <p className="text-gray-600">Domain-specific tools and reasoning resources</p>
          </div>
        </div>
        <Badge variant="outline">
          <Database className="w-3 h-3 mr-1" />
          {tools.length} Tools
        </Badge>
      </div>

      <Tabs defaultValue="tools" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tools">Tools Browser</TabsTrigger>
          <TabsTrigger value="domains">Domains Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    {domains.map(domain => (
                      <SelectItem key={domain.id} value={domain.name}>
                        {domain.icon} {domain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map(tool => {
              const CategoryIcon = getCategoryIcon(tool.category)
              const DomainIcon = domainIcons[tool.domain.name] || Database
              
              return (
                <Card 
                  key={tool.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                  onClick={() => onToolSelect?.(tool)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CategoryIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{tool.name}</CardTitle>
                          <CardDescription className="text-xs">{tool.category}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={tool.domain.color}>
                        <DomainIcon className="w-3 h-3 mr-1" />
                        {tool.domain.icon}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {tool.stepTools.length} reasoning maps
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredTools.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          {/* Domains Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map(domain => {
              const DomainIcon = domainIcons[domain.name] || Database
              
              return (
                <Card key={domain.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center pb-4">
                    <div className="text-5xl mb-3">{domain.icon}</div>
                    <CardTitle className="text-xl">{domain.name}</CardTitle>
                    <CardDescription>{domain.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{domain._count.tools}</div>
                          <div className="text-xs text-gray-600">Tools</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{domain._count.reasoningMaps}</div>
                          <div className="text-xs text-gray-600">Maps</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{domain._count.sessions}</div>
                          <div className="text-xs text-gray-600">Sessions</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Available Tools:</h4>
                        <div className="flex flex-wrap gap-1">
                          {domain.tools.slice(0, 6).map((tool, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tool.name.replace('_', ' ')}
                            </Badge>
                          ))}
                          {domain.tools.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{domain.tools.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button className="w-full" variant="outline">
                        <DomainIcon className="w-4 h-4 mr-2" />
                        Explore Domain
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}