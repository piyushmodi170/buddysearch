import { PrismaClient } from '../../backend/node_modules/@prisma/client/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const interests = [
  { label: 'Dance Buddy', slug: 'dance-buddy', emoji: '💃' },
  { label: 'City Explorer Buddy', slug: 'city-explorer-buddy', emoji: '🏙️' },
  { label: 'Language Buddy', slug: 'language-buddy', emoji: '🗣️' },
  { label: 'Tech Buddy', slug: 'tech-buddy', emoji: '💻' },
  { label: 'Chat Buddy', slug: 'chat-buddy', emoji: '💬' },
  { label: 'Nightout Buddy', slug: 'nightout-buddy', emoji: '🌙' },
  { label: 'Interview Buddy', slug: 'interview-buddy', emoji: '🎤' },
  { label: 'Intern Buddy', slug: 'intern-buddy', emoji: '📋' },
  { label: 'Driving Buddy', slug: 'driving-buddy', emoji: '🚗' },
  { label: 'Car Pooling Buddy', slug: 'car-pooling-buddy', emoji: '🚙' },
  { label: 'Shopping Buddy', slug: 'shopping-buddy', emoji: '🛍️' },
  { label: 'Cafe Buddy', slug: 'cafe-buddy', emoji: '☕' },
  { label: 'Clubbing Buddy', slug: 'clubbing-buddy', emoji: '🎵' },
  { label: 'Gaming Buddy', slug: 'gaming-buddy', emoji: '🎮' },
  { label: 'Gym Buddy', slug: 'gym-buddy', emoji: '💪' },
  { label: 'Movie Buddy', slug: 'movie-buddy', emoji: '🎬' },
  { label: 'Photography Buddy', slug: 'photography-buddy', emoji: '📷' },
  { label: 'Travel Buddy', slug: 'travel-buddy', emoji: '✈️' },
];

const membershipPlans = [
  {
    name: 'BASIC' as const,
    displayName: 'Basic',
    tagline: 'Get started and explore',
    price: 249,
    originalPrice: 498,
    discount: 50,
    durationMonths: 3,
    postLimit: 5,
    isPopular: false,
    sortOrder: 1,
    features: ["Browse buddy discovery feed", "View buddy profiles (name, avatar, city, services)", "Post up to 5 plan requests / month", "Standard position in discover feed"]
  },
  {
    name: 'STANDARD' as const,
    displayName: 'Standard',
    tagline: 'Great value to get started',
    price: 349,
    originalPrice: 998,
    discount: 65,
    durationMonths: 6,
    postLimit: 10,
    isPopular: false,
    sortOrder: 2,
    features: ["Everything in Basic", "Post up to 10 plan requests / month", "View user social profile links", "Priority placement in discover", "\"Standard\" badge on your profile"]
  },
  {
    name: 'PREMIUM' as const,
    displayName: 'Premium',
    tagline: 'For power users',
    price: 449,
    originalPrice: 1600,
    discount: 72,
    durationMonths: 12,
    postLimit: 15,
    isPopular: true,
    sortOrder: 3,
    features: ["Everything in Standard", "Post up to 15 plan requests / month", "Higher priority in discover (above Standard)", "\"Premium\" badge on your profile"]
  },
  {
    name: 'STAR' as const,
    displayName: 'Star Member',
    tagline: 'Top tier. Pay once, keep forever.',
    price: 649,
    originalPrice: 2040,
    discount: 76,
    durationMonths: 0,
    postLimit: -1,
    isOneTime: true,
    isPopular: false,
    sortOrder: 4,
    features: ["Everything in Premium", "Unlimited plan requests", "Pinned to top of discover", "Star badge on profile card", "Featured in \"Top Buddies\" section", "Lifetime access — pay once"]
  }
];

async function main() {
  console.log('Seeding MongoDB database...');

  // Seed Interests
  for (const interest of interests) {
    await prisma.interest.upsert({
      where: { slug: interest.slug },
      update: interest,
      create: interest,
    });
  }
  console.log(`Seeded ${interests.length} interests.`);

  // Seed Membership Plans
  for (const plan of membershipPlans) {
    await prisma.membershipPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }
  console.log(`Seeded ${membershipPlans.length} membership plans.`);

  // Seed Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'piyush.modi@gmail.com' },
    update: {
      email: 'piyush.modi@gmail.com',
      passwordHash,
      role: 'BOTH',
      isAdmin: true,
      city: 'Mumbai',
      membershipPlan: 'STAR',
      verified: true,
      profileCompletion: 100,
      onboardingCompleted: true,
      availableForRequests: true,
    },
    create: {
      name: 'Admin',
      email: 'piyush.modi@gmail.com',
      phone: '9999999999',
      passwordHash,
      role: 'BOTH',
      isAdmin: true,
      city: 'Mumbai',
      membershipPlan: 'STAR',
      verified: true,
      profileCompletion: 100,
      onboardingCompleted: true,
      availableForRequests: true,
    },
  });
  console.log(`Seeded admin user (id: ${adminUser.id}).`);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
