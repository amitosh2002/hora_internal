import { createReducer } from "@reduxjs/toolkit";
import {
  AUTH_LOADING,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  SET_USER,
  TOKEN_VALIDATION_SUCCESS,
  TOKEN_VALIDATION_FAILED
} from "../Constants/authConstants";

const initialState = {
  loading: false,
  isAuthenticated: !!localStorage.getItem("internal_token"),
  user: null,
  error: null,
};

const authReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(AUTH_LOADING, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(LOGIN_SUCCESS, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;
    })
    .addCase(LOGIN_FAILURE, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    })
    .addCase(LOGOUT, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    })
    .addCase(SET_USER, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    })
    .addCase(TOKEN_VALIDATION_SUCCESS, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
    })
    .addCase(TOKEN_VALIDATION_FAILED, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
    });
});

export default authReducer;
