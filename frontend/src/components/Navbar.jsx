
import { Film, CalendarCheck, Ticket } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "movies", label: "Movies", icon: Film },
    { id: "rewatch", label: "Rewatch Plan", icon: CalendarCheck },
    { id: "booking", label: "Cinema Booking", icon: Ticket },
  ];

  return (
    <nav className="navbar">
      <div className="brand">
        <Film size={25} />
        <span>Doomsday Ready</span>
      </div>

      <div className="nav-links">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "nav-btn active" : "nav-btn"}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
