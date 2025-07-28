import { describe, test, expect, beforeEach, vi } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'

describe('OrgChart zoomed function', () => {
  let chart
  let mockContainer
  let mockEvent
  let mockTransform

  beforeEach(() => {
    // Create a mock container
    mockContainer = document.createElement('div')
    mockContainer.id = 'test-container'
    document.body.appendChild(mockContainer)

    // Create chart instance
    chart = new OrgChart()
    chart.container('#test-container')

    // Create mock transform object
    mockTransform = {
      x: 100,
      y: 50,
      k: 1.5,
      toString: () => 'translate(100,50) scale(1.5)'
    }

    // Create mock event
    mockEvent = {
      transform: mockTransform
    }

    // Mock the chart element and its attr method
    const mockChartElement = {
      attr: vi.fn().mockReturnThis()
    }

    // Set up the chart state with mocked chart element
    const state = chart.getChartState()
    state.chart = mockChartElement

    // Mock isEdge method
    chart.isEdge = vi.fn().mockReturnValue(false)
    
    // Mock restyleForeignObjectElements method
    chart.restyleForeignObjectElements = vi.fn()
  })

  test('should store transform in lastTransform', () => {
    // Act
    chart.zoomed(mockEvent)

    // Assert
    const state = chart.getChartState()
    expect(state.lastTransform).toEqual(mockTransform)
  })

  test('should apply transform to chart element', () => {
    // Act
    chart.zoomed(mockEvent)

    // Assert
    const state = chart.getChartState()
    expect(state.chart.attr).toHaveBeenCalledWith('transform', mockTransform)
  })

  test('should not call restyleForeignObjectElements when not in Edge browser', () => {
    // Arrange
    chart.isEdge.mockReturnValue(false)

    // Act
    chart.zoomed(mockEvent)

    // Assert
    expect(chart.restyleForeignObjectElements).not.toHaveBeenCalled()
  })

  test('should call restyleForeignObjectElements when in Edge browser', () => {
    // Arrange
    chart.isEdge.mockReturnValue(true)

    // Act
    chart.zoomed(mockEvent)

    // Assert
    expect(chart.restyleForeignObjectElements).toHaveBeenCalledTimes(1)
  })

  test('should handle different transform values', () => {
    // Arrange
    const differentTransform = {
      x: -200,
      y: 300,
      k: 0.5,
      toString: () => 'translate(-200,300) scale(0.5)'
    }
    const eventWithDifferentTransform = {
      transform: differentTransform
    }

    // Act
    chart.zoomed(eventWithDifferentTransform)

    // Assert
    const state = chart.getChartState()
    expect(state.lastTransform).toEqual(differentTransform)
    expect(state.chart.attr).toHaveBeenCalledWith('transform', differentTransform)
  })

  test('should handle zero transform values', () => {
    // Arrange
    const zeroTransform = {
      x: 0,
      y: 0,
      k: 1,
      toString: () => 'translate(0,0) scale(1)'
    }
    const eventWithZeroTransform = {
      transform: zeroTransform
    }

    // Act
    chart.zoomed(eventWithZeroTransform)

    // Assert
    const state = chart.getChartState()
    expect(state.lastTransform).toEqual(zeroTransform)
    expect(state.chart.attr).toHaveBeenCalledWith('transform', zeroTransform)
  })

  test('should handle negative scale values', () => {
    // Arrange
    const negativeScaleTransform = {
      x: 50,
      y: 25,
      k: -1,
      toString: () => 'translate(50,25) scale(-1)'
    }
    const eventWithNegativeScale = {
      transform: negativeScaleTransform
    }

    // Act
    chart.zoomed(eventWithNegativeScale)

    // Assert
    const state = chart.getChartState()
    expect(state.lastTransform).toEqual(negativeScaleTransform)
    expect(state.chart.attr).toHaveBeenCalledWith('transform', negativeScaleTransform)
  })

  test('should handle very large transform values', () => {
    // Arrange
    const largeTransform = {
      x: 10000,
      y: -5000,
      k: 100,
      toString: () => 'translate(10000,-5000) scale(100)'
    }
    const eventWithLargeTransform = {
      transform: largeTransform
    }

    // Act
    chart.zoomed(eventWithLargeTransform)

    // Assert
    const state = chart.getChartState()
    expect(state.lastTransform).toEqual(largeTransform)
    expect(state.chart.attr).toHaveBeenCalledWith('transform', largeTransform)
  })

  test('should handle very small scale values', () => {
    // Arrange
    const smallScaleTransform = {
      x: 10,
      y: 20,
      k: 0.001,
      toString: () => 'translate(10,20) scale(0.001)'
    }
    const eventWithSmallScale = {
      transform: smallScaleTransform
    }

    // Act
    chart.zoomed(eventWithSmallScale)

    // Assert
    const state = chart.getChartState()
    expect(state.lastTransform).toEqual(smallScaleTransform)
    expect(state.chart.attr).toHaveBeenCalledWith('transform', smallScaleTransform)
  })

  test('should work with identity transform', () => {
    // Arrange
    const identityTransform = {
      x: 0,
      y: 0,
      k: 1,
      toString: () => 'translate(0,0) scale(1)'
    }
    const eventWithIdentity = {
      transform: identityTransform
    }

    // Act
    chart.zoomed(eventWithIdentity)

    // Assert
    const state = chart.getChartState()
    expect(state.lastTransform).toEqual(identityTransform)
    expect(state.chart.attr).toHaveBeenCalledWith('transform', identityTransform)
  })

  test('should maintain transform reference integrity', () => {
    // Arrange
    const originalTransform = mockTransform

    // Act
    chart.zoomed(mockEvent)

    // Assert
    const state = chart.getChartState()
    expect(state.lastTransform).toBe(originalTransform) // Same reference
  })

  test('should handle multiple consecutive zoom calls', () => {
    // Arrange
    const transform1 = { x: 10, y: 20, k: 1.2, toString: () => 'translate(10,20) scale(1.2)' }
    const transform2 = { x: 30, y: 40, k: 1.8, toString: () => 'translate(30,40) scale(1.8)' }
    const transform3 = { x: 50, y: 60, k: 2.0, toString: () => 'translate(50,60) scale(2.0)' }

    // Act
    chart.zoomed({ transform: transform1 })
    chart.zoomed({ transform: transform2 })
    chart.zoomed({ transform: transform3 })

    // Assert
    const state = chart.getChartState()
    expect(state.lastTransform).toEqual(transform3) // Should have the last transform
    expect(state.chart.attr).toHaveBeenCalledTimes(3)
    expect(state.chart.attr).toHaveBeenLastCalledWith('transform', transform3)
  })

  test('should handle Edge browser detection correctly', () => {
    // Test Edge browser scenario
    chart.isEdge.mockReturnValue(true)
    chart.zoomed(mockEvent)
    expect(chart.restyleForeignObjectElements).toHaveBeenCalledTimes(1)

    // Reset mocks
    vi.clearAllMocks()

    // Test non-Edge browser scenario
    chart.isEdge.mockReturnValue(false)
    chart.zoomed(mockEvent)
    expect(chart.restyleForeignObjectElements).not.toHaveBeenCalled()
  })

  test('should work when chart element attr method returns different values', () => {
    // Arrange
    const state = chart.getChartState()
    state.chart.attr.mockReturnValue('some-return-value')

    // Act
    chart.zoomed(mockEvent)

    // Assert
    expect(state.chart.attr).toHaveBeenCalledWith('transform', mockTransform)
    expect(state.lastTransform).toEqual(mockTransform)
  })
})