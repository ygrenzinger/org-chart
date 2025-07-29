import { DEFAULT_CONFIG, LAYOUT_BINDINGS_TEMPLATE } from '../utils/Constants.js';

export class ChartState {
  constructor(initialConfig = {}) {
    this.attrs = { ...DEFAULT_CONFIG, ...initialConfig };
    // Generate unique ID for each instance
    if (!this.attrs.id) {
      this.attrs.id = `ID${Math.floor(Math.random() * 1000000)}`;
    }
    this.setupLayoutBindings();
    this.setupGettersSetters();
  }

  setupLayoutBindings() {
    // Create layout bindings with proper context binding for diagonal functions
    this.attrs.layoutBindings = {};
    
    Object.keys(LAYOUT_BINDINGS_TEMPLATE).forEach(layout => {
      this.attrs.layoutBindings[layout] = { ...LAYOUT_BINDINGS_TEMPLATE[layout] };
      
      // Bind diagonal functions to the chart instance context
      if (layout === 'left' || layout === 'right') {
        this.attrs.layoutBindings[layout].diagonal = this.attrs.hdiagonal.bind(this);
      } else {
        this.attrs.layoutBindings[layout].diagonal = this.attrs.diagonal.bind(this);
      }
    });
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