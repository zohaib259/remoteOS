import { Dropdown } from "@/components/common/dropdown";
import { getChannel } from "@/store/channels/channelSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { FaVideo, FaHeadphonesAlt } from "react-icons/fa";
import { GoPersonFill } from "react-icons/go";
import { HiHashtag } from "react-icons/hi";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { HashLoader } from "react-spinners";
import MessageInput from "../../components/messages/messageInput ";
import {
  clearFiles,
  createMessage,
  getSignature,
  uploadToCloudinary,
} from "@/store/messages/messagesSlice";
import { FilePreview } from "@/components/common/file-preview";
import socket from "@/utils/socket";

const Channel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const controllerRef = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState(0);
  const { files } = useSelector((state: RootState) => state.message);

  const { channelData, gettingChannel } = useSelector(
    (state: RootState) => state.channel
  );

  const channelId = useParams<{ id: string }>().id ?? "";

  useEffect(() => {
    dispatch(getChannel(channelId));
    // socket.on("newMessage")
  }, [channelId]);

  if (gettingChannel) {
    return (
      <div className="w-full min-h-full flex justify-center items-center">
        <HashLoader size={40} color={"#065b56"} />
      </div>
    );
  }
  const handleSendMessage = async (data: any) => {
    try {
      dispatch(clearFiles());
      const controller = new AbortController();
      controllerRef.current = controller;

      if (data.length === 0 || data === undefined) return;
      const signatureResponse = await dispatch(getSignature()).unwrap();

      let cloudinaryResponse;
      if (data?.file.length > 0) {
        cloudinaryResponse = await dispatch(
          uploadToCloudinary({
            file: data.file[0],
            signature: signatureResponse,
            signal: controller.signal,
            onProgress: (p) => setProgress(p),
          })
        ).unwrap();
      }

      const createMessageResponse = await dispatch(
        createMessage({
          channelId: channelId,
          content: data.message,
          mediaUrl: cloudinaryResponse?.url || null,
          mediaPublicId: cloudinaryResponse?.public_id || null,
        })
      );
      if (
        typeof createMessageResponse?.payload === "object" &&
        createMessageResponse?.payload?.success
      ) {
        setProgress(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white text-black ">
      {/* Channel Header */}
      <div className="flex items-center justify-between w-full h-18 px-4 shadow-sm">
        <div className="flex items-center space-x-2 text-black">
          <HiHashtag className="text-black text-lg" />
          <h3 className="text-xl md:text-base font-semibold truncate">
            {channelData?.channelName}
          </h3>
        </div>

        <div className="flex items-center space-x-3 text-gray-600">
          <button className="w-16 h-10 flex items-center justify-center space-x-1 rounded-md border border-gray-300 hover:border-black hover:shadow transition duration-200 cursor-pointer">
            <GoPersonFill className="text-lg" />
            <span className="text-sm">
              {channelData?.channelMembers.length}
            </span>
          </button>
          <button className="w-16 h-10 flex items-center justify-center rounded-md border border-gray-300 hover:border-black hover:shadow transition duration-200 cursor-pointer">
            <FaVideo className="text-lg" />
          </button>
          <button className="w-16 h-10 flex items-center justify-center rounded-md border border-gray-300 hover:border-black hover:shadow transition duration-200 cursor-pointer">
            <FaHeadphonesAlt className="text-lg" />
          </button>
          <Dropdown />
        </div>
      </div>

      {/* Channel Content */}
      <div className="flex flex-col p-4 overflow-hidden w-full h-full">
        <div className=" w-full h-full  ">
          {" "}
          <h1 className=" bg-black">
            {" "}
            <span className="text-white text-sm font-medium">{progress}%</span>
          </h1>
        </div>

        {/* file preview */}
        {files && (
          <FilePreview
            progress={progress}
            handleSendMessage={handleSendMessage}
          />
        )}

        <div className=" flex sticky bottom-0  w-full ">
          <MessageInput
            progress={progress}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default Channel;
