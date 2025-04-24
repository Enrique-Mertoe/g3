import React, {createContext, useContext, useState} from "react";
import {DialogProvider} from "./providers/DialogProvider.tsx";

type AppContextType = {
    usersCount: number;
    packageCount: number;
    routerCount: number;
    smsCount: number;
    ticketsCount: number;
    activeUsersCount: number;
    leadsCount: number;
    currentUser: (info?: UserInfo) => UserInfo | null;
    page: (page?: string) => string | void;
    setCount: (type: "users" | "package" | "router" | "sms" | "tickets" | "activeUsers" | "leads", count: number) => void;
};

const Context = createContext<AppContextType>({} as AppContextType)
export const AppProvider = ({children}: {
    children: React.ReactNode
}) => {

    const [usersCount, setUsersCount] = useState(0);
    const [packageCount, setPackageCount] = useState(0);
    const [routerCount, setRouterCount] = useState(0);
    const [smsCount, setSmsCount] = useState(0);
    const [ticketsCount, setTicketsCount] = useState(0);
    const [activeUsersCount, setActiveUsersCount] = useState(0);
    const [leadsCount, setLeadsCount] = useState(0);
    const [user, setUser] = useState<UserInfo | null>(null)
    const [cPage, setPage] = useState(location.pathname)
    const setCount = (type: "users" | "package" | "router" | "sms" | "tickets" | "activeUsers" | "leads", count: number) => {
        switch (type) {
            case "users":
                setUsersCount(count);
                break;
            case "package":
                setPackageCount(count);
                break;
            case "router":
                setRouterCount(count);
                break;
            case "sms":
                setSmsCount(count);
                break;
            case "tickets":
                setTicketsCount(count);
                break;
            case "activeUsers":
                setActiveUsersCount(count);
                break;
            case "leads":
                setLeadsCount(count);
                break;
        }
    };
    const currentUser = (info?: UserInfo): UserInfo | null => {
        if (!info)
            return user
        setUser(info)
        return info
    }
    const page = (page?: string): string | void => {
        if (!page)
            return cPage
        setPage(page)
        return page
    }

    const handler: AppContextType = {
        usersCount,
        packageCount,
        routerCount,
        smsCount,
        ticketsCount,
        activeUsersCount,
        leadsCount,
        setCount,
        currentUser, page
    };
    return (
        <Context.Provider
            value={handler}
        >
            <DialogProvider>
                {children}
            </DialogProvider>
        </Context.Provider>
    )
}

export function useApp() {
    const ctx = useContext(Context)
    if (!ctx)
        throw new Error("useApp must be called Inside AppProvider")
    return ctx
}