import { NextResponse } from "next/server";

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
const response = await fetch(
  "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.MOMO_TOKEN}`, // ✅ MUST be string key
      "Ocp-Apim-Subscription-Key": "c3762a4264e14faa8c2d24327666f97d", // ✅ REQUIRED
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

    // 🔥 READ RESPONSE ONCE
    const responseText = await response.text();

    // 🔥 LOG EVERYTHING (CRITICAL FOR DEBUG)
    console.log("MoMo STATUS:", response.status);
    console.log("MoMo RESPONSE:", responseText);

    // ❌ HANDLE ERROR PROPERLY
    if (response.status !== 202) {
      return NextResponse.json({
        success: false,
        error: responseText || `Request failed with status ${response.status}`,
      });
    }

    // ✅ SUCCESS
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