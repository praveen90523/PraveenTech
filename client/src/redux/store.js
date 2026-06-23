import { configureStore } from "@reduxjs/toolkit";
import resumeReducer from "./slices/resumeSlice.js";

const store = configureStore({
    reducer: {
        resumes: resumeReducer,
    },
});

export default store;
