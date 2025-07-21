"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { X, Plus, Building2, Users, Mail } from "lucide-react";
import { useDispatch } from "react-redux";
import { createCollabRoom } from "@/store/collabRoom/collabRoom";
import toast from "react-hot-toast";
import { useNavigate, Outlet } from "react-router-dom";

export function CreateCollabRoom() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      companyName: "",
      userName: user.name || "",
    },
  });

  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [isOpen, setIsOpen] = useState(true); // Open modal by default for routing

  const onSubmit = async (data: any) => {
    const payload = {
      companyName: data.companyName,
      userName: data.userName,
      userId: user.id,
      teamMembers: emails,
    };

    const response = await dispatch(createCollabRoom(payload));
    if (typeof response.payload === "object" && response?.payload?.success) {
      toast.success(response?.payload?.message);
      navigate("/login");
    } else {
      if (typeof response.payload === "object") {
        toast.error(response?.payload?.message);
      }
    }

    reset();
    setEmails([]);
    setEmailInput("");
    setIsOpen(false);
  };

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (email && !emails.includes(email) && isValidEmail(email)) {
      setEmails([...emails, email]);
      setEmailInput("");
    }
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl shadow-2xl p-0 border-0 bg-gradient-to-br from-white to-gray-50">
        <div className="p-10 space-y-8">
          <DialogHeader className="text-center space-y-3">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Create Your Company
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-lg">
              Set up your workspace and invite your team to collaborate
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Name */}
            <div className="space-y-3">
              <Label
                htmlFor="companyName"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <Building2 size={16} /> Company Name
              </Label>
              <Input
                id="companyName"
                {...register("companyName", { required: true })}
                placeholder="Enter your company name"
                className="rounded-xl h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-lg"
              />
            </div>

            {/* Your Name */}
            <div className="space-y-3">
              <Label
                htmlFor="userName"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <Users size={16} /> Your Name
              </Label>
              <Input
                id="userName"
                {...register("userName", { required: true })}
                placeholder="Enter your name"
                className="rounded-xl h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-lg"
              />
            </div>

            {/* Team Members */}
            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <Mail size={16} />
                Invite Team Members
                <span className="ml-1 font-normal text-gray-400">
                  (optional)
                </span>
              </Label>

              <div className="flex gap-3">
                <Input
                  id="email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter email address"
                  className="flex-1 rounded-xl h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-lg"
                />
                <Button
                  type="button"
                  onClick={handleAddEmail}
                  disabled={
                    !emailInput.trim() || !isValidEmail(emailInput.trim())
                  }
                  className="rounded-xl h-12 px-6 bg-custom-900 hover:bg-custom-800 text-white font-semibold"
                >
                  <Plus size={20} />
                </Button>
              </div>

              {emails.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {emails.map((email) => (
                      <span
                        key={email}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-custom-800 text-gray-600 font-medium hover:shadow-md transition-all"
                      >
                        <Mail size={14} />
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          className="p-1 rounded-full text-custom-900 hover:text-red-400 hover:bg-white transition"
                          aria-label={`Remove ${email}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Users size={14} />
                    {emails.length} team member{emails.length > 1 ? "s" : ""}{" "}
                    invited
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <DialogFooter className="pt-6 flex-col sm:flex-row gap-3">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto rounded-xl h-12 px-8 border-2 border-gray-200 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="w-full sm:w-auto rounded-xl h-12 px-8 bg-custom-900 hover:bg-custom-800 text-white font-semibold shadow-lg"
              >
                Create Company
              </Button>
            </DialogFooter>
          </form>

          {/* ⬇️ This is where nested children render */}
          <div className="pt-6">
            <Outlet />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
