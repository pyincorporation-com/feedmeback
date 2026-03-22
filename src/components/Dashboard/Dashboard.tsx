import React, { useEffect, useState } from 'react';
import {
    Grid,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Box,
    Chip,
    IconButton,
    Avatar,
    LinearProgress,
    useTheme,
    alpha,
    Tab,
    Tabs,
    Stack,
    Paper,
    useMediaQuery,
    Container,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getDashboardStats } from '../../store/slices/dashboardSlice';
import { fetchQuestions } from '../../store/slices/questionSlice';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PeopleIcon from '@mui/icons-material/People';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import InsightsIcon from '@mui/icons-material/Insights';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ShareIcon from '@mui/icons-material/Share';

// Chart imports
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// Styled components - responsive
const MetricCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5),
    background: '#fff',
    borderRadius: 16,
    height: '100%',
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    transition: 'background 0.2s ease',
    '&:hover': {
        background: alpha(theme.palette.primary.main, 0.02),
    },
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(2),
    },
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(2.5),
    },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5),
    background: '#fff',
    borderRadius: 16,
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(2),
    },
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(2.5),
    },
}));

const ActivityRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    '&:last-child': {
        borderBottom: 'none',
    },
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    '&:hover': {
        background: alpha(theme.palette.action.hover, 0.3),
    },
    [theme.breakpoints.up('sm')]: {
        gap: theme.spacing(2),
        padding: theme.spacing(1.5, 0),
    },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: '1rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1.5),
    [theme.breakpoints.up('sm')]: {
        fontSize: '1.1rem',
        marginBottom: theme.spacing(2),
    },
}));

const MetricValue = styled(Typography)(({ theme }) => ({
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
    color: theme.palette.text.primary,
    [theme.breakpoints.up('sm')]: {
        fontSize: '1.8rem',
    },
    [theme.breakpoints.up('md')]: {
        fontSize: '2rem',
    },
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    fontWeight: 400,
    [theme.breakpoints.up('sm')]: {
        fontSize: '0.8rem',
    },
    [theme.breakpoints.up('md')]: {
        fontSize: '0.9rem',
    },
}));

const SearchBar = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 0.5, 0.5, 1.5),
    background: '#fff',
    borderRadius: 40,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    transition: 'border-color 0.2s ease',
    '&:focus-within': {
        borderColor: theme.palette.primary.main,
    },
    [theme.breakpoints.up('sm')]: {
        gap: theme.spacing(1),
        padding: theme.spacing(0.75, 0.75, 0.75, 2),
    },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    fontSize: '0.75rem',
    fontWeight: 500,
    minWidth: 'auto',
    padding: theme.spacing(0.5, 1),
    '&.Mui-selected': {
        color: theme.palette.primary.main,
    },
    [theme.breakpoints.up('sm')]: {
        fontSize: '0.85rem',
        padding: theme.spacing(0.75, 1.5),
    },
    [theme.breakpoints.up('md')]: {
        fontSize: '0.9rem',
        padding: theme.spacing(1, 2),
    },
}));

const EmptyStateCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    textAlign: 'center',
    borderRadius: 20,
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    background: alpha(theme.palette.primary.main, 0.01),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(6),
        borderRadius: 24,
    },
}));

const OnboardingStep = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    borderRadius: 12,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
        background: alpha(theme.palette.primary.main, 0.02),
        transform: 'translateX(4px)',
    },
    [theme.breakpoints.up('sm')]: {
        gap: theme.spacing(2),
        padding: theme.spacing(2),
        borderRadius: 16,
    },
}));

const QuestionItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5),
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    '&:hover': {
        background: alpha(theme.palette.primary.main, 0.02),
        borderColor: alpha(theme.palette.primary.main, 0.2),
        transform: 'translateY(-2px)',
    },
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(2),
    },
}));

// Colors for charts
const CHART_COLORS = {
    primary: '#2563eb',
    secondary: '#7c3aed',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.warning, CHART_COLORS.error];

