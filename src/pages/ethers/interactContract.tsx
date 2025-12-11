import {ethers} from 'ethers'
import FundMeArtifact from '../../contracts/FundMe.json'
// import { useEffect } from 'react'

const MY_TOKEN_ABI = FundMeArtifact.abi
const MY_TOKEN_ADDRESS = ''//FundMeArtifact.address //合约部署的地址

export default function InteractContract() {
    // useEffect(() => {
    //     testABI()
    // }, [])
    testABI()
    async function testABI() {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
        const contract = new ethers.Contract(MY_TOKEN_ADDRESS, MY_TOKEN_ABI, provider);
        // 调用balanceOf方法（Ganache默认账户地址）
        const balance = await contract.balanceOf("0xGanache默认账户地址");
        console.log("账户余额：", ethers.formatEther(balance)); // 能输出结果说明ABI有效
    }

    return (
        <div>
            <h1>Interact Contract</h1>
        </div>
    )
}
