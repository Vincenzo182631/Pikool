/**
 * Seed reference data: achievements + a few sample courts. Safe to re-run
 * (idempotent upserts). Run with: pnpm db:seed
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const ACHIEVEMENTS = [
  { key: "first_match", name: "First Serve", description: "Played your first recorded match." },
  { key: "ten_games", name: "Getting Rallying", description: "Played 10 games." },
  { key: "fifty_games", name: "Regular", description: "Played 50 games." },
  { key: "first_win", name: "Winner", description: "Won your first match." },
  { key: "streak_3", name: "On Fire", description: "Won 3 matches in a row." },
  { key: "streak_10", name: "Unstoppable", description: "Won 10 matches in a row." },
  { key: "first_checkin", name: "Showed Up", description: "Checked in to a court." },
  { key: "level_3", name: "Developing", description: "Reached a 3.0 skill rating." },
  { key: "level_4", name: "Advanced", description: "Reached a 4.0 skill rating." },
];

const COURTS = [
  { name: "Riverside Pickleball Courts", lat: 40.7411, lng: -73.9897, city: "New York", country: "USA", hasLighting: true },
  { name: "Sunset Park Community Courts", lat: 34.0522, lng: -118.2437, city: "Los Angeles", country: "USA", hasLighting: false },
  { name: "Lakeshore Athletic Club", lat: 41.8781, lng: -87.6298, city: "Chicago", country: "USA", hasLighting: true },
];

const BADGES = [
  { key: "founder", name: "Founding Member", description: "Joined during early access.", tier: "GOLD" as const },
  { key: "verified", name: "Verified", description: "Verified their email and profile.", tier: "SILVER" as const },
  { key: "first_win", name: "First Win", description: "Won a match.", tier: "BRONZE" as const },
  { key: "streak_master", name: "Streak Master", description: "Won 10 in a row.", tier: "PLATINUM" as const },
];

async function main() {
  for (const a of ACHIEVEMENTS) {
    await db.achievement.upsert({
      where: { key: a.key },
      update: { name: a.name, description: a.description },
      create: a,
    });
  }

  for (const b of BADGES) {
    await db.badge.upsert({
      where: { key: b.key },
      update: { name: b.name, description: b.description, tier: b.tier },
      create: b,
    });
  }

  for (const c of COURTS) {
    const existing = await db.court.findFirst({ where: { name: c.name } });
    if (!existing) {
      await db.court.create({
        data: { ...c, amenities: ["Parking", "Restrooms", "Water"], verified: true },
      });
    }
  }

  console.log(
    `Seeded ${ACHIEVEMENTS.length} achievements, ${BADGES.length} badges and ${COURTS.length} courts.`,
  );
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
