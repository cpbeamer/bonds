# BondScout Theme System

This centralized theme system provides consistent styling across the entire BondScout application.

## Usage

### Import the theme
```typescript
import { theme, getButtonClasses, getBadgeClasses, brand } from '@/lib/themes'
```

### Colors
```typescript
// Use theme colors
<div style={{ backgroundColor: theme.colors.primary[600] }}>
<span style={{ color: theme.colors.gray[600] }}>
```

### Typography
```typescript
// Font sizes
<h1 style={{ fontSize: theme.typography.fontSize['3xl'] }}>
// Font weights
<span style={{ fontWeight: theme.typography.fontWeight.semibold }}>
```

### Components
Use the helper functions for consistent component styling:

```typescript
// Buttons
<button className={getButtonClasses('primary', 'lg')}>
<button className={getButtonClasses('secondary', 'md')}>
<button className={getButtonClasses('outline', 'sm')}>

// Badges
<span className={getBadgeClasses('primary')}>
<span className={getBadgeClasses('secondary')}>

// Cards
<Card className={getCardClasses()}>
```

### Layout
```typescript
// Page layout
<div className={theme.layout.page.background}>
  <main className={`${theme.layout.container.margin} ${theme.layout.container.padding}`}>

// Header
<header className={theme.layout.header.background}>
```

### Spacing
```typescript
// Use consistent spacing
<div style={{ margin: theme.spacing.lg }}>
<div style={{ padding: theme.spacing.md }}>
```

### Brand Constants
```typescript
// Use brand constants for consistency
<title>{brand.name} - {brand.tagline}</title>
<meta name="description" content={brand.description} />
```

## Theme Structure

### Colors
- **Primary**: Orange color palette (main brand color)
- **Gray**: Slate color palette for text and backgrounds
- **Semantic**: Success, error, warning, info colors
- **Background**: Light/dark theme backgrounds

### Typography
- **Font sizes**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl
- **Font weights**: normal, medium, semibold, bold
- **Line heights**: tight, normal, relaxed

### Components
Pre-defined styles for common components:
- Buttons (primary, secondary, outline, ghost)
- Cards (base, header, content)
- Inputs, badges, tables

### Layout
- Header dimensions and styling
- Container max-widths and padding
- Page backgrounds

### Animations
- Transition durations
- Hover effects

## Benefits

1. **Consistency**: All components use the same design tokens
2. **Maintainability**: Change the theme in one place, update everywhere
3. **Type Safety**: TypeScript ensures you use valid theme values
4. **Performance**: No runtime CSS-in-JS, uses static classes where possible
5. **Accessibility**: Consistent contrast ratios and spacing

## Customization

To modify the theme:

1. Update values in `/lib/themes.ts`
2. The changes will automatically apply throughout the app
3. For Tailwind classes, ensure they're included in your `tailwind.config.js`

## CSS Variables Integration

The theme works alongside your CSS variables in `globals.css`. The CSS variables handle the core design tokens, while the theme file provides structured access and utility functions.

## Example Component

See `/components/themed/ThemeExample.tsx` for a comprehensive example of how to use all theme features.