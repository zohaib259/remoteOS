import React, { useState } from "react";

const ProtectedPage: React.FC = () => {
  const [message, setMessage] = useState<string>("");

  const handleClick = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/protected", {
        method: "POST",
        credentials: "include", // ✅ Important to send cookies
      });

      if (response.status === 401) {
        const response2 = await fetch(
          "http://localhost:3000/api/auth/refresh-token",
          {
            method: "POST",
            credentials: "include", // ✅ Important to send cookies
          }
        );
        if (response2.status === 403) {
          console.log(response2.statusText);
        }
      }

      if (response.status === 403) {
        setMessage(response.statusText);
      }

      const data = await response.json();
      setMessage(data.message || "Success");
    } catch (error: any) {
      setMessage(error.message || "Something went wrong");
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Call Protected API
      </button>

      {message && (
        <p className="mt-4 text-gray-700">
          Response: <strong>{message}</strong>
        </p>
      )}
    </div>
  );
};

export default ProtectedPage;
