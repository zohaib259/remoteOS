import { useState, type FormEvent } from "react";
import { IoMdSend } from "react-icons/io";
import FileUpload from "../common/fileUpload";
import { FilePreview } from "../common/file-preview";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

type handleSendMessageProps = {
  handleSendMessage: (data: messageDataTypes) => void;
};

type messageDataTypes = {
  message: string;
  file: File[];
};

export default function MessageInput({
  handleSendMessage,
}: handleSendMessageProps) {
  const [message, setMessage] = useState("");

  const { files } = useSelector((state: RootState) => state.message);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const messageData: messageDataTypes = {
      message: message.trim(),
      file: files,
    };
    if (messageData.message === "" && !files) return;
    handleSendMessage(messageData); // send message to parent
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center justify-center gap-2 p-4 border-t bg-white w-full  "
    >
      <FileUpload />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
        className="flex-1  shadow-sm resize-none rounded-full bg-gray-100 px-5 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-custom-800 transition-all"
      />
      <button
        type="submit"
        className="bg-custom-950 hover:bg-custom-800 cursor-pointer text-white px-4 py-2 rounded-full transition "
      >
        <IoMdSend size={20} />
      </button>
    </form>
  );
}
