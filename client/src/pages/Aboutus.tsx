import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Quote, Target, Eye, Lock, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { MapPin, Phone, Mail, Globe, Linkedin } from "lucide-react"
// import { Input } from "@/components/ui/Input"
import BackgroundEffects from "@/components/BackgroundEffects"
// import NavbarUpdated from "@/components/Navbar"
import { IconNeedleThread } from "@tabler/icons-react"

const AboutUs = () => {
  // const [email, setEmail] = useState("")

  // const handleSignUp = () => {
  //   console.log("Newsletter signup:", email)
  //   setEmail("")
  // }
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      quote:
        "This app changed how I manage clients. I can create and send invoices in minutes, and the real-time payment updates keep me in control. It's professional, simple, and super efficient!",
      name: "Michael B. Jordan",
      role: "VP of Marketing, Airway",
      image: "micheal.png",
    },
    {
      quote:
        "Agility AI has saved us countless hours. The automation in GST filing and real-time dashboards has been a game-changer for our finance team.",
      name: "Emma Watson",
      role: "CFO, TechNova",
      image: "micheal.png",
    },
    {
      quote:
        "I’ve tried other invoicing tools, but nothing comes close to the simplicity and power of Agility AI. Highly recommended!",
      name: "Chris Evans",
      role: "Founder, StartupHub",
      image: "micheal.png",
    },
  ]

  const handlePrev = () => {
    setCurrentTestimonial((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentTestimonial((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    )
  }

  const advisoryBoard = [
    {
      name: "Sri R Ramaseshan",
      role: "Former IAS. Former MD & CEO at NCDEX, Chairman of the Board at National Commodity Clearing Limited.",
      image: "/adv1.png",
      linkedin: "#",
    },
    {
      name: "Prof. Aashish Argade",
      role: "Assistant Professor at IRMA and PhD from IIM Ahmedabad. Consultant to various government departments for over a decade.",
      image: "/adv2.png",
      linkedin: "#",
    },
    {
      name: "Prof. Sumit Kumar Yadav",
      role: "Professor at IIT Roorkee. PhD from IIM Ahmedabad. B.Tech from IIT Bombay.",
      image: "/adv3.png",
      linkedin: "#",
    },
  ]

  const founders = [
    {
      name: "Sharad Raj Ustav",
      role: "Founder & CEO",
      description:
        "Sharad, founder of Lyfshilp Academy & Agility AI, brings diverse experience across academia,consulting, social development, and brand-building.",
      image: "/sharad_sir.svg",
      linkedin: "https://www.linkedin.com/in/sharadrajutsav/",
    },
    {
      name: "Shreya Sinha",
      role: "Co-Founder",
      description:
        "Shreya, Co-Founder of Lyfship Academy & Agility AI, is passionate about transforming ideas into impactful solutions and building systems that drive growth and efficiency.",
      image: "/shreya_maam.svg",
      linkedin: "https://www.linkedin.com/in/shreya-sinha2802/",
    },
    {
      name: "Saurabh Jain",
      role: "Co-Founder",
      description:
        "Saurabh Jain, Co-Founder of Agility AI and Partner at S Lohia & Associates, brings expertise in taxation, auditing, corporate advisory, and startup funding.",
      image: "/saurabh_sir.svg",
      linkedin: "https://www.linkedin.com/in/ca-saurabh-jain-8a014034/",
    },
  ]

  const features = [
    {
      icon: <IconNeedleThread className="w-8 h-8 text-white" />,
      title: "End-to-End Automation",
      description:
        "Manage everything from invoice scanning to payments and GST filing in one seamless platform without switching between tools.",
    },
    {
      icon: <Lock className="w-8 h-8 text-white" />,
      title: "Integrated GST Filing",
      description:
        "Automatically calculate taxes and generate ready-to-file GST reports so you stay compliant with less effort.",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      title: "Real-Time Dashboard",
      description:
        "Track income, expenses, and pending payments instantly with a clear overview that keeps your finances under control.",
    },
  ]

  return (
    <div className="min-h-screen bg-transparent">
      <BackgroundEffects />
      
      <section className="py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="mb-8">
            <a href="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </a>
          </div>
          <div className="text-center mb-16">
           
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">About Us</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Learn more about who we are, what we do, and the vision driving our journey.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <img
                src="new owner dashboard.png"
                alt="dashboard"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl  font-bold mb-6 text-gray-900">
                Simplifying AI Invoicing & Payments for Everyone
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                From invoice scanning to GST filing, Agility AI makes finances simple, speeds up payments, and keeps you
                compliant.
              </p>
              <Button className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-8 py-3 rounded-lg text-lg cursor-pointer">
                Read More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Our Story</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              The mission that drives us, and the vision that guides us towards creating lasting impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <Card className="border-l-4 border-l-purple-600 bg-white/50 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Mission</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To empower businesses with AI-driven invoicing and GST tools that save time, cut costs, and remove
                  manual effort.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-600 shadow-lg bg-white/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Our Values</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Innovation, transparency, and customer-first design. We believe in reliable automation businesses can
                  trust.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16  ">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Founders</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Introducing the founders whose vision, expertise, and leadership drive Agility AI forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8  ">
            {founders.map((founder, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 border rounded-2xl shadow-sm bg-transparent"
              >
                {/* Founder Image */}
                <div className="flex-shrink-0">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-40 h-contain rounded-xl"
                  />
                </div>

                {/* Founder Details */}
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900">{founder.name}</h3>
                  <p className="text-sm text-purple-600 font-medium mb-2">{founder.role}</p>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{founder.description}</p>
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-600 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Meet Our Advisory Board</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our advisory board brings invaluable experience and insight, supporting Agility AI with vision and
              direction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advisoryBoard.map((advisor, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 border rounded-2xl shadow-sm bg-transparent"
              >
                {/* Advisor Image */}
                <div className="flex-shrink-0">
                  <img
                    src={advisor.image || "/placeholder.svg"}
                    alt={advisor.name}
                    className="w-40 h-contain rounded-xl object-cover"
                  />
                </div>

                {/* Advisor Details */}
                <div className="flex flex-col">
                  <h3 className="text-md font-bold text-gray-900 mb-2">{advisor.name}</h3>
                  {/* <p className="text-sm text-purple-600 font-medium mb-2">{advisor.role}</p> */}
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{advisor.role}</p>
                  {/* <a
                    href={advisor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-600 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Why Choose Us?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover what sets us apart and why we are the trusted choice for growth and innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-transparent shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
              >
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] rounded-full flex items-center justify-center ">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                  <Button
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent cursor-pointer"
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Testimonials</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Hear from the people who have experienced our work and impact firsthand.
            </p>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 shadow-xl rounded-2xl overflow-hidden">
              <div className="p-12 relative">
                <div className="absolute top-6 left-6">
                  <Quote className="w-12 h-12 text-purple-300" />
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1">
                    <blockquote className="text-xl lg:text-2xl font-medium text-gray-800 italic leading-relaxed mb-6">
                      "{testimonials[currentTestimonial].quote}"
                    </blockquote>

                    <div className="flex items-center gap-4">
                      <img
                        src={testimonials[currentTestimonial].image}
                        alt={testimonials[currentTestimonial].name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-gray-900">
                          {testimonials[currentTestimonial].name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {testimonials[currentTestimonial].role}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-48">
                    <img
                      src={testimonials[currentTestimonial].image}
                      alt={testimonials[currentTestimonial].name}
                      className="w-32 h-32 lg:w-48 lg:h-48 rounded-2xl object-cover shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-[#D1E3FF] py-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img src="/agility.jpg" alt="Agility Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Agility AI Invoicely</h3>
                  </div>
                </div>
                <p className="text-gray-500 max-w-md">
                  AI-driven business solutions that simplify your workflow.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                <div className="space-y-3 text-gray-500">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 rounded-2xl text-purple-500 mt-1" />
                    <p>Ghaziabad, Uttar Pradesh, India</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-purple-500 mt-1" />
                    <p>+91-7042149608</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-purple-500 mt-1" />
                    <p>service@agilityai.in</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-purple-500 mt-1" />
                    <a href="https://agilityai.co.in/" className="hover:text-white transition-colors">
                      www.agilityai.co.in
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-3 text-gray-500">
                  <li><a href="/about" className="hover:text-black transition-colors">About Us</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Resources</h4>
                <ul className="space-y-3 text-gray-500">
                  <li><a href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</a></li>
                  <li><a href="/T&C" className="hover:text-black transition-colors">Terms of Service</a></li>
                  <li><a href="/support" className="hover:text-black transition-colors">Support</a></li>
                  <li><a href="/userguide" className="hover:text-black transition-colors">User Guide</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-gray-800">© 2025 Agility AI Pvt. Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AboutUs