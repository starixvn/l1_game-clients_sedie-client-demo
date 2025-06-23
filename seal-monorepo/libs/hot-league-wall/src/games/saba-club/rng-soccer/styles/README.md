# RNG Soccer Styles

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
@import '../styles/animations';
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

See the main [style documentation](../../../../styles/README.md) for detailed information about the available variables, mixins, and animations.

## Files Structure

-   `_variables.scss` - Contains all shared variables (colors, sizes, typography, etc.)
-   `_mixins.scss` - Contains reusable style patterns and compositions
-   `_animations.scss` - Contains all keyframe animations used across components

## How to Use

### Importing in Component SCSS

```scss
@import '../styles/variables';
@import '../styles/mixins';
@import '../styles/animations';
```

### Variables

Variables are organized by category:

-   Colors (use `$color-*`)
-   Typography (use `$font-size-*` and `$font-weight-*`)
-   Layout (use `$border-radius-*` and `$spacing-*`)
-   Animation durations (use `$animation-duration-*`)
-   Component sizes (specific measurements for consistent components)

### Mixins

Mixins provide reusable patterns for:

-   Flex layouts (e.g. `@include flex-center;`)
-   Typography styles (e.g. `@include text-style-heading;`)
-   Component styles (e.g. `@include score-box;`, `@include card-style;`)
-   Container styles (e.g. `@include fullsize-container;`)
-   Animation defaults (e.g. `@include transition-default;`)

### Animations

All keyframe animations are centralized, including:

-   Score animations
-   Pop animations
-   Pulse animations
-   Fade animations
-   Glow animations
-   Spinner animations
-   Dots animations

## Style Guidelines

1. Always use variables for colors, spacing, sizes, and typography
2. Use mixins for repeated patterns
3. Group related styles with comments
4. Use BEM naming convention for classes
5. Keep specificity low
6. Comment your code for complex styles
7. Organize styles semantically
