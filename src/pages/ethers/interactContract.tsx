import {ethers} from 'ethers'
import FundMeArtifact from '../../contracts/FundMe.json'
// import { sendWithGasRetry } from '../../utils/index'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react';
// 合约ABI和地址
const MY_CONTRACT_ABI = FundMeArtifact.abi
const MY_CONTRACT_ADDRESS = '0x87d0B27FC2Fb2105d4894Dd3626558Ecfc8c20e8'//FundMeArtifact.address //合约部署的地址
// Ganache 测试账号
const MY_GANACHE_ACCOUNT1 = '0x5FBafb59B029e2d2111cEa5D375d11B6E8b53B02'
const MY_GANACHE_ACCOUNT2 = '0x738c09aeC3BA35249f0B181373018d49Ee61dC18'
const GANACHE_PRIVATE_KEY1 = '0xca9e882381a19eb0c5bd2106d9cc18514ef35444cc8ec8196bd6dbc46afbdb77'
const GANACHE_PRIVATE_KEY2 = '0x52bd224a99d33a4975422b02add02db47568e0275af6ef89439b9329d7ab52ca'

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
const signer1 = new ethers.Wallet(GANACHE_PRIVATE_KEY1, provider);
const signer2 = new ethers.Wallet(GANACHE_PRIVATE_KEY2, provider);
const contract = new ethers.Contract(MY_CONTRACT_ADDRESS, MY_CONTRACT_ABI, signer1);
const contractWithSigner2 = contract.connect(signer2) as ethers.Contract;

export default function InteractContract() {
    const [balance1, setBalance1] = useState<string>('')
    const [balance2, setBalance2] = useState<string>('')
    const [contractBalance, setContractBalance] = useState<string>('')
    const [isTranfer, setIsTranfer] = useState<boolean>(false)
    const [totalGasFee, setTotalGasFee] = useState<string>('')

    const getAccountsBalance = async () => {
        try {
            // 调用 getBalance 方法
            const balance1 = await contract.getBalance(MY_GANACHE_ACCOUNT1);
            setBalance1(ethers.formatEther(balance1))

            const balance2 = await contract.getBalance(MY_GANACHE_ACCOUNT2);
            setBalance2(ethers.formatEther(balance2))
        } catch (err) {
            console.error('获取账户余额失败:', err)
            // setError('获取账户余额失败')
        }
    }

    useEffect(() => {
        async function getAllBalance() {
            try {
                const balance = await provider.getBalance(MY_CONTRACT_ADDRESS);
                setContractBalance(ethers.formatEther(balance))
                getAccountsBalance()          
            } catch (err) {
                console.error('获取合约余额失败:', err)
                // setError('获取合约余额失败')
            }
        }
        getAllBalance()
    }, [isTranfer])

    // 获取总 gas 费
    const getTotalGasFee = async () => {
        try {
            const feeData = await provider.getFeeData();
            console.log('feeData:', feeData)
            console.log('gasPrice (wei):', feeData.gasPrice)
            console.log('gasPrice (gwei):', ethers.formatUnits(feeData.gasPrice || 0n, 'gwei'))
            const gasLimit = await contract.fund.estimateGas({ value: ethers.parseEther('1') });
            console.log('gasLimit:', gasLimit)
            const totalGasFee = feeData.gasPrice ? feeData.gasPrice * gasLimit : 0n;
            console.log('总 gas 费:', ethers.formatUnits(totalGasFee, 'gwei'), 'gwei')
            setTotalGasFee(ethers.formatUnits(totalGasFee, 'gwei'))
        } catch (err) {
            console.error('获取总 gas 费失败:', err)
        }
    }

    const handleFund = () => {
        //用 fund 方法转账 1 ETH 到合约
        contract.fund({ value: ethers.parseEther('1') })
            .then(async (txResponse) => {
                const receipt = await txResponse.wait();
                console.log('receipt:', receipt)
                if (receipt.status === 1) {
                    setIsTranfer(true)
                    getTotalGasFee()
                } else {
                    console.log('交易失败')
                }
            })
            .catch((err) => {
                console.error('handleFund error:', err)
            })
    }

    const handleFund2 = async () => {
        //用 fund 方法转账 1 ETH 到合约
        const txResponse = await contractWithSigner2.fund({ value: ethers.parseEther('1') });
        console.log('txResponse:', txResponse)
        const receipt = await txResponse.wait();
        console.log('receipt:', receipt)
        if (receipt.status === 1) {
            setIsTranfer(true)
            getTotalGasFee() 
        } else {
            console.log('交易失败')
        }  
    }

    return (
        <div>
            <h1>Interact Contract</h1>
            {totalGasFee && <div style={{color: 'red'}}>总 gas 费: {totalGasFee}</div>}
            <div>
                <p>账户1余额：{balance1}</p>
                <p>账户2余额：{balance2}</p>
            </div><br />
            <Button onClick={handleFund}>Fund转账1</Button>
            <Button onClick={handleFund2} style={{marginLeft: '10px'}}>Fund转账2</Button>
            <Button onClick={getTotalGasFee} style={{marginLeft: '10px'}}>计算Gas费</Button>
            <p>合约余额：{contractBalance}</p>
            
        </div>
    )
}