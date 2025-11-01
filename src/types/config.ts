import { JsonRpcProvider } from "ethers";

/**
 * Supported provider types for diamond deployments
 * This union type handles different provider implementations used across the ecosystem
 * 
 * Note: We use `any` for HardhatEthersProvider to avoid module resolution issues in monorepo
 * setups where multiple packages may have different versions of @nomicfoundation/hardhat-ethers
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SupportedProvider = JsonRpcProvider | any;

export interface DiamondPathsConfig {
  deploymentsPath?: string;
  contractsPath?: string;
  callbacksPath?: string;
  configFilePath?: string;
  deployedDiamondDataFilePath?: string
  writeDeployedDiamondData?: boolean;
  diamondAbiPath?: string;
}

export interface DiamondsPathsConfig {
  paths: Record<string, DiamondPathsConfig>;
}

export interface DiamondConfig extends DiamondPathsConfig {
  diamondName: string;
  networkName?: string;
  chainId?: bigint | number;
  diamondAbiFileName?: string;
}

export interface FileRepositoryConfig extends DiamondConfig {
  chainId: number;
  networkName: string;
}

export interface DiamondsConfig {
  diamonds: Record<string, DiamondConfig>;
}
