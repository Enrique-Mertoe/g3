declare type FetchResponse<T> = {
    ok?: boolean;
    data?: T;
    error?: string[];
    message?: string;
    rdr?: string
}
type Dict<T = unknown> = Record<string, T>

type NavItemType = {
    label: string;
    icon: string;
    link: string;
    badge?: number | string;
}
type Mikrotik = {
    id: string;
    name: string;
    ip_address: string;
    location: string;
    username: string;
    password: string;
}

type NetPackage = {
    id: string;
    name: string;
    price: string;
    upload_speed: string;
    download_speed: string;
    type: string;
    router: Mikrotik;
};

type UserInfo = {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    due_amount: number;

    package: NetPackage;
    // router: Mikrotik;
};

type ClientInfo = {
    id: string;
    full_name: string;
    phone: string;
    router_username: string;
    router_password: string;
    package_start?: string | null; // ISO date string or null
    due: string; // ISO date-time string
    created_at: string; // ISO date-time string

    package: NetPackage;
    isp: UserInfo
};


type RoutersResponse = {
    routers: Mikrotik[];
    all_count: number;
    active_count: number;
    inactive_count: number;
};

type DashResponse = {
    totalUsers: number;
    totalBills: number;
    totalPayments: number;
    paymentsThisMonth: number;
    billsThisMonth: number;
    paymentsThisYear: number;
    billsThisYear: number;
    totalPackages: number;
    openTickets: number;

    recentUsers: UserInfo[];
    recentPayments: RecentPayment[];
    recentTickets: Ticket[];

    usersWithDueCount: number;
    usersWithDueList: RecentUser[];

    billingData: Record<string, number>;
    paymentData: Record<string, number>;

    dailyBillingData: number[];
    dailyPaymentData: number[];
}

interface ChartProps {
    billingData: DashResponse["billingData"];
    paymentData: DashResponse["paymentData"];
    dailyBillingData: DashResponse["dailyBillingData"];
    dailyPaymentData: DashResponse["dailyPaymentData"];
}


interface RecentUser {
    id: number;
    username: string;
    email: string;
    detail: UserDetail;
}

interface UserDetail {
    address: string;
    phone: string;
    dob: string | null;
    pin: string;
    router_password: string;
    package_name: string;
    package_price: string;
    package_start: string | null;
    due: string;
    status: string;
    router_name: string;
}

interface RecentPayment {
    id: number;
    package_price: number;
    invoice: string;
    payment_method: string;
    user: UserInfo
}

interface Ticket {
    id: number;
    subject: string;
    message: string;
    status: string;
    priority: string;
    number: string;
    user: {
        id: number;
        username: string;
    };
}

declare type CompanyInfo = {
    name: string;
    address: string;
    phone: string;
    email: string;
};
declare type Closure = (...args) => void;