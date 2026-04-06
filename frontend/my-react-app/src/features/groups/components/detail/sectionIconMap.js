import {
  Megaphone,
  MessagesSquare,
  HelpCircle,
  Box,
  Compass,
} from "lucide-react";

export const SECTION_ICON_MAP = {
  Megaphone,
  MessagesSquare,
  HelpCircle,
  Box,
};

export const getSectionIcon = (iconKey) => {
  return SECTION_ICON_MAP[iconKey] || Compass;
};
