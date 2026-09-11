import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_API_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_API_URL = "https://api.stripe.com/v1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

interface CheckoutRequest {
  courseId: string;
  userId: string;
  priceCents: number;
  courseTitle: string;
  userEmail: string;
}

async function getOrCreateStripeCustomer(email: string): Promise<string> {
  // Check if customer exists
  const listResponse = await fetch(
    `${STRIPE_API_URL}/customers?email=${encodeURIComponent(email)}&limit=1`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${STRIPE_API_KEY}`,
      },
    }
  );

  if (!listResponse.ok) {
    throw new Error(
      `Failed to list Stripe customers: ${listResponse.statusText}`
    );
  }

  const listData = await listResponse.json();
  if (listData.data && listData.data.length > 0) {
    return listData.data[0].id;
  }

  // Create new customer
  const createResponse = await fetch(`${STRIPE_API_URL}/customers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      email,
      description: `SafetyTech Academy Student - ${email}`,
    }).toString(),
  });

  if (!createResponse.ok) {
    throw new Error(
      `Failed to create Stripe customer: ${createResponse.statusText}`
    );
  }

  const customer = await createResponse.json();
  return customer.id;
}

async function getOrCreateStripeProduct(
  courseId: string,
  courseTitle: string
): Promise<string> {
  // Try to get existing product by metadata
  const searchResponse = await fetch(
    `${STRIPE_API_URL}/products?limit=100&active=true`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${STRIPE_API_KEY}`,
      },
    }
  );

  if (searchResponse.ok) {
    const products = await searchResponse.json();
    const existing = products.data?.find(
      (p: any) => p.metadata?.course_id === courseId
    );
    if (existing) {
      return existing.id;
    }
  }

  // Create new product
  const createResponse = await fetch(`${STRIPE_API_URL}/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      name: courseTitle,
      description: `SafetyTech Academy Course`,
      metadata: JSON.stringify({ course_id: courseId }),
    }).toString(),
  });

  if (!createResponse.ok) {
    throw new Error(
      `Failed to create Stripe product: ${createResponse.statusText}`
    );
  }

  const product = await createResponse.json();
  return product.id;
}

async function createOrUpdateStripePrice(
  productId: string,
  priceCents: number,
  courseId: string
): Promise<string> {
  // Try to find existing price
  const listResponse = await fetch(
    `${STRIPE_API_URL}/prices?product=${productId}&limit=100`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${STRIPE_API_KEY}`,
      },
    }
  );

  if (listResponse.ok) {
    const prices = await listResponse.json();
    const existing = prices.data?.find(
      (p: any) =>
        p.unit_amount === priceCents &&
        p.type === "recurring" &&
        p.recurring?.interval === "year"
    );
    if (existing) {
      return existing.id;
    }
  }

  // Create yearly subscription price
  const createResponse = await fetch(`${STRIPE_API_URL}/prices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      product: productId,
      unit_amount: priceCents.toString(),
      currency: "gbp",
      type: "recurring",
      "recurring[interval]": "year",
      metadata: JSON.stringify({ course_id: courseId }),
    }).toString(),
  });

  if (!createResponse.ok) {
    throw new Error(
      `Failed to create Stripe price: ${createResponse.statusText}`
    );
  }

  const price = await createResponse.json();
  return price.id;
}

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    if (!STRIPE_API_KEY) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const body: CheckoutRequest = await req.json();
    const {
      courseId,
      userId,
      priceCents,
      courseTitle,
      userEmail,
    } = body;

    if (!courseId || !userId || !priceCents || !courseTitle || !userEmail) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(userEmail);

    // Get or create Stripe product
    const productId = await getOrCreateStripeProduct(courseId, courseTitle);

    // Get or create price
    const priceId = await createOrUpdateStripePrice(
      productId,
      priceCents,
      courseId
    );

    // Create checkout session
    const sessionResponse = await fetch(
      `${STRIPE_API_URL}/checkout/sessions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          customer: customerId,
          "line_items[0][price]": priceId,
          "line_items[0][quantity]": "1",
          mode: "subscription",
          success_url: `${SUPABASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${SUPABASE_URL}/checkout/cancel`,
          "subscription_data[metadata][course_id]": courseId,
          "subscription_data[metadata][user_id]": userId,
        }).toString(),
      }
    );

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    const session = await sessionResponse.json();

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Checkout session error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
