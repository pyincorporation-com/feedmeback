export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  created_at: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  created_by: User;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  is_active: boolean;
  answers_count: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface QuestionState {
  questions: Question[];
  currentQuestion: Question | null;
  answers: Answer[];
  loading: boolean;
  error: string | null;
}

/**
 * Form Interfaces
 * Contains all form-related type definitions for the application
 */

// Register Form Interface
export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  password2: string; // Password confirmation
}

// Login Form Interface
export interface LoginForm {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Question Form Interface
export interface QuestionForm {
  title: string;
  description: string;
  expires_at?: string | null;
  is_active?: boolean;
}

// Answer Form Interface
export interface AnswerForm {
  content: string;
}

// Profile Form Interface
export interface ProfileForm {
  username: string;
  email: string;
  bio: string;
  avatar?: File | null;
}

// Password Change Form Interface
export interface PasswordChangeForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Forgot Password Form Interface
export interface ForgotPasswordForm {
  email: string;
}

// Reset Password Form Interface
export interface ResetPasswordForm {
  token: string;
  new_password: string;
  confirm_password: string;
}

// Search/Filter Form Interface
export interface SearchForm {
  query: string;
  sortBy?: "recent" | "popular" | "unanswered";
  filter?: "all" | "active" | "expired";
}

// API Response Types for Forms
export interface FormErrors {
  [key: string]: string[];
}

export interface FormState {
  isLoading: boolean;
  errors: FormErrors | null;
  message: string | null;
}

export interface DashboardStats {
  user: {
    username: string;
    joined: string | null;
  };
  overview: {
    total_questions: number;
    total_answers: number;
    questions_answered: number;
    questions_last_week: number;
    answers_last_week: number;
  };
  questions: {
    active: number;
    inactive: number;
    expired: number;
  };
  reactions: {
    likes_received: number;
    dislikes_received: number;
    likes_given: number;
    dislikes_given: number;
  };
  activity: {
    daily: Array<{
      date: string;
      questions: number;
      answers: number;
      total: number;
    }>;
    recent: Array<{
      type: "question" | "answer";
      id: string;
      title?: string;
      question_id?: string;
      question_title?: string;
      created_at: string;
      details: string;
    }>;
  };
  most_answered: Array<{
    id: string;
    title: string;
    answer_count: number;
  }>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  created_at: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  answer_type: string;
  choices?: Choice[];
  slider_config?: SliderConfig;
  rating_scale?: RatingScale;
  emoji_options?: EmojiOption[];
  is_required: boolean;
  created_by: User;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  is_active: boolean;
  answers_count: number;
}

export interface Choice {
  text: string;
  value?: string;
  emoji?: string;
}

export interface SliderConfig {
  min: number;
  max: number;
  step: number;
}

export interface RatingScale {
  min: number;
  max: number;
}

export interface EmojiOption {
  value: string;
  label: string;
  emoji: string;
  color?: string;
}

// Answer Data Types
export interface MultipleChoiceAnswer {
  selected: string;
}

export interface CheckboxAnswer {
  selected: string[];
}

export interface RatingScaleAnswer {
  rating: number;
}

export interface EmojiScaleAnswer {
  emoji: string;
  label?: string;
}

export interface SliderAnswer {
  value: number;
}

export interface TextInputAnswer {
  text: string;
}

export type AnswerData =
  | MultipleChoiceAnswer
  | CheckboxAnswer
  | RatingScaleAnswer
  | EmojiScaleAnswer
  | SliderAnswer
  | TextInputAnswer;

export interface Answer {
  device_fingerprint: string;
  id: string;
  question: string;
  content: string | null; // For backward compatibility
  answer_data: AnswerData;
  created_by: User | null; // Can be null for anonymous answers
  created_at: string;
  updated_at: string;
  likes_count: number;
  dislikes_count: number;
  user_reaction?: "like" | "dislike" | null;
}
