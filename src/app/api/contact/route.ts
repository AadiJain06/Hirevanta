import { NextRequest } from "next/server";
import { ok, fail, fromZodError } from "@/lib/api";
import { contactSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, hashIp } from "@/lib/request";
import { notifyContact } from "@/lib/notifications";
import { ZodError } from "zod";

export const runtime = "nodejs";

/** Accepts a general contact message. Saves first, then notifies. */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimit(`contact:${hashIp(ip)}`);
  if (!rl.allowed) {
    return fail("Too many submissions. Please try again later.", 429, {
      retryAfter: rl.retryAfter,
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  try {
    const data = contactSchema.parse(body);
    if (data.website && data.website.length > 0) {
      return ok({ id: "ignored" });
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject || null,
        message: data.message,
        ipHash: hashIp(ip),
      },
    });

    await notifyContact(contact.id).catch((e) =>
      console.error("[contact] notify error:", e),
    );

    return ok({ id: contact.id });
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    console.error("[contact] error:", err instanceof Error ? err.message : err);
    return fail("Something went wrong sending your message.", 500);
  }
}
