'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Leaf, Heart, Globe, TrendingUp, Info, Filter, X } from 'lucide-react'

interface ESGFilterProps {
  onFilterChange: (filters: ESGFilters) => void
  bondCount?: number
}

interface ESGFilters {
  greenBonds: boolean
  socialBonds: boolean
  sustainableBonds: boolean
  climateAligned: boolean
  minESGScore: number
  esgRating: string
  unSDGs: string[]
}

const UN_SDGS = [
  { id: '1', name: 'No Poverty', icon: '🎯' },
  { id: '2', name: 'Zero Hunger', icon: '🌾' },
  { id: '3', name: 'Good Health', icon: '🏥' },
  { id: '4', name: 'Quality Education', icon: '📚' },
  { id: '5', name: 'Gender Equality', icon: '⚖️' },
  { id: '6', name: 'Clean Water', icon: '💧' },
  { id: '7', name: 'Affordable Energy', icon: '⚡' },
  { id: '8', name: 'Decent Work', icon: '💼' },
  { id: '9', name: 'Industry Innovation', icon: '🏭' },
  { id: '10', name: 'Reduced Inequalities', icon: '🤝' },
  { id: '11', name: 'Sustainable Cities', icon: '🏙️' },
  { id: '12', name: 'Responsible Consumption', icon: '♻️' },
  { id: '13', name: 'Climate Action', icon: '🌍' },
  { id: '14', name: 'Life Below Water', icon: '🐠' },
  { id: '15', name: 'Life on Land', icon: '🌲' },
  { id: '16', name: 'Peace & Justice', icon: '⚖️' },
  { id: '17', name: 'Partnerships', icon: '🤝' },
]

