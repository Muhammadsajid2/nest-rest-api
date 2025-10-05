export const stringToObject = (str: string) => {
  // Step 1: Split the string into individual key-value pairs
  const pairs = str.split(', ');

  // Step 2 and 3: Split each pair into key and value, then create the object
  const result = {};
  pairs.forEach((pair) => {
    const [key, value] = pair.split(':');
    result[key.trim()] = parseInt(value); // Convert value to number if needed
  });

  return result;
};
