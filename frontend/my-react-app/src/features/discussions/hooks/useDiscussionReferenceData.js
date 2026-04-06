import { useEffect, useState } from "react";
import { getDiscussionDegrees } from "../services/discussionApi";

export const useDiscussionReferenceData = () => {
  const [degrees, setDegrees] = useState([]);

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const data = await getDiscussionDegrees();
        setDegrees(data);
      } catch (error) {
        console.error("Failed to fetch reference data:", error);
      }
    };

    fetchReferenceData();
  }, []);

  return { degrees };
};
