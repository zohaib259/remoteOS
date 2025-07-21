import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useNavigation } from "react-router-dom";
import { login } from "@/store/auth/auth";
import { useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";
import GoogleAuth from "@/components/common/googleAuth";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners"; // Added for loading button
import { getCollabRomm } from "@/store/collabRoom/collabRoom";

type LoginFormData = {
  email: string;
  password: string;
};

export function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    const response = await dispatch(login(data));
    if (typeof response.payload === "object" && response?.payload?.success) {
      toast.success(response?.payload?.message);
      const roomResponse = await dispatch(getCollabRomm());
      if (
        typeof roomResponse.payload === "object" &&
        roomResponse?.payload?.success
      ) {
        navigate("/collab-room");
      } else {
        navigate("/get-started");
      }
    } else {
      if (typeof response.payload === "object") {
        toast.error(response?.payload?.message);
      }
    }
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Login to Remote OS</CardTitle>
          <CardDescription className="sr-only">
            Enter your email to access your account
          </CardDescription>
          <CardAction>
            <Link to="/register" className="text-custom-700 underline ">
              Register
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email",
                    },
                  })}
                  id="email"
                  placeholder="m@example.com"
                />
                {errors.email && (
                  <p className="text-orange-700 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Link
                    to={"/forgot-password"}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-gray-700"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    {...register("password", {
                      required: "Password is required",
                    })}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="focus:outline-none focus:ring-2 focus:ring-custom-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-orange-700 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-custom-950 hover:bg-custom-900 cursor-pointer"
              >
                {isLoading ? (
                  <ClipLoader color="#2563eb" loading={true} size={20} />
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <GoogleAuth />
        </CardFooter>
      </Card>
    </main>
  );
}
