// Example component showing how to use the centralized theme
import { theme, getButtonClasses, getBadgeClasses, getCardClasses } from '@/lib/themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ThemeExample() {
  return (
    <div className={theme.layout.page.background}>
      <div className={`${theme.layout.container.margin} ${theme.layout.container.padding} ${theme.layout.page.padding}`}>

        {/* Typography Examples */}
        <section className="mb-8">
          <h1 className="text-5xl font-bold mb-4" style={{ fontSize: theme.typography.fontSize['5xl'], fontWeight: theme.typography.fontWeight.bold }}>
            Typography Scale
          </h1>
          <h2 className="text-3xl font-semibold mb-3" style={{ fontSize: theme.typography.fontSize['3xl'], fontWeight: theme.typography.fontWeight.semibold }}>
            Secondary Heading
          </h2>
          <p className="text-lg mb-4" style={{ fontSize: theme.typography.fontSize.lg }}>
            This is a paragraph using the large text size from our theme system.
          </p>
          <p className="text-base" style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.gray[600] }}>
            Regular paragraph text with themed gray color.
          </p>
        </section>

        {/* Color Examples */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-lg mx-auto mb-2"
                style={{ backgroundColor: theme.colors.primary[600] }}
              ></div>
              <p className="text-sm">Primary</p>
            </div>
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-lg mx-auto mb-2"
                style={{ backgroundColor: theme.colors.gray[500] }}
              ></div>
              <p className="text-sm">Gray</p>
            </div>
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-lg mx-auto mb-2"
                style={{ backgroundColor: theme.colors.semantic.success }}
              ></div>
              <p className="text-sm">Success</p>
            </div>
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-lg mx-auto mb-2"
                style={{ backgroundColor: theme.colors.semantic.error }}
              ></div>
              <p className="text-sm">Error</p>
            </div>
          </div>
        </section>

        {/* Button Examples */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className={getButtonClasses('primary', 'lg')}>
              Primary Large
            </button>
            <button className={getButtonClasses('secondary', 'md')}>
              Secondary Medium
            </button>
            <button className={getButtonClasses('outline', 'sm')}>
              Outline Small
            </button>
            <button className={getButtonClasses('ghost', 'md')}>
              Ghost Medium
            </button>
          </div>
        </section>

        {/* Badge Examples */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Badges</h2>
          <div className="flex flex-wrap gap-4">
            <span className={getBadgeClasses('primary')}>Primary Badge</span>
            <span className={getBadgeClasses('secondary')}>Secondary Badge</span>
            <span className={getBadgeClasses('outline')}>Outline Badge</span>
          </div>
        </section>

        {/* Card Examples */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className={getCardClasses()}>
              <CardHeader className={theme.components.card.header}>
                <CardTitle>Themed Card</CardTitle>
              </CardHeader>
              <CardContent className={theme.components.card.content}>
                <p>This card uses our centralized theme system for consistent styling.</p>
                <div className="mt-4">
                  <button className={getButtonClasses('primary', 'sm')}>
                    Action Button
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className={getCardClasses()}>
              <CardHeader className={theme.components.card.header}>
                <CardTitle>Bond Information</CardTitle>
              </CardHeader>
              <CardContent className={theme.components.card.content}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Yield:</span>
                    <span className="font-semibold" style={{ color: theme.colors.primary[600] }}>
                      3.12%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <span className={getBadgeClasses('secondary')}>AAA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Spacing Examples */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Spacing Scale</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="bg-blue-200 h-4"
                style={{ width: theme.spacing.xs }}
              ></div>
              <span className="text-sm">XS ({theme.spacing.xs})</span>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="bg-blue-300 h-4"
                style={{ width: theme.spacing.sm }}
              ></div>
              <span className="text-sm">SM ({theme.spacing.sm})</span>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="bg-blue-400 h-4"
                style={{ width: theme.spacing.md }}
              ></div>
              <span className="text-sm">MD ({theme.spacing.md})</span>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="bg-blue-500 h-4"
                style={{ width: theme.spacing.lg }}
              ></div>
              <span className="text-sm">LG ({theme.spacing.lg})</span>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="bg-blue-600 h-4"
                style={{ width: theme.spacing.xl }}
              ></div>
              <span className="text-sm">XL ({theme.spacing.xl})</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}