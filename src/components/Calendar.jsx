import React, { useState, useEffect } from 'react';
import EventModal from './EventModel'; // Importing the EventModal component

const Calendar = () => {
  // State variables
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [calendarDays, setCalendarDays] = useState([]); 
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem('events')) || {}); // Events stored in local storage
  const [selectedDay, setSelectedDay] = useState(null); 
  const [eventToEdit, setEventToEdit] = useState(null); 

  // Effect to render the calendar when the current month changes
  useEffect(() => {
    renderCalendar(currentMonth);
  }, [currentMonth]);

  // Effect to update local storage whenever events change
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  // Function to render the calendar days for the current month
  const renderCalendar = (date) => {
    const prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate(); 
    const totalMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); 
    const startWeekDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay(); 

    const days = [];
    let totalCalendarDay = 6 * 7; 
    
    // Loop to populate the days array
    for (let i = 0; i < totalCalendarDay; i++) {
      let day = i - startWeekDay + 1; // Calculate the day number

      // Determine if the day is in the current month or not
      if (i < startWeekDay) {
        days.push({ day: prevLastDay - startWeekDay + i + 1, isCurrentMonth: false });
      } else if (day <= totalMonthDay) {
        days.push({ day, isCurrentMonth: true, isToday: isToday(day, date) });
      } else {
        days.push({ day: day - totalMonthDay, isCurrentMonth: false });
      }
    }
    setCalendarDays(days); // Update the state with the calculated days
  };

  // Function to check if a given day is today
  const isToday = (day, date) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Function to change the month (forward or backward)
  const handleMonthChange = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  // Function to change the year (forward or backward)
  const handleYearChange = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(newDate.getFullYear() + direction);
      return newDate;
    });
  };

  // Function to handle day clicks
  const handleDayClick = (day) => {
    if (day.isCurrentMonth) {
      setSelectedDay(day.day); 
      setEventToEdit(null); 
    }
  };

  // Function to add a new event
  const addEvent = (event) => {
    setEvents((prev) => {
      const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}-${selectedDay}`;
      return { ...prev, [key]: [...(prev[key] || []), event] }; // Add event to the corresponding day
    });
    setSelectedDay(null); // Reset selected day
  };

  // Function to update an existing event
  const updateEvent = (index, updatedEvent) => {
    setEvents((prev) => {
      const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}-${selectedDay}`;
      const updatedEvents = [...(prev[key] || [])];
      updatedEvents[index] = updatedEvent; // Update the event at the specified index
      return { ...prev, [key]: updatedEvents };
 });
  };

  // Function to delete an event
  const deleteEvent = (index) => {
    setEvents((prev) => {
      const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}-${selectedDay}`;
      const updatedEvents = [...(prev[key] || [])];
      updatedEvents.splice(index, 1); // Remove the event at the specified index
      if (updatedEvents.length === 0) {
        const { [key]: _, ...rest } = prev; // Remove the key if no events are left
        return rest;
      }
      return { ...prev, [key]: updatedEvents }; // Return updated events
    });
  };

  // Function to get event days for rendering
  const eventDays = Object.keys(events).map(eventKey => {
    const [year, month, day] = eventKey.split('-');
    return { day: parseInt(day), month: parseInt(month), year: parseInt(year), events: events[eventKey] };
  });

  // Function to get CSS class based on event type
  const getEventTypeClass = (event) => {
    switch (event.eventType) {
      case 'work':
        return 'bg-blue-300 text-white rounded-lg font-bold transition duration-500 cursor-pointer';
      case 'personal':
        return 'bg-indigo-300 text-white rounded-lg font-bold transition duration-500 cursor-pointer hover:bg-indigo-300';
      case 'other':
        return 'bg-yellow-300 text-white rounded-lg font-bold transition duration-500 cursor-pointer hover:bg-yellow-200';
      default:
        return 'bg-gray-300 text-black rounded-lg font-bold transition duration-500 cursor-pointer';
    }
  };

  // Function to export events in specified format
  const exportEvents = (format) => {
    const currentYear = currentMonth.getFullYear();
    const currentMonthIndex = currentMonth.getMonth() + 1; 
    const eventsToExport = Object.keys(events)
        .filter(key => {
            const [year, month] = key.split('-').map(Number);
            return year === currentYear && month === currentMonthIndex;
        })
        .map(key => ({
            date: key,
            events: events[key]
        }));

    let dataStr;
    if (format === 'json') {
        dataStr = JSON.stringify(eventsToExport, null, 2); // Convert to JSON format
    } else if (format === 'csv') {
        const csvRows = [
            ['Date', 'Event Title', 'Event Type', 'Event Start Time', 'Event End Time', 'Event Description'],
            ...eventsToExport.flatMap(({ date, events }) => 
                events.map(event => {
                    const formattedDate = date; 
                    return [formattedDate, event.eventName, event.eventType, event.startTime, event.endTime, event.description];
                })
            ),
        ];
        dataStr = csvRows.map(row => row.join(',')).join('\n'); // Convert to CSV format
    }

    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events.${format}`; // Set the download filename
    document.body.appendChild(a);
    a.click(); // Trigger download
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up
  };

  return (
    <div className="flex justify-center items-center h-screen" style={{ backgroundImage: "url('https://i.pinimg.com/736x/81/f8/1f/81f81f2a4f28920678d26dad92f0f830.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="flex">
        <div className="w-80 bg-white bg-opacity-90 rounded-lg shadow-lg" style={{ opacity: 0.8 }}>
          {/* Calendar Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <button 
              onClick={() => handleMonthChange(-1)} 
              style={{ width: '40px', height: '40px', textAlign: 'center', fontSize: '16px', color: '#2d1ea0', background: '#f8f7fa', borderRadius: '15px', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e0e0e0'}
              onMouseOut={(e) => e.currentTarget.style.background = '# f8f7fa'}
            >
              &#8249; {/* Previous Month Button */}
            </button>
            <div className="text-lg font-bold text-indigo-800">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} {/* Display Current Month */}
            </div>
            <button 
              onClick={() => handleMonthChange(1)} 
              style={{ width: '40px', height: '40px', textAlign: 'center', fontSize: '16px', color: '#2d1ea0', background: '#f8f7fa', borderRadius: '15px', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e0e0e0'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f8f7fa'}
            >
              &#8250; {/* Next Month Button */}
            </button>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between px-4 pt-3" style={{color: '#394c96'}} >
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div className="w-10 h-10 text-center font-semibold" key={day}>
                  {day} {/* Day Labels */}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap px-4 pb-3">
              {calendarDays.map((day, index) => {
                const dayEvents = eventDays.find(eventDay => eventDay.day === day.day && eventDay.month === currentMonth.getMonth() + 1 && eventDay.year === currentMonth.getFullYear());
                return (
                  <div
                    key={index}
                    className={`w-10 h-10 text-center leading-10 ${day.isCurrentMonth ? (dayEvents ? getEventTypeClass(dayEvents.events[0]) : (day.isToday ? 'bg-blue-500 text-white rounded-lg font-bold' : 'bg-white text-gray-700 hover:bg-gray-200 hover:text-indigo-600 transition duration-200')) : 'text-gray-400'}`}
                    onClick={() => handleDayClick(day)} // Handle day click
                  >
                    {day.day} {/* Display Day Number */}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-evenly border-t border-gray-200 p-4">
            <button 
              type="button" 
              onClick={() => handleYearChange(-1)} 
              style={{ background: '#f8f7fa', borderRadius: '15px', padding: '11px 13px', color: '#394c96', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(109, 137, 188, 0.753)'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f8f7fa'}
            >
              Prev Year {/* Previous Year Button */}
            </button>
            <button 
              type="button" 
              onClick={() => setCurrentMonth(new Date())} 
              style={{ background: '#f8f7fa', borderRadius: '15px', padding: '11px 13px', color: '#394c96', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(109, 137, 188, 0.753)'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f8f7fa'}
            >
              Today {/* Today Button */}
            </button>
            <button 
              type="button" 
              onClick={() => handleYearChange(1)} 
              style={{ background: '#f8f7fa', borderRadius: '15px', padding: '11px 13px', color: '#394c96', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(109, 137, 188, 0.753)'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f8f7fa'}
            >
              Next Year {/* Next Year Button */}
            </button>
          </div>
          <div className="flex justify-evenly border-t border-gray-200 p-4">
            <button 
              type="button" 
              onClick={() => exportEvents('json')} 
              style={{ background: '#f8f7fa', borderRadius: '15px', padding: '11px 13px', color: '#394c96', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(109, 137, 188, 0.753)'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f8f7fa'}
            >
              Export JSON {/* Export Events as JSON */}
            </button>
            <button 
              type="button" 
              onClick={() => exportEvents('csv')} 
              style={{ background: '#f8f7fa', borderRadius: '15px', padding: '11px 13px', color: '#394c96', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(109, 137, 188, 0.753)'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f8f7fa'}
            >
              Export CSV {/* Export Events as CSV */}
            </button>
          </div>
          {selectedDay && (
            <EventModal
              date={selectedDay} // Pass selected day to the modal
              events={events[`${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}-${selectedDay}`] || []} // Pass events for the selected day
              addEvent={addEvent} 
              updateEvent={updateEvent} 
              deleteEvent={deleteEvent} // Function to delete event
              closeModal={() => setSelectedDay(null)} 
              eventToEdit={eventToEdit} 
            />
          )}
        </div>
        {/* Color Legend Card */}
        {!selectedDay && (
          <div className="w-40 bg-white bg-opacity-90 rounded-lg shadow-lg ml-4" style={{ opacity: 0.8 }}>
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg mb-2 text-blue-800">Event Colours</h3>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-300 rounded-full mr-2"></div>
                <span>Work</span>
              </div>
              <div className="flex items-center mt-2">
                <div className="w-4 h-4 bg-indigo-300 rounded-full mr-2"></div>
                <span>Personal</span>
              </div>
              <div className="flex items-center mt-2">
                <div className="w-4 h-4 bg-yellow-300 rounded-full mr-2"></div>
                <span>Other</span>
              </div>
              <div className="flex items-center mt-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span>Today</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar; // Export the Calendar component for use in other parts of the application