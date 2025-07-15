import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";
import { LoginWithgoogle } from "../../store/auth/auth";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const GoogleAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Google Login
  const googleResponse = async (authResult: any) => {
    try {
      const response = await dispatch(
        LoginWithgoogle({ code: authResult.code })
      );
      if (typeof response.payload === "object" && response?.payload?.success) {
        toast.success(response?.payload?.message);
        navigate("/test");
      } else {
        if (typeof response.payload === "object") {
          toast.error(response?.payload?.message);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: googleResponse,
    onError: googleResponse,
    flow: "auth-code",
  });
  return (
    <>
      {" "}
      <Button
        onClick={googleLogin}
        variant="outline"
        className="w-full flex items-center gap-2 justify-center cursor-pointer"
      >
        <FcGoogle size={20} className="text-gray-700" />
        Login with Google
      </Button>
    </>
  );
};

export default GoogleAuth;
