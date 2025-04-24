import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './theme.min.js'

createRoot(document.getElementById('app-layout')!).render(
    <App/>,
)
