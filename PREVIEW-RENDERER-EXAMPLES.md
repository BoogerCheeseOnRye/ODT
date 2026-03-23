# Preview Renderer Usage Examples

## Quick Start

### 1. Render Simple HTML
```javascript
const html = `
<div>
  <h1>Hello World</h1>
  <p>This is a preview</p>
</div>
`;

await renderPreviewCode(html);
```

**Result:** 
- Purple box for `<h1>` at top
- Yellow box for `<p>` below
- Blue parent `<div>` container

### 2. Render with CSS
```javascript
const html = `<button>Click Me</button>`;
const css = `button { background: blue; padding: 10px; }`;

await renderPreviewCode(html, css);
```

**Result:**
- Green button box
- Orange CSS indicator sphere
- Shows CSS is present

### 3. Render with JavaScript
```javascript
const html = `<button onclick="alert('hi')">Click</button>`;
const js = `function handleClick() { alert('Button clicked!'); }`;

await renderPreviewCode(html, js);
```

**Result:**
- Green button box
- Green JS indicator sphere
- Shows code is interactive

### 4. Complex Form Layout
```javascript
const html = `
<form>
  <input type="email" placeholder="Email">
  <input type="password" placeholder="Password">
  <button type="submit">Login</button>
</form>
`;

await renderPreviewCode(html);
```

**Result:**
- Cyan form container
- Two green input boxes stacked
- Green button at bottom
- Visual hierarchy preserved

### 5. Article with Images
```javascript
const html = `
<article>
  <h2>Article Title</h2>
  <img src="photo.jpg" alt="Featured">
  <p>Article content paragraph...</p>
  <a href="more">Read more</a>
</article>
`;

await renderPreviewCode(html);
```

**Result:**
- Blue article container
- Purple heading box
- Red image box
- Yellow paragraph box
- Yellow link box

## Advanced Usage

### Get Statistics
```javascript
const result = await renderPreviewCode(html, css, js);

console.log(result.success);        // true
console.log(result.time);           // 45.2 (ms)
console.log(result.objects);        // 12 (3D objects created)

// Or get detailed stats
const stats = window.previewRenderer.getStats();
console.log(stats.compileTime);     // 45.2
console.log(stats.objects);         // 12
console.log(stats.errors);          // 0
```

### Clear Preview
```javascript
window.previewRenderer.clear();
// Removes all rendered objects, keeps lights and grid
```

### Export Statistics
```javascript
const allStats = window.previewRenderer.exportStats();
// {
//   compileTime: 45.2,
//   objects: 12,
//   errors: 0,
//   warnings: 0,
//   codeLines: { html: 8, css: 2, js: 0 }
// }
```

### Handle Errors
```javascript
try {
  const result = await renderPreviewCode(invalidHtml);
  
  if (!result.success) {
    console.error('Preview failed:', result.error);
  }
} catch (err) {
  console.error('Fatal error:', err.message);
}
```

## Real-World Integration

### Scenario 1: Chat Response with Code Block

```javascript
// User sends: "Create a login form"
// AI responds with HTML code

const aiResponse = `
<div class="login-form">
  <h2>Login</h2>
  <form>
    <input type="email" placeholder="Email" required>
    <input type="password" placeholder="Password" required>
    <button type="submit">Sign In</button>
  </form>
</div>
`;

// Extract and preview
const codeBlock = extractCodeFromMarkdown(aiResponse);
const preview = await renderPreviewCode(codeBlock);

if (preview.success) {
  console.log(`Preview: ${preview.objects} elements rendered`);
} else {
  console.error(`Failed to preview: ${preview.error}`);
}
```

### Scenario 2: Project File Inspector

```javascript
// User clicks on HTML file in file tree
// System previews the code

async function previewFile(file) {
  const content = await loadFileContent(file.path);
  const preview = await renderPreviewCode(content);
  
  // Show stats in UI
  document.getElementById('preview-stats').innerHTML = `
    Objects: ${preview.objects}
    Compile: ${preview.time}ms
  `;
}
```

