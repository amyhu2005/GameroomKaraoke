import React, { useMemo, useState } from 'react';

export default function Waitlist({ waitlist, addToWaitlist, messageGuest, assignGuestToRoom, rooms, sessionDuration }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [checkingInId, setCheckingInId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // CLOSING TIME CONFIG: 11:00 PM
  const CLOSING_HOUR = 23; 
  const CLOSING_MINUTE = 0;

  // Calculate earliest remaining time among occupied rooms (in seconds)
  const earliestRemaining = useMemo(() => {
    const occupied = rooms.filter((r) => r.status === 'occupied');
    if (occupied.length === 0) return 0;
    return Math.min(...occupied.map((r) => r.remaining));
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
    const entryDate = new Date(Date.now() + waitSeconds * 1000);
    return entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEntryDate = (waitSeconds) => {
    return new Date(Date.now() + waitSeconds * 1000);
  };

  const isPastClosing = (waitSeconds) => {
    const entryDate = getEntryDate(waitSeconds);
    const closingDate = new Date();
    closingDate.setHours(CLOSING_HOUR, CLOSING_MINUTE, 0, 0);
    return entryDate >= closingDate;
  };

  const openRooms = rooms.filter(r => r.status === 'open');
  const nextWaitSeconds = waitlist.length > 0 
    ? earliestRemaining + waitlist.length * sessionDuration
    : earliestRemaining;

  const waitlistClosed = isPastClosing(nextWaitSeconds);

  return (
    <div className="waitlist-inner">
      <div className="wait-time-bar">
        Wait time: {formatEntryTime(earliestRemaining)}
      </div>

      {waitlistClosed ? (
        <div className="closed-message">
          ⚠️ Waitlist is done for the day. (Estimated entry past 11:00 PM)
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
        
        {waitlist.map((guest, index) => {
          const waitSeconds = earliestRemaining + index * sessionDuration;
          const isCheckingIn = checkingInId === guest.id;
          const isUrgent = waitSeconds < 300; // 5 mins

          return (
            <div key={guest.id} className={`waitlist-item ${isUrgent ? 'ready-glow' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 2 }}>
                <strong>{guest.name}</strong>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{guest.phone}</div>
                {isUrgent && <span className="message-note">⚠️ MESSAGE THEM!</span>}
              </div>
              <span style={{ flex: 1 }}>{guest.elapsed}s</span>
              <span style={{ flex: 1 }}>{formatEntryTime(waitSeconds)}</span>
              
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


