import React from 'react';
import TestimonialCard from './TestimonialCards';

const testimonials = [
  {
    id: 1,
    name: "Shreya Bansal",
    role: "Freelance Designer",
    content: "This app makes client management easy. Creating and sending invoices is fast, and real-time updates keep me in control. Simple, professional, and efficient!",
    date: "Invoice user, 2021.03.02",
    avatar: "public/agility.jpg",
    position: "top-0 left-1/2 -translate-x-1/2",
    opacity: "opacity-100",
    // zIndex: "z-50",
    shadow: "shadow-lg",
    rotate: ""
  },
  {
    id: 2,
    name: "Sneha Kapoor",
    role: "Startup Co-founder",
    content: "Our growing team needed a smarter way to invoice clients. The customizable templates and auto-reminders have saved us much time. Highly recommended!",
    date: "Invoice user, 2021.03.02",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    position: "top-26 left-[13%]",
    opacity: "opacity-90",
    zIndex: "z-40",
    shadow: "shadow-lg",
    rotate: "-rotate-4"
  },
  {
    id: 3,
    name: "Rahul Mehta",
    role: "Owner, Verma Traders",
    content: "Tracking business expenses and payments used to be a mess. Now with this app, everything's organized in one place and I get paid faster too!",
    date: "Invoice user, 2021.03.02",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    position: "top-26 right-[11%]",
    opacity: "opacity-90",
    // zIndex: "z-40",
    shadow: "shadow-lg",
    rotate: "rotate-5"
  },
  {
    id: 4,
    name: "Radhika Mandal",
    role: "Creative Director",
    content: "Invoice is finally addressing a long time problem we had with ease of use and workflow. Promising!",
    date: "Invoice user, 2021.03.02",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    position: "top-89 left-[3%]",
    opacity: "opacity-90",
    zIndex: "z-30",
    shadow: "shadow-lg",
    rotate: "-rotate-6"
  },
  {
    id: 5,
    name: "Aman Bhatt",
    role: "CA at Traders",
    content: "This tool is a must for any small business. Easy GST handling, quick invoice creation, and client tracking—all from one dashboard. It's like having a virtual assistant!",
    date: "Invoice user, 2021.03.02",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    position: "top-82 right-[3%]",
    opacity: "opacity-90",
    zIndex: "z-30",
    shadow: "shadow-lg",
    rotate: "rotate-4"
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section id="tesimonialsection" className="min-h-screen bg-testimonial-gradient py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          {/* <div className="text-6xl md:text-8xl text-testimonial-quote font-bold mb-4">
            "
          </div> */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Users Testimonials
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our users speak for us. Here's how we've made invoicing easier for them.
          </p>
        </div>

        {/* Stacked Testimonial Cards */}
        <div className="relative h-[600px] md:h-[500px] ">
          {testimonials.map((testimonial) => (
            <div
            key={testimonial.id}
            className={`absolute ${testimonial.position} ${testimonial.opacity} ${testimonial.zIndex ?? ''} ${testimonial.shadow} ${testimonial.rotate} transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 hover:z-50 `}
          >
              <TestimonialCard
                name={testimonial.name}
                role={testimonial.role}
                content={testimonial.content}
                date={testimonial.date}
                avatar={testimonial.avatar}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;


// TestimonialSection.tsx
// import React from "react";
// import TestimonialCard from "./TestimonialCards"
// import type { TestimonialCardProps } from "./TestimonialCards"
// import { Stack } from "@appletosolutions/reactbits"

// type CardData = {
//   id: string
//   render: () => React.ReactNode
// }
// const testimonials: TestimonialCardProps[] = [
//   {
//     name: "Shreya Bansal",
//     role: "Freelance Designer",
//     content: "This app makes client management easy…",
//     avatar: "/agility.jpg",
//   },
//   {
//     name: "Sneha Kapoor",
//     role: "Startup Co-founder",
//     content: "Our growing team needed a smarter way…",
//     avatar:
//       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
//   },
//   {
//     name: "Rahul Mehta",
//     role: "Owner, Verma Traders",
//     content: "Tracking business expenses…get paid faster too!",
//     avatar:
//       "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
//   },
// ];

// const TestimonialsSection: React.FC = () => {
//   const cardsData: CardData[] = testimonials.map((t, idx) => ({
//     id: `${t.name}-${idx}`,
//     render: () => <TestimonialCard {...t} />,
//   }));

//   return (
//     <section
//       id="tesimonialsection"
//       className="min-h-screen bg-testimonial-gradient py-20 px-4"
//     >
//       <div className="max-w-7xl mx-auto text-center mb-12">
//         <h2 className="text-4xl md:text-5xl font-bold text-white">
//           Users Testimonials
//         </h2>
//         <p className="text-lg text-gray-400 max-w-2xl mx-auto">
//           Our users speak for us. Here's how we've made invoicing easier for
//           them.
//         </p>
//       </div>

//       <div className="relative flex justify-center">
//         <Stack
//           cardsData={cardsData}
//           randomRotation={true}
//           sensitivity={120}
//           cardDimensions={{ width: 300, height: 220 }}
//           sendToBackOnClick={false}
//         />
//       </div>
//     </section>
//   );
// };

// export default TestimonialsSection;
