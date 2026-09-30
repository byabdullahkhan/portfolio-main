export interface TimelineMilestone {
  id: string;
  year: string;
  title: string;
  summary: string;
  fullStory: string;
  handle: string;
  timeAgo: string;
  badgeType: 'avatar' | 'webflow' | 'fiftyseven' | 'gsap' | 'clients' | 'family' | 'creator';
  side: 'right' | 'left';
}

export interface ProjectItem {
  id: string;
  number: string;
  title: string;
  description: string;
  tags: string[];
  liveUrl: string;
  deviceType: 'tablet' | 'phone';
  accentColor: string;
  previewHeadline: string;
  previewSubtext: string;
  bgTheme: 'purple-bio' | 'dark-chip' | 'warm-ring' | 'forest-gov' | 'amber-library' | 'neon-crypto' | 'clean-hr' | 'estate-mobile' | 'dark-ai';
}

export interface ServiceTier {
  id: string;
  iconType: 'bolt' | 'layers' | 'sparkles';
  name: string;
  price: string;
  priceSub?: string;
  description: string;
  features: string[];
  idealFor: string;
}

export interface TestimonialItem {
  id: string;
  headline: string;
  quote: string;
  authorName: string;
  authorRole: string;
  companyName: string;
  companyUrl: string;
  avatarInitials: string;
  avatarBg: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  column: 'left' | 'right';
}

export const portfolioConfig = {
  brand: {
    wordmark: 'ABDULLAH',
    registeredSymbol: '®',
    fullName: 'Abdullah Khan',
    firstName: 'Abdullah',
    heroPortraitUrl: '/src/assets/images/abdullah_cutout_portrait_1790751984522.jpg',
    roleTagline: "The Webflow Expert.\nThat's Abdullah.",
    heroHeadline: 'Webflow,\nApplied\nDifferently.',
    shortBio:
      'Working closely with your team to deliver Webflow builds that merge creativity, technical excellence, and long-term value.',
    email: 'byabdullahkhan@gmail.com',
    bookingUrl: '#book-call',
    linkedinUrl: 'https://linkedin.com',
    twitterUrl: 'https://x.com',
  },

  stats: {
    projectsCount: '80+',
    projectsLabel: 'Projects',
    experienceYears: '7+',
    experienceLabel: 'Years of\nexperience',
  },

  heroTraits: [
    { label: 'Creative', icon: 'sparkle' },
    { label: 'Reliable', icon: 'shield' },
    { label: 'Strategist', icon: 'compass' },
    { label: 'Builder', icon: 'cube' },
    { label: 'Efficient', icon: 'zap' },
  ],

  clientLogos: [
    'fiftyseven',
    'CURRI',
    'omicron',
    'puck',
    'alosant',
    'Happy Ring',
    'INVERT',
  ],

  journey: {
    kicker: 'START SMALL. GROW BIG.',
    headingMain: 'About Me',
    headingMuted: '(&)',
    headingSecondLine: 'My Journey',
    subtitle:
      'Seven years ago I opened Webflow for the first time. What happened after that is easier to show than explain.',
    milestones: [
      {
        id: 'm-19',
        year: "'19",
        title: 'Starting out with my brother',
        summary:
          'My brother showed me Webflow. I bothered him with questions for three months straight. He probably regrets it.',
        fullStory:
          'In 2019, I was introduced to visual web development. Coming from traditional layouts, seeing box-model CSS update in real time was a revelation. Those first three months of relentless experimentation laid the foundation for everything that followed.',
        handle: '@mentor',
        timeAgo: '7years ago',
        badgeType: 'avatar',
        side: 'right',
      },
      {
        id: 'm-20',
        year: "'20",
        title: 'First freelance steps',
        summary:
          'First real client. First real panic. Working for yourself and working for someone else are completely different.',
        fullStory:
          'Taking on my first independent client project taught me more about communication, scoping, and deadline ownership in four weeks than any tutorial ever could. Once the initial panic faded, I realized how much I loved owning the entire delivery.',
        handle: '@webflow',
        timeAgo: '6years ago',
        badgeType: 'webflow',
        side: 'left',
      },
      {
        id: 'm-21',
        year: "'21",
        title: 'Beyond what I knew',
        summary:
          "A biotech project that made me think 'this isn't possible in Webflow.' Turns out it was.",
        fullStory:
          'Partnering with studio teams on high-craft biotech experiences pushed me deep into custom code integrations, complex WebGL/canvas layering, and rock-solid component systems inside Webflow.',
        handle: '@fiftyseven',
        timeAgo: '5years ago',
        badgeType: 'fiftyseven',
        side: 'left',
      },
      {
        id: 'm-22',
        year: "'22",
        title: 'Leveling up',
        summary:
          'The year animations and CMS stopped being extras and started shaping how every project feels.',
        fullStory:
          'Mastering GSAP ScrollTrigger, custom choreography, and relational multi-collection CMS architectures transformed my builds from static marketing pages into living digital products.',
        handle: '@gsap',
        timeAgo: '4years ago',
        badgeType: 'gsap',
        side: 'right',
      },
      {
        id: 'm-23',
        year: "'23",
        title: 'From trust to referrals',
        summary:
          "No pitch. No portfolio review. Just clients telling people 'work with Abdullah.' That hit different.",
        fullStory:
          'By 2023, word-of-mouth from founders, creative directors, and product teams became my primary growth engine. Reliability and sweating the unseen technical details built partnerships that lasted years.',
        handle: '@clients',
        timeAgo: '3years ago',
        badgeType: 'clients',
        side: 'right',
      },
      {
        id: 'm-24',
        year: "'24",
        title: 'A life-changing year',
        summary:
          'Big personal milestones and bigger ambitions. Suddenly everything I build has a deeper reason behind it.',
        fullStory:
          'Stepping into a new chapter brought crystal clarity to how I structure my workday, choose long-term partners, and bring calm, focused energy to every launch.',
        handle: '@family',
        timeAgo: '2years ago',
        badgeType: 'family',
        side: 'left',
      },
      {
        id: 'm-26',
        year: "'26",
        title: 'The journey continues',
        summary:
          'Seven years in. Still obsessed. Now figuring out how AI fits into what I do.',
        fullStory:
          'Seven years later, the craft is evolving faster than ever. Combining battle-tested frontend architecture with modern AI workflows to ship faster, smarter, and more ambitious web experiences.',
        handle: '@abdullah',
        timeAgo: '2hours ago',
        badgeType: 'creator',
        side: 'right',
      },
    ] as TimelineMilestone[],
  },

  projectsSection: {
    kicker: 'SELECTED WORK',
    heading: 'Built in Webflow,\nMade to Perform',
    description:
      "Over seven years I've helped businesses across different industries turn their ideas into websites that look and work exactly how they imagined. Here's a look at some of that work.",
    items: [
      {
        id: 'p-01',
        number: '01',
        title: '1910.ai',
        description:
          'Pioneering small and large molecule therapeutics discovery by integrating multimodal data.',
        tags: ['Components', 'GSAP', 'SEO'],
        liveUrl: 'https://www.1910.ai',
        deviceType: 'tablet',
        accentColor: '#A855F7',
        previewHeadline: 'Multimodal AI Platform for Modality-Agnostic Drug Discovery™',
        previewSubtext: '1910 Genetics · AI-Driven Biotechnology',
        bgTheme: 'purple-bio',
      },
      {
        id: 'p-02',
        number: '02',
        title: 'SemiconBio',
        description:
          'Fully realizing the promise of molecular electronics with the SemiconBio platform.',
        tags: ['CMS', 'API', 'Motion'],
        liveUrl: 'https://www.semiconbio.com',
        deviceType: 'phone',
        accentColor: '#38BDF8',
        previewHeadline: 'The SemiconBio Chip Partnership Program',
        previewSubtext: 'Molecular Action, Building Better',
        bgTheme: 'dark-chip',
      },
      {
        id: 'p-03',
        number: '03',
        title: 'Happy Ring',
        description:
          'With accuracy validated to strict standards and all-day comfort exceeding expectations.',
        tags: ['CMS', 'GSAP', 'SEO'],
        liveUrl: 'https://happyring.fiftyseven.co',
        deviceType: 'tablet',
        accentColor: '#F59E0B',
        previewHeadline: 'The future of healthcare is on your finger.',
        previewSubtext: 'Clinical-grade biometric smart ring',
        bgTheme: 'warm-ring',
      },
      {
        id: 'p-04',
        number: '04',
        title: 'PSSLTD',
        description:
          'With asset and inspection management purpose-built alongside UK councils for over 35 years, and a record every audit can stand behind.',
        tags: ['CMS', 'GSAP', 'Localization'],
        liveUrl: 'https://pssItd.co.uk',
        deviceType: 'phone',
        accentColor: '#10B981',
        previewHeadline: 'Some software was adapted to the task. Ours is built around it.',
        previewSubtext: 'UK Council Asset & Inspection Suite',
        bgTheme: 'forest-gov',
      },
      {
        id: 'p-05',
        number: '05',
        title: 'Lilipad',
        description:
          'With libraries that come to children where they are, and a quiet place to belong when stability of any kind is rare.',
        tags: ['CMS', 'GSAP', 'SEO'],
        liveUrl: 'https://www.lilipadlibrary.org',
        deviceType: 'tablet',
        accentColor: '#FBBF24',
        previewHeadline: 'Libraries give Go.',
        previewSubtext: 'We are a grassroots nonprofit',
        bgTheme: 'amber-library',
      },
      {
        id: 'p-06',
        number: '06',
        title: 'Omicron',
        description:
          'Omicron is a blockchain studio helping Web 3.0 players turn ideas into decentralized products.',
        tags: ['Webflow', 'Motion'],
        liveUrl: 'https://omicronblockchain.com',
        deviceType: 'phone',
        accentColor: '#818CF8',
        previewHeadline: 'BLOCKCHAIN & WEB 3.0 DEVELOPMENT STUDIO',
        previewSubtext: '$60M+ Digital Assets Secured',
        bgTheme: 'neon-crypto',
      },
      {
        id: 'p-07',
        number: '07',
        title: 'Puck',
        description:
          'Inbound talent solution with personal automation – from podcasts to smarter screening.',
        tags: ['Components', 'CMS', 'GSAP'],
        liveUrl: 'https://www.careerspuck.com',
        deviceType: 'tablet',
        accentColor: '#FACC15',
        previewHeadline: 'The inbound talent solution with personal automation',
        previewSubtext: 'Hear how teams hire faster with Puck',
        bgTheme: 'clean-hr',
      },
      {
        id: 'p-08',
        number: '08',
        title: 'Alosant',
        description:
          'The leading resident experience platform, elevates living by keeping residents and shoppers informed.',
        tags: ['Performance', 'CMS', 'API'],
        liveUrl: 'https://www.alosant.com',
        deviceType: 'phone',
        accentColor: '#FB923C',
        previewHeadline: 'Mobile Access Control',
        previewSubtext: 'Branded apps for master-planned communities',
        bgTheme: 'estate-mobile',
      },
      {
        id: 'p-09',
        number: '09',
        title: 'RAY AI',
        description:
          'With a full-time human assistant handpicked from the top 0.05% of applicants, and the AI fluency to give you your time and energy back.',
        tags: ['CMS', 'GSAP', 'SEO'],
        liveUrl: 'https://ray-ai.com',
        deviceType: 'tablet',
        accentColor: '#A3E635',
        previewHeadline: 'Executive leverage powered by elite talent & AI.',
        previewSubtext: 'Top 0.05% Dedicated Assistants',
        bgTheme: 'dark-ai',
      },
    ] as ProjectItem[],
  },

  whatYouGet: {
    heading: 'What\nYou Get?',
    kicker: 'CAPABILITIES OVERVIEW',
  },

  servicesSection: {
    kicker: 'SERVICES',
    heading: 'Solutions\nThat Deliver',
    subtitle:
      'Same quality, same attention to detail. The only difference is the size of the project and what you need right now.',
    tiers: [
      {
        id: 'tier-ongoing',
        iconType: 'bolt',
        name: 'Ongoing Support',
        price: '$3,000',
        priceSub: '/ 30hours',
        description:
          'Your dedicated Webflow developer, 30 hours a month. Whatever your site needs, handled. Minimum 3 month commitment.',
        features: [
          'New pages, sections, and features',
          'Campaign-driven updates (modules, content blocks, assets)',
          'Maintenance, bug fixes, and content updates',
          'Technical SEO and performance optimization',
          'Unused hours roll over (up to 3 months)',
        ],
        idealFor:
          'For brands that need continuous growth and long-term collaboration.',
      },
      {
        id: 'tier-starter',
        iconType: 'layers',
        name: 'Starter Build',
        price: '$5,000',
        description:
          'A clean Webflow site ready to launch in one to two weeks. Perfect for brands that need a solid online presence without the complexity.',
        features: [
          'Up to 6 pages',
          'CMS setup',
          'Mid-level animations and interactions',
          'Technical SEO setup',
          'Launch within one to two weeks',
          'Webflow Editor training after launch',
        ],
        idealFor:
          'For new sites or migrations that need a fast, clean start.',
      },
      {
        id: 'tier-custom',
        iconType: 'sparkles',
        name: 'Custom Project',
        price: 'Book a Call',
        description:
          'High-end Webflow development for complex projects. Every scope is different, so every project starts with a conversation.',
        features: [
          'Advanced interaction and animation systems',
          'Scalable CMS architecture with multi-collection setups',
          'Complex layouts, modular components and dynamic content',
          'Integration ready structure for external tools and API driven features',
          '14 days post-launch support included',
        ],
        idealFor:
          'For complex projects that go beyond the basics and need a tailored approach.',
      },
    ] as ServiceTier[],
    ctaBanner: {
      headingDark: 'Transform Your\nWebflow',
      headingMuted: 'Experience\nJourney',
      description:
        'Every Webflow site has room to grow. You get a clear view of what works, what holds you back and how to move toward a setup that feels faster, lighter and easier to manage.',
      chatPrompt: 'Have something in mind?',
      chatButtonLabel: "Let's Talk",
    },
  },

  testimonialsSection: {
    kicker: 'TESTIMONIALS',
    heading: "From People\nI've Worked with",
    items: [
      {
        id: 't-1',
        headline: 'Trusted\nlong-term collaborator.',
        quote:
          'Abdullah has been a fantastic partner to work with and continues to be an essential part of our team. He communicates clearly and promptly, and his work consistently exceeds expectations. He resolves technical challenges quickly and efficiently, always demonstrating skill, reliability, and a strong commitment to quality.',
        authorName: 'Danette Beal',
        authorRole: 'VP of Marketing',
        companyName: 'Alosant.com',
        companyUrl: 'https://alosant.com',
        avatarInitials: 'DB',
        avatarBg: '#2A3441',
      },
      {
        id: 't-2',
        headline: 'Thinks through\nthe entire experience.',
        quote:
          "Abdullah doesn't just code Webflow — he thinks through the experience. Motion, pacing, narrative flow, all aligned with technical excellence. The result is sites that feel cohesive, intentional, complete. A true partner in execution. No gaps, no compromises.",
        authorName: 'Petar Stojakovic',
        authorRole: 'Founder',
        companyName: 'fiftyseven.co',
        companyUrl: 'https://fiftyseven.co',
        avatarInitials: 'PS',
        avatarBg: '#1F2421',
      },
      {
        id: 't-3',
        headline: 'Reliable, skilled,\nand easy to work with.',
        quote:
          'Abdullah was great to work with! He delivered our websites on time, gave our design team helpful guidance, and suggested smarter solutions that really improved the final results. Super reliable and easy to collaborate with — highly recommend!',
        authorName: 'Klemen Vute',
        authorRole: 'PM Executive',
        companyName: 'Povio.com',
        companyUrl: 'https://povio.com',
        avatarInitials: 'KV',
        avatarBg: '#3B322C',
      },
      {
        id: 't-4',
        headline: 'The details that\nset him apart.',
        quote:
          "I've worked with Abdullah for many years, and he still surprises me with the speed and quality of his work. His attention to the small details, the ones most engineers overlook makes all the difference for great websites. He's reliable, fun to collaborate with, and consistently delivers beyond expectations. As long as he wants to work with us, we'll keep building together.",
        authorName: 'Johanna Dahlroos',
        authorRole: 'Co-Founder and Creative Director',
        companyName: 'Most Agency',
        companyUrl: '#',
        avatarInitials: 'JD',
        avatarBg: '#4A3531',
      },
      {
        id: 't-5',
        headline: 'Design-focused,\nreliable development.',
        quote:
          "We've hired Abdullah for several projects, and working with him has always been effortless thanks to his good understanding of design. He's dedicated to perfecting each delivery for our clients, ensuring a smooth and engaging web experience.",
        authorName: 'Marko Ivanovic',
        authorRole: 'Legacy Agency',
        companyName: 'Legacy Agency',
        companyUrl: '#',
        avatarInitials: 'MI',
        avatarBg: '#27272A',
      },
      {
        id: 't-6',
        headline: 'A developer with a\ntrue product mindset.',
        quote:
          "Abdullah is a rare blend of speed, quality, and collaboration. He actively contributes ideas that improve how designs translate into development, and he approaches every build with a product mindset. He's reliable, detail-oriented, and consistently delivers high-quality work on tight timelines.",
        authorName: 'Chrissy Cowdrey',
        authorRole: 'Product/Web Designer',
        companyName: 'Independent',
        companyUrl: '#',
        avatarInitials: 'CC',
        avatarBg: '#3F2E3E',
      },
      {
        id: 't-7',
        headline: 'A proven\nexpert you trust.',
        quote:
          "I've been working with Abdullah for years and have always been impressed by his work ethic, fast turnaround, and attention to detail. Abdullah clearly knows his craft, takes a thoughtful and disciplined approach to his work, and consistently delivers results that meet a high professional standard.",
        authorName: 'Marko Ilic',
        authorRole: 'Product Designer',
        companyName: 'Ilic.design',
        companyUrl: '#',
        avatarInitials: 'MI',
        avatarBg: '#1E293B',
      },
      {
        id: 't-8',
        headline: 'Exceptional leadership\nand technical ownership.',
        quote:
          'We loved working with Abdullah on the Autorank website. He showed exceptional leadership throughout the project, taking full ownership of the website infrastructure and guiding key technical decisions. His structured approach and attention to quality ensured a reliable and scalable outcome.',
        authorName: 'Bart-Jan Leyts',
        authorRole: 'Founder',
        companyName: 'Autorank.com',
        companyUrl: '#',
        avatarInitials: 'BL',
        avatarBg: '#312E81',
      },
    ] as TestimonialItem[],
  },

  faqSection: {
    kicker: 'FAQ',
    heading: 'Got any\nquestions?',
    items: [
      {
        id: 'faq-1',
        question: 'Why Webflow instead of custom code?',
        answer:
          'Webflow gives you the best of both worlds: clean, semantic production code and total visual design freedom, while empowering your marketing and content teams to publish updates, launch landing pages, and manage CMS items without waiting on engineering sprints.',
        column: 'left',
      },
      {
        id: 'faq-2',
        question: 'Already have a Webflow site that needs work?',
        answer:
          'Absolutely. Many clients come to me with an existing build that has grown messy or slow over time. I can audit your class system, refactor components, optimize performance, and add new sections or pages seamlessly.',
        column: 'left',
      },
      {
        id: 'faq-3',
        question: "What's the process from start to launch?",
        answer:
          'We start with a discovery & architecture review of your Figma designs (or scope), move into structured component & page development with regular staging links, layer in custom GSAP interactions and CMS collections, and finish with thorough QA, SEO setup, and editor training.',
        column: 'left',
      },
      {
        id: 'faq-4',
        question: 'Do you work under NDA?',
        answer:
          'Yes — I regularly partner with agencies, enterprise teams, and stealth startups under strict NDAs and white-label agreements.',
        column: 'left',
      },
      {
        id: 'faq-5',
        question: 'Do you handle design, or only development?',
        answer:
          'My core focus and superpower is high-end Webflow development, motion choreography, and technical architecture. If you need full brand or UI/UX design, I collaborate closely with trusted design directors and studios I can bring in.',
        column: 'right',
      },
      {
        id: 'faq-6',
        question: 'What does ongoing support look like?',
        answer:
          'With Ongoing Support, you get 30 dedicated hours every month. We communicate directly via Slack or Linear—you drop requests for new pages, experiments, CMS updates, or technical fixes, and they get knocked out rapidly with unused hours rolling over.',
        column: 'right',
      },
      {
        id: 'faq-7',
        question: 'How do you handle revisions and feedback?',
        answer:
          'You get a live staging link early in the build. We use structured feedback loops (via Markup.io, Loom, or Figma comments) so every visual tweak and interaction detail is dialed in before we ever hit publish.',
        column: 'right',
      },
      {
        id: 'faq-8',
        question: 'Not sure which plan fits your project?',
        answer:
          'Book a quick 15-minute intro call! Tell me where your current site is at or show me your Figma file, and I will give you an honest recommendation on timeline, scope, and the best-fit engagement model.',
        column: 'right',
      },
    ] as FaqItem[],
  },
};
