import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CgAddR } from "react-icons/cg";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { useState } from "react";
import type { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";
import { createChannel } from "@/store/channels/channel";

interface memberTypes {
  name: string;
  userId: string;
}

interface FormValues {
  channelName: string;
  visibility: string;
  members: string[];
}

export function AddChannelDialog() {
  const dispatch = useDispatch<AppDispatch>();
  const { roomData } = useSelector((state: RootState) => state.collaRoom);
  const teamMembers: memberTypes[] = roomData[0]?.roomTeamMember || [];

  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      channelName: "",
      visibility: "",
      members: [],
    },
  });

  const selectedMembers = watch("members");

  const onSubmit = async (data: FormValues) => {
    // Check if all required fields are filled
    if (!data.channelName || !data.visibility || data.members.length === 0) {
      return; // Form validation will show errors
    }

    const response = await dispatch(createChannel(data));
    if (typeof response.payload === "object" && response?.payload?.success) {
      toast.success(response?.payload?.message);
      reset();
      setOpen(false);
    } else {
      if (typeof response.payload === "object") {
        toast.error(response?.payload?.message);
      }
    }
  };

  const toggleMember = (userId: string) => {
    const current = watch("members");
    const exists = current.includes(userId);
    const updated = exists
      ? current.filter((id) => id !== userId)
      : [...current, userId];
    setValue("members", updated, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 w-full px-1 py-1 rounded hover:bg-custom-700 cursor-pointer transition-all">
          <CgAddR size={21} /> Create channel
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create channel</DialogTitle>
            <DialogDescription>
              Create a channel, add members, and choose visibility.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Channel channelName*/}
            <div className="grid gap-3">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                placeholder="e.g. Design Team"
                {...register("channelName", {
                  required: "Channel channelNameis required",
                })}
              />
              {errors.channelName && (
                <span className="text-red-500 text-sm">
                  {errors.channelName.message}
                </span>
              )}
            </div>

            {/* Visibility */}
            <div className="grid gap-3">
              <Label>Visibility</Label>
              <Controller
                name="visibility"
                control={control}
                rules={{ required: "Visibility is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">
                          Only channel members
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.visibility && (
                <span className="text-red-500 text-sm">
                  {errors.visibility.message}
                </span>
              )}
            </div>

            {/* Team Members Multi-select */}
            <div className="grid gap-3">
              <Label>Select Team Members</Label>

              {/* Selected members as tags */}
              <div className="flex flex-wrap gap-2 border p-2 rounded-md min-h-[45px]">
                {selectedMembers.map((userId) => {
                  const member = teamMembers.find((m) => m.userId === userId);
                  return (
                    <span
                      key={userId}
                      className="bg-custom-900 text-white px-2 rounded flex items-center gap-1"
                    >
                      {member?.name}
                      <X
                        size={12}
                        className="cursor-pointer"
                        onClick={() => toggleMember(userId)}
                      />
                    </span>
                  );
                })}
              </div>

              {/* Member checkboxes */}
              <div className="border p-2 rounded-md max-h-40 overflow-auto">
                {teamMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                    onClick={() => toggleMember(member.userId)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.userId)}
                      readOnly
                      className="mr-2"
                    />
                    {member.name}
                  </div>
                ))}
              </div>

              {/* Add validation for members */}
              <Controller
                name="members"
                control={control}
                rules={{
                  validate: (value) =>
                    value.length > 0 || "Please select at least one member",
                }}
                render={() => <></>}
              />
              {errors.members && (
                <span className="text-red-500 text-sm">
                  {errors.members.message}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-custom-950 hover:bg-custom-900">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
