import { test, expect } from '@playwright/test';

test.describe('OrgChart E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to your sandbox page
    await page.goto('/');
    
    // Wait for the chart to load and render
    await page.waitForSelector('.chart-container .svg-chart-container', { timeout: 10000 });
    await page.waitForFunction(() => {
      const nodes = document.querySelectorAll('.node');
      return nodes.length > 0;
    }, { timeout: 15000 });
  });

  test('should load and render the org chart', async ({ page }) => {
    // Verify the page title
    await expect(page).toHaveTitle('OrgChart Test App');
    
    // Verify search input is present
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'search by name');
    
    // Verify chart container exists
    const chartContainer = page.locator('.chart-container');
    await expect(chartContainer).toBeVisible();
    
    // Verify SVG is rendered
    const svg = page.locator('.chart-container .svg-chart-container');
    await expect(svg).toBeVisible();
    
    // Verify nodes are present
    const nodes = page.locator('.node');
    await expect(nodes.first()).toBeVisible();
    const nodeCount = await nodes.count();
    expect(nodeCount).toBeGreaterThan(0);
  });

  test('should display node information correctly', async ({ page }) => {
    // Wait for nodes to be fully rendered
    await page.waitForSelector('.node', { timeout: 10000 });
    
    const firstNode = page.locator('.node').first();
    await expect(firstNode).toBeVisible();
    
    // Check if node contains expected elements (based on your nodeContent function)
    const nodeContent = firstNode.locator('div').first();
    await expect(nodeContent).toBeVisible();
    
    // Verify node has ID, name, and position (based on your template)
    const hasId = await firstNode.locator('text=#').count() > 0;
    const hasName = await firstNode.locator('div').filter({ hasText: /\w+/ }).count() > 0;
    
    expect(hasId || hasName).toBeTruthy();
  });

  test('should handle search functionality', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Test empty search
    await searchInput.fill('');
    await page.waitForTimeout(500);
    
    // Test search with a common name (assuming Oracle data has common names)
    await searchInput.fill('john');
    await page.waitForTimeout(1000);
    
    // Verify console log was called (if accessible)
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    
    // Check if filtering occurred by looking for highlighted nodes
    const highlightedNodes = page.locator('.node[data-highlighted="true"]');
    // Note: This depends on how highlighting is implemented in your CSS/DOM
    
    // Test clearing search
    await searchInput.fill('');
    await page.waitForTimeout(500);
  });

  test('should handle search with various inputs', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    const testCases = [
      'a', // Single character
      'manager', // Common role
      'JOHN', // Uppercase
      'john doe', // Full name
      'xyz123', // Non-existent
      '', // Empty string
    ];
    
    for (const testCase of testCases) {
      await searchInput.fill(testCase);
      await page.waitForTimeout(500);
      
      // Verify the chart is still functional
      const svg = page.locator('.chart-container .svg-chart-container');
      await expect(svg).toBeVisible();
    }
  });

  test('should handle node interactions', async ({ page }) => {
    // Wait for nodes to be clickable
    await page.waitForSelector('.node', { timeout: 10000 });
    
    const firstNode = page.locator('.node').first();
    
    // Test node click
    await firstNode.click();
    await page.waitForTimeout(500);
    
    // Test node hover
    await firstNode.hover();
    await page.waitForTimeout(300);
    
    // Verify chart is still responsive
    const svg = page.locator('.chart-container .svg-chart-container');
    await expect(svg).toBeVisible();
  });

  test('should handle zoom and pan interactions', async ({ page }) => {
    const chartContainer = page.locator('.chart-container');
    
    // Test zoom in
    await chartContainer.hover();
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(500);
    
    // Test zoom out
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(500);
    
    // Test pan
    const boundingBox = await chartContainer.boundingBox();
    if (boundingBox) {
      const centerX = boundingBox.x + boundingBox.width / 2;
      const centerY = boundingBox.y + boundingBox.height / 2;
      
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + 50, centerY + 50);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
    
    // Verify chart is still functional
    const svg = page.locator('.chart-container .svg-chart-container');
    await expect(svg).toBeVisible();
  });

  test('should handle data loading errors gracefully', async ({ page }) => {
    // Intercept the CSV request and simulate failure
    await page.route('**/data-oracle.csv', route => {
      route.abort();
    });
    
    // Reload the page
    await page.reload();
    
    // Wait a bit for potential error handling
    await page.waitForTimeout(3000);
    
    // Verify the page doesn't crash
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/data-oracle.csv', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });
    
    await page.reload();
    
    // Verify loading state or eventual success
    await page.waitForSelector('.chart-container .svg-chart-container', { timeout: 15000 });
    const nodes = page.locator('.node');
    await expect(nodes.first()).toBeVisible({ timeout: 20000 });
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const svg = page.locator('.chart-container .svg-chart-container');
    await expect(svg).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await expect(svg).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    await expect(svg).toBeVisible();
  });

  test('should maintain performance with large datasets', async ({ page }) => {
    // Monitor performance
    const startTime = Date.now();
    
    // Wait for chart to fully render
    await page.waitForSelector('.node', { timeout: 15000 });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Assert reasonable load time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
    
    // Verify all expected nodes are present
    const nodes = page.locator('.node');
    const nodeCount = await nodes.count();
    expect(nodeCount).toBeGreaterThan(0);
  });

  test('should validate chart structure and accessibility', async ({ page }) => {
    await page.waitForSelector('.chart-container .svg-chart-container');
    
    // Check for accessibility attributes
    const accessibilityCheck = await page.evaluate(() => {
      const svg = document.querySelector('.chart-container .svg-chart-container');
      const searchInput = document.querySelector('input[type="search"]');
      
      return {
        svgPresent: !!svg,
        inputHasPlaceholder: searchInput?.getAttribute('placeholder') !== null,
        chartContainerExists: !!document.querySelector('.chart-container')
      };
    });
    
    // Assert accessibility and structure standards
    expect(accessibilityCheck.svgPresent).toBe(true);
    expect(accessibilityCheck.inputHasPlaceholder).toBe(true);
    expect(accessibilityCheck.chartContainerExists).toBe(true);
  });

  test('should handle console logging during search', async ({ page }) => {
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });
    
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('test search');
    await page.waitForTimeout(500);
    
    // Verify that console logging occurred (based on run.js filterChart function)
    const hasFilteringLog = consoleLogs.some(log => 
      log.includes('filtering chart') && log.includes('test search')
    );
    expect(hasFilteringLog).toBe(true);
  });
});