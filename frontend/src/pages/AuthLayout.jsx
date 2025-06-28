import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AuthLayout = ({ children }) => {
  const loading = useSelector((state) => state.auth.loading);
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();

  useEffect(() => {
    let timeout;
    if (!loading) {
      timeout = setTimeout(() => {
        const status = authStatus; // recheck after delay
        if (!status) {
          navigate("/login", { replace: true });
        }
      }, 100); // just 100ms is usually enough
    }

    return () => clearTimeout(timeout); // prevent premature navigate
  }, [authStatus, loading, navigate]);

  if (loading) {
    return (
      <div className="w-screen h-[calc(100vh-5rem)] flex justify-center items-center">
        <span className="loading loading-dots loading-xl"></span>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthLayout;
