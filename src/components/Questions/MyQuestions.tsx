import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    Button,
    CircularProgress,
    useTheme,
    alpha,
    Card,
    CardContent,
    Grid,
    Pagination,
    Stack,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Snackbar,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    LinearProgress,
    CardActionArea,
    Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchMyQuestions, deleteQuestion } from '../../store/slices/questionSlice';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GridViewIcon from '@mui/icons-material/GridView';
import TableChartIcon from '@mui/icons-material/TableChart';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Styled components (keep your existing styled components)
const GlassPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    borderRadius: 24,
    padding: theme.spacing(2),
    background: `
    linear-gradient(
      135deg,
      ${alpha('#ffffff', 0.7)} 0%,
      ${alpha('#ffffff', 0.4)} 100%
    )
  `,
    backdropFilter: 'blur(14px) saturate(140%)',
    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    boxShadow: `
    0 8px 32px ${alpha('#000', 0.06)},
    inset 0 1px 0 ${alpha('#fff', 0.6)}
  `,
    transition: 'all 0.25s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `
      0 12px 40px ${alpha('#000', 0.1)},
      inset 0 1px 0 ${alpha('#fff', 0.7)}
    `,
        borderColor: alpha(theme.palette.primary.main, 0.2),
    },
}));

const CompactCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    height: '100%',
    '&:hover': {
        transform: 'translateY(-2px)',
        borderColor: alpha(theme.palette.primary.main, 0.2),
        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
    },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(0.8, 1.5),
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(8px)',
    borderRadius: 999,
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    transition: 'all 0.25s ease',
    '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.2),
    },
    '&:focus-within': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.12)}`,
        background: theme.palette.background.paper,
    },
}));

const StatBadge = styled(Box)(({ theme, color }: { theme?: any; color?: string }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    borderRadius: 20,
    fontSize: '0.7rem',
    fontWeight: 500,
    backgroundColor: alpha(color || theme.palette.primary.main, 0.08),
    color: color || theme.palette.primary.main,
}));

interface QuestionStats {
    id: string;
    title: string;
    description: string;
    answer_type: string;
    created_at: string;
    updated_at: string;
    expires_at: string | null;
    is_active: boolean;
    answer_count: number;
    response_rate: number;
    recent_answers: any[];
}

type ViewMode = 'grid' | 'table';

// Skeleton loader for grid view
const GridSkeleton = () => (
    <Grid container spacing={2}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item}>
                <CompactCard elevation={0}>
                    <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Skeleton variant="rounded" width={80} height={24} />
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Skeleton variant="circular" width={24} height={24} />
                                <Skeleton variant="circular" width={24} height={24} />
                                <Skeleton variant="circular" width={24} height={24} />
                                <Skeleton variant="circular" width={24} height={24} />
                            </Box>
                        </Box>
                        <Skeleton variant="text" width="90%" height={28} />
                        <Skeleton variant="text" width="60%" height={20} />
                        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, mb: 1 }}>
                            <Skeleton variant="rounded" width={60} height={24} />
                            <Skeleton variant="rounded" width={60} height={24} />
                            <Skeleton variant="rounded" width={50} height={24} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1 }}>
                            <Skeleton variant="text" width={80} height={20} />
                            <Skeleton variant="text" width={50} height={20} />
                        </Box>
                    </CardContent>
                </CompactCard>
            </Grid>
        ))}
    </Grid>
);

