/**
 * VisionImageEditor
 * ─────────────────
 * Reusable image-picker → crop → compress → upload component.
 *
 * Props
 * ──────
 * aspect      {number}   Crop aspect ratio. 1 = circle (avatar), 16/9 = banner.
 * onDone      {fn}       Called with a FormData ready to POST. Receives (formData).
 * onCancel    {fn}       Called when the user dismisses without saving.
 * isLoading   {bool}     Disables the confirm button while parent is mutating.
 * fieldName   {string}   FormData field name (default "image").
 * extraFields {object}   Extra key/value pairs appended to the FormData.
 *
 * Limits
 * ──────
 * • Client-side 1 MB size guard before opening the cropper.
 * • Canvas → Blob at image/jpeg quality 0.8.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { X, ZoomIn, ZoomOut, Check, Upload } from "lucide-react";
import { showToast } from "../utils/toast";

const MAX_BYTES = 1 * 1024 * 1024; // 1 MB

// ─── Canvas crop helper ────────────────────────────────────────────────────
async function getCroppedBlob(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas toBlob failed"));
          resolve(blob);
        },
        "image/jpeg",
        0.8, // quality — reduces file size further
      );
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

// ─── Main component ────────────────────────────────────────────────────────
export default function VisionImageEditor({
  aspect = 1,
  onDone,
  onCancel,
  isLoading = false,
  fieldName = "image",
  extraFields = {},
  asModal = false,
  initialImageSrc = null,
}) {
  const [imageSrc, setImageSrc] = useState(null); // data-URL of selected file
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const isCircle = aspect === 1;

  useEffect(() => {
    if (initialImageSrc) {
      setImageSrc(initialImageSrc);
      setErrorMsg("");
    }
  }, [initialImageSrc]);

  // ── Step 1: file selected from OS picker ─────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg("");

    // 1 MB guard
    if (file.size > MAX_BYTES) {
      const msg = "File too large — maximum size is 1 MB.";
      setErrorMsg(msg);
      showToast.error(msg, { toastId: `oversize-${Date.now()}` });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = ""; // reset so same file can be re-selected
  };

  const onCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // ── Step 2: user confirms crop ────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);

      // Extra guard: compressed result should still be ≤ 1 MB
      if (blob.size > MAX_BYTES) {
        const msg = "Cropped image is still too large. Try a smaller section.";
        setErrorMsg(msg);
        showToast.error(msg, { toastId: `oversize-crop-${Date.now()}` });
        setProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append(fieldName, blob, "image.jpg");
      // Append any extra fields (e.g. use_skip)
      Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));

      onDone(formData);
      setImageSrc(null); // reset cropper
    } catch (err) {
      console.error(err);
      const msg = "Failed to process image.";
      setErrorMsg(msg);
      showToast.error(msg, { toastId: `crop-failed-${Date.now()}` });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setErrorMsg("");
    onCancel?.();
  };

  // ── No image selected yet — show file picker trigger ─────────────────────
  if (!imageSrc) {
    if (asModal) {
      return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-main)] p-5 space-y-4">
            <p className="text-base font-bold text-[var(--text-main)]">
              {isCircle ? "Update Profile Photo" : "Update Banner Image"}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Select an image to start cropping.
            </p>
            {errorMsg && (
              <p className="text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-active)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
              >
                <Upload className="w-4 h-4" />
                Choose Image
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="inline-flex flex-col gap-2">
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm text-sm font-medium transition-colors">
          <Upload className="w-4 h-4" />
          <span>Choose Image</span>
          <input
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
        </label>
        {errorMsg && (
          <p className="text-xs font-medium text-rose-200 bg-rose-500/20 border border-rose-300/30 rounded-md px-2.5 py-1.5">
            {errorMsg}
          </p>
        )}
      </div>
    );
  }

  // ── Cropper overlay ───────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <p className="text-white font-semibold text-sm">
          {isCircle ? "Crop Profile Picture" : "Crop Banner Image"}
        </p>
        <button
          onClick={handleCancel}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cropper canvas */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={isCircle ? "round" : "rect"}
          showGrid={!isCircle}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Footer controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 px-5 py-4 border-t border-white/10 bg-black/60">
        {/* Zoom slider */}
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <ZoomOut className="w-4 h-4 text-white/60 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-purple-500"
          />
          <ZoomIn className="w-4 h-4 text-white/60 shrink-0" />
        </div>

        {/* Confirm / Cancel */}
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
          >
            {processing || isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Apply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}