import { useState } from "react";
import {
  FileText,
  Link as LinkIcon,
  Download,
  ExternalLink,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
  FileType,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Check if URL is an image (supported for preview on free tier)
const isImageUrl = (url) => {
  if (!url) return false;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some((ext) => lowerUrl.includes(ext));
};

// Check if URL is a PDF
const isPdfUrl = (url) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes(".pdf") || lowerUrl.includes("/pdf/upload/");
};

// Get Cloudinary optimized thumbnail URL (images only - available on free tier)
const getThumbnailUrl = (url, width = 300) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (!isImageUrl(url)) return null;
  return url.replace("/upload/", `/upload/w_${width},c_fill,q_auto,f_auto/`);
};

const getDownloadFilename = (
  originalFilename,
  fileUrl,
  title,
  resourceType,
) => {
  if (originalFilename && originalFilename.includes(".")) {
    return originalFilename;
  }
  if (fileUrl) {
    const urlFilename = decodeURIComponent(
      fileUrl.split("/").pop().split("?")[0],
    );
    if (urlFilename.includes(".")) {
      return urlFilename;
    }
  }
  const sanitizedTitle = (title || "download")
    .replace(/[^a-zA-Z0-9-_\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50);
  let extension = "";
  if (fileUrl) {
    if (
      fileUrl.includes("/raw/upload/") ||
      fileUrl.includes("/image/upload/")
    ) {
      const match = fileUrl.match(
        /\.(pdf|doc|docx|txt|ppt|pptx|xls|xlsx|zip|rar)/i,
      );
      if (match) {
        extension = `.${match[1].toLowerCase()}`;
      } else if (fileUrl.includes("/raw/upload/")) {
        extension = ".pdf";
      }
    } else if (isImageUrl(fileUrl)) {
      const match = fileUrl.match(/\.(jpg|jpeg|png|gif|webp)/i);
      extension = match ? `.${match[1].toLowerCase()}` : ".png";
    }
  }
  if (!extension) {
    switch (resourceType) {
      case "notes":
      case "book":
      case "project":
        extension = ".pdf";
        break;
      default:
        extension = "";
    }
  }
  return sanitizedTitle + extension;
};

const getResourceIcon = (type) => {
  switch (type) {
    case "link":
      return <LinkIcon className="w-5 h-5" />;
    case "notes":
    case "book":
    case "project":
    default:
      return <FileText className="w-5 h-5" />;
  }
};

const getStatusConfig = (status) => {
  switch (status) {
    case "approved":
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        color: "text-green-600 bg-green-50 border-green-200",
        label: "Approved",
      };
    case "rejected":
      return {
        icon: <XCircle className="w-4 h-4" />,
        color: "text-red-600 bg-red-50 border-red-200",
        label: "Rejected",
      };
    case "pending":
    default:
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        label: "Pending Review",
      };
  }
};