// Skeleton loader for table view
const TableSkeleton = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme, 0.06)}` }}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="center">Answers</TableCell>
                    <TableCell align="center">Rate</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {[1, 2, 3, 4, 5].map((item) => (
                    <TableRow key={item}>
                        <TableCell>
                            <Skeleton variant="text" width="90%" height={24} />
                            <Skeleton variant="text" width="70%" height={20} />
                        </TableCell>
                        <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                        <TableCell align="center"><Skeleton variant="text" width={30} height={24} sx={{ mx: 'auto' }} /></TableCell>
                        <TableCell align="center"><Skeleton variant="text" width={30} height={24} sx={{ mx: 'auto' }} /></TableCell>
                        <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
                        <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                        <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <Skeleton variant="circular" width={28} height={28} />
                                <Skeleton variant="circular" width={28} height={28} />
                                <Skeleton variant="circular" width={28} height={28} />
                                <Skeleton variant="circular" width={28} height={28} />
                            </Box>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

const MyQuestions: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { myQuestions, loading } = useAppSelector((state) => state.questions);
    const { user } = useAppSelector((state) => state.auth);

    const [questions, setQuestions] = useState<QuestionStats[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('-created_at');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionStats | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        loadQuestions();
    }, [page, pageSize, filterType, sortBy]);

    const loadQuestions = async () => {
        try {
            const result = await dispatch(fetchMyQuestions({
                page,
                page_size: pageSize,
                search: searchTerm,
                answer_type: filterType !== 'all' ? filterType : undefined,
                ordering: sortBy,
            })).unwrap();

            if (result) {
                setQuestions(result.questions);
                setTotal(result.total);
            }
        } catch (error) {
            console.error('Failed to load questions:', error);
        } finally {
            setIsFirstLoad(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        loadQuestions();
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPage(1);
        setTimeout(() => loadQuestions(), 100);
    };

    const handleCopyLink = (questionId: string) => {
        const link = `${window.location.origin}/question/${questionId}`;
        navigator.clipboard.writeText(link);
        setCopiedId(questionId);
        setTimeout(() => setCopiedId(null), 2000);
        setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
    };

    const handleDeleteQuestion = async () => {
        if (!selectedQuestion) return;

        try {
            await dispatch(deleteQuestion(selectedQuestion.id)).unwrap();
            setSnackbar({
                open: true,
                message: `Question "${selectedQuestion.title}" deleted successfully!`,
                severity: 'success'
            });
            loadQuestions();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error || 'Failed to delete question',
                severity: 'error'
            });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedQuestion(null);
        }
    };

    const getAnswerTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            multiple_choice: '☑️',
            checkbox: '✅',
            rating_scale: '⭐',
            emoji_scale: '😊',
            slider: '📊',
            text_input: '✏️',
        };
        return icons[type] || '❓';
    };

    const getAnswerTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            multiple_choice: 'Multiple Choice',
            checkbox: 'Checkbox',
            rating_scale: 'Rating',
            emoji_scale: 'Emoji',
            slider: 'Slider',
            text_input: 'Text',
        };
        return labels[type] || type;
    };

    const formatDate = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    };

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? theme.palette.success.main : theme.palette.error.main;
    };

    const getStatusLabel = (isActive: boolean) => {
        return isActive ? 'Active' : 'Inactive';
    };

    const renderGridView = () => (
        <Grid container spacing={2}>
            {questions.map((question) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={question.id}>
                    <CompactCard elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                <Chip
                                    label={`${getAnswerTypeIcon(question.answer_type)} ${getAnswerTypeLabel(question.answer_type)}`}
                                    size="small"
                                    sx={{
                                        height: 24,
                                        fontSize: '0.7rem',
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        color: theme.palette.primary.main,
                                    }}
                                />
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title="Copy link">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyLink(question.id);
                                            }}
                                            sx={{ color: copiedId === question.id ? 'success.main' : 'text.secondary', p: 0.5 }}
                                        >
                                            {copiedId === question.id ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Preview">
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/question/${question.id}`)}
                                            sx={{ color: 'text.secondary', p: 0.5 }}
                                        >
                                            <VisibilityIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/questions/edit/${question.id}`)}
                                            sx={{ color: 'text.secondary', p: 0.5 }}
                                        >
                                            <EditIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedQuestion(question);
                                                setDeleteDialogOpen(true);
                                            }}
                                            sx={{ color: 'error.light', p: 0.5 }}
                                        >
                                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            {/* Title */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
                                {truncateText(question.title, 60)}
                            </Typography>

                            {/* Stats Row */}
                            <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, mb: 1, flexWrap: 'wrap' }}>
                                <StatBadge color={theme.palette.primary.main}>
                                    <ChatBubbleOutlineIcon sx={{ fontSize: 12 }} />
                                    <span>{question.answer_count}</span>
                                </StatBadge>
                                <StatBadge color={theme.palette.success.main}>
                                    <TrendingUpIcon sx={{ fontSize: 12 }} />
                                    <span>{question.response_rate}%</span>
                                </StatBadge>
                                <StatBadge color={getStatusColor(question.is_active)}>
                                    <span>{getStatusLabel(question.is_active)}</span>
                                </StatBadge>
                            </Box>

                            {/* Footer */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.06)}` }}>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDate(question.created_at)}
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={() => navigate(`/question/${question.id}`)}
                                    sx={{ textTransform: 'none', fontSize: '0.7rem', minWidth: 'auto', p: 0 }}
                                >
                                    View →
                                </Button>
                            </Box>
                        </CardContent>
                    </CompactCard>
                </Grid>
            ))}
        </Grid>
    );

    const renderTableView = () => (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.06)}` }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Question</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Answers</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Rate</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {questions.map((question) => (
                        <TableRow key={question.id} hover>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {truncateText(question.title, 50)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {truncateText(question.description, 80)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={`${getAnswerTypeIcon(question.answer_type)} ${getAnswerTypeLabel(question.answer_type)}`}
                                    size="small"
                                    sx={{ height: 24, fontSize: '0.7rem' }}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {question.answer_count}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.success.main }}>
                                    {question.response_rate}%
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={getStatusLabel(question.is_active)}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(getStatusColor(question.is_active), 0.1),
                                        color: getStatusColor(question.is_active),
                                        height: 24,
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDate(question.created_at)}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                    <Tooltip title="Preview">
                                        <IconButton size="small" onClick={() => navigate(`/question/${question.id}`)}>
                                            <VisibilityIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton size="small" onClick={() => navigate(`/questions/edit/${question.id}`)}>
                                            <EditIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Copy link">
                                        <IconButton size="small" onClick={() => handleCopyLink(question.id)}>
                                            <ContentCopyIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small" onClick={() => {
                                            setSelectedQuestion(question);
                                            setDeleteDialogOpen(true);
                                        }}>
                                            <DeleteOutlineIcon sx={{ fontSize: 18, color: theme.palette.error.light }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                component="div"
                count={total}
                page={page - 1}
                onPageChange={(_, newPage) => setPage(newPage + 1)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setPage(1);
                }}
                rowsPerPageOptions={[6, 12, 24, 48]}
            />
        </TableContainer>
    );

    // Show loading skeletons while fetching data
    if (loading && isFirstLoad) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width={300} height={40} />
                    <Skeleton variant="text" width={200} height={24} sx={{ mt: 1 }} />
                </Box>
                <GlassPaper sx={{ p: 2, mb: 3 }}>
                    <Skeleton variant="rounded" height={56} />
                </GlassPaper>
                {viewMode === 'grid' ? <GridSkeleton /> : <TableSkeleton />}
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    My Questions
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {total} question{total !== 1 ? 's' : ''} created • Manage and monitor your feedback collection
                </Typography>
            </Box>

            {/* Search and Filters Bar */}
            <GlassPaper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 5 }}>
                        <SearchContainer>
                            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <TextField
                                fullWidth
                                placeholder="Search questions by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                                sx={{ '& .MuiInputBase-input': { py: 1.2, fontSize: '0.95rem' } }}
                            />
                            {searchTerm && (
                                <IconButton size="small" onClick={handleClearSearch}>
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )}
                            <Button
                                variant="contained"
                                onClick={handleSearch}
                                sx={{
                                    borderRadius: 40,
                                    textTransform: 'none',
                                    px: 3,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                }}
                            >
                                Search
                            </Button>
                        </SearchContainer>
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                displayEmpty
                                sx={{ borderRadius: 3, bgcolor: '#fff' }}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                                <MenuItem value="checkbox">Checkbox</MenuItem>
                                <MenuItem value="rating_scale">Rating Scale</MenuItem>
                                <MenuItem value="emoji_scale">Emoji Scale</MenuItem>
                                <MenuItem value="slider">Slider</MenuItem>
                                <MenuItem value="text_input">Text Input</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                displayEmpty
                                sx={{ borderRadius: 3, bgcolor: '#fff' }}
                            >
                                <MenuItem value="-created_at">Newest First</MenuItem>
                                <MenuItem value="created_at">Oldest First</MenuItem>
                                <MenuItem value="-answer_count">Most Answered</MenuItem>
                                <MenuItem value="answer_count">Least Answered</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <ToggleButtonGroup
                                value={viewMode}
                                exclusive
                                onChange={(_, value) => value && setViewMode(value)}
                                size="small"
                                sx={{ mr: 1 }}
                            >
                                <ToggleButton value="grid">
                                    <GridViewIcon fontSize="small" />
                                </ToggleButton>
                                <ToggleButton value="table">
                                    <TableChartIcon fontSize="small" />
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/questions/create')}
                                sx={{
                                    borderRadius: 40,
                                    textTransform: 'none',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    },
                                    transition: 'all 0.2s',
                                }}
                            >
                                Create New
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </GlassPaper>

            {/* Questions Display */}
            {loading ? (
                viewMode === 'grid' ? <GridSkeleton /> : <TableSkeleton />
            ) : questions.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 4,
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.00)}, ${alpha(theme.palette.background.paper, 1)})`,
                        maxWidth: '100%',
                        mx: 'auto',
                    }}
                >
                    <Box
                        sx={{
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            mx: 'auto',
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: alpha(theme.palette.primary.main, 0.1),
                        }}
                    >
                        <AddIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        No questions yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mx: 'auto', mb: 4 }}>
                        Start collecting feedback by creating your first question.
                        It only takes a few seconds 🚀
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/questions/create')}
                        sx={{
                            borderRadius: 999,
                            px: 4,
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: 500,
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                            },
                        }}
                    >
                        Create your first question
                    </Button>
                </Paper>
            ) : (
                <>
                    {viewMode === 'grid' ? renderGridView() : renderTableView()}

                    {viewMode === 'grid' && total > pageSize && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={Math.ceil(total / pageSize)}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                color="primary"
                                size={window.innerWidth < 600 ? "small" : "medium"}
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon sx={{ color: 'warning.main' }} />
                    Delete Question
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{selectedQuestion?.title}"? This action cannot be undone and all answers associated with this question will be permanently removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteQuestion}
                        variant="contained"
                        color="error"
                        sx={{ textTransform: 'none' }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MyQuestions;