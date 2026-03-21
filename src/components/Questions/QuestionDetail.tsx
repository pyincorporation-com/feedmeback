import React, { JSX, useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Chip,
    Divider,
    TextField,
    Button,
    Alert,
    CircularProgress,
    IconButton,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    FormGroup,
    Slider,
    Rating,
    Avatar,
    useTheme,
    alpha,
    Stack,
    Tooltip,
    InputAdornment,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
    fetchQuestion,
    fetchAnswers,
    submitAnswer,
    addAnswer,
    updateAnswerReaction,
} from '../../store/slices/questionSlice';
import AnswerList from './AnswerList';
import webSocketService from '../../services/websocket';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { getDeviceFingerprint } from '../../services/deviceFingerprint';
import BackgroundWave from '../BackgroundWave';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Styled components
const QuestionCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    background: '#fff',
    borderRadius: 24,
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
}));

const AnswerCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    background: '#fff',
    borderRadius: 20,
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
}));

const SuccessCard = styled(Card)(({ theme }) => ({
    borderRadius: 20,
    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
    marginBottom: theme.spacing(3),
}));

const EmojiOption = styled(Box, { shouldForwardProp: (prop) => prop !== 'selected' })<{
    selected?: boolean;
}>(({ theme, selected }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    borderRadius: 16,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `1px solid ${selected ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.06)}`,
    background: selected ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
    '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.3),
        background: alpha(theme.palette.primary.main, 0.02),
        transform: 'translateY(-2px)',
    },
}));

const ChoiceOption = styled(Box, { shouldForwardProp: (prop) => prop !== 'selected' })<{
    selected?: boolean;
}>(({ theme, selected }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `1px solid ${selected ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.06)}`,
    background: selected ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
    '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.3),
        background: alpha(theme.palette.primary.main, 0.02),
    },
}));

const UserAnswerPreview = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: 12,
    background: alpha(theme.palette.primary.main, 0.02),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const ToggleContainer = styled(Paper)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(3),
    borderRadius: 60,
    background: '#fff',
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    width: 'fit-content',
    margin: '0 auto 24px auto',
}));

interface AnswerData {
    [key: string]: any;
}

type ViewMode = 'question' | 'answers';

