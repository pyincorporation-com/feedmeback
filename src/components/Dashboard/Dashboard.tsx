import React, { useEffect, useState } from 'react';
import {
    Container,
    Grid,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    Avatar,
    LinearProgress,
    useTheme,
    alpha,
    Tab,
    Tabs,
    Stack,
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// Chart imports
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// Styled components - minimal and clean
const MetricCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2.5),
    background: '#fff',
    borderRadius: 20,
    height: '100%',
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    transition: 'background 0.2s ease',
    '&:hover': {
        background: alpha(theme.palette.primary.main, 0.02),
    },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2.5),
    background: '#fff',
    borderRadius: 20,
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
}));

const ActivityRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 0),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    '&:last-child': {
        borderBottom: 'none',
    },
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    '&:hover': {
        background: alpha(theme.palette.action.hover, 0.3),
    },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: '1.1rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
}));

const MetricValue = styled(Typography)(({ theme }) => ({
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.2,
    color: theme.palette.text.primary,
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.9rem',
    color: theme.palette.text.secondary,
    fontWeight: 400,
}));

const SearchBar = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1, 1, 2),
    background: '#fff',
    borderRadius: 40,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    transition: 'border-color 0.2s ease',
    '&:focus-within': {
        borderColor: theme.palette.primary.main,
    },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    minWidth: 'auto',
    padding: theme.spacing(1, 2),
    '&.Mui-selected': {
        color: theme.palette.primary.main,
    },
}));

// Colors for charts
const CHART_COLORS = {
    primary: '#2563eb',
    secondary: '#7c3aed',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    purple: '#7c3aed',
    pink: '#db2777',
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.warning, CHART_COLORS.error];

