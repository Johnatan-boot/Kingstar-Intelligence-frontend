const val1 = "741,55";
const val2 = "741.55";
const val3 = "1.741,55";
const parseNumber = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = String(val).replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
};
console.log(parseNumber(val1));
console.log(parseNumber(val2)); // this will be wrong for 741.55 -> 74155!
