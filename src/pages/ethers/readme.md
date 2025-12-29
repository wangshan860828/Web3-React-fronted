# 以太坊合约事件监听开发高频易踩坑总结
按「问题类型+处理方案+示例」整理，方便后期开发查阅

---

## 一、事件参数相关（核心基础）

### 1. 非索引参数类型与精度处理
**问题**：`uint256`/`int256` 类型参数用 `number` 接收会精度丢失
**注意点**：
- 数值类型必须用 `bigint` 接收
- 金额转换用 `ethers.formatEther`（或 `formatGwei`/`formatUnits`），禁止手动除法
**错误示例**：
```typescript
const handleEvent = (amount: number) => {
  const ethAmount = amount / 1e18; // 手动转换，精度丢失
};
```
**正确示例**：
```typescript
const handleEvent = (amount: bigint) => {
  const ethAmount = ethers.formatEther(amount);
  // 计算用 bigint：amount + 100n
};
```

### 2. 数组/结构体参数解析
**问题**：数组/结构体参数按普通参数接收会解析失败
**注意点**：
- 数组直接用 `Array` 接收
- 结构体参数在 `event.args` 中以对象形式返回
**合约示例**：
```solidity
struct DonateInfo { address funder; uint256 amount; }
event Donated(DonateInfo info, string[] tags);
```
**前端解析**：
```typescript
const handleDonatedEvent = (event: EventLog) => {
  const { info, tags } = event.args;
  console.log(info.funder, tags);
};
```

### 3. bool 参数兼容性
**问题**：旧版/跨链合约 bool 可能被解析为 `0`/`1`
**注意点**：接收后显式转换为布尔值
**示例**：
```typescript
const handleEvent = (isSuccess: boolean | number) => {
  const success = Boolean(isSuccess);
  if (success) { /* 处理 */ }
};
```

---

## 二、事件监听/取消（内存泄漏+有效性）

### 1. 组件卸载必须取消监听
**问题**：未取消会导致内存泄漏或异常
**注意点**：
- 用**具名函数**作回调（固定引用）
- 卸载时调用 `contract.off()`
**错误示例**：
```typescript
useEffect(() => {
  contract.on("Funded", (e) => { /* 逻辑 */ });
  return () => { contract.off("Funded", (e) => { /* 无效 */ }); };
}, []);
```
**正确示例**：
```typescript
useEffect(() => {
  const handleFund = (e: EventLog) => { /* 逻辑 */ };
  contract.on("Funded", handleFund);
  return () => { contract.off("Funded", handleFund); };
}, [contract]);
```

### 2. 过滤器正确使用
**问题**：参数错误/过滤条件不匹配→监听不到事件
**注意点**：
- indexed 参数：地址传字符串，数值传 `bigint`/十六进制
- 多 indexed 参数：按顺序传值，无需过滤传 `null`
**合约示例**：
```solidity
event Funded(address indexed funder, uint256 indexed amount, string memo);
```
**过滤示例**：
```typescript
// 过滤指定地址
const filter = contract.filters.Funded("0x123...abc", null);
// 过滤 1 ETH
const filter2 = contract.filters.Funded(null, ethers.parseEther("1"));
```

### 3. 历史事件查询
**问题**：默认只监未来事件，历史需用 `queryFilter`
**注意点**：
- 异步操作，需 `async/await`
- 可指定区块范围避免性能问题
- 历史与实时事件合并去重
**示例**：
```typescript
useEffect(() => {
  const fetchHistory = async () => {
    const filter = contract.filters.Funded();
    const history = await contract.queryFilter(filter, 1000000, "latest");
    setFundEvents(history.map(e => ({ from: e.args.funder, amount: ethers.formatEther(e.args.amount) })));
  };
  fetchHistory();
  // 监听未来事件
  const handleNew = (e: EventLog) => {
    setFundEvents(p => p.some(i => i.tx === e.transactionHash) ? p : [...p, { from: e.args.funder, amount: ethers.formatEther(e.args.amount) }]);
  };
  contract.on(filter, handleNew);
  return () => contract.off(filter, handleNew);
}, [contract]);
```

---

## 三、数据可靠性（去重+异常处理）

### 1. 事件去重
**问题**：区块链分叉/重放→重复事件
**注意点**：用 `transactionHash + logIndex` 作为唯一键
**示例**：
```typescript
setFundEvents(p => {
  const isDuplicate = p.some(i => i.tx === e.transactionHash && i.logIndex === e.logIndex);
  return isDuplicate ? p : [...p, newEvent];
});
```

### 2. 异常捕获
**问题**：合约升级/ABI 不匹配→解析失败
**注意点**：所有处理逻辑包裹 `try/catch`
**示例**：
```typescript
const handleFund = (e: EventLog) => {
  try {
    const { funder, amount } = e.args;
    const amt = ethers.formatEther(amount);
    // 更新状态
  } catch (err) {
    console.error("解析失败：", err, e);
  }
};
```

### 3. 跨链/测试网兼容性
**问题**：不同链/测试网区块确认速度/广播延迟不同
**注意点**：
- 测试网可增加重复查询逻辑
- 复杂参数拆分或通过合约接口查询

---

## 四、ABI 与合约配置

### 1. ABI 必须完整
**问题**：缺失/错误事件定义→监听失败/参数错位
**注意点**：
- 从编译产物直接复制 ABI（禁止手动修改）
- 合约升级需同步更新 ABI

### 2. 链ID匹配
**问题**：前端连接链ID与合约部署链ID不一致→无效
**注意点**：
- 初始化前验证链ID
- 跨链应用提供切换功能
**示例**：
```typescript
useEffect(() => {
  const checkChain = async () => {
    const net = await new ethers.BrowserProvider(window.ethereum).getNetwork();
    const DEPLOY_CHAIN = 11155111; // Sepolia
    if (net.chainId !== DEPLOY_CHAIN) { alert("切换到 Sepolia"); return; }
    const contract = new ethers.Contract(ADDR, ABI, provider);
  };
  checkChain();
}, []);
```

---

## 五、性能优化

### 1. 限制事件数组长度
**问题**：事件频繁→数组无限增长→卡顿
**注意点**：
- 只保留最近 N 条
- 如需更多用分页查询
**示例**：
```typescript
setFundEvents(p => [...p, newEvent].slice(-100));
```

### 2. 避免回调中 heavy 操作
**问题**：复杂计算/同步请求→阻塞主线程
**注意点**：
- 回调只做格式化+状态更新
- 复杂操作延迟执行
**示例**：
```typescript
const handleFund = (e: EventLog) => {
  try {
    const newEv = { /* 格式化 */ };
    setFundEvents(p => [...p, newEv]);
    // 复杂操作延迟
    queueMicrotask(() => { calculateTotal(); reportEvent(newEv); });
  } catch (err) { /* 处理 */ }
};
```

---

## 开发 Checklist（快速自查）
1. 事件名/ABI 与合约一致
2. 数值用 `bigint`，金额转换用 `ethers`
3. 具名函数监听，卸载必取消
4. 事件去重（`tx + logIndex`）
5. 回调逻辑包裹 `try/catch`
6. 链ID与部署链匹配
7. 历史用 `queryFilter`，未来用 `on`
8. 避免回调中 heavy 操作

覆盖 90%+ 问题，后期直接对照自查！