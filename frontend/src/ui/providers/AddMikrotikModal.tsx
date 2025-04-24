import React, {useRef, useState} from "react";
import GIcon from "../components/Icons.tsx";
import {usePolling} from "../../hooks/usePolling.ts";
import {$} from "../../build/request.ts";

type RouterForm = {
    mtkName: string;
    location: string;
    ip: string;
    username: string;
    password: string;
};
export default function AddMikrotikModal() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<RouterForm>({
        mtkName: "MikroTik1",
        location: "",
        ip: "",
        username: "",
        password: ""
    });
    const [terminal, setTerminal] = useState<{
        txt: string; error?: string, display: string; status: '' | 'processing' | 'complete'
    }>({
        txt: '', display: '', status: ''
    })
    const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <label htmlFor="mtk-name"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            MikroTik Identity <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="mtkName"
                            id="mtk-name"
                            value={form.mtkName}
                            onChange={handleChange}
                            className="bg-gray-50 border-2 border-gray-300 outline-0 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Mikrotik---"
                            required
                        />
                        <p className="text-gray-500 my-4">The identity name of your Mikrotik device (System →
                            Identity)</p>
                        {terminal.status !== '' ?
                            <TerminalView info={terminal}/> : ''
                        }
                    </>
                );
            case 2:
                return (
                    <>
                        <label htmlFor="provision-cmd"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Provisioning Command
                        </label>
                        <textarea
                            id="provision-cmd"
                            className="bg-gray-50 border-2 border-gray-300 outline-0 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            rows={4}
                            placeholder="Paste provisioning command..."
                        />
                        <p className="text-gray-500 my-4">Paste the command to be run on your Mikrotik to automate
                            setup.</p>
                    </>
                );
            case 3:
                return (
                    <>
                        <label htmlFor="pppoe-setup"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            PPPoE / Hotspot Setup
                        </label>
                        <textarea
                            id="pppoe-setup"
                            className="bg-gray-50 border-2 border-gray-300 outline-0 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            rows={4}
                            placeholder="Paste your setup config here..."
                        />
                        <p className="text-gray-500 my-4">Provide your desired PPPoE / Hotspot setup script or
                            details.</p>
                    </>
                );
            default:
                return null;
        }
    };

    function handleSubmit() {
        setLoading(true);
        if (step == 1) {
            setTerminal(prev => ({...prev, status: 'processing', error: undefined}))
            $.post<{
                error?: string;
                script?: string;
                pvr_url?: string;
                rsc_file?: string;
            }>({
                url: "/api/routers/provision/",
                data: {}
            }).done(() => {
                setLoading(false)
            }).catch(err => {
                setTerminal(prev => ({...prev, error: err.message}))
            }).then(d => {
                if (d.data.error)
                    return setTerminal(prev => ({...prev, error: d.data.error}))
                const disp = `
<span class='text-purple-300'>:do</span> {
  <span class='text-teal-300'>:local</span> <span class='text-orange-300'>url</span> <span class='text-blue-300'>"${d.data.pvr_url}"</span>;
  <span class='text-teal-300'>/tool fetch</span> <span class='text-teal-300'>url=</span><span class='text-orange-300'>$url</span> <span class='text-teal-300'>dst-path=</span><span class='text-orange-300'>${d.data.rsc_file}</span>;
  <span class='text-purple-300'>:delay</span> <span class='text-orange-300'>2s</span>;
  <span class='text-teal-300'>/import</span> <span class='text-orange-300'>${d.data.rsc_file}</span>;
} <span class='text-teal-300'>on-error=</span> {
  <span class='text-purple-300'>:put</span> <span class='text-blue-300'>"Error occurred during configuration. Check internet and retry."</span>;
}`
                setTerminal({
                    txt: d.data.script || '',
                    display: disp,
                    error: undefined,
                    status: "complete",
                })
            })
        } else
            nextStep();

    }

    return (
        <div className={"max-h-[100rem] h-full overflow-y-auto overflow-x-hidden"}>
            <div className="vstack  p-5">
            <h2 className="font-bold text-xl mb-4">Add Mikrotik Device</h2>
            <p>
                To proceed with the onboarding, connect your Mikrotik router to enable automated provisioning and
                management.
            </p>

            {/* Stepper */}
            <ol className="flex mt-4 items-center justify-between shadow-sm px-2 py-3 rounded w-full mb-4 sm:mb-5">
                {[
                    {icon: "bi-wifi", label: "Connection", desc: "Basic device information"},
                    {icon: "bi-cpu", label: "Device Details", desc: "Provisioning command"},
                    {icon: "bi-router", label: "Service Setup", desc: "Configure PPPoE and Hotspot"},
                ].map((stepItem, index) => {
                    const isCompleted = step > index + 1;
                    const isCurrent = step === index + 1;
                    // const isFuture = step < index + 1;

                    return (
                        <li
                            key={index}
                            className={`relative flex w-full items-center gap-2 ${index < 2 ? 'after:content-[\'\'] after:w-full after:mx-3 after:h-1 after:border-b after:border-4 after:inline-block ' : ''} 
                    ${isCompleted ? 'text-green-600 after:border-green-200 dark:after:border-green-700'
                                : isCurrent ? 'text-blue-600 after:border-blue-200 dark:after:border-blue-700'
                                    : 'text-gray-500 after:border-gray-100 dark:after:border-gray-700'}`}
                        >
                            <div
                                className={`relative flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 
                        ${isCompleted ? 'bg-green-100 dark:bg-green-800'
                                    : isCurrent ? 'bg-blue-100 dark:bg-blue-800'
                                        : 'bg-gray-100 dark:bg-gray-700'}`}
                            >
                                <i className={`${stepItem.icon} text-lg lg:text-2xl ${isCompleted ? 'text-green-600 dark:text-green-300' : isCurrent ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}/>

                                {/* ✅ Floating check for completed steps */}
                                {isCompleted && (
                                    <span
                                        className="absolute -bottom-[.5px] -right-1 bi-check bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs ring-2 ring-white dark:ring-gray-800">
                        </span>
                                )}
                            </div>
                            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                <div className="font-semibold whitespace-nowrap">{stepItem.label}</div>
                                <div className="text-xs">{stepItem.desc}</div>
                            </div>
                        </li>
                    );
                })}
            </ol>


            {/* Form Content */}
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit()
            }}>
                {renderStepContent()}

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="text-gray-700 border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Go Back
                    </button>

                    <button
                        type="submit"
                        className="text-white bg-blue-700 hstack gap-2 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        {step < 3 ? 'Next Step' : 'Finish Setup'}
                        {loading && <GIcon name={"g-loader"} color={"fill-amber-500"}/>}
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
}


interface TerminalViewProps {
    info: {
        txt: string; display: string; status: '' | 'processing' | 'complete',
        error?: string
    };
}

interface DataItem {
    id: number;
    value: string;
}

const TerminalView: React.FC<TerminalViewProps> = ({info}) => {
    const [copied, setCopied] = useState(false);
    const fetchData = async (): Promise<DataItem[]> => {
        const response = await fetch('https://api.example.com/data');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        return response.json();
    };
    usePolling({
        fetchFn: fetchData,
        respectVisibility: true,
        fetchOnMount: true,
        onSuccess: (data) => console.log('Successfully fetched data:', data),
        onError: (error) => console.error('Error fetching data:', error),
        onNetworkError: () => {
            // console.error('Network connectivity issue:', error);
        }
    });
    const copyBtnRef = useRef<HTMLButtonElement>(null);

    const handleCopy = () => {
        const compactScript = info.txt.replace(/\s+/g, ' ');

        // Try the modern approach first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(compactScript)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(fallbackCopy);
        } else {
            // Fall back to older methods if clipboard API isn't available
            // (e.g., when running on non-HTTPS or IP address)
            fallbackCopy();
        }

        function fallbackCopy() {
            try {
                // Method 1: execCommand approach
                const tempEl = document.createElement("textarea");
                tempEl.value = compactScript;
                tempEl.setAttribute("readonly", "");
                tempEl.style.position = "absolute";
                tempEl.style.left = "-9999px";
                document.body.appendChild(tempEl);

                // For mobile devices
                if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
                    tempEl.contentEditable = String(true);
                    tempEl.readOnly = false;
                    const range = document.createRange();
                    range.selectNodeContents(tempEl);
                    const selection = window.getSelection();
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                    tempEl.setSelectionRange(0, 999999);
                } else {
                    tempEl.select();
                }

                const success = document.execCommand("copy");
                document.body.removeChild(tempEl);

                if (success) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } else {
                    // Method 2: Show manual copy instruction if execCommand also fails
                    alert("Please press Ctrl+C to copy the script");
                }
            } catch{
                prompt("Copy this script manually:", compactScript);
            }
        }
    };

    return (
        <>
            {
                info.status === "complete" ?
                    <div className="relative max-w-4xl mx-auto mb-8 select-none">
                        <button
                            type={"button"}
                            ref={copyBtnRef}
                            onClick={handleCopy}
                            className={`absolute top-2 right-2 px-3 py-1 text-sm rounded bg-gray-700 text-white transition-all
          ${copied ? 'bg-green-600' : 'hover:bg-gray-600'}`}
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>

                        <div
                            className="bg-[#151515] text-[#ccc] p-3 font-mono px-3 pr-4 rounded-lg  break-words overflow-x-hidden"
                        >
                <span className="text-white mb-5"> <i className="bi-terminal mb-3"></i> <br/>Copy and paste this command on your MikroTik Terminal

                </span>
                            <pre
                                className="whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{__html: info.display}}
                            />
                            <div className="vstack">
                    <span className="text-white my-3 mt-5 ms-auto hstack gap-2">
                    Waiting for connection
                    <GIcon name={"g-loader"} color={"fill-amber-500"}/>
                </span>
                            </div>
                        </div>
                    </div>
                    :

                    <div className={"rounded text-white flex gap-1 bg-gray-900 p-2 "}>
                        {
                            info.error ?
                                <>
                                    <div className="text-red-400 hstack gap-1">
                                        <i className="bi-info-circle"></i>
                                        {info.error}
                                    </div>
                                </>
                                :
                                <>
                                    Creating provision script
                                    <div className="mt-1">
                                        <svg width="24" height="24" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <circle className="spinner_S1WN fill-white" cx="4" cy="12" r="3"/>
                                            <circle className="spinner_S1WN fill-white spinner_Km9P" cx="12" cy="12"
                                                    r="3"/>
                                            <circle className="spinner_S1WN fill-white spinner_JApP" cx="20" cy="12"
                                                    r="3"/>
                                        </svg>
                                    </div>
                                </>
                        }
                    </div>
            }
        </>
    );
};