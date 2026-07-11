/**
 * Seed a lively demo feed: ~16 sample players and ~50 posts spanning every
 * post type — introductions, open-play announcements, game invites, tournament
 * updates, tips, OOTD, paddle/accessory showcases, court photos, game recaps,
 * milestones, and community polls. Posts also get realistic likes and comments
 * so the feed feels active for UX review.
 *
 * Photo posts use real images from Unsplash's open image CDN
 * (images.unsplash.com, already whitelisted in next.config.ts). Every id was
 * verified to return a live image before committing.
 *
 * Idempotent: every re-run first removes prior feed-seed users (email prefix
 * `seed.`) — cascades clear their posts, reactions, and comments — then rebuilds.
 *
 * Run with: pnpm db:seed:feed   (requires DATABASE_URL)
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const SEED_PREFIX = "seed.";

// ---------------------------------------------------------------------------
// Real photos from Unsplash's open image CDN (whitelisted in next.config.ts).
// Every id below was verified to return a live image before committing.
// `img()` requests an optimized, cropped 1200px-wide JPEG.
// ---------------------------------------------------------------------------
function img(id: string): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
}

/** Curated, verified Unsplash photo ids grouped by feed subject. */
const PIX = {
  action: ["1659318006095-4d44845f3a1b", "1710772099352-f8fbb7b30977", "1693142518820-78d7a05f1546", "1734161081396-0f0572a16bf6", "1723004714201-cf224222b897"],
  paddle: ["1618551763300-dc7eb8ce3560", "1737476997205-b3336182f215", "1737476996922-828e3975f631", "1693142517898-2f986215e412", "1642104798671-01a4129f4fdc"],
  court: ["1545151414-8a948e1ea54f", "1620742820748-87c09249a72a", "1499510318569-1a3d67dc3976", "1541744573515-478c959628a0", "1547934045-2942d193cb49", "1542144582-1ba00456b5e3"],
  ootd: ["1595435742656-5272d0b3fa82", "1595435934249-5df7ed86e1c0", "1637071692126-d0ee7df18271", "1597726364265-02f57397c03c", "1599586120162-c282f39edd1e", "1547073044-67b2ec97ed0e"],
  gear: ["1604712941007-2627cfd759fd", "1616066753769-b46d9d825331", "1649888187589-552bfa7bf681", "1526506118085-60ce8714f8c5", "1547347298-4074fc3086f0"],
  trophy: ["1578269174936-2709b6aeb913", "1514820720301-4c4790309f46", "1625643268477-838321f445bb", "1550438655-400744b9fefc", "1663657876166-03b3aabb5483"],
} as const;

/** Nth image (wrapping) from a subject bucket — deterministic, no RNG. */
function pic(kind: keyof typeof PIX, n = 0): string {
  const bucket = PIX[kind];
  return img(bucket[n % bucket.length]!);
}

// ---------------------------------------------------------------------------
// Sample players
// ---------------------------------------------------------------------------
type SkillLevel = Prisma.ProfileCreateInput["skillLevel"];

interface SeedUser {
  username: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  skillLevel: SkillLevel;
  ratingValue: number;
  paddle: string;
  years: number;
  bio: string;
}

