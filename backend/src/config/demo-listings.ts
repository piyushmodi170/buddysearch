import { prisma } from './db.js';

const AVATARS = [
  '/avatars/user-1.jpg',
  '/avatars/user-2.jpg',
  '/avatars/user-3.jpg',
  '/avatars/user-4.jpg',
];

type DemoListing = {
  name: string;
  city: string;
  state: string;
  gender: string;
  role: 'CLIENT' | 'BUDDY' | 'BOTH';
  bio: string;
  type: 'NEED_BUDDY' | 'AM_BUDDY';
  category: string;
  title: string;
  description: string;
  budget: number;
  location: string;
};

const LISTINGS: DemoListing[] = [
  { name: 'Aarav Sharma', city: 'Mumbai', state: 'Maharashtra', gender: 'male', role: 'CLIENT', bio: 'Product designer who explores cafés and street food every weekend.', type: 'NEED_BUDDY', category: 'Cafe Buddy', title: 'Need a café buddy in Bandra this Saturday', description: 'Looking for someone to hop between two or three cafés in Bandra, try desserts, and talk design or travel. Afternoon slot, 3 hours.', budget: 800, location: 'Bandra, Mumbai' },
  { name: 'Isha Nair', city: 'Bengaluru', state: 'Karnataka', gender: 'female', role: 'BUDDY', bio: 'Weekend trekker and photographer around Nandi Hills and Skandagiri.', type: 'AM_BUDDY', category: 'Travel Buddy', title: 'Available as a day-trip travel buddy from Bengaluru', description: 'I plan easy day trips from Bengaluru, handle local transport tips, and take photos. Good for first-time visitors.', budget: 1500, location: 'Bengaluru' },
  { name: 'Rohan Mehta', city: 'Pune', state: 'Maharashtra', gender: 'male', role: 'BOTH', bio: 'Gym regular in Kalyani Nagar. Happy to partner for morning sessions.', type: 'AM_BUDDY', category: 'Gym Buddy', title: 'Gym buddy for 6 AM sessions in Kalyani Nagar', description: 'Looking for a consistent lifting partner, 4 days a week. I can spot and share a simple hypertrophy plan.', budget: 500, location: 'Kalyani Nagar, Pune' },
  { name: 'Diya Kapoor', city: 'Delhi', state: 'Delhi', gender: 'female', role: 'CLIENT', bio: 'Loves indie films and long walks in Lodhi Garden.', type: 'NEED_BUDDY', category: 'Movie Buddy', title: 'Need a movie buddy for a PVR premiere', description: 'Need company for a Saturday evening screening in Saket. Coffee after the film is a plus.', budget: 700, location: 'Saket, Delhi' },
  { name: 'Kabir Joshi', city: 'Hyderabad', state: 'Telangana', gender: 'male', role: 'BUDDY', bio: 'Local food guide for old city biryani and Irani chai.', type: 'AM_BUDDY', category: 'City Explorer Buddy', title: 'Old city food walk buddy in Hyderabad', description: 'Half-day walk covering Charminar lanes, bakeries, and a sit-down meal. I speak Hindi, English, and Telugu.', budget: 1200, location: 'Charminar, Hyderabad' },
  { name: 'Meera Iyer', city: 'Chennai', state: 'Tamil Nadu', gender: 'female', role: 'CLIENT', bio: 'Software engineer learning Carnatic vocals after work.', type: 'NEED_BUDDY', category: 'Language Buddy', title: 'Tamil conversation buddy twice a week', description: 'I am beginner-intermediate. Want 45-minute café conversations, evenings near T. Nagar.', budget: 600, location: 'T. Nagar, Chennai' },
  { name: 'Aditya Rao', city: 'Mumbai', state: 'Maharashtra', gender: 'male', role: 'BUDDY', bio: 'Night-out planner for live music in Lower Parel.', type: 'AM_BUDDY', category: 'Nightout Buddy', title: 'Live music night-out buddy this weekend', description: 'I know two venues with decent crowds and can handle bookings. Looking for 1–2 people who want a relaxed night, not a club crawl.', budget: 1800, location: 'Lower Parel, Mumbai' },
  { name: 'Sana Qureshi', city: 'Jaipur', state: 'Rajasthan', gender: 'female', role: 'BOTH', bio: 'Heritage walks and photography around the walled city.', type: 'AM_BUDDY', category: 'Photography Buddy', title: 'Sunrise photography buddy at Amer', description: 'Golden-hour shoot around Amer and Jal Mahal. I bring a tripod and a simple shot list for portraits and architecture.', budget: 1100, location: 'Amer, Jaipur' },
  { name: 'Nikhil Verma', city: 'Noida', state: 'Uttar Pradesh', gender: 'male', role: 'CLIENT', bio: 'Preparing for product interviews at startups.', type: 'NEED_BUDDY', category: 'Interview Buddy', title: 'Need a mock interview buddy for PM roles', description: 'One-hour mock: product sense plus a follow-up debrief. Prefer someone who has sat on either side of a PM interview.', budget: 900, location: 'Sector 18, Noida' },
  { name: 'Pooja Desai', city: 'Ahmedabad', state: 'Gujarat', gender: 'female', role: 'BUDDY', bio: 'Weekend shopper who knows Law Garden and CG Road well.', type: 'AM_BUDDY', category: 'Shopping Buddy', title: 'Shopping buddy for festive wear', description: 'Help picking outfits, bargaining, and a snack stop. 3-hour window on Sunday.', budget: 700, location: 'Law Garden, Ahmedabad' },
  { name: 'Arjun Patel', city: 'Surat', state: 'Gujarat', gender: 'male', role: 'CLIENT', bio: 'New in the city for work. Looking for a driving practice partner.', type: 'NEED_BUDDY', category: 'Driving Buddy', title: 'Need a calm driving practice buddy', description: 'I have a learner licence. Want 1 hour on quieter roads in the evening, twice this week.', budget: 650, location: 'Vesu, Surat' },
  { name: 'Naina Reddy', city: 'Hyderabad', state: 'Telangana', gender: 'female', role: 'BUDDY', bio: 'Board-game host and café hopper in Gachibowli.', type: 'AM_BUDDY', category: 'Gaming Buddy', title: 'Board-game café buddy this Friday', description: 'Catan or Coup for 2–3 hours. I can bring a deck if the café is busy.', budget: 500, location: 'Gachibowli, Hyderabad' },
  { name: 'Vikram Singh', city: 'Chandigarh', state: 'Chandigarh', gender: 'male', role: 'BOTH', bio: 'Cyclist on the lake round. Also up for a movie if it rains.', type: 'NEED_BUDDY', category: 'City Explorer Buddy', title: 'Need a cycling buddy around Sukhna Lake', description: 'Easy 12 km loop at 7 AM. Helmet required. Coffee after the ride.', budget: 400, location: 'Sukhna Lake, Chandigarh' },
  { name: 'Riya Banerjee', city: 'Kolkata', state: 'West Bengal', gender: 'female', role: 'BUDDY', bio: 'Dancer teaching beginner Bollywood on weekends.', type: 'AM_BUDDY', category: 'Dance Buddy', title: 'Beginner dance buddy for a 1-hour session', description: 'Studio near Salt Lake. No performance pressure, just footwork and a short combo.', budget: 800, location: 'Salt Lake, Kolkata' },
  { name: 'Harsh Gupta', city: 'Lucknow', state: 'Uttar Pradesh', gender: 'male', role: 'CLIENT', bio: 'Foodie hunting kebabs and chaat in Aminabad.', type: 'NEED_BUDDY', category: 'Cafe Buddy', title: 'Need a food-walk buddy in Aminabad', description: 'Evening chaat and kebabs, 2 hours. I am vegetarian-friendly if we pick mixed spots.', budget: 750, location: 'Aminabad, Lucknow' },
  { name: 'Ananya Menon', city: 'Kochi', state: 'Kerala', gender: 'female', role: 'BUDDY', bio: 'Backwater day trips and Fort Kochi walks.', type: 'AM_BUDDY', category: 'Travel Buddy', title: 'Fort Kochi heritage walk buddy', description: 'Art cafés, Chinese fishing nets, and a sunset point. I handle the route and local buses.', budget: 1300, location: 'Fort Kochi' },
  { name: 'Siddharth Malhotra', city: 'Gurgaon', state: 'Haryana', gender: 'male', role: 'CLIENT', bio: 'Works in cyber hub and wants a gym accountability partner.', type: 'NEED_BUDDY', category: 'Gym Buddy', title: 'Need an evening gym buddy in Golf Course Road', description: '5:30 PM, 4 days a week. Intermediate lifts. Looking for someone who actually shows up.', budget: 550, location: 'Golf Course Road, Gurgaon' },
  { name: 'Kavya Pillai', city: 'Thiruvananthapuram', state: 'Kerala', gender: 'female', role: 'BOTH', bio: 'Reads on beaches and plans slow travel in the south.', type: 'NEED_BUDDY', category: 'Chat Buddy', title: 'Need a café chat buddy this Sunday', description: 'Two hours, books and work-life talk. Quiet café preferred.', budget: 450, location: 'Vellayambalam, Thiruvananthapuram' },
  { name: 'Manish Kulkarni', city: 'Nagpur', state: 'Maharashtra', gender: 'male', role: 'BUDDY', bio: 'Car-pool organiser for the airport run.', type: 'AM_BUDDY', category: 'Car Pooling Buddy', title: 'Airport car-pool buddy this Friday 6 AM', description: 'Two seats left from Civil Lines to the airport. Split fuel, no extra stops.', budget: 350, location: 'Civil Lines, Nagpur' },
  { name: 'Tara Fernandes', city: 'Goa', state: 'Goa', gender: 'female', role: 'BUDDY', bio: 'North Goa café maps and quiet beach mornings.', type: 'AM_BUDDY', category: 'Cafe Buddy', title: 'Café-hopping buddy in Assagao', description: 'Three cafés, scooter optional. I know which ones are actually open on weekdays.', budget: 1000, location: 'Assagao, Goa' },
  { name: 'Yash Agarwal', city: 'Indore', state: 'Madhya Pradesh', gender: 'male', role: 'CLIENT', bio: 'New intern looking for a campus-to-office commute buddy.', type: 'NEED_BUDDY', category: 'Intern Buddy', title: 'Need an intern buddy for the first office week', description: 'Help navigating the first three days: metro, lunch spots, and a simple after-work walk.', budget: 500, location: 'Vijay Nagar, Indore' },
  { name: 'Leela Krishnan', city: 'Coimbatore', state: 'Tamil Nadu', gender: 'female', role: 'BOTH', bio: 'Hill-view photography and filter-coffee snob.', type: 'AM_BUDDY', category: 'Photography Buddy', title: 'Ooty day-trip photography buddy', description: 'I can plan a one-day loop from Coimbatore. Bring a camera or phone; I share locations.', budget: 1600, location: 'Coimbatore' },
  { name: 'Farhan Ali', city: 'Bhopal', state: 'Madhya Pradesh', gender: 'male', role: 'CLIENT', bio: 'Likes lakeside walks and weekend markets.', type: 'NEED_BUDDY', category: 'City Explorer Buddy', title: 'Need a buddy for the Upper Lake walk', description: 'Sunday morning, 90 minutes, then breakfast. Easy pace.', budget: 400, location: 'Upper Lake, Bhopal' },
  { name: 'Shruti Bose', city: 'Bhubaneswar', state: 'Odisha', gender: 'female', role: 'BUDDY', bio: 'Temple architecture walks and local sweets.', type: 'AM_BUDDY', category: 'City Explorer Buddy', title: 'Old town temple walk buddy', description: 'Lingaraj area, 2 hours, respectful dress. I explain the basics without a long lecture.', budget: 700, location: 'Old Town, Bhubaneswar' },
];

