import { getALLUsers } from "@/lib/user";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q");

    const { users, error } = await getALLUsers({ q: q ?? undefined });
    const filteredUsers = users;

    // if (q) {
    //   const searchUsersByName = users?.filter((user) =>
    //     user.name.toLowerCase().includes(q.toLowerCase()),
    //   );
    //   filteredUsers = searchUsersByName || null;
    // }

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ users: filteredUsers }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}
