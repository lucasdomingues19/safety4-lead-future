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
      "sameAs": [
        "https://www.linkedin.com/company/safety-4-0-academy",
        "https://twitter.com/safety4academy"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+44-20-1234-5678",
        "contactType": "Customer Service",
        "email": "lucas@getshield360.com",
        "availableLanguage": ["English"]
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
          "description": "Leading expert in digital safety transformation with over 15 years experience in HSE"
        }
      },
      "educationalCredentialAwarded": "Safety 4.0 Leadership Certification",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "500",
        "bestRating": "5"
      },
      "offers": {
        "@type": "Offer",
        "category": "Founding Member Special",
        "price": "497",
        "priceCurrency": "GBP",
        "availability": "https://schema.org/InStock",
        "url": "https://safetyacademy.mykajabi.com/offers/E2ZXsoXV",
        "validFrom": "2025-11-27"
      },
      "teaches": [
        "AI in workplace safety",
        "SafetyTech implementation",
        "IoT sensors for safety monitoring",
        "Predictive safety analytics",
        "Digital safety leadership",
        "Industry 4.0 safety management"
      ],
      "timeRequired": "PT40H",
      "occupationalCredentialAwarded": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "certificate",
        "recognizedBy": {
          "@type": "Organization",
          "name": "Institution of Occupational Safety and Health (IOSH)"
        }
      }
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

    // Insert schemas
    const insertSchema = (schema: object) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    insertSchema(organizationSchema);
    
    if (type === 'course') {
      insertSchema(courseSchema);
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
