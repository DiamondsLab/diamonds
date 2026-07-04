#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
// The diamond/ABI-generator modules transitively import `hardhat` at module
// scope, so they (and `hardhat` itself) are imported lazily inside the
// `generate`/`preview` actions. This keeps `validate` and `compare` — which only
// read ABI JSON files — runnable as a plain `node`/`npx` bin with no Hardhat.
import type { Diamond } from '../core/Diamond';
import type { DiamondConfig } from '../types';
import { existsSync } from 'fs';
// NOTE: `hardhat` (and, via its config, the hardhat-ethers plugin) is loaded
// lazily inside `setupDiamondConnection` so commands that don't need a chain
// connection (`validate`, `compare`) run without booting the Hardhat runtime.
// Importing `@nomicfoundation/hardhat-ethers` at module scope would call
// `extendEnvironment` before a Hardhat context exists (HH5), so it is avoided.

// This CLI formats and inspects arbitrary ABI/JSON artifacts and indexes internal
// selector maps, so `any` and dynamic property access are intentional below.
/* eslint-disable @typescript-eslint/no-explicit-any, security/detect-object-injection */

const program = new Command();

// Keep the CLI version in sync with the package version. The relative path
// resolves to the package root from both src/cli (dev) and dist/cli (published).
const { version: pkgVersion } = require('../../package.json');

program
	.name('diamond-abi')
	.description('Diamond ABI generation utilities')
	.version(pkgVersion);

// Generate command
program
	.command('generate')
	.description('Generate ABI for a deployed diamond')
	.option('-d, --diamond <name>', 'Diamond name', 'GeniusDiamond')
	.option('-n, --network <name>', 'Network name', 'localhost')
	.option('-c, --chain-id <id>', 'Chain ID', '31337')
	.option('-o, --output <dir>', 'Output directory (overrides diamond config)', undefined)
	.option('--deployments-path <path>', 'Deployments path', './diamonds')
	.option('--contracts-path <path>', 'Contracts path', './contracts')
	.option('--include-source', 'Include source information in ABI', false)
	.option('--validate-selectors', 'Validate function selector uniqueness', true)
	.option('-v, --verbose', 'Verbose output', false)
	.action(async (options) => {
		try {
			console.log(chalk.blue('🔧 Generating Diamond ABI...'));

			const { generateDiamondAbi } = await import('../utils/diamondAbiGenerator.js');
			const { Diamond } = await import('../core/Diamond.js');
			const { FileDeploymentRepository } = await import(
				'../repositories/FileDeploymentRepository.js'
			);

			const config: DiamondConfig = {
				diamondName: options.diamond,
				networkName: options.network,
				chainId: parseInt(options.chainId),
				deploymentsPath: options.deploymentsPath,
				contractsPath: options.contractsPath,
			};

			if (options.verbose) {
				console.log(chalk.cyan('📋 Configuration:'));
				console.log(chalk.gray(`  Diamond: ${config.diamondName}`));
				console.log(chalk.gray(`  Network: ${config.networkName}`));
				console.log(chalk.gray(`  Chain ID: ${config.chainId}`));
				console.log(chalk.gray(`  Output: ${options.output}`));
			}

			// Create diamond instance
			const repository = new FileDeploymentRepository(config);
			const diamond: Diamond = new Diamond(config, repository);

			// Set provider and signer if available
			await setupDiamondConnection(diamond, options.verbose);

			// Generate ABI using Diamond's configured paths
			const result = await generateDiamondAbi(diamond, {
				outputDir: options.output ?? diamond.getDiamondAbiPath(),
				includeSourceInfo: options.includeSource,
				validateSelectors: options.validateSelectors,
				verbose: options.verbose,
			});

			console.log(chalk.green('\n✅ Diamond ABI generation completed!'));
			displayResults(result, options.verbose);
		} catch (error) {
			console.error(chalk.red('❌ Error generating Diamond ABI:'), error);
			process.exit(1);
		}
	});

