import { addFile } from "@/store/messages/messagesSlice";
import type { AppDispatch } from "@/store/store";
import { useRef } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { useDispatch } from "react-redux";

const FileUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    Array.from(selectedFiles).forEach((file) => {
      dispatch(addFile(file));
    });
  };

  const handleIconCLick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <CiCirclePlus
        onClick={handleIconCLick}
        size={30}
        className="font-bold cursor-pointer text-gray-700 "
      />

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
