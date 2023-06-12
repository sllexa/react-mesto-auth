import { useEffect } from "react";

function usePopupClose(isOpen, closePopup) {
  useEffect(() => {
    if (!isOpen) return;

    const handleOverlay = (event) => {
      if (event.target.classList.contains("modal_open")) {
        closePopup();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closePopup();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleOverlay);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleOverlay);
    };
  }, [isOpen, closePopup]);
}

export default usePopupClose;