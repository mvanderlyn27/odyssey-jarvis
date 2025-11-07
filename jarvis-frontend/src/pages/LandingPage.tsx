import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Plasma from "../components/Plasma";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { motion } from "framer-motion";
import PublicHeader from "../components/layout/PublicHeader";
import PricingTiers from "../features/billing/components/PricingTiers";
import { usePlans } from "../features/billing/hooks/usePlans";

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-yellow-400">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const LandingPage: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: plans } = usePlans();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const testimonials = [
    {
      name: "Jane Doe",
      title: "Social Media Manager",
      quote: "Jarvis has revolutionized our content workflow. The analytics are a game-changer!",
      stars: 5,
    },
    {
      name: "John Smith",
      title: "Digital Creator",
      quote: "I can schedule my posts for the entire month in just a few hours. This tool is a lifesaver.",
      stars: 5,
    },
    {
      name: "Emily White",
      title: "Marketing Agency CEO",
      quote:
        "The ability to manage multiple client accounts from a single dashboard is invaluable. Highly recommended!",
      stars: 5,
    },
    {
      name: "Michael Brown",
      title: "Freelancer",
      quote: "A must-have tool for anyone serious about social media.",
      stars: 4,
    },
  ];

  const features = [
    {
      title: "Advanced Analytics",
      description: "Gain deep insights into your social media performance with our detailed analytics.",
    },
    {
      title: "Content Scheduling",
      description: "Plan and schedule your posts in advance to save time and maintain a consistent presence.",
    },
    {
      title: "Video Uploads",
      description: "Seamlessly upload and manage your video content across all your connected accounts.",
    },
    {
      title: "AI-Powered Suggestions",
      description: "Get intelligent suggestions for content, hashtags, and optimal posting times.",
    },
    {
      title: "Team Collaboration",
      description: "Work with your team to create, approve, and manage content seamlessly.",
    },
    {
      title: "Customizable Reports",
      description: "Generate beautiful, custom-branded reports for your clients or stakeholders.",
    },
  ];

  const handleChoosePlan = (priceId: string | null) => {
    if (priceId) {
      navigate(`/signup?priceId=${priceId}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="bg-background text-foreground">
      <PublicHeader showNavLinks={true} />
      {/* Hero Section */}
      <section
        id="hero"
        className="relative h-[calc(100vh-4rem)] flex items-center justify-center text-center overflow-hidden">
        <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
          <Plasma color="#0077b6" speed={0.3} direction="forward" scale={1.1} opacity={0.8} mouseInteractive={false} />
        </div>
        <motion.div className="relative z-10 p-4" initial="hidden" animate="visible" variants={containerVariants}>
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold mb-4">
            Welcome to Jarvis
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-muted-foreground">
            The ultimate tool for social media management.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button
              size="lg"
              className="mt-8"
              onClick={() => handleChoosePlan(plans?.find((p) => p.name === "Free")?.id ?? null)}>
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}>
            {features.map((feature) => (
              <motion.div variants={itemVariants} key={feature.title}>
                <Card>
                  <CardHeader>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-secondary overflow-hidden">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        </div>
        <div className="relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          <motion.div
            className="flex"
            animate={{
              x: ["0%", "-100%"],
              transition: {
                ease: "linear",
                duration: 20,
                repeat: Infinity,
              },
            }}
            style={{ animationPlayState: isHovering ? "paused" : "running" }}>
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div className="flex-shrink-0 w-full md:w-1/4 p-4" key={index}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} filled={i < testimonial.stars} />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
          <PricingTiers />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-secondary">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <form className="space-y-4">
                  <Input placeholder="Name" />
                  <Input type="email" placeholder="Email" />
                  <Textarea placeholder="Message" />
                  <Button className="w-full">Submit</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Jarvis. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
