// src/App.jsx
import React, { useState, useRef, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css";

import NavigationBar from "./components/Navbar";
import ScrollToTop   from "./components/ScrollToTop";
import Footer        from "./components/Footer";
import useScrollReveal from "./utils/useScrollReveal";

const Home    = lazy(() => import("./pages/Home"));
const About   = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const MapPage = lazy(() => import("./pages/MapPage"));

const App = () => {
  const [footerFixed, setFooterFixed] = useState(false);
  const [isShortPage, setIsShortPage] = useState(false);
  const scrollTimeout = useRef(null);
  const location = useLocation();

  useScrollReveal();

  const checkPageHeight = () => {
    const body = document.body, html = document.documentElement;
    const windowHeight = window.innerHeight;
    const docHeight = Math.max(
      body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight
    );
    setIsShortPage(docHeight <= windowHeight);
  };

  const handleScroll = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (isShortPage) {
        setFooterFixed(true);
        return;
      }
      const scrollTop = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      setFooterFixed(scrollTop + windowHeight >= docHeight - 10);
    }, 100);
  };

  React.useEffect(() => {
    checkPageHeight();
    window.addEventListener("resize", checkPageHeight);
    window.addEventListener("load", checkPageHeight);
  }, []);

  React.useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [isShortPage]);

  const isMapRoute = location.pathname === "/map";

  // Add the route name as class (e.g. 'about', 'contact', 'home', 'map')
  const routeClass = location.pathname === "/" ? "home" : location.pathname.substring(1);

  return (
    <div className={`${isMapRoute ? "map-container-wrapper" : "app-wrapper"} ${routeClass}`}>
      <NavigationBar />
      <ScrollToTop />
      <Suspense fallback={<div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<div className="page"><Home /></div>} />
          <Route path="/about" element={<div className="page"><About /></div>} />
          <Route path="/contact" element={<div className="page"><Contact /></div>} />
          <Route path="/map" element={<MapPage />} />
          <Route path="*" element={<div className="page"><Home /></div>} />
        </Routes>
      </Suspense>
      {!isMapRoute && <Footer fixed={footerFixed} />}
    </div>
  );
};

export default App;
