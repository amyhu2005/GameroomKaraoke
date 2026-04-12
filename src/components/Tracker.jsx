import React, { useState, useEffect } from 'react';
import RoomGrid from './RoomGrid.jsx';
import Waitlist from './Waitlist.jsx';

export default function Tracker({ title, initialItems, sessionDuration }) {
  const [items, setItems] = useState(initialItems);
  const [waitlist, setWaitlist] = useState([]);

  // Countdown for occupied items
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((r) => {
          if (r.status === 'occupied' && r.remaining > 0) {
            const newRemaining = r.remaining - 1;
            if (newRemaining === 0) {
              return { ...r, status: 'open', remaining: 0 };
            }
            return { ...r, remaining: newRemaining };
          }
          return r;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (r.status === 'open') {
            return { ...r, status: 'occupied', remaining: sessionDuration };
          }
          return { ...r, status: 'open', remaining: 0 };
        }
        return r;
      })
    );
  };

  const toggleBroken = (id) => {
    setItems((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (r.status === 'broken') {
            return { ...r, status: 'open', remaining: 0 };
          }
          return { ...r, status: 'broken', remaining: 0 };
        }
        return r;
      })
    );
  };

  const addToWaitlist = (name, phone) => {
    setWaitlist((prev) => [
      ...prev,
      { id: Date.now(), name, phone, elapsed: 0 },
    ]);
  };

  // Increment waitlist elapsed time and check for Midnight Reset
  useEffect(() => {
    let lastDate = new Date().toDateString();
    
    const interval = setInterval(() => {
      const currentDate = new Date().toDateString();
      
      // Check for day change (Midnight Reset)
      if (currentDate !== lastDate) {
        setItems(initialItems);
        setWaitlist([]);
        lastDate = currentDate;
      }

      setWaitlist((prev) =>
        prev.map((w) => ({ ...w, elapsed: w.elapsed + 1 }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [initialItems]);

  const messageGuest = (id) => {
    alert('Message sent (placeholder)');
  };

  const assignGuestToRoom = (guestId, roomId) => {
    setItems((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, status: 'occupied', remaining: sessionDuration } : r
      )
    );
    setWaitlist((prev) => prev.filter((w) => w.id !== guestId));
  };

  const removeFromWaitlist = (id) => {
    setWaitlist((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="tracker-section container">
      <h1 className="section-title">{title}</h1>
      <RoomGrid rooms={items} onToggle={toggleItem} onToggleBroken={toggleBroken} />
      <div className="waitlist-card card">
        <h3>{title} Waitlist</h3>
        <Waitlist
          waitlist={waitlist}
          addToWaitlist={addToWaitlist}
          removeFromWaitlist={removeFromWaitlist}
          messageGuest={messageGuest}
          assignGuestToRoom={assignGuestToRoom}
          rooms={items}
          sessionDuration={sessionDuration}
        />
      </div>
    </div>
  );
}
