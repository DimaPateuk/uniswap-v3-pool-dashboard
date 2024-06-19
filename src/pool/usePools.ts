import { hashKey, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { buildPagination } from 'src/common';

export type SubgraphPoolModel = {
  id: string;
  liquidity: string;
  token0: {
    id: string;
    symbol: string;
  };
  token1: {
    id: string;
    symbol: string;
  };
};
const URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

const PER_PAGE = 1; // max 1000
const MAX_POOLS = 1; // max 6000

export async function getPool() {
  const factoryQuery = `
      {
        factory(id: "0x1F98431c8aD98523631AE4a59f267346ea31F984" ) {
          poolCount
        }
      }
      `;
  const factoryResults = await axios.post(URL, { query: factoryQuery });
  const poolCount = factoryResults.data.data.factory.poolCount as number;
  console.log('poolCount', poolCount);

  const offsets = buildPagination(poolCount, PER_PAGE, MAX_POOLS);
  console.log('offsetsBefore', offsets);

  const requests = offsets.map(async (offset) => {
    const testQuery = `
              {
                  pools(first: ${PER_PAGE} skip: ${offset} orderBy: liquidity, orderDirection: desc) {
                      id,
                      liquidity,
                      sqrtPrice,
                      token0 {
                          id, symbol
                      },
                      token1 {
                          id, symbol
                      }
                  }
              }
          `;

    const result = await axios.post(URL, {
      query: testQuery,
    });

    return result.data.data.pools as SubgraphPoolModel[];
  });

  const result = await Promise.all(requests);

  console.log(result);
  return result.flat();
}

export function usePools() {
  return useQuery({
    queryKey: ['subgraphPools'],
    queryFn: getPool,
  });
}
