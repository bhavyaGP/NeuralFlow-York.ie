import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import EventDetails from './components/pages/EventDetails';
import AddEvent from './components/pages/AddEvent';
import EditEvent from './components/pages/EditEvent';
import Dashboard from './components/pages/Dashboard';
import NotFound from './components/pages/NotFound';

// Auth
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="container mx-auto px-4 py-6 flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route 
                path="/add-event" 
                element={
                    <AddEvent />
                } 
              />
              <Route 
                path="/edit-event/:id" 
                element={
                    <EditEvent />
                } 
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 