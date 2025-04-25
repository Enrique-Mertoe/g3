import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useApp} from "../../ui/AppContext.tsx";
import Signal from "../../lib/Signal.ts";

export default function SideBar() {
    const [isOpen, setIsOpen] = useState(false)
    const {
        usersCount,
    } = useApp();

    const navItems: (NavItemType | "divider")[] = [
        {label: "Dashboard", icon: "bi-speedometer2", link: "/"},
        "divider",
        {label: "Clients", icon: "bi-person-lines-fill", link: "/clients", badge: usersCount},
        {label: "Create Client", icon: "bi-person-plus-fill", link: "/clients/create"},
        "divider",
        {label: "Server Logs", icon: "bi-file-earmark-text", link: "/server-logs"},
        {label: "Statistics", icon: "bi-bar-chart-line", link: "/statistics"},
        "divider",
        {label: "Security", icon: "bi-shield-lock", link: "/security"},
        "divider",
        {label: "Settings", icon: "bi-gear", link: "/settings"},
    ];

    useEffect(() => {
        Signal.on("drawer", e => {
            if (e === 'logo-sidebar')
                setIsOpen(prev => !prev)
        })
    }, []);

    return (
        <>
            <aside id="logo-sidebar"
                   className={`fixed top-0 left-0 z-40 w-74 h-screen bg-white  pt-20 transition-transform 
                       bg-white border-r border-gray-200 md:translate-x-0
                       ${
                       isOpen ? 'show' : "-translate-x-full"
                   }
                       dark:bg-gray-800 dark:border-gray-700
                       main-sidebar
                       `}
                   aria-label="Sidebar">

                <div className="h-full vstack overflow-y-auto pb-6  bg-white dark:bg-gray-800">
                    <div className=" flex-grow-1">
                        <NavList navItems={navItems}/>
                    </div>
                </div>
            </aside>
            {isOpen &&
                <div className="sdb-backdrop md:hidden show"></div>}
        </>
    )
}

const NavList = function ({navItems}: { navItems: (NavItemType | "divider")[] }) {
    const navigate = useNavigate();
    const {page} = useApp()
    const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, link: string) => {
        e.preventDefault();
        page(link)
        navigate(link);

    };

    return (
        <>
            <ul className="space-y-2  font-medium pe-1">
                {navItems.map((item, index) => {
                    if (item === "divider") {
                        return <hr key={index} className="my-2 border-gray-300"/>;
                    }

                    return (
                        <li key={index} className="flex items-center">
                            <a
                                href={item.link}
                                onClick={item.link.startsWith("/") ? (e) => handleNavigation(e, item.link) : undefined}
                                className={`flex items-center 
                                ${
                                    page() == item.link ? "bg-gray-200 dark:bg-gray-600" : ""
                                }
                                w-full ps-6 p-2 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-full transition`}
                            >
                                <i className={`bi ${item.icon} text-lg me-3`}></i>
                                <span className="flex-1">{item.label}</span>

                                {item.badge !== undefined && (
                                    <span
                                        className="ms-auto h-6 w-6 flex justify-center items-center text-xs text-gray-700 rounded-full bg-amber-200">
                  {item.badge}
                </span>
                                )}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </>
    )
}