const USERS: SeedUser[] = [
  { username: "maya_dinks", firstName: "Maya", lastName: "Rivera", city: "Austin", country: "USA", skillLevel: "L4_0", ratingValue: 4.0, paddle: "JOOLA Perseus", years: 5, bio: "Third-shot drop enthusiast. Weekend warrior turned addict." },
  { username: "kenji_kim", firstName: "Kenji", lastName: "Kim", city: "Seattle", country: "USA", skillLevel: "L3_5", ratingValue: 3.5, paddle: "Selkirk Vanguard", years: 2, bio: "Ex-tennis, learning to slow down and dink." },
  { username: "sofia_smash", firstName: "Sofia", lastName: "Delgado", city: "Manila", country: "Philippines", skillLevel: "L4_5", ratingValue: 4.5, paddle: "CRBN TruFoam Genesis", years: 4, bio: "Bangers beware. See you at the kitchen line." },
  { username: "liam_lobs", firstName: "Liam", lastName: "O'Brien", city: "Denver", country: "USA", skillLevel: "L3_0", ratingValue: 3.0, paddle: "Franklin Signature", years: 1, bio: "New to the game, big on the vibes." },
  { username: "priya_p", firstName: "Priya", lastName: "Nair", city: "Bengaluru", country: "India", skillLevel: "L3_5", ratingValue: 3.5, paddle: "Gearbox Pro Power", years: 2, bio: "Doubles > singles. Fight me (politely)." },
  { username: "diego_drive", firstName: "Diego", lastName: "Santos", city: "Cebu", country: "Philippines", skillLevel: "L4_0", ratingValue: 4.0, paddle: "Engage Pursuit MX", years: 3, bio: "Open play regular. Coffee, then pickle." },
  { username: "hana_t", firstName: "Hana", lastName: "Tanaka", city: "Tokyo", country: "Japan", skillLevel: "L3_0", ratingValue: 3.2, paddle: "Vatic Pro Prism", years: 1, bio: "Chasing that clean reset. Court fashion enthusiast." },
  { username: "marco_net", firstName: "Marco", lastName: "Bianchi", city: "Milan", country: "Italy", skillLevel: "L4_5", ratingValue: 4.5, paddle: "Six Zero Double Black Diamond", years: 4, bio: "Erne when you least expect it." },
  { username: "aisha_ace", firstName: "Aisha", lastName: "Khan", city: "Dubai", country: "UAE", skillLevel: "L3_5", ratingValue: 3.7, paddle: "Paddletek Bantam", years: 2, bio: "Sunrise sessions only. ☀️" },
  { username: "noah_kitchen", firstName: "Noah", lastName: "Bennett", city: "Toronto", country: "Canada", skillLevel: "L4_0", ratingValue: 4.1, paddle: "ProKennex Black Ace", years: 3, bio: "Live at the kitchen line. Dink specialist." },
  { username: "lucia_rally", firstName: "Lucia", lastName: "Fernandez", city: "Madrid", country: "Spain", skillLevel: "L3_0", ratingValue: 3.1, paddle: "Head Radical Tour", years: 1, bio: "Padel convert. Loving the community here." },
  { username: "sam_spin", firstName: "Sam", lastName: "Okafor", city: "London", country: "UK", skillLevel: "L4_5", ratingValue: 4.6, paddle: "Ronbus Ripple", years: 5, bio: "Spin serves and questionable line calls." },
  { username: "chloe_court", firstName: "Chloe", lastName: "Martin", city: "Sydney", country: "Australia", skillLevel: "L3_5", ratingValue: 3.6, paddle: "JOOLA Ben Johns Hyperion", years: 2, bio: "Gym in the morning, courts at night." },
  { username: "raj_reset", firstName: "Raj", lastName: "Patel", city: "Quezon City", country: "Philippines", skillLevel: "L4_0", ratingValue: 4.0, paddle: "Selkirk Power Air", years: 3, bio: "Patience wins points. Reset > rip." },
  { username: "emma_edge", firstName: "Emma", lastName: "Nyström", city: "Stockholm", country: "Sweden", skillLevel: "L3_0", ratingValue: 3.0, paddle: "Vatic Pro Flash", years: 1, bio: "Rec league rookie, forever hyped." },
  { username: "tomas_topspin", firstName: "Tomas", lastName: "Novak", city: "Prague", country: "Czechia", skillLevel: "L4_5", ratingValue: 4.4, paddle: "Gearbox Pro Control", years: 4, bio: "Topspin dinks are underrated." },
];

// ---------------------------------------------------------------------------
// Posts — ordered newest → oldest (index 0 shows at the top of the feed).
// Types deliberately alternate to showcase variety and card design.
// ---------------------------------------------------------------------------
type PostType = Prisma.PostCreateManyInput["type"];

interface SeedPost {
  by: string; // username
  type: PostType;
  body?: string;
  media?: string[];
  meta?: Prisma.InputJsonValue;
  likes?: number; // approx number of likers
  comments?: { by: string; body: string }[];
}

