interface ClickPaymentResponse {
  status: 'success' | 'error';
  error?: string;
}

interface ClickPaymentVerifyResponse {
  status: 'success' | 'error';
  payment_status: 'completed' | 'failed' | 'pending';
  transaction_id?: string;
  error?: string;
}

export interface ClickPaymentParams {
  merchantId: string;
  serviceId: string;
  amount: number;
  transactionId: string;
  merchantUserId?: string;
  cardType?: 'uzcard' | 'humo';
  returnUrl: string;
}

export const initializeClickPayment = (params: ClickPaymentParams): Promise<ClickPaymentResponse> => {
  return new Promise((resolve) => {
    // @ts-ignore - Click's checkout.js adds this to window
    window.createPaymentRequest({
      merchant_id: params.merchantId,
      service_id: params.serviceId,
      amount: params.amount.toFixed(2),
      transaction_param: params.transactionId,
      merchant_user_id: params.merchantUserId,
      card_type: params.cardType,
    }, (data: { status: number }) => {
      if (data.status === 2) {
        // Payment successful
        resolve({ status: 'success' });
      } else if (data.status < 0) {
        // Payment failed
        resolve({ 
          status: 'error', 
          error: getClickErrorMessage(data.status) 
        });
      } else {
        // Payment pending or in process
        resolve({ 
          status: 'error', 
          error: 'Payment was not completed' 
        });
      }
    });
  });
};

export const verifyClickPayment = async (paymentId: string): Promise<ClickPaymentVerifyResponse> => {
  try {
    const merchantId = import.meta.env.VITE_CLICK_MERCHANT_ID;
    const secretKey = import.meta.env.VITE_CLICK_SERVICE_ID;

    if (!merchantId || !secretKey) {
      throw new Error('Click credentials not configured');
    }

    const response = await fetch('https://my.click.uz/services/api/merchant/check_payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Auth': secretKey,
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        payment_id: paymentId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify payment');
    }

    return {
      status: 'success',
      payment_status: data.status,
      transaction_id: data.transaction_id,
    };
  } catch (error) {
    return {
      status: 'error',
      payment_status: 'failed',
      error: error instanceof Error ? error.message : 'Payment verification failed',
    };
  }
};

const getClickErrorMessage = (status: number): string => {
  switch (status) {
    case -1:
      return 'Payment system error';
    case -2:
      return 'Payment was cancelled';
    case -3:
      return 'Connection error';
    default:
      return 'Unknown error occurred';
  }
};