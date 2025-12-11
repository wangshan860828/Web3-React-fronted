import { createBrowserRouter } from 'react-router'
import Ethers from '../pages/ethers'
import GanacheRpc from '../pages/ethers/ganacheRpc'
import InteractContract from '../pages/ethers/interactContract'

const router = createBrowserRouter([
    {
        path: '/',
        Component: Ethers
    },
    {
        path: '/ganache',
        Component: GanacheRpc
    },
    {
        path: '/interactContract',
        Component: InteractContract
    }
])

export default router