import { describe, test, expect, beforeEach } from 'vitest';
import { DataProcessor } from '../../../src/data/DataProcessor.js';

describe('DataProcessor', () => {
  let dataProcessor;
  let sampleData;
  let mockState;

  beforeEach(() => {
    mockState = {
      getState: () => ({
        nodeId: d => d.id,
        parentNodeId: d => d.parentId,
        nodeWidth: () => 100,
        nodeHeight: () => 50,
        minPagingVisibleNodes: () => 5
      })
    };
    
    dataProcessor = new DataProcessor(mockState);
    sampleData = [
      { id: '1', parentId: null, name: 'Root' },
      { id: '2', parentId: '1', name: 'Child 1' },
      { id: '3', parentId: '1', name: 'Child 2' },
      { id: '4', parentId: '2', name: 'Grandchild' }
    ];
  });

  test('should generate root hierarchy', () => {
    const root = dataProcessor.generateRoot(sampleData);
    
    expect(root).toBeTruthy();
    expect(root.data.id).toBe('1');
    expect(root.children).toHaveLength(2);
  });

  test('should return null for empty data', () => {
    const root = dataProcessor.generateRoot([]);
    expect(root).toBeNull();
  });

  test('should collect node children', () => {
    const root = dataProcessor.generateRoot(sampleData);
    const nodeStore = [];
    
    dataProcessor.getNodeChildren(root, nodeStore);
    
    expect(nodeStore).toHaveLength(4);
    const ids = nodeStore.map(d => d.id).sort();
    expect(ids).toEqual(['1', '2', '3', '4']);
  });
});