// Preview command
program
	.command('preview')
	.description('Preview ABI changes for planned diamond cuts')
	.option('-d, --diamond <name>', 'Diamond name', 'GeniusDiamond')
	.option('-n, --network <name>', 'Network name', 'localhost')
	.option('-c, --chain-id <id>', 'Chain ID', '31337')
	.option('--deployments-path <path>', 'Deployments path', './diamonds')
	.option('--contracts-path <path>', 'Contracts path', './contracts')
	.option('-v, --verbose', 'Verbose output', false)
	.action(async (options) => {
		try {
			console.log(chalk.blue('🔍 Previewing Diamond ABI changes...'));

			const { generateDiamondAbi, previewDiamondAbi } = await import(
				'../utils/diamondAbiGenerator.js'
			);
			const { Diamond } = await import('../core/Diamond.js');
			const { FileDeploymentRepository } = await import(
				'../repositories/FileDeploymentRepository.js'
			);

			const config: DiamondConfig = {
				diamondName: options.diamond,
				networkName: options.network,
				chainId: parseInt(options.chainId),
				deploymentsPath: options.deploymentsPath,
				contractsPath: options.contractsPath,
			};

			const repository = new FileDeploymentRepository(config);
			const diamond: Diamond = new Diamond(config, repository);

			await setupDiamondConnection(diamond, options.verbose);

			// Get current state
			const currentResult = await generateDiamondAbi(diamond, {
				verbose: false,
				includeSourceInfo: false,
			});

			console.log(chalk.cyan('\n📋 Current ABI state:'));
			console.log(chalk.gray(`  Functions: ${currentResult.stats.totalFunctions}`));
			console.log(chalk.gray(`  Events: ${currentResult.stats.totalEvents}`));
			console.log(chalk.gray(`  Facets: ${currentResult.stats.facetCount}`));

			// Check for planned cuts
			const registry = diamond.functionSelectorRegistry;
			const plannedCuts = Array.from(registry.entries())
				.filter(([_, entry]) => entry.action !== 0) // Not deployed
				.map(([selector, entry]) => ({
					facetAddress: entry.address,
					action: entry.action,
					functionSelectors: [selector],
					name: entry.facetName,
				}));

			if (plannedCuts.length === 0) {
				console.log(
					chalk.yellow('\n⚠️  No planned cuts found in function selector registry'),
				);
				console.log(
					chalk.gray('   Use the diamond deployment system to plan upgrades first.'),
				);
				return;
			}

			console.log(chalk.cyan(`\n🔄 Found ${plannedCuts.length} planned cuts:`));
			for (const cut of plannedCuts) {
				const actionName =
					cut.action === 1 ? 'Add' : cut.action === 2 ? 'Remove' : 'Replace';
				console.log(
					chalk.gray(
						`  ${actionName}: ${cut.name} (${cut.functionSelectors.length} selectors)`,
					),
				);
			}

			// Preview with planned cuts
			const previewResult = await previewDiamondAbi(diamond, plannedCuts, {
				verbose: options.verbose,
				includeSourceInfo: false,
			});

			console.log(chalk.green('\n✅ ABI preview completed!'));
			console.log(chalk.blue('\n📊 Preview Results:'));
			console.log(
				chalk.cyan(`  Functions after cuts: ${previewResult.stats.totalFunctions}`),
			);
			console.log(chalk.cyan(`  Events after cuts: ${previewResult.stats.totalEvents}`));
			console.log(chalk.cyan(`  Facets after cuts: ${previewResult.stats.facetCount}`));

			// Show differences
			const functionDiff =
				previewResult.stats.totalFunctions - currentResult.stats.totalFunctions;
			const facetDiff = previewResult.stats.facetCount - currentResult.stats.facetCount;

			if (functionDiff !== 0) {
				const color = functionDiff > 0 ? chalk.green : chalk.red;
				console.log(
					color(`  Function change: ${functionDiff > 0 ? '+' : ''}${functionDiff}`),
				);
			}
			if (facetDiff !== 0) {
				const color = facetDiff > 0 ? chalk.green : chalk.red;
				console.log(color(`  Facet change: ${facetDiff > 0 ? '+' : ''}${facetDiff}`));
			}

			if (options.verbose) {
				console.log(chalk.blue('\n🎯 Planned Function Changes:'));
				displaySelectorChanges(currentResult.selectorMap, previewResult.selectorMap);
			}
		} catch (error) {
			console.error(chalk.red('❌ Error previewing Diamond ABI:'), error);
			process.exit(1);
		}
	});

