import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 18 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 },
    },
};

export default function PageTransition({ children, className, style }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}

/* Stagger container for cards / list items */
export const staggerContainer = {
    animate: {
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

export const staggerItem = {
    initial: { opacity: 0, y: 16 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

/* Button hover/tap presets */
export const buttonHover = {
    whileHover: { scale: 1.03, transition: { duration: 0.2 } },
    whileTap: { scale: 0.97 },
};

/* Table row animation */
export const tableRowVariant = {
    initial: { opacity: 0, x: -12 },
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.25 },
    },
};
