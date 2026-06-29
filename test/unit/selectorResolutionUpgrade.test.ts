import { expect } from 'chai';
import { ethers } from 'ethers';
import { resolveFunctionSelectorRegistry, SelectorRegistry } from '../../src/resolution';
import { NewDeployedFacet, NewDeployedFacets, RegistryFacetCutAction } from '../../src/types';

/**
 * M3-E1 — upgrade-path PROBE. Adversarial deploy→upgrade scenarios against the pure resolver, seeding a
 * prior `Deployed` registry state. M1-E2 already showed the basic same-facet redeploy is GREEN; these
 * cover the cases the `5b2f7af` branch / Remove paths were never verified on. Run + record red/green.
 */

const SEL = ethers.id('fnS()').slice(0, 10);
const ADDR_A = '0xFacetAOld';
const ADDR_A2 = '0xFacetANew';
const ADDR_B = '0xFacetBNew';
const ZERO = ethers.ZeroAddress;

function facet(
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

function seededWith(facetName: string, priority: number, address: string): SelectorRegistry {
	const reg: SelectorRegistry = new Map();
	reg.set(SEL, { facetName, priority, address, action: RegistryFacetCutAction.Deployed });
	return reg;
}

describe('selectorResolution upgrade-path PROBE (M3-E1)', () => {
	it('S-1 include-override-on-upgrade: FacetB deployIncludes a selector Deployed by FacetA → Replace@new', () => {
		const registry = seededWith('FacetA', 50, ADDR_A);
		const newDeployedFacets: NewDeployedFacets = { FacetB: facet(60, ADDR_B, [SEL], ['fnS()']) };
		resolveFunctionSelectorRegistry({ registry, newDeployedFacets, facetNames: ['FacetA', 'FacetB'] });
		const e = registry.get(SEL);
		expect(e?.facetName).to.equal('FacetB');
		expect(e?.address).to.equal(ADDR_B);
		expect(e?.action).to.equal(RegistryFacetCutAction.Replace);
	});

	it('S-2 selector-moves-facets: higher-priority FacetB exposes a selector Deployed by FacetA → Replace@new', () => {
		const registry = seededWith('FacetA', 50, ADDR_A);
		const newDeployedFacets: NewDeployedFacets = { FacetB: facet(40, ADDR_B, [SEL]) };
		resolveFunctionSelectorRegistry({ registry, newDeployedFacets, facetNames: ['FacetA', 'FacetB'] });
		const e = registry.get(SEL);
		expect(e?.facetName).to.equal('FacetB');
		expect(e?.address).to.equal(ADDR_B);
		expect(e?.action).to.equal(RegistryFacetCutAction.Replace);
	});

	it('S-3 exclude-on-upgrade: FacetA redeployed with deployExclude → selector Removed (address ZERO for a valid EIP-2535 cut)', () => {
		const registry = seededWith('FacetA', 50, ADDR_A);
		// FacetA redeployed at a new address, now excluding SEL (abi has SEL but excluded → funcSelectors empty)
		const newDeployedFacets: NewDeployedFacets = { FacetA: facet(50, ADDR_A2, [], [], ['fnS()']) };
		resolveFunctionSelectorRegistry({ registry, newDeployedFacets, facetNames: ['FacetA'] });
		const e = registry.get(SEL);
		expect(e?.action, 'excluded selector should be Removed').to.equal(RegistryFacetCutAction.Remove);
		expect(e?.address, 'a Remove cut must use the zero address (EIP-2535)').to.equal(ZERO);
	});

	it('S-4 facet-deleted: FacetA absent from config on upgrade → selector Removed@ZERO', () => {
		const registry = seededWith('FacetA', 50, ADDR_A);
		const newDeployedFacets: NewDeployedFacets = {};
		resolveFunctionSelectorRegistry({ registry, newDeployedFacets, facetNames: ['FacetB'] });
		const e = registry.get(SEL);
		expect(e?.action).to.equal(RegistryFacetCutAction.Remove);
		expect(e?.address).to.equal(ZERO);
	});
});
