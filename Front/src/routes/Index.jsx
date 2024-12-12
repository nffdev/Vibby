import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-12 items-center justify-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                Vibby
            </h1>
            <Button onClick={() => navigate('/videoscreen')}><span className="mt-1">Start</span></Button>
        </div>
    )
}