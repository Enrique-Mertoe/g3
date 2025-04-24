import {useApp} from "../../ui/AppContext.tsx";

export default function Header({
                                   totalBills,
                                   totalPayments, billsThisMonth, paymentsThisMonth
                               }: {
    totalBills: DashResponse["totalBills"],
    totalPayments: DashResponse["totalPayments"],
    billsThisMonth: DashResponse["billsThisMonth"], paymentsThisMonth: DashResponse["paymentsThisMonth"]
}) {

    const user = useApp().currentUser()
    return (
        <header className="w-full">

            <div className="w-full px-4">
                <div className="border-b pt-6">
                    {/* Top header */}
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="flex-1">
                            <h1 className="text-2xl font-semibold tracking-tight flex items-center">
                                <span className="inline-block mr-3">👋</span>Hi, {user?.username}!
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap m-0">
                        {/* Amount this month */}
                        <div className="w-full md:w-1/2 xl:flex-1 p-2">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                <div className="p-4 flex items-center">
                                    <div className="flex-1">
                                        <h6 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                                            Total Bills
                                        </h6>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
            KSH {totalBills ?? 0}
          </span>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <svg
                                            width="25"
                                            height="25"
                                            className="text-gray-400 dark:text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 256 256"
                                            fill="currentColor"
                                        >
                                            <path d="M224.56,103.81C213.43,97.75..."/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 xl:flex-1 p-2">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                <div className="p-4 flex items-center">
                                    <div className="flex-1">
                                        <h6 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                                            Total payments
                                        </h6>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
           KSH {totalPayments ?? 0}
          </span>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <svg
                                            width="25"
                                            height="25"
                                            className="text-gray-400 dark:text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 256 256"
                                            fill="currentColor"
                                        >
                                            <path d="M224.56,103.81C213.43,97.75..."/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 xl:flex-1 p-2">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                <div className="p-4 flex items-center">
                                    <div className="flex-1">
                                        <h6 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                                            Bills This Month
                                        </h6>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
           KSH {billsThisMonth ?? 0}
          </span>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <svg
                                            width="25"
                                            height="25"
                                            className="text-gray-400 dark:text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 256 256"
                                            fill="currentColor"
                                        >
                                            <path d="M224.56,103.81C213.43,97.75..."/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 xl:flex-1 p-2">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                <div className="p-4 flex items-center">
                                    <div className="flex-1">
                                        <h6 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                                            Payments This Month
                                        </h6>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
           KSH {paymentsThisMonth ?? 0}
          </span>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <svg
                                            width="25"
                                            height="25"
                                            className="text-gray-400 dark:text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 256 256"
                                            fill="currentColor"
                                        >
                                            <path d="M224.56,103.81C213.43,97.75..."/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </header>
    );
}