export type RootStackParamList = {
  Main: undefined;
  ProductDetail: { id: string };
  Cart: undefined;
  Checkout: undefined;
  Orders: undefined;
  OrderDetail: { id: string };
  Login: undefined;
  Register: undefined;
  Account: undefined;
  Admin: undefined;
  PaymentComplete: undefined; // Add splash screen completion route
};

export type BottomTabParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Orders: undefined;
  Account: undefined;
};