import React from 'react';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  date: string;
  avatar: string;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  content,
  date,
  avatar,
  className = ""
}) => {
  return (
    <div className={`bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 w-80 sm:w-90 shine-border transition-all duration-200 ${className}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <img 
          src={avatar} 
          alt={name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-card-foreground text-base sm:text-lg">{name}</h3>
          <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3">{role}</p>
          <p className="text-card-foreground text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">{content}</p>
          <p className="text-muted-foreground text-xs">{date}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
