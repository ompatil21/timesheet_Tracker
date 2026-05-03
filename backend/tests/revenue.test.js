const assert = require('node:assert');

// The core logic function we want to test (Extracted for unit testing)
const calculateRevenue = (dateString, hours, client, isPublicHoliday) => {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  const earnedOrdinary = hours * client.ordinaryRate;
  const loadingPct = client.casualLoading || 0;
  const earnedCasual = hours * (client.ordinaryRate * (loadingPct / 100));
  
  const standardPay = earnedOrdinary + earnedCasual;
  let earnedRevenue = 0;
  
  if (isPublicHoliday && client.holidayRate) {
    earnedRevenue = hours * client.holidayRate;
  } else if (day === 0 && client.sundayRate) {
    earnedRevenue = hours * client.sundayRate;
  } else if (day === 6 && client.saturdayRate) {
    earnedRevenue = hours * client.saturdayRate;
  } else {
    earnedRevenue = standardPay;
  }
  
  return { earnedOrdinary, earnedCasual, earnedRevenue };
};

console.log("\n=== RUNNING REVENUE ENGINE TEST SUITE ===\n");

let passed = 0;
let total = 5;

// Test 1: Standard Weekday with Casual Loading
try {
  const client = { ordinaryRate: 25.89, casualLoading: 25, saturdayRate: 38.83, sundayRate: 45.30 };
  const result = calculateRevenue('2026-04-22', 8.25, client, false); // Wednesday
  assert.strictEqual(result.earnedOrdinary.toFixed(2), '213.59');
  assert.strictEqual(result.earnedCasual.toFixed(2), '53.40');
  assert.strictEqual(result.earnedRevenue.toFixed(2), '266.99');
  console.log("✅ Test 1 Passed: Standard Weekday Calculation");
  passed++;
} catch (e) {
  console.error("❌ Test 1 Failed:", e.message);
}

// Test 2: Saturday Penalty Rate
try {
  const client = { ordinaryRate: 25.89, casualLoading: 25, saturdayRate: 38.83 };
  const result = calculateRevenue('2026-04-25', 5, client, false); // Saturday
  assert.strictEqual(result.earnedRevenue, 5 * 38.83); // 194.15
  console.log("✅ Test 2 Passed: Saturday Penalty Rate Match");
  passed++;
} catch (e) {
  console.error("❌ Test 2 Failed:", e.message);
}

// Test 3: Public Holiday Override
try {
  const client = { ordinaryRate: 25.89, casualLoading: 25, holidayRate: 64.72 };
  const result = calculateRevenue('2026-04-22', 4, client, true); // Wednesday, but Holiday
  assert.strictEqual(result.earnedRevenue, 4 * 64.72); // 258.88
  console.log("✅ Test 3 Passed: Public Holiday Multiplier Override");
  passed++;
} catch (e) {
  console.error("❌ Test 3 Failed:", e.message);
}

// Test 4: Missing Penalty Rate Fallback
try {
  // No weekend rates defined
  const client = { ordinaryRate: 20, casualLoading: 0 };
  const result = calculateRevenue('2026-04-26', 10, client, false); // Sunday
  assert.strictEqual(result.earnedRevenue, 200); // Should fallback to standard pay (20 * 10)
  console.log("✅ Test 4 Passed: Missing Penalty Rate Fallback (Safely avoids NaN)");
  passed++;
} catch (e) {
  console.error("❌ Test 4 Failed:", e.message);
}

// Test 5: NaN Prevention (Undefined values)
try {
  const client = { ordinaryRate: 25.89 }; // Only base rate defined, everything else undefined
  const result = calculateRevenue('2026-04-22', 8.25, client, false);
  assert.ok(!isNaN(result.earnedRevenue), "Earned revenue should not be NaN");
  assert.strictEqual(result.earnedRevenue.toFixed(2), (25.89 * 8.25).toFixed(2));
  console.log("✅ Test 5 Passed: Undefined Value Handling (NaN Prevention)");
  passed++;
} catch (e) {
  console.error("❌ Test 5 Failed:", e.message);
}

console.log(`\n=== TEST SUITE COMPLETE: ${passed}/${total} PASSED ===\n`);
