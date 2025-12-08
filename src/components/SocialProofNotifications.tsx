import { useState, useEffect } from "react";
import { X } from "lucide-react";

const enrollmentData = [
  { name: "Sarah M.", location: "London, UK" },
  { name: "James K.", location: "Sydney, Australia" },
  { name: "Maria G.", location: "São Paulo, Brazil" },
  { name: "Ahmed R.", location: "Dubai, UAE" },
  { name: "Emma L.", location: "Toronto, Canada" },
  { name: "Michael B.", location: "New York, USA" },
  { name: "Sophie T.", location: "Paris, France" },
  { name: "David W.", location: "Singapore" },
  { name: "Anna P.", location: "Berlin, Germany" },
  { name: "Carlos S.", location: "Madrid, Spain" },
  { name: "Lisa H.", location: "Amsterdam, Netherlands" },
  { name: "Robert J.", location: "Chicago, USA" },
  { name: "Nina K.", location: "Stockholm, Sweden" },
  { name: "Thomas M.", location: "Melbourne, Australia" },
  { name: "Priya S.", location: "Mumbai, India" },
];

const getRandomTimeAgo = () => {
  const options = [
    "just now",
    "2 minutes ago",
    "5 minutes ago",
    "12 minutes ago",
    "23 minutes ago",
    "1 hour ago",
    "2 hours ago",
    "3 hours ago",
  ];
  return options[Math.floor(Math.random() * options.length)];
};

export const SocialProofNotifications = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentEnrollment, setCurrentEnrollment] = useState<{
    name: string;
    location: string;
    timeAgo: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Show first notification after 15 seconds
    const initialTimeout = setTimeout(() => {
      showNewNotification();
    }, 15000);

    return () => clearTimeout(initialTimeout);
  }, [dismissed]);

  useEffect(() => {
    if (!isVisible || dismissed) return;

    // Auto-hide after 5 seconds
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
      
      // Show next notification after 30-60 seconds
      const nextDelay = 30000 + Math.random() * 30000;
      setTimeout(() => {
        if (!dismissed) {
          showNewNotification();
        }
      }, nextDelay);
    }, 5000);

    return () => clearTimeout(hideTimeout);
  }, [isVisible, dismissed]);

  const showNewNotification = () => {
    const randomEnrollment = enrollmentData[Math.floor(Math.random() * enrollmentData.length)];
    setCurrentEnrollment({
      ...randomEnrollment,
      timeAgo: getRandomTimeAgo(),
    });
    setIsVisible(true);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
  };

  if (!isVisible || !currentEnrollment) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl p-4 max-w-xs border border-gray-100 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3 pr-4">
          <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {currentEnrollment.name.charAt(0)}
            </span>
          </div>
          
          <div>
            <p className="text-gray-900 font-medium text-sm">
              {currentEnrollment.name} from {currentEnrollment.location}
            </p>
            <p className="text-gray-600 text-sm">
              just enrolled in Safety 4.0 Academy
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {currentEnrollment.timeAgo}
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            127 people viewing this page
          </p>
        </div>
      </div>
    </div>
  );
};
