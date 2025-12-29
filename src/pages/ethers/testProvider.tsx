import React from 'react';
import { WalletProvider, useWalletProvider } from './components/walletProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 测试子组件1 - 使用 WalletProvider
const ChildComponent1: React.FC = () => {
  const wallet = useWalletProvider();
  return (
    <Card className="bg-linear-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="text-blue-800">子组件 1 - 访问钱包信息</CardTitle>
      </CardHeader>
      <CardContent>
        <p>子组件检测到的账户: <span className="font-mono">{wallet.account}</span></p>
        <p>子组件检测到的链 ID: <span className="font-mono">{wallet.chainId}</span></p>
      </CardContent>
    </Card>
  );
};

// 测试子组件2 - 测试跨组件状态同步
const ChildComponent2: React.FC = () => {
  const wallet = useWalletProvider();
  return (
    <Card className="bg-linear-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-purple-800">子组件 2 - 连接控制</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={wallet.disconnect} 
          disabled={!wallet.isConnected}
          className="bg-purple-600 hover:bg-purple-700"
        >
          在子组件中断开连接
        </Button>
      </CardContent>
    </Card>
  );
};

// 主测试组件
const TestComponent: React.FC = () => {
  const wallet = useWalletProvider();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* 头部标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            WalletProvider vs useWallet 对比测试
          </h1>
          <p className="text-gray-600">
            这个页面展示了 <code className="bg-gray-200 px-2 py-1 rounded font-mono">WalletProvider</code> 组件的独特功能，
            特别是它的跨组件状态管理能力
          </p>
        </div>

        {/* WalletProvider 状态信息 */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">WalletProvider 当前状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-semibold">连接状态:</p>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  wallet.isConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {wallet.isConnected ? '✅ 已连接' : '❌ 未连接'}
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold">钱包类型:</p>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {wallet.walletType || '未选择'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">账户地址:</p>
              <div className="bg-gray-100 p-3 rounded font-mono break-all">
                {wallet.account || '未连接'}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-semibold">链 ID:</p>
                <span className="font-mono">{wallet.chainId ? wallet.chainId.toString() : '未获取'}</span>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold">签名者:</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  wallet.signer ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {wallet.signer ? '可用' : '不可用'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={() => wallet.connect('MetaMask')}
            disabled={wallet.isConnected}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            🚀 连接 MetaMask 钱包
          </Button>
          <Button 
            onClick={wallet.disconnect}
            disabled={!wallet.isConnected}
            className="bg-red-600 hover:bg-red-700"
            size="lg"
          >
            🚫 断开连接
          </Button>
        </div>

        {/* 子组件展示 - 关键区别 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            🎯 多组件状态同步演示
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ChildComponent1 />
            <ChildComponent2 />
          </div>
        </div>
      </div>
    </div>
  );
};

// 导出带有 WalletProvider 包裹的组件
const TestProvider: React.FC = () => {
  return (
    <WalletProvider>
      <TestComponent />
    </WalletProvider>
  );
};
export default TestProvider;
