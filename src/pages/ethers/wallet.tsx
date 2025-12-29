import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/useWallet"

export default function Wallet() {
    const { state, connect } = useWallet()
    
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>useWallet Hooks 示例</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>
                        <span className="text-black">钱包状态：</span>
                        <span className={state.isConnected ? "text-green-600" : "text-red-600"}>
                            {state.isConnected ? '已连接' : '未连接'}
                        </span>
                    </p>
                    <p>
                        <span className="text-black">当前网络：</span>
                        <span>{state.chainId && state.chainName ? `${state.chainName} (${state.chainId})` : '-'}</span>
                    </p>
                    <p>
                        <span className="text-black">当前账号：</span>
                        <span>{state.account || '-'}</span>
                    </p>
                    <p>
                        <span className="text-black">当前账号余额：</span>
                        <span>{state.balance ? `${state.balance} ETH` : '-'}</span>
                    </p>
                    
                    {!state.isConnected && (
                        <Button onClick={() => connect('MetaMask')} className="mt-4">
                            连接钱包
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}