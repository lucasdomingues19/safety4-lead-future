export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  excerpt: string;
  author: string;
  authorTitle: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  featuredImage: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "0",
    slug: "introducing-worlds-first-safety-4-academy",
    title: "Introducing the World's First Safety 4.0 Academy",
    metaDescription: "Announcing the launch of the Safety 4.0 Academy and the world's first IOSH-approved SafetyTech and digital transformation course for EHS leaders.",
    excerpt: "Today, I'm proud to officially announce the launch of the Safety 4.0 Academy and our flagship programme: IOSH Approved Safety 4.0 – Leading Safely in the Digital Age. The world's first dedicated SafetyTech and digital transformation course for EHS leaders.",
    author: "Lucas Domingues",
    authorTitle: "Safety 4.0 Expert, MSc, CMIOSH",
    publishDate: "2025-01-20",
    readTime: "6 min read",
    category: "Announcement",
    tags: ["Safety 4.0", "Academy Launch", "IOSH Approved", "SafetyTech", "Digital Transformation"],
    featuredImage: "/assets/blog/safety-academy-launch.jpg",
    content: `
# Introducing the World's First Safety 4.0 Academy

## Shaping the Future of EHS, One Leader at a Time

For the past year, I've worked quietly on something I truly believe will redefine how the global EHS community learns, leads, and adapts to a rapidly changing world.

Today, I'm proud to officially announce the launch of the **Safety 4.0 Academy** and our flagship programme:

**IOSH Approved Safety 4.0 – Leading Safely in the Digital Age**

The world's first dedicated SafetyTech and digital transformation course for EHS leaders, now officially IOSH-approved and CPD-certified.

This isn't another tick-the-box safety course.

It's a practical, modern, accessible roadmap for EHS professionals who want to stay relevant, future-proof their careers, and lead safety with confidence in a digital era.

## Why This Matters Now

Safety is changing faster than most organisations can keep up.

AI, automation, data, cloud, wearables, drones, mobile workflows — these are no longer "future tools." They are being deployed today, reshaping how we prevent incidents, manage risks, and elevate safety performance.

Yet most EHS professionals were never trained for this shift.

This course was built to close that gap. To help safety leaders escape the reactive trap, cut admin overwhelm, and step confidently into a new era of smart, proactive, tech-enabled safety leadership.

## Built with Excellence — Recognised by World EHS Leaders

Getting the course approved by IOSH and accredited for CPD hours means one thing:

✔ **Quality**  
✔ **Professional credibility**  
✔ **A clear stamp of trust**

IOSH approval is not easy to earn — and that's exactly why it matters. It signals that Safety 4.0 is aligned with the highest standards of professional development in our industry.

## What You'll Learn

Inside the programme, learners will gain:

- **A foundational understanding** of AI, SafetyTech, and digital transformation
- **How to use modern tools** (AI, cloud, mobile, drones, wearables, RAG, LLMs, etc.)
- **How to build smarter safety workflows**
- **How to break free from reactive firefighting**
- **How to lead with data, technology, and adaptive intelligence**
- **Real-world case studies** and practical examples
- **Immediate, career-boosting skills** — no technical background required

All in an **8-hour self-paced format** designed for busy EHS professionals.

## Who This Is For

This course is perfect for:

- EHS Managers
- EHS Leads, Directors and VPs
- Safety consultants
- Anyone wanting to upgrade their skills and stay ahead in a digital-first safety world

If you've ever said:

- *"I don't know where to start with AI in safety."*
- *"I feel overwhelmed by new technologies."*
- *"I want to take my career to the next level."*
- *"Our organisation needs to modernise safety."*

Then this course is exactly what you need.

## A New Era of Safety Leadership Starts Today

Safety 4.0 isn't about replacing people with technology.

It's about empowering EHS professionals with the tools, mindset, and confidence to deliver smarter, faster, safer work.

And this course is your starting point.

[Start Your Transformation Today →](/)
`
  }
];

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getRecentPosts = (limit: number = 3): BlogPost[] => {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, limit);
};

export const getPostsByCategory = (category: string): BlogPost[] => {
  return blogPosts.filter(post => post.category === category);
};
