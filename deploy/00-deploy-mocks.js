const { network } = require("hardhat")
const { developmentNetworks } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // decimals and initial answer are args for AggregatorV3 constructor
    const DECIMALS = 8
    const INITIAL_ANSWER = 100000000000

    if (developmentNetworks.includes(network.name)) {
        // log is same as console.log
        log("Deploying Mocks...")
        const mocks = await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        })
        log("_______________________________________________________")
    }
}

module.exports.tags = ["all", "mocks"]
