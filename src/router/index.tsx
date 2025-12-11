import { createBrowserRouter } from 'react-router'
import Ethers from '../pages/ethers'
import GanacheRpc from '../pages/ethers/ganacheRpc'

const router = createBrowserRouter([
    {
        path: '/',
        Component: Ethers
    },
    {
        path: '/ganache',
        Component: GanacheRpc
    }
])

export default router