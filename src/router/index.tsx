import { createBrowserRouter } from 'react-router'
import Ethers from '../pages/ethers'
import GanacheRpc from '../pages/ethers/ganacheRpc'
import InteractContract from '../pages/ethers/interactContract'
import TestUtilPage from '../pages/testUtils'
import Wallet from '../pages/ethers/wallet'

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
    },
    {
        path: '/testUtil',
        Component: TestUtilPage
    },
    {
        path: '/wallet',
        Component: Wallet
    },
])

export default router