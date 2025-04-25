import {useState} from 'react';
import {$} from "../build/request.ts";

export default function ClientForm() {
    const [clientName, setClientName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        setError('');

        if (!clientName.match(/^[a-zA-Z0-9]+$/)) {
            setError('Client name must contain only alphanumeric characters');
            return;
        }

        setIsSubmitting(true);

        $.post({
            url: "/api/add_client",
            data: {username: clientName}
        }).done(() => {
            setSuccess(true);
            setIsSubmitting(false);
            setTimeout(() => {
                setSuccess(false);
                setClientName('');
            }, 3000);
        }).catch(() => {
            setError('Failed to create client. Please try again.');
            setIsSubmitting(false);
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-0 md:py-10">
            <div className="overflow-hidden rounded-xl shadow-sm bg-white">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-amber-200 to-indigo-400 px-6 py-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <svg className="h-full w-full" viewBox="0 0 800 800">
                            <path d="M0,0 L800,0 L800,800 L0,800 Z" fill="none" stroke="currentColor"
                                  strokeWidth="2"></path>
                            <path d="M769,229 L389,229 L389,389 L769,389 Z" fill="none" stroke="currentColor"
                                  strokeWidth="2"></path>
                            <path d="M181,409 L181,769 L581,769 L581,409 Z" fill="none" stroke="currentColor"
                                  strokeWidth="2"></path>
                            <path d="M129,129 L389,129 L389,389 L129,389 Z" fill="none" stroke="currentColor"
                                  strokeWidth="2"></path>
                        </svg>
                    </div>
                    <h5 className="text-xl md:text-2xl font-bold text-white flex items-center relative z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20"
                             fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"/>
                        </svg>
                        New Client Information
                    </h5>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8">
                    {success ? (
                        <div className="text-center py-10">
                            <div
                                className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                            <h3 className="mt-3 text-lg font-medium text-gray-900">Client Created Successfully!</h3>
                            <p className="mt-2 text-sm text-gray-500">Your new client "{clientName}" has been
                                created.</p>
                            <div className="mt-4">
                                <button
                                    type="button"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={() => window.location.href = `/download/${clientName}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20"
                                         fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                              clipRule="evenodd"/>
                                    </svg>
                                    Download Configuration
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">Client
                                    Name</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div
                                        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400"
                                             viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd"
                                                  d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        className={`focus:ring-indigo-500 outline-0 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-3 ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : ''}`}
                                        id="client_name"
                                        name="client_name"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        required
                                        placeholder="Enter a unique name (alphanumeric only)"
                                    />
                                </div>
                                {error ? (
                                    <p className="mt-2 text-sm text-red-600">{error}</p>
                                ) : (
                                    <p className="mt-2 text-sm text-gray-500">
                                        This name will identify the client in the VPN network. Use only alphanumeric
                                        characters.
                                    </p>
                                )}
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg"
                                             viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd"
                                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            <span className="font-medium">Note:</span> After creating a client, you'll
                                            be able to download its configuration file.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${isSubmitting ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transform transition-all duration-200 ${!isSubmitting && 'hover:scale-[1.02]'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2"
                                                 viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd"
                                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                            Create Client
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}