import React, { useState, useRef } from "react";
import { Upload, Play, X, FileText } from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import {
  getSignature,
  uploadToCloudinary,
} from "@/store/messages/messagesSlice";
import toast from "react-hot-toast";

const CloudinaryUploader = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileUrl(null);
    setProgress(0);
    setUploading(false);

    const type = file.type.split("/")[0];
    setFileType(type);

    if (type === "image" || type === "video") {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const startUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);

    try {
      const signatureRes = await dispatch(getSignature()).unwrap();

      const controller = new AbortController();
      controllerRef.current = controller;

      const url = await dispatch(
        uploadToCloudinary({
          file: selectedFile,
          signature: signatureRes,
          signal: controller.signal,
          onProgress: (p) => setProgress(p),
        })
      ).unwrap();

      setFileUrl(url);
      toast.success("Upload completed!");
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    controllerRef.current?.abort();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileType(null);
    setProgress(0);
    setFileUrl(null);
    setUploading(false);
  };

  const getFileIcon = (type: string) => {
    return <FileText className="w-10 h-10 text-white" />;
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg space-y-4">
      <div className="text-center">
        <label className="cursor-pointer inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
          <Upload className="w-4 h-4" />
          Choose File
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
        </label>
      </div>

      {selectedFile && (
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <div className="relative aspect-square max-h-80">
            {fileType === "image" && previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : fileType === "video" && previewUrl ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  src={previewUrl}
                  className="max-w-full max-h-full"
                  controls={false}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white opacity-80" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-700 flex flex-col items-center justify-center">
                {getFileIcon(fileType || "document")}
                <p className="text-white text-sm mt-2 truncate max-w-full px-4">
                  {selectedFile.name}
                </p>
                <p className="text-gray-300 text-xs">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            <button
              onClick={removeFile}
              className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="relative w-16 h-16">
                    <svg
                      className="w-16 h-16 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 40 * (1 - progress / 100)
                        }`}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {progress}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={cancelUpload}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {!uploading && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                    {fileType}
                  </p>
                </div>
              </div>

              <button
                onClick={startUpload}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
            </div>
          )}
        </div>
      )}

      {fileUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-green-800 text-sm font-medium">
              Upload completed!
            </p>
          </div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800 text-sm underline mt-1 inline-block"
          >
            View uploaded file
          </a>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploader;
