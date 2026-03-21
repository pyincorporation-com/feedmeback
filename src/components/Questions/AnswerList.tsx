import React, { useState, useMemo, JSX } from 'react';
import {
    Paper,
    Typography,
    Box,
    Avatar,
    Chip,
    IconButton,
    Divider,
    Rating,
    LinearProgress,
    useTheme,
    alpha,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
    Card,
    CardContent,
    Stack,
    useMediaQuery,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { Answer, Question } from '../../types';
import { reactToAnswer, updateAnswerReaction } from '../../store/slices/questionSlice';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import webSocketService from '../../services/websocket';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Chart imports
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface AnswerListProps {
    answers: Answer[];
    question: Question;
    showAnswers: boolean;
}

type VisualizationType = 'bar' | 'pie';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#dc2626', '#f59e0b', '#10b981'];

// Custom label renderer for pie charts - uses legend instead
const renderCustomizedLabel = () => null;

const AnswerList: React.FC<AnswerListProps> = ({ answers, question, showAnswers }) => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Set default visualization based on answer type
    const getDefaultVisualization = (answerType: string): VisualizationType => {
        switch (answerType) {
            case 'multiple_choice':
            case 'checkbox':
            case 'emoji_scale':
                return 'pie';
            case 'rating_scale':
            case 'slider':
                return 'bar';
            default:
                return 'bar';
        }
    };

    const [visualizationType, setVisualizationType] = useState<VisualizationType>(
        getDefaultVisualization(question?.answer_type || '')
    );

    // Process answers for visualizations based on answer type
    const visualizationData = useMemo(() => {
        if (!answers.length) return null;

        const answerType = question?.answer_type;

        switch (answerType) {
            case 'multiple_choice':
            case 'checkbox': {
                const counts: Record<string, number> = {};
                const choices = question.choices || [];

                choices.forEach(choice => {
                    counts[choice.text] = 0;
                });

                answers.forEach(answer => {
                    const data = answer.answer_data;
                    if (data.selected) {
                        if (Array.isArray(data.selected)) {
                            data.selected.forEach((selected: string) => {
                                const choice = choices.find(c => (c.value || c.text) === selected);
                                if (choice) {
                                    counts[choice.text] = (counts[choice.text] || 0) + 1;
                                }
                            });
                        } else {
                            const choice = choices.find(c => (c.value || c.text) === data.selected);
                            if (choice) {
                                counts[choice.text] = (counts[choice.text] || 0) + 1;
                            }
                        }
                    }
                });

                return {
                    type: 'distribution',
                    data: Object.entries(counts)
                        .map(([name, value]) => ({ name, value, percentage: (value / answers.length) * 100 }))
                        .filter(item => item.value > 0), // Only show items with values
                    totalAnswers: answers.length
                };
            }

            case 'rating_scale': {
                const min = question.rating_scale?.min || 1;
                const max = question.rating_scale?.max || 5;
                const counts: Record<number, number> = {};

                for (let i = min; i <= max; i++) {
                    counts[i] = 0;
                }

                answers.forEach(answer => {
                    const rating = answer.answer_data?.rating;
                    if (rating && rating >= min && rating <= max) {
                        counts[rating] = (counts[rating] || 0) + 1;
                    }
                });

                const distribution = Object.entries(counts)
                    .map(([rating, count]) => ({
                        rating: parseInt(rating),
                        count,
                        percentage: (count / answers.length) * 100
                    }))
                    .filter(item => item.count > 0);

                const averageRating = answers.reduce((sum, a) => sum + (a.answer_data?.rating || 0), 0) / answers.length;

                return {
                    type: 'rating',
                    distribution,
                    averageRating,
                    totalAnswers: answers.length
                };
            }

            case 'emoji_scale': {
                const emojiCounts: Record<string, { count: number; label: string; emoji: string }> = {};
                const emojiOptions = question.emoji_options || [];

                emojiOptions.forEach(option => {
                    emojiCounts[option.emoji] = { count: 0, label: option.label, emoji: option.emoji };
                });

                answers.forEach(answer => {
                    const emoji = answer.answer_data?.emoji;
                    if (emoji && emojiCounts[emoji]) {
                        emojiCounts[emoji].count++;
                    }
                });

                return {
                    type: 'sentiment',
                    data: Object.values(emojiCounts)
                        .map(item => ({
                            name: item.label,
                            value: item.count,
                            emoji: item.emoji,
                            percentage: (item.count / answers.length) * 100
                        }))
                        .filter(item => item.value > 0),
                    totalAnswers: answers.length
                };
            }

            case 'slider': {
                const config = question.slider_config || { min: 0, max: 100 };
                const values = answers.map(a => a.answer_data?.value).filter(v => v !== undefined);
                const average = values.reduce((sum, v) => sum + v, 0) / values.length;

                const binCount = isMobile ? 6 : 10;
                const binSize = (config.max - config.min) / binCount;
                const bins: Record<string, number> = {};

                for (let i = 0; i < binCount; i++) {
                    const binStart = config.min + i * binSize;
                    const binEnd = config.min + (i + 1) * binSize;
                    const binLabel = `${Math.round(binStart)}-${Math.round(binEnd)}`;
                    bins[binLabel] = 0;
                }

                values.forEach(value => {
                    for (let i = 0; i < binCount; i++) {
                        const binStart = config.min + i * binSize;
                        const binEnd = config.min + (i + 1) * binSize;
                        if (value >= binStart && value <= binEnd) {
                            const binLabel = `${Math.round(binStart)}-${Math.round(binEnd)}`;
                            bins[binLabel] = (bins[binLabel] || 0) + 1;
                            break;
                        }
                    }
                });

                return {
                    type: 'slider',
                    distribution: Object.entries(bins)
                        .map(([range, count]) => ({ range, count, percentage: (count / values.length) * 100 }))
                        .filter(item => item.count > 0),
                    average,
                    totalAnswers: values.length,
                    min: config.min,
                    max: config.max
                };
            }

            case 'text_input':
                return {
                    type: 'text',
                    answers: answers.map(a => ({ text: a.answer_data?.text || '', createdAt: a.created_at, user: a.created_by })),
                    totalAnswers: answers.length
                };

            default:
                return null;
        }
    }, [answers, question, isMobile]);

    const handleReaction = async (answerId: string, reactionType: 'like' | 'dislike') => {
        if (!user) return;

        const previousReaction = answers.find(a => a.id === answerId)?.user_reaction;

        dispatch(updateAnswerReaction({
            answerId,
            reactionType,
            userId: user.id,
        }));

        try {
            await dispatch(reactToAnswer({ answerId, reactionType })).unwrap();
        } catch (error) {
            console.error('Failed to react:', error);
            dispatch(updateAnswerReaction({
                answerId,
                reactionType: previousReaction,
                userId: user.id,
            }));
        }
    };

    const renderVisualization = () => {
        if (!visualizationData || answers.length === 0) return null;

        const answerType = question?.answer_type;
        const chartHeight = isMobile ? 320 : 400;

        // Multiple Choice / Checkbox
        if (visualizationData.type === 'distribution') {
            const data = visualizationData.data;

            if (data.length === 0) return null;

            if (visualizationType === 'bar') {
                return (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Response Distribution ({visualizationData.totalAnswers} responses)
                        </Typography>
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: isMobile ? 80 : 100, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} horizontal={false} />
                                <XAxis type="number" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={isMobile ? 80 : 120}
                                    tick={{ fontSize: isMobile ? 11 : 13 }}
                                    interval={0}
                                />
                                <RechartsTooltip
                                    formatter={(value: any) => [`${value} votes (${((value / visualizationData.totalAnswers) * 100).toFixed(1)}%)`, 'Count']}
                                />
                                <Bar dataKey="value" fill={theme.palette.primary.main} radius={[0, 8, 8, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                );
            }

            if (visualizationType === 'pie') {
                return (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Response Distribution ({visualizationData.totalAnswers} responses)
                        </Typography>
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="45%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={isMobile ? 100 : 140}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: any) => [`${value} votes (${((value / visualizationData.totalAnswers) * 100).toFixed(1)}%)`, 'Count']}
                                />
                                <Legend
                                    layout={isMobile ? "horizontal" : "vertical"}
                                    align={isMobile ? "center" : "right"}
                                    verticalAlign={isMobile ? "bottom" : "middle"}
                                    wrapperStyle={isMobile ? { marginTop: 20, fontSize: 12 } : { fontSize: 13 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                );
            }
        }

        // Rating Scale
        if (visualizationData.type === 'rating') {
            const data = visualizationData;

            if (data.distribution.length === 0) return null;

            if (visualizationType === 'bar') {
                return (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Rating Distribution ({data.totalAnswers} responses)
                        </Typography>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                                {data.averageRating.toFixed(1)}
                            </Typography>
                            <Rating value={data.averageRating} precision={0.5} readOnly size={isMobile ? "medium" : "large"} />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Average rating
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={chartHeight - 120}>
                            <BarChart data={data.distribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} vertical={false} />
                                <XAxis dataKey="rating" />
                                <YAxis />
                                <RechartsTooltip
                                    formatter={(value: any) => [`${value} votes (${((value / data.totalAnswers) * 100).toFixed(1)}%)`, 'Count']}
                                />
                                <Bar dataKey="count" fill={theme.palette.warning.main} radius={[8, 8, 0, 0]}>
                                    {data.distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.rating % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                );
            }
        }

        // Emoji Scale
        if (visualizationData.type === 'sentiment') {
            const data = visualizationData.data;

            if (data.length === 0) return null;

            if (visualizationType === 'bar') {
                return (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Sentiment Distribution ({visualizationData.totalAnswers} responses)
                        </Typography>
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: isMobile ? 80 : 100, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} horizontal={false} />
                                <XAxis type="number" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={isMobile ? 80 : 120}
                                    tick={{ fontSize: isMobile ? 11 : 13 }}
                                    interval={0}
                                />
                                <RechartsTooltip
                                    formatter={(value: any) => [`${value} responses (${((value / visualizationData.totalAnswers) * 100).toFixed(1)}%)`, 'Count']}
                                />
                                <Bar dataKey="value" fill={theme.palette.secondary.main} radius={[0, 8, 8, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                );
            }

            if (visualizationType === 'pie') {
                return (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Sentiment Distribution ({visualizationData.totalAnswers} responses)
                        </Typography>
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="45%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={isMobile ? 100 : 140}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: any) => [`${value} responses (${((value / visualizationData.totalAnswers) * 100).toFixed(1)}%)`, 'Count']}
                                />
                                <Legend
                                    layout={isMobile ? "horizontal" : "vertical"}
                                    align={isMobile ? "center" : "right"}
                                    verticalAlign={isMobile ? "bottom" : "middle"}
                                    wrapperStyle={isMobile ? { marginTop: 20, fontSize: 12 } : { fontSize: 13 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                );
            }
        }

        // Slider
        if (visualizationData.type === 'slider') {
            const data = visualizationData;

            if (data.distribution.length === 0) return null;

            if (visualizationType === 'bar') {
                return (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Value Distribution ({data.totalAnswers} responses)
                        </Typography>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                {data.average.toFixed(1)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Average value (Range: {data.min} - {data.max})
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={chartHeight - 120}>
                            <BarChart data={data.distribution} margin={{ bottom: isMobile ? 40 : 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} vertical={false} />
                                <XAxis
                                    dataKey="range"
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                    angle={isMobile ? -45 : 0}
                                    textAnchor={isMobile ? "end" : "middle"}
                                    height={isMobile ? 60 : 30}
                                    interval={0}
                                />
                                <YAxis />
                                <RechartsTooltip
                                    formatter={(value: any) => [`${value} responses (${((value / data.totalAnswers) * 100).toFixed(1)}%)`, 'Count']}
                                />
                                <Bar dataKey="count" fill={theme.palette.success.main} radius={[8, 8, 0, 0]}>
                                    {data.distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                );
            }
        }

        // Text Input
        if (visualizationData.type === 'text') {
            return (
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Text Responses ({visualizationData.totalAnswers} responses)
                    </Typography>
                    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                        {visualizationData.answers.map((item, idx) => (
                            <Paper
                                key={idx}
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                                    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                        {item.user?.username?.[0]?.toUpperCase() || 'A'}
                                    </Avatar>
                                    <Typography variant="caption" color="text.secondary">
                                        {item.user?.username || 'Anonymous'} • {new Date(item.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Typography variant="body2">
                                    {item.text}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            );
        }

        return null;
    };

    if (!showAnswers) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.06)}` }}>
                <Typography variant="body1" color="text.secondary">
                    Answer this question first to see what others have said!
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Share your thoughts to unlock community insights
                </Typography>
            </Paper>
        );
    }

    if (answers.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.06)}` }}>
                <Typography variant="body1" color="text.secondary">
                    No answers yet. Be the first to answer!
                </Typography>
            </Paper>
        );
    }

    const canVisualize = ['multiple_choice', 'checkbox', 'rating_scale', 'emoji_scale', 'slider'].includes(question?.answer_type || '');
    const answerType = question?.answer_type;

    return (
        <Box>
            {/* Visualization Header */}
            {canVisualize && answers.length > 0 && (
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.9) }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            View as:
                        </Typography>
                        <ToggleButtonGroup
                            value={visualizationType}
                            exclusive
                            onChange={(_, value) => value && setVisualizationType(value as VisualizationType)}
                            size="small"
                        >
                            <ToggleButton value="bar">
                                <Tooltip title="Bar chart">
                                    <BarChartIcon fontSize="small" />
                                </Tooltip>
                            </ToggleButton>
                            {(answerType !== 'rating_scale' && answerType !== 'slider') && (
                                <ToggleButton value="pie">
                                    <Tooltip title="Pie chart">
                                        <PieChartIcon fontSize="small" />
                                    </Tooltip>
                                </ToggleButton>
                            )}
                        </ToggleButtonGroup>
                    </Box>
                    {renderVisualization()}
                </Paper>
            )}

            {/* No list view - only visualizations */}
            {!canVisualize && renderVisualization()}
        </Box>
    );
};

export default AnswerList;