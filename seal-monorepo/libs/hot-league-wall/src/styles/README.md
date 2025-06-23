# Hot League Wall Unified Styles

This directory contains the unified SCSS styles for the Hot League Wall library. The styles are organized according to SOLID principles to ensure maintainability, reusability, and consistency across all components and games.

## File Structure

-   `_variables.scss` - Contains all shared variables for colors, typography, spacing, etc.
-   `_mixins.scss` - Contains reusable style patterns and compositions
-   `_animations.scss` - Contains all keyframe animations
-   `index.scss` - Entry point that imports all style files

## How to Use

### Importing in Component SCSS

You can either import the entire styles system:

```scss
@import 'src/styles';
```

Or import specific modules as needed:

```scss
@import 'src/styles/variables';
@import 'src/styles/mixins';
```

## Style Organization

### Variables

Variables are organized by category:

-   **Colors**: Theme colors and CSS variables for theming support
-   **Typography**: Font sizes and weights
-   **Layout**: Border radius and spacing
-   **Animation durations**: Standard animation timing
-   **Component sizes**: Specific measurements for components
-   **Breakpoints**: Standard screen size breakpoints
-   **Z-index**: Layer management

### Mixins

Mixins are organized by function:

-   **Layout mixins**: Flex layouts, grid layouts, container sizing
-   **Responsive mixins**: Media queries and responsive utilities
-   **Typography mixins**: Text styles and formatting
-   **Component mixins**: Reusable component patterns
-   **State mixins**: Component states like disabled, active, etc.
-   **Animation mixins**: Transition and animation utilities
-   **Interaction mixins**: User interaction helpers
-   **Position mixins**: Element positioning

### Animations

Animations are organized by type:

-   Score animations
-   Pop animations
-   Pulse animations
-   Fade animations
-   Glow animations
-   Spinner animations
-   Dots animations
-   Card animations

## Style Guidelines

1. **Use variables** for all colors, spacing, sizes, and typography
2. **Use mixins** for repeated patterns
3. **Group related styles** with comments
4. **Follow BEM naming convention** for classes
5. **Keep specificity low**
6. **Comment your code** for complex styles
7. **Organize styles semantically**

## Responsive Design

Use the responsive mixins to create responsive layouts:

```scss
@include mobile-only {
    // Styles for mobile only
}

@include tablet-up {
    // Styles for tablet and above
}

@include desktop-up {
    // Styles for desktop and above
}
```

## Migration Guide

If you're migrating from the old style systems:

1. Replace imports from game-specific styles with the unified styles
2. Update any variable or mixin names that have changed
3. Use the new responsive mixins instead of writing media queries

## Contribution Guidelines

1. Keep variables, mixins, and animations organized by category
2. Document any new additions
3. Avoid duplicating existing functionality
4. Test your changes across different components and screen sizes
