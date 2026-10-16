import { Toaster } from "react-hot-toast";
import "./App.css";
import { Link, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import BottomNav from "./components/BottomNav/BottomNav";
import Footer from "./components/Footer/Footer";
import Explore from "./components/Explore/Explore";
import AppLayout from "./components/AppLayout/AppLayout";
import Hotels from "./components/Hotels/Hotels";
import SingleHotel from "./components/SingleHotel/SingleHotel";
import BookmarkLayout from "./components/BookmarkLayout/BookmarkLayout";
import Bookmark from "./components/Bookmark/Bookmark";
import SingleBookmark from "./components/SingleBookmark/SingleBookmark";
import AddNewBookmark from "./components/AddNewBookmark/AddNewBookmark";
import Login from "./components/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { StateMessage } from "./components/States/States";
import AuthContextProvider from "./components/context/AuthProvider";
import CitiesProvider from "./components/context/CitiesProvider";
import BookmarkListProvider from "./components/context/BookmarkListContext";
import HotelsProvider from "./components/context/HotelsProvider";

function NotFound() {
  return (
    <div className="page">
      <StateMessage
        title="Page not found"
        headingLevel={1}
        actions={
          <Link to="/" className="btn btn--primary">
            Go to Explore
          </Link>
        }
      />
    </div>
  );
}

function App() {
  return (
    <AuthContextProvider>
      <CitiesProvider>
          <BookmarkListProvider>
            <HotelsProvider>
              <Toaster position="top-center" toastOptions={{ className: "toast" }} />
              <a href="#main" className="skipLink">
                Skip to content
              </a>
              <Header />
              <main id="main" tabIndex={-1}>
                <Routes>
                  <Route path="/" element={<Explore />} />
                  <Route path="/hotels" element={<AppLayout />}>
                    <Route index element={<Hotels />} />
                  </Route>
                  <Route path="/hotels/:id" element={<SingleHotel />} />
                  <Route
                    path="/bookmark"
                    element={
                      <ProtectedRoute>
                        <BookmarkLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Bookmark />} />
                    <Route path=":id" element={<SingleBookmark />} />
                    <Route path="add" element={<AddNewBookmark />} />
                  </Route>
                  <Route path="login" element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <BottomNav />
            </HotelsProvider>
          </BookmarkListProvider>
      </CitiesProvider>
    </AuthContextProvider>
  );
}

export default App;

// authentication => who is he/she? : information => name, role ...
// authorization => what access have to routes otr files
// role => admin, user, content, manager, ...
