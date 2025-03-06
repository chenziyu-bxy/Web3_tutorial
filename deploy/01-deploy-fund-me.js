// function deployFunction() {
//     console.log("this is a deploy function")
// }
// module.exports.default = deployFunction

const { network } = require("hardhat")
const { developmentChains, networkConfig, Lock_Time, CONFIRMATIONS } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy } = deployments

    let dataFeedAddr
    if (developmentChains.includes(network.name)) {
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")
        dataFeedAddr = mockV3Aggregator.address
    } else {
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed
        confirmations = CONFIRMATIONS
    }

    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [Lock_Time, dataFeedAddr],
        log: true,
        waitConfirmations: CONFIRMATIONS
    })
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [Lock_Time, dataFeedAddr],
        });
    } else {
        console.log("Network is not sepolia,verification is skipped...")
    }
}
module.exports.tags = ["all", "fundme"]