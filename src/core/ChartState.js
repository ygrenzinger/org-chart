import { DEFAULT_CONFIG } from '../utils/Constants.js';

export class ChartState {
  constructor(initialConfig = {}) {
    this.attrs = { ...DEFAULT_CONFIG, ...initialConfig };
    // Generate unique ID for each instance
    if (!this.attrs.id) {
      this.attrs.id = `ID${Math.floor(Math.random() * 1000000)}`;
    }
    this.setupGettersSetters();
  }

  setupGettersSetters() {
    // Preserve original diagonal functions before setting up getters/setters
    const originalDiagonal = this.attrs.diagonal;
    const originalHdiagonal = this.attrs.hdiagonal;
    
    Object.keys(this.attrs).forEach((key) => {
      // Skip diagonal functions - they should remain as functions, not getters/setters
      if (key === 'diagonal' || key === 'hdiagonal') {
        return;
      }
      
      this[key] = (value) => {
        if (!arguments.length) return this.attrs[key];
        this.attrs[key] = value;
        return this;
      };
    });
    
    // Restore original diagonal functions
    this.attrs.diagonal = originalDiagonal;
    this.attrs.hdiagonal = originalHdiagonal;
  }

  getState() {
    return this.attrs;
  }

  updateState(updates) {
    Object.assign(this.attrs, updates);
    return this;
  }
}