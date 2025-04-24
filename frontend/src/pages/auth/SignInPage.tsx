import React, {useState} from "react";
import AuthLayout from "./layout.tsx";
import loginBg from "../../assets/bg/loginbg.svg"
import GIcon from "../../ui/components/Icons.tsx";
import {useSignIn} from "../../hooks/useSignIn.ts";
import {Plus} from "lucide-react";
import {useNavigate} from "react-router-dom";

const SignInPage: React.FC = () => {
    const su = useSignIn()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string[]>([]);
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (loading) return;
        setLoading(true)
        if (!email || !password) {
            setErrorMessage(['Please fill out all fields.']);
            return
        }
        const res = await su.signIn({email, password});
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
            <div className="w-full">
                <h2 className="text-2xl font-semibold mb-4">
                    Hey there!<br/>Welcome back.
                </h2>
                <div className="flexjustify-center">
                    <img
                        alt="Illustration"
                        src={loginBg}
                        className="w-full h-full object-cover"
                    />
                </div>


            </div>

            <div className=" px-6 w-full py-4 vstack">
                <form onSubmit={handleSubmit} className="space-y-4 mb-auto flex-grow-1">
                    <div>
                        <label htmlFor="si-email" className="text-sm font-medium">Email address</label>
                        <input
                            name="email"
                            placeholder="Enter your email"
                            required
                            type="email"
                            id="si-email"
                            className="w-full p-3 mt-2 bg-gray-100 transition-all duartion-500 ring-1 text-dark rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="si-password" className="text-sm font-medium">Password</label>
                            <a href="/signin-dark#" className="text-sm text-blue-400 hover:underline">
                                Forgot password?
                            </a>
                        </div>
                        <input
                            id="si-password"
                            name="password"
                            placeholder="Enter password"
                            required
                            type="password"
                            className="w-full p-3 mt-2 bg-gray-100 transition-all duartion-500 ring-1 text-dark rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        {errorMessage.map((v, i) => (
                            <span key={i} className="text-red-500 text-sm">{v}</span>
                        ))}
                    </div>

                    <button
                        type="submit"
                        className={` transition-all duration-200 ease-in-out ms-auto cursor-pointer h-[45px] ${loading ? " p-3 !rounded-full w-[45px]" : "w-full py-3 px-4"} 
                                mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex items-center justify-center`}
                    >
                        {!loading && <span className={"whitespace-nowrap"}>
                                    Sign In
                                </span>}
                        {
                            loading && <span className="">
                                  <GIcon name={"g-loader"} color={"current-color"}/>
                                </span>
                        }
                    </button>
                </form>

                <div className={'mt-10 hstack'}>

                    <a href="/auth/register/"
                       onClick={e => {
                           e.preventDefault()
                           const urlParams = (new URLSearchParams(window.location.search)).get('next');
                           const p = urlParams ? '?next=' + urlParams : ''
                           navigate('/auth/register/' + p)
                       }}
                       className="text-sm hstack gap-2   p-3 text-blue-500 ms-auto">
                        <Plus size={16}/>
                        Create account
                    </a>
                </div>
            </div>
        </AuthLayout>
    );
};

export default SignInPage;