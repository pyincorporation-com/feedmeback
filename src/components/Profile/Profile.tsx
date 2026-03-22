import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Box,
    Alert,
    Grid,
    Divider,
    IconButton,
    CircularProgress,
    useTheme,
    alpha,
    Card,
    CardContent,
    Chip,
    Fade,
    Zoom,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    LinearProgress,
    InputAdornment,
    Snackbar,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateProfile, deleteAccount, changePassword } from '../../store/slices/authSlice';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useNavigate } from 'react-router-dom';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 32,
    background: 'linear-gradient(135deg, #fff 0%, #fafcff 100%)',
    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.02)',
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 24px 48px -12px rgba(0,0,0,0.12)',
    },
}));

const AvatarContainer = styled(Box)({
    position: 'relative',
    display: 'inline-block',
    cursor: 'pointer',
});

const AvatarOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
        opacity: 1,
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 16,
        transition: 'all 0.2s ease',
        backgroundColor: alpha(theme.palette.background.default, 0.5),
        '&:hover': {
            backgroundColor: alpha(theme.palette.background.default, 0.8),
        },
        '&.Mui-focused': {
            backgroundColor: theme.palette.background.default,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
    },
}));

const GradientButton = styled(Button)(({ theme }) => ({
    borderRadius: 40,
    padding: '10px 32px',
    textTransform: 'none',
    fontSize: '0.95rem',
    fontWeight: 600,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    transition: 'all 0.3s ease',
    color: 'white',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
}));

