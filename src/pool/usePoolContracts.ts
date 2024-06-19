import { useQuery } from '@tanstack/react-query';
import { SubgraphPoolModel, usePools } from './usePools';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { sqrtToPrice } from 'src/common';
import { poolABI } from './poolABI';

const tokenAbi = [
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];
const provider = new ethers.InfuraProvider(
  'mainnet',
  process.env.NEXT_PUBLIC_INFURA_KEY
);

export type MyPoolContractModel = {
  subgraphModel: SubgraphPoolModel;
  poolContract: ethers.Contract;
  token0Contract: ethers.Contract;
  token1Contract: ethers.Contract;
};
async function getPoolContracts(pools: SubgraphPoolModel[] = []) {
  return pools.map((data) => {
    const poolContract = new ethers.Contract(data.id, poolABI, provider);

    const token0Contract = new ethers.Contract(
      data.token0.id,
      tokenAbi,
      provider
    );
    const token1Contract = new ethers.Contract(
      data.token1.id,
      tokenAbi,
      provider
    );

    return {
      subgraphModel: data,
      poolContract,
      token0Contract,
      token1Contract,
    };
  });
}

export function usePoolContracts() {
  const { data } = usePools();

  return useQuery({
    enabled: Boolean(data),
    queryKey: ['poolContracts'],
    queryFn: () => getPoolContracts(data),
  });
}

export function usePoolPrice(model: MyPoolContractModel) {
  return useQuery({
    queryKey: [
      'poolPrices',
      model.subgraphModel.token0.symbol + model.subgraphModel.token1.symbol,
    ],
    queryFn: async () => {
      const sqrtPriceX96 = (await model.poolContract.slot0()).sqrtPriceX96;
      const token0Decimals = await model.token0Contract.decimals();
      const token1Decimals = await model.token1Contract.decimals();
      const priceRatio = sqrtToPrice(
        sqrtPriceX96.toString(),
        token0Decimals.toString(),
        token1Decimals.toString()
      );
      return priceRatio;
    },
  });
}
