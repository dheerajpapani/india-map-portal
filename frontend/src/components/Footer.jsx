import React from "react";

const Footer = ({ fixed }) => {
  return (
    <footer className={`app-footer ${fixed ? "footer-fixed" : ""}`}>
      <p>© 2025 Your Company. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
