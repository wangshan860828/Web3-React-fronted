import {ethers} from 'ethers'
import FundMeArtifact from '../../contracts/FundMe.json'
import { sendWithGasRetry } from '../../utils/index'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react';
// 合约ABI和地址
const MY_CONTRACT_ABI = FundMeArtifact.abi
const MY_CONTRACT_ADDRESS = '0x87d0B27FC2Fb2105d4894Dd3626558Ecfc8c20e8'//FundMeArtifact.address //合约部署的地址
// Ganache 测试账号
const MY_GANACHE_ACCOUNT1 = '0x5FBafb59B029e2d2111cEa5D375d11B6E8b53B02'
const MY_GANACHE_ACCOUNT2 = '0x738c09aeC3BA35249f0B181373018d49Ee61dC18'
const GANACHE_PRIVATE_KEY = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' // Ganache 默认私钥

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
const wallet = new ethers.Wallet(GANACHE_PRIVATE_KEY, provider);
const contract = new ethers.Contract(MY_CONTRACT_ADDRESS, MY_CONTRACT_ABI, wallet);

export default function InteractContract() {
    const [balance1, setBalance1] = useState<string>('')
    const [balance2, setBalance2] = useState<string>('')
    const [contractBalance, setContractBalance] = useState<string>('')
    const [isTranfer, setIsTranfer] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const getAccountsBalance = async () => {
        try {
            // 调用 getBalance 方法
            const balance1 = await contract.getBalance(MY_GANACHE_ACCOUNT1);
            setBalance1(ethers.formatEther(balance1))

            const balance2 = await contract.getBalance(MY_GANACHE_ACCOUNT2);
            setBalance2(ethers.formatEther(balance2))
        } catch (err) {
            console.error('获取账户余额失败:', err)
            setError('获取账户余额失败')
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
                setError('获取合约余额失败')
            }
        }
        getAllBalance()
    }, [isTranfer])

    const handleFund = async () => {
        try {
            console.log('Calling sendWithGasRetry...')
            console.log('wallet:', wallet)
            console.log('provider:', provider)
            const txResponse = await sendWithGasRetry(contract, 'fund', [ethers.parseEther('0.1')])
            console.log('txResponse:', txResponse)
            setIsTranfer(txResponse.success)
            if (!txResponse.success) {
                setError(txResponse.error || '交易失败')
            }
        } catch (err) {
            console.error('handleFund error:', err)
            setError('交易执行失败')
        }
    }

    return (
        <div>
            <h1>Interact Contract</h1>
            {error && <div style={{color: 'red'}}>错误: {error}</div>}
            <div>
                <p>账户1余额：{balance1}</p>
                <p>账户2余额：{balance2}</p>
            </div><br />
            <Button onClick={handleFund}>Fund</Button>
            <p>合约余额：{contractBalance}</p>
            
        </div>
    )
}