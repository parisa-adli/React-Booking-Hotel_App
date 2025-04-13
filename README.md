```markdown
# Booking Hotel App

This is a hotel booking application built with React and Vite. The app allows users to search for hotels, view details, bookmark locations, and manage user authentication. It also includes interactive maps and geolocation features.

## Features

- **React Router**: For navigation and routing between pages.
- **Context API & Reducers**: For state management (e.g., bookmarks, hotels, and authentication).
- **Axios**: For making HTTP requests to the backend API.
- **React-Leaflet**: For interactive maps and marker management.
- **React-Hot-Toast**: For displaying notifications.
- **React-Date-Range**: For date selection in hotel searches.
- **Custom Hooks**: Includes reusable hooks like `useGeoLocation`, `useFetch`, and `useOutsideClick`.
- **Protected Routes**: Ensures only authenticated users can access certain pages.
- **JSON Server**: Simulates a backend API for development purposes.
- **ESLint**: For maintaining code quality and consistency.

## Project Structure

```
src/
├── components/       # Reusable React components
├── context/          # Context providers for state management
├── hooks/            # Custom React hooks
├── pages/            # Application pages
├── App.jsx           # Main application component
├── main.jsx          # Entry point
├── App.css           # Global styles
server/
├── db.json           # Mock database for JSON Server
public/
├── vite.svg          # Static assets
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/booking-hotel-app.git
   cd booking-hotel-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Start the mock backend server:
   ```bash
   npm run server
   ```

5. Open the app in your browser at `http://localhost:5173`.


## Tools and Libraries

- **React**: Frontend framework.
- **Vite**: Fast build tool for modern web projects.
- **React Router**: For routing and navigation.
- **React-Leaflet**: For map integration.
- **Axios**: For API requests.
- **React-Hot-Toast**: For notifications.
- **ESLint**: For linting and code quality.


```