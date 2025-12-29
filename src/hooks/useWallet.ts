/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { ethers } from "ethers";

// 显式定义状态类型
export interface WalletState {
  account: string | null;
  chainId: bigint | null;
  chainName: string | null;
  balance: string | null;
  signer: ethers.JsonRpcSigner | null;
  isConnected: boolean;
  walletType: string;  
}

export function useWallet() {
    const [state, setState] = useState<WalletState>({
        account: null,
        chainId: null,
        chainName: null,
        balance: null,
        signer: null,
        isConnected: false,
        walletType: '',
    });

    //断开连接
    const disconnect = () => {
        console.log('disconnect function 断开连接')
        setState(prev => ({
            ...prev,
            account: null,
            isConnected: false,
            signer: null,
            chainId: null,
            chainName: null,
            balance: null,
            walletType: '',
        }))
    }

    //页面刷新时，自动重连钱包
    useEffect(() => {
        console.log('useEffect refreshConnect 自动重连钱包')
       const refreshConnect = async (targetAccount?: string) => {
        if (window && (window as any).ethereum) {
            try {
                // 使用 eth_accounts 方法获取当前已连接的账号，而不是 eth_requestAccounts
                const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
                console.log('eth_accounts 方法返回的 accounts =', accounts)
                const currentAccount = targetAccount || accounts[0];
                if (currentAccount) {
                    const provider = new ethers.BrowserProvider((window as any).ethereum)
                    const signer = await provider.getSigner()
                    const network = await provider.getNetwork()
                    const balance = await provider.getBalance(currentAccount).then(balance => ethers.formatEther(balance))
                    
                    setState(prev => ({
                        ...prev,
                        account: currentAccount,
                        isConnected: true,
                        signer: signer || null,
                        chainId: network.chainId || null,
                        chainName: network.name || null,
                        balance: balance || null,
                        walletType: 'MetaMask',
                    }))
                } else {
                    console.log('没有检测到已连接的账号')
                    disconnect();
                }
            } catch (error) {
                console.log('refreshConnect error:', error)
            }
        }
       }
       refreshConnect();
       const handleChainChanged = async (chainIdHex: string) => {
            console.log('handleChainChanged function 被调用，chainIdHex:', chainIdHex)
            const chainId = BigInt(chainIdHex)
            const provider = new ethers.BrowserProvider((window as any).ethereum)
            const network = await provider.getNetwork()
            setState(prev => ({
                ...prev,
                chainId: chainId || null,
                chainName: network.name || null,
            }))
        }
        const handleAccountsChanged = async (accounts: string[]) => {
            console.log('handleAccountsChanged function 监听账户切换 accounts =', accounts)
            if (accounts.length > 0) {
                // 直接使用传入的 accounts 参数，这是最新的账号信息
                console.log('账户切换，新账号:', accounts[0])
                refreshConnect(accounts[0])
            } else {
                // 账号为空时断开连接
                disconnect();
            }
        }
        const handleDisconnect = () => {
            console.log('❌ handleDisconnect 事件触发! 钱包已断开连接。')
            disconnect();
        }
        const ethereum = (window as any).ethereum;
        if (ethereum) {
            ethereum.on('chainChanged', handleChainChanged);
            ethereum.on('accountsChanged', handleAccountsChanged);
            ethereum.on('disconnect', handleDisconnect);
            console.log('添加事件监听器完成')
        } else {
            console.warn('ethereum 对象未找到')
        }
        return () => {
            console.log('useEffect 监听事件 移除监听器开始');
            const cleanupEthereum = (window as any).ethereum;
            if (cleanupEthereum) {
                cleanupEthereum.off?.('chainChanged', handleChainChanged);
                cleanupEthereum.off?.('accountsChanged', handleAccountsChanged);
                cleanupEthereum.off?.('disconnect', handleDisconnect);
                console.log('监听器移除完成')
            } else {
                console.log('移除监听器时 ethereum 对象不存在')
            }
        }
    }, []) 

    //连接钱包
    const connect = async (walletType: string) => {
        console.log('connect function 手动连接钱包')
        if (walletType === 'MetaMask' && window && (window as any).ethereum) {
            try {
                // 关键：使用 eth_requestAccounts 来请求授权
                const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
                if (accounts.length > 0) {
                    const provider = new ethers.BrowserProvider((window as any).ethereum)
                    const signer = await provider.getSigner()
                    const network = await provider.getNetwork()
                    const balance = await provider.getBalance(accounts[0]).then(balance => ethers.formatEther(balance))
                    setState(prev => ({
                        ...prev,
                        account: accounts[0],
                        isConnected: true,
                        signer: signer || null,
                        chainId: network.chainId || null,
                        chainName: network.name || null,
                        walletType: walletType,
                        balance: balance || null,
                    }))
                }
            } catch (error) {
                console.log('connect error:', error)
            }
        }
    }

    return { state, connect, disconnect };
}