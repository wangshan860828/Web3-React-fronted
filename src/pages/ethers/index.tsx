import {Button} from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { ethers } from "ethers";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
// import { Toast } from "radix-ui";

export default function Ethers() {
    let signer: ethers.Signer | null = null
    let provider: ethers.Provider | null = null
    const [loading, setLoading] = useState<boolean>(false) //是否连接MetaMask
    const [chainId, setChainId] = useState<number>(0) //链ID
    const [network, setNetwork] = useState<string>('') //网络信息
    const [currentAddress, setCurrentAddress] = useState<string>('') //钱包地址
    const [balance, setBalance] = useState<string>('') //钱包余额

     const handleChainChanged = async (_chainId: string) => {
        console.log(`handleChainChanged: ${_chainId}`)
        // const provider1 = new ethers.BrowserProvider(window.ethereum)
        // const networkInfo = await provider1.getNetwork()
        // setChainId(Number(networkInfo.chainId))
        // setNetwork(networkInfo.name)
    }

    const handleAccountsChanged = async (accounts: string[]) => {
        console.log(`handleAccountsChanged: ${accounts}`)
        if (accounts.length > 0) {
            setCurrentAddress(accounts[0])
            const balance = await provider.getBalance(accounts[0]);
            setBalance(ethers.formatEther(balance))
        } else {
            setCurrentAddress('')
        }
    }
    
    useEffect(() => {
        return () => {
            window.ethereum.removeListener("chainChanged", handleChainChanged)
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
    }, [])
    const connectWallet = async () => {
        const ethereum = window.ethereum as any
        setLoading(true)
        if (ethereum == null) {
            //如果未安装 MetaMask，使用默认提供商（基于第三方服务如 INFURA），无读写权限
            console.log('connectWallet Ethereum object not found')
            provider = ethers.getDefaultProvider()
            setLoading(false)
        } else {
            setLoading(false)
            window.ethereum.on("chainChanged", handleChainChanged)
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            // 连接到 MetaMask 的 EIP-1193 对象（标准协议，允许 Ethers 通过 MetaMask 进行只读请求）
            provider = new ethers.BrowserProvider(ethereum)
            console.log('connectWallet provider', provider)
            // 请求写权限，使用 MetaMask 管理的私钥
            signer = provider.getSigner()
        
            const addresses = await provider.send("eth_requestAccounts", []);
            setCurrentAddress(addresses[0])
            console.log(`Connected address is: ${addresses[0]}`);

            const networkInfo = await provider.getNetwork()
            setChainId(Number(networkInfo.chainId))
            setNetwork(networkInfo.name)

            const balance = await provider.getBalance(addresses[0]);
            setBalance(ethers.formatEther(balance))
            console.log(`Current address balance1 is: ${ethers.formatEther(balance)}`)
        }
    }

    return (
        <div className="flex flex-col items-center min-h-screen">
            <h2 className="text-2xl font-bold text-center border-b-2 border-red-500 pb-2 mb-6">Ethers</h2>
            <Button onClick={connectWallet} className="mb-4">连接MetaMask</Button>
            <Card className="w-1/2 mt-4">
                <CardHeader>
                    <CardTitle className="text-center">MetaMask信息</CardTitle>
                </CardHeader>
                {/* 钱包连接中展示连接中，获取详情则展示详情 */}
                {loading ? (
                    <CardContent className="flex justify-center items-center py-8">
                        <p className="text-lg font-medium">metaMask 连接中...</p>
                    </CardContent>
                ) : (
                    <CardContent className="py-6">
                        <p className="text-lg font-medium">当前链ID: {chainId}</p>
                        <p className="text-lg font-medium">当前网络: {network}</p>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">钱包地址</p>
                                <p id="connectedWalletAddress" className="text-lg font-bold text-center break-all">{currentAddress}</p>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">钱包余额</p>
                                <p id="connectedWalletBalance" className="text-lg font-bold text-center">{balance} ETH</p>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
