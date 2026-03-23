import { useEffect } from 'react';

interface StructuredDataProps {
  type?: 'course' | 'organization' | 'faq';
  faqItems?: Array<{ question: string; answer: string }>;
}

export const SEOStructuredData = ({ type = 'course', faqItems }: StructuredDataProps) => {
  useEffect(() => {
    // Remove existing structured data scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Safety 4.0 Academy",
      "url": "https://safetyacademy.tech",
      "logo": "https://safetyacademy.tech/safety-academy-logo.png",
      "description": "The world's first IOSH-approved Safety 4.0 certification program for digital safety leadership",
      "foundingDate": "2024",
      "areaServed": "Worldwide",
      "sameAs": [
        "https://www.linkedin.com/company/safety-4-0-academy",
        "https://twitter.com/safety4academy"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+44-20-1234-5678",
        "contactType": "Customer Service",
        "email": "hello@safetyacademy.tech",
        "availableLanguage": ["English"],
        "areaServed": "Worldwide"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "500",
        "bestRating": "5",
        "worstRating": "1"
      }
    };

    // Course Schema
    const courseSchema = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Safety 4.0 - Leading Safety in the Digital Age",
      "description": "IOSH and CPD-approved certification program teaching AI, SafetyTech, IoT sensors, and digital leadership for modern workplace safety professionals",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Safety 4.0 Academy",
        "sameAs": "https://safetyacademy.tech"
      },
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "courseWorkload": "PT12W",
        "instructor": {
          "@type": "Person",
          "name": "Lucas Domingues",
          "jobTitle": "Safety 4.0 Expert, MSc, CMIOSH",
          "description": "Leading expert in digital safety transformation with over 15 years experience in HSE",
          "knowsAbout": ["Safety 4.0", "Digital Safety", "AI in Safety", "SafetyTech", "IoT Safety"],
          "alumniOf": {
            "@type": "EducationalOrganization",
            "name": "Imperial College London"
          }
        }
      },
      "educationalCredentialAwarded": "Safety 4.0 Leadership Certification",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "500",
        "bestRating": "5",
        "reviewCount": "500"
      },
      "offers": {
        "@type": "Offer",
        "category": "Founding Member Special",
        "price": "597",
        "priceCurrency": "GBP",
        "availability": "https://schema.org/InStock",
        "url": "https://safetyacademy.mykajabi.com/offers/E2ZXsoXV",
        "validFrom": "2025-11-27",
        "priceValidUntil": "2026-12-31"
      },
      "teaches": [
        "AI in workplace safety",
        "SafetyTech implementation",
        "IoT sensors for safety monitoring",
        "Predictive safety analytics",
        "Digital safety leadership",
        "Industry 4.0 safety management",
        "Computer vision for hazard detection",
        "Wearable safety technology",
        "Safety data analytics"
      ],
      "timeRequired": "PT8H",
      "occupationalCredentialAwarded": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "certificate",
        "recognizedBy": [
          {
            "@type": "Organization",
            "name": "Institution of Occupational Safety and Health (IOSH)"
          },
          {
            "@type": "Organization",
            "name": "CPD Certification Service"
          }
        ]
      },
      "numberOfCredits": "8",
      "educationalLevel": "Professional Development",
      "inLanguage": "en",
      "isAccessibleForFree": false,
      "coursePrerequisites": "Basic safety management knowledge"
    };

    // FAQ Schema (if FAQ items provided)
    let faqSchema = null;
    if (type === 'faq' && faqItems && faqItems.length > 0) {
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      };
    }

    // VideoObject Schema for hero video
    const videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": "Safety 4.0 Academy - Course Introduction",
      "description": "Discover how Safety 4.0 transforms workplace safety through AI, IoT, and digital technologies. Learn about the world's first IOSH-approved Safety 4.0 certification program.",
      "thumbnailUrl": "https://safetyacademy.tech/opengraph-image.png",
      "uploadDate": "2025-11-27T00:00:00Z",
      "duration": "PT3M",
      "contentUrl": "https://www.youtube.com/watch?v=OsKsyXCx8pc",
      "embedUrl": "https://www.youtube.com/embed/OsKsyXCx8pc",
      "publisher": {
        "@type": "Organization",
        "name": "Safety 4.0 Academy",
        "logo": {
          "@type": "ImageObject",
          "url": "https://safetyacademy.tech/safety-academy-logo.png"
        }
      }
    };

    // BreadcrumbList Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://safetyacademy.tech/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Safety 4.0 Course",
          "item": "https://safetyacademy.tech/#pricing"
        }
      ]
    };

    // HowTo Schema for course structure
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Become a Safety 4.0 Leader",
      "description": "Complete guide to becoming a certified Safety 4.0 professional through IOSH-approved training",
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "GBP",
        "value": "497"
      },
      "totalTime": "PT12W",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Enroll in Safety 4.0 Academy",
          "text": "Register for the founding member special and gain instant access to all 10 modules"
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Complete 10 Learning Modules",
          "text": "Study AI, IoT, SafetyTech, and digital safety leadership through interactive video lessons and practical exercises"
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Pass All Assessments",
          "text": "Demonstrate mastery through module assessments and a final certification exam"
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Receive IOSH & CPD Certification",
          "text": "Get your globally recognized Safety 4.0 certification with 8+ CPD hours"
        }
      ]
    };

    // Insert schemas
    const insertSchema = (schema: object) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    insertSchema(organizationSchema);
    insertSchema(breadcrumbSchema);
    
    if (type === 'course') {
      insertSchema(courseSchema);
      insertSchema(videoSchema);
      insertSchema(howToSchema);
    }
    
    if (faqSchema) {
      insertSchema(faqSchema);
    }

    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => script.remove());
    };
  }, [type, faqItems]);

  return null;
};
