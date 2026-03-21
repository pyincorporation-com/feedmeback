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
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateProfile } from '../../store/slices/authSlice';
import { alpha, styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

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

const AvatarContainer = styled(Box)({
    position: 'relative',
    display: 'inline-block',
});

const AvatarOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
        opacity: 1,
    },
}));

interface ProfileForm {
    username: string;
    email: string;
    bio: string;
}

const Profile: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user, loading } = useAppSelector((state) => state.auth);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileForm>({
        defaultValues: {
            username: user?.username || '',
            email: user?.email || '',
            bio: user?.bio || '',
        }
    });

    const onSubmit = async (data: ProfileForm) => {
        try {
            setError(null);

            // Create FormData to handle file upload
            const formData = new FormData();
            formData.append('username', data.username);
            formData.append('email', data.email);
            if (data.bio) formData.append('bio', data.bio);

            // Add avatar file if selected
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await dispatch(updateProfile(formData)).unwrap();
            setSuccess(true);

            // Clear avatar preview after successful upload
            if (avatarFile) {
                setAvatarPreview(null);
                setAvatarFile(null);
            }

            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err?.message || 'Failed to update profile');
        }
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
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

    if (!user) {
        return null;
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: { xs: 3, sm: 4 } }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        Profile Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Manage your personal information and profile picture
                    </Typography>

                    {success && (
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            Profile updated successfully!
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {/* Avatar Section */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3, mb: 4 }}>
                        <AvatarContainer>
                            <Avatar
                                src={avatarPreview || user.avatar || undefined}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    border: '3px solid #fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                            >
                                {user.username[0].toUpperCase()}
                            </Avatar>
                            <AvatarOverlay>
                                <Button
                                    component="label"
                                    sx={{ color: 'white', minWidth: 'auto' }}
                                >
                                    <PhotoCameraIcon />
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </Button>
                            </AvatarOverlay>
                        </AvatarContainer>

                        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                Profile Picture
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                JPG, GIF or PNG. Max size 5MB.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    size="small"
                                    startIcon={<CloudUploadIcon />}
                                >
                                    Upload
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
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    {...register('username', {
                                        required: 'Username is required',
                                        minLength: { value: 3, message: 'Username must be at least 3 characters' }
                                    })}
                                    error={!!errors.username}
                                    helperText={errors.username?.message}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
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
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    label="Bio"
                                    multiline
                                    rows={4}
                                    {...register('bio')}
                                    placeholder="Tell us about yourself..."
                                    disabled={loading}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    minWidth: 140,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                            </Button>
                        </Box>
                    </form>

                    {/* Danger Zone */}
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle2" sx={{ color: 'error.main', fontWeight: 600, mb: 2 }}>
                            Danger Zone
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 3, borderColor: 'error.main', bgcolor: alpha('#f44336', 0.02) }}>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Once you delete your account, there is no going back. All your questions, answers, and data will be permanently removed.
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                Delete Account
                            </Button>
                        </Paper>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Profile;