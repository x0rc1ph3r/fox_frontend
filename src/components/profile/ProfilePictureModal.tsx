import { Dialog, DialogPanel } from "@headlessui/react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string;
  onImageChange: (file: File, previewUrl: string) => Promise<void>;
  isUploading?: boolean;
}

export default function ProfilePictureModal({
  isOpen,
  onClose,
  currentImage,
  onImageChange,
  isUploading = false,
}: ProfilePictureModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSave = async () => {
    if (selectedFile && previewImage) {
      await onImageChange(selectedFile, previewImage);
      handleClose();
    }
  };

  const handleClose = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-50 focus:outline-none"
      onClose={handleClose}
    >
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto bg-black/80 backdrop-blur-sm">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-[480px] rounded-2xl bg-white shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 pt-6 pb-4">
              <h4 className="text-xl text-black-1000 font-bold font-inter">
                Update Profile Picture
              </h4>
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 cursor-pointer transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src="/icons/cross-icon.svg" alt="close" className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full px-6 py-6 space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-color shadow-lg">
                    <img
                      src={previewImage || currentImage}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {previewImage && (
                    <div className="absolute -top-2 -right-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold shadow-md">
                        ✓
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-3 font-inter">
                  {previewImage ? "New image preview" : "Current profile picture"}
                </p>
              </div>

              <div
                onClick={isUploading ? undefined : triggerFileInput}
                onDragOver={isUploading ? undefined : handleDragOver}
                onDragLeave={isUploading ? undefined : handleDragLeave}
                onDrop={isUploading ? undefined : handleDrop}
                className={`
                  w-full border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                  ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  ${
                    isDragging
                      ? "border-primary-color bg-primary-color/10 scale-[1.02]"
                      : "border-gray-300 hover:border-primary-color hover:bg-gray-50"
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-black-1000 font-inter">
                      {isDragging ? "Drop your image here" : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 font-inter">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  disabled={isUploading}
                  className="flex-1 py-3 px-6 rounded-full border border-gray-300 text-black-1000 font-semibold font-inter text-sm hover:bg-gray-50 transition duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedFile || isUploading}
                  className={`
                    flex-1 py-3 px-6 rounded-full font-semibold font-inter text-sm transition duration-300
                    ${
                      selectedFile && !isUploading
                        ? "bg-primary-color text-black-1000 hover:opacity-90 hover:shadow-lg cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Change Picture"
                  )}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
