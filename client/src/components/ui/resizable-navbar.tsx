"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import React, { useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: { name: string; link: string }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  // Track viewport scroll rather than the navbar element (which is fixed)
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100);
  });

  return (
    <motion.div ref={ref} className={cn("fixed inset-x-0 top-5 z-40 w-full", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(55px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06)"
          : "none",
        // Keep a larger width when shrunk for better layout stability
        width: visible ? "85%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
      style={{ minWidth: "0" }}
      className={cn(
        "relative z-[30] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start bg-[#D1E3FF] rounded-full px-4 py-3 lg:flex dark:bg-transparent",
        visible && "dark:bg-neutral-950/80",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "relative inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-black lg:flex",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          key={`link-${idx}`}
          href={item.link}
          className="relative px-4 py-2 hover:text-white dark:text-black"
        >
          {hovered === idx && (
            <motion.div layoutId="hovered" className="absolute inset-0 h-full w-full rounded-full bg-black dark:bg-neutral-800" />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible ? "0 0 24px rgba(34, 42, 53, 0.06)" : "none",
        width: "100%",
        borderRadius: visible ? "1rem" : "2rem",
        y: visible ? 10 : 0,
      }}
      transition={{ type: "spring", stiffness: 50, damping: 30 }}
      style={{ minWidth: "0" }}
      className={cn(
        "relative z-60 mx-auto w-full flex-col items-center justify-between rounded-full px-4 py-2 lg:hidden",
        visible && "dark:bg-neutral-900/80",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => {
  return <div className={cn("flex w-full flex-row items-center justify-between", className)}>{children}</div>;
};

export const MobileNavMenu = ({ children, className, isOpen }: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start gap-4 rounded-2xl px-6 py-8 bg-white dark:bg-neutral-950 shadow-lg",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  return isOpen ? (
    <IconX className="text-black dark:text-white w-7 h-7 cursor-pointer" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-black dark:text-white w-7 h-7 cursor-pointer" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <a href="#" className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal">
      <img src="/agility.jpg" alt="logo" width={30} height={30} />
      <span className="font-medium text-black dark:text-white">Agility AI Invoicely</span>
    </a>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (React.ComponentPropsWithoutRef<"a"> | React.ComponentPropsWithoutRef<"button">)) => {
  const baseStyles = "px-4 py-2 rounded-md text-sm font-bold relative cursor-pointer transition duration-200 inline-block text-center";
  const variantStyles = {
    primary: "bg-transparent-500 text-black",
    secondary: "bg-gray-200 text-black",
    dark: "bg-black text-white",
    gradient: "bg-gradient-to-b from-blue-500 to-blue-700 text-white",
  };

  return (
    <Tag href={href || undefined} className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </Tag>
  );
};