const DangerCard = styled(Paper)(({ theme }) => ({
    borderRadius: 24,
    padding: theme.spacing(3),
    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.02)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: alpha(theme.palette.error.main, 0.4),
        boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.1)}`,
    },
}));

const InfoChip = styled(Chip)(({ theme }) => ({
    borderRadius: 12,
    height: 28,
    fontSize: '0.75rem',
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    '& .MuiChip-icon': {
        fontSize: 16,
        color: theme.palette.primary.main,
    },
}));

const DeleteConfirmTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 16,
        backgroundColor: alpha(theme.palette.background.default, 0.5),
    },
}));

interface ProfileForm {
    username: string;
    email: string;
    bio: string;
}

interface PasswordForm {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

const Profile: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, loading } = useAppSelector((state) => state.auth);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileForm>({
        defaultValues: {
            username: user?.username || '',
            email: user?.email || '',
            bio: user?.bio || '',
        }
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        watch: watchPassword,
        reset: resetPasswordForm
    } = useForm<PasswordForm>();

    const watchedUsername = watch('username');
    const watchedBio = watch('bio');
    const newPassword = watchPassword('new_password');

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
        setTimeout(() => setSnackbarOpen(false), 5000);
    };

    const onSubmit = async (data: ProfileForm) => {
        try {
            setError(null);
            setUploadingAvatar(true);

            const formData = new FormData();
            formData.append('username', data.username);
            formData.append('email', data.email);
            if (data.bio) formData.append('bio', data.bio);

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await dispatch(updateProfile(formData)).unwrap();
            setSuccess(true);
            showSnackbar('Profile updated successfully!', 'success');

            if (avatarFile) {
                setAvatarPreview(null);
                setAvatarFile(null);
            }

            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            const errorMsg = err?.message || 'Failed to update profile';
            setError(errorMsg);
            showSnackbar(errorMsg, 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                const errorMsg = 'Please select an image file';
                setError(errorMsg);
                showSnackbar(errorMsg, 'error');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                const errorMsg = 'Image size should be less than 5MB';
                setError(errorMsg);
                showSnackbar(errorMsg, 'error');
                return;
            }

            setAvatarFile(file);
            setError(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setAvatarFile(null);
    };

    const handleDeleteAccountClick = () => {
        setDeleteDialogOpen(true);
        setDeleteError(null);
        setConfirmText('');
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setConfirmText('');
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        if (confirmText !== 'DELETE') {
            setDeleteError('Please type "DELETE" to confirm account deletion');
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        try {
            await dispatch(deleteAccount()).unwrap();
            showSnackbar('Account deleted successfully', 'success');
            navigate('/login', {
                state: {
                    message: 'Your account has been successfully deleted. We\'re sad to see you go!'
                }
            });
        } catch (err: any) {
            const errorMsg = err?.message || 'Failed to delete account. Please try again.';
            setDeleteError(errorMsg);
            showSnackbar(errorMsg, 'error');
            setDeleting(false);
        }
    };

    const handlePasswordDialogOpen = () => {
        setPasswordDialogOpen(true);
        resetPasswordForm();
        setPasswordError(null);
        setPasswordSuccess(false);
    };

    const handlePasswordDialogClose = () => {
        setPasswordDialogOpen(false);
        setPasswordError(null);
        setPasswordSuccess(false);
        resetPasswordForm();
    };

    const onPasswordSubmit = async (data: PasswordForm) => {
        if (data.new_password !== data.confirm_password) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (data.new_password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return;
        }

        setChangingPassword(true);
        setPasswordError(null);

        try {
            await dispatch(changePassword({
                old_password: data.old_password,
                new_password: data.new_password
            })).unwrap();

            setPasswordSuccess(true);
            showSnackbar('Password changed successfully!', 'success');
            setTimeout(() => {
                handlePasswordDialogClose();
            }, 2000);
        } catch (err: any) {
            const errorMsg = err?.message || 'Failed to change password. Please check your current password.';
            setPasswordError(errorMsg);
            showSnackbar(errorMsg, 'error');
        } finally {
            setChangingPassword(false);
        }
    };

    if (!user) {
        return null;
    }

    const bioLength = watchedBio?.length || 0;
    const maxBioLength = 500;

    return (
        <>
            <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Profile Settings
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your personal information and profile picture
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Main Form Card */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Fade in timeout={500}>
                            <StyledCard elevation={0}>
                                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                                    {success && (
                                        <Zoom in>
                                            <Alert
                                                severity="success"
                                                sx={{ mb: 3, borderRadius: 16 }}
                                                icon={<CheckCircleIcon />}
                                            >
                                                Profile updated successfully!
                                            </Alert>
                                        </Zoom>
                                    )}

                                    {error && (
                                        <Fade in>
                                            <Alert
                                                severity="error"
                                                sx={{ mb: 3, borderRadius: 16 }}
                                                onClose={() => setError(null)}
                                            >
                                                {error}
                                            </Alert>
                                        </Fade>
                                    )}

                                    {/* Avatar Section */}
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: 'center',
                                        gap: 4,
                                        mb: 5,
                                        pb: 3,
                                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}>
                                        <AvatarContainer>
                                            <Avatar
                                                src={avatarPreview || user.avatar || undefined}
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                    transition: 'transform 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.02)',
                                                    },
                                                }}
                                            >
                                                {user.username[0].toUpperCase()}
                                            </Avatar>
                                            <AvatarOverlay>
                                                <Tooltip title="Change photo">
                                                    <IconButton
                                                        component="label"
                                                        sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                                                    >
                                                        <PhotoCameraIcon sx={{ fontSize: 32 }} />
                                                        <VisuallyHiddenInput
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleAvatarChange}
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                            </AvatarOverlay>
                                        </AvatarContainer>

                                        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                                {user.username}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {user.email}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' }, flexWrap: 'wrap' }}>
                                                <Button
                                                    component="label"
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<CloudUploadIcon />}
                                                    sx={{ borderRadius: 20, textTransform: 'none' }}
                                                >
                                                    Upload New
                                                    <VisuallyHiddenInput
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleAvatarChange}
                                                    />
                                                </Button>
                                                {(avatarPreview || user.avatar) && (
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        color="error"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={handleRemoveAvatar}
                                                        sx={{ borderRadius: 20, textTransform: 'none' }}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<VpnKeyIcon />}
                                                    onClick={handlePasswordDialogOpen}
                                                    sx={{ borderRadius: 20, textTransform: 'none' }}
                                                >
                                                    Change Password
                                                </Button>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                JPG, PNG or GIF. Max 5MB
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PersonIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                    Username
                                                </Typography>
                                                <StyledTextField
                                                    fullWidth
                                                    placeholder="Your username"
                                                    {...register('username', {
                                                        required: 'Username is required',
                                                        minLength: { value: 3, message: 'Username must be at least 3 characters' }
                                                    })}
                                                    error={!!errors.username}
                                                    helperText={errors.username?.message}
                                                    disabled={loading || uploadingAvatar}
                                                    InputProps={{
                                                        startAdornment: watchedUsername && (
                                                            <Box component="span" sx={{ mr: 1, color: 'success.main' }}>
                                                                ✓
                                                            </Box>
                                                        ),
                                                    }}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <EmailIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                    Email Address
                                                </Typography>
                                                <StyledTextField
                                                    fullWidth
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    {...register('email', {
                                                        required: 'Email is required',
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: 'Invalid email address'
                                                        }
                                                    })}
                                                    error={!!errors.email}
                                                    helperText={errors.email?.message}
                                                    disabled={loading || uploadingAvatar}
                                                />
                                            </Grid>

                                            <Grid size={12}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <InfoIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                    Bio
                                                </Typography>
                                                <StyledTextField
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    placeholder="Tell us something about yourself..."
                                                    {...register('bio')}
                                                    disabled={loading || uploadingAvatar}
                                                    helperText={`${bioLength}/${maxBioLength} characters`}
                                                    FormHelperTextProps={{
                                                        sx: { textAlign: 'right', mt: 1 }
                                                    }}
                                                    inputProps={{ maxLength: maxBioLength }}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                            <GradientButton
                                                type="submit"
                                                disabled={loading || uploadingAvatar}
                                            >
                                                {(loading || uploadingAvatar) ? (
                                                    <CircularProgress size={24} sx={{ color: 'white' }} />
                                                ) : (
                                                    <>
                                                        <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                                                        Save Changes
                                                    </>
                                                )}
                                            </GradientButton>
                                        </Box>
                                    </form>
                                </CardContent>
                            </StyledCard>
                        </Fade>
                    </Grid>

                    {/* Right Sidebar - Stats and Info */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Fade in timeout={500}>
                            <Box sx={{ position: 'sticky', top: 24 }}>
                                {/* Stats Card */}
                                <StyledCard elevation={0} sx={{ mb: 3 }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                            Account Stats
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Member since
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </Typography>
                                            </Box>
                                            <Divider />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Account Status
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        Active
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Divider />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Email Verification
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <InfoChip
                                                        icon={<CheckCircleIcon />}
                                                        label="Verified"
                                                        size="small"
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </StyledCard>

                                {/* Quick Tips Card */}
                                <StyledCard elevation={0}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                            Quick Tips
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                    ✨ Choose a great avatar
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    A good profile picture helps others recognize you
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                    📝 Complete your bio
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Share your expertise and interests
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                    🔒 Keep your email updated
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Important notifications will be sent here
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                    🔑 Change password regularly
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    For better security, update your password periodically
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </StyledCard>
                            </Box>
                        </Fade>
                    </Grid>

                    {/* Danger Zone - Full Width */}
                    <Grid size={12}>
                        <Fade in timeout={500}>
                            <DangerCard elevation={0}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                                    <WarningAmberIcon sx={{ color: 'error.main', fontSize: 40 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main', mb: 1 }}>
                                            Danger Zone
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Once you delete your account, there is no going back. All your questions, answers,
                                            and data will be permanently removed. This action cannot be undone.
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={handleDeleteAccountClick}
                                            sx={{
                                                borderRadius: 40,
                                                textTransform: 'none',
                                                px: 4,
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                                                }
                                            }}
                                            startIcon={<WarningAmberIcon />}
                                        >
                                            Delete Account
                                        </Button>
                                    </Box>
                                </Box>
                            </DangerCard>
                        </Fade>
                    </Grid>
                </Grid>
            </Container>

            {/* Delete Account Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteDialogClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #fff 0%, #fafcff 100%)',
                        p: 1,
                    }
                }}
            >
                <DialogTitle sx={{
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    color: 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}>
                    <WarningAmberIcon sx={{ fontSize: 28 }} />
                    Delete Account
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3, fontSize: '1rem' }}>
                        This action is <strong>permanent and cannot be undone</strong>. You will lose:
                    </DialogContentText>
                    <Box sx={{ mb: 3, pl: 2 }}>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                            • All your questions and answers
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                            • All your reactions and interactions
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                            • Your profile information and settings
                        </Typography>
                        <Typography component="li" variant="body2">
                            • Access to all your data
                        </Typography>
                    </Box>
                    <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight={500}>
                            To confirm deletion, type <strong>"DELETE"</strong> in the field below.
                        </Typography>
                    </Alert>
                    <DeleteConfirmTextField
                        fullWidth
                        autoFocus
                        placeholder="Type DELETE to confirm"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        disabled={deleting}
                        error={!!deleteError}
                        helperText={deleteError}
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
                    <Button
                        onClick={handleDeleteDialogClose}
                        disabled={deleting}
                        sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        disabled={deleting || confirmText !== 'DELETE'}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            '&:disabled': {
                                backgroundColor: alpha(theme.palette.error.main, 0.5),
                            }
                        }}
                    >
                        {deleting ? <CircularProgress size={24} /> : 'Delete Account'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog
                open={passwordDialogOpen}
                onClose={handlePasswordDialogClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #fff 0%, #fafcff 100%)',
                        p: 1,
                    }
                }}
            >
                <DialogTitle sx={{
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}>
                    <LockIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
                    Change Password
                </DialogTitle>
                <DialogContent>
                    {passwordSuccess ? (
                        <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                            Password changed successfully! You can now use your new password to log in.
                        </Alert>
                    ) : (
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                            <StyledTextField
                                fullWidth
                                type={showOldPassword ? 'text' : 'password'}
                                label="Current Password"
                                placeholder="Enter your current password"
                                {...registerPassword('old_password', {
                                    required: 'Current password is required'
                                })}
                                error={!!passwordErrors.old_password}
                                helperText={passwordErrors.old_password?.message}
                                disabled={changingPassword}
                                sx={{ mb: 3, mt: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowOldPassword(!showOldPassword)}
                                                edge="end"
                                            >
                                                {showOldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <StyledTextField
                                fullWidth
                                type={showNewPassword ? 'text' : 'password'}
                                label="New Password"
                                placeholder="Enter new password (min. 8 characters)"
                                {...registerPassword('new_password', {
                                    required: 'New password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters'
                                    }
                                })}
                                error={!!passwordErrors.new_password}
                                helperText={passwordErrors.new_password?.message}
                                disabled={changingPassword}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                edge="end"
                                            >
                                                {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <StyledTextField
                                fullWidth
                                type={showConfirmPassword ? 'text' : 'password'}
                                label="Confirm New Password"
                                placeholder="Confirm your new password"
                                {...registerPassword('confirm_password', {
                                    required: 'Please confirm your password',
                                    validate: value => value === newPassword || 'Passwords do not match'
                                })}
                                error={!!passwordErrors.confirm_password}
                                helperText={passwordErrors.confirm_password?.message}
                                disabled={changingPassword}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <DialogActions sx={{ mt: 2, p: 0, gap: 1 }}>
                                <Button
                                    onClick={handlePasswordDialogClose}
                                    disabled={changingPassword}
                                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={changingPassword}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        px: 3,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    }}
                                >
                                    {changingPassword ? <CircularProgress size={24} /> : 'Change Password'}
                                </Button>
                            </DialogActions>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={5000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ borderRadius: 2, minWidth: 300 }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Profile;