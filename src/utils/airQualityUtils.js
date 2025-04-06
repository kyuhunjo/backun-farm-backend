export const getPM10Grade = (value) => {
  if (value <= 30) return '1';
  if (value <= 80) return '2';
  if (value <= 150) return '3';
  return '4';
};

export const getPM25Grade = (value) => {
  if (value <= 15) return '1';
  if (value <= 35) return '2';
  if (value <= 75) return '3';
  return '4';
}; 