const Dashboard: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { questions, loading: questionsLoading } = useAppSelector((state) => state.questions);
    const { user } = useAppSelector((state) => state.auth);
    const { stats, loading: statsLoading } = useAppSelector((state) => state.dashboard);

    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        dispatch(fetchQuestions());
        dispatch(getDashboardStats());
    }, [dispatch]);

    const handleSearch = () => {
        if (searchTerm.trim()) {
            dispatch(fetchQuestions({ search: searchTerm }));
        }
    };

    const handleRefresh = () => {
        dispatch(getDashboardStats());
        dispatch(fetchQuestions());
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

    // Prepare data for pie chart
    const questionStatusData = stats?.questions ? [
        { name: 'Active', value: stats.questions.active || 0 },
        { name: 'Expired', value: stats.questions.expired || 0 },
        { name: 'Inactive', value: stats.questions.inactive || 0 },
    ] : [];

    // Prepare data for reactions chart
    const reactionsData = stats?.reactions ? [
        { name: 'Likes\nReceived', value: stats.reactions.likes_received || 0 },
        { name: 'Likes\nGiven', value: stats.reactions.likes_given || 0 },
        { name: 'Dislikes\nReceived', value: stats.reactions.dislikes_received || 0 },
        { name: 'Dislikes\nGiven', value: stats.reactions.dislikes_given || 0 },
    ] : [];

    const totalQuestions = stats?.overview?.total_questions || 0;
    const totalAnswers = stats?.overview?.total_answers || 0;

    return (
        <Box sx={{ mx: 'auto', p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Welcome back, {user?.username || 'User'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={statsLoading || questionsLoading}
                        sx={{ color: 'text.secondary' }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/questions/create')}
                        sx={{
                            bgcolor: CHART_COLORS.primary,
                            borderRadius: 8,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                        }}
                    >
                        New Question
                    </Button>
                </Box>
            </Box>

            {/* Search */}
            <SearchBar sx={{ mb: 3 }}>
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <TextField
                    fullWidth
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                        sx: { fontSize: '0.95rem' }
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
                        }}
                    >
                        Search
                    </Button>
                )}
            </SearchBar>

            {statsLoading && !stats ? (
                <LinearProgress sx={{ borderRadius: 1 }} />
            ) : stats ? (
                <>
                    {/* Quick Stats Row */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <MetricCard>
                                <MetricValue>{formatNumber(totalQuestions)}</MetricValue>
                                <MetricLabel>Total Questions</MetricLabel>
                                {stats.overview?.questions_last_week > 0 && (
                                    <Chip
                                        size="small"
                                        label={`+${stats.overview.questions_last_week} this week`}
                                        sx={{
                                            mt: 1,
                                            height: 22,
                                            fontSize: '0.7rem',
                                            bgcolor: alpha(CHART_COLORS.success, 0.08),
                                            color: CHART_COLORS.success,
                                            '& .MuiChip-icon': { fontSize: 14, ml: 0.5 }
                                        }}
                                        icon={<TrendingUpIcon />}
                                    />
                                )}
                            </MetricCard>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <MetricCard>
                                <MetricValue>{formatNumber(totalAnswers)}</MetricValue>
                                <MetricLabel>Answers Given</MetricLabel>
                                {stats.overview?.answers_last_week > 0 && (
                                    <Chip
                                        size="small"
                                        label={`+${stats.overview.answers_last_week} this week`}
                                        sx={{
                                            mt: 1,
                                            height: 22,
                                            fontSize: '0.7rem',
                                            bgcolor: alpha(CHART_COLORS.success, 0.08),
                                            color: CHART_COLORS.success,
                                            '& .MuiChip-icon': { fontSize: 14, ml: 0.5 }
                                        }}
                                        icon={<TrendingUpIcon />}
                                    />
                                )}
                            </MetricCard>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <MetricCard>
                                <MetricValue>{formatNumber(stats.reactions?.likes_received || 0)}</MetricValue>
                                <MetricLabel>Likes Received</MetricLabel>
                                {stats.reactions?.likes_given > 0 && (
                                    <Chip
                                        size="small"
                                        label={`${stats.reactions.likes_given} given`}
                                        variant="outlined"
                                        sx={{ mt: 1, height: 22, fontSize: '0.7rem' }}
                                    />
                                )}
                            </MetricCard>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <MetricCard>
                                <MetricValue>{formatNumber(stats.overview?.questions_answered || 0)}</MetricValue>
                                <MetricLabel>Questions Answered</MetricLabel>
                            </MetricCard>
                        </Grid>
                    </Grid>

                    {/* Charts Row */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {/* Activity Chart */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <ChartContainer>
                                <SectionTitle>Weekly Activity</SectionTitle>
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={stats.activity?.daily || []}>
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
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={40} />
                                        <Tooltip
                                            contentStyle={{
                                                background: '#fff',
                                                border: '1px solid rgba(0,0,0,0.06)',
                                                borderRadius: 12,
                                                boxShadow: 'none',
                                                fontSize: '12px',
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
                            </ChartContainer>
                        </Grid>

                        {/* Question Status Pie Chart */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <ChartContainer>
                                <SectionTitle>Question Status</SectionTitle>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={questionStatusData.filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
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
                                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
                                    {questionStatusData.filter(d => d.value > 0).map((item, index) => (
                                        <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                                {item.name} ({item.value})
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </ChartContainer>
                        </Grid>
                    </Grid>

                    {/* Bottom Row */}
                    <Grid container spacing={2}>
                        {/* Most Answered */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <ChartContainer>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <SectionTitle sx={{ mb: 0 }}>Most Answered</SectionTitle>
                                    <IconButton size="small" onClick={() => navigate('/my-questions')}>
                                        <KeyboardArrowRightIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                                    {(stats.most_answered || []).map((item, index) => (
                                        <ActivityRow
                                            key={item.id}
                                            onClick={() => navigate(`/question/${item.id}`)}
                                        >
                                            <Typography variant="body2" sx={{ minWidth: 24, color: 'text.secondary' }}>
                                                {index + 1}.
                                            </Typography>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.25 }}>
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.answer_count} answers
                                                </Typography>
                                            </Box>
                                            <Chip
                                                size="small"
                                                label={item.answer_count}
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    bgcolor: alpha(CHART_COLORS.primary, 0.08),
                                                    color: CHART_COLORS.primary,
                                                }}
                                            />
                                        </ActivityRow>
                                    ))}
                                </Box>
                            </ChartContainer>
                        </Grid>

                        {/* Recent Activity */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <ChartContainer>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <SectionTitle sx={{ mb: 0 }}>Recent Activity</SectionTitle>
                                    <Tabs
                                        value={tabValue}
                                        onChange={(_, v) => setTabValue(v)}
                                        sx={{ minHeight: 36 }}
                                    >
                                        <StyledTab label="All" />
                                        <StyledTab label="Questions" />
                                        <StyledTab label="Answers" />
                                    </Tabs>
                                </Box>
                                <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                                    {(stats.activity?.recent || [])
                                        .filter(item => {
                                            if (tabValue === 0) return true;
                                            if (tabValue === 1) return item.type === 'question';
                                            if (tabValue === 2) return item.type === 'answer';
                                            return true;
                                        })
                                        .slice(0, 5)
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
                                                        width: 32,
                                                        height: 32,
                                                        bgcolor: activity.type === 'question'
                                                            ? alpha(CHART_COLORS.primary, 0.08)
                                                            : alpha(CHART_COLORS.secondary, 0.08),
                                                        color: activity.type === 'question'
                                                            ? CHART_COLORS.primary
                                                            : CHART_COLORS.secondary,
                                                    }}
                                                >
                                                    {activity.type === 'question' ?
                                                        <QuestionAnswerIcon sx={{ fontSize: 16 }} /> :
                                                        <PeopleIcon sx={{ fontSize: 16 }} />
                                                    }
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.25 }}>
                                                        {activity.details}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(activity.created_at)}
                                                    </Typography>
                                                </Box>
                                            </ActivityRow>
                                        ))}
                                </Box>
                            </ChartContainer>
                        </Grid>
                    </Grid>
                </>
            ) : null}
        </Box>
    );
};

export default Dashboard;