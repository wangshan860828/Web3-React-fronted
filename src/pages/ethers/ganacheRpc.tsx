import { Button } from "@/components/ui/button";
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
import { useState } from "react";

export default function GanacheRpc() {
    const [signer1, setSigner1] = useState<ethers.Signer | null>(null)
    const [signer2, setSigner2] = useState<ethers.Signer | null>(null)
    const [signer1Address, setSigner1Address] = useState<string>('')
    const [signer1Balance, setSigner1Balance] = useState<string>('')
    const [signer2Address, setSigner2Address] = useState<string>('')
    const [signer2Balance, setSigner2Balance] = useState<string>('')
    const [blockNumber, setBlockNumber] = useState<number>(0)
    
    const connectGanache = async () => {
        // 若未提供 url，默认连接到 http://localhost:8545（多数节点使用）
        const url = 'http://localhost:7545';
        const provider = new ethers.JsonRpcProvider(url);
        setBlockNumber(await provider.getBlockNumber())
        // 通过签名者获取账户写权限
        const signer1 = await provider.getSigner();
        setSigner1(signer1)
        console.log('signer1:', signer1)
        console.log('signer1 address:', await signer1.getAddress())
        setSigner1Address(await signer1.getAddress())
        const balance = await provider.getBalance(await signer1.getAddress());
        console.log('signer1 balance:', ethers.formatEther(balance))
        setSigner1Balance(ethers.formatEther(balance))
        
        // 通过签名者获取指定账户写权限（如 Hardhat、Ganache）时）
        const signer2 = await provider.getSigner('0x738c09aeC3BA35249f0B181373018d49Ee61dC18');
        setSigner2(signer2)
        console.log('signer2:', signer2)
        console.log('signer2 address:', await signer2.getAddress())
        setSigner2Address(await signer2.getAddress())
        const balance2 = await provider.getBalance(await signer2.getAddress());
        console.log('signer2 balance:', ethers.formatEther(balance2))
        setSigner2Balance(ethers.formatEther(balance2))
    }

    const handleSendTransaction = async () => {
        const tx = await signer1?.sendTransaction({
            to: signer2Address,
            value: ethers.parseEther('1'),
        })
        console.log('tx:', tx)
        const receipt = await tx?.wait()
        console.log('tx receipt:', receipt)
    }

    return (
        <div>
            <h1>GanacheRpc</h1>
            <Button onClick={connectGanache}>连接Ganache</Button>
            <Button onClick={handleSendTransaction}>发送交易</Button>
            <Card>
                <CardHeader>
                    <CardTitle>Ganache账户信息</CardTitle>
                    <CardDescription>连接Ganache后，查看账户信息</CardDescription>
                </CardHeader>
                <CardContent>
                    <div>
                        <p>blockNumber: {blockNumber}</p>
                        <p>signer1 address: {signer1Address}</p>
                        <p>signer1 balance: {signer1Balance}</p>
                        <p>signer2 address: {signer2Address}</p>
                        <p>signer2 balance: {signer2Balance}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}