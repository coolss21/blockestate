import { motion, AnimatePresence } from 'framer-motion';

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const dialogVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', damping: 25, stiffness: 350 },
    },
    exit: { opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.15 } },
};

const variantConfig = {
    danger: {
        accent: '#ff4757',
        bg: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
        icon: '⚠️',
    },
    warning: {
        accent: '#ffa502',
        bg: 'linear-gradient(135deg, #ffa502 0%, #eccc68 100%)',
        icon: '⚡',
    },
    info: {
        accent: '#00d4aa',
        bg: 'linear-gradient(135deg, #00d4aa 0%, #7bed9f 100%)',
        icon: '✓',
    },
};

export default function ConfirmDialog({
    open,
    title = 'Confirm Action',
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info',
    onConfirm,
    onCancel,
}) {
    const config = variantConfig[variant] || variantConfig.info;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="confirm-dialog-backdrop"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onCancel}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(6px)',
                    }}
                >
                    <motion.div
                        className="confirm-dialog-card"
                        variants={dialogVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#1a1a2e',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            padding: '0',
                            width: '90%',
                            maxWidth: '420px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Accent bar */}
                        <div
                            style={{
                                height: '4px',
                                background: config.bg,
                            }}
                        />

                        {/* Content */}
                        <div style={{ padding: '28px 28px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '24px' }}>{config.icon}</span>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: '#fff',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {title}
                                </h3>
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    color: 'rgba(255,255,255,0.6)',
                                    lineHeight: 1.6,
                                }}
                            >
                                {message}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '10px',
                                padding: '16px 28px 24px',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onCancel}
                                style={{
                                    padding: '10px 22px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    background: 'transparent',
                                    color: 'rgba(255,255,255,0.7)',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.05)')}
                                onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                            >
                                {cancelText}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03, boxShadow: `0 4px 20px ${config.accent}44` }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onConfirm}
                                style={{
                                    padding: '10px 22px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: config.bg,
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {confirmText}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
