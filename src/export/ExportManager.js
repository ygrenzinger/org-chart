import { ImageExporter } from './ImageExporter.js';
import { ExportUtils } from '../utils/ExportUtils.js';

export class ExportManager {
  constructor(chartInstance) {
    this.chart = chartInstance;
    this.imageExporter = new ImageExporter(chartInstance);
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
    const attrs = this.chart.getChartState();
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
    const attrs = this.chart.getChartState();
    
    // Extract only serializable configuration
    const config = {
      layout: attrs.layout,
      compact: attrs.compact,
      nodeWidth: typeof attrs.nodeWidth === 'function' ? 'function' : attrs.nodeWidth,
      nodeHeight: typeof attrs.nodeHeight === 'function' ? 'function' : attrs.nodeHeight,
      imageName: attrs.imageName,
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
    const attrs = this.chart.getChartState();
    return ExportUtils.serializeString(attrs.svg.node());
  }
}