// Compare command
program
	.command('compare')
	.description('Compare two diamond ABI files')
	.argument('<file1>', 'First ABI file path')
	.argument('<file2>', 'Second ABI file path')
	.option('-v, --verbose', 'Verbose output', false)
	.action(async (file1, file2, options) => {
		try {
			console.log(chalk.blue('🔍 Comparing Diamond ABI files...'));

			if (!existsSync(file1)) {
				throw new Error(`File not found: ${file1}`);
			}
			if (!existsSync(file2)) {
				throw new Error(`File not found: ${file2}`);
			}

			const abi1 = JSON.parse(require('fs').readFileSync(file1, 'utf8'));
			const abi2 = JSON.parse(require('fs').readFileSync(file2, 'utf8'));

			console.log(chalk.cyan(`\n📋 Comparing:`));
			console.log(chalk.gray(`  File 1: ${file1}`));
			console.log(chalk.gray(`  File 2: ${file2}`));

			const result1 = analyzeAbi(abi1);
			const result2 = analyzeAbi(abi2);

			console.log(chalk.blue('\n📊 Comparison Results:'));

			// Function comparison
			const funcDiff = result2.functions - result1.functions;
			console.log(
				chalk.cyan(`Functions: ${result1.functions} → ${result2.functions} `),
				funcDiff === 0
					? chalk.gray('(no change)')
					: funcDiff > 0
						? chalk.green(`(+${funcDiff})`)
						: chalk.red(`(${funcDiff})`),
			);

			// Event comparison
			const eventDiff = result2.events - result1.events;
			console.log(
				chalk.cyan(`Events: ${result1.events} → ${result2.events} `),
				eventDiff === 0
					? chalk.gray('(no change)')
					: eventDiff > 0
						? chalk.green(`(+${eventDiff})`)
						: chalk.red(`(${eventDiff})`),
			);

			// Error comparison
			const errorDiff = result2.errors - result1.errors;
			console.log(
				chalk.cyan(`Errors: ${result1.errors} → ${result2.errors} `),
				errorDiff === 0
					? chalk.gray('(no change)')
					: errorDiff > 0
						? chalk.green(`(+${errorDiff})`)
						: chalk.red(`(${errorDiff})`),
			);

			if (options.verbose && abi1._diamondMetadata && abi2._diamondMetadata) {
				console.log(chalk.blue('\n🔍 Detailed Selector Comparison:'));
				displaySelectorChanges(
					abi1._diamondMetadata.selectorMap ?? {},
					abi2._diamondMetadata.selectorMap ?? {},
				);
			}
		} catch (error) {
			console.error(chalk.red('❌ Error comparing ABI files:'), error);
			process.exit(1);
		}
	});

// Validate command
program
	.command('validate')
	.description('Validate a diamond ABI file')
	.argument('<file>', 'ABI file path')
	.option('-v, --verbose', 'Verbose output', false)
	.action(async (file, options) => {
		try {
			console.log(chalk.blue('🔍 Validating Diamond ABI...'));

			if (!existsSync(file)) {
				throw new Error(`File not found: ${file}`);
			}

			const artifact = JSON.parse(require('fs').readFileSync(file, 'utf8'));

			// Basic structure validation
			const hasRequiredFields = artifact.abi && artifact.contractName;
			if (!hasRequiredFields) {
				throw new Error('Invalid artifact: missing required fields (abi, contractName)');
			}

			// ABI validation with ethers
			const { Interface } = await import('ethers');
			let ethersInterface: InstanceType<typeof Interface>;
			try {
				ethersInterface = new Interface(artifact.abi);
			} catch (error) {
				throw new Error(`Invalid ABI: ${error}`);
			}

			const analysis = analyzeAbi(artifact);

			console.log(chalk.green('✅ ABI validation passed!'));
			console.log(chalk.blue('\n📊 ABI Analysis:'));
			console.log(chalk.cyan(`  Functions: ${analysis.functions}`));
			console.log(chalk.cyan(`  Events: ${analysis.events}`));
			console.log(chalk.cyan(`  Errors: ${analysis.errors}`));
			console.log(chalk.cyan(`  Total fragments: ${ethersInterface.fragments.length}`));

			if (artifact._diamondMetadata) {
				const metadata = artifact._diamondMetadata;
				console.log(chalk.blue('\n💎 Diamond Metadata:'));
				console.log(chalk.cyan(`  Diamond: ${metadata.diamondName}`));
				console.log(chalk.cyan(`  Network: ${metadata.networkName}`));
				console.log(chalk.cyan(`  Chain ID: ${metadata.chainId}`));
				console.log(chalk.cyan(`  Generated: ${metadata.generatedAt}`));

				if (metadata.selectorMap) {
					const selectorCount = Object.keys(metadata.selectorMap).length;
					const facetCount = new Set(Object.values(metadata.selectorMap)).size;
					console.log(chalk.cyan(`  Function selectors: ${selectorCount}`));
					console.log(chalk.cyan(`  Facets: ${facetCount}`));
				}
			}

			if (options.verbose) {
				console.log(chalk.blue('\n🔍 Function Signatures:'));
				ethersInterface.fragments
					.filter((f) => f.type === 'function')
					.slice(0, 10) // Show first 10
					.forEach((f) => {
						console.log(chalk.gray(`  ${f.format()}`));
					});

				if (
					ethersInterface.fragments.filter((f) => f.type === 'function').length > 10
				) {
					console.log(
						chalk.gray(
							`  ... and ${ethersInterface.fragments.filter((f) => f.type === 'function').length - 10} more`,
						),
					);
				}
			}
		} catch (error) {
			console.error(chalk.red('❌ ABI validation failed:'), error);
			process.exit(1);
		}
	});

