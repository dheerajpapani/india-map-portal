// src/pages/Home.jsx
import React from "react";
import Banner from "../components/Banner";

const Home = () => {
  return (
    <section id="home">
      <Banner />

      <section className="mt-5 text-center">
        <h2>Welcome to the India Map GeoPortal</h2>
        <p>This platform offers interactive maps and geospatial insights using open-source technologies.</p>
      </section>

      <section className="mt-4 text-center">
        <h3>Explore Features</h3>
        <p>Use continent filters, view styled legends, and analyze water bodies with WMS/WFS layers.</p>
      </section>
    </section>
  );
};

export default Home;
