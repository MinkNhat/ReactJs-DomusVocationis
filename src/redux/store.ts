import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import accountReducer from "./slice/accountSlide";
import userReducer from "./slice/userSlide";
import feeTypeReducer from "./slice/feeTypeSlide";
import permissionReducer from "./slice/permissionSlide";
import roleReducer from "./slice/roleSlide";
import periodReducer from "./slice/periodSlide";
import categoryReducer from "./slice/categorySlide";
import paymentReducer from "./slice/paymentSlide";

export const store = configureStore({
  reducer: {
    account: accountReducer,
    user: userReducer,
    feeType: feeTypeReducer,
    permission: permissionReducer,
    role: roleReducer,
    period: periodReducer,
    category: categoryReducer,
    payment: paymentReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
