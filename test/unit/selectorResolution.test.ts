import { expect } from 'chai';
import { ethers } from 'ethers';
import {
	computeFacetSelectors,
	resolveFunctionSelectorRegistry,
	SelectorRegistry,
} from '../../src/resolution';
import { NewDeployedFacet, NewDeployedFacets, RegistryFacetCutAction } from '../../src/types';

/**
 * M1-E2 — unit oracle tests for the pure selector-resolution core (`src/resolution`).
 *
 * Chain-free: constructed inputs only, no Hardhat deploy/provider.
 *
 * INTENTIONAL REDs (sanctioned by the plan §6 carve-out — M1 is the TDD-harness milestone):
 *   - `INV-3 additivity …` FAILS at HEAD (deployInclude is a whitelist) → greened in M2.
 *   - the upgrade-path probe is a PROBE — its red/green is recorded, not assumed (greened in M3 if RED).
 * Every other test must PASS.
 */

// Selectors from the frozen oracle (architecture §4).
const SEL_EXCLUDE = ethers.id('testDeployExclude()').slice(0, 10); // 0xdc38f9ab
const SEL_INCLUDE = ethers.id('testDeployInclude()').slice(0, 10); // 0x7f0c610c

// The pure core compares/stores addresses as opaque strings — distinct literals suffice.
const ADDR_EXCLUDE = '0xExcludeFacet';
const ADDR_INCLUDE = '0xIncludeFacet';
const ADDR_OLD = '0xOldAddress';
const ADDR_NEW = '0xNewAddress';

function makeFacet(
	priority: number,
	address: string,
	funcSelectors: string[],
	deployInclude: string[] = [],
	deployExclude: string[] = [],
): NewDeployedFacet {
	return {
		priority,
		address,
		tx_hash: '0x',
		version: 1,
		initFunction: '',
		funcSelectors,
		deployInclude,
		deployExclude,
		verified: false,
	};
}

interface FacetSpec {
	name: string;
	priority: number;
	address: string;
	abiSelectors: string[];
	deployInclude?: string[];
	deployExclude?: string[];
}

/**
 * Mirror the strategy's real flow: apply `computeFacetSelectors` per facet to produce its
 * `funcSelectors`, then run `resolveFunctionSelectorRegistry`. Returns the mutated registry.
 */
function deployAndResolve(specs: FacetSpec[], registry: SelectorRegistry = new Map()): SelectorRegistry {
	const newDeployedFacets: NewDeployedFacets = {};
	for (const s of specs) {
		const include = s.deployInclude ?? [];
		const exclude = s.deployExclude ?? [];
		const funcSelectors = computeFacetSelectors(s.abiSelectors, include, exclude);
		newDeployedFacets[s.name] = makeFacet(s.priority, s.address, funcSelectors, include, exclude);
	}
	resolveFunctionSelectorRegistry({
		registry,
		newDeployedFacets,
		facetNames: specs.map((s) => s.name),
	});
	return registry;
}

describe('selectorResolution (M1-E2 unit oracle tests)', () => {
	it('sanity: oracle selector constants', () => {
		expect(SEL_EXCLUDE).to.equal('0xdc38f9ab');
		expect(SEL_INCLUDE).to.equal('0x7f0c610c');
	});

	describe('computeFacetSelectors', () => {
		it('exclude-only removes the listed selector (green)', () => {
			const out = computeFacetSelectors([SEL_EXCLUDE, SEL_INCLUDE], [], ['testDeployExclude()']);
			expect(out).to.have.members([SEL_INCLUDE]);
			expect(out).to.not.include(SEL_EXCLUDE);
		});

		it('INV-9: a non-existent exclude signature is a no-op (green)', () => {
			const out = computeFacetSelectors([SEL_EXCLUDE, SEL_INCLUDE], [], ['doesNotExist()']);
			expect(out).to.have.members([SEL_EXCLUDE, SEL_INCLUDE]);
		});

		// INV-3 additivity — RED at HEAD: deployInclude is a whitelist that drops the facet's
		// other selectors. The oracle (additive) keeps them. TODO(M2): make deployInclude additive.
		it('INV-3 additivity: deployInclude keeps the facet other selectors [RED -> M2]', () => {
			const out = computeFacetSelectors([SEL_INCLUDE, SEL_EXCLUDE], ['testDeployInclude()'], []);
			// Additive oracle: with no higher-priority competitor, the facet still owns SEL_EXCLUDE.
			expect(out).to.have.members([SEL_INCLUDE, SEL_EXCLUDE]);
		});
	});

	describe('resolveFunctionSelectorRegistry (composed with computeFacetSelectors)', () => {
		it('Fixture A — exclude config: excluded selector is absent; the other is owned (INV-1/6, green)', () => {
			const reg = deployAndResolve([
				{
					name: 'ExampleTestDeployExclude',
					priority: 50,
					address: ADDR_EXCLUDE,
					abiSelectors: [SEL_EXCLUDE, SEL_INCLUDE],
					deployExclude: ['testDeployExclude()'],
				},
			]);
			expect(reg.has(SEL_EXCLUDE), 'excluded selector must be absent (INV-6)').to.equal(false);
			expect(reg.get(SEL_INCLUDE)?.facetName).to.equal('ExampleTestDeployExclude');
		});

		it('Fixture B — include config: a lower-priority deployInclude overrides the higher facet (INV-2, green)', () => {
			const reg = deployAndResolve([
				{
					name: 'ExampleTestDeployExclude',
					priority: 50,
					address: ADDR_EXCLUDE,
					abiSelectors: [SEL_EXCLUDE, SEL_INCLUDE],
				},
				{
					name: 'ExampleTestDeployInclude',
					priority: 60,
					address: ADDR_INCLUDE,
					abiSelectors: [SEL_EXCLUDE, SEL_INCLUDE],
					deployInclude: ['testDeployInclude()'],
				},
			]);
			expect(reg.get(SEL_INCLUDE)?.facetName, 'override').to.equal('ExampleTestDeployInclude');
			expect(reg.get(SEL_EXCLUDE)?.facetName, 'priority').to.equal('ExampleTestDeployExclude');
		});
	});

	describe('upgrade-path probe (INV-4 on the Deployed/different-address path)', () => {
		// PROBE: a facet redeployed at a new address, its selector previously Deployed at the old
		// address. Expected oracle: a Replace at the new address. Red/green RECORDED, not assumed.
		it('redeployed facet -> selector Replaced at the new address [PROBE -> M3 if RED]', () => {
			const registry: SelectorRegistry = new Map();
			registry.set(SEL_INCLUDE, {
				facetName: 'FacetF',
				priority: 50,
				address: ADDR_OLD,
				action: RegistryFacetCutAction.Deployed,
			});
			deployAndResolve(
				[{ name: 'FacetF', priority: 50, address: ADDR_NEW, abiSelectors: [SEL_INCLUDE] }],
				registry,
			);
			const entry = registry.get(SEL_INCLUDE);
			expect(entry?.facetName).to.equal('FacetF');
			expect(entry?.address).to.equal(ADDR_NEW);
			expect(entry?.action).to.equal(RegistryFacetCutAction.Replace);
		});
	});
});
