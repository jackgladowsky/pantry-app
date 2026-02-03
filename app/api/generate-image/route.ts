import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Use Unsplash for free food images
    // The URL will redirect to a random image matching the query
    const query = encodeURIComponent(`${name} food ingredient`);
    const imageUrl = `https://source.unsplash.com/400x400/?${query}`;
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Image fetch error:", error);
    return NextResponse.json({ error: "Image fetch failed" }, { status: 500 });
  }
}
