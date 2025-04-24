import {BrowserRouter} from 'react-router-dom'
import './App.css'
import {useEffect} from 'react';
import 'nprogress/nprogress.css';
import RouterAwareApp from "./Roter.tsx";


export default function App() {
    useEffect(() => {
        // initializeCsrfToken().then()
    }, []);
    return (
        <BrowserRouter>
            <RouterAwareApp/>
        </BrowserRouter>
    )
}
