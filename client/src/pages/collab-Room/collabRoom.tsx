import React, { useState } from "react";
import {
  Home,
  MessageCircle,
  Bell,
  FileText,
  MoreHorizontal,
  Plus,
  ArrowLeft,
  ArrowRight,
  Clock,
  HelpCircle,
  Search,
  Menu,
  X,
} from "lucide-react";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { RoomSidebar } from "@/components/collabRoom/roomSidebar";

type NavItemType = {
  id: string;
  icon: React.ReactNode;
  label: string;
  to: string;
};

const navItems: NavItemType[] = [
  {
    id: "home",
    icon: <Home size={20} />,
    label: "Home",
    to: "/collab-room/home",
  },
  {
    id: "dms",
    icon: <MessageCircle size={20} />,
    label: "DMs",
    to: "/collab-room/dms",
  },
  {
    id: "activity",
    icon: <Bell size={20} />,
    label: "Activity",
    to: "/collab-room/activity",
  },
  {
    id: "canvases",
    icon: <FileText size={20} />,
    label: "Canvases",
    to: "/collab-room/canvases",
  },
  {
    id: "more",
    icon: <MoreHorizontal size={20} />,
    label: "More",
    to: "/collab-room/more",
  },
];

const SidebarWithHeader = () => {
  const [active, setActive] = useState<string>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { roomData } = useSelector((state: RootState) => state.collaRoom);

  return (
    <div className="flex h-screen text-white">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-custom-950 p-4 flex flex-col justify-between z-20 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-20`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 mb-5 rounded-lg bg-gray-500 flex items-center justify-center text-sm font-bold">
            {`${roomData[0]?.companyName
              .charAt(0)
              .toUpperCase()}${roomData[0]?.companyName
              .charAt(roomData[0].companyName.length - 1)
              .toUpperCase()}`}
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.to);
                setActive(item.id);
                setIsSidebarOpen(false);
              }}
              className="flex flex-col items-center gap-1 transition-colors cursor-pointer w-full"
            >
              <div
                className={`p-3 rounded-lg w-full flex justify-center ${
                  active === item.id ? "bg-white/30" : "hover:bg-white/10"
                }`}
              >
                {item.icon}
              </div>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <button className="bg-white text-black p-1 rounded-full">
            <Plus size={20} />
          </button>
          <img
            src={
              roomData[0]?.admin === null
                ? roomData[0]?.user?.profilePicture
                : roomData[0]?.admin?.profilePicture
            }
            alt="User image"
            className="w-10 h-10 rounded-full border-2 border-green-500"
          />
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:ml-20">
        {/* Header */}
        <header className="bg-custom-950 px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden hover:bg-white/10 p-2 rounded"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button className="hover:bg-white/10 p-2 rounded hidden md:block">
              <ArrowLeft size={18} />
            </button>
            <button className="hover:bg-white/10 p-2 rounded hidden md:block">
              <ArrowRight size={18} />
            </button>
            <button className="hover:bg-white/10 p-2 rounded hidden md:block">
              <Clock size={18} />
            </button>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="flex items-center bg-white/10 rounded-full px-3 py-1 text-sm">
              <input
                type="text"
                placeholder="Search zohaib soft solution"
                className="bg-transparent outline-none text-white placeholder-white/70 flex-1 px-2 py-1"
              />
              <Search size={16} className="text-white/70" />
            </div>
          </div>

          <div>
            <button className="hover:bg-white/10 p-2 rounded">
              <HelpCircle size={18} />
            </button>
          </div>
        </header>

        {/* Content Rendered Based on Active State */}
        <main className="flex-1  overflow-y-auto">
          <div>
            <RoomSidebar type={active} channels={roomData[0]?.channel} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarWithHeader;
