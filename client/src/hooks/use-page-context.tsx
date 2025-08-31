import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export type PageType = 
  | "home" 
  | "creator-profile"
  | "own-profile-settings"
  | "studio"
  | "studio-data"
  | "discover"
  | "help"
  | "auth"
  | "messages"
  | "chat";

export interface PageContext {
  pageType: PageType;
  isOwnCreatorProfile?: boolean;
  creatorHandle?: string;
  showCompactComposer?: boolean;
}

export function usePageContext(): PageContext {
  const [location] = useLocation();
  const { user } = useAuth();

  // Determine page type based on current location
  const getPageType = (): PageType => {
    if (location === "/" || location === "") return "home";
    if (location.startsWith("/creator/")) return "creator-profile";
    if (location === "/profile") return "own-profile-settings";
    if (location.startsWith("/studio/data") || location.startsWith("/studio/analytics")) return "studio-data";
    if (location.startsWith("/studio")) return "studio";
    if (location.startsWith("/discover")) return "discover";
    if (location.startsWith("/help")) return "help";
    if (location.startsWith("/auth") || location.startsWith("/login") || location.startsWith("/register")) return "auth";
    if (location.startsWith("/messages")) return "messages";
    if (location.startsWith("/chat")) return "chat";
    return "home";
  };

  const pageType = getPageType();

  // Extract creator handle from URL if on creator profile
  const creatorHandle = pageType === "creator-profile" 
    ? location.split("/creator/")[1]?.split("?")[0] 
    : undefined;

  // Determine if this is user's own creator profile
  // Need to check if the creator handle matches the current user's creator profile
  const isOwnCreatorProfile = pageType === "creator-profile" && user?.role === "creator" && creatorHandle;

  // Show compact composer only on own creator profile
  const showCompactComposer = isOwnCreatorProfile;

  return {
    pageType,
    isOwnCreatorProfile,
    creatorHandle,
    showCompactComposer,
  };
}