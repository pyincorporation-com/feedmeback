import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Chip,
    Stack,
    IconButton,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchQuestion, updateQuestion } from '../../store/slices/questionSlice';
import BackgroundWave from '../BackgroundWave';

const FormCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    background: '#fff',
    borderRadius: 24,
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
}));

interface QuestionForm {
    title: string;
    description: string;
    is_active: boolean;
}

const EditQuestion: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentQuestion, loading } = useAppSelector((state) => state.questions);
    const [submitting, setSubmitting] = useState(false);
    const theme = useTheme();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<QuestionForm>();

    useEffect(() => {
        if (id) {
            dispatch(fetchQuestion(id));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (currentQuestion) {
            reset({
                title: currentQuestion.title,
                description: currentQuestion.description,
                is_active: currentQuestion.is_active,
            });
        }
    }, [currentQuestion, reset]);

    const onSubmit = async (data: QuestionForm) => {
        setSubmitting(true);
        setError(null);

        try {
            await dispatch(updateQuestion({
                id: id!,
                data: {
                    title: data.title,
                    description: data.description,
                    is_active: data.is_active,
                }
            })).unwrap();

            setSuccess(true);
            setTimeout(() => {
                navigate(`/question/${id}`);
            }, 1500);
        } catch (err: any) {
            setError(err?.message || 'Failed to update question');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !currentQuestion) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <BackgroundWave speed={0.2} />
            <Container maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 10 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                    <ArrowBackIcon />
                </IconButton>

                <FormCard elevation={0}>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        Edit Question
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Update your question details
                    </Typography>

                    {success && (
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            Question updated successfully! Redirecting...
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Question Title"
                                {...register('title', {
                                    required: 'Title is required',
                                    minLength: { value: 10, message: 'Title must be at least 10 characters' }
                                })}
                                error={!!errors.title}
                                helperText={errors.title?.message}
                                disabled={submitting}
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={4}
                                {...register('description', {
                                    required: 'Description is required',
                                    minLength: { value: 20, message: 'Description must be at least 20 characters' }
                                })}
                                error={!!errors.description}
                                helperText={errors.description?.message}
                                disabled={submitting}
                            />

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(-1)}
                                    disabled={submitting}
                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={submitting}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    }}
                                >
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </FormCard>
            </Container>
        </>
    );
};

export default EditQuestion;