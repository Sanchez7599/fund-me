require("@nomiclabs/hardhat-waffle")
require("dotenv").config()
// install hardhat-deploy in two steps:
// 1. yarn add --dev hardhat-deploy
// 2. yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
require("hardhat-deploy")
require("solidity-coverage")
// to get a gas report just run yarn hardhat test
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")

const GOERLI_URL = process.env.GOERLI_URL || "http://eth-goerli"
const GOERLI_ACCOUNT = process.env.GOERLI_ACCOUNT || "key"
const ETHERSCAN_API = process.env.ETHERSCAN_API || "key"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_URL,
            accounts: [GOERLI_ACCOUNT],
            chainId: 5,
            blockConfirmations: 6,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API,
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "usd",
        //coinmarketcap: COINMARKETCAP_API,
    },
}
