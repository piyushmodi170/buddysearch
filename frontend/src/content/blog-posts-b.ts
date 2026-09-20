import type { BlogPost } from '../lib/blog-types';

const DATE = '2026-09-20';

export const BLOG_POSTS_B: BlogPost[] = [
  {
    slug: 'new-city-find-companions-india',
    title: 'New in town: how to find companions in an Indian city',
    description:
      'Moved to Bangalore, Mumbai, Delhi, or Hyderabad? Use Buddy Search to find a cafe buddy, movie buddy, or hangout companion without forcing workplace friends.',
    keywords: ['new in city India', 'find companions Bangalore', 'friends in a new city'],
    date: DATE,
    category: 'Hangouts',
    query: 'How do I find companions after moving to a new city in India?',
    directAnswer:
      'Post short, public plans on Buddy Search in your new neighbourhood — cafe, movie, walk, or gym. Verified companions join for a set time, so you get company without waiting months for an office circle to form.',
    sections: [
      {
        heading: 'The first 30 days',
        paragraphs: [
          'A new city is loud and quiet at the same time. You have shops and metros, but no default Saturday person. Workplace lunches help some people. They do not help if you work remote, joined mid-quarter, or simply want a life outside office politics.',
          'Treat companionship like you treat a gym: small, repeating sessions. Two cafe hours a week beats one huge plan you cancel because it felt too big.',
        ],
      },
      {
        heading: 'Neighbourhood-first posts',
        paragraphs: [
          'Write the area, not only the metro name. “Indiranagar 12th Main cafe, 5 pm” is easier to accept than “Bangalore hangout.” Repeat the same area so faces become familiar on your terms.',
        ],
        bullets: [
          'Weekday evenings for working people.',
          'Sunday mornings for walks.',
          'One film a month so you have a ritual.',
        ],
      },
      {
        heading: 'What not to do',
        paragraphs: [
          'Do not invite a first-time Buddy home. Do not use the platform to process a breakup as dating. Do not expect one person to replace a whole friend group in a week.',
        ],
      },
    ],
    steps: [
      { name: 'Pick one neighbourhood', text: 'Stay within a short cab or metro ride for month one.' },
      { name: 'Post two small plans', text: 'Cafe plus one movie is enough.' },
      { name: 'Repeat who was on time', text: 'Rebook people who respected the clock and the brief.' },
    ],
    faqs: [
      {
        q: 'How do I find companions after moving to a new city in India?',
        a: 'Use Buddy Search to post cafe, walk, or movie plans in your area. Meet in public with verified Buddies.',
      },
      {
        q: 'Is this only for big metros?',
        a: 'No. Matches depend on who is nearby. Smaller cities can still work if you post clearly.',
      },
      {
        q: 'I am introverted. Will this feel intense?',
        a: 'Keep the first plan to 60–90 minutes in a cafe. You can leave on time without drama.',
      },
      {
        q: 'Can I find a travel partner after I settle?',
        a: 'Yes. Once you know your weekends, post a day trip. See the travel buddy guide.',
      },
    ],
    related: ['cafe-buddy-india', 'find-travel-buddy-india', 'hire-a-buddy-in-india-complete-guide'],
  },
  {
    slug: 'rajasthan-travel-companion',
    title: 'Travel companion for Rajasthan: forts, trains, and day plans',
    description:
      'Book a reliable travel companion for Rajasthan on Buddy Search. Plan Jaipur, Jodhpur, Udaipur, or Jaisalmer with a verified buddy and your own hotels.',
    keywords: ['Rajasthan travel companion', 'Jaipur travel buddy', 'india travel partner'],
    date: DATE,
    category: 'Travel',
    query: 'Where can I book a travel companion for Rajasthan?',
    directAnswer:
      'Book a Rajasthan travel companion on Buddy Search by posting cities, dates, and whether you need day sightseeing or train company. Keep your own hotel, meet in public, and hire a verified Buddy for the hours you want.',
    sections: [
      {
        heading: 'Why Rajasthan is a common search',
        paragraphs: [
          'Forts, palaces, and long gaps between trains make people want company. A full tour package is one option. A buddy is another: you keep the itinerary, they join the walking hours.',
        ],
      },
      {
        heading: 'Sample ways to split the trip',
        paragraphs: ['You do not have to hire someone for every hour of a 7-day loop.'],
        bullets: [
          'Jaipur old city day with a buddy, evenings free.',
          'Jodhpur fort + clock tower market, then your hotel.',
          'Udaipur lake walk and cafe, not a late-night desert camp on plan one.',
          'Station meet for a daylight Jaipur–Jodhpur train.',
        ],
      },
      {
        heading: 'Heat, walking, and dress',
        paragraphs: [
          'Say if you need a slow pace, shade stops, and modest dress for temples. Write whether you want photography help. Do not assume the Buddy is a licensed guide inside a fort. Official guides are a separate fee at many monuments.',
        ],
      },
    ],
    steps: [
      { name: 'List the circuit', text: 'Example: Jaipur 2 days, Jodhpur 1 day.' },
      { name: 'Book your stay first', text: 'Share only the area, not the room number, until you meet.' },
      { name: 'Hire daylight hours', text: 'Start with 10 am–5 pm blocks.' },
      { name: 'Pay as agreed', text: 'Write monument tickets vs Buddy rate separately.' },
    ],
    table: {
      caption: 'Rajasthan plan ideas',
      headers: ['City', 'Public first meet', 'Buddy hours idea'],
      rows: [
        ['Jaipur', 'Hawa Mahal / metro area cafe', 'City palace + bazaar'],
        ['Udaipur', 'Lake Pichola cafe', 'Ghats and old town walk'],
        ['Jaisalmer', 'Hotel lobby (not dunes first)', 'Fort interior, daylight'],
      ],
    },
    faqs: [
      {
        q: 'Where can I book a travel companion for Rajasthan?',
        a: 'Post dates and cities on Buddy Search. Hire a verified travel buddy for sightseeing hours.',
      },
      {
        q: 'Will the Buddy drive me?',
        a: 'Only if they offer driving and you agree. Otherwise use a taxi or driver you book yourself.',
      },
      {
        q: 'Is desert camping a good first plan?',
        a: 'No. Keep the first booking in town, in daylight. Add camps only after you trust the person.',
      },
      {
        q: 'Do I need a local Buddy or a co-traveller?',
        a: 'Say which you want. A local knows the lanes. A co-traveller is on the same train as you.',
      },
    ],
    related: ['find-travel-buddy-india', 'is-hiring-a-companion-safe-india', 'cost-to-hire-companion-india'],
  },
  {
    slug: 'interview-intern-buddy',
    title: 'Interview buddy and intern buddy: practice without a coaching ad',
    description:
      'Hire an interview buddy or intern buddy on Buddy Search for mock interviews, campus stories, and beginner career hangouts in India.',
    keywords: ['interview buddy', 'intern buddy India', 'mock interview companion'],
    date: DATE,
    category: 'Work',
    query: 'Can I hire an interview buddy in India?',
    directAnswer:
      'Yes. On Buddy Search you can hire an interview buddy for mock questions and timed practice, or an intern buddy for beginner work talk. It is paid practice time, not a guaranteed job and not a fake HR round.',
    sections: [
      {
        heading: 'Interview buddy',
        paragraphs: [
          'You share the role (SDE intern, sales, campus placement). The Buddy asks questions, times your answers, and gives plain feedback. Rates are often lower than a full coaching institute because this is a session, not a course.',
        ],
      },
      {
        heading: 'Intern buddy',
        paragraphs: [
          'New grads sometimes want someone who has done internships and can talk about managers, slack, and first-week nerves. That is company and stories. It is not a placement cell.',
        ],
      },
      {
        heading: 'How to keep it useful',
        paragraphs: [
          'Send the job description in chat. Agree a 45- or 60-minute slot. Record only if both say yes. Do not ask the Buddy to impersonate a real company.',
        ],
      },
    ],
    steps: [
      { name: 'Share the JD', text: 'Role, company type, and round (HR, tech, case).' },
      { name: 'Book a quiet cafe or video', text: 'Say which in the post. Public cafe still works for HR mocks.' },
      { name: 'End with notes', text: 'Three things to fix. Not a 20-page report unless you paid for that.' },
    ],
    table: {
      caption: 'Typical rates',
      headers: ['Plan', 'Starting band'],
      rows: [
        ['Intern buddy hangout', '₹300/hr'],
        ['Interview buddy mock', '₹500/hr'],
      ],
    },
    faqs: [
      {
        q: 'Can I hire an interview buddy in India?',
        a: 'Yes, on Buddy Search. Book a timed mock. It does not guarantee a job offer.',
      },
      {
        q: 'Will they leak my resume?',
        a: 'Share only what you are willing to show. Prefer in-app chat over random email dumps.',
      },
      {
        q: 'Is this a replacement for a career coach?',
        a: 'No. It is practice with a person. Certified coaching is a different product.',
      },
    ],
    related: ['become-a-buddy-earn-india', 'gym-fitness-buddy-india', 'hire-a-buddy-in-india-complete-guide'],
  },
  {
    slug: 'cost-to-hire-companion-india',
    title: 'How much does it cost to hire a companion in India?',
    description:
      'Buddy Search membership starts from ₹249. Buddy hourly rates are separate, often ₹300 to ₹2,000. See what you pay for movies, travel, and hangouts.',
    keywords: ['cost to hire a companion India', 'buddy search price', 'friend for hire cost'],
    date: DATE,
    category: 'Pricing',
    query: 'How much does it cost to hire a buddy in India?',
    directAnswer:
      'You pay two things: Buddy Search membership for platform access (from ₹249) and the Buddy’s activity fee, which they set — often ₹300 to ₹2,000 per hour. Tickets, food, and travel are usually extra unless chat says otherwise.',
    sections: [
      {
        heading: 'Membership vs Buddy fee',
        paragraphs: [
          'Membership is how you post plans and browse. It is billed as Basic, Standard, Premium, or Star. The Buddy does not receive that membership fee as their hourly wage.',
          'The activity fee is the number you should ask in the first messages: “What is your rate for a 3-hour movie plan in Andheri?”',
        ],
      },
      {
        heading: 'What changes the rate',
        paragraphs: [
          'Late nights, festivals, long travel, and last-minute plans cost more. A Tuesday cafe costs less than a New Year outing. Experience and verification can also sit at the higher end of a band.',
        ],
      },
      {
        heading: 'How to avoid surprise bills',
        paragraphs: [
          'Write hours, overtime, cab, and tickets as four lines in chat. If someone refuses to write a number, do not meet.',
        ],
      },
    ],
    steps: [
      { name: 'Check membership', text: 'See current plans on the membership page after you log in.' },
      { name: 'Ask the hourly number', text: 'Get it in chat before you travel.' },
      { name: 'Cap the hours', text: '“We end at 6 pm even if the mall is open.”' },
    ],
    table: {
      caption: 'Cost stack example (illustrative)',
      headers: ['Item', 'Who pays', 'Example'],
      rows: [
        ['Membership', 'You, to the platform', 'From ₹249'],
        ['Buddy time', 'You, to the Buddy', '₹1,000 × 3 hours'],
        ['Movie ticket', 'Each person or as agreed', 'Show price'],
        ['Snacks', 'Usually each person', 'Food court'],
      ],
    },
    faqs: [
      {
        q: 'How much does it cost to hire a buddy in India?',
        a: 'Membership from ₹249 plus the Buddy’s rate, often ₹300–₹2,000/hr. Extras like tickets are separate.',
      },
      {
        q: 'Is Star membership lifetime?',
        a: 'Star is sold as pay-once lifetime access on the pricing page. Confirm the live offer when you check out.',
      },
      {
        q: 'Can I tip?',
        a: 'Only if you want to, after a good plan, and only as you both agree.',
      },
      {
        q: 'Why did my create-order fail?',
        a: 'That is a checkout issue, not the Buddy’s hourly rate. Try again or contact support from the app.',
      },
    ],
    related: ['buddy-search-membership-plans', 'hire-a-buddy-in-india-complete-guide', 'become-a-buddy-earn-india'],
  },
  {
    slug: 'is-hiring-a-companion-safe-india',
    title: 'Is it safe to hire a companion in India?',
    description:
      'Hiring a companion is safer when you use ID-verified profiles, public meets, in-app chat, and a written plan. Here is a practical safety checklist for Buddy Search.',
    keywords: ['is hiring a companion safe', 'buddy search safety', 'verified companion India'],
    date: DATE,
    category: 'Safety',
    query: 'Is it safe to hire a companion in India?',
    directAnswer:
      'It is safer when you hire an ID-verified Buddy, meet in public, keep chat in the app, and leave if the plan changes. Verification reduces risk. It does not make any person 100% safe, so you still use normal street sense.',
    sections: [
      {
        heading: 'What Buddy Search does',
        paragraphs: [
          'Buddies go through ID verification. You can see badges, report abuse, and keep the first conversation on the platform. The company is a technology layer. It does not sit at the table with you.',
        ],
      },
      {
        heading: 'What you must still do',
        paragraphs: ['Safety is shared. Your habits matter as much as a badge.'],
        bullets: [
          'Video or voice in app if you need extra comfort before a long trip.',
          'Public first meet. Always.',
          'Own ride home.',
          'Emergency contact who has the venue name.',
          'No money beyond the written rate.',
        ],
      },
      {
        heading: 'Red flags',
        paragraphs: [
          'Moving you off the app immediately, asking for intimate photos, refusing a public place, showing up with extra people, or pushing alcohol. End it. Report it.',
        ],
      },
    ],
    steps: [
      { name: 'Check verification', text: 'Do not skip this to save an hour.' },
      { name: 'Write the meet pin', text: 'A Maps link in chat is a safety tool.' },
      { name: 'Tell someone', text: 'Name, time, venue.' },
      { name: 'Have an exit', text: 'Know the metro or cab stand before you sit down.' },
    ],
    faqs: [
      {
        q: 'Is it safe to hire a companion in India?',
        a: 'Use verified profiles, public places, and in-app chat. That is the safe pattern. No platform can promise zero risk.',
      },
      {
        q: 'Does verification mean police-checked?',
        a: 'It means identity checks the product runs. It is not a government character certificate.',
      },
      {
        q: 'What if something goes wrong?',
        a: 'Get to a safe place first. Then report in the app and contact local emergency services if needed.',
      },
      {
        q: 'Can I ask for a same-gender Buddy?',
        a: 'State the preference in the plan if it helps you feel safe. Keep the request about comfort, not discrimination in other illegal ways.',
      },
    ],
    related: ['night-out-buddy-safety', 'hire-a-buddy-in-india-complete-guide', 'find-travel-buddy-india'],
  },
  {
    slug: 'social-companion-events-india',
    title: 'Book a social companion for dinners and events in India',
    description:
      'Need a plus-one for a mixer, dinner, or work event without dating? Book a social companion on Buddy Search with a clear brief and end time.',
    keywords: ['social companion booking', 'plus one companion India', 'event buddy'],
    date: DATE,
    category: 'Events',
    query: 'How do I book a social companion in India?',
    directAnswer:
      'You book a social companion in India on Buddy Search by describing the event, dress code, hours, and how you will introduce them. A verified Buddy joins as friendly company — not as a fake partner.',
    sections: [
      {
        heading: 'Events this fits',
        paragraphs: [
          'Alumni mixers, industry meetups, gallery openings, weddings where you need a friend not a date, and long dinners where empty chairs feel awkward. Tell the truth about the room. Surprises at the door are how plans fail.',
        ],
      },
      {
        heading: 'The introduction script',
        paragraphs: [
          'Agree a simple line: “This is my friend from Buddy Search, we are here for the panel.” Do not invent a college or a job. Lying pulls the Buddy into a story they did not accept.',
        ],
      },
      {
        heading: 'Weddings and family rooms',
        paragraphs: [
          'Only book this if elders will not be told it is a relationship. Fake shaadi dates are not allowed. A cousin-level friend energy is the maximum, and only with full honesty.',
        ],
      },
    ],
    steps: [
      { name: 'Write the brief', text: 'Venue, time, dress, who will be there, when it ends.' },
      { name: 'Share the invite name', text: 'Security lists matter. Use real names.' },
      { name: 'Meet outside', text: 'Lobby or gate, then walk in together.' },
      { name: 'Leave together or separately as agreed', text: 'Write the exit in chat.' },
    ],
    faqs: [
      {
        q: 'How do I book a social companion in India?',
        a: 'Post the event details on Buddy Search, pick a verified Buddy, and confirm the introduction line in chat.',
      },
      {
        q: 'Can they pretend to be my partner?',
        a: 'No. That is a fake relationship booking and is not allowed.',
      },
      {
        q: 'Who pays the cover charge?',
        a: 'Usually you, unless the Buddy wants to pay their own. Write it down.',
      },
    ],
    related: ['rent-a-friend-india-guide', 'buddy-search-vs-dating-apps', 'night-out-buddy-safety'],
  },
  {
    slug: 'activity-partner-hobbies-india',
    title: 'Activity partners in India: gaming, dance, photography, and more',
    description:
      'Find an activity partner in India on Buddy Search for gaming, dance, photography, driving practice company, and hobbies. Hire by the hour.',
    keywords: ['activity partner rental', 'gaming buddy India', 'dance buddy'],
    date: DATE,
    category: 'Hobbies',
    query: 'How do I find an activity partner in India?',
    directAnswer:
      'You find an activity partner in India by posting one hobby on Buddy Search — gym, gaming, dance, photography, language, or driving company — and hiring a verified Buddy for a short first session.',
    sections: [
      {
        heading: 'One hobby per post',
        paragraphs: [
          '“Fun person for anything” is hard to accept. “Beginner salsa, Andheri, Saturday 6 pm” is easy. You can post a second hobby tomorrow.',
        ],
      },
      {
        heading: 'Popular activity tags',
        paragraphs: [
          'Gaming buddy for ranked nights in a cafe. Dance buddy for class company. Photography buddy for a daylight walk. Language buddy for spoken practice. Driving buddy for confidence in traffic — not a substitute for a licensed instructor if you are learning from zero.',
        ],
      },
      {
        heading: 'Gear and venues',
        paragraphs: [
          'Say who brings the camera, whether the gaming cafe is booked, and if the dance studio allows guests. Extra tickets are not hidden inside the hourly rate unless you write that.',
        ],
      },
    ],
    steps: [
      { name: 'Name the hobby and level', text: 'Beginner, intermediate, or casual.' },
      { name: 'Book 60–90 minutes', text: 'Extend only if both want to.' },
      { name: 'Meet at the venue desk', text: 'Studio, cafe, or park gate.' },
    ],
    table: {
      caption: 'Hobby examples',
      headers: ['Tag', 'First session idea'],
      rows: [
        ['Gaming', 'Two hours at a known cafe'],
        ['Photography', 'Old city walk before sunset'],
        ['Language', 'Cafe conversation hour'],
        ['Dance', 'One class as guest'],
      ],
    },
    faqs: [
      {
        q: 'How do I find an activity partner in India?',
        a: 'Post one hobby and time on Buddy Search. Hire a verified Buddy for that session.',
      },
      {
        q: 'Can a driving buddy replace driving school?',
        a: 'No. Use a licensed school to learn. A buddy is extra company once you are legal to practise.',
      },
      {
        q: 'What about photography in crowded places?',
        a: 'Follow local rules. Do not photograph people who do not want to be in the frame.',
      },
    ],
    related: ['gym-fitness-buddy-india', 'become-a-buddy-earn-india', 'cafe-buddy-india'],
  },
  {
    slug: 'buddy-search-membership-plans',
    title: 'Buddy Search membership plans: Basic, Standard, Premium, Star',
    description:
      'Compare Buddy Search membership: Basic from ₹249, Standard, Premium, and Star. See what you get for posting plans and discovery in India.',
    keywords: ['buddy search membership', 'buddy search pricing', 'star member'],
    date: DATE,
    category: 'Pricing',
    query: 'What are Buddy Search membership plans?',
    directAnswer:
      'Buddy Search sells platform membership — Basic, Standard, Premium, and Star — so you can post plans and appear in discovery. Membership is not the Buddy’s hourly fee. Live prices are on the site and start from ₹249 for Basic in current offers.',
    sections: [
      {
        heading: 'What membership is for',
        paragraphs: [
          'Without membership you cannot use the paid product surfaces the way members do. With it you can post plans, browse companions, and use chat flows the product unlocks for that tier.',
        ],
      },
      {
        heading: 'How to choose',
        paragraphs: [
          'If you will post a few cafe or movie plans, Basic may be enough. If you want more posts and better placement, look at Standard or Premium. Star is the pay-once lifetime option when it is on offer.',
        ],
      },
      {
        heading: 'Refunds',
        paragraphs: [
          'Check the live terms. Many memberships are not refunded mid-cycle. Cancel if you do not want the next bill, where billing applies.',
        ],
      },
    ],
    steps: [
      { name: 'Open Pricing or Membership', text: 'On the public homepage or inside the app after login.' },
      { name: 'Match posts per month', text: 'Count how often you will actually go out.' },
      { name: 'Pay only on buddysearch.online', text: 'Do not send UPI to random profiles for “membership.”' },
    ],
    table: {
      caption: 'Plan snapshot (see live checkout for the offer of the day)',
      headers: ['Plan', 'Positioning', 'Starting public price'],
      rows: [
        ['Basic', 'Try at your own pace', '₹249'],
        ['Standard', 'More plans, more visibility', '₹349'],
        ['Premium', 'Higher placement, badge', '₹449'],
        ['Star', 'Lifetime access when offered', '₹649'],
      ],
    },
    faqs: [
      {
        q: 'What are Buddy Search membership plans?',
        a: 'Basic, Standard, Premium, and Star. They unlock posting and discovery. Buddy hourly rates are extra.',
      },
      {
        q: 'Does Premium include unlimited Buddies?',
        a: 'It raises your posting and placement limits. It does not make activity fees free.',
      },
      {
        q: 'Where do I pay?',
        a: 'Only through official checkout on buddysearch.online with the listed payment partner.',
      },
    ],
    related: ['cost-to-hire-companion-india', 'how-to-post-a-plan-buddy-search', 'become-a-buddy-earn-india'],
  },
  {
    slug: 'how-to-post-a-plan-buddy-search',
    title: 'How to post a plan on Buddy Search (with examples)',
    description:
      'Post a clear Buddy Search plan: activity, city, time, budget, and boundaries. Copy example posts for movies, travel, cafe, and gym.',
    keywords: ['post a plan buddy search', 'hire a buddy post', 'activity request'],
    date: DATE,
    category: 'Guides',
    query: 'How do I post a plan on Buddy Search?',
    directAnswer:
      'Log in, open the flow to post a plan, and write the activity, city, time, hours, and what you will pay. Clear posts get faster replies from verified Buddies.',
    sections: [
      {
        heading: 'The five-line post',
        paragraphs: ['If you only remember one template, use this.'],
        bullets: [
          'Activity and tag (Movie / Travel / Cafe / Gym).',
          'Area and Maps-friendly landmark.',
          'Day and start time.',
          'Hours and end time.',
          'Budget band and who pays tickets.',
        ],
      },
      {
        heading: 'Example posts you can copy',
        paragraphs: [
          'Movie: “Brahmastra-style blockbuster, PVR Phoenix Pune, Sat 7:10 pm, I will book my seat, looking for a Movie Buddy for the show plus 20 min debrief, verified only.”',
          'Cafe: “Indiranagar cafe, Sun 4–6 pm, quiet conversation, Cafe Buddy, ₹ range as per your profile.”',
          'Travel: “Jaipur Saturday only, Amber Fort daylight, I have my hotel, need a travel companion 10–5, tickets extra.”',
        ],
      },
      {
        heading: 'Words that slow replies',
        paragraphs: [
          '“Any time,” “whatever,” “looking for a vibe,” and dating hints. Replace them with a clock and a place.',
        ],
      },
    ],
    steps: [
      { name: 'Log in and verify email', text: 'Unverified accounts should finish OTP first.' },
      { name: 'Open post plan', text: 'Inside the member app after membership if required.' },
      { name: 'Use one tag', text: 'Movie or travel, not both in one messy paragraph.' },
      { name: 'Reply to verified Buddies', text: 'Ask the rate. Write the meet pin.' },
    ],
    faqs: [
      {
        q: 'How do I post a plan on Buddy Search?',
        a: 'After you log in, create a plan with activity, city, time, and budget. Keep it platonic and specific.',
      },
      {
        q: 'Why did nobody reply?',
        a: 'The time may be too soon, the area too wide, or the post may look like dating. Rewrite with a pin and a clock.',
      },
      {
        q: 'Can I post every day?',
        a: 'Your membership tier sets monthly post limits. Check the plan you bought.',
      },
    ],
    related: ['hire-a-buddy-in-india-complete-guide', 'movie-buddy-hire-india', 'buddy-search-membership-plans'],
  },
  {
    slug: 'friendship-companionship-platform-india',
    title: 'What a friendship companionship platform is (Buddy Search)',
    description:
      'Buddy Search is India’s friendship-first social companionship platform: hire or become a verified companion for activities, not dates.',
    keywords: ['friendship companionship platform', 'social companionship India', 'buddy search'],
    date: DATE,
    category: 'Guides',
    query: 'What is a friendship companionship platform?',
    directAnswer:
      'A friendship companionship platform connects people for shared activities with clear time and pay, without dating. Buddy Search is that product for India: hire a verified Buddy or become one.',
    sections: [
      {
        heading: 'The product in one paragraph',
        paragraphs: [
          'You have a plan. You need company. Someone nearby likes that plan and can do those hours. You agree a rate. You meet in public. You leave on time. That loop is the whole company, repeated across movies, travel, cafes, gyms, and events.',
        ],
      },
      {
        heading: 'Who it serves',
        paragraphs: [
          'Introverted people who still want a Saturday film. Students and professionals new to a city. Travellers who do not want a 40-person bus. Buddies who want to earn from skills they already have — showing up, talking, walking, watching, spotting at the gym.',
        ],
      },
      {
        heading: 'Official website',
        paragraphs: [
          'Use https://buddysearch.online. buddysearch.in redirects to that host. Do not pay membership to chat profiles on random sites that copy the name.',
        ],
      },
    ],
    steps: [
      { name: 'Read how it works', text: 'Hire path vs become-a-Buddy path.' },
      { name: 'Create an account', text: 'Verify email.' },
      { name: 'Start with a public plan', text: 'Cafe or movie before overnight travel.' },
    ],
    faqs: [
      {
        q: 'What is a friendship companionship platform?',
        a: 'It is a product that books platonic company for real activities. Buddy Search is India’s version of that.',
      },
      {
        q: 'Is Buddy Search the same as rent-a-friend?',
        a: 'Rent-a-friend is the search phrase. The allowed product is timed, platonic activity company — not a fake relationship.',
      },
      {
        q: 'Where do I start?',
        a: 'Open buddysearch.online, create an account, and post one clear plan.',
      },
    ],
    related: ['hire-a-buddy-in-india-complete-guide', 'rent-a-friend-india-guide', 'buddy-search-vs-dating-apps'],
  },
];
