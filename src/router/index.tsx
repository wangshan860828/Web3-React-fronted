import { createBrowserRouter } from 'react-router'
import Ethers from '../pages/ethers'

const router = createBrowserRouter([
    {
        path: '/',
        Component: Ethers
    }
])

export default router