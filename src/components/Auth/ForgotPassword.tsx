import React, { useState } from 'react';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    InputAdornment,
    useTheme,
    alpha,
    Stack,
    Divider,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import BackgroundWave from '../BackgroundWave';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import LockResetIcon from '@mui/icons-material/LockReset';

// Form interface
interface ForgotPasswordForm {
    email: string;
}

// Styled components
const FullScreenContainer = styled(Box)({
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const ContentWrapper = styled(Box)({
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    padding: '20px',
});

const GlassCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRadius: '32px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.02)',
    transition: 'transform 0.2s ease',
    '@media (max-width: 600px)': {
        padding: theme.spacing(3),
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        backgroundColor: alpha(theme.palette.common.white, 0.9),
        transition: 'all 0.2s ease',
        '& fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.1),
            borderWidth: '1px',
        },
        '&:hover fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.3),
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            borderWidth: '1px',
        },
    },
    '& .MuiInputLabel-root': {
        color: alpha(theme.palette.text.primary, 0.7),
    },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    padding: '14px',
    borderRadius: '40px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: 'white',
    boxShadow: '0 8px 20px -5px rgba(37, 99, 235, 0.2)',
    '&:hover': {
        background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)',
        transform: 'translateY(-1px)',
        boxShadow: '0 12px 25px -5px rgba(37, 99, 235, 0.3)',
    },
    transition: 'all 0.2s ease',
}));

const BackButton = styled(IconButton)({
    position: 'absolute',
    top: '24px',
    left: '24px',
    zIndex: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
});

const Title = styled(Typography)({
    fontWeight: 700,
    fontSize: '2rem',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #1a1f36, #2563eb)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
});

const StyledLink = styled(Link)(({ theme }) => ({
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
        textDecoration: 'underline',
    },
}));

const SuccessCard = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(3),
    backgroundColor: alpha(theme.palette.success.light, 0.1),
    borderRadius: '24px',
    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
}));

const IconCircle = styled(Box)(({ theme }) => ({
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
    color: theme.palette.primary.main,
}));

const ForgotPassword: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();

    const onSubmit = async (data: ForgotPasswordForm) => {
        setLoading(true);
        setError(null);

        try {
            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Store email for success message
            setSubmittedEmail(data.email);
            setSuccess(true);

            // In a real app, you would call your API here:
            // await api.post('/auth/forgot-password/', { email: data.email });

        } catch (err) {
            setError('Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = () => {
        // Implement resend logic
        onSubmit({ email: submittedEmail });
    };

    return (
        <FullScreenContainer>
            {/* Wave Background */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                }}
            >
                <BackgroundWave speed={0.2} />
            </Box>

            {/* Back Button */}
            <BackButton onClick={() => navigate('/login')}>
                <ArrowBackIcon />
            </BackButton>

            {/* Forgot Password Form */}
            <ContentWrapper>
                <GlassCard elevation={0}>
                    {!success ? (
                        <>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <IconCircle>
                                    <LockResetIcon sx={{ fontSize: 32 }} />
                                </IconCircle>
                                <Title variant="h4">
                                    Forgot Password?
                                </Title>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    No worries! Enter your email address and we'll send you a link to reset your password.
                                </Typography>
                            </Box>

                            {error && (
                                <Alert
                                    severity="error"
                                    onClose={() => setError(null)}
                                    sx={{
                                        mb: 3,
                                        borderRadius: '16px',
                                        '& .MuiAlert-icon': { alignItems: 'center' }
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Stack spacing={2.5}>
                                    <StyledTextField
                                        fullWidth
                                        placeholder="Email address"
                                        label="Email"
                                        type="email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Please enter a valid email address'
                                            }
                                        })}
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailOutlinedIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <SubmitButton
                                        type="submit"
                                        fullWidth
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : 'Send reset link'}
                                    </SubmitButton>
                                </Stack>
                            </form>

                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Divider sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Remember your password?
                                    </Typography>
                                </Divider>
                                <StyledLink to="/login">
                                    Back to sign in
                                </StyledLink>
                            </Box>
                        </>
                    ) : (
                        // Success State
                        <Box sx={{ textAlign: 'center' }}>
                            <IconCircle sx={{ background: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                <MarkEmailReadIcon sx={{ fontSize: 32 }} />
                            </IconCircle>

                            <Title variant="h4" sx={{ fontSize: '1.8rem', mb: 2 }}>
                                Check your email
                            </Title>

                            <SuccessCard>
                                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                                    We've sent a reset link to:
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: theme.palette.primary.main,
                                        fontWeight: 600,
                                        wordBreak: 'break-all'
                                    }}
                                >
                                    {submittedEmail}
                                </Typography>
                            </SuccessCard>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 2 }}>
                                Didn't receive the email? Check your spam folder or{' '}
                                <Button
                                    onClick={handleResendEmail}
                                    sx={{
                                        textTransform: 'none',
                                        p: 0,
                                        minWidth: 'auto',
                                        verticalAlign: 'baseline',
                                        fontSize: 'inherit',
                                        fontWeight: 600,
                                        color: theme.palette.primary.main,
                                        '&:hover': {
                                            background: 'transparent',
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    click here to resend
                                </Button>
                            </Typography>

                            <Divider sx={{ my: 3 }} />

                            <Stack direction="row" spacing={2} justifyContent="center">
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        borderRadius: '40px',
                                        textTransform: 'none',
                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                        color: theme.palette.text.primary,
                                        '&:hover': {
                                            borderColor: theme.palette.primary.main,
                                            background: alpha(theme.palette.primary.main, 0.04),
                                        },
                                    }}
                                >
                                    Back to sign in
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/register')}
                                    sx={{
                                        borderRadius: '40px',
                                        textTransform: 'none',
                                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)',
                                        },
                                    }}
                                >
                                    Create new account
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        align="center"
                        sx={{
                            display: 'block',
                            mt: 3,
                            fontSize: '0.75rem',
                        }}
                    >
                        By continuing, you agree to our{' '}
                        <StyledLink to="/terms">Terms</StyledLink> and{' '}
                        <StyledLink to="/privacy">Privacy Policy</StyledLink>
                    </Typography>
                </GlassCard>
            </ContentWrapper>
        </FullScreenContainer>
    );
};

export default ForgotPassword;