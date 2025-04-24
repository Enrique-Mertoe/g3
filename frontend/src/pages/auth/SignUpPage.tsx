import React, {useState} from "react";
import AuthLayout from "./layout.tsx";
import loginBg from "../../assets/bg/loginbg.svg"
import GIcon from "../../ui/components/Icons.tsx";
import {useSignIn} from "../../hooks/useSignIn.ts";
import {ArrowLeft, ArrowRightSquareIcon} from "lucide-react";
import {useNavigate} from "react-router-dom";

type regData = {
    fName: string;
    lName: string;
    email: string;
    phone: string;
    password: string;
    cPassword: string;
}
const SignUpPage: React.FC = () => {
    const su = useSignIn();
    const [form, setRegData] = useState<regData>({
        cPassword: "",
        email: "",
        fName: "",
        lName: "",
        password: "",
        phone: ""
    })
    const [errorMessage, setErrorMessage] = useState<string[]>([]);
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

    const validateStep = async () => {
        if (step === 2) {
            setLoading(true)
            const res = await su.exists(form.email);
            setLoading(false)
            if (res.error)
                return setErrorMessage(res.error)
        }
        setStep(prev => prev + 1)
        setErrorMessage([])
    }
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;
        setRegData((prev) => ({...prev, [name]: value}));
    };
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (step !== 4)
            return await validateStep()

        if (loading) return;
        setLoading(true)
        // if (!email || !password) {
        //     setErrorMessage(['Please fill out all fields.']);
        //     return
        // }
        const fd = new FormData();
        Object.entries(form).map(([k, v]) => {
            fd.append(k.toLowerCase(), v)
        })
        const res = await su.createUser(fd);
        setLoading(false)
        setErrorMessage(res.error ?? [])
        if (res.ok) {
            const urlParams = new URLSearchParams(window.location.search);
            const next = urlParams.get('next');

            window.location.href = res.rdr || next || '/';
        }

    };

    const navigate = useNavigate()

    return (
        <AuthLayout>
            <div className=" w-full">
                <h2 className="text-2xl font-semibold mb-4">
                    <img src="/fav.png" className={"h-24 w-24"} alt=""/>
                    LomTechnology
                </h2>
                <div className="flex justify-center">
                    <img
                        alt="Illustration"
                        src={loginBg}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            <div className="w-full vstack h-full px-6 mb-auto">
                <span className={"text-2xl hstack font-semibold mb-6"}>
                    Create account
                </span>
                <form onSubmit={handleSubmit} className="space-y-4 flex-grow-1">
                    {
                        step == 1 &&
                        <>
                            <div>
                                <label htmlFor="si-email" className="text-sm font-medium">First Name</label>
                                <input
                                    name="fName"
                                    placeholder="First Name"
                                    required
                                    value={form.fName}
                                    onChange={handleChange}
                                    type="text"
                                    id="si-c-name"
                                    className="w-full p-3 mt-2 bg-gray-100 transition-all duartion-500 ring-1 text-dark rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="si-email" className="text-sm font-medium">Last Name</label>
                                <input
                                    name="lName"
                                    placeholder="Last Name"
                                    required
                                    value={form.lName}
                                    onChange={handleChange}
                                    type="text"
                                    id="si-c-name"
                                    className="w-full p-3 mt-2 bg-gray-100 transition-all duartion-500 ring-1 text-dark rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </>
                    }
                    {step == 2 &&
                        <div>
                            <label htmlFor="si-email" className="text-sm font-medium">Email address</label>
                            <input
                                name="email"
                                placeholder="Enter your email"
                                required
                                type="email"
                                id="si-email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full p-3 mt-2 bg-gray-100 transition-all duartion-500 ring-1 text-dark rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    }{step == 3 &&
                    <div>
                        <label htmlFor="si-email" className="text-sm font-medium">Phone Number</label>
                        <input
                            name="phone"
                            placeholder="+254 700000000"
                            required
                            value={form.phone}
                            onChange={handleChange}
                            type="text"
                            id="si-phone"
                            className="w-full p-3 mt-2 bg-gray-100 transition-all duartion-500 ring-1 text-dark rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                }
                    {
                        step == 4 &&
                        <>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="si-password" className="text-sm font-medium">Password</label>
                                </div>
                                <input
                                    id="si-password"
                                    name="password"
                                    placeholder="Enter password"
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    type="password"
                                    className="w-full p-3 mt-2 bg-gray-100 transition-all duartion-500 ring-1 text-dark rounded-md outline-none focus:ring-2 focus:ring-blue-500"

                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="si-password" className="text-sm font-medium">Confirm
                                        Password</label>
                                </div>
                                <input
                                    id="si-password"
                                    name="cPassword"
                                    placeholder="Enter password"
                                    required
                                    type="password"
                                    className="w-full p-3 mt-2 bg-gray-100 transition-all duartion-500 ring-1 text-dark rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                                    value={form.cPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    }

                    <div className="flex flex-col">
                        {errorMessage.map((v, i) => (
                            <span key={i} className="text-red-500 text-sm">{v}</span>
                        ))}
                    </div>

                    <div className="hstack justify-between">
                        {
                            step > 1 &&
                            <span
                                onClick={() => setStep(prev => prev - 1)}
                                className={` transition-all duration-200 ease-in-out cursor-pointer h-[45px] aspect-square
                                mt-4 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-full flex items-center justify-center`}
                            >
                                <ArrowLeft/>
                            </span>
                        }

                        <button
                            type="submit"
                            className={` transition-all duration-200 ease-in-out ms-auto cursor-pointer h-[45px] ${loading ? " p-3 !rounded-full w-[45px]" : "w-auto py-3 px-4"} 
                                mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex items-center justify-center`}
                        >
                            {!loading && <span className={"whitespace-nowrap"}>
                                    {step == 4 ? 'Sign In' : 'Next'}
                                </span>}
                            {
                                loading && <span className="">
                                  <GIcon name={"g-loader"} color={"current-color"}/>
                                </span>
                            }
                        </button>
                    </div>
                </form>
                <div className={'mt-10 hstack'}>

                    <a href="/auth/login"
                       onClick={e => {
                           e.preventDefault()
                           const urlParams = (new URLSearchParams(window.location.search)).get('next');
                           const p = urlParams ? '?next=' + urlParams : ''
                           navigate('/auth/login/' + p)
                       }}
                       className="text-sm hstack gap-2   p-3 text-blue-500 ms-auto">
                        <ArrowRightSquareIcon size={16}/>
                        Continue with existing account
                    </a>
                </div>
            </div>
        </AuthLayout>
    );
};

export default SignUpPage;