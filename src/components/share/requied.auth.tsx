import { useAppSelector } from "@/redux/hooks";
import { Outlet } from "react-router-dom";
import NotFound from "./not.found";

export default function RequireAuth() {
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    if (!isAuthenticated) {
        return <NotFound />;
    }

    return <Outlet />;
}