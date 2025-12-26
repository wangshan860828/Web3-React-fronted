import { keccak256, toUtf8Bytes, ethers } from 'ethers';

// 验证以太坊地址是否有效
/* EIP-55校验和校验规则：
去除待验证地址的0x前缀，转为纯小写字符串，计算其 Keccak-256 哈希值；
遍历待验证地址的每一位字符（数字无需校验，仅校验字母）：
若哈希值对应位置为0-7（十六进制），待验证地址该位置必须为小写，否则校验失败；
若哈希值对应位置为8-f（十六进制），待验证地址该位置必须为大写，否则校验失败；*/

const validateEthAddress = (address: string): boolean => {
    // 基础的格式校验
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return false;
    }
    
    // EIP-55校验和校验
    const lowCaseAddress = address.toLowerCase().replace('0x', '');
    const hash = keccak256(toUtf8Bytes(lowCaseAddress));
    
    for (let i = 0; i < 40; i++) {
        const hashChar = parseInt(hash[i + 2], 16); // 跳过'0x'前缀
        const addrChar = address[i + 2];
        
        // 如果校验和字符大于等于8，地址字符必须是大写
        if (hashChar >= 8 && addrChar !== addrChar.toUpperCase()) {
            return false;
        }
        // 如果校验和字符小于8，地址字符必须是小写
        if (hashChar < 8 && addrChar !== addrChar.toLowerCase()) {
            return false;
        }
    }
    
    return true;
};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendWithGasRetry = async (contract: any, method: string, params: any[], retries = 2) => {
    try {
        // gas数量
        const gasLimit = await contract.estimateGas[method](...params); 
        console.log('gasLimit:', gasLimit)
        // 当前网络 gas 单价（wei）
        const gasPrice = await contract.runner.getGasPrice(); 
        console.log('gasPrice (wei):', gasPrice)
        console.log('gasPrice (gwei):', ethers.formatUnits(gasPrice, 'gwei'))
        const tx = await contract[method](...params, 
            { 
                //总的 gas 费（wei） = gas数量 * gas单价
                gasLimit: gasLimit.mul(120).div(100), // 增加20%的Gas Limit
                gasPrice: gasPrice.mul(120).div(100)  // 增加20%的Gas Price
            });
        console.log('tx:', tx)
        const receipt = await tx.wait();
        console.log('receipt:', receipt)
        return receipt.status === 1 ? {success:true, txHash: tx.hash} : {success:false, txHash: tx.hash};
    } catch (error: unknown) {
        // 处理错误，例如重试
        if (retries > 0 && error instanceof Error && error.message.includes('insufficient gas')) {
            console.log(`重试 ${retries} 次`);
            return sendWithGasRetry(contract, method, params, retries - 1);
        }
        return {success:false, error: error instanceof Error ? error.message : '未知错误'};
    }
}

export { validateEthAddress , sendWithGasRetry };