export function ESGFilter({ onFilterChange, bondCount = 0 }: ESGFilterProps) {
  const [filters, setFilters] = useState<ESGFilters>({
    greenBonds: false,
    socialBonds: false,
    sustainableBonds: false,
    climateAligned: false,
    minESGScore: 0,
    esgRating: 'any',
    unSDGs: [],
  })

  const [showDialog, setShowDialog] = useState(false)

  const updateFilter = (key: keyof ESGFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleSDG = (sdgId: string) => {
    const newSDGs = filters.unSDGs.includes(sdgId)
      ? filters.unSDGs.filter(id => id !== sdgId)
      : [...filters.unSDGs, sdgId]
    updateFilter('unSDGs', newSDGs)
  }

  const resetFilters = () => {
    const defaultFilters: ESGFilters = {
      greenBonds: false,
      socialBonds: false,
      sustainableBonds: false,
      climateAligned: false,
      minESGScore: 0,
      esgRating: 'any',
      unSDGs: [],
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const activeFilterCount = 
    (filters.greenBonds ? 1 : 0) +
    (filters.socialBonds ? 1 : 0) +
    (filters.sustainableBonds ? 1 : 0) +
    (filters.climateAligned ? 1 : 0) +
    (filters.minESGScore > 0 ? 1 : 0) +
    (filters.esgRating !== 'any' ? 1 : 0) +
    filters.unSDGs.length

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            ESG Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ESG Bond Filters</DialogTitle>
            <DialogDescription>
              Filter bonds based on Environmental, Social, and Governance criteria
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
              <TabsTrigger value="sdgs">UN SDGs</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="green-bonds"
                    checked={filters.greenBonds}
                    onCheckedChange={(checked) => updateFilter('greenBonds', checked)}
                  />
                  <Label htmlFor="green-bonds" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium">Green Bonds</div>
                        <div className="text-sm text-muted-foreground">
                          Financing environmental projects and climate solutions
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="social-bonds"
                    checked={filters.socialBonds}
                    onCheckedChange={(checked) => updateFilter('socialBonds', checked)}
                  />
                  <Label htmlFor="social-bonds" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="font-medium">Social Bonds</div>
                        <div className="text-sm text-muted-foreground">
                          Supporting social programs and community development
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="sustainable-bonds"
                    checked={filters.sustainableBonds}
                    onCheckedChange={(checked) => updateFilter('sustainableBonds', checked)}
                  />
                  <Label htmlFor="sustainable-bonds" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Sustainability Bonds</div>
                        <div className="text-sm text-muted-foreground">
                          Combined environmental and social impact projects
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="climate-aligned"
                    checked={filters.climateAligned}
                    onCheckedChange={(checked) => updateFilter('climateAligned', checked)}
                  />
                  <Label htmlFor="climate-aligned" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium">Climate Aligned</div>
                        <div className="text-sm text-muted-foreground">
                          Aligned with Paris Agreement climate goals
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ratings" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="esg-score">Minimum ESG Score</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="esg-score"
                      min={0}
                      max={100}
                      step={10}
                      value={[filters.minESGScore]}
                      onValueChange={([value]) => updateFilter('minESGScore', value)}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-medium">{filters.minESGScore}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Filter bonds with ESG scores above this threshold
                  </p>
                </div>

                <div>
                  <Label htmlFor="esg-rating">ESG Rating</Label>
                  <Select
                    value={filters.esgRating}
                    onValueChange={(value) => updateFilter('esgRating', value)}
                  >
                    <SelectTrigger id="esg-rating" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Rating</SelectItem>
                      <SelectItem value="AAA">AAA</SelectItem>
                      <SelectItem value="AA">AA</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="BBB">BBB</SelectItem>
                      <SelectItem value="BB">BB</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum ESG rating from independent agencies
                  </p>
                </div>

                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          About ESG Ratings
                        </p>
                        <p className="text-blue-700 dark:text-blue-300 mt-1">
                          ESG scores and ratings evaluate bonds based on environmental impact, 
                          social responsibility, and governance practices. Higher scores indicate 
                          better sustainability performance.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sdgs" className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Select UN Sustainable Development Goals that bonds should support
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {UN_SDGS.map((sdg) => (
                    <div
                      key={sdg.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        filters.unSDGs.includes(sdg.id)
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleSDG(sdg.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{sdg.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium">SDG {sdg.id}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {sdg.name}
                          </div>
                        </div>
                        {filters.unSDGs.includes(sdg.id) && (
                          <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {bondCount} bonds match current filters
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetFilters}>
                Reset All
              </Button>
              <Button onClick={() => setShowDialog(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.greenBonds && (
            <Badge variant="secondary" className="gap-1">
              <Leaf className="w-3 h-3" />
              Green Bonds
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('greenBonds', false)}
              />
            </Badge>
          )}
          {filters.socialBonds && (
            <Badge variant="secondary" className="gap-1">
              <Heart className="w-3 h-3" />
              Social Bonds
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('socialBonds', false)}
              />
            </Badge>
          )}
          {filters.sustainableBonds && (
            <Badge variant="secondary" className="gap-1">
              <Globe className="w-3 h-3" />
              Sustainable Bonds
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('sustainableBonds', false)}
              />
            </Badge>
          )}
          {filters.climateAligned && (
            <Badge variant="secondary" className="gap-1">
              Climate Aligned
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('climateAligned', false)}
              />
            </Badge>
          )}
          {filters.minESGScore > 0 && (
            <Badge variant="secondary" className="gap-1">
              ESG Score ≥ {filters.minESGScore}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('minESGScore', 0)}
              />
            </Badge>
          )}
          {filters.esgRating !== 'any' && (
            <Badge variant="secondary" className="gap-1">
              Rating ≥ {filters.esgRating}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('esgRating', 'any')}
              />
            </Badge>
          )}
          {filters.unSDGs.map((sdgId) => {
            const sdg = UN_SDGS.find(s => s.id === sdgId)
            return sdg ? (
              <Badge key={sdgId} variant="secondary" className="gap-1">
                {sdg.icon} SDG {sdg.id}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => toggleSDG(sdgId)}
                />
              </Badge>
            ) : null
          })}
        </div>
      )}
    </>
  )
}