const QuestionDetail: React.FC = () => {
    const theme = useTheme();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentQuestion, answers, loading } = useAppSelector((state) => state.questions);
    const { user } = useAppSelector((state) => state.auth);

    const [answerData, setAnswerData] = useState<AnswerData>({});
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deviceFingerprint, setDeviceFingerprint] = useState<string>();
    const [hasAnswered, setHasAnswered] = useState(false);
    const [userAnswer, setUserAnswer] = useState<any>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('question');

    const fetchDeviceFingerprint = (async () => {
        const fingerprint = await getDeviceFingerprint();
        setDeviceFingerprint(fingerprint);
    })();

    useEffect(() => {
        fetchDeviceFingerprint;
    }, []);

    useEffect(() => {
        if (id) {
            dispatch(fetchQuestion(id));
            dispatch(fetchAnswers(id));
        }
    }, [id, dispatch]);

    console.log("hasAnswered", hasAnswered, answers, loading)

    // Check if the current user/device has already answered
    useEffect(() => {
        if (answers.length > 0 && deviceFingerprint && !loading) {
            // Check by device fingerprint
            const existingAnswer = answers.find(a => a.device_fingerprint === deviceFingerprint);

            // Check by user if logged in
            const userAnswer = user ? answers.find(a => a.created_by?.id === user.id) : null;
            console.log("userAnswer", userAnswer, existingAnswer)
            const foundAnswer = existingAnswer || userAnswer;

            if (foundAnswer) {
                setHasAnswered(true);
                console.log("was set here top")
                setUserAnswer(foundAnswer);
            } else {
                setHasAnswered(false);
                setUserAnswer(null);
            }
        }
    }, [answers, deviceFingerprint, user, loading]);

    // WebSocket connection
    useEffect(() => {
        if (id && deviceFingerprint) {
            const socket = webSocketService.connect(id, deviceFingerprint);

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message:', data);

                    if (data.message_type === 'new_answer') {
                        const isOwnAnswer = data.answer?.device_fingerprint === deviceFingerprint;
                        if (!isOwnAnswer) {
                            dispatch(addAnswer(data.answer));
                        } else {
                            // This is the user's own answer, mark as answered
                            setHasAnswered(true);
                            console.log("was set here")
                            setUserAnswer(data.answer);
                        }
                    } else if (data.message_type === 'answer_reaction') {
                        const isOwnReaction = data.user_id === user?.id;
                        if (!isOwnReaction) {
                            dispatch(updateAnswerReaction({
                                answerId: data.answer_id,
                                reactionType: data.reaction_type,
                                userId: data.user_id,
                            }));
                        }
                    } else if (data.message_type === 'reaction_removed') {
                        const isOwnReaction = data.user_id === user?.id;
                        if (!isOwnReaction) {
                            dispatch(updateAnswerReaction({
                                answerId: data.answer_id,
                                reactionType: null,
                                userId: data.user_id,
                            }));
                        }
                    }
                } catch (err) {
                    console.error('Invalid WebSocket message', err);
                }
            };

            return () => {
                webSocketService.disconnect();
            };
        }
    }, [id, user, dispatch, deviceFingerprint]);

    const handleCopyLink = () => {
        const link = `${window.location.origin}/question/${id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderUserAnswer = () => {
        if (!userAnswer || !userAnswer.answer_data) return null;

        const data = userAnswer.answer_data;
        const answerType = currentQuestion?.answer_type;

        switch (answerType) {
            case 'multiple_choice':
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Your answer:
                        </Typography>
                        <Chip
                            label={data.selected}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                        />
                    </Box>
                );

            case 'checkbox':
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Your answers:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {data.selected?.map((item: string, idx: number) => (
                                <Chip key={idx} label={item} color="primary" variant="outlined" />
                            ))}
                        </Stack>
                    </Box>
                );

            case 'rating_scale':
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Your rating:
                        </Typography>
                        <Rating value={data.rating} readOnly size="large" />
                        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                            {data.rating} out of {currentQuestion?.rating_scale?.max || 5}
                        </Typography>
                    </Box>
                );

            case 'emoji_scale':
                const emojiMap: Record<string, { icon: JSX.Element; label: string }> = {
                    '😞': { icon: <SentimentVeryDissatisfiedIcon />, label: 'Very Dissatisfied' },
                    '😐': { icon: <SentimentDissatisfiedIcon />, label: 'Dissatisfied' },
                    '😶': { icon: <SentimentNeutralIcon />, label: 'Neutral' },
                    '🙂': { icon: <SentimentSatisfiedIcon />, label: 'Satisfied' },
                    '😊': { icon: <SentimentVerySatisfiedIcon />, label: 'Very Satisfied' },
                };
                const selectedEmoji = emojiMap[data.emoji] || { icon: null, label: data.label };
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Your feeling:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 48, height: 48, fontSize: 32 }}>
                                {data.emoji}
                            </Avatar>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {selectedEmoji.label}
                            </Typography>
                        </Box>
                    </Box>
                );

            case 'slider':
                const config = currentQuestion?.slider_config || { min: 0, max: 100 };
                const percentage = ((data.value - config.min) / (config.max - config.min)) * 100;
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Your selection: {data.value}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{ height: 8, borderRadius: 4, width: '100%' }}
                        />
                    </Box>
                );

            case 'text_input':
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Your answer:
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2 }}>
                            <Typography variant="body1">{data.text}</Typography>
                        </Paper>
                    </Box>
                );

            default:
                return null;
        }
    };

    const handleSubmitAnswer = async () => {
        if (!currentQuestion) return;

        let isValid = true;
        let errorMessage = '';

        switch (currentQuestion.answer_type) {
            case 'multiple_choice':
                if (!answerData.selected) {
                    isValid = false;
                    errorMessage = 'Please select an option';
                }
                break;
            case 'checkbox':
                if (!answerData.selected || answerData.selected.length === 0) {
                    isValid = false;
                    errorMessage = 'Please select at least one option';
                }
                break;
            case 'rating_scale':
                if (!answerData.rating) {
                    isValid = false;
                    errorMessage = 'Please select a rating';
                }
                break;
            case 'emoji_scale':
                if (!answerData.emoji) {
                    isValid = false;
                    errorMessage = 'Please select an emoji';
                }
                break;
            case 'slider':
                if (answerData.value === undefined) {
                    isValid = false;
                    errorMessage = 'Please select a value';
                }
                break;
            case 'text_input':
                if (!answerData.text || !answerData.text.trim()) {
                    isValid = false;
                    errorMessage = 'Please enter your answer';
                }
                break;
        }

        if (!isValid) {
            setError(errorMessage);
            setTimeout(() => setError(null), 3000);
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            let submitData = {};

            if (currentQuestion.answer_type === 'emoji_scale') {
                submitData = { emoji: answerData.emoji };
            } else if (currentQuestion.answer_type === 'multiple_choice' || currentQuestion.answer_type === 'checkbox') {
                submitData = { selected: answerData.selected };
            } else if (currentQuestion.answer_type === 'rating_scale') {
                submitData = { rating: answerData.rating };
            } else if (currentQuestion.answer_type === 'slider') {
                submitData = { value: answerData.value };
            } else if (currentQuestion.answer_type === 'text_input') {
                submitData = { text: answerData.text };
            }

            const result = await dispatch(submitAnswer({
                questionId: id!,
                answer_data: submitData,
                device_fingerprint: deviceFingerprint
            }));

            if (submitAnswer.fulfilled.match(result)) {
                setAnswerData({});
                // The WebSocket will update hasAnswered state when the answer is broadcast back
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to submit answer. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderAnswerForm = () => {
        if (!currentQuestion) return null;

        switch (currentQuestion.answer_type) {
            case 'multiple_choice':
                return (
                    <RadioGroup
                        value={answerData.selected || ''}
                        onChange={(e) => setAnswerData({ selected: e.target.value })}
                    >
                        <Stack spacing={1.5}>
                            {currentQuestion.choices?.map((choice, index) => (
                                <ChoiceOption
                                    key={index}
                                    selected={answerData.selected === (choice.value || choice.text)}
                                    onClick={() => setAnswerData({ selected: choice.value || choice.text })}
                                >
                                    <Radio
                                        value={choice.value || choice.text}
                                        checked={answerData.selected === (choice.value || choice.text)}
                                        onChange={() => { }}
                                        sx={{ p: 0.5 }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body1">
                                            {choice.text}
                                        </Typography>
                                        {choice.emoji && (
                                            <Typography variant="caption" color="text.secondary">
                                                {choice.emoji}
                                            </Typography>
                                        )}
                                    </Box>
                                </ChoiceOption>
                            ))}
                        </Stack>
                    </RadioGroup>
                );

            case 'checkbox':
                return (
                    <FormGroup>
                        <Stack spacing={1.5}>
                            {currentQuestion.choices?.map((choice, index) => (
                                <ChoiceOption
                                    key={index}
                                    selected={answerData.selected?.includes(choice.value || choice.text)}
                                    onClick={() => {
                                        const currentSelected = answerData.selected || [];
                                        const value = choice.value || choice.text;
                                        if (currentSelected.includes(value)) {
                                            setAnswerData({
                                                selected: currentSelected.filter((v: string) => v !== value)
                                            });
                                        } else {
                                            setAnswerData({
                                                selected: [...currentSelected, value]
                                            });
                                        }
                                    }}
                                >
                                    <Checkbox
                                        checked={answerData.selected?.includes(choice.value || choice.text)}
                                        onChange={() => { }}
                                        sx={{ p: 0.5 }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body1">
                                            {choice.text}
                                        </Typography>
                                        {choice.emoji && (
                                            <Typography variant="caption" color="text.secondary">
                                                {choice.emoji}
                                            </Typography>
                                        )}
                                    </Box>
                                </ChoiceOption>
                            ))}
                        </Stack>
                    </FormGroup>
                );

            case 'rating_scale':
                const min = currentQuestion.rating_scale?.min || 1;
                const max = currentQuestion.rating_scale?.max || 5;
                return (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Rating
                            value={answerData.rating || 0}
                            onChange={(_, value) => setAnswerData({ rating: value })}
                            size="large"
                            sx={{ fontSize: 40 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Rate from {min} to {max}
                        </Typography>
                    </Box>
                );

            case 'emoji_scale':
                return (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {currentQuestion.emoji_options?.map((emoji, index) => (
                            <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={index}>
                                <EmojiOption
                                    selected={answerData.emoji === emoji.emoji}
                                    onClick={() => setAnswerData({ emoji: emoji.emoji })}
                                >
                                    <Avatar
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                            fontSize: 32,
                                        }}
                                    >
                                        {emoji.emoji}
                                    </Avatar>
                                    <Typography variant="caption" align="center">
                                        {emoji.label}
                                    </Typography>
                                </EmojiOption>
                            </Grid>
                        ))}
                    </Grid>
                );

            case 'slider':
                const config = currentQuestion.slider_config || { min: 0, max: 100, step: 1 };
                return (
                    <Box sx={{ px: 2, py: 4 }}>
                        <Slider
                            value={answerData.value !== undefined ? answerData.value : config.min}
                            onChange={(_, value) => setAnswerData({ value })}
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            valueLabelDisplay="auto"
                            marks={[
                                { value: config.min, label: config.min.toString() },
                                { value: config.max, label: config.max.toString() },
                            ]}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                                {config.min}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {config.max}
                            </Typography>
                        </Box>
                    </Box>
                );

            case 'text_input':
                return (
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Type your answer here..."
                        value={answerData.text || ''}
                        onChange={(e) => setAnswerData({ text: e.target.value })}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                );

            default:
                return null;
        }
    };

    const renderQuestionContent = () => {
        if (!currentQuestion) return null;

        return (
            <>
                {/* Question Card */}
                <QuestionCard elevation={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                                {currentQuestion.title}
                            </Typography>
                            <Chip
                                label={getAnswerTypeIcon()}
                                size="small"
                                sx={{
                                    mb: 2,
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    color: theme.palette.primary.main,
                                }}
                            />
                        </Box>
                        <Tooltip title="Copy link">
                            <IconButton onClick={handleCopyLink} sx={{ ml: 2 }}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                        {currentQuestion.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                            avatar={<Avatar sx={{ width: 24, height: 24, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                {currentQuestion.created_by.username[0].toUpperCase()}
                            </Avatar>}
                            label={currentQuestion.created_by.username}
                            variant="outlined"
                            size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                            {new Date(currentQuestion.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </Typography>
                        <Chip
                            label={`${answers.length} answer${answers.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}
                        />
                        {currentQuestion.is_required && (
                            <Chip
                                label="Required"
                                size="small"
                                variant="outlined"
                                color="warning"
                            />
                        )}
                    </Box>
                </QuestionCard>

                {/* Answer Section - Show either form or user's answer */}
                {hasAnswered ? (
                    <SuccessCard elevation={0}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                    You've already answered!
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <UserAnswerPreview>
                                {renderUserAnswer()}
                            </UserAnswerPreview>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                                Thank you for sharing your feedback. Your answer has been recorded.
                            </Typography>
                        </CardContent>
                    </SuccessCard>
                ) : (
                    <AnswerCard elevation={0}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Your Answer
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {renderAnswerForm()}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                            <Button
                                variant="contained"
                                onClick={handleSubmitAnswer}
                                disabled={submitting}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    px: 4,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                }}
                            >
                                {submitting ? <CircularProgress size={24} /> : 'Submit Answer'}
                            </Button>
                        </Box>
                    </AnswerCard>
                )}
            </>
        );
    };

    const getAnswerTypeIcon = () => {
        switch (currentQuestion?.answer_type) {
            case 'multiple_choice': return '☑️ Multiple Choice';
            case 'checkbox': return '✅ Checkbox';
            case 'rating_scale': return '⭐ Rating Scale';
            case 'emoji_scale': return '😊 Emoji Scale';
            case 'slider': return '📊 Slider';
            case 'text_input': return '✏️ Text Input';
            default: return '❓ Unknown';
        }
    };

    if (loading || !currentQuestion) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <BackgroundWave speed={0.2} />
            <Container maxWidth="lg" sx={{ py: 4, zIndex: 1000000, position: 'relative' }}>
                {/* View Toggle */}
                <ToggleContainer elevation={0}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, value) => value && setViewMode(value)}
                        sx={{
                            gap: 3,
                            '& .MuiToggleButton-root': {
                                borderRadius: 40,
                                px: 3,
                                py: 1,
                                textTransform: 'none',
                                gap: 1,
                                '&.Mui-selected': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    color: 'white',
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                    },
                                },
                            },
                        }}
                    >
                        <ToggleButton value="question">
                            <QuestionAnswerIcon sx={{ fontSize: 20 }} />
                            Question & Answer
                        </ToggleButton>
                        <ToggleButton value="answers">
                            <VisibilityIcon sx={{ fontSize: 20 }} />
                            View Answers ({answers.length})
                        </ToggleButton>
                    </ToggleButtonGroup>
                </ToggleContainer>

                {/* Conditional Rendering */}
                {viewMode === 'question' ? renderQuestionContent() : (
                    <Box>
                        <QuestionCard elevation={0}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                                    {currentQuestion.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Viewing all responses from the community
                                </Typography>
                            </Box>
                        </QuestionCard>

                        <AnswerList
                            answers={answers}
                            question={currentQuestion}
                            showAnswers={hasAnswered}
                        />
                    </Box>
                )}
            </Container>
        </>
    );
};

export default QuestionDetail;