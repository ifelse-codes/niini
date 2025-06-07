# Mini Online Store with WhatsApp Integration (Client-Side Demo)

## Project Overview

This project is a client-side demonstration of a mini online store platform where users can (simulate) creating their own store, managing products, and handling orders. Customer can browse products, add them to a cart, and initiate checkout via a pre-filled WhatsApp message.

It's built entirely with **HTML, Tailwind CSS, and vanilla JavaScript**.

**Important Note on Data Handling:**
*   **Initial Data:** The application loads initial data for users, stores, products, and orders from JSON files located in the `/json` directory.
*   **Session Data (Simulated Persistence):** Since this is a client-side application without a backend database, any new data created during a session (e.g., new user registrations, new stores, new products, new orders) is stored in the browser's `localStorage`. This data will persist for the current browser session but is not written back to the JSON files. If you clear your browser's local storage or open the app in a different browser, session-specific changes will be lost, and only the initial JSON data will be loaded.

## Features

*   **Modern UI:** Styled with Tailwind CSS.
*   **User Management (Simulated):**
    *   User registration and login.
    *   Session management using `localStorage`.
*   **Store Management (Simulated):**
    *   Users can create their own online store.
    *   Dashboard for store owners.
    *   Ability to update store's WhatsApp number (for the session).
*   **Product Management (Simulated):**
    *   Store owners can add new products to their store.
    *   Products are displayed on the main site and filterable by store.
*   **Order Management (Simulated):**
    *   Checkout process generates a WhatsApp message.
    *   Orders are (simulatedly) recorded and viewable in the store owner's dashboard.
*   **Shopping Cart:**
    *   Add products to cart.
    *   View and manage cart contents.
*   **Customer View:**
    *   Browse all products or filter by specific store.
    *   View store list.
*   **Responsive Design:** Adapts to different screen sizes.

## How to Run

Because this application uses JavaScript's `fetch` API to load local JSON data files and potentially JavaScript Modules (though not explicitly stated, it's good practice for `fetch`), you need to serve the files using a local HTTP server. Opening the `index.html` file directly in your browser via a `file:///` URL will likely cause errors due to browser security restrictions (CORS).

Here are a few common ways to run a simple local HTTP server:

**1. Using Python's `http.server` (Python 3):**
   - Open your terminal or command prompt.
   - Navigate to the root directory of this project (where `index.html` is located).
   - Run the command:
     ```bash
     python3 -m http.server 8000
     ```
     (If `python3` doesn't work, try `python -m http.server 8000` if you have Python 2, though Python 3 is recommended).
   - Open your web browser and go to: `http://localhost:8000`

**2. Using Node.js and `serve`:**
   - Make sure you have Node.js installed.
   - Install `serve` globally (if you haven't already):
     ```bash
     npm install -g serve
     ```
   - Open your terminal or command prompt.
   - Navigate to the root directory of this project.
   - Run the command:
     ```bash
     serve .
     ```
   - It will typically serve on `http://localhost:3000` (the terminal output will confirm the address).
   - Open your web browser and go to the address provided.

**3. Using VS Code Live Server Extension:**
   - If you are using Visual Studio Code, you can install the "Live Server" extension.
   - Once installed, right-click on the `index.html` file in the VS Code explorer and select "Open with Live Server".

After starting the server, `index.html` will be the main entry point to the application.

## Project Structure

*   `/index.html`: Main landing page and product display.
*   Other `.html` files: Various pages for login, registration, dashboard, cart, etc.
*   `/style.css`: Compiled Tailwind CSS (simulated). In a full Tailwind setup, this would be generated from source CSS.
*   `/script.js`: Contains all the JavaScript logic for the application.
*   `/json/`: Directory containing JSON files for initial data (`users.json`, `stores.json`, `products.json`, `orders.json`).
*   `/src/input.css`: Source file for Tailwind directives (used in a typical Tailwind build process).
*   `/tailwind.config.js`: Configuration file for Tailwind CSS.
