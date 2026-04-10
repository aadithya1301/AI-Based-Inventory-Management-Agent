import * as ss from 'simple-statistics';

// Sample data for demand prediction: [day_index, demand_value]
// Day 0 to 6 (past week)
const HISTORICAL_DEMAND = [
  [0, 10],
  [1, 12],
  [2, 15],
  [3, 13],
  [4, 18],
  [5, 20],
  [6, 22],
];

export function predictNextDayDemand() {
  const regression = ss.linearRegression(HISTORICAL_DEMAND);
  const nextDayIndex = HISTORICAL_DEMAND.length;
  const prediction = ss.linearRegressionLine(regression)(nextDayIndex);
  
  return {
    prediction: Math.round(prediction * 100) / 100,
    confidence: 'High (based on weekly trend)',
    trend: regression.m > 0 ? 'Increasing' : 'Decreasing',
  };
}
