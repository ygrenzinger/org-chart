import { OrgChart } from "./d3-org-chart.js";
import csvData from "../misc/data.csv?raw";

// Parse CSV string to array of objects
function parseCSV(csv) {
  const [header, ...rows] = csv.trim().split("\n");
  const keys = header.split(",");
  return rows.map((row) => {
    const values = row.split(",");
    const obj = {};
    keys.forEach((k, i) => (obj[k] = values[i]));
    return obj;
  });
}

const data = parseCSV(csvData);
console.log("Parsed Data:", data);

// Create and render the org chart
const chart = new OrgChart();
chart.container = "#chart-container";
chart.data = data;
if (typeof chart.render === "function") {
  chart.render();
} else if (typeof chart.draw === "function") {
  chart.draw();
}
