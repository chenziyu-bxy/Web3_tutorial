// 引入 `ethers.js` 库，用于与以太坊智能合约进行交互
// `hardhat` 是一个开发框架，`ethers` 是其中一个工具，用于与以太坊进行交互
const { ethers } = require("hardhat")

// 创建一个名为 `main` 的异步函数，这是合约部署的入口
async function main() {
    // 创建合约工厂对象，通过 `ethers.getContractFactory` 获取已编译好的合约工厂
    // `getContractFactory("FundMe")` 会根据合约名找到对应的 ABI 和字节码
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    // 打印合约正在部署的提示
    console.log("contract deploying")

    // 使用 `fundMeFactory.deploy(10)` 部署合约，并传入合约构造函数需要的参数
    // 这里的 `10` 是传递给 `FundMe` 合约的构造函数的参数
    const fundMe = await fundMeFactory.deploy(300)

    // 等待合约部署交易被区块链确认
    // `waitForDeployment()` 会等待合约部署交易完成，并且合约地址被成功确认
    await fundMe.waitForDeployment()

    // 合约部署成功后，打印出合约地址
    // `fundMe.target` 返回的是合约的地址
    console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`);

    // 验证合约是否已经部署并且可以验证
    // 如果当前网络是 Sepolia 测试网（链ID 为 11155111），并且环境变量中有 `ETHERSCAN_API_KEY`
    // 则执行合约验证操作
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        // 打印出等待 5 个区块确认的提示
        console.log("Waiting for 5 confirmations")

        // 等待部署交易的确认，`fundMe.deploymentTransaction()` 返回部署交易对象
        // `wait(5)` 表示等待 5 个区块确认，确保交易已被多个区块确认，防止链上重组等问题
        await fundMe.deploymentTransaction().wait(5)

        // 调用 `verifyFundMe` 函数来验证部署的合约
        // `verifyFundMe` 需要合约地址和构造函数参数（在这里是 `10`）作为输入
        // `verifyFundMe(fundMe.target, [10])` 会执行与 Etherscan 的集成验证
        await verifyFundMe(fundMe.target, [300])
    } else {
        // 如果不满足验证条件（例如不是 Sepolia 网络，或者没有提供 Etherscan API 密钥），跳过验证
        console.log("verification skipped..")
    }


    // 初始化 2 个账户
    const [firstAccount, secondAccount] = await ethers.getSigners()
    // `ethers.getSigners()` 获取当前可用的账户，这里取其中的前两个账户，分别是 `firstAccount` 和 `secondAccount`
    // 这些账户将用来执行合约操作

    // 使用第一个账户向合约提供资金
    const fundTx = await fundMe.fund({ value: ethers.parseEther("0.05") })
    // `fundMe.fund()` 调用合约的 `fund` 函数，向合约发送 0.05 ETH 的资金
    // `ethers.parseEther("0.05")` 将 "0.05" 转换为以太币的最小单位 Wei

    // 等待交易被矿工打包并且交易确认
    await fundTx.wait()

    // 输出两个账户的地址
    console.log(`2 accounts are ${firstAccount.address} and ${secondAccount.address}`)
    // 这行打印出 `firstAccount` 和 `secondAccount` 账户的以太坊地址

    // 检查合约的余额（存入资金后的合约余额）
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    // `ethers.provider.getBalance(fundMe.target)` 获取合约地址 `fundMe.target` 上的余额
    // `fundMe.target` 是合约部署时分配的地址

    // 打印合约的余额
    console.log(`Balance of the contract is ${balanceOfContract}`)

    // 使用第二个账户向合约提供资金
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.05") })
    // `fundMe.connect(secondAccount)` 切换到第二个账户 `secondAccount`，确保交易由第二个账户发起
    // `fund({ value: ethers.parseEther("0.05") })` 向合约发送 0.05 ETH 的资金

    // 等待第二个账户的交易被确认
    await fundTxWithSecondAccount.wait()

    // 再次检查合约余额（第二个账户存入资金后的余额）
    const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target)
    // `ethers.provider.getBalance(fundMe.target)` 获取合约余额，查看第二次存入资金后余额的变化

    // 打印合约存款后的余额
    console.log(`Balance of the contract is ${balanceOfContractAfterSecondFund}`)

    // 检查映射，获取第一个账户在合约中的余额
    const firstAccountbalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address)
    // `fundMe.fundersToAmount(firstAccount.address)` 查询第一个账户在合约中存入的金额
    // `fundersToAmount` 假设是合约中的一个映射函数，用于返回每个地址存入的金额

    // 检查映射，获取第二个账户在合约中的余额
    const secondAccountbalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address)
    // `fundMe.fundersToAmount(secondAccount.address)` 查询第二个账户在合约中存入的金额

    // 输出第一个账户存入的金额
    console.log(`Balance of first account ${firstAccount.address} is ${firstAccountbalanceInFundMe}`)
    // 打印第一个账户存入合约的金额

    // 输出第二个账户存入的金额
    console.log(`Balance of second account ${secondAccount.address} is ${secondAccountbalanceInFundMe}`)
    // 打印第二个账户存入合约的金额
}

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}

main().then().catch((error) => {
    console.error(error)
    process.exit(0)
})
