'use client';
import { ethers } from 'ethers';
import { MyPoolContractModel, usePoolPrice } from './usePoolContracts';

export type PoolViewProps = {
  data: MyPoolContractModel;
};
export function PoolView(props: PoolViewProps) {
  console.log(props.data.poolContract);
  const { data, refetch } = usePoolPrice(props.data);
  return (
    <div>
      <div>
        <span>{props.data.subgraphModel.token0.symbol}</span>/
        <span>{props.data.subgraphModel.token1.symbol}</span>{' '}
        <span>{data}</span>
        <button
          type="button"
          onClick={() => {
            refetch();
          }}
        >
          refresh
        </button>
      </div>
    </div>
  );
}
