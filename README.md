# Satyam Sharma's Portfolio

Satyam Sharma's Professional Portfolio - Tech Enthusiast | DSA Learner | Social Media Lead @ E-Cell DTC.

## Getting Started

This is a static website. You can run it locally using any web server.

### Using Python (Recommended)

You can use the built-in Python HTTP server to serve the files:

```bash
python -m http.server 8000
```

Then, open your browser and navigate to `http://localhost:8000`.

### Using npm

The project includes convenience scripts in `package.json` that use the Python server:

1.  **Development Server:**
    ```bash
    npm run dev
    ```
    This runs the server on port 8000.

2.  **Preview Server:**
    ```bash
    npm run preview
    ```
    This runs the server on port 3000.

*Note: No `npm install` is required as dependencies (like Three.js) are loaded via CDN.*

## Features

-   **3D Interactive Avatar:** A Three.js powered 3D model that tracks mouse movement.
-   **Modern Dark Theme:** Styled with CSS variables for a sleek, professional look.
-   **Responsive Design:** Fully optimized for mobile and desktop viewing.
-   **Project Showcases:** Detailed cards for featured technical projects.
-   **Contact Form:** Interactive form for inquiries.

## Tech Stack

-   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES Modules)
-   **3D Graphics:** Three.js (via CDN)
-   **Deployment:** Vercel
