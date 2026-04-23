import { useEffect, useState } from "react";
import { getDiscussionPrograms } from "../services/discussionApi";

export const useDiscussionReferenceData = () => {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const data = await getDiscussionPrograms();
        setPrograms(data);
      } catch (error) {
        console.error("Failed to fetch reference data:", error);
      }
    };

    fetchReferenceData();
  }, []);

  return { programs };
};
