import { OrgChart } from "../src/d3-org-chart.js";
import data from "./orgchart-example.json";

// Create and render the org chart
new OrgChart()
    .container('#chart-container')
    .data(data)
    .render();