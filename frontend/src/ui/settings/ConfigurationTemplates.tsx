// ConfigurationTemplates.tsx
import React from 'react';
import {useConfig} from "../providers/ConfigContext";

interface Template {
    name: string;
    description: string;
    compatible_clients: string[];
}

const ConfigurationTemplates: React.FC = () => {
    const {templates, applyTemplate, loading} = useConfig();
    const handleApplyTemplate = async (templateName: string): Promise<void> => {
        await applyTemplate(templateName);
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                Configuration Templates
            </h2>
            <p className="text-slate-600 mb-6 italic">Apply pre-configured templates for different client devices:</p>

            <div className="grid grid-cols-2 gap-6">
                {templates.map((template: Template, index: number) => (
                    <div key={index}
                         className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-4 px-5">
                            <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                        </div>
                        <div className="p-5">
                            <p className="text-slate-700 mb-4">{template.description}</p>

                            <div className="mb-5">
                                <strong className="text-slate-800 font-medium flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500"
                                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    Compatible Clients:
                                </strong>
                                <ul className="mt-2 pl-5 space-y-1">
                                    {template.compatible_clients.map((client: string, clientIndex: number) => (
                                        <li key={clientIndex} className="text-slate-600 flex items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mr-2"></span>
                                            {client}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => handleApplyTemplate(template.name)}
                                disabled={loading}
                                className={`w-full py-2 px-4 rounded-md font-medium text-white transition-all duration-200 flex justify-center items-center 
              ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50'}`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M5 13l4 4L19 7"/>
                                        </svg>
                                        Apply Template
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConfigurationTemplates;