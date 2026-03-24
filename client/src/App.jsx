import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar      from "./components/Navbar";
import Footer      from "./components/Footer";
import Home        from "./pages/Home";
import JobListing  from "./pages/JobListing";
import JobDetails  from "./pages/JobDetails";
import Login       from "./pages/Login";
import Register    from "./pages/Register";
import PostJob     from "./pages/PostJob";       // ← NEW

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"                  element={<Home />}        />
          <Route path="/jobs"              element={<JobListing />}  />
          <Route path="/jobs/:jobId"       element={<JobDetails />}  />
          <Route path="/login"             element={<Login />}       />
          <Route path="/register"          element={<Register />}    />
          <Route path="/employer/post-job" element={<PostJob />}     />  {/* ← NEW */}
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}