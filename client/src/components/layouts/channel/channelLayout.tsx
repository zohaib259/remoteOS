import { FaHeadphonesSimple } from "react-icons/fa6";
import { HiOutlineHashtag } from "react-icons/hi";
import { BiMessageDetail } from "react-icons/bi";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AddChannelDialog } from "../../channel/addChannelDialog";
import { Dropdown } from "../../common/dropdown";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Outlet, useNavigate } from "react-router-dom";

export function ChannelLayout() {
  const { roomData } = useSelector((state: RootState) => state.collaRoom);
  const navigate = useNavigate();
  const isAdmin = true;
  const [isOpen, setIsOpen] = useState(true);
  const channels = roomData[0]?.channel;
  const type = "home";

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const handleChannel = (id: string) => {
    navigate(`/collab-room/home/${id}`);
  };

  return (
    <div className="flex">
      <div className="bg-custom-900 w-[200px] h-screen text-white flex flex-col">
        {type === "home" ? (
          <div className="w-full flex flex-col items-center pt-10 gap-8">
            {/* Menu Buttons */}
            <div className="flex flex-col gap-1 w-full px-4">
              <div className="flex items-center gap-2 w-full px-3 py-1 rounded hover:bg-custom-700 cursor-pointer transition-all">
                <FaHeadphonesSimple size={18} /> Huddles
              </div>
              <div className="flex items-center gap-2 w-full px-3 py-1 rounded hover:bg-custom-700 cursor-pointer transition-all">
                <BiMessageDetail size={18} /> Huddles
              </div>

              {/* Collapsible Channels */}
              <div>
                <button
                  onClick={toggleOpen}
                  className="flex items-center justify-between w-full px-3 py-2 hover:bg-custom-700 rounded transition-all cursor-pointer"
                >
                  <span className="text-sm font-semibold">Channels</span>
                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-1 mt-1">
                    {channels.map((item: any) => (
                      <div
                        key={item.channelId}
                        className="flex items-center gap-2 w-full px-1 py-1 rounded hover:bg-custom-700 cursor-pointer transition-all"
                      >
                        <HiOutlineHashtag size={18} />
                        <span
                          onClick={() => {
                            handleChannel(item.channelId);
                          }}
                          className="text-sm"
                        >
                          {item.name.length > 15
                            ? `${item.name
                                .split(" ")
                                .join("-")
                                .substring(0, 15)}...`
                            : item.name.split(" ").join("-")}
                        </span>
                        <Dropdown />
                      </div>
                    ))}

                    {isAdmin && <AddChannelDialog />}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">Nothing</div>
        )}
      </div>
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}
