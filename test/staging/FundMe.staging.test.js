const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentNetworks } = require("../../helper-hardhat-config")
const { assert } = require("chai")

//another way to write if statements is to use "?" and ":"
//meaninf if true do one thing : if false do the other thing
//similar to
//if(develppmentChains.includes(network.name){})
developmentNetworks.includes(network.name)
    ? describe.skip //skips a whole describe
    : describe("FundMe staging test", function () {
          let fundMe, deployer
          const bigAmount = ethers.utils.parseEther("0.05")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("allows to fund and withdraw", async function () {
              const fundtxResponse = await fundMe.fund({ value: bigAmount })
              await fundtxResponse.wait(1)
              const withdrawtxResponse = await fundMe.withdraw()
              await withdrawtxResponse.wait(1)
              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })
