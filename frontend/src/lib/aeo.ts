export type AeoFaq = { q: string; a: string };

export type AeoArticle = {
  slug: string;
  query: string;
  title: string;
  description: string;
  keywords: string[];
  directAnswer: string;
  explanation: string;
  steps: { name: string; text: string }[];
  table?: { caption: string; headers: string[]; rows: string[][] };
  examples?: string[];
  faqs: AeoFaq[];
};

export const AEO_ARTICLES: AeoArticle[] = [
  {
    slug: 'hire-a-buddy',
    query: 'How do I hire a buddy in India?',
    title: 'How to hire a buddy in India',
    description:
      'Hire a verified Buddy Search companion in India in a few steps: create an account, post your plan, chat, then meet. Friendship-first, not dating.',
    keywords: ['hire a buddy India', 'find a buddy', 'friend for hire', 'social companion booking'],
    directAnswer:
      'You hire a buddy in India on Buddy Search by creating an account, posting your plan, and chatting with a verified companion before you meet. It is a friendship-first platform for movies, travel, dining, and everyday plans — not a dating app.',
    explanation:
      'Buddy Search matches people who want company with verified Buddies nearby. You pick the activity. The Buddy sets a rate. You agree on time and place in private chat. This helps if you are new in a city, going alone to a film, or want a travel partner without a tour group.',
    steps: [
      { name: 'Create your account', text: 'Sign up with email or Google and verify your email.' },
      { name: 'Choose a plan', text: 'Open membership if you need to post plans and browse companions.' },
      { name: 'Post what you want to do', text: 'Say the activity, city, and time. Example: “Movie in Pune, Saturday 7 pm.”' },
      { name: 'Pick a verified Buddy', text: 'Read profiles, ratings, and ID-verified status. Accept a chat request.' },
      { name: 'Agree in chat, then meet', text: 'Confirm rate, spot, and duration in the app before you go.' },
    ],
    table: {
      caption: 'What you can hire a buddy for',
      headers: ['Plan', 'Typical use', 'Usual rate range'],
      rows: [
        ['Movie buddy', 'Cinema, concerts, night out', '₹1,000–₹2,000/hr'],
        ['Travel companion', 'City trips, trains, weekends', '₹1,500–₹2,000/hr'],
        ['Cafe or hangout', 'Coffee, walks, new places', '₹500–₹1,500/hr'],
        ['Activity partner', 'Gym, shopping, gaming, dance', '₹300–₹2,000/hr'],
      ],
    },
    examples: [
      '“I just moved to Bangalore and want someone to try cafes with.”',
      '‘I have a movie ticket in Delhi and do not want to go alone.’',
    ],
    faqs: [
      {
        q: 'How do I hire a buddy in India?',
        a: 'Sign up on Buddy Search, post your plan, and chat with a verified Buddy. Agree on the rate and meeting spot in the app before you meet.',
      },
      {
        q: 'Is hiring a buddy the same as dating?',
        a: 'No. Buddy Search is for platonic company and shared activities only. Dating and romantic booking are not allowed.',
      },
      {
        q: 'How much does it cost to hire a buddy?',
        a: 'Membership starts from ₹249 for platform access. The Buddy’s activity fee is separate and agreed in chat, often ₹300 to ₹2,000 per hour.',
      },
    ],
  },
  {
    slug: 'movie-buddy-hire',
    query: 'Where can I hire a movie buddy in India?',
    title: 'Hire a movie buddy in India',
    description:
      'Hire a movie buddy in India on Buddy Search. Find a verified companion for films, weekends, and nights out in cities like Mumbai, Delhi, and Bangalore.',
    keywords: ['movie buddy hire', 'hire a movie buddy India', 'movie companion India'],
    directAnswer:
      'You can hire a movie buddy in India on Buddy Search by posting a Movie Buddy plan and chatting with a verified companion near you. It is built for watching films together as friends, not as a date.',
    explanation:
      'A movie buddy is someone who goes to the cinema with you, talks about the film, and keeps the evening easy. People use this when friends are busy or when they are new in town. Filter for Movie Buddy, then pick someone whose city and time match yours.',
    steps: [
      { name: 'Open Buddy Search', text: 'Create an account and complete a basic profile.' },
      { name: 'Post a movie plan', text: 'Name the film, theatre area, and show time. Mark the category Movie Buddy.' },
      { name: 'Compare companions', text: 'Check verification, reviews, and hourly rate.' },
      { name: 'Confirm the outing', text: 'Share the booking details in chat. Pay the Buddy as you both agree.' },
    ],
    table: {
      caption: 'Movie buddy vs going alone',
      headers: ['Need', 'Going alone', 'Movie buddy hire'],
      rows: [
        ['Company', 'You sit by yourself', 'A verified companion joins you'],
        ['Safety in a new city', 'You handle it solo', 'You meet in a public theatre'],
        ['Cost', 'Only the ticket', 'Ticket plus the Buddy’s hourly rate'],
      ],
    },
    examples: [
      'Weekend show in Mumbai with a Movie Buddy.',
      'Late IMAX in Hyderabad when your friends cannot come.',
    ],
    faqs: [
      {
        q: 'Where can I hire a movie buddy in India?',
        a: 'Use Buddy Search in your city. Post a Movie Buddy plan and accept a verified companion who can make that show time.',
      },
      {
        q: 'Which movie buddy hire service in India offers the best value?',
        a: 'Buddy Search lets Buddies set their own rates, so you can compare profiles instead of paying one fixed agency fee. Membership is a separate platform charge from ₹249.',
      },
      {
        q: 'Do I buy the movie tickets?',
        a: 'Usually yes. Agree in chat who books seats and how you split snacks or travel.',
      },
    ],
  },
  {
    slug: 'travel-companion',
    query: 'Where can I find a travel buddy in India?',
    title: 'Find a travel companion in India',
    description:
      'Find a travel buddy in India on Buddy Search for city breaks, trains, and trips like Rajasthan. Verified companions, friendship-first.',
    keywords: [
      'find a travel buddy',
      'india travel partner',
      'travel companion services',
      'indian travel buddy',
      'india travel buddy',
    ],
    directAnswer:
      'You find a travel buddy in India on Buddy Search by posting your trip (city, dates, and pace) and chatting with a verified travel companion. It is for platonic company on trains, weekends, and sightseeing — not a dating or tour-package service.',
    explanation:
      'A travel companion shares the journey so you do not explore alone. Solo travellers, people new to a city, and anyone who wants a like-minded buddy for Rajasthan, Coorg, or a long-distance train use this. You set the itinerary. The Buddy joins for the hours or days you agree.',
    steps: [
      { name: 'Write the trip clearly', text: 'City, dates, budget style, and whether you want day plans or a weekend.' },
      { name: 'Filter travel companions', text: 'Look for Travel Buddy profiles with verification and trip experience.' },
      { name: 'Plan in chat', text: 'Agree meeting station, hotel area, and hourly or daily rate before you leave.' },
      { name: 'Meet in public first', text: 'Start at a station, hotel lobby, or cafe. Keep chat in the app.' },
    ],
    table: {
      caption: 'Travel companion options',
      headers: ['Trip type', 'Example', 'Good for'],
      rows: [
        ['City weekend', 'Jaipur or Udaipur with a local-paced buddy', 'First-time visitors'],
        ['Train journey', 'Long-distance day or overnight', 'People who prefer not to travel solo'],
        ['Day sightseeing', 'Forts, cafes, markets', 'Short plans with a clear end time'],
      ],
    },
    examples: [
      'Book a reliable travel companion for a Rajasthan weekend.',
      'Find travel partners in India for a Bangalore to Coorg drive.',
    ],
    faqs: [
      {
        q: 'Where can I find a travel buddy in India?',
        a: 'Post a Travel Buddy plan on Buddy Search with your city and dates. Verified companions in 200+ cities can accept.',
      },
      {
        q: 'Is a travel companion safe for solo travellers?',
        a: 'Choose ID-verified profiles, meet in public, and keep plans in the in-app chat. Buddy Search is friendship-first and you can report anyone who breaks the rules.',
      },
      {
        q: 'Which travel companion service in India is best for a budget trip?',
        a: 'On Buddy Search you compare Buddy rates yourself. Day plans cost less than full weekends. Membership is extra and starts from ₹249.',
      },
    ],
  },
  {
    slug: 'rent-a-friend-india',
    query: 'Can I rent a friend in India?',
    title: 'Rent a friend in India',
    description:
      'Yes. Buddy Search is a rent-a-friend style platform in India for platonic company — movies, hangouts, and events with verified companions.',
    keywords: ['rent a friend India', 'friend for hire', 'find a buddy'],
    directAnswer:
      'Yes, you can rent a friend in India on Buddy Search by hiring a verified companion for a plan you choose. It means platonic company for activities, not romance and not a fake social-media friend.',
    explanation:
      '“Rent a friend” and “friend for hire” are how people search when they want paid, time-bound company. Buddy Search does that as a friendship companionship platform: you pay for time and presence at an activity. You do not buy a personal relationship. Rates are set by the Buddy.',
    steps: [
      { name: 'Say the activity, not “be my friend”', text: 'Clear plans work better: cafe, movie, gym, or a walk.' },
      { name: 'Hire for a set time', text: 'Agree hours and the rate in chat so both sides know the end time.' },
      { name: 'Treat it as company, not a date', text: 'Keep the outing public and respectful.' },
    ],
    examples: [
      'Cafe buddy for two hours in Mumbai.',
      'Shopping buddy to help pick a wedding outfit in Delhi.',
    ],
    faqs: [
      {
        q: 'Can I rent a friend in India?',
        a: 'Yes. On Buddy Search you hire a verified companion for a specific activity and time. That is platonic paid company, not dating.',
      },
      {
        q: 'Is rent a friend legal?',
        a: 'Paying someone for lawful social company is treated as a service you both agree to. Illegal activities and dating-for-pay are not allowed on Buddy Search.',
      },
      {
        q: 'How is this different from hiring an escort?',
        a: 'Buddy Search only allows friendship and shared activities. Sexual services are banned and accounts that break that rule are removed.',
      },
    ],
  },
  {
    slug: 'social-companion-booking',
    query: 'How do I book a social companion in India?',
    title: 'Book a social companion in India',
    description:
      'Book a social companion in India on Buddy Search for dinners, events, and everyday plans. Verified, friendship-first companions.',
    keywords: ['social companion booking', 'social companionship platform', 'book a companion India'],
    directAnswer:
      'You book a social companion in India on Buddy Search by posting your event or hangout and accepting a verified Buddy. Booking means a planned, platonic outing — dinner, a wedding guest plus-one for company, or a city walk — not a date.',
    explanation:
      'Social companion booking is useful when you need a plus-one energy without calling in a favour. You describe the dress code, hours, and city. The companion shows up as a friendly guest. You both leave when the booking ends.',
    steps: [
      { name: 'Describe the event', text: 'Place, time, dress, and whether you need quiet company or lots of talk.' },
      { name: 'Share must-knows in chat', text: 'Names of hosts, how you will introduce the Buddy, and when it ends.' },
      { name: 'Meet at the venue', text: 'Public entry points work best. Keep payment terms written in chat.' },
    ],
    faqs: [
      {
        q: 'How do I book a social companion in India?',
        a: 'Create a Buddy Search plan, choose a verified profile, and confirm details in chat. That is your booking.',
      },
      {
        q: 'Can I book a companion for a family event?',
        a: 'Yes, if everyone is comfortable and the Buddy agrees. Be honest in the post about the setting.',
      },
    ],
  },
  {
    slug: 'activity-partner',
    query: 'How do I find an activity partner in India?',
    title: 'Find an activity partner in India',
    description:
      'Find an activity partner in India on Buddy Search for gym, gaming, shopping, dance, and hobbies. Hire by the hour.',
    keywords: ['activity partner rental', 'gym buddy India', 'gaming buddy'],
    directAnswer:
      'You find an activity partner in India on Buddy Search by picking a category like gym, gaming, shopping, or dance and hiring a verified Buddy for those hours. You pay for shared activity time, not for a long-term coach unless the Buddy offers that.',
    explanation:
      'Activity partner rental means you rent time with someone who already likes that hobby. It is more flexible than joining a class. Intern and interview buddy options also exist if you need practice, not a workout.',
    steps: [
      { name: 'Pick one activity', text: 'Gym, dance, gaming, photography, or shopping — one focus per plan works best.' },
      { name: 'Set skill level', text: 'Say if you are a beginner so the Buddy knows the pace.' },
      { name: 'Book a short first session', text: 'Start with one or two hours, then repeat if it fits.' },
    ],
    table: {
      caption: 'Popular activity partners',
      headers: ['Category', 'Starting rate (typical)'],
      rows: [
        ['Gym / fitness buddy', '₹1,000/hr'],
        ['Gaming buddy', '₹1,000/hr'],
        ['Shopping buddy', '₹1,000/hr'],
        ['Intern or interview buddy', '₹300–₹500/hr'],
      ],
    },
    faqs: [
      {
        q: 'How do I find an activity partner in India?',
        a: 'Post the hobby on Buddy Search and hire a verified Buddy in that category. Agree the session length in chat.',
      },
      {
        q: 'Is an activity partner a personal trainer?',
        a: 'Only if their profile says so. Many Buddies are company for the session, not certified coaches.',
      },
    ],
  },
  {
    slug: 'become-a-buddy',
    query: 'How do I become a Buddy and earn?',
    title: 'Become a Buddy and earn in India',
    description:
      'Become a Buddy on Buddy Search to earn for movies, travel, and hangouts. Set your rates, verify your ID, and accept plans nearby.',
    keywords: ['become a buddy', 'earn as companion India', 'friendship companionship platform'],
    directAnswer:
      'You become a Buddy on Buddy Search by signing up, verifying your profile, and accepting plans that match your time and city. You earn the activity fee you set — often a few hundred to about ₹2,000 per hour — while the platform membership is separate.',
    explanation:
      'Buddies are people who like going out and can offer reliable, respectful company. You choose movie, travel, cafe, or other tags. Clients find you in discovery. Chat stays in the app until you meet.',
    steps: [
      { name: 'Sign up as a Buddy', text: 'Create an account and say which activities you offer.' },
      { name: 'Verify and set rates', text: 'Complete ID checks and write a clear hourly or event rate.' },
      { name: 'Accept nearby plans', text: 'Only take outings you can do on time. Agree pay in chat first.' },
    ],
    faqs: [
      {
        q: 'How do I become a Buddy and earn?',
        a: 'Join Buddy Search, verify your ID, list your activities and rates, then accept plans. You get paid as agreed with the client.',
      },
      {
        q: 'How much can a Buddy earn?',
        a: 'Rates are yours to set. Hangouts often sit around ₹500–₹1,500/hr. Events and travel can go up to about ₹2,000/hr.',
      },
    ],
  },
];

export const AEO_BY_SLUG = Object.fromEntries(AEO_ARTICLES.map((article) => [article.slug, article]));

export function aeoPath(slug: string) {
  return `/answers/${slug}`;
}