### Scenario 3: Code Generation Preview

```javascript
// Automation engine generates code
// Immediately preview without deploying

const generatedCode = automationEngine.generateHTML({
  type: 'dashboard',
  title: 'Sales Report',
  widgets: 5
});

const preview = await renderPreviewCode(generatedCode);

// If preview succeeds, code is likely valid
if (preview.success && preview.objects > 0) {
  console.log('✓ Generated code is renderable');
}
```

## Color Coding Reference

Use this to understand the 3D preview:

| Element Type | Color | Hex |
|--------------|-------|-----|
| `<div>`, `<section>` | Blue | #58a6ff |
| `<button>`, `<input>` | Green | #10b981 |
| `<h1>`, `<h2>`, `<h3>` | Purple | #8b5cf6 |
| `<p>`, `<span>`, `<a>` | Yellow | #fbbf24 |
| `<img>` | Red | #ef5350 |
| `<form>` | Cyan | #00bcd4 |
| Default/Unknown | Gray | #9ca3af |
| **CSS Indicator** | Orange | #ff9800 |
| **JS Indicator** | Green | #4caf50 |

## Performance Tips

### Optimize for Performance
```javascript
// For large HTML (100+ elements), limit depth
const result = await renderPreviewCode(
  html.substring(0, 5000),  // First 5000 chars
  css,
  js
);

// Check compile time
if (result.time > 100) {
  console.warn('Preview took longer than expected');
  // Consider simplifying HTML
}
```

### Memory Management
```javascript
// Clear previous preview before rendering new one
window.previewRenderer.clear();
await renderPreviewCode(newHtml);

// For multiple previews, unload between renders
await window.previewRenderer.unload();
```

### Batch Rendering
```javascript
// Preview multiple snippets
const snippets = [
  '<button>A</button>',
  '<button>B</button>',
  '<button>C</button>'
];

for (const snippet of snippets) {
  window.previewRenderer.clear();
  await renderPreviewCode(snippet);
  
  const stats = window.previewRenderer.getStats();
  console.log(`Snippet rendered: ${stats.objects} objects`);
  
  await new Promise(r => setTimeout(r, 500)); // Delay between renders
}
```

## Troubleshooting

### Preview doesn't show
```javascript
// Check if renderer is initialized
if (!window.previewRenderer || !window.previewRenderer.initialized) {
  console.error('Renderer not initialized');
  initPreviewRenderer(scene, camera, renderer);
}
```

### Invalid HTML returns error
```javascript
// Wrap in try-catch
try {
  const result = await renderPreviewCode(userInput);
} catch (err) {
  console.error('Invalid HTML:', err.message);
  // Show user-friendly error
}
```

### Too many objects causing slowdown
```javascript
// Check object count
const stats = window.previewRenderer.getStats();
if (stats.objects > 50) {
  console.warn('Too many objects, performance may degrade');
}
```

## API Reference

### Main Functions

```javascript
// Initialize
initPreviewRenderer(scene, camera, renderer)

// Render code
renderPreviewCode(html, css = '', js = '')
// Returns: { success, response, time, objects, error }

// Get current stats
window.previewRenderer.getStats()
// Returns: { compileTime, objects, errors, warnings }

// Export full statistics
window.previewRenderer.exportStats()
// Returns: { ...all stats + codeLines breakdown }

// Clear preview
window.previewRenderer.clear()

// Unload to free memory
await window.previewRenderer.unload()
```

## Next Session

When continuing, consider:
1. **Interactive elements** - Click 3D objects to see HTML source
2. **Code execution** - Run HTML/JS in iframe alongside preview
3. **Animation** - Animate element creation for visual effect
4. **Performance** - Profile and optimize for large codebases
5. **Export** - Save preview as image or video

---

This preview renderer transforms the 3D canvas into a **real code visualization tool** rather than just a demo cube.