const P: SeedPost[] = [
  {
    by: "emma_edge",
    type: "WELCOME",
    body: "👋 Emma from Stockholm just joined PicklePlay! Two weeks into pickleball and already obsessed. Say hi and tell me your #1 beginner tip!",
    likes: 14,
    comments: [
      { by: "noah_kitchen", body: "Welcome Emma! Tip #1: stay out of no-man's-land 😄" },
      { by: "priya_p", body: "Get to the kitchen line and dink, dink, dink!" },
    ],
  },
  {
    by: "diego_drive",
    type: "GAME_INVITE",
    body: "🏓 OPEN PLAY tonight! Cebu Sports Center, 7–9 PM. Courts 3 & 4 reserved, all levels welcome. Paddles up, drop a comment if you're in!",
    likes: 22,
    comments: [
      { by: "raj_reset", body: "In! Bringing two more." },
      { by: "sofia_smash", body: "Save me a spot 🙌" },
    ],
  },
  {
    by: "hana_t",
    type: "PHOTO",
    body: "OOTD 💜 New skort + visor combo for today's session. Feeling fast even if my footwork says otherwise 😂 #courtfashion",
    media: [pic("ootd", 0)],
    likes: 31,
    comments: [
      { by: "chloe_court", body: "Obsessed with this fit!" },
      { by: "aisha_ace", body: "Where's the visor from?? Need it." },
    ],
  },
  {
    by: "maya_dinks",
    type: "TRAINING_TIP",
    body: "Tip of the day 🧠: On the third shot, aim for their feet, not the sideline. A soft drop to the feet forces a pop-up you can attack. Consistency beats power here — every time.",
    likes: 40,
    comments: [{ by: "kenji_kim", body: "This changed my game. Feet > lines." }],
  },
  {
    by: "sam_spin",
    type: "PADDLE_REVIEW",
    body: "Switched to the Ronbus Ripple after two weeks of testing. Insane spin numbers and the sweet spot is huge. Control took a session to dial in but wow — worth it.",
    meta: { rating: 5, subject: "Ronbus Ripple" },
    media: [pic("paddle", 0)],
    likes: 27,
    comments: [
      { by: "tomas_topspin", body: "How's the hand speed at the net?" },
      { by: "sam_spin", body: "@tomas fast — genuinely surprised me." },
    ],
  },
  {
    by: "sofia_smash",
    type: "TOURNAMENT_NEWS",
    body: "📣 Registration is OPEN for the Manila Summer Slam (Aug 15–16)! Singles, doubles & mixed. Early-bird pricing until July 31. Who's teaming up with me for mixed doubles?",
    likes: 35,
    comments: [
      { by: "diego_drive", body: "Signed up! See you there 🔥" },
      { by: "priya_p", body: "Bracket is going to be stacked this year." },
    ],
  },
  {
    by: "noah_kitchen",
    type: "MATCH_RESULT",
    body: "Grindy 3-gamer at the club tonight. Came back from 2-8 down in the third — never give up on a game! 🙌",
    meta: { result: "WIN", score: "11-7, 8-11, 12-10" },
    likes: 29,
    comments: [{ by: "liam_lobs", body: "12-10 in the third is elite heart 👏" }],
  },
  {
    by: "liam_lobs",
    type: "POLL",
    body: "Settle a debate at open play: what's more important for a 3.0 leveling up?",
    meta: { options: ["Consistent third-shot drop", "Faster hands at the net", "Better footwork", "Serve/return depth"], votes: {} },
    likes: 12,
    comments: [{ by: "maya_dinks", body: "Footwork. It's always footwork." }],
  },
  {
    by: "chloe_court",
    type: "PHOTO",
    body: "Golden hour at the courts in Sydney 🌅 Doesn't get better than this. Three hours of open play and my legs are jelly.",
    media: [pic("court", 0)],
    likes: 44,
    comments: [{ by: "emma_edge", body: "This is stunning 😍" }],
  },
  {
    by: "kenji_kim",
    type: "GAME_INVITE",
    body: "Looking for a 3.5 doubles partner in Seattle for Saturday morning ladder. I bring the drops, you bring the bangs. DM me! 🏓",
    likes: 9,
    comments: [{ by: "raj_reset", body: "Wish I was closer, this sounds fun." }],
  },
  {
    by: "aisha_ace",
    type: "PHOTO",
    body: "New gear drop 📦 Grabbed a fresh grip, some cushioned balls, and a court bag that finally fits everything. Accessory game strong. 💪",
    media: [pic("gear", 0)],
    likes: 18,
    comments: [{ by: "hana_t", body: "That bag is clean! Brand?" }],
  },
  {
    by: "raj_reset",
    type: "TRAINING_TIP",
    body: "Reminder: the reset is a shot, not a mistake. When you're pushed back, a soft dead-ball into the kitchen buys you time to reset your feet AND your nerves. Practice it as much as your drive.",
    likes: 33,
    comments: [{ by: "noah_kitchen", body: "Preach. Resets win more than winners." }],
  },
  {
    by: "priya_p",
    type: "MATCH_RESULT",
    body: "Tough one today — lost a close mixed match but learned a ton about defending the middle. Onward and upward. 📈",
    meta: { result: "LOSS", score: "9-11, 11-6, 7-11" },
    likes: 15,
    comments: [{ by: "sofia_smash", body: "Middle balls are the hardest. You'll get it!" }],
  },
  {
    by: "marco_net",
    type: "PADDLE_REVIEW",
    body: "One month with the Six Zero Double Black Diamond. Pop is elite, spin is great, but it's UNFORGIVING off-center. Not a beginner paddle — but for 4.5+ it's a weapon.",
    meta: { rating: 4, subject: "Six Zero Double Black Diamond" },
    likes: 21,
    comments: [{ by: "sam_spin", body: "Agreed on the sweet spot. Precision paddle." }],
  },
  {
    by: "lucia_rally",
    type: "WELCOME",
    body: "👋 Hola! Lucia here, padel convert from Madrid. The community vibe on here is unreal. Looking for beginner-friendly open play near Retiro — any recs?",
    likes: 17,
    comments: [
      { by: "marco_net", body: "Benvenuta! You'll pick it up fast coming from padel." },
      { by: "emma_edge", body: "Welcome! We rookies gotta stick together 😄" },
    ],
  },
  {
    by: "diego_drive",
    type: "PHOTO",
    body: "Game recap 📸 4 hours, 6 games, countless dinks. My squad went 5-1 on the day. Best community in the city, hands down. 🏓💚",
    media: [pic("action", 0), pic("court", 1)],
    likes: 38,
    comments: [{ by: "raj_reset", body: "5-1 is a heater! GGs all around." }],
  },
  {
    by: "tomas_topspin",
    type: "POLL",
    body: "Paddle weight preference — where do you land?",
    meta: { options: ["Lightweight (<7.8 oz)", "Midweight (7.8–8.2 oz)", "Heavyweight (>8.2 oz)"], votes: {} },
    likes: 11,
    comments: [{ by: "marco_net", body: "Midweight all day. Best of both worlds." }],
  },
  {
    by: "chloe_court",
    type: "TOURNAMENT_NEWS",
    body: "🏆 Update from the Sydney Open: made it to the semis in women's doubles! One more day, one more push. Thanks for all the love 💚",
    likes: 42,
    comments: [
      { by: "aisha_ace", body: "LET'S GO CHLOE 🔥🔥" },
      { by: "emma_edge", body: "So proud, go get it!" },
    ],
  },
  {
    by: "sofia_smash",
    type: "PHOTO",
    body: "OOTD but make it tournament-ready 🔥 Matching kit, fresh laces, war paint on. If you look fast, you play fast (allegedly).",
    media: [pic("ootd", 1)],
    likes: 34,
    comments: [{ by: "hana_t", body: "The coordination! Iconic 💅" }],
  },
  {
    by: "maya_dinks",
    type: "MATCH_RESULT",
    body: "Milestone unlocked: 50th recorded match! 🎉 Started at a shaky 3.0 and I'm knocking on 4.0's door. Thanks to everyone who's dinked with me along the way.",
    meta: { result: "WIN", score: "11-4, 11-6" },
    likes: 47,
    comments: [
      { by: "kenji_kim", body: "50 matches! Legend. 🏅" },
      { by: "noah_kitchen", body: "4.0 incoming, mark my words." },
    ],
  },
  {
    by: "hana_t",
    type: "GAME_INVITE",
    body: "🌸 Sunday morning social play in Tokyo! Beginner + intermediate friendly, 9 AM at Komazawa. We rotate partners every game so everyone plays with everyone. Bring water & good vibes!",
    likes: 19,
    comments: [{ by: "lucia_rally", body: "Rotating partners is the best format 💯" }],
  },
  {
    by: "sam_spin",
    type: "TRAINING_TIP",
    body: "Spin serve legal-check 🧐: contact must be below the waist, paddle head below the wrist, and no pre-spin on the toss with the paddle hand. Learn the rule before you rely on the shot!",
    likes: 24,
    comments: [{ by: "tomas_topspin", body: "So many people miss the wrist rule." }],
  },
  {
    by: "noah_kitchen",
    type: "PADDLE_REVIEW",
    body: "Accessory review: overgrips are the cheapest upgrade in the sport. A fresh tacky overgrip fixed my grip slipping on drives instantly. Buy them in bulk, thank me later.",
    meta: { rating: 5, subject: "Tacky Overgrips (3-pack)" },
    likes: 20,
    comments: [{ by: "aisha_ace", body: "So true. Game changer for sweaty hands." }],
  },
  {
    by: "emma_edge",
    type: "PHOTO",
    body: "First-ever paddle! 🎉 Went with a Vatic Pro Flash on the recommendations here. Data says beginner-friendly, my heart says pro. New paddle, new me.",
    media: [pic("paddle", 1)],
    likes: 28,
    comments: [
      { by: "maya_dinks", body: "Great first choice! You'll love it." },
      { by: "priya_p", body: "New paddle day is the best day 🥳" },
    ],
  },
  {
    by: "aisha_ace",
    type: "POLL",
    body: "Sunrise or sunset pickleball? Dawn patrol reporting for duty ☀️",
    meta: { options: ["Sunrise 🌅", "Sunset 🌇", "Both, I have a problem"], votes: {} },
    likes: 16,
    comments: [{ by: "chloe_court", body: "Both. Obviously both." }],
  },
  {
    by: "raj_reset",
    type: "GAME_INVITE",
    body: "QC crew! Weekly Thursday-night doubles at the covered courts, 8 PM. 3.5–4.5 level. We keep score and rotate winners. Comment to lock your spot — first 8 play. 🏓",
    likes: 21,
    comments: [{ by: "diego_drive", body: "Locked in. Bringing the good balls." }],
  },
  {
    by: "lucia_rally",
    type: "TRAINING_TIP",
    body: "Coming from padel, the biggest adjustment: no walls to save you! Learned to take the ball earlier and commit to the kitchen. If you're switching racket sports, be patient with your net game.",
    likes: 18,
    comments: [{ by: "kenji_kim", body: "Same energy as an ex-tennis player 😅" }],
  },
  {
    by: "marco_net",
    type: "MATCH_RESULT",
    body: "Erne of the year candidate right here 😤 Read the cross-court dink early and put it away. Sometimes the gamble pays off.",
    meta: { result: "WIN", score: "11-9, 11-8" },
    likes: 30,
    comments: [{ by: "sam_spin", body: "The audacity 😂 respect." }],
  },
  {
    by: "chloe_court",
    type: "PHOTO",
    body: "New accessories haul 🛍️ Court shoes with proper lateral support (my ankles thank me), sweatbands, and a ball hopper. Investing in the addiction, one purchase at a time.",
    media: [pic("gear", 1)],
    likes: 22,
    comments: [{ by: "noah_kitchen", body: "Court-specific shoes are non-negotiable. Smart." }],
  },
  {
    by: "kenji_kim",
    type: "TOURNAMENT_NEWS",
    body: "📣 Seattle Rain City Round-Robin, July 26. Guaranteed 6+ games, all levels split into brackets. Great first tournament if you've never competed. Link in the events tab!",
    likes: 15,
    comments: [{ by: "emma_edge", body: "Round-robin is perfect for a first-timer. Tempted!" }],
  },
  {
    by: "priya_p",
    type: "PHOTO",
    body: "Recap from Bengaluru Sunday league 📸 Packed courts, new faces, and my dink game finally clicked in game 4. Community here is growing so fast 🇮🇳💚",
    media: [pic("action", 1)],
    likes: 26,
    comments: [{ by: "raj_reset", body: "Love to see the scene growing over there!" }],
  },
  {
    by: "tomas_topspin",
    type: "TRAINING_TIP",
    body: "Underrated shot: the topspin dink. A little brush up-and-over keeps it low AND dives at their feet, making the counter way harder. Start slow, exaggerate the low-to-high, then speed it up.",
    likes: 25,
    comments: [{ by: "maya_dinks", body: "Adding this to practice tomorrow 📝" }],
  },
  {
    by: "diego_drive",
    type: "POLL",
    body: "Doubles strategy check — your team is stacked at the net and the lob goes up over your partner. Who takes it?",
    meta: { options: ["Whoever's closer switches", "Partner backpedals (never)", "Call it early & cross", "Let it bounce, reset"], votes: {} },
    likes: 13,
    comments: [{ by: "marco_net", body: "Communication > everything. Call it early." }],
  },
  {
    by: "sofia_smash",
    type: "MATCH_RESULT",
    body: "Semifinal thriller at Manila Slam 😮‍💨 Lost 12-14 in the deciding game. Gutted but proud. Congrats to our opponents — we'll be back stronger. 💪",
    meta: { result: "LOSS", score: "11-6, 8-11, 12-14" },
    likes: 36,
    comments: [
      { by: "diego_drive", body: "12-14 is heartbreak. You played incredible though." },
      { by: "sofia_smash", body: "Thanks everyone 💚 recovery mode activated." },
    ],
  },
  {
    by: "hana_t",
    type: "PADDLE_REVIEW",
    body: "Testing the Vatic Pro Prism for a month as a 3.0. Honestly perfect for learning — forgiving face, comfy weight, easy on the arm. Great value for anyone starting out.",
    meta: { rating: 5, subject: "Vatic Pro Prism" },
    media: [pic("paddle", 2)],
    likes: 19,
    comments: [{ by: "emma_edge", body: "Torn between this and the Flash!" }],
  },
  {
    by: "noah_kitchen",
    type: "GAME_INVITE",
    body: "Toronto indoor winter league sign-ups are live ❄️🏓 Wednesday nights, 12 weeks, 4.0+ competitive division. If you want structured match play through the cold months, this is it.",
    likes: 17,
    comments: [{ by: "chloe_court", body: "Indoor leagues are clutch. Wish we needed them here 😅" }],
  },
  {
    by: "emma_edge",
    type: "TRAINING_TIP",
    body: "Beginner realization of the week 💡: I was watching the ball onto my opponent's paddle instead of splitting my attention to read their body. Watching the shoulder/paddle angle early = so much more reaction time.",
    likes: 21,
    comments: [{ by: "raj_reset", body: "Huge insight for game 1. You're leveling fast!" }],
  },
  {
    by: "aisha_ace",
    type: "PHOTO",
    body: "Dawn patrol OOTD 🌅 Desert mornings hit different. New moisture-wicking set + cap and I'm ready before the heat rolls in. Who else is a sunrise player?",
    media: [pic("ootd", 2)],
    likes: 27,
    comments: [{ by: "hana_t", body: "The lighting in this is unreal 😍" }],
  },
  {
    by: "sam_spin",
    type: "MATCH_RESULT",
    body: "London ladder night: went 4-0 and climbed to #2 on the board 📈 Spin serves were landing and the hands battles were FUN. Great games all round.",
    meta: { result: "WIN", score: "11-5, 11-9, 11-7, 11-4" },
    likes: 23,
    comments: [{ by: "tomas_topspin", body: "4-0 is filthy. GG." }],
  },
  {
    by: "lucia_rally",
    type: "PHOTO",
    body: "My first tournament medal! 🥉 Third in the beginner bracket in Madrid. Two months ago I'd never held a paddle. This community made it happen — gracias a todos 💚",
    media: [pic("trophy", 0)],
    likes: 45,
    comments: [
      { by: "sofia_smash", body: "From zero to podium — incredible! 🎉" },
      { by: "emma_edge", body: "GOALS. So happy for you!!" },
    ],
  },
  {
    by: "marco_net",
    type: "TOURNAMENT_NEWS",
    body: "📣 Milan Autumn Cup dates confirmed: Sept 20–21. Adding a 3.0–3.5 division this year so newer players get real bracket experience. Spread the word — let's fill it up! 🇮🇹",
    likes: 20,
    comments: [{ by: "lucia_rally", body: "A 3.5 division?! I might actually enter 👀" }],
  },
  {
    by: "raj_reset",
    type: "POLL",
    body: "Warm-up debate at the courts today 🤔 What do you actually do before playing?",
    meta: { options: ["Full dynamic warm-up", "A few dinks & drives", "Nothing, I just play", "Stretch after, not before"], votes: {} },
    likes: 14,
    comments: [{ by: "noah_kitchen", body: "Dynamic warm-up. My 30s demanded it 😂" }],
  },
  {
    by: "chloe_court",
    type: "MATCH_RESULT",
    body: "Won the Sydney Open women's doubles!! 🏆 Still can't believe it. Every early morning and every tough loss was worth it. My partner was unreal today. 💚💚",
    meta: { result: "WIN", score: "11-8, 11-9" },
    likes: 52,
    comments: [
      { by: "aisha_ace", body: "CHAMPION!! 🏆🔥 So deserved." },
      { by: "sofia_smash", body: "Congrats! Inspiring stuff." },
    ],
  },
  {
    by: "kenji_kim",
    type: "PADDLE_REVIEW",
    body: "Ex-tennis take on the Selkirk Vanguard: the control finally let me stop overhitting everything. Took my drops from 40% to 70% in a month. Not the flashiest paddle, but it fixed MY game.",
    meta: { rating: 4, subject: "Selkirk Vanguard" },
    likes: 18,
    comments: [{ by: "maya_dinks", body: "Control paddles are so slept on. Good pick." }],
  },
  {
    by: "diego_drive",
    type: "GAME_INVITE",
    body: "🚨 Last-minute! Two spots opened for tonight's Cebu doubles, 8 PM. 3.5+ preferred. First two to comment are in — let's run it back! 🏓🔥",
    likes: 12,
    comments: [
      { by: "sofia_smash", body: "ME. I'm in." },
      { by: "raj_reset", body: "Take the second spot, I'm out of town 😭" },
    ],
  },
  {
    by: "priya_p",
    type: "TRAINING_TIP",
    body: "Doubles tip 🧠: when you're both back and pushed, DON'T rush to the line together. Move up as a wall on soft balls only. Charging on a good drive just gets you passed. Patience is a strategy.",
    likes: 26,
    comments: [{ by: "tomas_topspin", body: "Moving as a unit is everything. Nailed it." }],
  },
  {
    by: "hana_t",
    type: "POLL",
    body: "Real talk: how many paddles do you currently own? 😅",
    meta: { options: ["Just 1 (respectable)", "2–3 (reasonable)", "4–5 (a problem)", "Don't ask 🙈"], votes: {} },
    likes: 20,
    comments: [{ by: "sam_spin", body: "Refuse to answer on the grounds it'll incriminate me." }],
  },
  {
    by: "tomas_topspin",
    type: "PHOTO",
    body: "Sunset session in Prague 🌇 Empty courts, perfect temps, and a solid two hours of drilling drops. Sometimes the best games are just you, a bucket of balls, and quiet. 🧘",
    media: [pic("court", 2)],
    likes: 24,
    comments: [{ by: "chloe_court", body: "This is the peaceful pickle content I'm here for 🙏" }],
  },
  {
    by: "maya_dinks",
    type: "GAME_INVITE",
    body: "Austin friends 🤠 Hosting a beginner-welcome open play Saturday 10 AM at Zilker. I'll run a quick 20-min clinic on the third-shot drop before we play. Bring a friend who's pickle-curious!",
    likes: 33,
    comments: [
      { by: "liam_lobs", body: "A free clinic AND open play? Count me in." },
      { by: "emma_edge", body: "Wish I was in Austin for this 😭 record it!" },
    ],
  },
  {
    by: "liam_lobs",
    type: "MATCH_RESULT",
    body: "Milestone: my FIRST recorded win! 🎉 One month in, hands shaking, but we closed it out. From 'what's a kitchen?' to a W. This game is the best. 🏓💚",
    meta: { result: "WIN", score: "11-9, 6-11, 11-8" },
    likes: 41,
    comments: [
      { by: "maya_dinks", body: "FIRST WIN!! 🎉 Huge. Onwards!" },
      { by: "priya_p", body: "Love this. Welcome to the winners' circle 🏆" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
async function main() {
  // Clean prior feed-seed data (cascades remove posts/reactions/comments).
  const existing = await db.user.findMany({
    where: { email: { startsWith: SEED_PREFIX } },
    select: { id: true },
  });
  if (existing.length) {
    await db.user.deleteMany({ where: { id: { in: existing.map((u) => u.id) } } });
    console.log(`Removed ${existing.length} prior feed-seed users (and their content).`);
  }

  const passwordHash = await bcrypt.hash("SeedPickle123!", 10);
  const idByUsername = new Map<string, string>();

  for (const u of USERS) {
    const wins = Math.round(u.years * 12 * (u.ratingValue - 2.5));
    const losses = Math.round(wins * 0.7);
    const created = await db.user.create({
      data: {
        email: `${SEED_PREFIX}${u.username}@pikool.app`,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash,
        emailVerified: new Date(),
        roles: { create: { role: "PLAYER" } },
        settings: { create: {} },
        profile: {
          create: {
            username: u.username,
            displayName: `${u.firstName} ${u.lastName}`,
            city: u.city,
            country: u.country,
            skillLevel: u.skillLevel,
            ratingValue: u.ratingValue,
            dominantHand: "RIGHT",
            yearsPlaying: u.years,
            favoritePaddle: u.paddle,
            formats: ["DOUBLES", "MIXED"],
            availability: ["WEEKDAY_EVENINGS", "WEEKENDS"],
            bio: u.bio,
            gamesPlayed: wins + losses,
            wins,
            losses,
            currentStreak: 0,
            longestStreak: Math.max(3, Math.round(u.ratingValue)),
          },
        },
      },
      select: { id: true },
    });
    idByUsername.set(u.username, created.id);
  }

  const usernames = USERS.map((u) => u.username);
  const now = Date.now();
  const STEP_MS = 3.2 * 60 * 60 * 1000; // ~3.2h between posts → ~50 posts over ~6.6 days

  let postCount = 0;
  let reactionCount = 0;
  let commentCount = 0;

  for (let i = 0; i < P.length; i++) {
    const spec = P[i]!;
    const authorId = idByUsername.get(spec.by);
    if (!authorId) throw new Error(`Unknown seed author: ${spec.by}`);

    // Newest first: index 0 ≈ now, each later post older. Small deterministic jitter.
    const jitter = ((i * 37) % 47) * 60 * 1000;
    const createdAt = new Date(now - i * STEP_MS - jitter);

    const meta = spec.meta ?? undefined;

    const post = await db.post.create({
      data: {
        authorId,
        type: spec.type,
        body: spec.body,
        mediaUrls: spec.media ?? [],
        ...(meta ? { meta } : {}),
        createdAt,
      },
      select: { id: true },
    });
    postCount++;

    // Likes: deterministic set of distinct users (never the author).
    const likeTarget = Math.min(spec.likes ?? 8, usernames.length - 1);
    const likers: string[] = [];
    for (let k = 0; k < usernames.length && likers.length < likeTarget; k++) {
      const uname = usernames[(i * 5 + k * 3 + 1) % usernames.length]!;
      if (uname === spec.by || likers.includes(uname)) continue;
      likers.push(uname);
    }
    if (likers.length) {
      await db.reaction.createMany({
        data: likers.map((uname) => ({ postId: post.id, userId: idByUsername.get(uname)!, type: "LIKE" as const })),
        skipDuplicates: true,
      });
      reactionCount += likers.length;
    }

    // Comments: authored in-thread, timestamped just after the post.
    if (spec.comments?.length) {
      for (let c = 0; c < spec.comments.length; c++) {
        const cm = spec.comments[c]!;
        const cAuthor = idByUsername.get(cm.by);
        if (!cAuthor) continue;
        await db.comment.create({
          data: {
            postId: post.id,
            authorId: cAuthor,
            body: cm.body,
            createdAt: new Date(createdAt.getTime() + (c + 1) * 11 * 60 * 1000),
          },
        });
        commentCount++;
      }
    }
  }

  console.log(
    `Seeded feed: ${USERS.length} players, ${postCount} posts, ${reactionCount} likes, ${commentCount} comments.`,
  );
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
