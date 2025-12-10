import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  Payment,
  CreateOrderInput,
  CreateSubscriptionOrderInput,
  CreateVerificationOrderInput,
  RazorpayVerificationInput,
  RazorpayOrder,
  ApiResponse,
} from '@/types';

// Query keys
export const paymentKeys = {
  all: ['payments'] as const,
  history: () => [...paymentKeys.all, 'history'] as const,
};

// Razorpay configuration from environment
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Load Razorpay script
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      if (existingScript.hasAttribute('data-loading')) {
        // Wait for existing load
        const checkInterval = setInterval(() => {
          if (window.Razorpay) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);
        return;
      }
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.integrity = 'sha384-8C8Oy6x8nMNLpfL8BtCHr6lO6tP1JU0pGf0qbUpWBYV5qYbltRKLABKH6qMDvNMNM';
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-loading', 'true');
    script.onload = () => {
      script.removeAttribute('data-loading');
      resolve(true);
    };
    script.onerror = () => {
      script.removeAttribute('data-loading');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

// Fetch payment history
export function usePaymentHistory() {
  return useQuery({
    queryKey: paymentKeys.history(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Payment[]>>('/payments/history');
      return response.data;
    },
  });
}

// Create order for course enrollment
export function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      const response = await api.post<ApiResponse<{ order: RazorpayOrder; payment: Payment }>>('/payments/create-order', data);
      return response.data;
    },
  });
}

// Verify payment after Razorpay callback
export function useVerifyPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RazorpayVerificationInput) => {
      const response = await api.post<ApiResponse<{ payment: Payment }>>('/payments/verify', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

// Create verification order for teachers
export function useCreateVerificationOrder() {
  return useMutation({
    mutationFn: async (data: CreateVerificationOrderInput) => {
      const response = await api.post<ApiResponse<{ order: RazorpayOrder; payment: Payment }>>('/payments/verification/create-order', data);
      return response.data;
    },
  });
}

// Verify verification payment
export function useVerifyVerificationPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RazorpayVerificationInput) => {
      const response = await api.post<ApiResponse<{ payment: Payment }>>('/payments/verify', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

// Hook to initiate Razorpay payment
interface RazorpayPaymentOptions {
  order: RazorpayOrder;
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  description?: string;
  onSuccess: (response: RazorpayVerificationInput) => void;
  onFailure?: (error: Error) => void;
}

export function useRazorpayPayment() {
  const initiatePayment = async ({
    order,
    userInfo,
    description = 'EduTech Course Payment',
    onSuccess,
    onFailure,
  }: RazorpayPaymentOptions) => {
    const isLoaded = await loadRazorpayScript();
    
    if (!isLoaded || !window.Razorpay) {
      onFailure?.(new Error('Failed to load Razorpay SDK'));
      return;
    }
    
    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Deep Learning EduTech',
      description,
      order_id: order.id,
      handler: (response) => {
        onSuccess({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: userInfo?.name,
        email: userInfo?.email,
        contact: userInfo?.phone,
      },
      theme: {
        color: '#3B82F6',
      },
      modal: {
        ondismiss: () => {
          onFailure?.(new Error('Payment cancelled by user'));
        },
      },
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };
  
  return { initiatePayment };
}
