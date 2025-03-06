const { DECIMAL, INITTAL_ANSWER, developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    if (developmentChains.includes(network.name)) {
        const { firstAccount } = await getNamedAccounts()
        const { deploy } = deployments

        await deploy("MockV3Aggregator", {
            from: firstAccount,
            args: [DECIMAL, INITTAL_ANSWER],
            log: true
        })
    } else {
        console.log("envirment is not localStorage, mock contract deployment is skipped")
    }

}
module.exports.tags = ["all", "mock"]