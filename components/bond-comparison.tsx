'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Plus, TrendingUp, Shield, Calendar, DollarSign, Info } from 'lucide-react'
import { toast } from 'sonner'

interface BondComparisonProps {
  bonds: any[]
  onClose?: () => void
}

interface ComparisonMetric {
  label: string
  key: string
  format?: 'percent' | 'currency' | 'date' | 'number' | 'text'
  tooltip?: string
}

const comparisonMetrics: ComparisonMetric[] = [
  { label: 'Issuer', key: 'issuerName', format: 'text' },
  { label: 'CUSIP', key: 'cusip', format: 'text' },
  { label: 'Type', key: 'type', format: 'text' },
  { label: 'Coupon', key: 'coupon', format: 'percent' },
  { label: 'Maturity', key: 'maturity', format: 'date' },
  { label: 'Price', key: 'price', format: 'currency' },
  { label: 'YTW', key: 'yield', format: 'percent', tooltip: 'Yield to Worst' },
  { label: 'ATYTW', key: 'atytw', format: 'percent', tooltip: 'After-Tax Yield to Worst' },
  { label: 'Rating', key: 'ratingBucket', format: 'text' },
  { label: 'Callable', key: 'callable', format: 'text' },
  { label: 'State', key: 'state', format: 'text' },
  { label: 'Sector', key: 'sector', format: 'text' },
  { label: 'Duration', key: 'duration', format: 'number', tooltip: 'Modified Duration' },
  { label: 'Min Lot', key: 'minDenomination', format: 'currency' },
  { label: 'Tax-Exempt', key: 'federalTaxExempt', format: 'text' },
]

export function BondComparison({ bonds: initialBonds, onClose }: BondComparisonProps) {
  const [selectedBonds, setSelectedBonds] = useState<any[]>(initialBonds.slice(0, 3))
  const [showBondSelector, setShowBondSelector] = useState(false)

  const formatValue = (value: any, format?: string) => {
    if (value === undefined || value === null) return 'N/A'
    
    switch (format) {
      case 'percent':
        return `${value.toFixed(2)}%`
      case 'currency':
        return `$${value.toLocaleString()}`
      case 'date':
        return new Date(value).toLocaleDateString()
      case 'number':
        return value.toFixed(2)
      case 'text':
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        return value
      default:
        return value
    }
  }

  const removeBond = (bondId: string) => {
    setSelectedBonds(selectedBonds.filter(b => b.id !== bondId))
  }

  const addBond = (bond: any) => {
    if (selectedBonds.length >= 4) {
      toast.error('Maximum 4 bonds can be compared at once')
      return
    }
    if (selectedBonds.find(b => b.id === bond.id)) {
      toast.error('Bond already selected for comparison')
      return
    }
    setSelectedBonds([...selectedBonds, bond])
    setShowBondSelector(false)
  }

  const getBestValue = (metric: ComparisonMetric) => {
    const values = selectedBonds.map(bond => bond[metric.key]).filter(v => v !== undefined && v !== null)
    if (values.length === 0) return null

    switch (metric.key) {
      case 'yield':
      case 'atytw':
      case 'coupon':
        return Math.max(...values)
      case 'price':
        return Math.min(...values)
      case 'duration':
        return Math.min(...values)
      case 'ratingBucket':
        // Compare ratings (simplified)
        const ratingOrder = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-']
        return values.sort((a, b) => ratingOrder.indexOf(a) - ratingOrder.indexOf(b))[0]
      default:
        return null
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bond Comparison</CardTitle>
              <CardDescription>
                Side-by-side comparison of selected bonds
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedBonds.length < 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBondSelector(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Bond
                </Button>
              )}
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedBonds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No bonds selected for comparison</p>
              <Button
                className="mt-4"
                onClick={() => setShowBondSelector(true)}
              >
                Select Bonds to Compare
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">
                      Metric
                    </TableHead>
                    {selectedBonds.map((bond) => (
                      <TableHead key={bond.id} className="text-center min-w-[200px]">
                        <div className="space-y-1">
                          <div className="font-medium">{bond.issuerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {bond.coupon}% • {new Date(bond.maturity).getFullYear()}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBond(bond.id)}
                            className="h-6 px-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonMetrics.map((metric) => {
                    const bestValue = getBestValue(metric)
                    return (
                      <TableRow key={metric.key}>
                        <TableCell className="sticky left-0 bg-background z-10 font-medium">
                          <div className="flex items-center gap-1">
                            {metric.label}
                            {metric.tooltip && (
                              <Info className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        {selectedBonds.map((bond) => {
                          const value = bond[metric.key]
                          const isBest = bestValue !== null && value === bestValue
                          return (
                            <TableCell key={bond.id} className="text-center">
                              <div className={isBest ? 'font-semibold text-green-600 dark:text-green-400' : ''}>
                                {formatValue(value, metric.format)}
                                {isBest && metric.key !== 'issuerName' && metric.key !== 'cusip' && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Best
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedBonds.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <h4 className="font-semibold text-sm">Highest Yield</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedBonds.reduce((best, bond) => 
                      (bond.atytw || 0) > (best.atytw || 0) ? bond : best
                    ).issuerName}
                  </p>
                  <p className="text-lg font-semibold">
                    {Math.max(...selectedBonds.map(b => b.atytw || 0)).toFixed(2)}% ATYTW
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <h4 className="font-semibold text-sm">Best Rating</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedBonds.reduce((best, bond) => {
                      const ratingOrder = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-']
                      const bestIdx = ratingOrder.indexOf(best.ratingBucket || 'A-')
                      const bondIdx = ratingOrder.indexOf(bond.ratingBucket || 'A-')
                      return bondIdx < bestIdx ? bond : best
                    }).issuerName}
                  </p>
                  <p className="text-lg font-semibold">
                    {selectedBonds.reduce((best, bond) => {
                      const ratingOrder = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-']
                      const bestIdx = ratingOrder.indexOf(best.ratingBucket || 'A-')
                      const bondIdx = ratingOrder.indexOf(bond.ratingBucket || 'A-')
                      return bondIdx < bestIdx ? bond : best
                    }).ratingBucket}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-orange-500" />
                    <h4 className="font-semibold text-sm">Best Value</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedBonds.reduce((best, bond) => 
                      (bond.price || 100) < (best.price || 100) ? bond : best
                    ).issuerName}
                  </p>
                  <p className="text-lg font-semibold">
                    ${Math.min(...selectedBonds.map(b => b.price || 100)).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showBondSelector} onOpenChange={setShowBondSelector}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Bonds to Compare</DialogTitle>
            <DialogDescription>
              Choose up to {4 - selectedBonds.length} more bonds
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">ATYTW</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialBonds
                  .filter(bond => !selectedBonds.find(b => b.id === bond.id))
                  .map((bond) => (
                    <TableRow key={bond.id}>
                      <TableCell>
                        <Checkbox
                          onCheckedChange={(checked) => {
                            if (checked) addBond(bond)
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{bond.issuerName}</div>
                        <div className="text-sm text-muted-foreground">{bond.cusip}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {bond.coupon}% • {new Date(bond.maturity).getFullYear()}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {bond.ratingBucket}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {bond.atytw?.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right">
                        ${bond.price?.toFixed(2) || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
