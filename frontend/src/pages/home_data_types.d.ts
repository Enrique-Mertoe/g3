interface ServerStatus {
    status: string;        // "online"
    uptime: string;        // "14d 23h 42m"
    uptime_seconds: number;
}

interface ActiveUsers {
    active_count: number;
    total_count: number;
    change: number;
}

interface DataTransfer {
    total: number; // in TB
    today: number; // in GB
}

interface SecurityData {
    count: number,
    "latest": number,
    "change": number
}

interface HTopData {
    server: ServerStatus;
    active_users: ActiveUsers;
    data_transfer: DataTransfer;
    security: SecurityData;
}

interface TrafficData {
    labels: any,
    datasets: any
}