const ResourceCard = ({
  resource,
  showStatus = false,
  isModeratorView = false,
  onApprove,
  onReject,
  onDelete,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const {
    resource_id,
    title,
    description,
    resource_type,
    file_url,
    url,
    uploader_name,
    program_name,
    semester,
    status,
    created_at,
    rejection_reason,
    original_filename,
  } = resource;

  const resourceLink = resource_type === "link" ? url : file_url;
  const statusConfig = getStatusConfig(status);
  const displayFilename = getDownloadFilename(
    original_filename,
    file_url,
    title,
    resource_type,
  );

  const isImage = isImageUrl(file_url);
  const isPdf = isPdfUrl(file_url);
  const hasImagePreview = file_url && isImage;
  const thumbnailUrl = isImage ? getThumbnailUrl(file_url, 400) : null;

  return (
    <>
      {/* Preview Modal */}
      {showPreview && file_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-[var(--bg-card)] rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-[var(--border-main)]">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--text-main)] truncate pr-4">
                  {title}
                </h3>
                {displayFilename && (
                  <p className="text-sm text-[var(--text-muted)] truncate">
                    {displayFilename}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-[var(--bg-active)] rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center justify-center bg-[var(--bg-active)] min-h-80 max-h-[70vh] overflow-auto">
              {isImage ? (
                <img
                  src={file_url}
                  alt={title}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center text-[var(--text-muted)] py-12">
                  <FileType className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]/30" />
                  <p className="text-lg font-medium mb-2">
                    {isPdf ? "PDF Document" : "File"}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    Preview not available. Click download to view.
                  </p>
                  {displayFilename && (
                    <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-active)] px-3 py-1 rounded-full inline-block">
                      {displayFilename}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-card)] flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">
                {isImage ? "Image" : isPdf ? "PDF Document" : "File"}
              </span>
              <a
                href={file_url}
                target="_blank"
                rel="noopener noreferrer"
                download={displayFilename}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="w-full mx-0 bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-main)] border-x-0 sm:border-x hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full group">
        {/* Image Thumbnail Preview */}
        {hasImagePreview && thumbnailUrl ? (
          <div
            className="relative h-40 bg-[var(--bg-active)] overflow-hidden cursor-pointer"
            onClick={() => setShowPreview(true)}
          >
            <img
              src={thumbnailUrl}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.classList.add("hidden");
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-card)]/90 rounded-full p-3 shadow-lg border border-[var(--border-main)]">
                <Eye className="w-5 h-5 text-[var(--text-main)]" />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="relative h-40 bg-[var(--bg-active)] border-b border-[var(--border-main)] flex flex-col items-center justify-center gap-2 cursor-pointer group/preview"
            onClick={() => setShowPreview(true)}
          >
            <div className="p-3 bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-main)] text-purple-600 group-hover/preview:scale-110 transition-transform duration-300">
              {getResourceIcon(resource_type)}
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {isPdf ? "PDF Document" : resource_type || "Resource"}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                No preview available
              </p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
              <div className="bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm border border-[var(--border-main)]">
                <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {/* Header: Type and Status */}
          <div className="flex justify-between items-start mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold capitalize border border-purple-100">
              {getResourceIcon(resource_type)}
              {resource_type}
            </div>
            {showStatus && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </div>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="font-bold text-[var(--text-main)] text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {title}
          </h3>
          <p className="text-[var(--text-muted)] text-sm mb-4 line-clamp-3 flex-1">
            {description || "No description provided."}
          </p>

          {/* Rejection Reason if any */}
          {status === "rejected" && rejection_reason && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 mb-4">
              <span className="font-semibold">Reason:</span> {rejection_reason}
            </div>
          )}

          {/* Meta info */}
          <div className="mt-auto space-y-2">
            <div className="flex flex-wrap gap-2">
              {program_name && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] bg-[var(--bg-active)] px-2 py-1 rounded border border-[var(--border-main)]">
                  <User className="w-3 h-3" /> {program_name}
                </span>
              )}
              {semester && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] bg-[var(--bg-active)] px-2 py-1 rounded border border-[var(--border-main)]">
                  <Calendar className="w-3 h-3" /> Sem {semester}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-2">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {uploader_name || "Unknown"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="border-t border-[var(--border-main)] bg-[var(--bg-active)]/50 p-3 sm:p-4">
          {isModeratorView ? (
            <div className="space-y-2">
              {file_url && resource_type !== "link" && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Uploaded File
                </button>
              )}
              {resource_type === "link" && url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Link
                </a>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(resource_id)}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(resource_id)}
                  className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete();
                  }}
                  className="px-3 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-300 flex-shrink-0 flex items-center justify-center"
                  title="Delete Resource"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {file_url && resource_type !== "link" && (
                <button
                  onClick={() => setShowPreview(true)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                    status === "approved" || !showStatus
                      ? "bg-[var(--bg-active)] text-[var(--text-main)] hover:bg-[var(--border-main)]"
                      : "bg-[var(--bg-active)] text-[var(--text-muted)] cursor-not-allowed"
                  }`}
                  disabled={showStatus && status !== "approved"}
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              )}
              <a
                href={resourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  status === "approved" || !showStatus
                    ? "bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white"
                    : "bg-[var(--bg-active)] text-[var(--text-muted)] cursor-not-allowed"
                }`}
                onClick={(e) => {
                  if (status !== "approved" && showStatus) {
                    e.preventDefault();
                  }
                }}
              >
                {resource_type === "link" ? (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Visit Link
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download
                  </>
                )}
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ResourceCard;
