import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X, FileText } from "lucide-react";
import type { AppDispatch, RootState } from "@/store/store";
import { useSelector } from "react-redux";
import MessageInput from "../messages/messageInput ";
import { useDispatch } from "react-redux";
import { removeFileAt } from "@/store/messages/messagesSlice";

interface FilePreviewProps {
  handleSendMessage: (data: any) => Promise<void>;
  progress: number;
}

export function FilePreview({ handleSendMessage, progress }: FilePreviewProps) {
  const { files } = useSelector((state: RootState) => state.message);
  const dispatch = useDispatch<AppDispatch>();

  const checkFileType = (file: File) => {
    const mimeType = file.type;
    const fileName = file.name.toLowerCase();

    const isImage = mimeType.startsWith("image/") && !mimeType.includes("svg");
    const isGif = mimeType === "image/gif";
    const isPdf = mimeType === "application/pdf" || fileName.endsWith(".pdf");
    const isDocument = isPdf || fileName.match(/\.(doc|docx|txt|rtf)$/);

    return { isImage, isGif, isDocument };
  };

  const handleRemoveFile = (index: number) => {
    dispatch(removeFileAt(index));
  };

  const createImageUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <AlertDialog open={files.length !== 0}>
      <AlertDialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <AlertDialogHeader className="flex-shrink-0">
          <AlertDialogTitle>Files Selected ({files.length})</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Preview of selected files
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-col p-4 w-full h-full min-h-0">
            {/* Scrollable File Preview Grid */}
            <div className="flex-1 w-full overflow-y-auto mb-4 min-h-0 max-h-[50vh] border rounded-lg p-2">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files?.map((file, index) => {
                  const { isImage, isGif, isDocument } = checkFileType(file);

                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className="relative group"
                    >
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="absolute -top-2 -right-2 z-10 cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={16} />
                      </button>

                      {/* File Preview */}
                      <div className="border rounded-lg overflow-hidden bg-gray-50 aspect-square flex items-center justify-center">
                        {isImage || isGif ? (
                          <div className="w-full h-full relative">
                            <img
                              src={createImageUrl(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              onLoad={(e) => {
                                // Clean up the object URL after image loads
                                // URL.revokeObjectURL(e.currentTarget.src);
                              }}
                            />
                            {isGif && (
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                                GIF
                              </div>
                            )}
                          </div>
                        ) : isDocument ? (
                          <div className="flex flex-col items-center justify-center p-4">
                            <FileText
                              size={48}
                              className="text-gray-400 mb-2"
                            />
                            <span className="text-xs text-center text-gray-600 break-words">
                              {file.name.length > 20
                                ? `${file.name.substring(0, 20)}...`
                                : file.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4">
                            <FileText
                              size={48}
                              className="text-gray-400 mb-2"
                            />
                            <span className="text-xs text-center text-gray-600 break-words">
                              {file.name.length > 20
                                ? `${file.name.substring(0, 20)}...`
                                : file.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="mt-2 text-xs text-gray-600 text-center">
                        <div className="truncate" title={file.name}>
                          {file.name}
                        </div>
                        <div className="text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="flex-shrink-0 w-full">
              <MessageInput
                progress={progress}
                handleSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
