import {useState} from 'react';

export default function ClientDetails({client}: { client: VPNClient }) {
    const [isRevoking, setIsRevoking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    // Example client data for preview
    const clientData = client || {
        name: "corp-vpn-client-05",
        connected: true,
        created: "April 22, 2025, 14:32",
        ip: "10.8.0.12",
        last_seen: "3 hours ago",
        transferUp: "1.25 GB",
        transferDown: "3.72 GB",
        bandwidth: "1.2 Mbps",
        device: "MacBook Pro (macOS 14.2)"
    };

    const handleAction = (action:any) => {
        setModalAction(action);
        setShowModal(true);
    };

    const confirmAction = () => {
        if (modalAction === 'revoke') {
            setIsRevoking(true);
            // Simulate API call
            setTimeout(() => setIsRevoking(false), 2000);
        } else if (modalAction === 'delete') {
            setIsDeleting(true);
            // Simulate API call
            setTimeout(() => setIsDeleting(false), 2000);
        }
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
              <span className="relative">
                <span className="absolute -left-4 -top-4">
                  <svg className="w-8 h-8 text-indigo-500 opacity-50" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M9.5,3C7.56,3 6,4.56 6,6.5C6,8.44 7.56,10 9.5,10C11.44,10 13,8.44 13,6.5C13,4.56 11.44,3 9.5,3M9.5,5C10.33,5 11,5.67 11,6.5C11,7.33 10.33,8 9.5,8C8.67,8 8,7.33 8,6.5C8,5.67 8.67,5 9.5,5M12.27,14H16.17L16.5,15H13.04C12.7,15 12.4,15.23 12.31,15.55L11.6,18.43C11.35,19.34 10.86,20 9.5,20C8.4,20 7.96,19.33 7.6,18.32L6.3,14.35C6.04,13.32 6.92,12.29 8,12.57L10.5,13.17L12.27,14M21,18.5C21,19.88 19.88,21 18.5,21H14.5C13.12,21 12,19.88 12,18.5V17H14V18.5C14,18.78 14.22,19 14.5,19H18.5C18.78,19 19,18.78 19,18.5V14.5C19,14.22 18.78,14 18.5,14H14.5C14.22,14 14,14.22 14,14.5V15H12V14.5C12,13.12 13.12,12 14.5,12H18.5C19.88,12 21,13.12 21,14.5V18.5Z"/>
                  </svg>
                </span>
                Client:
              </span>
                            <span
                                className="ml-7 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {clientData.name}
              </span>
                        </h2>
                        <p className="text-slate-500 mt-1 ml-2">Manage your VPN client connection and settings</p>
                    </div>
                    <a
                        href="#"
                        className="group flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-white shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200"
                    >
                        <svg className="w-5 h-5 mr-2 text-slate-400 group-hover:text-indigo-500" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Back to Dashboard
                    </a>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Client Information Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
                            <div
                                className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-white flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    Client Information
                                </h3>
                                <div
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${clientData.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                    {clientData.connected ? 'Active' : 'Inactive'}
                                </div>
                            </div>

                            {/* Client Details */}
                            <div className="p-6 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-slate-500">Name</span>
                                                <span
                                                    className="text-sm font-bold text-slate-800">{clientData.name}</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-slate-500">Status</span>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${clientData.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          <span
                              className={`w-2 h-2 mr-1 rounded-full ${clientData.connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                    {clientData.connected ? 'Connected' : 'Disconnected'}
                        </span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-slate-500">Created</span>
                                                <span className="text-sm text-slate-800">{clientData.created}</span>
                                            </div>
                                        </div>

                                        {clientData.connected && (
                                            <>
                                                <div className="bg-slate-50 rounded-lg p-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-slate-500">VPN IP Address</span>
                                                        <span
                                                            className="text-sm font-mono bg-indigo-50 px-2 py-0.5 rounded text-indigo-700">{clientData.ip}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 rounded-lg p-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-slate-500">Connected Since</span>
                                                        <span
                                                            className="text-sm text-slate-800">{clientData.last_seen}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Right Column - Additional Stats */}
                                    <div className="space-y-4">
                                        {clientData.connected && (
                                            <>
                                                <div className="bg-slate-50 rounded-lg p-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-500 mb-1">Data Transfer</span>
                                                        <div className="mt-1 relative pt-1">
                                                            <div className="flex mb-2 items-center justify-between">
                                                                <div>
                                  <span
                                      className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                    Upload
                                  </span>
                                                                </div>
                                                                <div className="text-right">
                                  <span className="text-xs font-semibold inline-block text-indigo-600">
                                    {clientData.transferUp}
                                  </span>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                                                                <div style={{width: "30%"}}
                                                                     className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                                                            </div>
                                                            <div className="flex mb-2 items-center justify-between">
                                                                <div>
                                  <span
                                      className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                    Download
                                  </span>
                                                                </div>
                                                                <div className="text-right">
                                  <span className="text-xs font-semibold inline-block text-indigo-600">
                                    {clientData.transferDown}
                                  </span>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-indigo-200">
                                                                <div style={{width: "70%"}}
                                                                     className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 rounded-lg p-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-slate-500">Current Bandwidth</span>
                                                        <span
                                                            className="text-sm font-semibold text-slate-800">{clientData.bandwidth}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 rounded-lg p-4">
                                                    <div className="flex justify-between">
                                                        <span
                                                            className="text-sm font-medium text-slate-500">Device</span>
                                                        <span
                                                            className="text-sm text-slate-800">{clientData.device}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="space-y-6">
                        {/* Actions Card */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4">
                                <h3 className="text-lg font-semibold text-white flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                    </svg>
                                    Actions
                                </h3>
                            </div>

                            <div className="p-6 space-y-4">
                                <a
                                    href="#"
                                    className="group w-full flex items-center justify-center px-5 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-all duration-200"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                    </svg>
                                    Download Configuration
                                </a>

                                <button
                                    onClick={() => handleAction('revoke')}
                                    className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200"
                                    disabled={isRevoking}
                                >
                                    {isRevoking ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2 text-amber-700"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"
                                                 stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                                            </svg>
                                            Revoke Access
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleAction('delete')}
                                    className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2 text-red-700"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"
                                                 stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                            Delete Client
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* QR Code Card */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
                            <div className="bg-gradient-to-r from-sky-600 to-sky-800 px-6 py-4">
                                <h3 className="text-lg font-semibold text-white flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                    </svg>
                                    QR Code
                                </h3>
                            </div>

                            <div className="p-6 text-center">
                                <div
                                    className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                    <svg className="w-24 h-24 mx-auto text-sky-700 opacity-60" viewBox="0 0 24 24"
                                         fill="currentColor">
                                        <path
                                            d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H11V13H9V11M15,11H17V13H19V11H21V13H19V15H21V19H19V21H17V19H13V21H11V17H15V15H17V13H15V11M19,19V15H17V19H19M15,3H21V9H15V3M17,5V7H19V5H17M3,3H9V9H3V3M5,5V7H7V5H5M3,15H9V21H3V15M5,17V19H7V17H5Z"/>
                                    </svg>
                                    <p className="mt-4 text-sm text-blue-700">
                                        QR code for mobile devices will be available in a future update.
                                    </p>
                                </div>

                                <button
                                    className="mt-4 flex items-center justify-center mx-auto px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    Request Early Access
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div
                        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"
                              aria-hidden="true">&#8203;</span>

                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div
                                        className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${modalAction === 'revoke' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                                        <svg
                                            className={`h-6 w-6 ${modalAction === 'revoke' ? 'text-yellow-600' : 'text-red-600'}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {modalAction === 'revoke' ? 'Revoke Client Access' : 'Delete Client'}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {modalAction === 'revoke'
                                                    ? "Are you sure you want to revoke this client's access? This will disconnect the client and prevent future connections until you restore access."
                                                    : "Are you sure you want to delete this client? This will permanently remove all client files and configuration data. This action cannot be undone."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                                        modalAction === 'revoke'
                                            ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                    }`}
                                    onClick={confirmAction}
                                >
                                    {modalAction === 'revoke' ? 'Revoke Access' : 'Delete'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}