import ClientDetails from "../ui/ClientDetails.tsx";
import Layout from "./home-components/Layout.tsx";

export default function ClientDetailPage() {
    const client = {
        name: "corp-vpn-client-05",
        connected: true,
        created: "April 22, 2025, 14:32",
        ip: "10.8.0.12",
        last_seen: "3 hours ago",
        transferUp: "1.25 GB",
        transferDown: "3.72 GB",
        bandwidth: "1.2 Mbps",
        device: "MacBook Pro (macOS 14.2)"
    }
    return (
        <Layout>
            <ClientDetails client={client}/>
        </Layout>
    )
}