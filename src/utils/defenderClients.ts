// src/utils/defenderClients.ts
//
// Client singletons for the (deprecated) OpenZeppelin Defender deployment path.
// This module is re-exported by the package barrel (utils/index), so importing ANY
// part of @diamondslab/diamonds loads it. It must therefore never crash a consumer
// that doesn't use Defender:
//   - the .env load is guarded (a consumer need not have a .env file), and
//   - the @openzeppelin/defender-sdk packages are lazily required only when Defender
//     credentials are actually present (they are optional/dev-only, not a hard
//     runtime dependency of this package).
// Without credentials the clients are null, exactly as before.

// Optional: load environment variables from a local .env if one exists. Never throw.
try {
  process.loadEnvFile('.env');
} catch {
  /* .env is optional — absent in library consumers and CI */
}

const { DEFENDER_API_KEY, DEFENDER_API_SECRET } = process.env;

function createDefenderClients(): { adminClient: unknown; deployClient: unknown } {
  if (!DEFENDER_API_KEY || !DEFENDER_API_SECRET) {
    console.warn(
      'Warning: Missing Defender credentials in environment. Some functionality will be limited.',
    );
    return { adminClient: null, deployClient: null };
  }
  // Lazily require the deprecated Defender SDK so it is not a hard dependency for
  // consumers that never use the OZDefender strategy.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Defender } = require('@openzeppelin/defender-sdk');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { DeployClient } = require('@openzeppelin/defender-sdk-deploy-client');
  return {
    adminClient: new Defender({ apiKey: DEFENDER_API_KEY, apiSecret: DEFENDER_API_SECRET }),
    deployClient: new DeployClient({ apiKey: DEFENDER_API_KEY, apiSecret: DEFENDER_API_SECRET }),
  };
}

const { adminClient, deployClient } = createDefenderClients();

export { adminClient, deployClient };
