import React, { useMemo, useState } from 'react';

export default function Waitlist({ waitlist, addToWaitlist, removeFromWaitlist, messageGuest, assignGuestToRoom, rooms, sessionDuration }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [checkingInId, setCheckingInId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Determine closing time based on day of week
  const day = new Date().getDay();
  const isLateClosing = (day === 5 || day === 6); // Fri (5) or Sat (6)
  const CLOSING_TEXT = isLateClosing ? '12:00 AM' : '11:00 PM';

  // SIMULATION LOGIC: Calculate entry times for the whole waitlist
  const simulatedGuests = useMemo(() => {
    // 1. Get functional rooms and their current "release" times
    let releaseTimes = rooms
      .filter((r) => r.status !== 'broken')
      .map((r) => (r.status === 'open' ? 0 : r.remaining));

    if (releaseTimes.length === 0) return waitlist.map(g => ({ ...g, entryWait: Infinity }));

    // 2. Simulate placing each guest into the earliest available slot
    return waitlist.map((guest) => {
      releaseTimes.sort((a, b) => a - b);
      const entryWait = releaseTimes[0];
      // Update that room's next release time
      releaseTimes[0] = entryWait + sessionDuration;
      return { ...guest, entryWait };
    });
  }, [waitlist, rooms, sessionDuration]);

  // Next guest's wait time (for the input form / top bar)
  const nextGuestWait = useMemo(() => {
    let releaseTimes = rooms
      .filter((r) => r.status !== 'broken')
      .map((r) => (r.status === 'open' ? 0 : r.remaining));
    
    if (releaseTimes.length === 0) return 0;

    // Simulate placing all current guests first
    waitlist.forEach(() => {
      releaseTimes.sort((a, b) => a - b);
      releaseTimes[0] += sessionDuration;
    });

    releaseTimes.sort((a, b) => a - b);
    return releaseTimes[0];
  }, [waitlist, rooms, sessionDuration]);

  // Display value for "Current wait time"
  const earliestAvailable = useMemo(() => {
    const functional = rooms.filter(r => r.status !== 'broken');
    if (functional.length === 0) return 0;
    const releaseTimes = functional.map(r => r.status === 'open' ? 0 : r.remaining);
    return Math.min(...releaseTimes);
  }, [rooms]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (name && phone) {
      addToWaitlist(name, phone);
      setName('');
      setPhone('');
    }
  };

  const formatEntryTime = (waitSeconds) => {
    if (waitSeconds === 0) return 'Now';
    if (waitSeconds === Infinity) return 'N/A';
    const entryDate = new Date(Date.now() + waitSeconds * 1000);
    return entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isPastClosing = (waitSeconds) => {
    if (waitSeconds === Infinity) return false;
    const entryDate = new Date(Date.now() + waitSeconds * 1000);
    const closingDate = new Date();
    
    if (isLateClosing) {
      // Midnight at end of day (start of tomorrow)
      closingDate.setDate(closingDate.getDate() + 1);
      closingDate.setHours(0, 0, 0, 0);
    } else {
      // 11:00 PM
      closingDate.setHours(23, 0, 0, 0);
    }
    return entryDate >= closingDate;
  };

  const waitlistClosed = isPastClosing(nextGuestWait);
  const openRooms = rooms.filter(r => r.status === 'open');

  return (
    <div className="waitlist-inner">
      <div className="wait-time-bar">
        Estimated entry for next guest: {formatEntryTime(nextGuestWait)}
      </div>

      {waitlistClosed ? (
        <div className="closed-message">
          ⚠️ Waitlist is done for the day. (Estimated entry past {CLOSING_TEXT})
        </div>
      ) : (
        <form className="waitlist-form" onSubmit={handleAdd}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <button type="submit" className="button">Add to Waitlist</button>
        </form>
      )}

      <div className="waitlist-items">
        <div className="waitlist-header" style={{ display: 'flex', fontWeight: 'bold', marginTop: '1rem' }}>
          <span style={{ flex: 2 }}>Guest</span>
          <span style={{ flex: 1 }}>Elapsed</span>
          <span style={{ flex: 1 }}>Est. Entry</span>
          <span style={{ flex: 2 }}>Actions</span>
        </div>
        
        {simulatedGuests.map((guest) => {
          const isCheckingIn = checkingInId === guest.id;
          const isUrgent = guest.entryWait < 300; // 5 mins

          return (
            <div key={guest.id} className={`waitlist-item ${isUrgent ? 'ready-glow' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 2 }}>
                <strong>{guest.name}</strong>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{guest.phone}</div>
                {isUrgent && <span className="message-note">⚠️ MESSAGE THEM!</span>}
              </div>
              <span style={{ flex: 1 }}>{guest.elapsed}s</span>
              <span style={{ flex: 1 }}>
                <span className={guest.entryWait === 0 ? 'text-now' : ''}>
                  {formatEntryTime(guest.entryWait)}
                </span>
              </span>
              
              <span style={{ flex: 2 }} className="action-cell">
                {isCheckingIn ? (
                  <div className="assignment-controls">
                    <select 
                      value={selectedRoomId} 
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="room-select"
                    >
                      <option value="">Room</option>
                      {openRooms.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <button 
                      className="button confirm-btn"
                      disabled={!selectedRoomId}
                      onClick={() => {
                        assignGuestToRoom(guest.id, selectedRoomId);
                        setCheckingInId(null);
                        setSelectedRoomId('');
                      }}
                    >
                      ✓
                    </button>
                    <button 
                      className="button cancel-btn"
                      onClick={() => {
                        setCheckingInId(null);
                        setSelectedRoomId('');
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <button className="button" onClick={() => messageGuest(guest.id)}>Message</button>
                    <button 
                      className="button" 
                      onClick={() => {
                        setCheckingInId(guest.id);
                        setSelectedRoomId('');
                      }}
                    >
                      Check‑in
                    </button>
                    <button 
                      className="button delete-btn" 
                      title="Remove from waitlist"
                      onClick={() => {
                        if (confirm(`Remove ${guest.name} from waitlist?`)) {
                          removeFromWaitlist(guest.id);
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


