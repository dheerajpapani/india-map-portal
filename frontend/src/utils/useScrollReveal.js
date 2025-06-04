// src/utils/useScrollReveal.js
import { useEffect } from "react";

const useScrollReveal = () => {
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");

    const handleScroll = () => {
      const triggerBottom = window.innerHeight * 0.85;

      revealElements.forEach((el) => {
        const boxTop = el.getBoundingClientRect().top;

        if (boxTop < triggerBottom) {
          el.classList.add("active");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // trigger on load

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
};

export default useScrollReveal;
