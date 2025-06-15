declare global {
  interface Window {
    createPaymentRequest: (
      params: {
        merchant_id: string;
        service_id: string;
        amount: string;
        transaction_param: string;
        merchant_user_id?: string;
        card_type?: 'uzcard' | 'humo';
      },
      callback: (data: { status: number }) => void
    ) => void;
  }
}