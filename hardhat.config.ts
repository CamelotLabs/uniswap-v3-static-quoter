import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-abi-exporter";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

dotenv.config();

function getExplorerApiKey() {
    const networkNameForEnvKey: any = {
        "arbitrum": "ARBISCAN_API_KEY",
    }
    const [ networkName ] = process.argv.flatMap((e, i, a) => e == '--network' ? [ a[i+1] ] : [])
    const envKey = networkNameForEnvKey[networkName]
    if (envKey)
        return process.env[envKey]
}

const ARBITRUM_RPC = process.env.ARBITRUM_RPC ?? "";
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS as string;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY as string;
const ETHERSCAN_API_KEY = getExplorerApiKey();

const arbitrumConfig = {
    url: ARBITRUM_RPC,
    chainId: 42161,
    live: true,
    saveDeployments: true,
    accounts: [] as string[]
};

if (DEPLOYER_PRIVATE_KEY) {
    arbitrumConfig.accounts.push(DEPLOYER_PRIVATE_KEY);
}

const config: HardhatUserConfig = {
    solidity: {
        version: "0.7.6",
        settings: {
            evmVersion: 'istanbul',
            optimizer: {
                enabled: true,
                runs: 1_000_000,
            },
            metadata: {
                bytecodeHash: 'none',
            },
        },
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            live: false,
            saveDeployments: false,
        },
        arbitrum: arbitrumConfig,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            42161: DEPLOYER_ADDRESS
        }
    },
    abiExporter: {
        path: './abis',
        clear: true,
        flat: true,
        only: [':UniswapV3StaticQuoter']
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
        customChains: [{
            network: "arbitrum",
            chainId: 42161,
            urls: {
                apiURL: "https://api.arbiscan.io/api",
                browserURL: "https://arbiscan.io"
            }
        }]
    },
    mocha: {
        timeout: 600000000
    }
};

export default config;
