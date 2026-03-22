import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../services/api";
import { QuestionState, Question, Answer } from "../../types";

const initialState: QuestionState = {
  questions: [],
  myQuestions: {
    questions: [],
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  },
  currentQuestion: null,
  answers: [],
  loading: false,
  error: null,
};

export const fetchQuestions = createAsyncThunk(
  "questions/fetchAll",
  async (params?: { search?: string; ordering?: string }) => {
    const response = await api.get("/questions", { params });
    return response.data;
  },
);

export const fetchQuestion = createAsyncThunk(
  "questions/fetchOne",
  async (id: string) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },
);

export const createQuestion = createAsyncThunk(
  "questions/create",
  async (data: { title: string; description: string }) => {
    const response = await api.post("/questions", data);
    return response.data;
  },
);

export const fetchAnswers = createAsyncThunk(
  "questions/fetchAnswers",
  async (questionId: string) => {
    const response = await api.get(`/questions/${questionId}/answers`);
    return response.data;
  },
);

export const updateQuestion = createAsyncThunk(
  "questions/update",
  async ({ id, data }: { id: string; data: any }) => {
    const response = await api.patch(`/questions/${id}`, data);
    return response.data;
  },
);

export const deleteQuestion = createAsyncThunk(
  "questions/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/questions/${id}`);
      return { id, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete question",
      );
    }
  },
);

export const submitAnswer = createAsyncThunk(
  "questions/submitAnswer",
  async ({
    questionId,
    answer_data,
    device_fingerprint,
  }: {
    questionId: string;
    answer_data: any;
    device_fingerprint?: string;
  }) => {
    const response = await api.post(`/questions/${questionId}/answer`, {
      answer_data,
      device_fingerprint,
    });
    return response.data;
  },
);

export const reactToAnswer = createAsyncThunk(
  "questions/reactToAnswer",
  async ({
    answerId,
    reactionType,
  }: {
    answerId: string;
    reactionType: "like" | "dislike";
  }) => {
    const response = await api.post(`/answers/${answerId}/react`, {
      reaction_type: reactionType,
    });
    return response.data;
  },
);

const questionSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
      state.answers = [];
    },
    addAnswer: (state, action: PayloadAction<Answer>) => {
      const exists = state.answers.some(
        (answer) => answer.id === action.payload.id,
      );
      if (!exists) {
        state.answers.unshift(action.payload);
      }
    },
    updateAnswerReaction: (
      state,
      action: PayloadAction<{
        answerId: string;
        reactionType: "like" | "dislike" | null;
        userId: string;
      }>,
    ) => {
      const answer = state.answers.find(
        (a) => a.id === action.payload.answerId,
      );
      if (answer) {
        // Handle the reaction update
        const previousReaction = answer.user_reaction;

        // Update counts based on change
        if (previousReaction === "like") answer.likes_count--;
        if (previousReaction === "dislike") answer.dislikes_count--;

        answer.user_reaction = action.payload.reactionType;

        if (action.payload.reactionType === "like") answer.likes_count++;
        if (action.payload.reactionType === "dislike") answer.dislikes_count++;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Questions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchQuestions.fulfilled,
        (state, action: PayloadAction<Question[]>) => {
          state.loading = false;
          state.questions = action.payload;
        },
      )
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch questions";
      })
      .addCase(fetchQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch question";
      })
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchQuestion.fulfilled,
        (state, action: PayloadAction<Question>) => {
          state.currentQuestion = action.payload;
          state.loading = false;
        },
      )
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions.unshift(action.payload);
        if (state.myQuestions.questions) {
          state.myQuestions.questions.unshift(action.payload);
          state.myQuestions.total += 1;
        }
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.loading = false;
        if (
          state.currentQuestion &&
          state.currentQuestion.id === action.payload.id
        ) {
          state.currentQuestion = action.payload;
        }
        const index = state.questions.findIndex(
          (q) => q.id === action.payload.id,
        );
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
        const myIndex = state.myQuestions.questions.findIndex(
          (q) => q.id === action.payload.id,
        );
        if (myIndex !== -1) {
          state.myQuestions.questions[myIndex] = action.payload;
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = state.questions.filter(
          (q) => q.id !== action.payload.id,
        );
        state.myQuestions.questions = state.myQuestions.questions.filter(
          (q) => q.id !== action.payload.id,
        );
        state.myQuestions.total -= 1;
        if (
          state.currentQuestion &&
          state.currentQuestion.id === action.payload.id
        ) {
          state.currentQuestion = null;
          state.answers = [];
        }
      })
      .addCase(fetchAnswers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete question";
      })
      .addCase(deleteQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update question";
      })
      .addCase(submitAnswer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        submitAnswer.fulfilled,
        (state, action: PayloadAction<Answer>) => {
          state.loading = false;
          state.answers.unshift(action.payload);
          state.error = null;
        },
      )
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to submit answer";
      })
      .addCase(
        fetchAnswers.fulfilled,
        (state, action: PayloadAction<Answer[]>) => {
          state.answers = action.payload;
        },
      )
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create question";
      })
      .addCase(fetchAnswers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch answers";
      })
      .addCase(fetchMyQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reactToAnswer.rejected, (state, action) => {
        state.error = action.error.message || "Failed to react to answer";
      })
      .addCase(fetchMyQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.myQuestions = action.payload;
      })
      .addCase(fetchMyQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch my questions";
      });
  },
});

export const fetchMyQuestions = createAsyncThunk(
  "questions/fetchMyQuestions",
  async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    answer_type?: string;
    ordering?: string;
  }) => {
    const response = await api.get("/questions/questions", { params });
    return response.data;
  },
);

export const { clearCurrentQuestion, addAnswer, updateAnswerReaction } =
  questionSlice.actions;
export default questionSlice.reducer;
