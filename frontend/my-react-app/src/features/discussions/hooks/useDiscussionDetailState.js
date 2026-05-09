import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import {
  useDiscussion,
  useAddComment,
  useVote,
  useCommentVote,
  useToggleSave,
  useBoostDiscussion,
} from "../../../hooks/useDiscussionHooks";
import { useAuth } from "../../../context/AuthContext";
import { createReport } from "../../../services/report";

export const useDiscussionDetailState = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [commentSort] = useState("newest");
  const [commentContent, setCommentContent] = useState("");
  const [websiteHoneypot, setWebsiteHoneypot] = useState("");
  const [lastLevel, setLastLevel] = useState(user?.current_level);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    targetId: null,
    targetType: "",
  });
  const [isReporting, setIsReporting] = useState(false);
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    image: null,
    title: "",
  });
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { data, isLoading, error } = useDiscussion(id, commentSort);
  const addCommentMutation = useAddComment(id);
  const voteMutation = useVote(id);
  const commentVoteMutation = useCommentVote(id);
  const toggleSaveMutation = useToggleSave(id);
  const boostMutation = useBoostDiscussion();

  useEffect(() => {
    if (user?.current_level > lastLevel) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      toast.success(`Level Up! Reached Level ${user.current_level}`, {
        icon: "🚀",
      });
      setLastLevel(user.current_level);
    }
  }, [user?.current_level, lastLevel]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVote = (voteType) => {
    if (!isAuthenticated) {
      toast.info("Log in to vote");
      return;
    }

    voteMutation.mutate(voteType);
  };

  const handleCommentVote = (commentId, voteType) => {
    if (!isAuthenticated) {
      toast.info("Log in to vote");
      return;
    }

    commentVoteMutation.mutate({ commentId, voteType });
  };

  const handleReplySubmit = (event, parentId) => {
    event.preventDefault();
    if (!replyContent.trim()) {
      return;
    }

    addCommentMutation.mutate(
      { content: replyContent, parentId, website: websiteHoneypot },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplyingTo(null);
          setWebsiteHoneypot("");
        },
      },
    );
  };

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    if (!commentContent.trim()) {
      return;
    }

    addCommentMutation.mutate(
      { content: commentContent, website: websiteHoneypot },
      {
        onSuccess: () => {
          setCommentContent("");
          setWebsiteHoneypot("");
        },
      },
    );
  };

  const handleOpenReport = (targetId, targetType) => {
    setReportModal({ isOpen: true, targetId, targetType });
  };

  const handleCreateReport = async (reason) => {
    setIsReporting(true);

    try {
      await createReport(reportModal.targetType, reportModal.targetId, reason);
      return true;
    } catch (error) {
      toast.error("Failed to submit report. Please try again later.");
      throw error;
    } finally {
      setIsReporting(false);
    }
  };

  return {
    id,
    user,
    isAuthenticated,
    navigate,
    data,
    isLoading,
    error,
    commentContent,
    setCommentContent,
    websiteHoneypot,
    setWebsiteHoneypot,
    isImageLoading,
    setIsImageLoading,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    reportModal,
    setReportModal,
    isReporting,
    lightbox,
    setLightbox,
    showBackToTop,
    addCommentMutation,
    voteMutation,
    commentVoteMutation,
    toggleSaveMutation,
    boostMutation,
    handleVote,
    handleCommentVote,
    handleReplySubmit,
    handleCommentSubmit,
    handleOpenReport,
    handleCreateReport,
    scrollToTop,
  };
};
