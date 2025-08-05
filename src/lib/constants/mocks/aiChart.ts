import { AIChartData } from "@/lib/types/charts";

// Individual chart examples for specific use cases
export const mockBarChart: AIChartData = {
  headline: "Supply Chain Analysis - Demand vs Allocation",
  timestamp: "2024-12-01T15:00:00Z",
  preamble: "Comparison between total demand and allocation by part number",
  content: "A significant shortage is observed in several critical components.",
  chart: {
    type: "bar",
    labels: [
      "900-9X88E-00CX-SPA",
      "9209N110-00R",
      "999-0257-000",
      "999-0258-000",
    ],
    data: [
      {
        name: "Total Demand",
        data: [15000, 2000, 5000, 1500],
        color: "#90EE90",
      },
      {
        name: "Allocated",
        data: [500, 1800, 0, 1200],
        color: "#228B22",
      },
      {
        name: "Shortage",
        data: [-14500, -200, -5000, -300],
        color: "#FF0000",
      },
    ],
  },
};

export const mockLineChart: AIChartData = {
  headline: "Sales Trend - Temporal Analysis",
  timestamp: "2024-12-01T16:00:00Z",
  preamble: "Evolution of sales and costs over time",
  content: "Sales show a positive trend while costs remain controlled.",
  chart: {
    type: "line",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    data: [
      {
        name: "Sales",
        data: [25000, 28000, 32000, 35000, 38000, 42000],
        color: "#0070F2",
      },
      {
        name: "Costs",
        data: [18000, 19000, 21000, 22000, 24000, 26000],
        color: "#EF4444",
      },
    ],
  },
};

export const mockAreaChart: AIChartData = {
  headline: "Market Share by Region",
  timestamp: "2024-12-01T17:00:00Z",
  preamble: "Analysis of market participation evolution",
  content:
    "The Asia-Pacific region shows the highest growth in market participation.",
  chart: {
    type: "area",
    labels: ["2020", "2021", "2022", "2023", "2024"],
    data: [
      {
        name: "North America",
        data: [35, 32, 30, 28, 25],
        color: "#0070F2",
      },
      {
        name: "Europe",
        data: [30, 28, 25, 22, 20],
        color: "#8B5CF6",
      },
      {
        name: "Asia-Pacific",
        data: [25, 28, 32, 35, 40],
        color: "#10B981",
      },
      {
        name: "Rest of World",
        data: [10, 12, 13, 15, 15],
        color: "#F59E0B",
      },
    ],
  },
};

export const mockPieChart: AIChartData = {
  headline: "System Error Distribution",
  timestamp: "2024-12-01T18:00:00Z",
  preamble: "Analysis of different types of reported errors",
  content: "404 errors represent the majority of system issues.",
  chart: {
    type: "pie",
    labels: ["Error 404", "Error 500", "Timeout", "DB Error", "Auth Error"],
    data: [40, 25, 20, 10, 5],
  },
};

export const mockDoughnutChart: AIChartData = {
  headline: "Resource Distribution by Department",
  timestamp: "2024-12-01T19:00:00Z",
  preamble: "Budget resource allocation by area",
  content:
    "Development and Research receive the largest portion of the budget.",
  chart: {
    type: "doughnut",
    labels: ["Development", "Research", "Marketing", "Sales", "Support"],
    data: [35, 25, 20, 15, 5],
  },
};

export const mockColumnChart: AIChartData = {
  headline: "Monthly Revenue by Product Category",
  timestamp: "2024-12-01T20:00:00Z",
  preamble: "Vertical column comparison of revenue across product lines",
  content: "Electronics category shows the highest revenue performance.",
  chart: {
    type: "column",
    labels: ["Electronics", "Clothing", "Home & Garden", "Sports", "Books"],
    data: [
      {
        name: "Q1 Revenue",
        data: [45000, 32000, 28000, 22000, 18000],
        color: "#0070F2",
      },
      {
        name: "Q2 Revenue",
        data: [52000, 38000, 31000, 25000, 20000],
        color: "#10B981",
      },
    ],
  },
};

export const mockBulletChart: AIChartData = {
  headline: "Performance Metrics vs Targets",
  timestamp: "2024-12-01T21:00:00Z",
  preamble: "Performance indicators compared against set targets",
  content: "Most departments are meeting or exceeding their performance targets.",
  chart: {
    type: "bullet",
    labels: ["Sales", "Customer Satisfaction", "Efficiency", "Quality", "Innovation"],
    data: [
      {
        name: "Current Performance",
        data: [85, 92, 78, 95, 88],
        color: "#0070F2",
      },
      {
        name: "Target",
        data: [80, 90, 75, 90, 85],
        color: "#EF4444",
      },
    ],
  },
};

export const mockColumnChartWithTrend: AIChartData = {
  headline: "Sales Performance with Trend Analysis",
  timestamp: "2024-12-01T22:00:00Z",
  preamble: "Column chart showing sales data with trend line overlay",
  content: "Overall positive trend observed despite seasonal fluctuations.",
  chart: {
    type: "columnWithTrend",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    data: [
      {
        name: "Sales",
        data: [25000, 28000, 32000, 35000, 38000, 42000],
        color: "#0070F2",
      },
      {
        name: "Trend",
        data: [24000, 27000, 30000, 33000, 36000, 39000],
        color: "#EF4444",
      },
    ],
  },
};

export const mockComposedChart: AIChartData = {
  headline: "Multi-Metric Business Dashboard",
  timestamp: "2024-12-01T23:00:00Z",
  preamble: "Combined visualization of revenue, costs, and profit margins",
  content: "Revenue growth outpaces cost increases, leading to improved margins.",
  chart: {
    type: "composed",
    labels: ["Q1", "Q2", "Q3", "Q4"],
    data: [
      {
        name: "Revenue",
        data: [100000, 120000, 140000, 160000],
        color: "#0070F2",
      },
      {
        name: "Costs",
        data: [70000, 80000, 90000, 100000],
        color: "#EF4444",
      },
      {
        name: "Profit",
        data: [30000, 40000, 50000, 60000],
        color: "#10B981",
      },
    ],
  },
};

export const mockRadarChart: AIChartData = {
  headline: "Competency Assessment Matrix",
  timestamp: "2024-12-02T00:00:00Z",
  preamble: "Multi-dimensional evaluation of team capabilities",
  content: "Team shows strong technical skills with room for improvement in communication.",
  chart: {
    type: "radar",
    labels: ["Technical Skills", "Communication", "Leadership", "Problem Solving", "Creativity", "Teamwork"],
    data: [
      {
        name: "Current Team",
        data: [85, 65, 70, 80, 75, 90],
        color: "#0070F2",
      },
      {
        name: "Industry Average",
        data: [70, 75, 65, 70, 70, 75],
        color: "#EF4444",
      },
    ],
  },
};

// Export all chart examples for easy access
export const AIChartExamples = {
  bar: mockBarChart,
  line: mockLineChart,
  area: mockAreaChart,
  pie: mockPieChart,
  doughnut: mockDoughnutChart,
  column: mockColumnChart,
  bullet: mockBulletChart,
  columnWithTrend: mockColumnChartWithTrend,
  composed: mockComposedChart,
  radar: mockRadarChart,
};
