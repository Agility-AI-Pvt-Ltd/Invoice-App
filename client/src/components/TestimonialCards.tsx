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
    <div className={`bg-card rounded-xl p-6 w-90 shine-border transition-all duration-200 ${className}`}>
      <div className="flex items-start gap-4">
        <img 
          src={avatar} 
          alt={name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-card-foreground text-lg">{name}</h3>
          <p className="text-muted-foreground text-sm mb-3">{role}</p>
          <p className="text-card-foreground text-sm leading-relaxed mb-4">{content}</p>
          <p className="text-muted-foreground text-xs">{date}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
// import React from "react"

// export interface TestimonialCardProps {
//   name: string
//   role: string
//   content: string
//   avatar: string
// }

// const TestimonialCard: React.FC<TestimonialCardProps> = ({
//   name,
//   role,
//   content,
//   avatar,
// }) => (
//   <div className="bg-card rounded-xl p-6 shadow-card border border-border w-80">
//     <div className="flex items-start gap-4">
//       <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
//       <div className="flex-1">
//         <h3 className="font-semibold text-card-foreground text-lg">{name}</h3>
//         <p className="text-muted-foreground text-sm mb-3">{role}</p>
//         <p className="text-card-foreground text-sm leading-relaxed mb-4">{content}</p>
//       </div>
//     </div>
//   </div>
// )

// export default TestimonialCard
