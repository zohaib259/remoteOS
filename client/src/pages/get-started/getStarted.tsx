import { CreateCollabRoom } from "@/components/common/createCollabRoom";

const GetStarted = () => {
  return (
    <div className="min-h-screen bg-watercourse-950  flex items-center justify-center px-4">
      <div className="max-w-xl text-center text-white space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Collaborate with Your Remote Team
        </h1>
        <p className="text-gray-200 text-lg">
          Manage tasks, communicate easily, and stay productive together.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <CreateCollabRoom />
          <button className="border border-gray-600 cursor-pointer text-white px-6 py-3 rounded-xl hover:bg-watercourse-900 transition">
            Join Your Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
