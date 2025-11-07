import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/useSession";

const PublicRoute = () => {
  const { data: session, isLoading } = useSession();
  console.log("isLoading", isLoading);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (session) {
    return <Navigate to="/app/home" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
