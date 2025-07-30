/**
 * Test helpers for verifying chart centering behavior
 */

/**
 * Calculates the expected center position for a chart
 * @param {number} svgWidth - Width of the SVG container
 * @param {number} svgHeight - Height of the SVG container
 * @param {Object} contentBounds - Bounds of the chart content
 * @returns {Object} Expected center coordinates
 */
export function calculateExpectedCenter(svgWidth, svgHeight, contentBounds) {
  const { minX, maxX, minY, maxY } = contentBounds;
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  
  return {
    x: (svgWidth - contentWidth) / 2,
    y: (svgHeight - contentHeight) / 2,
    centerX: svgWidth / 2,
    centerY: svgHeight / 2
  };
}

/**
 * Extracts transform values from a D3 transform string
 * @param {string} transformString - D3 transform string like "translate(x,y) scale(k)"
 * @returns {Object} Parsed transform values
 */
export function parseTransform(transformString) {
  if (!transformString || transformString === 'none') {
    return { x: 0, y: 0, k: 1 };
  }
  
  const translateMatch = transformString.match(/translate\(([^,]+),([^)]+)\)/);
  const scaleMatch = transformString.match(/scale\(([^)]+)\)/);
  
  return {
    x: translateMatch ? parseFloat(translateMatch[1]) : 0,
    y: translateMatch ? parseFloat(translateMatch[2]) : 0,
    k: scaleMatch ? parseFloat(scaleMatch[1]) : 1
  };
}

/**
 * Verifies if a chart is properly centered within its container
 * @param {Element} chartElement - The chart's main group element
 * @param {number} svgWidth - Width of the SVG container
 * @param {number} svgHeight - Height of the SVG container
 * @param {number} tolerance - Acceptable deviation from perfect centering
 * @returns {boolean} True if chart is centered within tolerance
 */
export function isChartCentered(chartElement, svgWidth, svgHeight, tolerance = 50) {
  if (!chartElement) return false;
  
  const transform = chartElement.getAttribute('transform');
  const { x, y } = parseTransform(transform);
  
  const expectedCenterX = svgWidth / 2;
  const expectedCenterY = svgHeight / 2;
  
  const deltaX = Math.abs(x - expectedCenterX);
  const deltaY = Math.abs(y - expectedCenterY);
  
  return deltaX <= tolerance && deltaY <= tolerance;
}

/**
 * Creates a mock ZoomManager for testing
 * @returns {Object} Mock ZoomManager with spied methods
 */
export function createMockZoomManager() {
  return {
    fit: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    zoomTreeBounds: vi.fn(),
    initialZoom: vi.fn(),
    zoomed: vi.fn(),
    initializeZoom: vi.fn()
  };
}

/**
 * Waits for any pending transitions to complete
 * @param {number} duration - Maximum time to wait in milliseconds
 * @returns {Promise} Promise that resolves when transitions are complete
 */
export function waitForTransitions(duration = 500) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}