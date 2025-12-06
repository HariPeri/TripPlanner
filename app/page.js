'use client';

import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

import { initialUser, sampleTrips as initialTrips, sampleCountries } from '@/lib/mockData';
import HomePage from '@/components/HomePage';
import Login from '@/components/Login';
import Signup from '@/components/Signup';
import Dashboard from '@/components/Dashboard';
import NewTrip from '@/components/NewTrip';
import TripDetail from '@/components/TripDetail';

const TravelPlannerApp = () => {
  const [currentView, setCurrentView] = useState('homepage');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState(initialTrips);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [newTripForm, setNewTripForm] = useState({ title: '', country: '', days: 1 });
  const [tripDetails, setTripDetails] = useState({ days: [] });

  // Auth Handlers
const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    });
    
    const data = await response.json();
    
    if (data.success) {
      setUser(data.user);
      setCurrentView('dashboard');
      fetchTrips(data.user.email);
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed');
  }
};

const handleSignup = async () => {
  if (!signupForm.email || !signupForm.username || !signupForm.password) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupForm)
    });
    
    const data = await response.json();
    
    if (data.success) {
      setUser(data.user);
      setCurrentView('dashboard');
      setTrips([]);
    } else {
      alert(data.error || 'Signup failed');
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert('Signup failed');
  }
};

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentView('homepage');
  };

  // Trips/ Itinerary Handlers
  const fetchTrips = async (email) => {
    try {
      const response = await fetch(`/api/trips?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (data.trips) {
        setTrips(data.trips.map(t => ({ ...t, status: 'upcoming' })));
      }
    } catch (error) {
      console.error('Fetch trips error:', error);
    }
  };
  
  const handleCreateTrip = () => {
    if (newTripForm.title && newTripForm.country) {
      const newTrip = {
        trip_id: trips.length + 1,
        title: newTripForm.title,
        country_name: newTripForm.country,
        status: 'upcoming',
      };
      setTrips([...trips, newTrip]);

      const days = [];
      for (let i = 1; i <= parseInt(newTripForm.days); i++) {
        days.push({ number: i, items: [] });
      }
      setTripDetails({ ...newTrip, days });
      setSelectedTrip(newTrip);
      setNewTripForm({ title: '', country: '', days: 1 });
      setCurrentView('tripDetail');
    }
  };

  const handleDeleteTrip = (tripId) => {
    setTrips(trips.filter((t) => t.trip_id !== tripId));
    if (selectedTrip?.trip_id === tripId) {
      setCurrentView('dashboard');
    }
  };

  const handleViewTrip = (trip) => {
    if (!tripDetails.days || tripDetails.trip_id !== trip.trip_id) {
      const days = [];
      for (let i = 1; i <= 3; i++) {
        days.push({ number: i, items: [] });
      }
      setTripDetails({ ...trip, days });
    }
    setSelectedTrip(trip);
    setCurrentView('tripDetail');
  };

  const addItineraryItem = (dayNumber) => {
    const updatedDays = tripDetails.days.map((day) => {
      if (day.number === dayNumber) {
        const newItem = {
          item_id: day.items.length + 1,
          startTime: '09:00',
          endTime: '10:00',
          activity: '',
          notes: '',
        };
        return { ...day, items: [...day.items, newItem] };
      }
      return day;
    });
    setTripDetails({ ...tripDetails, days: updatedDays });
  };

  const updateItineraryItem = (dayNumber, itemId, field, value) => {
    const updatedDays = tripDetails.days.map((day) => {
      if (day.number === dayNumber) {
        const updatedItems = day.items.map((item) => {
          if (item.item_id === itemId) {
            return { ...item, [field]: value };
          }
          return item;
        });
        return { ...day, items: updatedItems };
      }
      return day;
    });
    setTripDetails({ ...tripDetails, days: updatedDays });
  };

  const deleteItineraryItem = (dayNumber, itemId) => {
    const updatedDays = tripDetails.days.map((day) => {
      if (day.number === dayNumber) {
        return { ...day, items: day.items.filter((item) => item.item_id !== itemId) };
      }
      return day;
    });
    setTripDetails({ ...tripDetails, days: updatedDays });
  };

  const filteredTrips = trips.filter((trip) =>
    trip.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // View Switcher
  if (currentView === 'homepage') {
    return <HomePage setCurrentView={setCurrentView} />;
  }

  if (currentView === 'login') {
    return (
      <Login
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
        setCurrentView={setCurrentView}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <Signup
        signupForm={signupForm}
        setSignupForm={setSignupForm}
        handleSignup={handleSignup}
        setCurrentView={setCurrentView}
      />
    );
  }

  if (currentView === 'dashboard') {
    return (
      <Dashboard
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredTrips={filteredTrips}
        handleDeleteTrip={handleDeleteTrip}
        handleViewTrip={handleViewTrip}
        handleLogout={handleLogout}
        setCurrentView={setCurrentView}
      />
    );
  }

  if (currentView === 'newTrip') {
    return (
      <NewTrip
        newTripForm={newTripForm}
        setNewTripForm={setNewTripForm}
        handleCreateTrip={handleCreateTrip}
        sampleCountries={sampleCountries}
        setCurrentView={setCurrentView}
      />
    );
  }

  if (currentView === 'tripDetail') {
    return (
      <TripDetail
        tripDetails={tripDetails}
        addItineraryItem={addItineraryItem}
        updateItineraryItem={updateItineraryItem}
        deleteItineraryItem={deleteItineraryItem}
        setCurrentView={setCurrentView}
      />
    );
  }

  return null;
};

export default TravelPlannerApp;