// Common public holidays for Australia (can be customized per region/country)
// Format: { month (0-11), day, name }

const COMMON_HOLIDAYS = [
  { month: 0, day: 1, name: "New Year's Day" },
  { month: 0, day: 26, name: "Australia Day" },
  { month: 2, day: 1, name: "Good Friday" }, // Note: varies by year, simplified
  { month: 2, day: 3, name: "Easter Monday" }, // Note: varies by year, simplified
  { month: 3, day: 25, name: "ANZAC Day" },
  { month: 5, day: 8, name: "Queen's Birthday" }, // June, 2nd Monday (varies)
  { month: 8, day: 1, name: "Spring Bank Holiday" }, // Varies
  { month: 11, day: 25, name: "Christmas Day" },
  { month: 11, day: 26, name: "Boxing Day" },
];

// Extended holidays with specific years for more accuracy
// Add more as needed
const DATED_HOLIDAYS: { date: string; name: string }[] = [
  // 2026
  { date: "2026-04-10", name: "Good Friday" },
  { date: "2026-04-13", name: "Easter Monday" },
  { date: "2026-06-08", name: "Queen's Birthday" },
  
  // 2027
  { date: "2027-04-02", name: "Good Friday" },
  { date: "2027-04-05", name: "Easter Monday" },
  { date: "2027-06-14", name: "Queen's Birthday" },
  
  // 2028
  { date: "2028-03-31", name: "Good Friday" },
  { date: "2028-04-03", name: "Easter Monday" },
  { date: "2028-06-12", name: "Queen's Birthday" },
];

/**
 * Check if a date is a public holiday
 * @param dateString - Date in format 'YYYY-MM-DD'
 * @returns { isHoliday: boolean, name?: string }
 */
export const checkPublicHoliday = (dateString: string): { isHoliday: boolean; name?: string } => {
  // First check dated holidays (more accurate)
  const datedHoliday = DATED_HOLIDAYS.find(h => h.date === dateString);
  if (datedHoliday) {
    return { isHoliday: true, name: datedHoliday.name };
  }

  // Check common holidays
  const date = new Date(dateString);
  const month = date.getMonth();
  const day = date.getDate();

  const commonHoliday = COMMON_HOLIDAYS.find(h => h.month === month && h.day === day);
  if (commonHoliday) {
    return { isHoliday: true, name: commonHoliday.name };
  }

  return { isHoliday: false };
};

/**
 * Get all holidays for a given year
 * @param year - Year to get holidays for
 */
export const getHolidaysForYear = (year: number) => {
  return DATED_HOLIDAYS.filter(h => h.date.startsWith(year.toString()));
};
