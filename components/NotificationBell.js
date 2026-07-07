"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function describe(n) {
  const p = n.payload || {};
  switch (n.type) {
    case "new_submission":
      return { text: `New application for "${p.projectTitle}"`, href: "/lab" };
    case "new_application":
      return { text: `New application for "${p.jobTitle}"`, href: "/jobs" };
    case "submission_status":
      return {
        text: `${p.status === "accepted" ? "Accepted" : "Update"} on "${p.projectTitle}"`,
        href: "/lab",
      };
    case "application_status":
      return {
        text: `${p.status === "accepted" ? "Accepted" : "Update"} on "${p.jobTitle}"`,
        href: "/jobs",
      };
    case "reel_verified":
      return {
        text: `Your reel was verified${p.verifiedByName ? ` by ${p.verifiedByName}` : ""}`,
        href: "/profile",
      };
    case "connection_request":
      return { text: "You have a new connection request", href: "/connections" };
    case "connection_accepted":
      return { text: "Your connection request was accepted", href: "/connections" };
    case "new_message":
      return { text: "You have a new message", href: p.from ? `/messages/${p.from}` : "/messages" };
    default:
      return { text: "New notification", href: "#" };
  }
}

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!userId) return;
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("notification_log")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled) setNotifications(data ?? []);
    }
    load();

    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      const supabase = getSupabaseBrowserClient();
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      await supabase.from("notification_log").update({ read: true }).in("id", unreadIds);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    }
  }

  if (!userId) return null;

  return (
    <div className="notif-wrap" ref={ref}>
      <button type="button" className="notif-bell" aria-label="Notifications" onClick={handleOpen}>
        🔔
        {unreadCount > 0 && <span className="notif-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          {notifications.length === 0 ? (
            <p className="msg" style={{ padding: 16 }}>
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => {
              const { text, href } = describe(n);
              return (
                <a key={n.id} href={href} className="notif-item">
                  <span>{text}</span>
                  <span className="notif-time">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </a>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
