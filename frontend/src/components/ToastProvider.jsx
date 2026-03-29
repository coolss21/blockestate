import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 3500,
                style: {
                    background: '#1a1a2e',
                    color: '#e0e0e0',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    padding: '12px 16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(10px)',
                },
                success: {
                    iconTheme: { primary: '#00d4aa', secondary: '#1a1a2e' },
                    style: { borderLeft: '3px solid #00d4aa' },
                },
                error: {
                    iconTheme: { primary: '#ff4757', secondary: '#1a1a2e' },
                    style: { borderLeft: '3px solid #ff4757' },
                    duration: 4500,
                },
            }}
        />
    );
}
