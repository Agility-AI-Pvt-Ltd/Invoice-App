"use client";

import { motion } from "framer-motion";
import BackgroundGradient from "@/components/ui/BackgroundGradient";
import { ContainerScroll } from "@/components/ui/ContainerScroll";

const DashboardPreview = () => {
  return (
    <section className="pt-0 px-3 sm:px-4 md:px-8 pb-10 sm:pb-16 md:pb-20">
      <ContainerScroll>
        <BackgroundGradient
          className="rounded-lg sm:rounded-2xl"
          containerClassName="rounded-lg sm:rounded-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border rounded-lg sm:rounded-2xl shadow-card overflow-hidden"
          >
            <div className="relative">
              <img
                src={"new owner dashboard.png"}
                alt="Dashboard interface showing analytics and reports"
                className="block w-full h-auto rounded-lg sm:rounded-2xl select-none"
                loading="lazy"
              />
            </div>
          </motion.div>
        </BackgroundGradient>
      </ContainerScroll>
    </section>
  );
};

export default DashboardPreview;
