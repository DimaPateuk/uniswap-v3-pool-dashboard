'use client';
import { ethers } from 'ethers';
import { SubgraphPoolModel } from 'src/pool/usePools';
import { delay } from 'src/common';
import { usePoolContracts } from 'src/pool/usePoolContracts';
import { PoolView } from 'src/pool/PoolView';

const poolAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount0',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount1',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128',
      },
      { indexed: false, internalType: 'int24', name: 'tick', type: 'int24' },
    ],
    name: 'Swap',
    type: 'event',
  },
];

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
// const provider = new ethers.AlchemyProvider(null, 'my-alchemy-key')

const sqrtToPrice = (
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

async function addListeners(poolData: SubgraphPoolModel[]) {
  for (const data of poolData) {
    try {
      const token0Symbol = data.token0.symbol;
      const token1Symbol = data.token1.symbol;

      const poolContract = new ethers.Contract(data.id, poolAbi, provider);

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

      const token0Decimals = await token0Contract.decimals();
      const token1Decimals = await token1Contract.decimals();

      await poolContract.on(
        'Swap',
        (sender, recipient, amount0, amount1, sqrtPriceX96) => {
          const priceRatio = sqrtToPrice(
            sqrtPriceX96.toString(),
            token0Decimals.toString(),
            token1Decimals.toString()
          );
          console.log(
            `Pool: ${token0Symbol}/${token1Symbol} |`,
            `Price: ${priceRatio.toString()} |`,
            `From: ${sender}`
          );
        }
      );
      console.log(`${token0Symbol}/${token1Symbol} added`);
    } catch {
      await delay(5000);
      console.log('failed');
    }
    await delay(100);
  }

  console.log('complete');
}

export default function Dashboard() {
  const { data: pools, error } = usePoolContracts();

  return (
    <div>
      <div>
        {pools?.map((item, index) => {
          return <PoolView key={index} data={item} />;
        })}
      </div>

      <div>
        <pre>{JSON.stringify(error, null, 4)}</pre>
      </div>
    </div>
  );
}
