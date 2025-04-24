// import "./DashBoard.css"
// import "./utilities.css"
import "./main.scss"
import SideBar from "./SideBar.tsx";
import Header from "./Header.tsx";
import React from "react";

export default function Layout({children}: {
    children: React.ReactNode
}) {
    // useEffect(() => {
    //     request.post(Config.baseURL + "/api/start-up/")
    //         .then(res => {
    //             const data = res.data as StartResponse;
    //             setCount("users", data.users)
    //             setCount("package", data.packages)
    //             setCount("router", data.routers)
    //             currentUser(data.user)
    //         }).catch(err => {
    //         console.log(err);
    //     });
    // }, []);
    return (
        <div className={"bg-[#f5f9fc] dark:bg-[#081324] min-h-screen"}>
            <Header/>
            <SideBar/>
            <div className="md:ml-74">
                <div
                    className="b-white dark:bg-gray-700 mt-14">
                    {children}
                </div>
            </div>
        </div>
    )
}