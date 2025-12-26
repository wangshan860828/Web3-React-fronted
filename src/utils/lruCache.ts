import { LRUCache } from 'lru-cache';

// ttl: 5 minutes 代表缓存的有效期为5分钟
// max: 100 代表缓存的最大数量为100个
const cache = new LRUCache({ 
  max: 100, 
  ttl: 1000 * 60 * 1 // 1 minute
});

const getCacheKey = (chainId: number, type: string, key: string) => {
    return `chain:${chainId}:${type}:${key}`
}

const getCacheValue = (chainId: number, type: string, key: string) => {
    return cache.get(getCacheKey(chainId, type, key))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setCacheValue = (chainId: number, type: string, key: string, value: any) => {
    cache.set(getCacheKey(chainId, type, key), value)
}

const clearOtherChainCaches = (currentChainId: number) => {
    cache.forEach((_, key) => {
        if (!(key as string).startsWith(`chain:${currentChainId}:`)) {
            cache.delete(key)
        }
    })
}

export { cache, getCacheKey, getCacheValue, setCacheValue, clearOtherChainCaches }