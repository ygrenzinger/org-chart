import { ExportUtils } from '../utils/ExportUtils.js';

export class ImageExporter {
  constructor(chartInstance) {
    this.chart = chartInstance;
  }

  exportImg({ full = false, scale = 3, onLoad = d => d, save = true, backgroundColor = "#FAFAFA" } = {}) {
    const that = this;
    const attrs = this.chart.getChartState();
    const { svg: svgImg, root } = attrs;
    let count = 0;
    const selection = svgImg.selectAll('img');
    let total = selection.size();

    const exportImage = () => {
      const transform = JSON.parse(JSON.stringify(that.chart.lastTransform()));
      const duration = that.chart.duration();
      
      if (full) {
        that.chart.fit();
      }
      
      const { svg } = that.chart.getChartState();

      setTimeout(() => {
        that.downloadImage({
          node: svg.node(), 
          scale,
          isSvg: false,
          backgroundColor,
          onAlreadySerialized: () => {
            that.chart.update(root);
          },
          imageName: attrs.imageName,
          onLoad: onLoad,
          save
        });
      }, full ? duration + 10 : 0);
    };

    if (total > 0) {
      selection.each(function () {
        ExportUtils.toDataURL(this.src, (dataUrl) => {
          this.src = dataUrl;
          if (++count === total) {
            exportImage();
          }
        });
      });
    } else {
      exportImage();
    }
  }

  exportSvg() {
    const { svg, imageName } = this.chart.getChartState();
    this.downloadImage({ 
      imageName: imageName, 
      node: svg.node(), 
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
    onAlreadySerialized = () => {}, 
    onLoad = () => {} 
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
      if (onLoad) {
        onLoad(dt);
      }

      if (save) {
        ExportUtils.saveAs(dt, imageName + '.png');
      }
    };

    const url = 'data:image/svg+xml; charset=utf8, ' + 
                encodeURIComponent(ExportUtils.serializeString(svgNode));
    
    onAlreadySerialized();
    image.src = url;
  }
}