import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardDescription,
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
        const url = 'http://localhost:7545';
        const provider = new ethers.JsonRpcProvider(url);
        setBlockNumber(await provider.getBlockNumber())
        
        const signer1 = await provider.getSigner();
        setSigner1(signer1)
        setSigner1Address(await signer1.getAddress())
        const balance = await provider.getBalance(await signer1.getAddress());
        setSigner1Balance(ethers.formatEther(balance))
        
        const signer2 = await provider.getSigner('0x738c09aeC3BA35249f0B181373018d49Ee61dC18');
        setSigner2(signer2)
        setSigner2Address(await signer2.getAddress())
        const balance2 = await provider.getBalance(await signer2.getAddress());
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

    const handleSendReverseTransaction = async () => {
        const tx = await signer2?.sendTransaction({
            to: signer1Address,
            value: ethers.parseEther('1'),
        })
        console.log('reverse tx:', tx)
        const receipt = await tx?.wait()
        console.log('reverse tx receipt:', receipt)
    }

    return (
        <div>
            <h1>GanacheRpc</h1>
            <Button className="mr-4 mb-4" onClick={connectGanache}>连接Ganache</Button>
            <Button className="mr-4" onClick={handleSendTransaction}>从 signer1 发送到 signer2</Button>
            <Button onClick={handleSendReverseTransaction}>从 signer2 发送到 signer1</Button>
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