import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callFetchFeeType } from "@/config/api";
import { IFeeType } from "@/types/backend";

interface IState {
  isFetching: boolean;
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: IFeeType[];
}
// First, create the thunk
export const fetchFeeType = createAsyncThunk(
  "feeType/fetchFeeType",
  async ({ query }: { query: string }) => {
    const response = await callFetchFeeType(query);
    return response;
  }
);

const initialState: IState = {
  isFetching: true,
  meta: {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },
  result: [],
};

export const feeTypeSlide = createSlice({
  name: "feeType",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setActiveMenu: (state, action) => {
      // state.activeMenu = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchFeeType.pending, (state, action) => {
      state.isFetching = true;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchFeeType.rejected, (state, action) => {
      state.isFetching = false;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchFeeType.fulfilled, (state, action) => {
      if (action.payload && action.payload.data) {
        state.isFetching = false;
        state.meta = action.payload.data.meta;
        state.result = action.payload.data.result;
      }
      // Add user to the state array

      // state.courseOrder = action.payload;
    });
  },
});

export const { setActiveMenu } = feeTypeSlide.actions;

export default feeTypeSlide.reducer;
