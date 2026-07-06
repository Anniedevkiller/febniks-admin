"use client";

import Cookies from "js-cookie";

export function setSession(token: string) {
  Cookies.set("febniks_auth", token, { expires: 1 }); // 1 day
}

export function getSession() {
  return Cookies.get("febniks_auth");
}

export function clearSession() {
  Cookies.remove("febniks_auth");
}
