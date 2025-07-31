import { Dropdown } from "@/components/common/dropdown";
import { getChannel } from "@/store/channels/channelSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { useEffect } from "react";
import { FaVideo, FaHeadphonesAlt } from "react-icons/fa";
import { GoPersonFill } from "react-icons/go";
import { HiHashtag } from "react-icons/hi";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { HashLoader } from "react-spinners";
import MessageInput from "../../components/messages/messageInput ";
import { clearFiles, getSignature } from "@/store/messages/messagesSlice";
import { FilePreview } from "@/components/common/file-preview";

const Channel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { files } = useSelector((state: RootState) => state.message);

  const { channelData, gettingChannel } = useSelector(
    (state: RootState) => state.channel
  );

  const channelId = useParams<{ id: string }>().id ?? "";

  useEffect(() => {
    dispatch(getChannel(channelId));
  }, [channelId]);

  if (gettingChannel) {
    return (
      <div className="w-full min-h-full flex justify-center items-center">
        <HashLoader size={40} color={"#065b56"} />
      </div>
    );
  }
  const handleSendMessage = async (data: any) => {
    console.log(data);

    if (data.length === 0 || data === undefined) return;
    const signatureResponse = await dispatch(getSignature());
    dispatch(clearFiles());
    console.log(signatureResponse);
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
          <h1>hey</h1>
        </div>

        {/* file preview */}
        {files && <FilePreview handleSendMessage={handleSendMessage} />}

        <div className=" flex sticky bottom-0  w-full ">
          <MessageInput handleSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default Channel;
