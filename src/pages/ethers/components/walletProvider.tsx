/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ethers } from "ethers";

// 显式定义状态类型
interface WalletState {
  account: string | null;
  chainId: bigint | null;
  signer: ethers.JsonRpcSigner | null;
  isConnected: boolean;
  walletType: string;
  connect: (walletType: string) => Promise<void>;
  disconnect: () => void;
}

const walletContext = createContext<WalletState>({} as WalletState)

const WalletProviderComponent = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<Omit<WalletState, 'connect' | 'disconnect'>>({
        account: null,
        chainId: null,
        signer: null,
        isConnected: false,
        walletType: '',
    });

    //页面刷新时，自动重连钱包
    useEffect(() => {
       const autoConnect = async () => {
        if (window && (window as any).ethereum) {
            try {
                const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
                if (accounts.length > 0) {
                    const provider = new ethers.BrowserProvider((window as any).ethereum)
                    const signer = await provider.getSigner()
                    const chainId = await provider.getNetwork().then(network => network.chainId)
                    setState({
                        ...state,
                        account: accounts[0],
                        isConnected: true,
                        signer: signer || null,
                        chainId: chainId || null,
                        walletType: 'MetaMask',
                    })
                }
            } catch (error) {
                console.log('autoConnect error:', error)
            }
        }
       }
       autoConnect();
    }, [state])

    //连接钱包
    const connect = async (walletType: string) => {
        if (walletType === 'MetaMask' && window && (window as any).ethereum) {
            try {
                const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
                if (accounts.length > 0) {
                    const provider = new ethers.BrowserProvider((window as any).ethereum)
                    const signer = await provider.getSigner()
                    const chainId = await provider.getNetwork().then(network => network.chainId)
                    setState({
                        ...state,
                        account: accounts[0],
                        isConnected: true,
                        signer: signer || null,
                        chainId: chainId || null,
                        walletType: walletType,
                    })
                }
            } catch (error) {
                console.log('connect error:', error)
            }
        }
    }

    //断开连接
    const disconnect = () => {
        setState(prev => ({
            ...prev,
            account: null,
            isConnected: false,
            signer: null,
            chainId: null,
            walletType: '',
        }))
    }

    //监听链切换
    useEffect(() => {
        if (!window || !(window as any).ethereum) return;
        const handleChainChanged = () => {
            const provider = new ethers.BrowserProvider((window as any).ethereum)
            provider.getNetwork().then(network => {
                setState(prev => ({
                    ...prev,
                    chainId: BigInt(network.chainId),
                }))
            })
        }
        (window as any).ethereum.on('chainChanged', handleChainChanged)
        return () => {
            (window as any).ethereum.off('chainChanged', handleChainChanged)
        }
    }, [])

    //监听账户切换
    useEffect(() => {
        if (!window || !(window as any).ethereum) return;
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length > 0) {
                setState(prev => ({
                    ...prev,
                    account: accounts[0],
                }))
            } else {
                disconnect()
            }
        }
        (window as any).ethereum.on('accountsChanged', handleAccountsChanged)
        return () => {
            (window as any).ethereum.off('accountsChanged', handleAccountsChanged)
        }
    }, [])

    return (
        <walletContext.Provider value={{ ...state, connect, disconnect }}>
            {children}
        </walletContext.Provider>
    );
};

// Add a comment to prevent react-refresh errors or export only the component
// but in this case, we still need to export the hook
// The fix is to add the react-refresh rule disable comment to this file
/* eslint-disable react-refresh/only-export-components */
export const WalletProvider = WalletProviderComponent;
export const useWalletProvider = () => {
    return useContext(walletContext)
};