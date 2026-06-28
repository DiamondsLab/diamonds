import { ethers } from 'ethers';
import {
	FunctionSelectorRegistryEntry,
	NewDeployedFacets,
	RegistryFacetCutAction,
} from '../types';

/**
 * Pure selector-resolution core for ERC-2535 diamond deployments.
 *
 * Extracted from `BaseDeploymentStrategy` (M1-E1) so the resolution semantics can be
 * unit-tested without a chain and later promoted into the shared core used by both the
 * deployment strategy and the planned pre-launch config validator.
 *
 * IMPORTANT (behavior-preserving): this module is a **verbatim** lift of the existing
 * logic. It deliberately keeps:
 *   - the deploy-time `deployInclude` **whitelist** (drops a facet's other selectors) —
 *     M2 makes this additive (INV-3);
 *   - the inverted/dead `registryHigherPrioritySplit` (`entry.priority > priority`) —
 *     M3 removes it;
 *   - the `5b2f7af` `Replace`-instead-of-`Add` branch — M3 reconciles it.
 * Do not "fix" anything here; those changes belong to M2/M3 against this seam.
 *
 * The module takes NO Hardhat/provider dependency (only `ethers` for selector math).
 */

/** Map<functionSelector, registry entry>. Mirrors `Diamond.functionSelectorRegistry`. */
export type SelectorRegistry = Map<string, FunctionSelectorRegistryEntry>;

/**
 * Reserved for M3 upgrade/redeploy reconciliation. Today, prior deployed state is carried
 * by the pre-populated `registry` (entries whose action is `Deployed`). Shape aligned to
 * `DeployedDiamondData.DeployedFacets` to minimise adapter code when M3 wires it in.
 */
export type PriorDeployedState = Record<
	string,
	{ address?: string; funcSelectors?: string[]; version?: number }
>;

/**
 * Apply a facet's `deployExclude` (removal) then `deployInclude` (whitelist) to its raw
 * ABI selectors. Pure — extracted verbatim from `BaseDeploymentStrategy.deployFacetsTasks`.
 *
 * NOTE (M1-E1): `deployInclude` acts as a WHITELIST here (drops the facet's other
 * selectors). M2 makes this additive (INV-3). Do not change here.
 *
 * @param facetSelectors the facet's raw ABI function selectors (4-byte, `0x…`)
 * @param deployInclude  function signatures to whitelist (e.g. `"foo()"`)
 * @param deployExclude  function signatures to remove
 * @returns the resolved selector list (a new array; the input is not mutated)
 */
export function computeFacetSelectors(
	facetSelectors: string[],
	deployInclude: string[],
	deployExclude: string[],
): string[] {
	const result = [...facetSelectors];

	// Apply deployExclude filter to remove selectors before storing
	for (const excludeSelector of deployExclude) {
		const selectorToExclude = ethers.id(excludeSelector).slice(0, 10);
		const index = result.indexOf(selectorToExclude);
		if (index !== -1) {
			result.splice(index, 1);
		}
	}

	// Apply deployInclude filter to only include specified selectors
	if (deployInclude.length > 0) {
		// Convert include signatures to selectors
		const includeSelectors = deployInclude.map((sig) => ethers.id(sig).slice(0, 10));
		// Filter facetSelectors to only include the specified ones
		return result.filter((selector) => includeSelectors.includes(selector));
	}

	return result;
}

export interface ResolveRegistryArgs {
	/** The selector registry to resolve into. Mutated IN PLACE (same contract as before). */
	registry: SelectorRegistry;
	/** The newly-deployed facets (with addresses, priorities, include/exclude, funcSelectors). */
	newDeployedFacets: NewDeployedFacets;
	/** All facet names currently in the deploy config (used to Remove deleted facets). */
	facetNames: string[];
	/**
	 * Reserved for M3 upgrade/redeploy reconciliation. Unused today — prior deployed state
	 * is carried by the pre-populated `registry` (entries with action `Deployed`).
	 */
	priorDeployedState?: PriorDeployedState;
}

/**
 * Resolve ownership of every function selector across the newly-deployed facets and write
 * the result (`Add`/`Replace`/`Remove`/`Deployed` actions) into `registry` **in place**.
 * Pure — no Hardhat/provider. Extracted verbatim from
 * `BaseDeploymentStrategy.updateFunctionSelectorRegistryTasks`.
 */
