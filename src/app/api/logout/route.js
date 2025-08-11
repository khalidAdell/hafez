import { NextResponse } from "next/server";

export async function POST() {

  const res = NextResponse.json({ success: true });

  res.cookies.delete("user");
  res.cookies.delete("token");

  return res;
}
