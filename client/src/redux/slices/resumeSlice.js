import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    uploadResume,
    getResumeHistory,
    getResumeById,
    deleteResume,
} from "../../services/resumeService.js";

// Async thunk to fetch resume analysis history
export const fetchResumeHistory = createAsyncThunk(
    "resumes/fetchHistory",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getResumeHistory();
            return response.data.history;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch resume history."
            );
        }
    }
);

// Async thunk to fetch a specific resume analysis details
export const fetchResumeDetails = createAsyncThunk(
    "resumes/fetchDetails",
    async (id, { rejectWithValue }) => {
        try {
            const response = await getResumeById(id);
            return response.data.resume;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch resume details."
            );
        }
    }
);

// Async thunk to upload and parse/analyze resume PDF
export const uploadResumeAction = createAsyncThunk(
    "resumes/upload",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await uploadResume(formData);
            return response.data.resume;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to upload and analyze resume."
            );
        }
    }
);

// Async thunk to delete a resume analysis report
export const deleteResumeAction = createAsyncThunk(
    "resumes/delete",
    async (id, { rejectWithValue }) => {
        try {
            await deleteResume(id);
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to delete resume analysis."
            );
        }
    }
);

const resumeSlice = createSlice({
    name: "resumes",
    initialState: {
        history: [],
        currentAnalysis: null,
        loading: false,
        uploading: false,
        error: null,
    },
    reducers: {
        clearCurrentAnalysis: (state) => {
            state.currentAnalysis = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch History
            .addCase(fetchResumeHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResumeHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(fetchResumeHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Details
            .addCase(fetchResumeDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResumeDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentAnalysis = action.payload;
            })
            .addCase(fetchResumeDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Upload & Analyze
            .addCase(uploadResumeAction.pending, (state) => {
                state.uploading = true;
                state.error = null;
            })
            .addCase(uploadResumeAction.fulfilled, (state, action) => {
                state.uploading = false;
                state.currentAnalysis = action.payload;
                state.history = [action.payload, ...state.history];
            })
            .addCase(uploadResumeAction.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.payload;
            })
            // Delete Resume
            .addCase(deleteResumeAction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteResumeAction.fulfilled, (state, action) => {
                state.loading = false;
                state.history = state.history.filter(
                    (item) => item._id !== action.payload
                );
                if (state.currentAnalysis?._id === action.payload) {
                    state.currentAnalysis = null;
                }
            })
            .addCase(deleteResumeAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentAnalysis, clearError } = resumeSlice.actions;
export default resumeSlice.reducer;