export function resolveFunctionSelectorRegistry(args: ResolveRegistryArgs): void {
	const { registry, newDeployedFacets, facetNames } = args;
	const zeroAddress = ethers.ZeroAddress;

	const newDeployedFacetsByPriority = Object.entries(newDeployedFacets).sort(
		([, a], [, b]) => (a.priority || 1000) - (b.priority || 1000),
	);

	for (const [newFacetName, newFacetData] of newDeployedFacetsByPriority) {
		const currentFacetAddress = newFacetData.address;
		const priority: number = newFacetData.priority;
		const includeFuncSelectors: string[] = newFacetData.deployInclude || [];
		const excludeFuncSelectors: string[] = newFacetData.deployExclude || [];

		// Convert function signatures to selectors
		const includeFuncSelectorsAsSelectors = includeFuncSelectors.map((sig) =>
			ethers.id(sig).slice(0, 10),
		);
		const excludeFuncSelectorsAsSelectors = excludeFuncSelectors.map((sig) =>
			ethers.id(sig).slice(0, 10),
		);

		// Initialize funcSelectors if not present
		if (!newFacetData.funcSelectors) {
			newFacetData.funcSelectors = [];
		}
		const functionSelectors: string[] = newFacetData.funcSelectors;

		/* ------------------ Exclusion Filter ------------------ */
		for (const excludeFuncSelector of excludeFuncSelectorsAsSelectors) {
			// remove from the facets functionSelectors
			if (functionSelectors.includes(excludeFuncSelector)) {
				functionSelectors.splice(functionSelectors.indexOf(excludeFuncSelector), 1);
			}
			// update action to remove if excluded from registry where a previous deployment associated with facetname
			if (
				registry.has(excludeFuncSelector) &&
				registry.get(excludeFuncSelector)?.facetName === newFacetName
			) {
				const existing = registry.get(excludeFuncSelector);
				if (existing?.facetName === newFacetName) {
					registry.set(excludeFuncSelector, {
						priority: priority,
						address: currentFacetAddress,
						action: RegistryFacetCutAction.Remove,
						facetName: newFacetName,
					});
				}
			}
		}

		/* ------------ Higher Priority Split of Registry ------------------ */
		const registryHigherPrioritySplit = Array.from(registry.entries())
			.filter(([_, entry]) => entry.priority > priority)
			.reduce(
				(acc, [selector, entry]) => {
					if (!acc[entry.facetName]) {
						acc[entry.facetName] = [];
					}
					acc[entry.facetName].push(selector);
					return acc;
				},
				{} as Record<string, string[]>,
			);

		/* ------------------ Inclusion Override Filter ------------------ */
		for (const includeFuncSelector of includeFuncSelectorsAsSelectors) {
			// Force Replace if already registered by higher priority facet
			const higherPriorityFacet = Object.keys(registryHigherPrioritySplit).find(
				(facetName) => {
					return registryHigherPrioritySplit[facetName].includes(includeFuncSelector);
				},
			);
			const existingEntry = registry.get(includeFuncSelector);
			if (higherPriorityFacet) {
				registry.set(includeFuncSelector, {
					priority: priority,
					address: currentFacetAddress,
					action: RegistryFacetCutAction.Replace,
					facetName: newFacetName,
				});
			} else if (
				existingEntry?.address &&
				existingEntry.address !== currentFacetAddress &&
				existingEntry.action !== RegistryFacetCutAction.Add
			) {
				// Selector is already registered/deployed at a different facet address
				// (a selector moved between facets, or a redeployed facet at a new
				// address). Reconcile against that on-chain/registered state -> Replace,
				// not Add (which would revert: "Can't add function that already exists").
				registry.set(includeFuncSelector, {
					priority: priority,
					address: currentFacetAddress,
					action: RegistryFacetCutAction.Replace,
					facetName: newFacetName,
				});
			} else {
				// Add to the registry
				registry.set(includeFuncSelector, {
					priority: priority,
					address: currentFacetAddress,
					action: RegistryFacetCutAction.Add,
					facetName: newFacetName,
				});
			}

			// remove from the funcSels so it is not modified in Priority Resolution Pass
			const existing = newDeployedFacets[newFacetName];
			if (
				existing &&
				existing.funcSelectors &&
				existing.funcSelectors.includes(includeFuncSelector)
			) {
				existing.funcSelectors.splice(
					existing.funcSelectors.indexOf(includeFuncSelector),
					1,
				);
			}
		}

		/* ------------------ Replace Facet and Priority Resolution Pass ------------- */
		for (const selector of functionSelectors) {
			const existing = registry.get(selector);
			if (existing) {
				const existingPriority = existing.priority;

				if (existing.facetName === newFacetName) {
					// Same facet, update the address
					registry.set(selector, {
						priority: priority,
						address: currentFacetAddress,
						action: RegistryFacetCutAction.Replace,
						facetName: newFacetName,
					});
				} else if (priority < existingPriority) {
					// Current facet has higher priority, Replace it
					registry.set(selector, {
						priority: priority,
						address: currentFacetAddress,
						action: RegistryFacetCutAction.Replace,
						facetName: newFacetName,
					});
				}
			} else {
				// New selector, simply add
				registry.set(selector, {
					priority: priority,
					address: currentFacetAddress,
					action: RegistryFacetCutAction.Add,
					facetName: newFacetName,
				});
			}
		}

		/* ---------------- Remove Old Function Selectors from facets -------------- */
		// Set functionselectors with the newFacetName and still different address to Remove
		for (const [selector, entry] of registry.entries()) {
			if (entry.facetName === newFacetName && entry.address !== currentFacetAddress) {
				registry.set(selector, {
					priority: entry.priority,
					address: zeroAddress,
					action: RegistryFacetCutAction.Remove,
					facetName: newFacetName,
				});
			}
		}
	}

	// `Remove` function selectors for facets no longer in config (deleted facets)
	for (const [selector, entry] of registry.entries()) {
		if (!facetNames.includes(entry.facetName)) {
			registry.set(selector, {
				priority: entry.priority,
				address: zeroAddress,
				action: RegistryFacetCutAction.Remove,
				facetName: entry.facetName,
			});
		}
	}
}
