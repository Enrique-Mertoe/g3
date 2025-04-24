import Layout from "./home-components/Layout.tsx";

export default function PaymentAndBillingPage() {
    return (
        <Layout>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center">
                    <div className="w-full max-w-6xl">
                        {/* Header */}
                        <div className="mt-10">
                            <div className="mb-6">
                                <div className="mb-4">
                                    <h6 className="text-sm text-gray-500 uppercase">Overview</h6>
                                    <h1 className="text-3xl font-bold text-gray-900">Account</h1>
                                </div>

                                {/* Tabs */}
                                <div className="flex space-x-4 border-b border-gray-200">
                                    {[
                                        ['General', '/account-general'],
                                        ['Billing', '/account-billing', true],
                                        ['Members', '/account-members'],
                                        ['Security', '/account-security'],
                                        ['Notifications', '/account-notifications'],
                                    ].map(([label, href, active]) => (
                                        <a
                                            href={href as string}
                                            className={`px-4 py-2 text-sm font-medium border-b-2 ${
                                                active
                                                    ? 'text-blue-600 border-blue-600'
                                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {label}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Alert */}
                            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md flex items-center mb-6">
                                <svg
                                    className="w-5 h-5 mr-2 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                You are near your API limits.
                            </div>

                            {/* Cards Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Plan Card */}
                                <div className="bg-white shadow rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h6 className="text-xs uppercase text-gray-500 mb-1">
                                                Current plan
                                            </h6>
                                            <span className="text-2xl font-semibold">$29/mo</span>
                                        </div>
                                        <button
                                            className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">
                                            Upgrade
                                        </button>
                                    </div>
                                </div>

                                {/* API Usage */}
                                <div className="bg-white shadow rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h6 className="text-xs uppercase text-gray-500 mb-1 flex items-center gap-1">
                                                API usage
                                                <svg
                                                    className="w-4 h-4 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                                </svg>
                                            </h6>
                                            <span className="text-2xl font-semibold">
                      7,500 of 10,000
                    </span>
                                        </div>
                                        {/* Dummy sparkline placeholder */}
                                        <div className="w-[75px] h-[35px] bg-gray-100 rounded"/>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="bg-white shadow rounded-lg mb-6">
                                <div className="flex justify-between items-center border-b px-6 py-4">
                                    <h4 className="text-lg font-semibold">Payment methods</h4>
                                    <button
                                        className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">
                                        Add method
                                    </button>
                                </div>
                                <div className="divide-y">
                                    {[
                                        {
                                            name: 'Visa ending in 1234',
                                            expiry: 'Expires 3/2024',
                                            img: '/img/payment-methods/visa.svg',
                                            default: true,
                                        },
                                        {
                                            name: 'Mastercard ending in 1234',
                                            expiry: 'Expires 3/2024',
                                            img: '/img/payment-methods/mastercard.svg',
                                            default: false,
                                        },
                                    ].map((card, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between px-6 py-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={card.img}
                                                    alt="Payment method"
                                                    width={38}
                                                    height={24}
                                                />
                                                <div>
                                                    <h4 className="text-sm font-medium">{card.name}</h4>
                                                    <small className="text-gray-500">{card.expiry}</small>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {card.default && (
                                                    <span
                                                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          Default
                        </span>
                                                )}
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle cx="12" cy="5" r="1"/>
                                                        <circle cx="12" cy="12" r="1"/>
                                                        <circle cx="12" cy="19" r="1"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Invoices */}
                            <div className="bg-white shadow rounded-lg mb-6">
                                <div className="px-6 py-4 border-b">
                                    <h4 className="text-lg font-semibold">Invoices</h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-left">
                                        <thead className="uppercase bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-6 py-3">Invoice ID</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Amount</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {[
                                            ['10395', 'Apr 24, 2020', '$29.00', 'Outstanding'],
                                            ['10244', 'Mar 24, 2020', '$29.00', 'Paid'],
                                            ['10119', 'Feb 24, 2020', '$29.00', 'Paid'],
                                            ['10062', 'Jan 24, 2020', '$29.00', 'Paid'],
                                        ].map(([id, date, amount, status]) => (
                                            <tr key={id} className="border-t">
                                                <td className="px-6 py-3">
                                                    <a href="/invoice" className="text-blue-600">
                                                        Invoice #{id}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-3">{date}</td>
                                                <td className="px-6 py-3">{amount}</td>
                                                <td className="px-6 py-3">
                          <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                  status === 'Paid'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-200 text-gray-700'
                              }`}
                          >
                            {status}
                          </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Footer Note */}
                            <p className="text-center text-sm text-gray-500">
                                Don’t need Dashkit anymore?{' '}
                                <a href="#!" className="text-blue-600 hover:underline">
                                    Cancel your account
                                </a>
                            </p>
                            <br/>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
