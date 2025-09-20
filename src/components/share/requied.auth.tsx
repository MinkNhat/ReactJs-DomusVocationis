import { useAppSelector } from "@/redux/hooks";
import { Outlet } from "react-router-dom";
import NotFound from "./not.found";
import { Spin } from "antd";

export default function RequireAuth() {
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const isLoading = useAppSelector(state => state.account.isLoading);

    if (isLoading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <NotFound />;
    }

    return <Outlet />;
}