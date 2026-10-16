import { useEffect } from "react";
import useOutsideClick from "./useOutsideClick";

// Closes a non-modal popover on outside press or Escape. Escape moves
// focus back to the trigger so keyboard users keep their place.
export default function useDismiss(ref, triggerId, isOpen, onClose) {
  useOutsideClick(ref, triggerId, onClose, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
      document.getElementById(triggerId)?.focus();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, triggerId]);
}
