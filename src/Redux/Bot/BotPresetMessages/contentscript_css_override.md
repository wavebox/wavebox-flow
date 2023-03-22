When multiple styles target the same element, those with more specificity are used first. For example...

```css
/* This might be your base selector */
#my-element {
  background: red;
}

/* But you may need to use a more specific element to override other styles */
#my-element.active {
  background: red;
}

/* You can always go one further, and use the !important directive, to you know, make your style important */
#my-element.active {
  background: red !important;
}
```