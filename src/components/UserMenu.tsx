import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../services/authService";
import "./UserMenu.css";
import EditProfileModal from "./EditProfileModal";
import { convertFileSrc } from "@tauri-apps/api/core";

export default function UserMenu() {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  /* =========================
     OUTSIDE CLICK
  ========================== */

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  if (!user) return null;

  /* =========================
     DATA (camelCase)
  ========================== */

  const avatarSrc = user.avatarUrl
    ? convertFileSrc(user.avatarUrl)
    : null;

  const initials =
    user.displayName?.[0]?.toUpperCase() ??
    user.email[0]?.toUpperCase();

  const close = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 220);
  };

  /* =========================
     RENDER
  ========================== */

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-trigger"
        onClick={() => (open ? close() : setOpen(true))}
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="avatar" />
        ) : (
          <div className="avatar-fallback">{initials}</div>
        )}

        <span className="user-name">
          {user.displayName ?? user.email}
        </span>
      </button>

      {open && (
        <div
          className={`user-dropdown ${
            closing ? "closing" : ""
          }`}
        >
          <button
            onClick={() => {
              close();
              setShowEdit(true);
            }}
          >
            Editar perfil
          </button>

          <div className="divider" />

          <button
            className="logout"
            onClick={async () => {
              await logout();
              window.location.href = "/login";
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {showEdit && (
        <EditProfileModal
          key="edit-profile"
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}