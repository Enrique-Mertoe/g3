import {Inbox} from "lucide-react";

export default function EmptyList({title, description}: {
    title: string, description?: string
}) {
    return (
        <div className="min-h-[5rem] py-10 justify-center gap-2 flex-col items-center w-full flex">
            <Inbox size={64}/>
            <strong>{title}</strong>
            <p className={"text-gray-500"}>
                {description}
            </p>
        </div>
    )
}