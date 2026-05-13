import { NextResponse } from "next/server";

// 🔥 AUTO TOKEN GENERATION (NEW)
async function getMomoToken() {
  const apiUser = process.env.MOMO_API_USER!;
  const apiKey = process.env.MOMO_API_KEY!;
  const subKey = process.env.MOMO_SUB_KEY!;

  const basicAuth = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");

  const res = await fetch(
    "https://sandbox.momodeveloper.mtn.com/collection/token/",
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Ocp-Apim-Subscription-Key": subKey,
      },
    }
  );

  const data = await res.json();

  console.log("TOKEN RESPONSE:", data);

  if (!data.access_token) {
    throw new Error("Failed to get MoMo token");
  }

  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { amount, phone } = await req.json();

    // ✅ Validate input
    if (!amount || !phone) {
      return NextResponse.json({
        success: false,
        error: "Missing amount or phone",
      });
    }

    // ✅ Format phone → 2507XXXXXXXX
    const formattedPhone = phone.startsWith("250")
      ? phone
      : `250${phone.replace(/^0/, "")}`;

    const referenceId = crypto.randomUUID();

    // 🔥 GET FRESH TOKEN (NEW)
    const token = await getMomoToken();

    const response = await fetch(
      "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ now dynamic
          "Ocp-Apim-Subscription-Key": process.env.MOMO_SUB_KEY!,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": "sandbox",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: "EUR",
          externalId: referenceId,
          payer: {
            partyIdType: "MSISDN",
            partyId: formattedPhone,
          },
          payerMessage: "Payment",
          payeeNote: "Smart Market",
        }),
      }
    );

    const responseText = await response.text();

    console.log("MoMo STATUS:", response.status);
    console.log("MoMo RESPONSE:", responseText);

    if (response.status !== 202) {
      return NextResponse.json({
        success: false,
        error: responseText || `Request failed with status ${response.status}`,
      });
    }

    return NextResponse.json({
      success: true,
      referenceId,
    });

  } catch (err: any) {
    console.error("SERVER ERROR:", err);

    return NextResponse.json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
}