"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function authenticate(password: string) {
  if (password === "welcome") {
    const cookieStore = await cookies();
    cookieStore.set("auth-token", "welcome-authorized", {
      path: "/",
      maxAge: 86400,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    redirect("/");
  }

  return { error: "Incorrect password" };
}
