# Game Base Styles

> **IMPORTANT**: This directory is maintained for backward compatibility.
> For new components, please use the centralized styles at `src/styles`.

## Migration Guide

1. For new components, import from the centralized styles:

```scss
@import 'src/styles';
```

2. For existing components, continue using the local imports for now:

```scss
@import '../styles/variables';
@import '../styles/mixins';
```

3. For a mix of both (recommended for gradual migration):

```scss
// Import the game's style index which includes both centralized and local styles
@import '../styles';
```

## Structure

-   The local style files now import from the centralized styles
-   Any game-specific styles are added to these files
-   The `index.scss` file imports both centralized and local styles
-   The `_theme.scss` file contains legacy styling that's still in use

See the main [style documentation](../../../styles/README.md) for detailed information about the available variables, mixins, and animations.

## Files Structure

-   `_variables.scss` - Contains all shared variables (colors, sizes, typography, etc.)
-   `_mixins.scss` - Contains reusable style patterns and compositions
-   `_theme.scss` - Original theme file (legacy support)

## How to Use

### Importing in Component SCSS

```scss
@import '../styles/variables';
@import '../styles/mixins';
```

### Variables

Variables are organized by category:

-   Colors (CSS variables for theming support)
-   Typography (font sizes and weights)
-   Layout (border-radius and spacing)
-   Component sizes (specific measurements for game components)
-   Breakpoints (responsive design)
-   Z-index (layer management)

### Mixins

Mixins provide reusable patterns for:

-   Flex layouts (`flex-center`, `flex-column`, `flex-row-between`)
-   Responsive layouts (`responsive-width`)
-   Grid layouts (`grid-layout`)
-   Component states (`disabled-state`)
-   User interaction (`no-select`)
-   Positioning (`absolute-center`, `absolute-horizontal-center`)

## Style Guidelines

1. Use CSS variables where possible to support theming
2. Always use variables for spacing, sizes, and typography
3. Use mixins for repeated patterns
4. Group related styles with comments
5. Keep specificity low
6. Use descriptive class names

## Responsive Design

The mixins and variables are designed to support responsive layouts. Use the `responsive-width` mixin and breakpoint variables to create responsive components.
