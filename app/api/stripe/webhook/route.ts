// app/api/stripe/webhook/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const userId = sub.metadata.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: 'PRO',
              stripeSubscriptionId: sub.id,
              stripePriceId: sub.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = sub.metadata.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: 'PRO',
              stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { plan: 'FREE', stripeSubscriptionId: null, stripePriceId: null },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error('[webhook]', err);
  }

  return NextResponse.json({ received: true });
}
