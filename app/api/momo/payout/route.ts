import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { amount, phone } = await req.json();

  try {
    const referenceId = crypto.randomUUID();

    const response = await fetch(
      "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MOMO_TOKEN}`,
          "Ocp-Apim-Subscription-Key": process.env.MOMO_API_KEY!,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": "sandbox",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: "EUR", // sandbox requirement
          externalId: referenceId,
          payer: {
            partyIdType: "MSISDN",
            partyId: phone,
          },
          payerMessage: "Payment",
          payeeNote: "Smart Market",
        }),
      }
    );

    if (response.status !== 202) {
      const err = await response.text();
      return NextResponse.json({ success: false, error: err });
    }

    return NextResponse.json({
      success: true,
      referenceId,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err });
  }
}