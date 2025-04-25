import {useEffect} from 'react';
import {Routes, Route, useLocation} from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import HomePage from "./pages/Home.tsx";
import ClientsPage from "./pages/ClientsPage.tsx";
import SignInPage from "./pages/auth/SignInPage.tsx";
import PackagesPage from "./pages/PackagesPage.tsx";
import RoutersPage from "./pages/RoutersPage.tsx";
import {AppProvider} from "./ui/AppContext.tsx";
import ISPPage from "./pages/ISPPage.tsx";
import SignUpPage from "./pages/auth/SignUpPage.tsx";
import RouterView from "./pages/RouterView.tsx";
import PaymentAndBillingPage from "./pages/PaymentAndBillingPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import SecurityPage from "./pages/SecurityPage.tsx";
import CreateClient from "./ui/CreateClient.tsx";
import ClientDetailPage from "./pages/ClientDetailPage.tsx";

function RouterAwareApp() {
    const location = useLocation();

    useEffect(() => {
        NProgress.start();
        NProgress.done();
    }, [location]);

    return (
        <AppProvider>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/clients" element={<ClientsPage/>}/>
                <Route path="/client/:name" element={<ClientDetailPage/>}/>
                <Route path="/clients/create" element={<CreateClient/>}/>
                <Route path="/isp/" element={<ISPPage/>}/>
                <Route path="/packages/" element={<PackagesPage/>}/>
                <Route path="/payments/" element={<PaymentAndBillingPage/>}/>
                <Route path="/mikrotiks/" element={<RoutersPage/>}/>
                <Route path="/mikrotiks/:pk/" element={<RouterView/>}/>
                <Route path="/login" element={<SignInPage/>}/>
                <Route path="/settings" element={<SettingsPage/>}/>
                <Route path="/security" element={<SecurityPage/>}/>
                <Route path="/auth/register/" element={<SignUpPage/>}/>
            </Routes>
        </AppProvider>
    );
}

export default RouterAwareApp;