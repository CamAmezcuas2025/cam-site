import { MotionProps } from "framer-motion";

declare module "framer-motion" {
  interface MotionProps extends MotionProps {
    className?: string;
    src?: string;
    alt?: string;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<HTMLElement>;
    // Add more if needed (e.g., href?: string; for motion.a)
  }
}