import React, { useState } from "react";
import {
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

export default function LightboxModal({ isOpen, onClose, title, file }) {
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  if (!isOpen || !file) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotate((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotate(0);
  };

  const isPdf =
    file.mimetype === "application/pdf" ||
    (file.filename && file.filename.toLowerCase().endsWith(".pdf")) ||
    (file.path && file.path.startsWith("data:application/pdf"));

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 p-4 backdrop-blur-md transition-opacity duration-300">
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-white">
        <div>
          <h3 className="text-lg font-bold tracking-wide">{title}</h3>
          {file.filename && (
            <p className="text-xs text-gray-400 mt-0.5">{file.filename}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isPdf && (
            <>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition text-white"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition text-white"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleRotate}
                title="Rotate Clockwise"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition text-white"
              >
                <RotateCw className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset View"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition text-white"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Close Lightbox"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition text-white ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 flex items-center justify-center overflow-auto relative p-6">
        {isPdf ? (
          <iframe
            src={file.path}
            title={title}
            className="w-full max-w-4xl h-full max-h-[80vh] rounded-2xl border border-white/15 bg-white shadow-2xl"
          />
        ) : (
          <div
            className="transition-transform duration-200 ease-out select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotate}deg)`,
            }}
          >
            <img
              src={file.path}
              alt={title}
              className="max-w-full max-h-[75vh] rounded-xl object-contain shadow-2xl"
              draggable="false"
            />
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="text-center py-2 text-xs text-gray-500">
        {isPdf
          ? "Viewing PDF Document. Use built-in frame controls to zoom/rotate."
          : `Zoom: ${Math.round(zoom * 100)}% | Rotation: ${rotate}°`}
      </div>
    </div>
  );
}
