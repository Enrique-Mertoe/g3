import {
    LucideIcon,
    MessageCircle,
    Mic,
    MicOff,
    MoreVertical,
    PhoneOff,
    ScreenShare,
    Smile,
    Users,
    Video,
    VideoOff,
    Phone,
    ChevronUp,
    Hand,
    Square,
    Pause,
    Play,
    AlertTriangle,
    CheckCircle,
    Info,
    AlertCircle,
    HelpCircle,
    Paperclip,
    Shapes,
    MessageSquareText,
    X, History,
    Copy,
    Forward,
    SendHorizontal,
    ArrowRight,
    UserRoundPlus,
    Search,
    LayoutDashboard, Monitor, FileText, CloudUpload, Check, Upload, BadgeInfo, LucideProps

} from "lucide-react";
import React, {forwardRef} from "react";

const LockPerson: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
    (props, ref) => (
        <svg ref={ref} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24"
             width="24" {...props}>
            <desc>Lock Person Streamline Icon: https://streamlinehq.com</desc>
            <path fill="currentColor"
                  d="M18.825 17.775c0.46535 0 0.86085 -0.163 1.1865 -0.489 0.32565 -0.326 0.4885 -0.72185 0.4885 -1.1875s-0.16285 -0.85685 -0.4885 -1.1735 -0.72115 -0.475 -1.1865 -0.475c-0.45835 0 -0.8479 0.16125 -1.16875 0.48375 -0.32085 0.32265 -0.48125 0.71435 -0.48125 1.175 0 0.46085 0.1604 0.85375 0.48125 1.17875 0.32085 0.325 0.7104 0.4875 1.16875 0.4875Zm-0.00525 3.325c0.5535 0 1.0719 -0.12915 1.55525 -0.3875 0.48335 -0.25835 0.875 -0.6125 1.175 -1.0625 -0.43335 -0.23335 -0.875 -0.42085 -1.325 -0.5625 -0.45 -0.14165 -0.91665 -0.2125 -1.4 -0.2125 -0.48335 0 -0.95 0.07085 -1.4 0.2125 -0.45 0.14165 -0.89165 0.32915 -1.325 0.5625 0.3 0.45 0.6899 0.80415 1.16975 1.0625 0.47965 0.25835 0.99635 0.3875 1.55 0.3875ZM8.75 8.15h6.5v-2.325c0 -0.95 -0.3125 -1.741665 -0.9375 -2.375S12.91665 2.5 12 2.5s-1.6875 0.316665 -2.3125 0.95S8.75 4.875 8.75 5.825v2.325ZM5.5 22c-0.38335 0 -0.729165 -0.15415 -1.0375 -0.4625C4.154165 21.22915 4 20.88335 4 20.5V9.65c0 -0.38335 0.154165 -0.72915 0.4625 -1.0375 0.308335 -0.30835 0.65415 -0.4625 1.0375 -0.4625h1.75v-2.325c0 -1.35 0.45835 -2.491665 1.375 -3.425S10.66665 1 12 1c1.33335 0 2.45835 0.466665 3.375 1.4 0.91665 0.933335 1.375 2.075 1.375 3.425v2.325H18.5c0.38335 0 0.72915 0.15415 1.0375 0.4625 0.30835 0.30835 0.4625 0.65415 0.4625 1.0375v1.225c0 0.24165 -0.07765 0.4229 -0.233 0.54375 -0.15535 0.12085 -0.32615 0.18125 -0.5125 0.18125 -0.18635 0 -0.35865 -0.0625 -0.517 -0.1875S18.5 11.1 18.5 10.85v-1.2H5.5V20.5h7.45c0.2125 0 0.39065 0.07235 0.5345 0.217 0.14365 0.1445 0.2155 0.32365 0.2155 0.5375 0 0.21365 -0.07185 0.39135 -0.2155 0.533 -0.14385 0.14165 -0.322 0.2125 -0.5345 0.2125H5.5Zm13.325 0.85c-1.31665 0 -2.45 -0.475 -3.4 -1.425 -0.95 -0.95 -1.425 -2.08335 -1.425 -3.4s0.475 -2.45 1.425 -3.4c0.95 -0.95 2.08335 -1.425 3.4 -1.425s2.45 0.475 3.4 1.425c0.95 0.95 1.425 2.08335 1.425 3.4s-0.475 2.45 -1.425 3.4c-0.95 0.95 -2.08335 1.425 -3.4 1.425Z"
                  strokeWidth="0.5"></path>
        </svg>
    )
);
LockPerson.displayName = "LockPerson";


const GLoader: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(function GLoader(
    props, ref
) {
    const { size = 24, className, ...rest } = props;
    let c1: string = "";
    let c2: string;
    [c1, c2] = (className || "fill-amber-400").split("|", 2);
    c2 = c2 ? c2 : "fill-gray-100";
    return (
        <svg ref={ref} width={size ?? "24"} height={size ?? "24"} viewBox="0 0 24 24"
             {...rest}
             xmlns="http://www.w3.org/2000/svg">
            <rect className={`spinner_jCIR ${c1}`} x="1" y="6" width="2.8" height="12"/>
            <rect className={`spinner_jCIR spinner_upm8 ${c2}`} x="5.8" y="6" width="2.8" height="12"/>
            <rect className={`spinner_jCIR ${c1} spinner_2eL5`} x="10.6" y="6" width="2.8" height="12"/>
            <rect className={`spinner_jCIR spinner_Rp9l ${c2}`} x="15.4" y="6" width="2.8" height="12"/>
            <rect className={`spinner_jCIR ${c1} spinner_dy3W`} x="20.2" y="6" width="2.8" height="12"/>
        </svg>
    )
});

const ICONS: Record<string, LucideIcon> = {
    Mic,
    MicOff,
    Video,
    VideoOff,
    ScreenShare,
    Users,
    MessageCircle,
    Smile, BadgeInfo,
    MoreVertical,
    PhoneOff, Check,
    AlertCircle, Info, CheckCircle, AlertTriangle,
    Phone, Paperclip,
    ChevronUp, HelpCircle,
    Hand, CloudUpload,
    LockPerson, GLoader, Upload, History,
    Square, Pause, Play, SendHorizontal,
    MessageSquareText, Monitor, FileText,
    Shapes, X, Copy, Forward, ArrowRight, UserRoundPlus, Search, LayoutDashboard
};

interface IconProps {
    name: keyof typeof ICONS;  // Restrict to available icons
    size?: number;
    color?: string;
}

function toPascalCase(str: string): string {
    return str
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
}

const GIcon: React.FC<IconProps> = ({name, size = 24, color = "text-white"}) => {
    name = toPascalCase(name);
    const IconComponent = ICONS[name]; // Get the icon component

    if (!IconComponent) return null;

    return <IconComponent size={size}
                          className={color}
    />;
};

export default GIcon;