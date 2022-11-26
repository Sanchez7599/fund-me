const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", function () {
    let fundMe, deployer, mockV3Aggregator
    const smallAmount = 1
    const bigAmount = ethers.utils.parseEther("0.05")
    beforeEach(async function () {
        //before any "it" I want to deploy contract
        //deployments has this "fixture" function that runs through "all" scripts in the deploy folder

        // const accounts = await ethers.getSigners()  ->  This is another way to get accounts
        // const accountZeo = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("Constructor", function () {
        it("sets priceFeed address correctly", async function () {
            const priceFeed = await fundMe.priceFeed()
            assert.equal(priceFeed, mockV3Aggregator.address)
        })
        it("sets deployer as an owner", async function () {
            const owner = await fundMe.i_owner()
            assert.equal(owner, deployer)
        })
    })
    describe("fund function", function () {
        it("should revert because not enough eth is sent", async function () {
            await expect(
                fundMe.fund({ value: smallAmount })
            ).to.be.revertedWith("You need to spend more ETH!")
        })
        it("updates mapping addressToAmountFunded", async function () {
            await fundMe.fund({ value: bigAmount })
            const response = await fundMe.addressToAmountFunded(deployer)

            assert.equal(response.toString(), bigAmount.toString())
        })
        it("adds funder to funders array", async function () {
            await fundMe.fund({ value: bigAmount })
            const response = await fundMe.funders(0)
            assert.equal(response, deployer)
        })
    })
    describe("withdraw function", function () {
        beforeEach(async function () {
            await fundMe.fund({ value: bigAmount })
        })
        it("withdraw from a single funder", async function () {
            const startingBalanceFundMe = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingBalanceDeployer = await fundMe.provider.getBalance(
                deployer
            )
            const txResponse = await fundMe.withdraw()
            const txReceipt = await txResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = txReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingBalanceFundMe = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingBalanceDeployer = await fundMe.provider.getBalance(
                deployer
            )
            assert.equal(endingBalanceFundMe, 0)
            assert.equal(
                startingBalanceDeployer.add(startingBalanceFundMe).toString(),
                endingBalanceDeployer.add(gasCost).toString()
            )
        })
        it("withdraw from multiple accpounts", async function () {
            const accounts = await ethers.getSigners()
            for (i = 1; i < 5; i++) {
                const connectedAccounts = await fundMe.connect(accounts[i])
                await connectedAccounts.fund({ value: bigAmount })
            }

            const startingBalanceFundMe = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingBalanceDeployer = await fundMe.provider.getBalance(
                deployer
            )

            const txResponse = await fundMe.withdraw()
            const txReceipt = await txResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = txReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingBalanceFundMe = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingBalanceDeployer = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingBalanceFundMe, 0)
            assert.equal(
                startingBalanceDeployer.add(startingBalanceFundMe).toString(),
                endingBalanceDeployer.add(gasCost).toString()
            )

            await expect(fundMe.funders(0)).to.be.reverted
            for (i = 0; i < 5; i++) {
                assert.equal(
                    await fundMe.addressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })

        it("only owner can withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attacker = await fundMe.connect(accounts[1])

            await expect(attacker.withdraw()).to.be.revertedWith(
                "FundMe__NotOwner"
            )
        })
    })
})
