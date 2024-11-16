import { useEffect } from "react";

export default function useOutsideClick(ref, exceptionId, cb) {
  useEffect(() => {
      function handleOutsideClick(event) {
        // console.log(event.target);
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        event.target.id !== exceptionId
      ) {
        cb();
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [ref, cb]);
}
 