import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";
import { LoginWithgoogle } from "../../store/auth/auth";
import { useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";

const GoogleAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  // Google Login
  const googleResponse = async (authResult: any) => {
    try {
      const response = await dispatch(
        LoginWithgoogle({ code: authResult.code })
      );
      if (typeof response.payload === "object" && response?.payload?.success) {
        toast.success(response?.payload?.message);
        navigate("/get-started");
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
      {isLoading ? (
        <Button
          disabled={isLoading}
          className="w-full cursor-pointer bg-custom-950 hover:bg-custom-900"
        >
          {isLoading ? (
            <ClipLoader color="#2563eb" loading={true} size={20} />
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <FcGoogle size={20} className="text-gray-700" />
              Login with Google
            </div>
          )}
        </Button>
      ) : (
        <Button
          onClick={googleLogin}
          variant="outline"
          className="w-full flex items-center gap-2 justify-center cursor-pointer"
        >
          <FcGoogle size={20} className="text-gray-700" />
          Login with Google
        </Button>
      )}
    </>
  );
};

export default GoogleAuth;
