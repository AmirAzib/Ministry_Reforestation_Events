import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Events.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // Event to act upon
  const [volunteerCount, setVolunteerCount] = useState(""); // Volunteer count input
  const [sponsorshipAmount, setSponsorshipAmount] = useState(""); // Sponsorship amount input
  const [updateFields, setUpdateFields] = useState({
    title: "",
    location: "",
    date: "",
    max_volunteers: "",
  }); // Event update input
  const [actionMessage, setActionMessage] = useState(""); // Success/Error message
  const [modalType, setModalType] = useState(""); // "register", "sponsor", or "update"
  const [newEventFields, setNewEventFields] = useState({
    title: "",
    location: "",
    date: "",
    max_volunteers: "",
    description: "",
  });

  const userType = localStorage.getItem("userType");

  const handleCreateEventClick = () => {
    setModalType("create");
  };

  const handleCreateEventSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8000/events",
        {
          ...newEventFields,
          date: new Date(newEventFields.date).toISOString(), // Convert date to ISO format
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActionMessage("Event successfully created!");
      // Optionally refresh the events list here
    } catch (err) {
      setActionMessage(
        err.response?.data?.detail || "Failed to create event. Please try again."
      );
    } finally {
      setNewEventFields({
        title: "",
        location: "",
        date: "",
        max_volunteers: "",
        description: "",
      });
      setModalType("");
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:8000/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEvents(response.data);
      } catch (err) {
        setError("Failed to fetch events. Please try again.");
      }
    };

    fetchEvents();
  }, []);

  const handleActionClick = (event, action) => {
    setSelectedEvent(event);
    setModalType(action);
    if (action === "update") {
      setUpdateFields({
        title: event.title,
        location: event.location,
        date: event.date.split("T")[0], // Format date for input field
        max_volunteers: event.max_volunteers,
      });
    }
  };

  const handleRegisterSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `http://localhost:8000/events/${selectedEvent.event_id}/register`,
        { volunteer_count: parseInt(volunteerCount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActionMessage("Successfully registered for the event!");
    } catch (err) {
      setActionMessage(
        err.response?.data?.detail || "Failed to register. Please try again."
      );
    } finally {
      setSelectedEvent(null);
      setVolunteerCount("");
    }
  };

  const handleSponsorshipSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `http://localhost:8000/sponsorships?event_id=${selectedEvent.event_id}`, // Pass event_id as query parameter
        {
          sponsorship_amount: parseFloat(sponsorshipAmount), // Request body matches SponsorshipCreate
          description: `Sponsorship for ${selectedEvent.title}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActionMessage("Sponsorship successfully created!");
    } catch (err) {
      setActionMessage(
        err.response?.data?.detail || "Failed to sponsor. Please try again."
      );
    } finally {
      setSelectedEvent(null);
      setSponsorshipAmount("");
    }
  };

  const handleUpdateSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `http://localhost:8000/events/${selectedEvent.event_id}`,
        {
          ...updateFields,
          date: new Date(updateFields.date).toISOString(), // Convert date back to ISO format
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActionMessage("Event successfully updated!");
    } catch (err) {
      setActionMessage(
        err.response?.data?.detail || "Failed to update event. Please try again."
      );
    } finally {
      setSelectedEvent(null);
      setUpdateFields({
        title: "",
        location: "",
        date: "",
        max_volunteers: "",
      });
    }
  };

  return (
    <div className="events-container">
      <h2>Available Events</h2>
      {error && <p className="error">{error}</p>}
      <div className="event-list">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.event_id} className="event-card">
              <h3>{event.title}</h3>
              <p>
                <strong>Location:</strong> {event.location}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(event.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Volunteers:</strong> {event.max_volunteers}
              </p>
              <p>{event.description}</p>
              {(userType === "individual" || userType === "university_club") && (
                <button
                  className="action-btn"
                  onClick={() => handleActionClick(event, "register")}
                >
                  Register
                </button>
              )}
              {userType === "company" && (
                <button
                  className="action-btn"
                  onClick={() => handleActionClick(event, "sponsor")}
                >
                  Sponsor
                </button>
              )}
              {userType === "ministry" && (
                <button
                  className="action-btn"
                  onClick={() => handleActionClick(event, "update")}
                >
                  Update
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No events available at the moment.</p>
        )}
      </div>
  
      {/* Button for Creating New Event */}
      {userType === "ministry" && (
        <button className="action-btn create-btn" onClick={handleCreateEventClick}>
          Create New Event
        </button>
      )}
  
      {/* Register Modal */}
      {selectedEvent && modalType === "register" && (
        <div className="registration-modal">
          <h3>Register for {selectedEvent.title}</h3>
          <label>
            Volunteer Count:
            <input
              type="number"
              value={volunteerCount}
              onChange={(e) => setVolunteerCount(e.target.value)}
              min="1"
              max={selectedEvent.max_volunteers}
            />
          </label>
          <div className="modal-actions">
            <button className="submit-btn" onClick={handleRegisterSubmit}>
              Submit
            </button>
            <button
              className="cancel-btn"
              onClick={() => setSelectedEvent(null)}
            >
              Cancel
            </button>
          </div>
          {actionMessage && <p className="message">{actionMessage}</p>}
        </div>
      )}
  
      {/* Sponsor Modal */}
      {selectedEvent && modalType === "sponsor" && (
        <div className="update-modal">
          <h3>Sponsor {selectedEvent.title}</h3>
          <label>
            Sponsorship Amount:
            <input
              type="number"
              value={sponsorshipAmount}
              onChange={(e) => setSponsorshipAmount(e.target.value)}
              min="1"
            />
          </label>
          <div className="modal-actions">
            <button className="submit-btn" onClick={handleSponsorshipSubmit}>
              Submit
            </button>
            <button
              className="cancel-btn"
              onClick={() => setSelectedEvent(null)}
            >
              Cancel
            </button>
          </div>
          {actionMessage && <p className="message">{actionMessage}</p>}
        </div>
      )}
  
      {/* Update Modal */}
      {selectedEvent && modalType === "update" && (
        <div className="update-modal">
          <h3>Update Event</h3>
          <label>
            Title:
            <input
              type="text"
              value={updateFields.title}
              onChange={(e) =>
                setUpdateFields({ ...updateFields, title: e.target.value })
              }
            />
          </label>
          <label>
            Location:
            <input
              type="text"
              value={updateFields.location}
              onChange={(e) =>
                setUpdateFields({ ...updateFields, location: e.target.value })
              }
            />
          </label>
          <label>
            Date:
            <input
              type="date"
              value={updateFields.date}
              onChange={(e) =>
                setUpdateFields({ ...updateFields, date: e.target.value })
              }
            />
          </label>
          <label>
            Max Volunteers:
            <input
              type="number"
              value={updateFields.max_volunteers}
              onChange={(e) =>
                setUpdateFields({
                  ...updateFields,
                  max_volunteers: e.target.value,
                })
              }
            />
          </label>
          <div className="modal-actions">
            <button className="submit-btn" onClick={handleUpdateSubmit}>
              Submit
            </button>
            <button
              className="cancel-btn"
              onClick={() => setSelectedEvent(null)}
            >
              Cancel
            </button>
          </div>
          {actionMessage && <p className="message">{actionMessage}</p>}
        </div>
      )}
  
      {/* Create Modal */}
      {modalType === "create" && (
        <div className="create-modal">
          <h3>Create New Event</h3>
          <label>
            Title:
            <input
              type="text"
              value={newEventFields.title}
              onChange={(e) =>
                setNewEventFields({ ...newEventFields, title: e.target.value })
              }
            />
          </label>
          <label>
            Location:
            <input
              type="text"
              value={newEventFields.location}
              onChange={(e) =>
                setNewEventFields({ ...newEventFields, location: e.target.value })
              }
            />
          </label>
          <label>
            Date:
            <input
              type="date"
              value={newEventFields.date}
              onChange={(e) =>
                setNewEventFields({ ...newEventFields, date: e.target.value })
              }
            />
          </label>
          <label>
            Max Volunteers:
            <input
              type="number"
              value={newEventFields.max_volunteers}
              onChange={(e) =>
                setNewEventFields({
                  ...newEventFields,
                  max_volunteers: e.target.value,
                })
              }
            />
          </label>
          <label>
            Description:
            <textarea
              value={newEventFields.description}
              onChange={(e) =>
                setNewEventFields({
                  ...newEventFields,
                  description: e.target.value,
                })
              }
            />
          </label>
          <div className="modal-actions">
            <button className="submit-btn" onClick={handleCreateEventSubmit}>
              Submit
            </button>
            <button className="cancel-btn" onClick={() => setModalType("")}>
              Cancel
            </button>
          </div>
          {actionMessage && <p className="message">{actionMessage}</p>}
        </div>
      )}
    </div>
  );
};
export default Events;
