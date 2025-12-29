import { useState } from 'react'
import GanacheRpc from './ganacheRpc'
import Wallet from './wallet'
import TestUtilPage from '../testUtils'
import InteractContract from './interactContract'
import TestProvider from './testProvider'

// 添加临时类型声明
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any
  }
}

const navigationItems = [
  { name: '钱包', href: '/wallet', component: 'Wallet' },
  { name: 'Ganache RPC', href: '/ganache', component: 'GanacheRpc' },
  { name: '智能合约交互', href: '/interactContract', component: 'InteractContract' },
  { name: '测试工具', href: '/testUtil', component: 'TestUtil' },
  { name: '测试 Provider', href: '/test-provider', component: 'TestProvider' }
]

export default function Ethers() {
  const [currentView, setCurrentView] = useState<string>('Wallet')

  // 根据选择的视图渲染对应内容
  const renderContent = () => {
    switch (currentView) {
      case 'GanacheRpc':
        return <GanacheRpc />
      case 'Wallet':
        return <Wallet />
      case 'TestUtil':
        return <TestUtilPage />
      case 'InteractContract':
        return <InteractContract />
      case 'TestProvider':
        return <TestProvider />
      default:
        return <Wallet /> // 默认显示钱包页面
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 导航栏 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center">
          <h1 className="text-2xl font-bold text-white mr-8">Web3 应用</h1>
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setCurrentView(item.component)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === item.component
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'text-white hover:bg-white hover:bg-opacity-100 hover:text-indigo-600'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="grow p-8 bg-gray-50">
        {renderContent()}
      </div>
    </div>
  )
}