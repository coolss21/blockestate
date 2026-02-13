// components/QRModal.jsx
import React from 'react';

const QRModal = ({ isOpen, onClose, qrUrl, propertyId }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 text-center">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900">Verify Asset</h3>
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{propertyId}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <span className="text-2xl leading-none">×</span>
                        </button>
                    </div>

                    <div className="bg-white p-4 border-2 border-dashed border-gray-100 rounded-2xl mb-6 mx-auto inline-block">
                        <img
                            src={qrUrl}
                            alt="Large QR Code"
                            className="w-64 h-64 mx-auto"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <p className="text-sm text-blue-800 font-medium">
                                Scan this QR code with any mobile device to view the official blockchain certificate and ownership history.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRModal;
