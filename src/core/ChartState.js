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
    Object.keys(this.attrs).forEach((key) => {
      this[key] = (value) => {
        if (!arguments.length) return this.attrs[key];
        this.attrs[key] = value;
        return this;
      };
    });
  }

  getState() {
    return this.attrs;
  }

  updateState(updates) {
    Object.assign(this.attrs, updates);
    return this;
  }
}