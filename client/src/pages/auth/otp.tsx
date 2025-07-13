import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { MdEmail } from "react-icons/md";
import { resendOtp, verifyOtp } from "@/store/auth/auth";
import { useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";

// Zod schema
const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

type OTPFormData = z.infer<typeof otpSchema>;

interface LocationState {
  email: string;
}

export default function VerifyOtp() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const { isLoading } = useSelector((state: RootState) => state.auth);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const otpValue = watch("otp");

  const onSubmit = async (data: OTPFormData) => {
    const payload = {
      email: state?.email,
      otp: parseInt(data.otp),
    };

    try {
      const response = await dispatch(verifyOtp(payload));
      console.log("response:", response);

      if (typeof response.payload === "object" && response?.payload?.success) {
        toast.success(response?.payload?.message);
        state.email = "";
        navigate("/login");
      } else {
        if (typeof response.payload === "object") {
          toast.error(response?.payload?.message);
        }
      }
    } catch (err) {
      toast.error("Invalid OTP or something went wrong.");
    }
  };

  const handleResend = async () => {
    const response = await dispatch(resendOtp({ email: state?.email }));
    console.log(response);

    if (typeof response?.payload === "object" && response?.payload?.success) {
      toast.success(response?.payload?.message);
    } else {
      if (typeof response?.payload === "object") {
        toast.error(response?.payload?.message);
      }
    }
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center text-custom-900 mb-2 mt-2 text-5xl">
            <MdEmail />
          </div>
          <CardTitle className="text-xl font-semibold">
            Verify Your Email
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            We've sent a 6-digit verification code to <br />
            <span className="font-medium text-primary">{state?.email}</span>.
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 flex flex-col items-center"
          >
            <div className="grid gap-2">
              <Label htmlFor="otp" className="text-sm text-center">
                Enter the code below
              </Label>
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(value) => setValue("otp", value)}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot
                      className="w-[50px] h-[40px] "
                      key={i}
                      index={i}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              {errors.otp && (
                <p className="text-sm text-red-500 text-center">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer mt-1 bg-custom-950 hover:bg-custom-900"
            >
              {isLoading ? (
                <ClipLoader color="#2563eb" loading={true} size={20} />
              ) : (
                "Submit"
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center mt-2">
              Didn’t receive the code?{" "}
              <button
                disabled={isLoading}
                type="button"
                onClick={handleResend}
                className="text-custom-700 cursor-pointer hover:underline font-medium"
              >
                Resend Code
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
