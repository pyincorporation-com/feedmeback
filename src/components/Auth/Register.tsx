import React from 'react';
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
    useTheme,
    alpha,
    Stack,
    Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { register as registerUser, clearError } from '../../store/slices/authSlice';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackgroundWave from '../BackgroundWave';
import { RegisterForm } from '../../types';

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

const Register: React.FC = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.auth);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
    const password = watch('password');

    const onSubmit = async (data: RegisterForm) => {
        const result = await dispatch(registerUser(data));
        if (registerUser.fulfilled.match(result)) {
            navigate('/login');
        }
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
            <BackButton onClick={() => navigate('/')}>
                <ArrowBackIcon />
            </BackButton>

            {/* Register Form */}
            <ContentWrapper>
                <GlassCard elevation={0}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Title variant="h4">
                            Create Account
                        </Title>
                        <Typography variant="body2" color="text.secondary">
                            Join the community and start gathering feedback
                        </Typography>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            onClose={() => dispatch(clearError())}
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
                                placeholder="Username"
                                label="Username"
                                {...register('username', {
                                    required: 'Username is required',
                                    minLength: { value: 3, message: 'Username must be at least 3 characters' }
                                })}
                                error={!!errors.username}
                                helperText={errors.username?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutlineIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <StyledTextField
                                fullWidth
                                placeholder="Email"
                                label="Email"
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
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

                            <StyledTextField
                                fullWidth
                                placeholder="Password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                                })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <StyledTextField
                                fullWidth
                                placeholder="Confirm Password"
                                label="Confirm Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('password2', {
                                    required: 'Please confirm your password',
                                    validate: value => value === password || 'Passwords do not match'
                                })}
                                error={!!errors.password2}
                                helperText={errors.password2?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                                size="small"
                                            >
                                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <SubmitButton
                                type="submit"
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? 'Creating account...' : 'Create account'}
                            </SubmitButton>
                        </Stack>

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Divider sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Already have an account?
                                </Typography>
                            </Divider>
                            <StyledLink to="/login">
                                Sign in here
                            </StyledLink>
                        </Box>
                    </form>

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
                        By creating an account, you agree to our{' '}
                        <StyledLink to="/terms">Terms</StyledLink> and{' '}
                        <StyledLink to="/privacy">Privacy Policy</StyledLink>
                    </Typography>
                </GlassCard>
            </ContentWrapper>
        </FullScreenContainer>
    );
};

export default Register;