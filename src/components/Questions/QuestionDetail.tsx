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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fade,
    Zoom,
    useMediaQuery,
    Breadcrumbs,
    Link,
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
    clearCurrentQuestion,
} from '../../store/slices/questionSlice';
import AnswerList from './AnswerList';
import webSocketService from '../../services/websocket';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
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
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { Question } from '../../types';

// Styled components with responsive improvements
const QuestionCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    background: '#fff',
    borderRadius: 20,
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(3),
        borderRadius: 24,
    },
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(4),
        marginBottom: theme.spacing(4),
    },
}));

const AnswerCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    background: '#fff',
    borderRadius: 16,
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(2.5),
        borderRadius: 18,
    },
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(3),
        borderRadius: 20,
        marginBottom: theme.spacing(3),
    },
}));

const SuccessCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        borderRadius: 18,
    },
    [theme.breakpoints.up('md')]: {
        borderRadius: 20,
        marginBottom: theme.spacing(3),
    },
}));

const EmojiOption = styled(Box, { shouldForwardProp: (prop) => prop !== 'selected' })<{
    selected?: boolean;
}>(({ theme, selected }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1),
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `1px solid ${selected ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.06)}`,
    background: selected ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
    '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.3),
        background: alpha(theme.palette.primary.main, 0.02),
        transform: 'translateY(-2px)',
    },
    [theme.breakpoints.up('sm')]: {
        gap: theme.spacing(1),
        padding: theme.spacing(1.5),
        borderRadius: 14,
    },
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(2),
        borderRadius: 16,
    },
}));

const ChoiceOption = styled(Box, { shouldForwardProp: (prop) => prop !== 'selected' })<{
    selected?: boolean;
}>(({ theme, selected }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.5),
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `1px solid ${selected ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.06)}`,
    background: selected ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
    '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.3),
        background: alpha(theme.palette.primary.main, 0.02),
    },
    [theme.breakpoints.up('sm')]: {
        gap: theme.spacing(2),
        padding: theme.spacing(1.5, 2),
        borderRadius: 12,
    },
}));

const UserAnswerPreview = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5),
    borderRadius: 10,
    background: alpha(theme.palette.primary.main, 0.02),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(2),
        borderRadius: 12,
    },
}));

const ToggleContainer = styled(Paper)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(0.75),
    marginBottom: theme.spacing(2),
    borderRadius: 40,
    background: '#fff',
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(1),
        marginBottom: theme.spacing(3),
        width: 'fit-content',
        margin: '0 auto 24px auto',
    },
}));

const QRCodeContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    textAlign: 'center',
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(3),
    },
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(4),
    },
}));

const NotFoundCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(6, 4),
    textAlign: 'center',
    borderRadius: 32,
    background: 'linear-gradient(135deg, #fff 0%, #fafcff 100%)',
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    maxWidth: 600,
    margin: '0 auto',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(4, 3),
    },
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
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const { currentQuestion, answers, loading, error: reduxError } = useAppSelector((state) => state.questions);
    const { user } = useAppSelector((state) => state.auth);

    const [answerData, setAnswerData] = useState<AnswerData>({});
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deviceFingerprint, setDeviceFingerprint] = useState<string>();
    const [hasAnswered, setHasAnswered] = useState(false);
    const [userAnswer, setUserAnswer] = useState<any>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('question');
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);

    // Fix: Move async function call inside useEffect
    useEffect(() => {
        const loadDeviceFingerprint = async () => {
            const fingerprint = await getDeviceFingerprint();
            setDeviceFingerprint(fingerprint);
        };
        loadDeviceFingerprint();
    }, []);

    useEffect(() => {
        if (id) {
            dispatch(fetchQuestion(id))
                .unwrap()
                .catch((error: any) => {
                    // Check if it's a 404 error
                    if (error?.message?.includes('404') || error?.status === 404 || error?.response?.status === 404) {
                        setIsNotFound(true);
                    }
                });
            dispatch(fetchAnswers(id))
                .unwrap()
                .catch(() => {
                    // Ignore answers fetch error if question not found
                });
        }

        // Cleanup function to clear current question when component unmounts
        return () => {
            dispatch(clearCurrentQuestion());
        };
    }, [id, dispatch]);

    // Check if the current user/device has already answered
    useEffect(() => {
        if (answers.length > 0 && deviceFingerprint && !loading && !isNotFound) {
            // Check by device fingerprint
            const existingAnswer = answers.find(a => a.device_fingerprint === deviceFingerprint);

            // Check by user if logged in
            const userAnswer = user ? answers.find(a => a.created_by?.id === user.id) : null;

            const foundAnswer = existingAnswer || userAnswer;

            if (foundAnswer) {
                setHasAnswered(true);
                setUserAnswer(foundAnswer);
            } else {
                setHasAnswered(false);
                setUserAnswer(null);
            }
        }
    }, [answers, deviceFingerprint, user, loading, currentQuestion, isNotFound]);

    // WebSocket connection
    useEffect(() => {
        if (id && deviceFingerprint && !isNotFound) {
            const socket = webSocketService.connect(id, deviceFingerprint);

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.message_type === 'new_answer') {
                        const isOwnAnswer = data.answer?.device_fingerprint === deviceFingerprint;
                        if (!isOwnAnswer) {
                            dispatch(addAnswer(data.answer));
                        } else {
                            // This is the user's own answer, mark as answered
                            setHasAnswered(true);
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
    }, [id, user, dispatch, deviceFingerprint, isNotFound]);

    const handleCopyLink = () => {
        const link = `${window.location.origin}/question/${id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenQR = () => {
        setQrDialogOpen(true);
    };

    const handleCloseQR = () => {
        setQrDialogOpen(false);
    };

    const handleDownloadQR = () => {
        const svgElement = document.getElementById('qr-code-canvas');
        if (svgElement) {
            try {
                const svgData = new XMLSerializer().serializeToString(svgElement);

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const svgRect = svgElement.getBoundingClientRect();
                canvas.width = svgRect.width;
                canvas.height = svgRect.height;

                const img = new Image();
                img.onload = () => {
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        const link = document.createElement('a');
                        link.download = `question-${id}-qrcode.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    }
                };

                img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
            } catch (error) {
                console.error('Error downloading QR code:', error);
            }
        } else {
            console.error('SVG element not found');
        }
    };

    const renderNotFound = () => {
        return (
            <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
                <NotFoundCard elevation={0}>
                    <Box sx={{ mb: 3 }}>
                        <ErrorOutlineIcon
                            sx={{
                                fontSize: { xs: 64, sm: 80 },
                                color: alpha(theme.palette.error.main, 0.8),
                                mb: 2,
                            }}
                        />
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            404
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                            Question Not Found
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                            The question you're looking for doesn't exist or may have been removed.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            startIcon={<HomeIcon />}
                            onClick={() => navigate('/')}
                            sx={{
                                borderRadius: 40,
                                textTransform: 'none',
                                px: 4,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            }}
                        >
                            Go to {user ? 'Dashboard' : 'Home'}
                        </Button>
                        {user &&
                            <Button
                                variant="outlined"
                                startIcon={<SearchIcon />}
                                onClick={() => navigate('/questions')}
                                sx={{
                                    borderRadius: 40,
                                    textTransform: 'none',
                                    px: 4,
                                }}
                            >
                                Browse Questions
                            </Button>
                        }
                    </Box>

                    <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Typography variant="body2" color="text.secondary">
                            If you believe this is a mistake, please contact support.
                        </Typography>
                    </Box>
                </NotFoundCard>
            </Container>
        );
    };

    const renderUserAnswer = () => {
        if (!userAnswer || !userAnswer.answer_data) return null;

        const data = userAnswer.answer_data;
        const answerType = currentQuestion?.answer_type;

        switch (answerType) {
            case 'multiple_choice':
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Your answer:
                        </Typography>
                        <Chip
                            label={data.selected}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        />
                    </Box>
                );

            case 'checkbox':
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Your answers:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {data.selected?.map((item: string, idx: number) => (
                                <Chip key={idx} label={item} color="primary" variant="outlined" size="small" />
                            ))}
                        </Stack>
                    </Box>
                );

            case 'rating_scale':
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Your rating:
                        </Typography>
                        <Rating value={data.rating} readOnly size={isMobile ? "medium" : "large"} />
                        <Typography variant="body2" color="text.primary" sx={{ mt: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Your feeling:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, fontSize: { xs: 24, sm: 32 } }}>
                                {data.emoji}
                            </Avatar>
                            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Your selection: {data.value}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{ height: { xs: 6, sm: 8 }, borderRadius: 4, width: '100%' }}
                        />
                    </Box>
                );

            case 'text_input':
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Your answer:
                        </Typography>
                        <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2 }}>
                            <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{data.text}</Typography>
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
                        <Stack spacing={1}>
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
                                        <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
                        <Stack spacing={1}>
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
                                        <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
                    <Box sx={{ textAlign: 'center', py: { xs: 1, sm: 2 } }}>
                        <Rating
                            value={answerData.rating || 0}
                            onChange={(_, value) => setAnswerData({ rating: value })}
                            size={isMobile ? "large" : "large"}
                            sx={{ fontSize: { xs: 32, sm: 40 } }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Rate from {min} to {max}
                        </Typography>
                    </Box>
                );

            case 'emoji_scale':
                return (
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                        {currentQuestion.emoji_options?.map((emoji, index) => (
                            <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={index}>
                                <EmojiOption
                                    selected={answerData.emoji === emoji.emoji}
                                    onClick={() => setAnswerData({ emoji: emoji.emoji })}
                                >
                                    <Avatar
                                        sx={{
                                            width: { xs: 48, sm: 56, md: 64 },
                                            height: { xs: 48, sm: 56, md: 64 },
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                            fontSize: { xs: 24, sm: 28, md: 32 },
                                        }}
                                    >
                                        {emoji.emoji}
                                    </Avatar>
                                    <Typography variant="caption" align="center" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
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
                    <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 4 } }}>
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
                            },
                            '& .MuiInputBase-input': {
                                fontSize: { xs: '0.875rem', sm: '1rem' },
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

        const questionUrl = `${window.location.origin}/question/${id}`;

        return (
            <>
                {/* Question Card */}
                <QuestionCard elevation={0}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-start' }, mb: 2, gap: { xs: 1, sm: 0 } }}>
                        <Box sx={{ flex: 1, width: '100%' }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>
                                {currentQuestion.title}
                            </Typography>
                            <Chip
                                label={getAnswerTypeIcon()}
                                size="small"
                                sx={{
                                    mb: 2,
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    color: theme.palette.primary.main,
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignSelf: { xs: 'flex-end', sm: 'flex-start' } }}>
                            <Tooltip title="Show QR Code">
                                <IconButton onClick={handleOpenQR} size={isMobile ? "small" : "medium"}>
                                    <QrCodeIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Copy link">
                                <IconButton onClick={handleCopyLink} size={isMobile ? "small" : "medium"}>
                                    <ContentCopyIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {copied && (
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                            Link copied to clipboard!
                        </Alert>
                    )}

                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {currentQuestion.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                            avatar={<Avatar sx={{ width: { xs: 20, sm: 24 }, height: { xs: 20, sm: 24 }, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                                {currentQuestion.created_by.username[0].toUpperCase()}
                            </Avatar>}
                            label={currentQuestion.created_by.username}
                            variant="outlined"
                            size="small"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            {new Date(currentQuestion.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </Typography>
                        <Chip
                            label={`${answers.length} answer${answers.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        />
                        {currentQuestion.is_required && (
                            <Chip
                                label="Required"
                                size="small"
                                variant="outlined"
                                color="warning"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            />
                        )}
                    </Box>
                </QuestionCard>

                {/* Answer Section - Show either form or user's answer */}
                {hasAnswered ? (
                    <SuccessCard elevation={0}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: 2, flexWrap: 'wrap' }}>
                                <CheckCircleIcon sx={{ color: 'success.main', fontSize: { xs: 24, sm: 32 } }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                    You've already answered!
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <UserAnswerPreview>
                                {renderUserAnswer()}
                            </UserAnswerPreview>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                Thank you for sharing your feedback. Your answer has been recorded.
                            </Typography>
                        </CardContent>
                    </SuccessCard>
                ) : (
                    <AnswerCard elevation={0}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
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
                                fullWidth={isMobile}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    px: { xs: 2, sm: 4 },
                                    py: { xs: 1, sm: 1.5 },
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    ...(isMobile && {
                                        maxWidth: '100%',
                                    })
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

    // Show loading state
    if (loading && !isNotFound) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Show 404 page if question not found
    if (isNotFound) {
        return renderNotFound();
    }

    // Show error state if something else went wrong
    if (reduxError && !currentQuestion && !isNotFound) {
        return (
            <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
                <NotFoundCard elevation={0}>
                    <Box sx={{ mb: 3 }}>
                        <ErrorOutlineIcon
                            sx={{
                                fontSize: { xs: 64, sm: 80 },
                                color: alpha(theme.palette.error.main, 0.8),
                                mb: 2,
                            }}
                        />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>
                            Something went wrong
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            {reduxError || 'Unable to load the question. Please try again later.'}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            sx={{
                                borderRadius: 40,
                                textTransform: 'none',
                                px: 4,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            }}
                        >
                            Go to Dashboard
                        </Button>
                    </Box>
                </NotFoundCard>
            </Container>
        );
    }

    const questionUrl = `${window.location.origin}/question/${id}`;

    return (
        <>
            <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 5 }, px: { xs: 1, sm: 2, md: 3 }, position: 'relative' }}>
                {/* View Toggle */}
                <ToggleContainer elevation={0}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, value) => value && setViewMode(value)}
                        sx={{
                            gap: { xs: 1, sm: 2, md: 3 },
                            width: '100%',
                            '& .MuiToggleButton-root': {
                                borderRadius: 40,
                                px: { xs: 2, sm: 2.5, md: 3 },
                                py: { xs: 0.75, sm: 1 },
                                textTransform: 'none',
                                gap: 1,
                                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                flex: { xs: 1, sm: 'auto' },
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
                            <QuestionAnswerIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Question & Answer</Box>
                            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Q&A</Box>
                        </ToggleButton>
                        <ToggleButton value="answers" sx={{ borderLeft: 'unset !important' }}>
                            <VisibilityIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>View Answers ({answers.length})</Box>
                            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Answers ({answers.length})</Box>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </ToggleContainer>

                {/* Conditional Rendering */}
                {viewMode === 'question' ? renderQuestionContent() : (
                    <Box>
                        <QuestionCard elevation={0}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>
                                    {currentQuestion?.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Viewing all responses from the community
                                </Typography>
                            </Box>
                        </QuestionCard>

                        <AnswerList
                            answers={answers}
                            question={currentQuestion as Question}
                            showAnswers={hasAnswered}
                        />
                    </Box>
                )}
            </Container>

            {/* QR Code Dialog */}
            <Dialog
                open={qrDialogOpen}
                onClose={handleCloseQR}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: { xs: 3, sm: 4 },
                        background: 'linear-gradient(135deg, #fff 0%, #fafafa 100%)',
                        margin: { xs: 2, sm: 3 },
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1,
                    px: { xs: 2, sm: 3 },
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        Scan QR Code
                    </Typography>
                    <IconButton onClick={handleCloseQR} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <QRCodeContainer>
                        <Box
                            sx={{
                                p: { xs: 2, sm: 3 },
                                background: '#fff',
                                borderRadius: 3,
                                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                                mb: 2,
                            }}
                        >
                            <QRCode
                                id="qr-code-canvas"
                                value={questionUrl}
                                size={isMobile ? 250 : 480}
                                level="H"
                                includeMargin={true}
                                bgColor="#ffffff"
                                fgColor="#000000"
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, textAlign: 'center' }}>
                            Scan this QR code with your phone camera to view and answer this question
                        </Typography>
                    </QRCodeContainer>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 0, sm: 0 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
                    <Button
                        onClick={handleDownloadQR}
                        startIcon={<DownloadIcon />}
                        variant="outlined"
                        fullWidth={isMobile}
                        sx={{ borderRadius: 2, order: { xs: 2, sm: 1 } }}
                    >
                        Download QR Code
                    </Button>
                    <Button
                        onClick={handleCopyLink}
                        startIcon={<ContentCopyIcon />}
                        variant="contained"
                        fullWidth={isMobile}
                        sx={{
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            order: { xs: 1, sm: 2 },
                        }}
                    >
                        Copy Link
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default QuestionDetail;