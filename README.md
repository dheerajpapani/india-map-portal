# India Map Portal 🗺️

[![Deploy Frontend](https://github.com/dheerajpapani/india-map-portal/actions/workflows/deploy.yml/badge.svg)](https://github.com/dheerajpapani/india-map-portal/actions/workflows/deploy.yml)

An open-source, self-hosted web mapping platform focused on India. This project aims to provide free and accessible geospatial services, built with modern web technologies.

**✨ [Explore the Live Demo](https://dheerajpapani.github.io/india-map-portal/) ✨**

---

## 🎯 Project Aim & Vision

The ultimate goal of the **India Map Portal** is to create a free and comprehensive platform for all users to access and interact with geospatial data. This includes providing access to various map services and data formats like **Shapefiles**, **GeoJSON**, and other **OGC-compliant services** (WMS, WFS).

Currently, this repository contains the **fully developed frontend prototype**, which demonstrates the core user interface and showcases key functionalities like interactive mapping and an experimental navigation engine. The next phase will involve building the backend infrastructure to support data hosting, processing, and serving.

---

## ✨ Key Features

This frontend prototype is built with a focus on user experience and modern mapping capabilities.

* **Interactive Map View**: A smooth, responsive map interface powered by **MapLibre GL JS**, centered on India.
* **Custom Data Overlays**: Displays India's border using a local `india_border.geojson` file, showcasing the ability to layer custom data.
* **Dynamic Layer Toggling**: Instantly switch between different base map styles (**Street**, **Hybrid**, **Satellite**).
* **Turn-by-Turn Navigation (Experimental)**:
    * **Route Planning**: Select a destination on the map to generate a driving route using the OSRM API.
    * **Real-time GPS Tracking**: Uses the browser's Geolocation API to display your current location with a moving vehicle icon.
    * **Voice Instructions**: Provides spoken turn-by-turn directions using the Web Speech API.
    * **Auto Re-routing**: Automatically calculates a new route if you deviate from the planned path.
    * **Live ETA & Distance**: Displays remaining distance and Estimated Time of Arrival (ETA).
* **CI/CD Pipeline**: Automated deployment to GitHub Pages using **GitHub Actions** on every push to the `main` branch.
* **Component-Based Architecture**: Clean and maintainable code structure using **React** components for each feature.

---

## 🛠️ Tech Stack

* **Frontend**: React, Vite, React Router
* **Mapping**: MapLibre GL JS
* **Routing API**: OSRM (Open Source Routing Machine)
* **Styling**: Bootstrap, CSS3
* **Deployment**: GitHub Actions, GitHub Pages

---

## 🚀 Getting Started

To run this project locally on your machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/dheerajpapani/india-map-portal.git](https://github.com/dheerajpapani/india-map-portal.git)
    ```

2.  **Navigate to the frontend directory:**
    ```bash
    cd india-map-portal/frontend
    ```

3.  **Install the dependencies:**
    ```bash
    npm install
    ```

4.  **Start the local development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

---

## 🙏 Acknowledgements

This project was developed under the guidance and support of the **IIT Tirupati Navavishkar I-Hub Foundation (IITTNiF)**.

A special thanks to my mentor, **Dr. Roshan Srivastava**, for his invaluable help and direction throughout the project.

---

## 📧 Contact

Dheeraj Papani
* **Email**: `dheerajpapani@gmail.com`
* **GitHub**: [@dheerajpapani](https://github.com/dheerajpapani)
