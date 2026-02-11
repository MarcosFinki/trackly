import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import "./UserMenu.css";
import EditProfileModal from "./EditProfileModal";

export default function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const initials =
    user.display_name?.[0]?.toUpperCase() ??
    user.email[0].toUpperCase();

    const close = () => {
        setClosing(true);
        setTimeout(() => {
            setOpen(false);
            setClosing(false);
        }, 220);
        };

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-trigger"
        onClick={() => (open ? close() : setOpen(true))}
        >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="avatar" />
        ) : (
          <div className="avatar-fallback">{initials}</div>
        )}
        <span className="user-name">
          {user.display_name ?? user.email}
        </span>
      </button>

      {open && (
        <div
            className={`user-dropdown ${
            closing ? "closing" : ""
            }`}
        >
            <button onClick={() => {
              close();
              setShowEdit(true);
            }}>
              Editar perfil
            </button>

            <div className="divider" />

            <button
            className="logout"
            onClick={async () => {
                await fetch("http://localhost:3001/auth/logout", {
                method: "POST",
                credentials: "include",
                });
                window.location.href = "/login";
            }}
            >
            Cerrar sesión
            </button>
        </div>
        )}

        {showEdit && (
          <EditProfileModal
            onClose={() => setShowEdit(false)}
          />
        )}
    </div>
  );
}