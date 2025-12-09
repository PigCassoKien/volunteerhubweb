import React from "react";
import NotFound from "../pages/Error/NotFound";

export default function RoleRoute({ roles = [], children }) {
  // read stored user from localStorage
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const role = user?.role;

  // if no user or role not allowed -> show 404
  if (!role || !roles.map(r => String(r).toUpperCase()).includes(String(role).toUpperCase())) {
    return <NotFound />;
  }
  return <>{children}</>;
}