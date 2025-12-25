import { useState } from 'react';
import { validateEthAddress } from '@/utils';

export default function TestUtilPage() {
  const [address, setAddress] = useState<string>('');
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">工具测试页面</h1>
      
      <div className="space-y-4 max-w-md">
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
    </div>
  );
};