export const ensureDemoListings = async () => {
  for (let i = 0; i < LISTINGS.length; i += 1) {
    const item = LISTINGS[i];
    const email = `listing.${String(i + 1).padStart(2, '0')}@demo.buddysearch.local`;
    const avatar = AVATARS[i % AVATARS.length];
    const phone = `98${String(11000000 + i).padStart(8, '0')}`;
    const googleId = `demo-listing-${i + 1}`;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            name: item.name,
            email,
            phone,
            googleId,
            role: item.role,
            city: item.city,
            state: item.state,
            gender: item.gender,
            bio: item.bio,
            avatar,
            verified: true,
            onboardingCompleted: true,
            availableForRequests: true,
            profileCompletion: 80,
            membershipPlan: i % 5 === 0 ? 'STAR' : i % 3 === 0 ? 'PREMIUM' : 'BASIC',
            isAdmin: false,
            banned: false,
          },
        });
      } catch (err) {
        console.error('[demo-listings] user create failed', email, (err as any)?.message || err);
        continue;
      }
    } else if (!user.avatar) {
      user = await prisma.user.update({ where: { id: user.id }, data: { avatar } });
    }

    const slug = item.category.toLowerCase().replace(/\s+/g, '-');
    try {
      const interest = await prisma.interest.upsert({
        where: { slug },
        update: { label: item.category },
        create: { slug, label: item.category },
      });
      await prisma.userInterest.upsert({
        where: { userId_interestId: { userId: user.id, interestId: interest.id } },
        create: { userId: user.id, interestId: interest.id },
        update: {},
      });
    } catch (err) {
      console.error('[demo-listings] interest link failed', slug, (err as any)?.message || err);
    }

    const existing = await prisma.request.count({ where: { userId: user.id } });
    if (existing > 0) continue;

    const createdAt = new Date(Date.now() - (i + 1) * 36e5);
    await prisma.request.create({
      data: {
        userId: user.id,
        type: item.type,
        category: item.category,
        title: item.title,
        description: item.description,
        budget: item.budget,
        location: item.location,
        status: 'OPEN',
        dateTime: new Date(Date.now() + (i + 2) * 864e5),
        createdAt,
      },
    });
  }
};
