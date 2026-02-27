import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

type RequireAuthProps = {
  children: JSX.Element;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}
