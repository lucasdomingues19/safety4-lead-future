import { useEffect, useState } from 'react';

export const DigitalDotsText = ({ text = "Digital Age" }: { text?: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.substring(0, currentIndex));
        currentIndex++;
      } else {
        setIsAnimating(false);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating, text]);

  return (
    <span className="inline-block">
      {displayText.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block relative"
          style={{
            animation: isAnimating ? `digitalDots 0.4s ease-out ${i * 0.05}s both` : 'none',
          }}
        >
          {char === ' ' ? ' ' : char}
        </span>
      ))}
      <style>{`
        @keyframes digitalDots {
          0% {
            opacity: 0;
            transform: scale(0) translate(-50%, -50%);
            filter: blur(4px);
          }
          50% {
            opacity: 0.7;
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate(0, 0);
            filter: blur(0);
          }
        }
      `}</style>
    </span>
  );
};
