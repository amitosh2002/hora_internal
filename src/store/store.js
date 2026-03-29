import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Reducer/authReducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
