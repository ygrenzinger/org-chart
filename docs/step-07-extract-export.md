# Step 7: Extract Export Functionality

## Objective
Extract image and SVG export functionality from the monolithic OrgChart class into dedicated export modules.

## Files to Create

### `src/export/ImageExporter.js`
```javascript
import { ExportUtils } from '../utils/ExportUtils.js';

export class ImageExporter {
  constructor(state) {
    this.state = state;
  }

  exportImg({ full = false, scale = 3, onLoad = d => d, save = true, backgroundColor = "#FAFAFA" } = {}) {
    const attrs = this.state.getState();
    const { svg: svgImg, root } = attrs;
    const that = this;

    // Handle images in SVG
    const selection = svgImg.selectAll('img');
    let total = selection.size();
    let loaded = 0;

    const exportImage = () => {
      const transform = JSON.parse(JSON.stringify(that.state.getState().lastTransform));
      const duration = that.state.getState().duration;
      
      // Temporarily set duration to 0 for export
      that.state.updateState({ duration: 0 });

      if (full) {
        that.fit();
      }

      setTimeout(() => {
        const { svg } = that.state.getState();
        
        that.downloadImage({
          node: svg.node(), 
          scale,
          imageName: attrs.imageName,
          backgroundColor,
          save,
          onLoad,
          onAlreadySerialized: d => {
            // Restore original state
            that.state.updateState({ 
              duration,
              lastTransform: transform 
            });
            that.update(root);
          }
        });
      }, 100);
    };

    if (total === 0) {
      exportImage();
    } else {
      selection.each(function () {
        ExportUtils.toDataURL(this.src, (dataUrl) => {
          this.src = dataUrl;
          loaded++;
          if (loaded === total) {
            exportImage();
          }
        });
      });
    }
  }

  exportSvg() {
    const attrs = this.state.getState();
    this.downloadImage({ 
      imageName: attrs.imageName, 
      node: attrs.svg.node(), 
      scale: 3, 
      isSvg: true 
    });
  }

  downloadImage({ 
    node, 
    scale = 2, 
    imageName = 'graph', 
    isSvg = false, 
    save = true, 
    backgroundColor = "#FAFAFA", 
    onAlreadySerialized = d => { }, 
    onLoad = d => { } 
  }) {
    const svgNode = node;

    if (isSvg) {
      // SVG Export
      let source = ExportUtils.serializeString(svgNode);
      
      // Add xml declaration
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
      
      // Convert svg source to URI data scheme
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
      ExportUtils.saveAs(url, imageName + ".svg");
      onAlreadySerialized();
      return;
    }

    // PNG Export
    const quality = scale;
    const image = document.createElement('img');

    image.onload = function () {
      const canvas = document.createElement('canvas');
      const rect = svgNode.getBoundingClientRect();
      
      canvas.width = rect.width * quality;
      canvas.height = rect.height * quality;

      const context = canvas.getContext('2d');
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, rect.width * quality, rect.height * quality);
      context.drawImage(image, 0, 0, rect.width * quality, rect.height * quality);

      let dt = canvas.toDataURL('image/png');
      onLoad(dt);

      if (save) {
        ExportUtils.saveAs(dt, imageName + '.png');
      }
      
      onAlreadySerialized();
    };

    const url = 'data:image/svg+xml; charset=utf8, ' + 
                encodeURIComponent(ExportUtils.serializeString(svgNode));
    image.src = url;
  }
}
```

