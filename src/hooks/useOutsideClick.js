import { useEffect } from "react";

// Calls `cb` on a pointer press outside `ref`. Presses on the element with
// id `exceptionId` (usually the toggle button) are ignored.
export default function useOutsideClick(ref, exceptionId, cb, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function handleOutsideClick(event) {
      const exception = exceptionId && document.getElementById(exceptionId);
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        !(exception && exception.contains(event.target))
      ) {
        cb();
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [ref, exceptionId, cb, enabled]);
}
