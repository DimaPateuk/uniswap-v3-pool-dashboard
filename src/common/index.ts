export const buildPagination = (
  input: number,
  perPage = 1000,
  max_pools = 6000
) => {
  const result = [];
  for (let i = 0; i < Math.min(input, max_pools); i += perPage) {
    result.push(i);
  }
  return result;
};

export const delay = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const sqrtToPrice = (
  sqrt: number,
  decimals0: number,
  decimals1: number,
  token0IsInput = true
) => {
  const numerator = sqrt ** 2;
  const denominator = 2 ** 192;
  let ratio = numerator / denominator;
  const shiftDecimals = Math.pow(10, decimals0 - decimals1);
  ratio = ratio * shiftDecimals;
  if (!token0IsInput) {
    ratio = 1 / ratio;
  }
  return ratio;
};