### `src/export/ExportManager.js`
```javascript
import { ImageExporter } from './ImageExporter.js';

export class ExportManager {
  constructor(state) {
    this.state = state;
    this.imageExporter = new ImageExporter(state);
  }

  // PNG Export with options
  exportPNG(options = {}) {
    const defaultOptions = {
      full: false,
      scale: 3,
      save: true,
      backgroundColor: "#FAFAFA",
      onLoad: d => d
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    return this.imageExporter.exportImg(finalOptions);
  }

  // SVG Export
  exportSVG() {
    return this.imageExporter.exportSvg();
  }

  // Export current view as PNG
  exportCurrentView(options = {}) {
    return this.exportPNG({ ...options, full: false });
  }

  // Export full chart as PNG
  exportFullChart(options = {}) {
    return this.exportPNG({ ...options, full: true });
  }

  // Export with custom scale
  exportHighRes(scale = 5, options = {}) {
    return this.exportPNG({ ...options, scale });
  }

  // Export data as JSON
  exportData() {
    const attrs = this.state.getState();
    const data = JSON.stringify(attrs.data, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${attrs.imageName || 'chart'}-data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Export chart state/configuration
  exportConfig() {
    const attrs = this.state.getState();
    
    // Extract only serializable configuration
    const config = {
      layout: attrs.layout,
      compact: attrs.compact,
      nodeWidth: typeof attrs.nodeWidth === 'function' ? 'function' : attrs.nodeWidth,
      nodeHeight: typeof attrs.nodeHeight === 'function' ? 'function' : attrs.nodeHeight,
      // Add other relevant config properties
    };
    
    const configData = JSON.stringify(config, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${attrs.imageName || 'chart'}-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Get data URL without saving
  getImageDataURL(options = {}) {
    const defaultOptions = {
      scale: 3,
      backgroundColor: "#FAFAFA",
      save: false
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    return new Promise((resolve) => {
      this.imageExporter.exportImg({
        ...finalOptions,
        onLoad: (dataURL) => resolve(dataURL)
      });
    });
  }

  // Get SVG string
  getSVGString() {
    const attrs = this.state.getState();
    return ExportUtils.serializeString(attrs.svg.node());
  }
}
```

### `src/export/PrintManager.js`
```javascript
export class PrintManager {
  constructor(state, exportManager) {
    this.state = state;
    this.exportManager = exportManager;
  }

  // Print current chart
  print(options = {}) {
    const defaultOptions = {
      scale: 2,
      backgroundColor: "#FFFFFF",
      title: "Organization Chart"
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    this.exportManager.getImageDataURL(finalOptions)
      .then(dataURL => {
        this.printImage(dataURL, finalOptions.title);
      });
  }

  // Print full chart (fit to page)
  printFull(options = {}) {
    return this.print({ ...options, full: true });
  }

  // Internal method to handle image printing
  printImage(dataURL, title = "Chart") {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            @media print {
              body { padding: 0; }
              img { 
                width: 100vw; 
                height: 100vh; 
                object-fit: contain; 
              }
            }
          </style>
        </head>
        <body>
          <img src="${dataURL}" alt="${title}" />
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for image to load before printing
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }

  // Print with custom CSS
  printWithStyles(customCSS = '', options = {}) {
    const defaultOptions = {
      scale: 2,
      backgroundColor: "#FFFFFF",
      title: "Organization Chart"
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    this.exportManager.getImageDataURL(finalOptions)
      .then(dataURL => {
        this.printImageWithStyles(dataURL, customCSS, finalOptions.title);
      });
  }

  printImageWithStyles(dataURL, customCSS, title) {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            ${customCSS}
          </style>
        </head>
        <body>
          <img src="${dataURL}" alt="${title}" />
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }
}
```

## Current Code to Extract

From the main OrgChart class, extract these export-related methods:
- Lines 995-1018: `exportImg` method
- Lines 1019-1022: `exportSvg` method
- Lines 1033-1098: `downloadImage` method
- Lines 982-994: `toDataURL` method (moved to ExportUtils in Step 2)
- Lines 1036-1046: `saveAs` function (moved to ExportUtils in Step 2)
- Lines 1047-1062: `serializeString` method (moved to ExportUtils in Step 2)

## Implementation Steps

1. **Create ImageExporter Module**
   - Create `src/export/ImageExporter.js`
   - Move core image export functionality
   - Include PNG and SVG export methods

2. **Create ExportManager Module**
   - Create `src/export/ExportManager.js`
   - Provide high-level export interface
   - Include data and configuration export

3. **Create PrintManager Module**
   - Create `src/export/PrintManager.js`
   - Add printing functionality
   - Include custom styling options

4. **Update Main Class**
   - Import export modules in OrgChart class
   - Replace direct export calls with manager methods
   - Remove extracted export methods

5. **Update Tests**
   - Create unit tests for export modules
   - Test different export formats and options
   - Ensure exported files are valid

## Validation Criteria

- [ ] PNG export produces correct images
- [ ] SVG export generates valid SVG files
- [ ] Data export creates proper JSON files
- [ ] Print functionality works across browsers
- [ ] Export options (scale, background) work correctly
- [ ] Tests pass without modification

## Files Modified
- `src/d3-org-chart.js` (remove export methods, add imports)
- New: `src/export/ImageExporter.js`
- New: `src/export/ExportManager.js`
- New: `src/export/PrintManager.js`

## Next Step
After completion, proceed to Step 8: Refactor Main OrgChart Class