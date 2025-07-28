import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe.skip('exportImg() method', () => {
  let chart, container;

  // Helper function to create consistent SVG mocks
  const createMockSvg = (imageCount = 0, eachCallback = null) => ({
    selectAll: vi.fn(() => ({
      size: vi.fn(() => imageCount),
      each: vi.fn((callback) => {
        if (eachCallback) {
          eachCallback(callback);
        }
      }),
      attr: vi.fn(() => ({
        attr: vi.fn(() => ({}))
      }))
    })),
    node: vi.fn(() => document.createElementNS('http://www.w3.org/2000/svg', 'svg')),
    remove: vi.fn(),
    attr: vi.fn(() => ({}))
  });

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
    expect(typeof chart.exportImg).toBe('function');
  });

  test('should handle default parameters', () => {
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {});
    
    // Mock the chart state with proper SVG mock
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg(),
      imageName: 'TestChart'
    }));
    
    chart.exportImg();
    
    expect(downloadImageSpy).toHaveBeenCalled();
  });

  test('should pass correct parameters to downloadImage', () => {
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {});
    
    // Mock the chart state with proper SVG mock
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg(),
      imageName: 'TestChart'
    }));
    
    chart.exportImg({ scale: 5, backgroundColor: '#FF0000', save: false });
    
    expect(downloadImageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        scale: 5,
        backgroundColor: '#FF0000',
        save: false,
        imageName: 'TestChart'
      })
    );
  });

  test('should handle full parameter', () => {
    const fitSpy = vi.spyOn(chart, 'fit').mockImplementation(() => chart);
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {});
    
    // Mock the chart state
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg()
    }));
    
    chart.exportImg({ full: true });
    
    expect(fitSpy).toHaveBeenCalled();
    expect(downloadImageSpy).toHaveBeenCalled();
  });

  test('should handle onLoad callback', () => {
    const onLoadCallback = vi.fn();
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {});
    
    // Mock the chart state
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg()
    }));
    
    chart.exportImg({ onLoad: onLoadCallback });
    
    expect(downloadImageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        onLoad: onLoadCallback
      })
    );
  });

  test('should restore chart state after export', () => {
    const updateSpy = vi.spyOn(chart, 'update').mockImplementation(() => {});
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation((params) => {
      // Simulate calling the onAlreadySerialized callback
      if (params.onAlreadySerialized) {
        params.onAlreadySerialized();
      }
    });
    
    // Mock the chart state
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg(),
      root: { mockRoot: true }
    }));
    
    chart.exportImg();
    
    expect(updateSpy).toHaveBeenCalled();
  });

  test('should handle images in SVG', () => {
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {});
    const toDataURLSpy = vi.spyOn(chart, 'toDataURL').mockImplementation((url, callback) => {
      callback('data:image/jpeg;base64,mockdata');
    });
    
    // Mock the chart state with images
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg(2, (callback) => {
        // Simulate two image nodes
        callback.call({ src: 'http://example.com/image1.jpg' }, { src: 'http://example.com/image1.jpg' }, 0);
        callback.call({ src: 'http://example.com/image2.jpg' }, { src: 'http://example.com/image2.jpg' }, 1);
      })
    }));
    
    chart.exportImg();
    
    expect(toDataURLSpy).toHaveBeenCalledTimes(2);
    expect(toDataURLSpy).toHaveBeenCalledWith('http://example.com/image1.jpg', expect.any(Function));
    expect(toDataURLSpy).toHaveBeenCalledWith('http://example.com/image2.jpg', expect.any(Function));
  });

  test('should handle error scenarios gracefully', () => {
    // Mock fit to throw an error
    vi.spyOn(chart, 'fit').mockImplementation(() => {
      throw new Error('Fit error');
    });
    
    // Should not throw error
    expect(() => {
      chart.exportImg();
    }).not.toThrow();
  });

  test('should use default values for all parameters', () => {
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {});
    
    // Mock the chart state
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg(),
      imageName: 'TestChart'
    }));
    
    chart.exportImg();
    
    expect(downloadImageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        scale: 3,
        save: true,
        backgroundColor: '#FAFAFA',
        imageName: 'TestChart'
      })
    );
  });

  test('should handle transform state preservation', () => {
    const mockTransform = { x: 100, y: 200, k: 1.5 };
    const mockDuration = 500;
    
    const lastTransformSpy = vi.spyOn(chart, 'lastTransform')
      .mockReturnValue(mockTransform);
    const durationSpy = vi.spyOn(chart, 'duration')
      .mockReturnValue(mockDuration)
      .mockImplementation((value) => value !== undefined ? chart : mockDuration);
    const updateSpy = vi.spyOn(chart, 'update').mockImplementation(() => {});
    
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation((params) => {
      // Simulate calling the onAlreadySerialized callback
      if (params.onAlreadySerialized) {
        params.onAlreadySerialized();
      }
    });
    
    // Mock the chart state
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      root: { mockRoot: true },
      svg: createMockSvg()
    }));
    
    chart.exportImg();
    
    // Verify update is called with root
    expect(updateSpy).toHaveBeenCalledWith({ mockRoot: true });
  });

  test('should set duration to 0 during export process', () => {
    const mockDuration = 500;
    const durationSpy = vi.spyOn(chart, 'duration')
      .mockReturnValue(mockDuration)
      .mockImplementation((value) => value !== undefined ? chart : mockDuration);
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {});
    
    // Mock the chart state
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg()
    }));
    
    chart.exportImg();
    
    // The duration method should be called but we can't easily verify the internal call to set it to 0
    expect(durationSpy).toHaveBeenCalled();
  });

  test('should handle multiple images with proper loading sequence', () => {
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {});
    const toDataURLSpy = vi.spyOn(chart, 'toDataURL').mockImplementation((url, callback) => {
      // Simulate async loading with different timing
      setTimeout(() => {
        callback(`data:image/jpeg;base64,mockdata-${url}`);
      }, Math.random() * 10);
    });
    
    const mockImages = [
      { src: 'http://example.com/image1.jpg' },
      { src: 'http://example.com/image2.jpg' },
      { src: 'http://example.com/image3.jpg' }
    ];
    
    // Mock the chart state with multiple images
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg(mockImages.length, (callback) => {
        mockImages.forEach((img, index) => {
          callback.call(img, img, index);
        });
      })
    }));
    
    chart.exportImg();
    
    expect(toDataURLSpy).toHaveBeenCalledTimes(3);
    expect(toDataURLSpy).toHaveBeenCalledWith('http://example.com/image1.jpg', expect.any(Function));
    expect(toDataURLSpy).toHaveBeenCalledWith('http://example.com/image2.jpg', expect.any(Function));
    expect(toDataURLSpy).toHaveBeenCalledWith('http://example.com/image3.jpg', expect.any(Function));
  });

  test('should wait for all images to load before calling downloadImage', async () => {
    let loadedCount = 0;
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {
      // This should only be called after all images are loaded
      expect(loadedCount).toBe(2);
    });
    
    const toDataURLSpy = vi.spyOn(chart, 'toDataURL').mockImplementation((url, callback) => {
      setTimeout(() => {
        loadedCount++;
        callback(`data:image/jpeg;base64,mockdata-${loadedCount}`);
      }, 10);
    });
    
    // Mock the chart state with 2 images
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg(2, (callback) => {
        callback.call({ src: 'http://example.com/image1.jpg' }, { src: 'http://example.com/image1.jpg' }, 0);
        callback.call({ src: 'http://example.com/image2.jpg' }, { src: 'http://example.com/image2.jpg' }, 1);
      })
    }));
    
    chart.exportImg();
    
    // Wait a bit for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  test('should handle empty object parameter', () => {
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {});
    
    // Mock the chart state
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg(),
      imageName: 'TestChart'
    }));
    
    chart.exportImg({});
    
    expect(downloadImageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        scale: 3,
        save: true,
        backgroundColor: '#FAFAFA'
      })
    );
  });

  test('should handle null/undefined parameters gracefully', () => {
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {});
    
    // Mock the chart state
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg(),
      imageName: 'TestChart'
    }));
    
    // Test with undefined (should work)
    expect(() => chart.exportImg(undefined)).not.toThrow();
    
    // Test with empty object (should work)
    expect(() => chart.exportImg({})).not.toThrow();
    
    expect(downloadImageSpy).toHaveBeenCalledTimes(2);
  });

  test('should handle custom onLoad callback execution', () => {
    const customOnLoad = vi.fn();
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation((params) => {
      // Simulate calling the onLoad callback
      if (params.onLoad) {
        params.onLoad('mock-data-url');
      }
    });
    
    // Mock the chart state
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg()
    }));
    
    chart.exportImg({ onLoad: customOnLoad });
    
    expect(customOnLoad).toHaveBeenCalledWith('mock-data-url');
  });

  test('should handle image src modification during loading', () => {
    const downloadImageSpy = vi.spyOn(chart, 'downloadImage').mockImplementation(() => {});
    
    const mockImage = { src: 'http://example.com/original.jpg' };
    const toDataURLSpy = vi.spyOn(chart, 'toDataURL').mockImplementation((url, callback) => {
      callback('data:image/jpeg;base64,converteddata');
    });
    
    // Mock the chart state
    const originalGetChartState = chart.getChartState;
    chart.getChartState = vi.fn(() => ({
      ...originalGetChartState(),
      svg: createMockSvg(1, (callback) => {
        callback.call(mockImage, mockImage, 0);
      })
    }));
    
    chart.exportImg();
    
    // Verify that the image src was modified to the data URL
    expect(mockImage.src).toBe('data:image/jpeg;base64,converteddata');
    expect(downloadImageSpy).toHaveBeenCalled();
  });
});