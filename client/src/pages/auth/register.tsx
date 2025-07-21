import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
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
import { registerUser } from "@/store/auth/auth";
import { useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import GoogleAuth from "../../components/common/googleAuth";

type formData = {
  name: string;
  email: string;
  password: string;
};

export function Register() {
  const { isLoading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = async (data: formData) => {
    const response = await dispatch(registerUser(data));
    console.log(response);

    if (typeof response.payload === "object" && response.payload?.success) {
      toast.success(response.payload.message);

      navigate("/verify-otp", { state: { email: data.email } });
    } else {
      if (typeof response.payload === "object") {
        toast.error(response.payload.message);
      }
    }
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-gray-800 ">
            Register to remote os
          </CardTitle>
          <CardDescription className="text-gray-600 sr-only">
            Enter your email below to register to your account
          </CardDescription>
          <CardAction>
            <Link to="/login" className="text-custom-700 underline">
              Login
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-700">
                  Name
                </Label>
                <Input
                  {...register("name", {
                    required: "Name is required",
                  })}
                  id="name"
                  type="text"
                  placeholder="name"
                />
                {errors.name && (
                  <p className="text-orange-700 text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-gray-700"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    {...register("password", {
                      required: "Password is required",
                      pattern: {
                        value:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                        message:
                          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
                      },
                    })}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="focus:outline-none focus:ring-2 focus:ring-custom-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
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
                className="w-full cursor-pointer bg-custom-950 hover:bg-custom-900"
              >
                {isLoading ? (
                  <ClipLoader color="#2563eb" loading={true} size={20} />
                ) : (
                  "Register"
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
