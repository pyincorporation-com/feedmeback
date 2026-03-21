import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../services/api";
import { QuestionState, Question, Answer } from "../../types";

const initialState: QuestionState = {
  questions: [],
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
      // Fetch Single Question
      .addCase(
        fetchQuestion.fulfilled,
        (state, action: PayloadAction<Question>) => {
          state.currentQuestion = action.payload;
        },
      )
      // Create Question
      .addCase(
        createQuestion.fulfilled,
        (state, action: PayloadAction<Question>) => {
          state.questions.unshift(action.payload);
        },
      )
      // Fetch Answers
      .addCase(
        fetchAnswers.fulfilled,
        (state, action: PayloadAction<Answer[]>) => {
          state.answers = action.payload;
        },
      )
      // Submit Answer
      .addCase(
        submitAnswer.fulfilled,
        (state, action: PayloadAction<Answer>) => {
          state.answers.unshift(action.payload);
        },
      );
  },
});

export const { clearCurrentQuestion, addAnswer, updateAnswerReaction } =
  questionSlice.actions;
export default questionSlice.reducer;
