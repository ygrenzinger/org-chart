// test/fixtures/mockData.js
export const mockHierarchicalData = [
  { id: 1, parentId: null, name: 'CEO', position: 'Chief Executive Officer' },
  { id: 2, parentId: 1, name: 'CTO', position: 'Chief Technology Officer' },
  { id: 3, parentId: 1, name: 'CFO', position: 'Chief Financial Officer' },
  { id: 4, parentId: 2, name: 'Dev Manager', position: 'Development Manager' },
  { id: 5, parentId: 2, name: 'QA Manager', position: 'Quality Assurance Manager' },
  { id: 6, parentId: 4, name: 'Senior Dev', position: 'Senior Developer' },
  { id: 7, parentId: 4, name: 'Junior Dev', position: 'Junior Developer' }
];

export const mockConnectionsData = [
  { from: '3', to: '2', label: 'Budget Approval' },
  { from: '5', to: '6', label: 'Code Review' }
];

export function generateLargeHierarchicalData(nodeCount) {
  const data = [{ id: 1, parentId: null, name: 'Root', position: 'Root Node' }];
  
  for (let i = 2; i <= nodeCount; i++) {
    const parentId = Math.floor(Math.random() * (i - 1)) + 1;
    data.push({
      id: i,
      parentId: parentId,
      name: `Node ${i}`,
      position: `Position ${i}`
    });
  }
  
  return data;
}

export const mockCustomNodeContent = (d) => `
  <div style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
    <h3>${d.data.name}</h3>
    <p>${d.data.position}</p>
  </div>
`;