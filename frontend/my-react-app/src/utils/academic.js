const BATCH_START_BS_MONTH = 8;

const isOnOrAfter = (date, month, day) => {
  const currentMonth = date.getMonth() + 1;
  const currentDay = date.getDate();

  return currentMonth > month || (currentMonth === month && currentDay >= day);
};

export const getApproximateBsDate = (date = new Date()) => {
  let bsMonth = 12;

  if (isOnOrAfter(date, 4, 14) && !isOnOrAfter(date, 5, 15)) bsMonth = 1;
  else if (isOnOrAfter(date, 5, 15) && !isOnOrAfter(date, 6, 15)) bsMonth = 2;
  else if (isOnOrAfter(date, 6, 15) && !isOnOrAfter(date, 7, 17)) bsMonth = 3;
  else if (isOnOrAfter(date, 7, 17) && !isOnOrAfter(date, 8, 17)) bsMonth = 4;
  else if (isOnOrAfter(date, 8, 17) && !isOnOrAfter(date, 9, 17)) bsMonth = 5;
  else if (isOnOrAfter(date, 9, 17) && !isOnOrAfter(date, 10, 18)) bsMonth = 6;
  else if (isOnOrAfter(date, 10, 18) && !isOnOrAfter(date, 11, 17)) bsMonth = 7;
  else if (isOnOrAfter(date, 11, 17) && !isOnOrAfter(date, 12, 16)) bsMonth = 8;
  else if (isOnOrAfter(date, 12, 16) || !isOnOrAfter(date, 1, 15)) bsMonth = 9;
  else if (isOnOrAfter(date, 1, 15) && !isOnOrAfter(date, 2, 13)) bsMonth = 10;
  else if (isOnOrAfter(date, 2, 13) && !isOnOrAfter(date, 3, 15)) bsMonth = 11;

  return {
    bsYear: date.getFullYear() + (isOnOrAfter(date, 4, 14) ? 57 : 56),
    bsMonth,
  };
};

export const calculateSemesterFromBatch = (batchYear, date = new Date()) => {
  const normalizedBatch = Number.parseInt(batchYear, 10);

  if (!Number.isFinite(normalizedBatch)) return "";

  const { bsYear, bsMonth } = getApproximateBsDate(date);
  const elapsedMonths =
    (bsYear - normalizedBatch) * 12 + (bsMonth - BATCH_START_BS_MONTH);

  if (elapsedMonths <= 0) return 1;

  return Math.min(12, Math.max(1, Math.floor(elapsedMonths / 6) + 1));
};
