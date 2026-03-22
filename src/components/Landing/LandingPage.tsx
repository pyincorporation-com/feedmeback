import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    useTheme,
    alpha,
    IconButton,
    Paper,
    useMediaQuery,
    LinearProgress,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import BackgroundWave from '../BackgroundWave';
import PrivateRoute from '../Auth/PrivateRoute';
import Dashboard from '../Dashboard/Dashboard';
import { useAppSelector } from '../../hooks/redux';

// Styled components with improved widescreen design
const FullScreenContainer = styled(Box)({
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: '#ffffff',
});

const ContentOverlay = styled(Box)({
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px',
    zIndex: 10,
    overflowY: 'auto',
    '@media (min-width: 1200px)': {
        padding: '32px 48px',
    },
    '@media (min-width: 1600px)': {
        padding: '40px 64px',
    },
});

const GlassHeader = styled(Paper)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'fit-content',
    margin: '0 auto',
    padding: '12px 32px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '100px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    '@media (min-width: 600px)': {
        padding: '14px 40px',
    },
    '@media (min-width: 1200px)': {
        padding: '16px 48px',
    },
}));

const Logo = styled(Typography)(({ theme }) => ({
    fontWeight: 800,
    fontSize: '1.4rem',
    letterSpacing: '-0.5px',
    background: 'linear-gradient(135deg, #1a1f36, #2563eb)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    '@media (min-width: 600px)': {
        fontSize: '1.6rem',
    },
    '@media (min-width: 1200px)': {
        fontSize: '1.8rem',
    },
}));

const CenterContent = styled(Box)({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    width: '100%',
    maxWidth: 'min(90%, 900px)',
    padding: '0 24px',
    zIndex: 20,
});

const Title = styled(Typography)(({ theme }) => ({
    fontWeight: 800,
    fontSize: 'clamp(2rem, 8vw, 5.5rem)',
    lineHeight: 1.1,
    marginBottom: 16,
    color: '#1a1f36',
    letterSpacing: '-0.02em',
}));

const GradientText = styled(Box)({
    background: 'linear-gradient(135deg, #2563eb, #7c3aed, #db2777)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
});

const Subtitle = styled(Typography)(({ theme }) => ({
    fontSize: 'clamp(1rem, 3vw, 1.4rem)',
    color: '#1e293b',
    marginBottom: 32,
    fontWeight: 400,
    maxWidth: 'min(90%, 650px)',
    marginLeft: 'auto',
    marginRight: 'auto',
    '@media (min-width: 1200px)': {
        marginBottom: 40,
        fontSize: '1.5rem',
    },
}));

const GlassFooter = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    width: 'fit-content',
    margin: '0 auto',
    padding: '16px 32px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '100px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    '@media (min-width: 600px)': {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '12px 40px',
        gap: 32,
    },
    '@media (min-width: 1200px)': {
        padding: '14px 48px',
        gap: 48,
    },
    '@media (min-width: 1600px)': {
        padding: '16px 64px',
        gap: 64,
    },
}));

const SocialLink = styled(IconButton)(({ theme }) => ({
    color: '#4a5568',
    padding: 8,
    '&:hover': {
        color: '#2563eb',
        background: 'rgba(37, 99, 235, 0.05)',
        transform: 'translateY(-2px)',
    },
    transition: 'all 0.2s ease',
}));

const CTAButton = styled(Button)({
    padding: '12px 28px',
    borderRadius: '40px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: 'white',
    boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
    whiteSpace: 'nowrap',
    '@media (min-width: 600px)': {
        padding: '14px 36px',
        fontSize: '1.1rem',
    },
    '@media (min-width: 1200px)': {
        padding: '16px 48px',
        fontSize: '1.2rem',
    },
    '&:hover': {
        background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)',
        transform: 'translateY(-2px)',
        boxShadow: '0 15px 30px -5px rgba(37, 99, 235, 0.4)',
    },
    transition: 'all 0.3s ease',
});

