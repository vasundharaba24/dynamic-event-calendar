import React, { useState, useEffect } from 'react';

const EventModal = ({ date, events, addEvent, updateEvent, deleteEvent, closeModal, eventToEdit }) => {
  const [eventName, setEventName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('work'); // State to track event type
  const [search, setSearch] = useState(''); // State to search events

  useEffect(() => {
    // If editing an event, pre-fill the form with the event's details
    if (eventToEdit) {
      setEventName(eventToEdit.eventName);
      setStartTime(eventToEdit.startTime);
      setEndTime(eventToEdit.endTime);
      setDescription(eventToEdit.description);
      setEventType(eventToEdit.eventType || 'work');
    }
  }, [eventToEdit]);

  const handleSave = () => {
    // Check if required fields are filled before saving
    if (!eventName || !startTime || !endTime || !eventType) return;

    const newEvent = { eventName, startTime, endTime, description, eventType };
    if (eventToEdit) {
      updateEvent(eventToEdit.index, newEvent); // Update existing event
    } else {
      addEvent(newEvent); // Add new event
    }
    // Clear form after saving
    setEventName('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setEventType('work');
  };

  const handleDelete = () => {
    deleteEvent(eventToEdit.index); // Delete the event
    closeModal(); // Close modal after deletion
  };

  const filteredEvents = events.filter((event) =>
    event.eventName.toLowerCase().includes(search.toLowerCase()) // Filter events based on search term
  );

  const checkOverlapping = (start, end) => {
    // Check if the new event overlaps with existing events
    return events.some((event) => {
      const eventStart = new Date(`1970-01-01T${event.startTime}`);
      const eventEnd = new Date(`1970-01-01T${event.endTime}`);
      const newStart = new Date(`1970-01-01T${start}`);
      const newEnd = new Date(`1970-01-01T${end}`);
      return (
        (newStart >= eventStart && newStart < eventEnd) ||
        (newEnd > eventStart && newEnd <= eventEnd) ||
        (newStart <= eventStart && newEnd >= eventEnd)
      );
    });
  };

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    if (checkOverlapping(newStartTime, endTime)) {
      alert('This event overlaps with an existing event.'); // Alert if there is an overlap
    }
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    if (checkOverlapping(startTime, newEndTime)) {
      alert('This event overlaps with an existing event.'); // Alert if there is an overlap
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#b2d2feaf] flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg w-80 shadow-lg">
        <div className="flex justify-between items-center text-lg font-bold">
          <h2 className='text-[#394c96]'>{eventToEdit ? `Edit Event on ${date}` : `Add Event on ${date}`}</h2>
          <button className="bg-transparent border-none text-lg cursor-pointer" onClick={closeModal}>
            ×
          </button>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          />
          {filteredEvents.length === 0 ? (
            <p className='text-[#394c96]'>No events found</p>
          ) : (
            <ul className="list-none p-0">
              {filteredEvents.map((event, index) => (
                <li key={index} className="mb-2 pt-1">
                  <p>
                    <strong>{event.eventName}</strong>
                  </p>
                  <p>
                    {event.startTime} - {event.endTime }
                  </p>
                  <p>{event.eventType}</p>
                  <p>{event.description}</p>
                  <button onClick={() => deleteEvent(index)} className="bg-[#f8f7fa] rounded-lg py-2 px-4 text-[#394c96] font-semibold hover:bg-gray-200 transition duration-200">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4">
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
            <button onClick={handleSave} className="bg-[#f8f7fa] rounded-lg py-2 px-4 text-[#394c96] font-semibold hover:bg-gray-200 transition duration-200">
              {eventToEdit ? 'Update Event' : 'Save Event'}
            </button>
            {eventToEdit && (
              <button onClick={handleDelete} className="bg-red-500 text-white rounded-lg py-2 px-4 font-semibold hover:bg-red-600 transition duration-200 ml-2">
                Delete Event
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
