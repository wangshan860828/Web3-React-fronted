import { createBrowserRouter } from 'react-router'
import Ethers from '../pages/ethers'
import GanacheRpc from '../pages/ethers/ganacheRpc'
import InteractContract from '../pages/ethers/interactContract'
import TestUtilPage from '../pages/testUtils'

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
])

export default router