const SecondaryButton = styled(Button)({
    padding: '12px 28px',
    borderRadius: '40px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    color: '#1d4ed8',
    borderColor: alpha('#1d4ed8', 1),
    '@media (min-width: 600px)': {
        padding: '14px 36px',
        fontSize: '1.1rem',
    },
    '@media (min-width: 1200px)': {
        padding: '16px 48px',
        fontSize: '1.2rem',
    },
    '&:hover': {
        borderColor: '#2563eb',
        background: alpha('#2563eb', 0.04),
    },
});

const FeatureChip = styled(Typography)({
    fontSize: '0.8rem',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    '@media (min-width: 600px)': {
        fontSize: '0.9rem',
    },
    '@media (min-width: 1200px)': {
        fontSize: '1rem',
    },
});

const FooterLink = styled(Typography)({
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    '@media (min-width: 600px)': {
        fontSize: '0.9rem',
    },
    '@media (min-width: 1200px)': {
        fontSize: '1rem',
    },
    '&:hover': {
        color: '#2563eb',
    },
});

const LandingPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <FullScreenContainer>
            {/* 3D Canvas Background */}
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
                <BackgroundWave speed={0.3} />
            </Box>

            {/* Content Overlay */}
            <ContentOverlay>
                {/* Header - Only Logo */}
                <Logo variant="h1">
                    <Box
                        component={'img'}
                        src='/android-chrome-512x512.png'
                        sx={{
                            width: 50
                        }}
                    />
                </Logo>

                {/* Center Content */}
                <CenterContent>
                    <Title variant="h1">
                        What’s {' '}
                        <GradientText>
                            on Your Mind?
                        </GradientText>
                    </Title>

                    <Subtitle variant="h5">
                        {isMobile
                            ? "Real-time conversations. No limits."
                            : "Real-time conversations. Unlimited questions. Unlimited answers. Just feedback."}
                    </Subtitle>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="center"
                        sx={{ width: '100%', mb: 4 }}
                    >
                        <CTAButton
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/register')}
                            endIcon={<ArrowForwardIcon />}
                            fullWidth={isMobile}
                        >
                            Start gathering feedback
                        </CTAButton>

                        <SecondaryButton
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/login')}
                            fullWidth={isMobile}
                        >
                            Sign in
                        </SecondaryButton>
                    </Stack>

                    {/* Feature Chips */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={3}
                        justifyContent="center"
                        sx={{ mt: 2 }}
                    >
                        <FeatureChip variant="body2">
                            <Box component="span" sx={{ color: '#2563eb', fontSize: '1.2rem' }}>✦</Box>
                            Completely free
                        </FeatureChip>
                        <FeatureChip variant="body2">
                            <Box component="span" sx={{ color: '#7c3aed', fontSize: '1.2rem' }}>✦</Box>
                            Unlimited questions
                        </FeatureChip>
                        <FeatureChip variant="body2">
                            <Box component="span" sx={{ color: '#db2777', fontSize: '1.2rem' }}>✦</Box>
                            Unlimited answers
                        </FeatureChip>
                    </Stack>
                </CenterContent>

                {/* Footer */}
                <GlassFooter elevation={0}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#475569',
                            fontWeight: 400,
                            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                            whiteSpace: 'nowrap',
                        }}
                    >
                        © 2026 powered by <a href='https://tridelight.com' target='_blank' >TrideLight</a>
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            '& .MuiIconButton-root': {
                                color: '#64748b',
                            },
                        }}
                    >
                        <SocialLink
                            size="small"
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <TwitterIcon fontSize="small" />
                        </SocialLink>
                        <SocialLink
                            size="small"
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <GitHubIcon fontSize="small" />
                        </SocialLink>
                        <SocialLink
                            size="small"
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <LinkedInIcon fontSize="small" />
                        </SocialLink>
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={3}
                    >
                        <FooterLink
                            variant="body2"
                            onClick={() => {
                                window.open('https://tridelight.com/privacy-policy', '_blank', 'noopener,noreferrer');
                            }}
                        >
                            Privacy
                        </FooterLink>
                        <FooterLink
                            variant="body2"
                            onClick={() => {
                                window.open('https://tridelight.com/terms-and-conditions', '_blank', 'noopener,noreferrer');
                            }}
                        >
                            Terms
                        </FooterLink>
                    </Stack>
                </GlassFooter>
            </ContentOverlay>
        </FullScreenContainer>
    );
};

export default LandingPage;