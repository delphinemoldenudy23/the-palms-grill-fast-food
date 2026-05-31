import { useRef, useState, useEffect } from "react";
import { FaCamera, FaSpinner, FaTrash } from "react-icons/fa";
import { authApi } from "../lib/api";
import FoodImage from "./FoodImage";
import {
  getUploadFilename,
  isUploadedImage,
  normalizeStoredImage,
  resolveImageUrl,
} from "../lib/imageUrl";

const MAX_MB = 20;

export default function ImageUpload({
  value,
  onChange,
  onImageSaved,
  editingItemId = null,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const previewSrc = value ? resolveImageUrl(value) : null;
  const canDelete = isUploadedImage(value);

  // Reset internal state when value changes to empty
  useEffect(() => {
    if (!value) {
      setError("");
      setSavedMsg("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [value]);

  // Reset when switching edit/add mode
  useEffect(() => {
    setError("");
    setSavedMsg("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [editingItemId]);

  const applyImage = async (rawUrl) => {
    const stored = normalizeStoredImage(rawUrl);

    onChange(stored);
    setSavedMsg("");

    // EDIT MODE
    if (editingItemId && stored) {
      try {
        await authApi.patch(`/api/menu/${editingItemId}/image`, {
          image: stored,
        });

        setSavedMsg("Photo updated successfully.");
        onImageSaved?.();

        // 🔥 global refresh trigger (fixes no-refresh issue)
        window.dispatchEvent(new Event("menu-updated"));
      } catch (err) {
        setSavedMsg(
          "Photo uploaded successfully. Click Update Item to save to menu."
        );
      }
    }

    // ADD MODE
    else if (!editingItemId) {
      setSavedMsg("Photo uploaded successfully. Click Add Item to save to menu.");
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSavedMsg("");

    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image is too large. Maximum size is ${MAX_MB}MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await authApi.post("/api/upload", formData);

      // FIX: always prefer imageUrl
      await applyImage(res.data.imageUrl || res.data.imagePath);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Log out and log in again.");
      } else {
        setError(
          err.response?.data?.message || "Upload failed. Is the backend running?"
        );
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (!canDelete) {
      onChange("");
      return;
    }

    const filename = getUploadFilename(value);
    if (!confirm("Delete this uploaded photo?")) return;

    setDeleting(true);
    setError("");
    setSavedMsg("");

    try {
      await authApi.delete(`/api/upload/${filename}`);
      onChange("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete image");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="md:col-span-2 space-y-3">
      <label className="block font-semibold text-gray-700 text-sm">
        Food photo — shows on customer website
      </label>

      <div className="flex flex-wrap items-start gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || deleting}
          className="flex items-center gap-2 border-2 border-dashed border-orange-300 bg-orange-50 text-orange-700 px-5 py-4 rounded-xl font-semibold hover:bg-orange-100 transition disabled:opacity-60"
        >
          {uploading ? (
            <>
              <FaSpinner className="animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <FaCamera /> Choose photo from device
            </>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
          className="hidden"
          onChange={handleFile}
        />

        {previewSrc && (
          <div className="relative">
            <FoodImage
              src={value}
              alt="Preview"
              className="w-28 h-28 object-cover rounded-xl border shadow"
            />

            {canDelete && (
              <button
                type="button"
                onClick={handleDeleteImage}
                disabled={deleting}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow"
              >
                {deleting ? (
                  <FaSpinner className="animate-spin text-xs" />
                ) : (
                  <FaTrash className="text-xs" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {editingItemId && (
        <p className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
          Editing: new photo saves automatically to the customer menu.
        </p>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {savedMsg && (
        <p className="text-green-600 text-sm font-semibold">{savedMsg}</p>
      )}

      {value && !uploading && !savedMsg && !editingItemId && (
        <p className="text-green-600 text-sm">
          Photo ready — click Add Item to publish.
        </p>
      )}

      <p className="text-gray-400 text-xs">
        JPG, PNG, WEBP, GIF, HEIC · max {MAX_MB}MB
      </p>
    </div>
  );
}