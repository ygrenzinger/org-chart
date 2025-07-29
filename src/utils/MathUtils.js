import * as d3 from 'd3';

export class MathUtils {
  static getTextWidth(text, { ctx, fontSize = 10, defaultFont = "Arial" }) {
    ctx.font = `${fontSize}px ${defaultFont}`;
    const measurement = ctx.measureText(text);
    return measurement.width;
  }

  static groupBy(array, accessor, aggregator) {
    const grouped = {};
    
    array.forEach(item => {
      const key = accessor(item);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    Object.keys(grouped).forEach(key => {
      grouped[key] = aggregator(grouped[key]);
    });

    return Object.entries(grouped);
  }

  static calculateBounds(nodes, layoutBindings, layout) {
    const minX = d3.min(nodes, d => d.x + layoutBindings[layout].nodeLeftX(d));
    const maxX = d3.max(nodes, d => d.x + layoutBindings[layout].nodeRightX(d));
    const minY = d3.min(nodes, d => d.y + layoutBindings[layout].nodeTopY(d));
    const maxY = d3.max(nodes, d => d.y + layoutBindings[layout].nodeBottomY(d));
    
    return { minX, maxX, minY, maxY };
  }
}