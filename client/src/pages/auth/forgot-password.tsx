import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { forgotPassword } from "@/store/auth/auth";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { AppDispatch } from "@/store/store";

type ForgotFormData = {
  email: string;
};

export default function ForgotPassword() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    defaultValues: { email: "" },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ForgotFormData) => {
    setIsSubmitting(true);
    const response = await dispatch(forgotPassword(data));

    if (typeof response.payload === "object" && response?.payload?.success) {
      toast.success(response?.payload?.message);
    } else {
      if (typeof response.payload === "object") {
        toast.error(response?.payload?.message);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
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
                  type="email"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-custom-950 hover:bg-custom-900"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-gray-500 text-center">
          You'll receive a link if the email is registered.
        </CardFooter>
      </Card>
    </main>
  );
}
