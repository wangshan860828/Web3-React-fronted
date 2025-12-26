import { useState } from 'react';
import { validateEthAddress } from '@/utils';
import { cache, setCacheValue } from '@/utils/lruCache'; 

export default function TestUtilPage() {
  const [address, setAddress] = useState<string>('');
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cacheData, setCacheData] = useState<Array<{ key: string; data: any }>>([]);

  const handleValidation = () => {
    if (!address.trim()) {
      setResult({ valid: false, message: '请输入地址' });
      return;
    }
    
    const isValid = validateEthAddress(address);
    
    if (isValid) {
      setResult({ valid: true, message: '地址有效！' });
    } else {
      setResult({ valid: false, message: '地址无效，请检查格式' });
    }
  };

  const storeTestData = () => {
    // 存储测试数据到缓存
    const testDataList = [
      { chainId: 1, type: 'user', key: 'wallet1', value: { address: '0x1234...5678', balance: '10 ETH' } },
      { chainId: 1, type: 'transaction', key: 'tx1', value: { hash: '0xabc123...', status: 'success' } },
      { chainId: 5, type: 'user', key: 'wallet2', value: { address: '0x8765...4321', balance: '5 ETH' } }
    ];

    testDataList.forEach(item => {
      setCacheValue(item.chainId, item.type, item.key, item.value);
    });

    // 更新缓存数据显示
    updateCacheDisplay();
  };

  const updateCacheDisplay = () => {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Array<{ key: string; data: any }> = [];
    cache.forEach((value, key) => {
      data.push({ key: String(key), data: value });
    });
    setCacheData(data);
  };

  return (
    <>
    <h1 className="text-2xl font-bold mb-6">工具测试页面</h1>
    <div className="p-6 flex flex-row gap-8">
      <div className="box-1 space-y-6 w-1/4">
        <div>
          <label htmlFor="ethAddress" className="block text-sm font-medium text-gray-700 mb-1">
            以太坊地址验证
          </label>
          <input
            type="text"
            id="ethAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="输入以太坊地址（如：0x1234...5678）"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={handleValidation}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          验证地址
        </button>
        
        {result && (
          <div
            className={`p-3 rounded-md ${result.valid ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}
          >
            {result.message}
          </div>
        )}
      </div>
      <div className="box-2 space-y-6 w-1/4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LRU缓存测试
          </label>
          <button
            onClick={storeTestData}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            存储测试数据到缓存
          </button>
          <button
            onClick={updateCacheDisplay}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            更新缓存显示
          </button>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">缓存内容：</h3>
          <ul className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
            {cacheData.length === 0 ? (
              <li className="text-gray-500 text-sm">暂无缓存数据</li>
            ) : (
              cacheData.map((item, index) => (
                <li key={index} className="mb-3 p-2 bg-gray-50 rounded">
                  <div className="text-xs font-semibold text-gray-800 mb-1">Key: {item.key}</div>
                  <div className="text-xs text-gray-600">Data: {JSON.stringify(item.data)}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
    </>
  );
};