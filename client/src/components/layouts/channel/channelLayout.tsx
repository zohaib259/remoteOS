import { FaHeadphonesSimple } from "react-icons/fa6";
import { HiOutlineHashtag } from "react-icons/hi";
import { BiMessageDetail } from "react-icons/bi";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { AddChannelDialog } from "../../channel/addChannelDialog";
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

  const [sidebarWidth, setSidebarWidth] = useState(200); // Initial width
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const handleMouseDown = () => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = Math.max(150, Math.min(e.clientX, 400)); // Min:150px, Max:400px
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const handleChannel = (id: string) => {
    navigate(`/collab-room/home/${id}`);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={{ width: sidebarWidth }}
        className="bg-custom-900 h-screen text-white flex flex-col"
      >
        {type === "home" ? (
          <div className="w-full flex flex-col items-center pt-10 gap-8">
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
                        onClick={() => {
                          handleChannel(item.channelId);
                        }}
                        key={item.channelId}
                        className="flex items-center gap-2 w-full px-1 py-1 rounded hover:bg-custom-700 cursor-pointer transition-all"
                      >
                        <HiOutlineHashtag size={18} />
                        <span className="text-sm">
                          {item.name.length > 15
                            ? `${item.name
                                .split(" ")
                                .join("-")
                                .substring(0, 15)}...`
                            : item.name.split(" ").join("-")}
                        </span>
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

      {/* Draggable Divider */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1 bg-gray-600 cursor-col-resize hover:bg-gray-500"
        style={{ zIndex: 10 }}
      />

      {/* Main Content */}
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}
