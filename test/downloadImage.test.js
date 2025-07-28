import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('downloadImage() method', () => {
  let chart, container, mockSvgNode;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    chart = new OrgChart()
      .container('#test-container')
      .data(mockHierarchicalData)
      .imageName('TestChart');
    
    chart.render();
    
    // Create mock SVG node with required methods
    mockSvgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockSvgNode.setAttribute('width', '800');
    mockSvgNode.setAttribute('height', '600');
    mockSvgNode.innerHTML = '<g><rect width="100" height="50" fill="blue"/></g>';
    
    // Mock getBoundingClientRect
    mockSvgNode.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600
    }));
    
    // Mock cloneNode
    mockSvgNode.cloneNode = vi.fn(() => {
      const clone = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      clone.setAttributeNS = vi.fn();
      // Mock attributes as a getter that returns an empty array
      Object.defineProperty(clone, 'attributes', {
        value: [],
        writable: false,
        enumerable: true,
        configurable: true
      });
      return clone;
    });
  });

  afterEach(() => {
    if (chart && typeof chart.clear === 'function') {
      chart.clear();
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  test('should be defined as a method', () => {
    expect(typeof chart.downloadImage).toBe('function');
  });

  test('should handle SVG export correctly', () => {
    const mockLink = {
      download: '',
      href: '',
      click: vi.fn(),
      style: { display: '' }
    };
    
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockImplementation((tagName) => {
      if (tagName === 'a') return mockLink;
      return createElementSpy.getMockImplementation()(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    
    const onAlreadySerializedSpy = vi.fn();
    
    chart.downloadImage({ 
      node: mockSvgNode, 
      isSvg: true, 
      imageName: 'test-svg',
      onAlreadySerialized: onAlreadySerializedSpy
    });
    
    expect(mockLink.download).toBe('test-svg.svg');
    expect(mockLink.href).toContain('data:image/svg+xml;charset=utf-8,');
    expect(mockLink.click).toHaveBeenCalled();
    expect(onAlreadySerializedSpy).toHaveBeenCalled();
  });

  test('should handle PNG export with default parameters', () => {
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn()
      })),
      toDataURL: vi.fn(() => 'data:image/png;base64,mockdata')
    };
    
    const mockImage = {
      onload: null,
      src: ''
    };
    
    const mockLink = {
      download: '',
      href: '',
      click: vi.fn(),
      style: { display: '' }
    };
    
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockImplementation((tagName) => {
      if (tagName === 'canvas') return mockCanvas;
      if (tagName === 'img') return mockImage;
      if (tagName === 'a') return mockLink;
      return createElementSpy.getMockImplementation()(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    
    chart.downloadImage({ node: mockSvgNode });
    
    // Trigger image onload
    if (mockImage.onload) {
      mockImage.onload();
    }
    
    expect(createElementSpy).toHaveBeenCalledWith('img');
    expect(createElementSpy).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(mockLink.click).toHaveBeenCalled();
  });

  test('should use custom scale parameter', () => {
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn()
      })),
      toDataURL: vi.fn(() => 'data:image/png;base64,mockdata')
    };
    
    const mockImage = {
      onload: null,
      src: ''
    };
    
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockImplementation((tagName) => {
      if (tagName === 'canvas') return mockCanvas;
      if (tagName === 'img') return mockImage;
      if (tagName === 'a') return {
        download: '',
        href: '',
        click: vi.fn(),
        style: { display: '' }
      };
      return createElementSpy.getMockImplementation()(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    
    chart.downloadImage({ node: mockSvgNode, scale: 4 });
    
    // Trigger image onload
    if (mockImage.onload) {
      mockImage.onload();
    }
    
    expect(mockCanvas.width).toBe(800 * 4);
    expect(mockCanvas.height).toBe(600 * 4);
  });

  test('should use custom backgroundColor parameter', () => {
    const mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn()
    };
    
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => 'data:image/png;base64,mockdata')
    };
    
    const mockImage = {
      onload: null,
      src: ''
    };
    
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockImplementation((tagName) => {
      if (tagName === 'canvas') return mockCanvas;
      if (tagName === 'img') return mockImage;
      if (tagName === 'a') return {
        download: '',
        href: '',
        click: vi.fn(),
        style: { display: '' }
      };
      return createElementSpy.getMockImplementation()(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    
    chart.downloadImage({ 
      node: mockSvgNode, 
      backgroundColor: '#FF0000' 
    });
    
    // Trigger image onload
    if (mockImage.onload) {
      mockImage.onload();
    }
    
    expect(mockContext.fillStyle).toBe('#FF0000');
  });

  test('should call onLoad callback when provided', () => {
    const onLoadSpy = vi.fn();
    
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn()
      })),
      toDataURL: vi.fn(() => 'data:image/png;base64,mockdata')
    };
    
    const mockImage = {
      onload: null,
      src: ''
    };
    
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockImplementation((tagName) => {
      if (tagName === 'canvas') return mockCanvas;
      if (tagName === 'img') return mockImage;
      if (tagName === 'a') return {
        download: '',
        href: '',
        click: vi.fn(),
        style: { display: '' }
      };
      return createElementSpy.getMockImplementation()(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    
    chart.downloadImage({ 
      node: mockSvgNode, 
      onLoad: onLoadSpy 
    });
    
    // Trigger image onload
    if (mockImage.onload) {
      mockImage.onload();
    }
    
    expect(onLoadSpy).toHaveBeenCalledWith('data:image/png;base64,mockdata');
  });

  test('should call onAlreadySerialized callback', () => {
    const onAlreadySerializedSpy = vi.fn();
    
    const mockImage = {
      onload: null,
      src: ''
    };
    
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockImplementation((tagName) => {
      if (tagName === 'img') return mockImage;
      if (tagName === 'canvas') return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          fillStyle: '',
          fillRect: vi.fn(),
          drawImage: vi.fn()
        })),
        toDataURL: vi.fn(() => 'data:image/png;base64,mockdata')
      };
      if (tagName === 'a') return {
        download: '',
        href: '',
        click: vi.fn(),
        style: { display: '' }
      };
      return createElementSpy.getMockImplementation()(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    
    chart.downloadImage({ 
      node: mockSvgNode, 
      onAlreadySerialized: onAlreadySerializedSpy 
    });
    
    expect(onAlreadySerializedSpy).toHaveBeenCalled();
  });

  test('should not save when save parameter is false', () => {
    const mockLink = {
      download: '',
      href: '',
      click: vi.fn(),
      style: { display: '' }
    };
    
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn()
      })),
      toDataURL: vi.fn(() => 'data:image/png;base64,mockdata')
    };
    
    const mockImage = {
      onload: null,
      src: ''
    };
    
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockImplementation((tagName) => {
      if (tagName === 'canvas') return mockCanvas;
      if (tagName === 'img') return mockImage;
      if (tagName === 'a') return mockLink;
      return createElementSpy.getMockImplementation()(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    
    chart.downloadImage({ 
      node: mockSvgNode, 
      save: false 
    });
    
    // Trigger image onload
    if (mockImage.onload) {
      mockImage.onload();
    }
    
    expect(mockLink.click).not.toHaveBeenCalled();
  });

  test('should serialize SVG with proper namespaces', () => {
    const mockClonedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockClonedSvg.setAttributeNS = vi.fn();
    
    mockSvgNode.cloneNode = vi.fn(() => mockClonedSvg);
    
    // Mock XMLSerializer
    const mockSerializer = {
      serializeToString: vi.fn(() => '<svg></svg>')
    };
    
    const originalXMLSerializer = window.XMLSerializer;
    window.XMLSerializer = vi.fn(() => mockSerializer);
    
    // Mock createTreeWalker to avoid the Node type issue
    const originalCreateTreeWalker = document.createTreeWalker;
    document.createTreeWalker = vi.fn(() => ({
      nextNode: vi.fn(() => null),
      currentNode: null
    }));
    
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockImplementation((tagName) => {
      if (tagName === 'a') return {
        download: '',
        href: '',
        click: vi.fn(),
        style: { display: '' }
      };
      return createElementSpy.getMockImplementation()(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    
    chart.downloadImage({ 
      node: mockSvgNode, 
      isSvg: true 
    });
    
    expect(mockClonedSvg.setAttributeNS).toHaveBeenCalledWith(
      'http://www.w3.org/2000/xmlns/', 
      'xmlns', 
      'http://www.w3.org/2000/svg'
    );
    expect(mockClonedSvg.setAttributeNS).toHaveBeenCalledWith(
      'http://www.w3.org/2000/xmlns/', 
      'xmlns:xlink', 
      'http://www.w3.org/1999/xlink'
    );
    expect(mockSerializer.serializeToString).toHaveBeenCalledWith(mockClonedSvg);
    
    // Restore original methods
    window.XMLSerializer = originalXMLSerializer;
    document.createTreeWalker = originalCreateTreeWalker;
  });

  test('should handle TreeWalker for attribute processing', () => {
    const mockAttribute = {
      value: window.location.href + '#test-fragment'
    };
    
    const mockNode = {
      attributes: [mockAttribute]
    };
    
    const mockTreeWalker = {
      nextNode: vi.fn()
        .mockReturnValueOnce(mockNode)
        .mockReturnValueOnce(null),
      currentNode: mockNode
    };
    
    const originalCreateTreeWalker = document.createTreeWalker;
    document.createTreeWalker = vi.fn(() => mockTreeWalker);
    
    const mockClonedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockClonedSvg.setAttributeNS = vi.fn();
    
    mockSvgNode.cloneNode = vi.fn(() => mockClonedSvg);
    
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockImplementation((tagName) => {
      if (tagName === 'a') return {
        download: '',
        href: '',
        click: vi.fn(),
        style: { display: '' }
      };
      return createElementSpy.getMockImplementation()(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    
    chart.downloadImage({ 
      node: mockSvgNode, 
      isSvg: true 
    });
    
    expect(document.createTreeWalker).toHaveBeenCalledWith(
      mockClonedSvg, 
      NodeFilter.SHOW_ELEMENT, 
      null, 
      false
    );
    expect(mockAttribute.value).toBe('#test-fragment');
    
    // Restore original method
    document.createTreeWalker = originalCreateTreeWalker;
  });
});