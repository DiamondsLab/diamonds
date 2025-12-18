import chalk from 'chalk';
import { join } from 'path';
import { DeployConfig, DeployedDiamondData } from '../schemas';
import { DiamondConfig } from '../types';
import { DeploymentRepository } from './DeploymentRepository';
import { readDeployConfig, readDeployFile, writeDeployInfo } from './jsonFileHandler';

export class FileDeploymentRepository implements DeploymentRepository {
	private deploymentDataPath: string;
	private deployedDiamondDataFilePath: string;
	private configFilePath: string;
	private writeDeployedDiamondData: boolean;
	private deploymentId: string;

	constructor(config: DiamondConfig) {
		this.deploymentDataPath = config.deploymentsPath ?? 'diamonds';
		this.writeDeployedDiamondData = config.writeDeployedDiamondData ?? true;
		const networkName = config.networkName ?? 'unknown';
		const chainId = config.chainId ?? 0;
		this.deploymentId = `${config.diamondName.toLowerCase()}-${networkName.toLowerCase()}-${chainId.toString()}`;

		if (config.deployedDiamondDataFilePath) {
			this.deployedDiamondDataFilePath = config.deployedDiamondDataFilePath;
		} else {
			this.deployedDiamondDataFilePath = join(
				this.deploymentDataPath,
				config.diamondName,
				`deployments/${this.deploymentId}.json`,
			);
		}
		if (config.configFilePath) {
			this.configFilePath = config.configFilePath;
		} else {
			this.configFilePath = join(
				this.deploymentDataPath,
				config.diamondName,
				`${config.diamondName.toLowerCase()}.config.json`,
			);
		}
	}

	public setWriteDeployedDiamondData(write: boolean): void {
		this.writeDeployedDiamondData = write;
	}

	public getWriteDeployedDiamondData(): boolean {
		return this.writeDeployedDiamondData;
	}

	loadDeployedDiamondData(): DeployedDiamondData {
		return readDeployFile(this.deployedDiamondDataFilePath, false); // Never create file during load
	}

	saveDeployedDiamondData(info: DeployedDiamondData): void {
		if (this.writeDeployedDiamondData) {
			writeDeployInfo(this.deployedDiamondDataFilePath, info);
		} else {
			console.log(
				chalk.cyanBright(
					'Skipping write of diamond deployment data. Set writeDeployedDiamondData to true to enable.',
				),
			);
		}
	}

	loadDeployConfig(): DeployConfig {
		return readDeployConfig(this.configFilePath);
	}

	public getDeploymentId(): string {
		return this.deploymentId;
	}
}
