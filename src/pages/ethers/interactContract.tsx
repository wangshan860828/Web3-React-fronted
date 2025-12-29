import { ethers } from 'ethers'
import FundMeArtifact from '../../contracts/FundMe.json'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 合约ABI和地址
const MY_CONTRACT_ABI = FundMeArtifact.abi
const MY_CONTRACT_ADDRESS = '0x87d0B27FC2Fb2105d4894Dd3626558Ecfc8c20e8'
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

// 合约的监听
const MY_CONTRACT_EVENT_ADDRESS = '0x0C1b3954356A92D88AD1bC10b68E629540afBde6'
const contractEventProvider = new ethers.Contract(MY_CONTRACT_EVENT_ADDRESS, MY_CONTRACT_ABI, provider);
const contractEventSigner1 = new ethers.Contract(MY_CONTRACT_EVENT_ADDRESS, MY_CONTRACT_ABI, signer1);

export default function InteractContract() {
    const [balance1, setBalance1] = useState<string>('')
    const [balance2, setBalance2] = useState<string>('')
    const [contractBalance, setContractBalance] = useState<string>('')
    const [isTranfer, setIsTranfer] = useState<boolean>(false)
    const [totalGasFee, setTotalGasFee] = useState<string>('')
    const [fundEvents, setFundEvents] = useState<Array<{ from: string; amount: string; blockNumber: number; transactionHash: string }>>([])
    const [currentState, setCurrentState] =  useState<number>(1)
    const [activeTab, setActiveTab] = useState<string>('contract-interaction')
    
    // 更新 currentState 当 tab 切换
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        if (value === 'contract-interaction') {
            setCurrentState(1)
        } else if (value === 'event-listening') {
            setCurrentState(2)
        }
    }
    
    const getAccountsBalance = async () => {
        try {
            const balance1 = await contract.getBalance(MY_GANACHE_ACCOUNT1);
            setBalance1(ethers.formatEther(balance1))

            const balance2 = await contract.getBalance(MY_GANACHE_ACCOUNT2);
            setBalance2(ethers.formatEther(balance2))
        } catch (err) {
            console.error('获取账户余额失败:', err)
        }
    }

    useEffect(() => {
        console.log('useEffect currentState:', currentState)
        if (currentState !== 2) {
            return
        }
        const filter = contractEventProvider.filters.Funded()
        console.log('useEffect filter:', filter)

        // 回调函数只接收一个参数：event 原始对象（不再拆分 funder/amount）
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleFundEvent = (event: any) => {
            try {
                // 关键：从 event.args 中获取参数（与 ABI 中名称对应，无关顺序）
                console.log('event log:', event.log)
                const { funder, amount } = event.args; 
                console.log(`Fund event from ${funder} with amount ${amount}`); // 此时会正常显示：地址字符串 + bigint
                console.log('区块号:', event.log.blockNumber);
                console.log('交易哈希:', event.log.transactionHash);

            // 保存事件到状态（逻辑不变）
            setFundEvents(prev => [
                ...prev,
                {
                    from: funder,
                    amount: ethers.formatEther(amount), // 转为 ETH 格式
                    blockNumber: event.log.blockNumber,
                    transactionHash: event.log.transactionHash
                }
            ]);
        } catch (err) {
            console.error("处理 Funded 事件失败：", err);
        }
        };

        // 监听和取消监听逻辑不变（过滤器有效，继续使用）
        contractEventProvider.on(filter, handleFundEvent);
        return () => {
        contractEventProvider.off(filter, handleFundEvent);
        };
    }, [currentState])

    useEffect(() => {
        console.log('useEffect isTranfer:', isTranfer)
        async function getAllBalance() {
            try {
                const balance = await provider.getBalance(MY_CONTRACT_ADDRESS);
                setContractBalance(ethers.formatEther(balance))
                getAccountsBalance()          
            } catch (err) {
                console.error('获取合约余额失败:', err)
            }
        }
        getAllBalance()
    }, [isTranfer])

    // 获取总 gas 费
    const getTotalGasFee = async () => {
        try {
            const feeData = await provider.getFeeData();
            const gasLimit = await contract.fund.estimateGas({ value: ethers.parseEther('1') });
            const totalGasFee = feeData.gasPrice ? feeData.gasPrice * gasLimit : 0n;
            setTotalGasFee(ethers.formatUnits(totalGasFee, 'gwei'))
        } catch (err) {
            console.error('获取总 gas 费失败:', err)
        }
    }

    const handleFund = () => {
        contract.fund({ value: ethers.parseEther('1') })
            .then(async (txResponse) => {
                const receipt = await txResponse.wait();
                if (receipt.status === 1) {
                    setIsTranfer(prev => !prev) // 每次反转状态以触发更新
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
        try {
            const txResponse = await contractWithSigner2.fund({ value: ethers.parseEther('1') });
            const receipt = await txResponse.wait();
            if (receipt.status === 1) {
                setIsTranfer(prev => !prev) // 每次反转状态以触发更新
                getTotalGasFee() 
            } else {
                console.log('交易失败')
            }
        } catch (err) {
            console.error('handleFund2 error:', err)
        }
    }

    const handleFund3 = async () => {
        try {
            const txResponse = await contractEventSigner1.fund({ value: ethers.parseEther('1') });
            const receipt = await txResponse.wait();
            if (receipt.status === 1) {
                console.log('handleFund3交易成功')
            } else {
                console.log('handleFund3交易失败')
            }
        } catch (err) {
            console.error('handleFund3 error:', err)
        }
    }

    return (
        <div className="min-h-screen p-6 bg-linear-to-br from-slate-50 to-indigo-50">
            <h1 className="text-3xl font-bold mb-6 text-center bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Interact Contract</h1>
            <p className="text-center text-muted-foreground mb-8">当前状态: {currentState}</p> {/* 可选：显示当前状态 */}
            
            <Tabs defaultValue="contract-interaction" value={activeTab} onValueChange={handleTabChange} className="w-full max-w-4xl mx-auto">
                <TabsList className="mb-6 w-full bg-slate-200 p-1 rounded-lg">
                    <TabsTrigger 
                        value="contract-interaction" 
                        className="w-1/2 h-10 text-sm font-medium rounded-md transition-all duration-200 hover:bg-slate-300 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        合约交互
                    </TabsTrigger>
                    <TabsTrigger 
                        value="event-listening" 
                        className="w-1/2 h-10 text-sm font-medium rounded-md transition-all duration-200 hover:bg-slate-300 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        事件监听
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="contract-interaction">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-xl overflow-hidden">
                        <CardHeader className="bg-linear-to-r from-indigo-50 to-purple-50 border-b border-slate-100">
                            <CardTitle className="text-xl md:text-2xl text-indigo-600">合约转账与余额查询</CardTitle>
                            <CardDescription className="text-slate-600">测试 Fund 方法转账功能和账户余额查询</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            {totalGasFee && <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 mb-6">
                                <strong>总 gas 费:</strong> {totalGasFee} GWEI
                            </div>}
                            
                            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                                <p className="mb-2 font-medium text-slate-700">账户1余额：<span className="text-indigo-600 font-bold">{balance1}</span> ETH</p>
                                <p className="mb-2 font-medium text-slate-700">账户2余额：<span className="text-purple-600 font-bold">{balance2}</span> ETH</p>
                                <p className="mb-4 font-medium text-slate-700">合约余额：<span className="text-emerald-600 font-bold">{contractBalance}</span> ETH</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg" onClick={handleFund}>Fund转账1</Button>
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg" onClick={handleFund2}>Fund转账2</Button>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg" onClick={getTotalGasFee}>计算Gas费</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="event-listening">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-xl overflow-hidden">
                        <CardHeader className="bg-linear-to-r from-purple-50 to-pink-50 border-b border-slate-100">
                            <CardTitle className="text-xl md:text-2xl text-purple-600">Fund 事件监听</CardTitle>
                            <CardDescription className="text-slate-600">实时监听合约的 Funded 事件</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 mb-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg" onClick={handleFund3}>触发转账事件</Button>
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 text-slate-700">已触发的 Fund 事件：</h3>
                                {fundEvents.length === 0 ? (
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                                        <p className="text-muted-foreground">暂无事件记录</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto p-4 bg-slate-50 rounded-lg">
                                        {fundEvents.map((event, index) => (
                                            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white hover:border-purple-300 hover:shadow-md transition-all duration-200">
                                                <p className="mb-1 text-sm"><span className="font-semibold text-slate-700">From:</span> <code className="bg-slate-100 px-2 py-1 rounded text-xs">{event.from}</code></p>
                                                <p className="mb-1 text-sm"><span className="font-semibold text-slate-700">Amount:</span> <span className="text-emerald-600 font-bold">{event.amount}</span> ETH</p>
                                                <p className="mb-1 text-sm"><span className="font-semibold text-slate-700">Block Number:</span> {event.blockNumber}</p>
                                                <p className="mb-1 text-sm"><span className="font-semibold text-slate-700">Transaction Hash:</span> <code className="bg-slate-100 px-2 py-1 rounded text-xs break-all">{event.transactionHash}</code></p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}