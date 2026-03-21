import React, { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    InputAdornment,
    IconButton,
    Chip,
    Stack,
    Divider,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Slider,
    MenuItem,
    Select,
    SelectChangeEvent,
    Switch,
    FormHelperText,
    Avatar,
    alpha,
    useTheme,
    Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createQuestion } from '../../store/slices/questionSlice';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ShortTextIcon from '@mui/icons-material/ShortText';
import LinearScaleIcon from '@mui/icons-material/LinearScale';

// Styled components - minimal and clean
const FormCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    background: '#fff',
    borderRadius: 24,
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    transition: 'all 0.2s ease',
}));

const QuestionTitle = styled(Typography)(({ theme }) => ({
    fontSize: '1.5rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: '0.9rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: theme.spacing(2),
}));

const ChoiceOption = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: 12,
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    transition: 'all 0.2s ease',
    '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.3),
        background: alpha(theme.palette.primary.main, 0.02),
    },
}));

const EmojiButton = styled(IconButton)(({ theme, selected }: { selected?: boolean }) => ({
    fontSize: '1.8rem',
    padding: 8,
    borderRadius: 12,
    transition: 'all 0.2s ease',
    background: selected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
    '&:hover': {
        background: alpha(theme.palette.primary.main, 0.08),
        transform: 'scale(1.05)',
    },
}));

// Answer type options
const ANSWER_TYPES = [
    {
        value: 'multiple_choice',
        label: 'Multiple Choice',
        icon: <RadioButtonCheckedIcon />,
        description: 'Users select one option from a list'
    },
    {
        value: 'checkbox',
        label: 'Checkbox',
        icon: <CheckCircleIcon />,
        description: 'Users select multiple options'
    },
    {
        value: 'rating_scale',
        label: 'Rating Scale',
        icon: <LinearScaleIcon />,
        description: 'Users rate on a scale (1-5, 1-10, etc.)'
    },
    {
        value: 'emoji_scale',
        label: 'Emoji Scale',
        icon: <EmojiEmotionsIcon />,
        description: 'Users express sentiment with emojis'
    },
    {
        value: 'text_input',
        label: 'Text Input',
        icon: <ShortTextIcon />,
        description: 'Users can type their answer'
    },
    {
        value: 'slider',
        label: 'Slider',
        icon: <LinearScaleIcon />,
        description: 'Users slide to select a value'
    },
];

// Emoji options for emoji scale
const EMOJI_OPTIONS = [
    { value: 'very_dissatisfied', label: 'Very Dissatisfied', emoji: '😞', icon: <SentimentVeryDissatisfiedIcon />, color: '#ef4444' },
    { value: 'dissatisfied', label: 'Dissatisfied', emoji: '😐', icon: <SentimentDissatisfiedIcon />, color: '#f59e0b' },
    { value: 'neutral', label: 'Neutral', emoji: '😶', icon: <SentimentNeutralIcon />, color: '#6b7280' },
    { value: 'satisfied', label: 'Satisfied', emoji: '🙂', icon: <SentimentSatisfiedIcon />, color: '#10b981' },
    { value: 'very_satisfied', label: 'Very Satisfied', emoji: '😊', icon: <SentimentVerySatisfiedIcon />, color: '#3b82f6' },
];

interface QuestionForm {
    title: string;
    description: string;
    answer_type: string;
    choices?: { text: string; emoji?: string; value: string }[];
    slider_min?: number;
    slider_max?: number;
    slider_step?: number;
    rating_scale_min?: number;
    rating_scale_max?: number;
    is_required?: boolean;
}

