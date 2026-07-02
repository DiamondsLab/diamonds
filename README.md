# Diamonds Module

[![npm version](https://badge.fury.io/js/@diamondslab%2Fdiamonds.svg)](https://www.npmjs.com/package/@diamondslab/diamonds)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19+-orange.svg)](https://hardhat.org/)

`@diamondslab/diamonds` is a TypeScript framework for deploying, upgrading, and
managing [ERC-2535 Diamond Proxy](https://eips.ethereum.org/EIPS/eip-2535)
contracts. It provides a pluggable deployment-strategy system, automatic function
selector management, configuration-driven facet versioning, and ABI tooling.

> **Package manager:** this project uses **Yarn 4** (`packageManager: yarn@4.x`).
> The examples below use `yarn`. npm/pnpm work for consuming the published package
> but the repo scripts assume Yarn.

## ✨ Key Features

### 🏗️ Complete Diamond Implementation

- Full ERC-2535 Diamond Proxy Standard support
- Modular facet architecture with automated function selector management
- Selector collision detection and resolution
- State management and validation

### 🔄 Deployment Management

- **Strategy Pattern**: pluggable deployment strategies (Local, RPC, Base, Defender)
- **Version Control**: configuration-driven versioning for facets and protocols
- **Upgrade Automation**: `DiamondDeployer` detects an existing deployment and
  performs an upgrade instead of a fresh deploy
- **Post-deployment Callbacks**: run custom initialization after a cut

### 🏭 Production Ready

- **Repository Pattern**: pluggable persistence (file-based out of the box)
- **Configuration Management**: JSON configuration with Zod validation
- **ABI Tooling**: combined Diamond ABI generation, preview, compare, and validate
- **Comprehensive Testing**: unit and integration test suites

## 🚀 Quick Start

### Installation

```bash
yarn add @diamondslab/diamonds
# peer deps (if not already present)
yarn add --dev hardhat @nomicfoundation/hardhat-ethers ethers
```

### Basic Usage

Everything is exported from the package root (`@diamondslab/diamonds`):

```typescript
import {
  Diamond,
  DiamondDeployer,
  FileDeploymentRepository,
  LocalDeploymentStrategy,
} from "@diamondslab/diamonds";
import { ethers } from "hardhat";

// Diamond configuration
const config = {
  diamondName: "MyDiamond",
  networkName: "localhost",
  chainId: 31337,
  deploymentsPath: "./diamonds",
  contractsPath: "./contracts",
};

// Set up diamond + deployment components
const repository = new FileDeploymentRepository(config);
const diamond = new Diamond(config, repository);

// Provide a provider and signer
diamond.setProvider(ethers.provider);
const [signer] = await ethers.getSigners();
diamond.setSigner(signer);

// Deploy using the local strategy (verbose logging on)
const strategy = new LocalDeploymentStrategy(true);
const deployer = new DiamondDeployer(diamond, strategy);

// Deploys if new, upgrades if already deployed
await deployer.deployDiamond();
```

## 📋 Project Structure

```text
src/
├── core/                      # Core classes
│   ├── Diamond.ts             # Diamond state + selector registry
│   ├── DiamondDeployer.ts     # Deploy/upgrade orchestration
│   ├── DeploymentManager.ts   # Deployment lifecycle
│   └── CallbackManager.ts     # Post-deployment callbacks
├── strategies/                # Deployment strategies
│   ├── DeploymentStrategy.ts  # Strategy interface
│   ├── BaseDeploymentStrategy.ts
│   ├── LocalDeploymentStrategy.ts
│   ├── RPCDeploymentStrategy.ts
│   └── OZDefenderDeploymentStrategy.ts   # legacy (see note below)
├── repositories/              # Data persistence
│   ├── DeploymentRepository.ts
│   ├── FileDeploymentRepository.ts
│   └── jsonFileHandler.ts
├── schemas/                   # Zod validation schemas
├── types/                     # TypeScript definitions
├── utils/                     # Utilities (ABI generation, loupe, selectors, …)
└── cli/                       # `diamond-abi` CLI
```

## 🔧 Configuration

### Diamond Configuration

Create a diamond configuration file (e.g. `myDiamond.config.json`):

```json
{
  "protocolVersion": 1.0,
  "protocolInitFacet": "MyProtocolFacet",
  "facets": {
    "DiamondCutFacet": {
      "priority": 10,
      "versions": { "1.0": {} }
    },
    "DiamondLoupeFacet": {
      "priority": 20,
      "versions": { "1.0": {} }
    },
    "MyCustomFacet": {
      "priority": 30,
      "versions": {
        "1.0": {
          "deployInit": "initialize()",
          "upgradeInit": "upgradeToV1()",
          "callbacks": ["postDeployCallback"],
          "deployInclude": ["0x12345678"],
          "deployExclude": ["0x87654321"]
        }
      }
    }
  }
}
```

### Environment Configuration

```bash
# Network Configuration
NETWORK_NAME=sepolia
CHAIN_ID=11155111
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# OpenZeppelin Defender (only for the legacy Defender strategy)
DEFENDER_API_KEY=your_api_key
DEFENDER_API_SECRET=your_api_secret
DEFENDER_RELAYER_ADDRESS=0x...
DEFENDER_SAFE_ADDRESS=0x...

# Deployment Options
VERBOSE_DEPLOYMENT=true
```

## 🔄 Deployment Strategies

All strategies extend `BaseDeploymentStrategy` and accept an optional `verbose`
flag. Pass a strategy instance to `DiamondDeployer`.

### Local Strategy

For development and testing against a local/forked node:

```typescript
import { LocalDeploymentStrategy } from "@diamondslab/diamonds";

const strategy = new LocalDeploymentStrategy(true); // verbose
```

### RPC Strategy

For deploying through a configured RPC endpoint / signer:

```typescript
import { RPCDeploymentStrategy } from "@diamondslab/diamonds";

const strategy =
  new RPCDeploymentStrategy(/* see RPCDeploymentStrategy options */);
```

### Custom Strategy

Implement your own by extending `BaseDeploymentStrategy` and overriding the
protected task hooks:

```typescript
import { BaseDeploymentStrategy, Diamond } from "@diamondslab/diamonds";

export class CustomDeploymentStrategy extends BaseDeploymentStrategy {
  protected async deployDiamondTasks(diamond: Diamond): Promise<void> {
    // Custom deployment logic
  }

  protected async performDiamondCutTasks(diamond: Diamond): Promise<void> {
    // Custom diamond cut logic
  }
}
```

### OpenZeppelin Defender Strategy (legacy)

> ⚠️ **Deprecated / legacy.** `OZDefenderDeploymentStrategy` is being phased out
> and is not recommended for new work. It remains exported for backward
> compatibility. Prefer `LocalDeploymentStrategy` / `RPCDeploymentStrategy` or a
> custom strategy.

```typescript
import { OZDefenderDeploymentStrategy } from "@diamondslab/diamonds";

const strategy = new OZDefenderDeploymentStrategy(
  process.env.DEFENDER_API_KEY!,
  process.env.DEFENDER_API_SECRET!,
  process.env.DEFENDER_RELAYER_ADDRESS!,
  false, // auto-approve
  process.env.DEFENDER_SAFE_ADDRESS!,
  "Safe",
);
```

## 📊 Advanced Features

### Version Management

Facets are versioned in the configuration; upgrades declare which prior versions
they apply from:

```json
{
  "facets": {
    "MyFacet": {
      "priority": 100,
      "versions": {
        "1.0": { "deployInit": "initialize()", "upgradeInit": "upgradeToV1()" },
        "2.0": {
          "deployInit": "initialize()",
          "upgradeInit": "upgradeToV2()",
          "fromVersions": [1.0]
        }
      }
    }
  }
}
```

### Function Selector Management

Automatic selector management with collision detection:

- **Priority-based resolution**: higher-priority facets take precedence
- **Include/Exclude lists**: fine-grained selector control (`deployInclude` / `deployExclude`)
- **Collision detection**: automatic detection and resolution of selector conflicts
- **Orphaned selector prevention**: validation guards against bad cuts

### Post-Deployment Callbacks

```typescript
// In your callbacks directory
export async function postDeployCallback(args: CallbackArgs) {
  const { diamond } = args;
  console.log(`Post-deployment callback for ${diamond.diamondName}`);
  // Custom post-deployment logic
}
```

## 💎 Diamond ABI Tooling

This package ships a `diamond-abi` CLI for working with the combined Diamond ABI.

```bash
# Generate the combined ABI for a deployed diamond (requires a Hardhat project)
npx diamond-abi generate --diamond MyDiamond --network localhost

# Preview the ABI changes implied by planned cuts (requires a Hardhat project)
npx diamond-abi preview --diamond MyDiamond --verbose

# Compare two ABI files (no chain / Hardhat needed)
npx diamond-abi compare old-abi.json new-abi.json

# Validate an ABI artifact file (no chain / Hardhat needed)
npx diamond-abi validate diamond-abi.json
```

> `generate` and `preview` connect to a chain and load your project's Hardhat
> config (run them inside a Hardhat project). `compare` and `validate` operate on
> ABI JSON files and run standalone. Run `npx diamond-abi <command> --help` for
> all options.

The same combined ABI can also be produced programmatically via
`generateDiamondAbi` / `previewDiamondAbi` from `@diamondslab/diamonds`.

## 📖 Examples

### Basic Diamond Deployment

```typescript
import {
  Diamond,
  DiamondDeployer,
  FileDeploymentRepository,
  LocalDeploymentStrategy,
} from "@diamondslab/diamonds";
import { ethers } from "hardhat";

async function deployBasicDiamond() {
  const config = {
    diamondName: "BasicDiamond",
    networkName: "localhost",
    chainId: 31337,
    deploymentsPath: "./diamonds",
    contractsPath: "./contracts",
  };

  const repository = new FileDeploymentRepository(config);
  const diamond = new Diamond(config, repository);

  diamond.setProvider(ethers.provider);
  const [signer] = await ethers.getSigners();
  diamond.setSigner(signer);

  const strategy = new LocalDeploymentStrategy();
  const deployer = new DiamondDeployer(diamond, strategy);

  await deployer.deployDiamond();
  console.log("Diamond deployed successfully!");
}
```

### Multi-Facet Upgrade

```typescript
async function performUpgrade(diamond: Diamond) {
  // Update configuration for the new version
  const config = diamond.repository.loadDeployConfig();
  config.protocolVersion = 2.0;

  // Add a new facet
  config.facets.NewFeatureFacet = {
    priority: 150,
    versions: {
      "2.0": { deployInit: "initialize()", callbacks: ["setupNewFeature"] },
    },
  };

  // Upgrade an existing facet
  config.facets.ExistingFacet.versions["2.0"] = {
    upgradeInit: "upgradeToV2()",
    fromVersions: [1.0],
  };

  diamond.repository.saveDeployConfig(config);

  // DiamondDeployer detects the existing deployment and performs the upgrade
  const deployer = new DiamondDeployer(diamond, new LocalDeploymentStrategy());
  await deployer.deployDiamond();
}
```

## 🔍 Monitoring and Debugging

### Inspect Function Selectors

```typescript
import { getSighash } from "@diamondslab/diamonds";

const selector = getSighash("transfer(address,uint256)");
console.log("Selector:", selector);

console.log("Registered:", diamond.isFunctionSelectorRegistered(selector));
```

### Compare On-Chain vs. Local State

```typescript
import { diffDeployedFacets } from "@diamondslab/diamonds";
import { ethers } from "hardhat";

const deployedData = diamond.getDeployedDiamondData();
console.log("Diamond address:", deployedData.DiamondAddress);
console.log("Deployed facets:", Object.keys(deployedData.DeployedFacets ?? {}));

// Returns true when on-chain facets match the local deployment record
const isConsistent = await diffDeployedFacets(
  deployedData,
  ethers.provider,
  true,
);
```

## 🧪 Testing & Development

Run from the package directory:

```bash
yarn install          # install dependencies (Yarn 4)
yarn build            # compile TypeScript to dist/
yarn test             # run the Hardhat test suite
yarn test:unit        # unit tests only
yarn test:integration # integration tests only
yarn test:coverage    # tests with coverage
yarn lint             # lint
```

## 🔐 Security Considerations

1. **Use multi-signature wallets** for mainnet deployments.
2. **Test upgrades on a testnet/fork first.**
3. **Verify contracts** on the relevant block explorer.
4. **Apply role-based access control** to privileged diamond functions.
5. **Never commit secrets** — deployment records may contain addresses/keys and are gitignored.

## 🤝 Contributing

Contributions are welcome. Please open an issue or pull request on
[GitHub](https://github.com/DiamondsLab/diamonds).

```bash
git clone https://github.com/DiamondsLab/diamonds.git
cd diamonds
yarn install
yarn test
yarn build
yarn lint
```

### Coding Standards

- Follow the existing TypeScript style
- Use Conventional Commits
- Add tests for new functionality
- Update documentation for new features

## 📄 License

MIT — see the [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- [ERC-2535 Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535) authors
- [Hardhat](https://hardhat.org/) development framework
- [OpenZeppelin](https://openzeppelin.com/) for security tooling
- The Ethereum community

## 📞 Support

- **Documentation**: see the [`docs/`](docs/) directory
- **Issues**: [github.com/DiamondsLab/diamonds/issues](https://github.com/DiamondsLab/diamonds/issues)

---

**Built with ❤️ for the Ethereum ecosystem by [DiamondsLab](https://github.com/DiamondsLab)**
