import {Button} from '@/components/ui/button'
export default function Ethers() {
    const connectWallet = async () => {
        console.log('Connect Wallet')
    }
    return (
        <>
            <h2 className="text-2xl font-bold text-center border-b-2 border-red-500 pb-2">Ethers</h2>
            <Button variant="outline" size="sm" className="mt-4" onClick={connectWallet}>Connect Wallet</Button>
        </>
    )
}