// Helper functions
async function setupDiamondConnection(diamond: Diamond, verbose: boolean): Promise<void> {
	try {
		// Typed as `any`: the `hre.ethers` helper is added at runtime by the
		// hardhat-ethers plugin (loaded via the project's hardhat config).
		// nosemgrep: typescript-any-usage -- hre.ethers is injected at runtime by hardhat-ethers (see note above)
		const hre: any = (await import('hardhat')).default;
		diamond.setProvider(hre.ethers.provider);
		const signers = await hre.ethers.getSigners();
		if (signers.length > 0) {
			diamond.setSigner(signers[0]);
		}

		if (verbose) {
			console.log(chalk.gray('✅ Connected to Hardhat provider'));
		}
	} catch (error) {
		if (verbose) {
			console.log(
				chalk.yellow('⚠️  Could not connect to provider (running in standalone mode)'),
			);
		}
	}
}

// nosemgrep: typescript-any-usage -- dynamic ABI-generation result (arbitrary stats/selectorMap shape)
function displayResults(result: any, verbose: boolean): void {
	console.log(chalk.blue('\n📊 Generation Results:'));
	console.log(chalk.cyan(`  Functions: ${result.stats.totalFunctions}`));
	console.log(chalk.cyan(`  Events: ${result.stats.totalEvents}`));
	console.log(chalk.cyan(`  Errors: ${result.stats.totalErrors}`));
	console.log(chalk.cyan(`  Facets: ${result.stats.facetCount}`));

	if (result.outputPath) {
		console.log(chalk.cyan(`  Output: ${result.outputPath}`));
	}

	if (result.stats.duplicateSelectorsSkipped > 0) {
		console.log(
			chalk.yellow(`  Duplicates skipped: ${result.stats.duplicateSelectorsSkipped}`),
		);
	}

	if (verbose && result.selectorMap) {
		console.log(chalk.blue('\n🎯 Function Selector Mapping:'));
		const sortedSelectors = Object.entries(result.selectorMap).sort(([, a], [, b]) =>
			(a as string).localeCompare(b as string),
		);
		sortedSelectors.slice(0, 20).forEach(([selector, facet]) => {
			console.log(chalk.gray(`  ${selector} → ${facet}`));
		});

		if (sortedSelectors.length > 20) {
			console.log(chalk.gray(`  ... and ${sortedSelectors.length - 20} more`));
		}
	}
}

function displaySelectorChanges(
	oldMap: Record<string, string>,
	newMap: Record<string, string>,
): void {
	const oldSelectors = new Set(Object.keys(oldMap));
	const newSelectors = new Set(Object.keys(newMap));

	const added = Array.from(newSelectors).filter((s) => !oldSelectors.has(s));
	const removed = Array.from(oldSelectors).filter((s) => !newSelectors.has(s));
	const changed = Array.from(oldSelectors).filter(
		(s) => newSelectors.has(s) && oldMap[s] !== newMap[s],
	);

	if (added.length > 0) {
		console.log(chalk.green(`\n  ➕ Added (${added.length}):`));
		added.slice(0, 10).forEach((selector) => {
			console.log(chalk.gray(`    ${selector} → ${newMap[selector]}`));
		});
		if (added.length > 10) {
			console.log(chalk.gray(`    ... and ${added.length - 10} more`));
		}
	}

	if (removed.length > 0) {
		console.log(chalk.red(`\n  ➖ Removed (${removed.length}):`));
		removed.slice(0, 10).forEach((selector) => {
			console.log(chalk.gray(`    ${selector} → ${oldMap[selector]}`));
		});
		if (removed.length > 10) {
			console.log(chalk.gray(`    ... and ${removed.length - 10} more`));
		}
	}

	if (changed.length > 0) {
		console.log(chalk.yellow(`\n  🔄 Changed (${changed.length}):`));
		changed.slice(0, 10).forEach((selector) => {
			console.log(chalk.gray(`    ${selector}: ${oldMap[selector]} → ${newMap[selector]}`));
		});
		if (changed.length > 10) {
			console.log(chalk.gray(`    ... and ${changed.length - 10} more`));
		}
	}

	if (added.length === 0 && removed.length === 0 && changed.length === 0) {
		console.log(chalk.gray('  No selector changes detected'));
	}
}

function analyzeAbi(artifact: { abi?: { type: string }[] }): { functions: number; events: number; errors: number } {
	const abi = artifact.abi ?? [];
	return {
		functions: abi.filter((item) => item.type === 'function').length,
		events: abi.filter((item) => item.type === 'event').length,
		errors: abi.filter((item) => item.type === 'error').length,
	};
}

// Parse command line arguments
program.parse();

export {};
