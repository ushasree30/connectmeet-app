import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [activeMeeting, setActiveMeeting] = useState(null);
  const [createdMeeting, setCreatedMeeting] = useState(null);

  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [duration, setDuration] = useState("30");

  const [meetingCode, setMeetingCode] = useState("");

  // =====================================================
  // CAMERA
  // =====================================================

  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  // =====================================================
  // MICROPHONE
  // =====================================================

  const [micOn, setMicOn] = useState(false);
  const [micStream, setMicStream] = useState(null);

  // =====================================================
  // SCREEN SHARING
  // =====================================================

  const screenVideoRef = useRef(null);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);

  // =====================================================
  // CHAT
  // =====================================================

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "ConnectMeet",
      text: "Welcome to the meeting chat.",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      system: true,
    },
  ]);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, cameraOn]);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, screenSharing]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStream(null);
    setCameraOn(false);
  };

  const handleCamera = async () => {
    if (cameraOn) {
      stopCamera();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      setCameraStream(stream);
      setCameraOn(true);
    } catch (error) {
      console.error("Camera error:", error);

      if (error.name === "NotAllowedError") {
        alert(
          "Camera permission was denied. Please allow camera access for localhost."
        );
      } else if (error.name === "NotFoundError") {
        alert("No camera was found on this device.");
      } else {
        alert(
          "Unable to access the camera. Please check your camera settings."
        );
      }
    }
  };

  const stopMicrophone = () => {
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
    }

    setMicStream(null);
    setMicOn(false);
  };

  const handleMicrophone = async () => {
    if (micOn) {
      stopMicrophone();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      setMicStream(stream);
      setMicOn(true);
    } catch (error) {
      console.error("Microphone error:", error);

      if (error.name === "NotAllowedError") {
        alert(
          "Microphone permission was denied. Please allow microphone access for localhost."
        );
      } else if (error.name === "NotFoundError") {
        alert("No microphone was found on this device.");
      } else {
        alert(
          "Unable to access the microphone. Please check your microphone settings."
        );
      }
    }
  };

  const stopScreenSharing = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }

    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }

    setScreenStream(null);
    setScreenSharing(false);
  };

  const handleScreenShare = async () => {
    if (screenSharing) {
      stopScreenSharing();
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert("Screen sharing is not supported by this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setScreenStream(stream);
      setScreenSharing(true);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener("ended", () => {
          setScreenSharing(false);
          setScreenStream(null);
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
          }
        });
      }
    } catch (error) {
      console.error("Screen sharing error:", error);

      if (error.name !== "AbortError") {
        alert("Unable to start screen sharing.");
      }
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();

    const message = chatInput.trim();

    if (!message) {
      return;
    }

    setChatMessages((previousMessages) => [
      ...previousMessages,
      {
        id: Date.now(),
        sender: username,
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        system: false,
      },
    ]);

    setChatInput("");
  };

  const username = "newuser";

  // =====================================================
  // CREATE MEETING
  // =====================================================

  const handleCreateMeeting = async (e) => {
    e.preventDefault();

    if (!meetingTitle.trim()) {
      alert("Please enter a meeting title.");
      return;
    }

    if (!meetingDate) {
      alert("Please select a date.");
      return;
    }

    if (!meetingTime) {
      alert("Please select a time.");
      return;
    }

    try {
      const params = new URLSearchParams();

      params.append("title", meetingTitle.trim());
      params.append("date", meetingDate);
      params.append("time", meetingTime);
      params.append("duration", duration);
      params.append("createdBy", username);

      const url =
        `http://localhost:8081/api/meetings?${params.toString()}`;

      console.log("Creating meeting:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Create response:", response.status);

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const meeting = await response.json();

      console.log("Meeting created:", meeting);

      setCreatedMeeting(meeting);
      setShowCreateModal(false);

      setMeetingTitle("");
      setMeetingDate("");
      setMeetingTime("");
      setDuration("30");
    } catch (error) {
      console.error("Create meeting error:", error);

      alert(
        "Unable to create meeting. Please make sure Spring Boot is running on port 8081."
      );
    }
  };

  // =====================================================
  // JOIN MEETING
  // =====================================================

  const handleJoinMeeting = async (e) => {
    e.preventDefault();

    const code = meetingCode.trim();

    if (!code) {
      alert("Please enter a meeting code.");
      return;
    }

    console.log("Trying to join:", code);

    try {
      const url =
        `http://localhost:8081/api/meetings/${encodeURIComponent(code)}`;

      console.log("Request URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Server error:", errorText);

        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const meeting = await response.json();

      console.log("Meeting received:", meeting);

      setActiveMeeting(meeting);

      setShowJoinModal(false);

      setMeetingCode("");
    } catch (error) {
      console.error("Join meeting error:", error);

      alert(
        "Unable to find the meeting. Please check the meeting code."
      );
    }
  };

  // =====================================================
  // LEAVE MEETING
  // =====================================================

  const handleLeaveMeeting = () => {
    stopCamera();
    stopMicrophone();
    stopScreenSharing();
    setActiveMeeting(null);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    window.location.reload();
  };

  // =====================================================
  // MEETING ROOM
  // =====================================================

  if (activeMeeting) {
    return (
      <div className="meeting-room">

        <header className="meeting-room-header">

          <div className="meeting-room-brand">

            <div className="logo-icon">
              C
            </div>

            <div>
              <h2>
                ConnectMeet
              </h2>

              <span>
                {activeMeeting.title}
              </span>
            </div>

          </div>

          <div className="meeting-room-info">

            <span>
              Meeting ID:
            </span>

            <strong>
              {activeMeeting.meetingCode}
            </strong>

          </div>

        </header>

        <main className="video-area">

          <div className="video-placeholder">

            {screenSharing ? (
              <div
                style={{
                  width: "100%",
                  maxWidth: "1000px",
                  margin: "0 auto 24px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  background: "#111827",
                  position: "relative",
                }}
              >
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    display: "block",
                    width: "100%",
                    minHeight: "420px",
                    objectFit: "contain",
                    background: "#111827",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: "16px",
                    bottom: "16px",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    background: "rgba(0, 0, 0, 0.7)",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                >
                  🖥️ Screen Sharing
                </div>
              </div>
            ) : cameraOn ? (
              <div
                style={{
                  width: "100%",
                  maxWidth: "720px",
                  margin: "0 auto 24px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  background: "#111827",
                  position: "relative",
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    minHeight: "360px",
                    objectFit: "cover",
                    transform: "scaleX(-1)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: "16px",
                    bottom: "16px",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    background: "rgba(0, 0, 0, 0.65)",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                >
                  📹 Camera On
                </div>
              </div>
            ) : (
              <div className="camera-icon">
                📹
              </div>
            )}

            <h2>
              Welcome to the meeting
            </h2>

            <p>
              {activeMeeting.title}
            </p>

            <div className="meeting-details-room">

              <span>
                📅 {activeMeeting.date}
              </span>

              <span>
                🕐 {activeMeeting.time}
              </span>

              <span>
                ⏱ {activeMeeting.duration} minutes
              </span>

            </div>

            <p className="room-message">
              {screenSharing
                ? "Your screen is being shared. Click Share Screen to stop."
                : cameraOn
                  ? "Your camera is active. You can turn it off using the Camera button below."
                  : "Click Camera below to turn on your webcam."}
            </p>

          </div>

        </main>

        {chatOpen && (
          <div
            style={{
              position: "fixed",
              right: "24px",
              top: "24px",
              bottom: "90px",
              width: "340px",
              maxWidth: "calc(100vw - 48px)",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 1000,
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                background: "#1d4ed8",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <strong style={{ fontSize: "18px" }}>💬 Meeting Chat</strong>
                <div style={{ fontSize: "12px", opacity: 0.85, marginTop: "3px" }}>
                  Messages from this meeting
                </div>
              </div>

              <button
                type="button"
                onClick={() => setChatOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#ffffff",
                  fontSize: "24px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px",
                background: "#f8fafc",
              }}
            >
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    justifyContent:
                      message.system || message.sender === "newuser"
                        ? "flex-end"
                        : "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "82%",
                      padding: "9px 11px",
                      borderRadius: "12px",
                      background:
                        message.system
                          ? "#e2e8f0"
                          : message.sender === "newuser"
                            ? "#dbeafe"
                            : "#ffffff",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#475569",
                        marginBottom: "3px",
                      }}
                    >
                      {message.sender}
                    </div>

                    <div
                      style={{
                        fontSize: "14px",
                        color: "#0f172a",
                        wordBreak: "break-word",
                      }}
                    >
                      {message.text}
                    </div>

                    <div
                      style={{
                        fontSize: "10px",
                        color: "#64748b",
                        marginTop: "4px",
                        textAlign: "right",
                      }}
                    >
                      {message.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendChatMessage}
              style={{
                display: "flex",
                gap: "8px",
                padding: "12px",
                borderTop: "1px solid #e5e7eb",
                background: "#ffffff",
              }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "10px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              <button
                type="submit"
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "0 14px",
                  background: "#2563eb",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}

        <footer className="meeting-controls">

          <button
            className={`meeting-control mic-btn ${micOn ? "active" : ""}`}
            onClick={handleMicrophone}
          >
            <span className="control-icon">🎤</span>
            <span>{micOn ? "Mute Mic" : "Mic"}</span>
          </button>

          <button
            className={`meeting-control camera-btn ${cameraOn ? "active" : ""}`}
            onClick={handleCamera}
          >
            <span className="control-icon">📹</span>
            <span>{cameraOn ? "Turn Off Camera" : "Camera"}</span>
          </button>

          <button
            className={`meeting-control share-btn ${screenSharing ? "active" : ""}`}
            onClick={handleScreenShare}
          >
            <span className="control-icon">🖥️</span>
            <span>{screenSharing ? "Stop Sharing" : "Share"}</span>
          </button>

          <button
            className={`meeting-control chat-btn ${chatOpen ? "active" : ""}`}
            onClick={() => setChatOpen((open) => !open)}
          >
            <span className="control-icon">💬</span>
            <span>{chatOpen ? "Close Chat" : "Chat"}</span>
          </button>

          <button
            className="leave-control leave-btn"
            onClick={handleLeaveMeeting}
          >
            <span className="control-icon">☎</span>
            <span>Leave</span>
          </button>

        </footer>

      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="dashboard">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            C
          </div>

          <span>
            ConnectMeet
          </span>

        </div>

        <nav className="nav">

          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              activePage === "meetings"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("meetings")
            }
          >
            <span>▣</span>
            Meetings
          </button>

          <button
            className={
              activePage === "messages"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("messages")
            }
          >
            <span>✉</span>
            Messages
          </button>

          <button
            className={
              activePage === "contacts"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("contacts")
            }
          >
            <span>♙</span>
            Contacts
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="nav-item"
            onClick={() =>
              setActivePage("settings")
            }
          >
            <span>⚙</span>
            Settings
          </button>

          <button
            className="nav-item logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="main">

        <header className="topbar">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Manage your meetings and stay connected.
            </p>

          </div>

          <div className="profile">

            <button className="notification">
              ♧
            </button>

            <div className="avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">

              <strong>
                {username}
              </strong>

              <span>
                Online
              </span>

            </div>

          </div>

        </header>

        {activePage === "dashboard" && (
          <>

            {/* WELCOME */}

            <section className="welcome">

              <div>

                <h2>
                  Welcome back, {username}! 👋
                </h2>

                <p>
                  Ready to connect with your team?
                </p>

              </div>

              <div className="welcome-actions">

                <button
                  className="primary-button"
                  onClick={() =>
                    setShowCreateModal(true)
                  }
                >
                  + Create Meeting
                </button>

                <button
                  className="secondary-button"
                  onClick={() =>
                    setShowJoinModal(true)
                  }
                >
                  Join Meeting
                </button>

              </div>

            </section>

            {/* STATS */}

            <section className="stats">

              <div className="stat-card">

                <div className="stat-icon blue">
                  ◉
                </div>

                <div>

                  <span>
                    Today's Meetings
                  </span>

                  <strong>
                    3
                  </strong>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon green">
                  ✓
                </div>

                <div>

                  <span>
                    Completed
                  </span>

                  <strong>
                    12
                  </strong>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon purple">
                  ◷
                </div>

                <div>

                  <span>
                    Total Meetings
                  </span>

                  <strong>
                    28
                  </strong>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon orange">
                  ♙
                </div>

                <div>

                  <span>
                    Contacts
                  </span>

                  <strong>
                    16
                  </strong>

                </div>

              </div>

            </section>

            {/* DASHBOARD GRID */}

            <section className="dashboard-grid">

              <div className="panel upcoming">

                <div className="panel-header">

                  <div>

                    <h3>
                      Upcoming Meetings
                    </h3>

                    <p>
                      Your scheduled meetings
                    </p>

                  </div>

                  <button>
                    View all
                  </button>

                </div>

                <div className="meeting-list">

                  <div className="meeting">

                    <div className="meeting-date">

                      <strong>
                        19
                      </strong>

                      <span>
                        AUG
                      </span>

                    </div>

                    <div className="meeting-details">

                      <h4>
                        Team Standup
                      </h4>

                      <p>
                        11:30 AM · 30 minutes
                      </p>

                      <span>
                        👥 5 participants
                      </span>

                    </div>

                    <button
                      className="join-button"
                      onClick={() =>
                        setShowJoinModal(true)
                      }
                    >
                      Join
                    </button>

                  </div>

                  <div className="meeting">

                    <div className="meeting-date">

                      <strong>
                        20
                      </strong>

                      <span>
                        AUG
                      </span>

                    </div>

                    <div className="meeting-details">

                      <h4>
                        Project Discussion
                      </h4>

                      <p>
                        2:00 PM · 60 minutes
                      </p>

                      <span>
                        👥 8 participants
                      </span>

                    </div>

                    <button
                      className="join-button"
                      onClick={() =>
                        setShowJoinModal(true)
                      }
                    >
                      Join
                    </button>

                  </div>

                  <div className="meeting">

                    <div className="meeting-date">

                      <strong>
                        21
                      </strong>

                      <span>
                        AUG
                      </span>

                    </div>

                    <div className="meeting-details">

                      <h4>
                        Client Meeting
                      </h4>

                      <p>
                        10:00 AM · 45 minutes
                      </p>

                      <span>
                        👥 4 participants
                      </span>

                    </div>

                    <button
                      className="join-button"
                      onClick={() =>
                        setShowJoinModal(true)
                      }
                    >
                      Join
                    </button>

                  </div>

                </div>

              </div>

              {/* QUICK ACTIONS */}

              <div className="panel quick-actions">

                <div className="panel-header">

                  <div>

                    <h3>
                      Quick Actions
                    </h3>

                    <p>
                      Start connecting instantly
                    </p>

                  </div>

                </div>

                <button
                  className="action-card"
                  onClick={() =>
                    setShowCreateModal(true)
                  }
                >

                  <div className="action-icon blue">
                    🎥
                  </div>

                  <div>

                    <strong>
                      Create Meeting
                    </strong>

                    <span>
                      Start a new video meeting
                    </span>

                  </div>

                  <b>
                    ›
                  </b>

                </button>

                <button
                  className="action-card"
                  onClick={() =>
                    setShowJoinModal(true)
                  }
                >

                  <div className="action-icon green">
                    🔗
                  </div>

                  <div>

                    <strong>
                      Join Meeting
                    </strong>

                    <span>
                      Enter a meeting code
                    </span>

                  </div>

                  <b>
                    ›
                  </b>

                </button>

                <button
                  className="action-card"
                  onClick={() =>
                    setShowCreateModal(true)
                  }
                >

                  <div className="action-icon purple">
                    📅
                  </div>

                  <div>

                    <strong>
                      Schedule Meeting
                    </strong>

                    <span>
                      Plan a future meeting
                    </span>

                  </div>

                  <b>
                    ›
                  </b>

                </button>

              </div>

            </section>

            {/* RECENT MEETINGS */}

            <section className="panel recent">

              <div className="panel-header">

                <div>

                  <h3>
                    Recent Meetings
                  </h3>

                  <p>
                    Your latest meeting activity
                  </p>

                </div>

                <button>
                  View history
                </button>

              </div>

              <div className="table">

                <div className="table-row table-head">

                  <span>
                    Meeting
                  </span>

                  <span>
                    Date
                  </span>

                  <span>
                    Duration
                  </span>

                  <span>
                    Participants
                  </span>

                  <span>
                    Status
                  </span>

                </div>

                <div className="table-row">

                  <span className="meeting-name">
                    Weekly Planning
                  </span>

                  <span>
                    18 Aug 2026
                  </span>

                  <span>
                    45 min
                  </span>

                  <span>
                    6
                  </span>

                  <span className="status completed">
                    Completed
                  </span>

                </div>

                <div className="table-row">

                  <span className="meeting-name">
                    Design Review
                  </span>

                  <span>
                    17 Aug 2026
                  </span>

                  <span>
                    38 min
                  </span>

                  <span>
                    4
                  </span>

                  <span className="status completed">
                    Completed
                  </span>

                </div>

                <div className="table-row">

                  <span className="meeting-name">
                    Team Sync
                  </span>

                  <span>
                    16 Aug 2026
                  </span>

                  <span>
                    25 min
                  </span>

                  <span>
                    7
                  </span>

                  <span className="status completed">
                    Completed
                  </span>

                </div>

              </div>

            </section>

          </>
        )}

        {activePage !== "dashboard" && (

          <div className="empty-page">

            <div className="empty-icon">
              🚀
            </div>

            <h2>
              {activePage.charAt(0).toUpperCase() +
                activePage.slice(1)}
            </h2>

            <p>
              This section will be built next.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                setActivePage("dashboard")
              }
            >
              Back to Dashboard
            </button>

          </div>

        )}

      </main>

      {/* =====================================================
          CREATE MEETING MODAL
      ====================================================== */}

      {showCreateModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowCreateModal(false)
          }
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  Create Meeting
                </h2>

                <p>
                  Set up a new ConnectMeet session
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowCreateModal(false)
                }
              >
                ×
              </button>

            </div>

            <form
              className="meeting-form"
              onSubmit={handleCreateMeeting}
            >

              <label>
                Meeting Title
              </label>

              <input
                type="text"
                placeholder="e.g. Team Standup"
                value={meetingTitle}
                onChange={(e) =>
                  setMeetingTitle(e.target.value)
                }
                required
              />

              <div className="form-row">

                <div>

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) =>
                      setMeetingDate(e.target.value)
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    Time
                  </label>

                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) =>
                      setMeetingTime(e.target.value)
                    }
                    required
                  />

                </div>

              </div>

              <label>
                Duration
              </label>

              <select
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
              >

                <option value="15">
                  15 minutes
                </option>

                <option value="30">
                  30 minutes
                </option>

                <option value="45">
                  45 minutes
                </option>

                <option value="60">
                  60 minutes
                </option>

                <option value="90">
                  90 minutes
                </option>

              </select>

              <button
                type="submit"
                className="create-meeting-button"
              >
                Create Meeting
              </button>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          JOIN MEETING MODAL
      ====================================================== */}

      {showJoinModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowJoinModal(false)
          }
        >

          <div
            className="modal join-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  Join Meeting
                </h2>

                <p>
                  Enter the meeting code shared with you
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowJoinModal(false)
                }
              >
                ×
              </button>

            </div>

            <form
              className="meeting-form"
              onSubmit={handleJoinMeeting}
            >

              <label>
                Meeting Code
              </label>

              <input
                type="text"
                placeholder="connect-xxxxxxxx"
                value={meetingCode}
                onChange={(e) =>
                  setMeetingCode(e.target.value)
                }
                required
              />

              <button
                type="submit"
                className="create-meeting-button"
              >
                Join Meeting
              </button>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          CREATED MEETING SUCCESS
      ====================================================== */}

      {createdMeeting && (

        <div
          className="modal-overlay"
          onClick={() =>
            setCreatedMeeting(null)
          }
        >

          <div
            className="modal success-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="success-icon">
              ✓
            </div>

            <h2>
              Meeting Created!
            </h2>

            <p>
              Your meeting has been saved successfully.
            </p>

            <div className="meeting-code-box">

              <span>
                Meeting Code
              </span>

              <strong>
                {createdMeeting.meetingCode}
              </strong>

            </div>

            <div className="created-details">

              <div>

                <span>
                  Title
                </span>

                <strong>
                  {createdMeeting.title}
                </strong>

              </div>

              <div>

                <span>
                  Date
                </span>

                <strong>
                  {createdMeeting.date}
                </strong>

              </div>

              <div>

                <span>
                  Time
                </span>

                <strong>
                  {createdMeeting.time}
                </strong>

              </div>

              <div>

                <span>
                  Duration
                </span>

                <strong>
                  {createdMeeting.duration} minutes
                </strong>

              </div>

            </div>

            <button
              className="create-meeting-button"
              onClick={() =>
                setCreatedMeeting(null)
              }
            >
              Done
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;