const CreateQuestion: React.FC = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.questions);

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<QuestionForm>({
        defaultValues: {
            answer_type: 'multiple_choice',
            choices: [{ text: '', emoji: '', value: '' }],
            slider_min: 0,
            slider_max: 100,
            slider_step: 1,
            rating_scale_min: 1,
            rating_scale_max: 5,
            is_required: true,
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'choices',
    });

    const answerType = watch('answer_type');
    const isRequired = watch('is_required');

    const handleAddChoice = () => {
        append({ text: '', emoji: '', value: '' });
    };

    const handleRemoveChoice = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const onSubmit = async (data: QuestionForm) => {
        // Prepare the question data based on answer type
        const questionData: any = {
            title: data.title,
            description: data.description,
            answer_type: data.answer_type,
            is_required: data.is_required,
        };

        // Add type-specific data
        if (data.answer_type === 'multiple_choice' || data.answer_type === 'checkbox') {
            questionData.choices = data.choices?.filter(c => c.text.trim()) || [];
        } else if (data.answer_type === 'slider') {
            questionData.slider_config = {
                min: data.slider_min,
                max: data.slider_max,
                step: data.slider_step,
            };
        } else if (data.answer_type === 'rating_scale') {
            questionData.rating_scale = {
                min: data.rating_scale_min,
                max: data.rating_scale_max,
            };
        } else if (data.answer_type === 'emoji_scale') {
            questionData.emoji_options = EMOJI_OPTIONS;
        }

        const result = await dispatch(createQuestion(questionData));
        if (createQuestion.fulfilled.match(result)) {
            navigate(`/question/${result.payload.id}`);
        }
    };

    const getAnswerTypeIcon = () => {
        const type = ANSWER_TYPES.find(t => t.value === answerType);
        return type?.icon || <RadioButtonCheckedIcon />;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <FormCard elevation={0}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <QuestionTitle>
                        Create New Question
                    </QuestionTitle>
                    <Typography variant="body2" color="text.secondary">
                        Choose how you want to collect feedback
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => { }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Basic Info */}
                    <Box sx={{ mb: 4 }}>
                        <SectionTitle>Basic Information</SectionTitle>
                        <Stack spacing={2.5}>
                            <TextField
                                fullWidth
                                label="Question Title"
                                placeholder="What would you like to ask?"
                                {...register('title', {
                                    required: 'Title is required',
                                    minLength: { value: 10, message: 'Title must be at least 10 characters' }
                                })}
                                error={!!errors.title}
                                helperText={errors.title?.message}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: '#fff',
                                    }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                placeholder="Provide more context or instructions..."
                                multiline
                                rows={3}
                                {...register('description', {
                                    required: 'Description is required',
                                    minLength: { value: 20, message: 'Description must be at least 20 characters' }
                                })}
                                error={!!errors.description}
                                helperText={errors.description?.message}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: '#fff',
                                    }
                                }}
                            />
                        </Stack>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Answer Type Selection */}
                    <Box sx={{ mb: 4 }}>
                        <SectionTitle>Answer Type</SectionTitle>
                        <Grid container spacing={2}>
                            {ANSWER_TYPES.map((type) => (
                                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={type.value}>
                                    <Box
                                        onClick={() => setValue('answer_type', type.value)}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                                            background: answerType === type.value
                                                ? alpha(theme.palette.primary.main, 0.04)
                                                : '#fff',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                                background: alpha(theme.palette.primary.main, 0.02),
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Box sx={{ color: answerType === type.value ? 'primary.main' : 'text.secondary' }}>
                                                {type.icon}
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {type.label}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {type.description}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* Type-specific Configuration */}
                    {(answerType === 'multiple_choice' || answerType === 'checkbox') && (
                        <Box sx={{ mb: 4 }}>
                            <SectionTitle>Answer Options</SectionTitle>
                            <Stack spacing={2}>
                                {fields.map((field, index) => (
                                    <ChoiceOption key={field.id}>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder={`Option ${index + 1}`}
                                                {...register(`choices.${index}.text` as const, {
                                                    required: 'Option text is required'
                                                })}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    }
                                                }}
                                            />
                                        </Box>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <Select
                                                value={watch(`choices.${index}.emoji`) || ''}
                                                onChange={(e) => setValue(`choices.${index}.emoji`, e.target.value)}
                                                displayEmpty
                                                sx={{ borderRadius: 2 }}
                                            >
                                                <MenuItem value="">No emoji</MenuItem>
                                                {EMOJI_OPTIONS.map(emoji => (
                                                    <MenuItem key={emoji.value} value={emoji.emoji}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <span>{emoji.emoji}</span>
                                                            <span>{emoji.label}</span>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveChoice(index)}
                                            disabled={fields.length === 1}
                                            sx={{ color: 'error.main' }}
                                        >
                                            <RemoveIcon fontSize="small" />
                                        </IconButton>
                                    </ChoiceOption>
                                ))}
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={handleAddChoice}
                                    variant="text"
                                    size="small"
                                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                                >
                                    Add Option
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    {answerType === 'slider' && (
                        <Box sx={{ mb: 4 }}>
                            <SectionTitle>Slider Configuration</SectionTitle>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 4 }}>
                                    <TextField
                                        fullWidth
                                        label="Min Value"
                                        type="number"
                                        size="small"
                                        {...register('slider_min', { valueAsNumber: true })}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <TextField
                                        fullWidth
                                        label="Max Value"
                                        type="number"
                                        size="small"
                                        {...register('slider_max', { valueAsNumber: true })}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <TextField
                                        fullWidth
                                        label="Step"
                                        type="number"
                                        size="small"
                                        {...register('slider_step', { valueAsNumber: true })}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 3, px: 2 }}>
                                <Slider
                                    value={[watch('slider_min') || 0, watch('slider_max') || 100]}
                                    onChange={(_, newValue) => {
                                        if (Array.isArray(newValue)) {
                                            setValue('slider_min', newValue[0]);
                                            setValue('slider_max', newValue[1]);
                                        }
                                    }}
                                    valueLabelDisplay="auto"
                                    disabled
                                />
                            </Box>
                        </Box>
                    )}

                    {answerType === 'rating_scale' && (
                        <Box sx={{ mb: 4 }}>
                            <SectionTitle>Rating Scale Configuration</SectionTitle>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Min Value"
                                        type="number"
                                        size="small"
                                        {...register('rating_scale_min', { valueAsNumber: true })}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Max Value"
                                        type="number"
                                        size="small"
                                        {...register('rating_scale_max', { valueAsNumber: true })}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', px: 2 }}>
                                {Array.from({ length: watch('rating_scale_max') || 5 }, (_, i) => i + (watch('rating_scale_min') || 1)).map(num => (
                                    <Chip key={num} label={num} size="small" variant="outlined" />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {answerType === 'emoji_scale' && (
                        <Box sx={{ mb: 4 }}>
                            <SectionTitle>Emoji Scale Options</SectionTitle>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                {EMOJI_OPTIONS.map(emoji => (
                                    <Box key={emoji.value} sx={{ textAlign: 'center' }}>
                                        <Avatar
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                bgcolor: alpha(emoji.color, 0.1),
                                                color: emoji.color,
                                                fontSize: 32,
                                                margin: '0 auto',
                                            }}
                                        >
                                            {emoji.emoji}
                                        </Avatar>
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            {emoji.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Divider sx={{ my: 3 }} />

                    {/* Additional Settings */}
                    <Box sx={{ mb: 4 }}>
                        <SectionTitle>Additional Settings</SectionTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Make this question required
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Users must answer to submit
                                </Typography>
                            </Box>
                            <Controller
                                name="is_required"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        color="primary"
                                    />
                                )}
                            />
                        </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                        <Button
                            variant="text"
                            onClick={() => navigate('/')}
                            sx={{ textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 4,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Question'}
                        </Button>
                    </Box>
                </form>
            </FormCard>
        </Container>
    );
};

export default CreateQuestion;