import { createContext, useContext, type ReactNode } from "react";
import { useWallet } from "@/hooks/useWallet";
import type { WalletState } from "@/hooks/useWallet";

// 扩展 WalletState 接口，包含操作方法
interface ExtendedWalletState extends WalletState {
  connect: (walletType: string) => Promise<void>;
  disconnect: () => void;
}

// 创建类型安全的 context
const walletContext = createContext<ExtendedWalletState | undefined>(undefined);

const WalletProviderComponent = ({ children }: { children: ReactNode }) => {
  const { connect, disconnect, state } = useWallet();

  return (
    <walletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </walletContext.Provider>
  );
};

/* eslint-disable react-refresh/only-export-components */
export const WalletProvider = WalletProviderComponent;

export const useWalletProvider = () => {
  const context = useContext(walletContext);
  if (context === undefined) {
    throw new Error('useWalletProvider must be used within a WalletProvider');
  }
  return context;
};