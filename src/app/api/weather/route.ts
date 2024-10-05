import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const latitude = searchParams.get("lat");
  const longitude = searchParams.get("lon");
  const APIKEY = "5bda239553b695708637bb772331d7a6";

  let url = "";

  if (address) {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${address}&appid=${APIKEY}`;
  } else if (latitude && longitude) {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${APIKEY}`;
  } else {
    return NextResponse.json({ error: "Please provide an address or coordinates." }, { status: 400 });
  }

  console.log(url);
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
  }
}