const Dashboard: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const { questions, loading: questionsLoading } = useAppSelector((state) => state.questions);
    const { user } = useAppSelector((state) => state.auth);
    const { stats, loading: statsLoading } = useAppSelector((state) => state.dashboard);

    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        dispatch(fetchQuestions());
        dispatch(getDashboardStats());
    }, [dispatch]);

    // Update search results when questions change
    useEffect(() => {
        if (searchTerm.trim()) {
            const filtered = questions.filter(q =>
                q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    }, [questions, searchTerm]);

    const handleSearch = () => {
        if (searchTerm.trim()) {
            setIsSearching(true);
            dispatch(fetchQuestions({ search: searchTerm }));
        } else {
            setIsSearching(false);
            setSearchResults([]);
            dispatch(fetchQuestions());
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
        setSearchResults([]);
        dispatch(fetchQuestions());
    };

    const handleRefresh = () => {
        dispatch(getDashboardStats());
        dispatch(fetchQuestions());
        if (searchTerm.trim()) {
            dispatch(fetchQuestions({ search: searchTerm }));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatNumber = (num: number) => {
        return num?.toLocaleString() || '0';
    };

    const hasNoData = () => {
        return (!stats || (
            stats.overview?.total_questions === 0 &&
            stats.overview?.total_answers === 0 &&
            (!stats.activity?.daily || stats.activity.daily.every(d => d.questions === 0 && d.answers === 0)) &&
            (!stats.most_answered || stats.most_answered.length === 0)
        ));
    };

    // Prepare data for pie chart
    const questionStatusData = stats?.questions ? [
        { name: 'Active', value: stats.questions.active || 0 },
        { name: 'Expired', value: stats.questions.expired || 0 },
        { name: 'Inactive', value: stats.questions.inactive || 0 },
    ] : [];

    const totalQuestions = stats?.overview?.total_questions || 0;
    const totalAnswers = stats?.overview?.total_answers || 0;

    // Loading state
    if (statsLoading && !stats) {
        return (
            <Box sx={{ width: '100%', p: 2 }}>
                <LinearProgress sx={{ borderRadius: 1 }} />
            </Box>
        );
    }

    const getAnswerTypeIcon = (type: string) => {
        switch (type) {
            case 'multiple_choice': return '☑️';
            case 'checkbox': return '✅';
            case 'rating_scale': return '⭐';
            case 'emoji_scale': return '😊';
            case 'slider': return '📊';
            case 'text_input': return '✏️';
            default: return '❓';
        }
    };

    return (
        <Container maxWidth='xl' sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Welcome back, {user?.username || 'User'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={statsLoading || questionsLoading}
                        sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            minWidth: 'auto',
                            px: { xs: 1, sm: 2 },
                        }}
                    >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Refresh</Box>
                        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>↻</Box>
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                        onClick={() => navigate('/questions/create')}
                        sx={{
                            bgcolor: CHART_COLORS.primary,
                            borderRadius: 40,
                            textTransform: 'none',
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                            px: { xs: 1.5, sm: 2, md: 3 },
                            py: { xs: 0.5, sm: 0.75 },
                            minWidth: 'auto',
                        }}
                    >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>New Question</Box>
                        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>New</Box>
                    </Button>
                </Box>
            </Box>

            {/* Search Bar */}
            <SearchBar sx={{ mb: 3 }}>
                <SearchIcon sx={{ color: 'text.secondary', fontSize: { xs: 18, sm: 20 } }} />
                <TextField
                    fullWidth
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!e.target.value.trim()) {
                            handleClearSearch();
                        }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                        sx: { fontSize: { xs: '0.85rem', sm: '0.95rem' } }
                    }}
                />
                {searchTerm && (
                    <Button
                        onClick={handleSearch}
                        size="small"
                        sx={{
                            textTransform: 'none',
                            color: CHART_COLORS.primary,
                            fontWeight: 500,
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            minWidth: 'auto',
                            px: { xs: 1, sm: 2 },
                        }}
                    >
                        Search
                    </Button>
                )}
            </SearchBar>

            {/* Search Results Section */}
            {isSearching && searchResults.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                            Search Results ({searchResults.length})
                        </Typography>
                        <Button
                            size="small"
                            onClick={handleClearSearch}
                            sx={{ textTransform: 'none', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                        >
                            Clear Search
                        </Button>
                    </Box>
                    <Stack spacing={1.5}>
                        {searchResults.map((question) => (
                            <QuestionItem
                                key={question.id}
                                onClick={() => navigate(`/question/${question.id}`)}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                            {question.title}
                                        </Typography>
                                        <Chip
                                            label={getAnswerTypeIcon(question.answer_type)}
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                    </Box>
                                    {question.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{
                                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}>
                                            {question.description}
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                                            {new Date(question.created_at).toLocaleDateString()}
                                        </Typography>
                                        <Chip
                                            label={`${question.answers_count || 0} answers`}
                                            size="small"
                                            sx={{ height: 18, fontSize: '0.6rem' }}
                                        />
                                        {question.is_required && (
                                            <Chip
                                                label="Required"
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 18, fontSize: '0.6rem' }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                                <KeyboardArrowRightIcon sx={{ color: 'text.secondary' }} />
                            </QuestionItem>
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Main Dashboard Content - Only show when not searching */}
            {!isSearching && (
                <>
                    {hasNoData() ? (
                        // Empty State - Welcome new user
                        <EmptyStateCard elevation={0}>
                            <Box sx={{ mb: 2 }}>
                                <Avatar
                                    sx={{
                                        width: { xs: 60, sm: 80 },
                                        height: { xs: 60, sm: 80 },
                                        margin: '0 auto',
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                    }}
                                >
                                    <RocketLaunchIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />
                                </Avatar>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                                Welcome to FeedMeBack! 🚀
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                Your dashboard will come to life once you start gathering feedback.
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 3, maxWidth: 900, mx: 'auto' }}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <OnboardingStep onClick={() => navigate('/questions/create')}>
                                        <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                            <AddIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                                        </Avatar>
                                        <Box sx={{ textAlign: 'left' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                                Create Question
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                                                Ask something meaningful
                                            </Typography>
                                        </Box>
                                    </OnboardingStep>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <OnboardingStep onClick={() => navigate('/my-questions')}>
                                        <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
                                            <ShareIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                                        </Avatar>
                                        <Box sx={{ textAlign: 'left' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                                Share Question
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                                                Get unique shareable link
                                            </Typography>
                                        </Box>
                                    </OnboardingStep>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <OnboardingStep onClick={() => navigate('/')}>
                                        <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                            <InsightsIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                                        </Avatar>
                                        <Box sx={{ textAlign: 'left' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                                Analyze Responses
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                                                See insights & visualizations
                                            </Typography>
                                        </Box>
                                    </OnboardingStep>
                                </Grid>
                            </Grid>
                            <Button
                                variant="contained"
                                size={isMobile ? "medium" : "large"}
                                onClick={() => navigate('/questions/create')}
                                startIcon={<AddIcon />}
                                sx={{
                                    borderRadius: 40,
                                    textTransform: 'none',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    px: { xs: 3, sm: 4 },
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                }}
                            >
                                Create Your First Question
                            </Button>
                        </EmptyStateCard>
                    ) : (
                        <>
                            {/* Quick Stats Row */}
                            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <MetricCard>
                                        <MetricValue>{formatNumber(totalQuestions)}</MetricValue>
                                        <MetricLabel>Total Questions</MetricLabel>
                                        {stats?.overview?.questions_last_week ? (
                                            <Chip
                                                size="small"
                                                label={`+${stats.overview.questions_last_week}`}
                                                sx={{
                                                    mt: 0.5,
                                                    height: 20,
                                                    fontSize: '0.6rem',
                                                    bgcolor: alpha(CHART_COLORS.success, 0.08),
                                                    color: CHART_COLORS.success,
                                                    '& .MuiChip-icon': { fontSize: 12, ml: 0.5 }
                                                }}
                                                icon={<TrendingUpIcon />}
                                            />
                                        ) : null}
                                    </MetricCard>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <MetricCard>
                                        <MetricValue>{formatNumber(totalAnswers)}</MetricValue>
                                        <MetricLabel>Answers Given</MetricLabel>
                                        {stats?.overview?.answers_last_week ? (
                                            <Chip
                                                size="small"
                                                label={`+${stats.overview.answers_last_week}`}
                                                sx={{
                                                    mt: 0.5,
                                                    height: 20,
                                                    fontSize: '0.6rem',
                                                    bgcolor: alpha(CHART_COLORS.success, 0.08),
                                                    color: CHART_COLORS.success,
                                                    '& .MuiChip-icon': { fontSize: 12, ml: 0.5 }
                                                }}
                                                icon={<TrendingUpIcon />}
                                            />
                                        ) : null}
                                    </MetricCard>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <MetricCard>
                                        <MetricValue>{formatNumber(stats?.reactions?.likes_received || 0)}</MetricValue>
                                        <MetricLabel>Likes Received</MetricLabel>
                                        {stats?.reactions?.likes_given && stats?.reactions?.likes_given > 0 && (
                                            <Chip
                                                size="small"
                                                label={`${stats.reactions.likes_given} given`}
                                                variant="outlined"
                                                sx={{ mt: 0.5, height: 20, fontSize: '0.6rem' }}
                                            />
                                        )}
                                    </MetricCard>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <MetricCard>
                                        <MetricValue>{formatNumber(stats?.overview?.questions_answered || 0)}</MetricValue>
                                        <MetricLabel>Questions Answered</MetricLabel>
                                    </MetricCard>
                                </Grid>
                            </Grid>

                            {/* Charts Row */}
                            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                {/* Activity Chart */}
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <ChartContainer>
                                        <SectionTitle>Weekly Activity</SectionTitle>
                                        {stats?.activity?.daily && stats.activity.daily.some(d => d.questions > 0 || d.answers > 0) ? (
                                            <ResponsiveContainer width="100%" height={200}>
                                                <AreaChart data={stats.activity.daily}>
                                                    <defs>
                                                        <linearGradient id="questionsGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.1} />
                                                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="answersGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.1} />
                                                            <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} vertical={false} />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={30} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: '#fff',
                                                            border: '1px solid rgba(0,0,0,0.06)',
                                                            borderRadius: 8,
                                                            boxShadow: 'none',
                                                            fontSize: '11px',
                                                        }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="questions"
                                                        stroke={CHART_COLORS.primary}
                                                        strokeWidth={2}
                                                        fill="url(#questionsGradient)"
                                                        name="Questions"
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="answers"
                                                        stroke={CHART_COLORS.secondary}
                                                        strokeWidth={2}
                                                        fill="url(#answersGradient)"
                                                        name="Answers"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                    No activity yet this week
                                                </Typography>
                                            </Box>
                                        )}
                                    </ChartContainer>
                                </Grid>

                                {/* Question Status Pie Chart */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <ChartContainer>
                                        <SectionTitle>Question Status</SectionTitle>
                                        {questionStatusData.filter(d => d.value > 0).length > 0 ? (
                                            <>
                                                <ResponsiveContainer width="100%" height={160}>
                                                    <PieChart>
                                                        <Pie
                                                            data={questionStatusData.filter(d => d.value > 0)}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={40}
                                                            outerRadius={55}
                                                            paddingAngle={2}
                                                            dataKey="value"
                                                        >
                                                            {questionStatusData.filter(d => d.value > 0).map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                                                    {questionStatusData.filter(d => d.value > 0).map((item, index) => (
                                                        <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Box sx={{ width: 6, height: 6, borderRadius: 1, bgcolor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                                            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                                                                {item.name} ({item.value})
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </>
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                    No questions yet
                                                </Typography>
                                            </Box>
                                        )}
                                    </ChartContainer>
                                </Grid>
                            </Grid>

                            {/* Bottom Row */}
                            <Grid container spacing={1.5}>
                                {/* Most Answered */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <ChartContainer>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <SectionTitle sx={{ mb: 0 }}>Most Answered</SectionTitle>
                                            <IconButton size="small" onClick={() => navigate('/my-questions')} sx={{ p: 0.5 }}>
                                                <KeyboardArrowRightIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                        {stats?.most_answered && stats.most_answered.length > 0 ? (
                                            <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
                                                {stats.most_answered.slice(0, 4).map((item, index) => (
                                                    <ActivityRow
                                                        key={item.id}
                                                        onClick={() => navigate(`/question/${item.id}`)}
                                                    >
                                                        <Typography variant="caption" sx={{ minWidth: 20, color: 'text.secondary' }}>
                                                            {index + 1}.
                                                        </Typography>
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.25, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {item.title}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                                {item.answer_count} answers
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            size="small"
                                                            label={item.answer_count}
                                                            sx={{
                                                                height: 18,
                                                                fontSize: '0.6rem',
                                                                bgcolor: alpha(CHART_COLORS.primary, 0.08),
                                                                color: CHART_COLORS.primary,
                                                            }}
                                                        />
                                                    </ActivityRow>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                    No questions with answers yet
                                                </Typography>
                                            </Box>
                                        )}
                                    </ChartContainer>
                                </Grid>

                                {/* Recent Activity */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <ChartContainer>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                                            <SectionTitle sx={{ mb: 0 }}>Recent Activity</SectionTitle>
                                            <Tabs
                                                value={tabValue}
                                                onChange={(_, v) => setTabValue(v)}
                                                sx={{ minHeight: 28 }}
                                            >
                                                <StyledTab label="All" />
                                                <StyledTab label="Q" />
                                                <StyledTab label="A" />
                                            </Tabs>
                                        </Box>
                                        {stats?.activity?.recent && stats.activity.recent.length > 0 ? (
                                            <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
                                                {(stats.activity.recent)
                                                    .filter(item => {
                                                        if (tabValue === 0) return true;
                                                        if (tabValue === 1) return item.type === 'question';
                                                        if (tabValue === 2) return item.type === 'answer';
                                                        return true;
                                                    })
                                                    .slice(0, 4)
                                                    .map((activity) => (
                                                        <ActivityRow
                                                            key={`${activity.type}-${activity.id}`}
                                                            onClick={() => navigate(
                                                                activity.type === 'question'
                                                                    ? `/question/${activity.id}`
                                                                    : `/question/${activity.question_id}`
                                                            )}
                                                        >
                                                            <Avatar
                                                                sx={{
                                                                    width: 28,
                                                                    height: 28,
                                                                    bgcolor: activity.type === 'question'
                                                                        ? alpha(CHART_COLORS.primary, 0.08)
                                                                        : alpha(CHART_COLORS.secondary, 0.08),
                                                                    color: activity.type === 'question'
                                                                        ? CHART_COLORS.primary
                                                                        : CHART_COLORS.secondary,
                                                                }}
                                                            >
                                                                {activity.type === 'question' ?
                                                                    <QuestionAnswerIcon sx={{ fontSize: 14 }} /> :
                                                                    <PeopleIcon sx={{ fontSize: 14 }} />
                                                                }
                                                            </Avatar>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.25, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {activity.details}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                                    {formatDate(activity.created_at)}
                                                                </Typography>
                                                            </Box>
                                                        </ActivityRow>
                                                    ))}
                                            </Box>
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                    No recent activity
                                                </Typography>
                                            </Box>
                                        )}
                                    </ChartContainer>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </>
            )}
        </Container>
    );
};

export default Dashboard;