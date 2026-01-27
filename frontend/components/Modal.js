import { useEffect } from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

export default function Modal({ isOpen, onClose, title, message, type = 'info', children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FiCheckCircle className="text-5xl text-green-500" />;
            case 'error':
                return <FiAlertCircle className="text-5xl text-red-500" />;
            case 'warning':
                return <FiAlertCircle className="text-5xl text-yellow-500" />;
            default:
                return <FiInfo className="text-5xl text-blue-500" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return 'border-green-500 bg-green-50';
            case 'error':
                return 'border-red-500 bg-red-50';
            case 'warning':
                return 'border-yellow-500 bg-yellow-50';
            default:
                return 'border-blue-500 bg-blue-50';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
                {/* Header */}
                <div className={`border-l-4 ${getColors()} p-6 rounded-t-2xl`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            {getIcon()}
                            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {message && (
                        <p className="text-gray-700 text-lg mb-4">{message}</p>
                    )}
                    {children}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="btn btn-primary"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FiCheckCircle className="text-5xl text-green-500" />;
            case 'error':
                return <FiAlertCircle className="text-5xl text-red-500" />;
            case 'warning':
                return <FiAlertCircle className="text-5xl text-yellow-500" />;
            default:
                return <FiInfo className="text-5xl text-blue-500" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return 'border-green-500 bg-green-50';
            case 'error':
                return 'border-red-500 bg-red-50';
            case 'warning':
                return 'border-yellow-500 bg-yellow-50';
            default:
                return 'border-blue-500 bg-blue-50';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
                {/* Header */}
                <div className={`border-l-4 ${getColors()} p-6 rounded-t-2xl`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            {getIcon()}
                            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-700 text-lg whitespace-pre-line">{message}</p>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-end space-x-3">
                    <button
                        onClick={() => {
                            if (onConfirm.onCancel) {
                                onConfirm.onCancel();
                            }
                            onClose();
                        }}
                        className="btn btn-secondary"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="btn btn-primary"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
