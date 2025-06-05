import React from "react";

const Footer = ({ sticky }) => {
  return (
    <footer className={`app-footer ${sticky ? "footer-sticky" : ""}`}>
      <p>© 2025 IITTNIF. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
