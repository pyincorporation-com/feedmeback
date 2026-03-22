import React, { useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    useTheme,
    alpha,
    Tooltip,
    Badge,
    InputBase,
    Paper,
    useMediaQuery,
    Dialog,
    DialogContent,
    Stack,
    Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { fetchQuestions } from '../../store/slices/questionSlice';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// Drawer width
const DRAWER_WIDTH = 280;

// Styled components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
}>(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(2),
    width: '100%',
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
        [theme.breakpoints.up('md')]: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
    }),
}));

const StyledAppBar = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
}>(({ theme, open }) => ({
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    boxShadow: 'none',
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    color: theme.palette.text.primary,
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        [theme.breakpoints.up('md')]: {
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            marginLeft: `${DRAWER_WIDTH}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
    }),
}));

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
    width: 0,
    flexShrink: 0,
    ...(open && {
        width: DRAWER_WIDTH,
    }),
    '& .MuiDrawer-paper': {
        width: 0,
        boxSizing: 'border-box',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: 'none',
        ...(open && {
            width: DRAWER_WIDTH,
        })
    },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 2.5),
    justifyContent: 'space-between',
}));

const Logo = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
});

const SearchBar = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: 40,
    background: alpha(theme.palette.common.black, 0.03),
    boxShadow: 'none',
    width: 300,
    '&:hover': {
        background: alpha(theme.palette.common.black, 0.05),
    },
    '& .MuiInputBase-root': {
        flex: 1,
        fontSize: '0.95rem',
    },
    [theme.breakpoints.down('sm')]: {
        width: '100%',
        maxWidth: 200,
    },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
    borderRadius: 12,
    margin: '4px 12px',
    padding: '10px 16px',
    '&.Mui-selected': {
        background: alpha(theme.palette.primary.main, 0.08),
        '&:hover': {
            background: alpha(theme.palette.primary.main, 0.2),
        },
        '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
        },
        '& .MuiListItemText-primary': {
            color: theme.palette.primary.main,
            fontWeight: 500,
        },
    },
    '&:hover': {
        background: alpha(theme.palette.primary.main, 0.07),
    },
}));

const UserSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: theme.spacing(2, 2.5),
    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    marginTop: 'auto',
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            // animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

const SearchResultItem = styled(Box)(({ theme }) => ({
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
}));

// Navigation items
const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'My Questions', icon: <QuestionAnswerIcon />, path: '/questions' },
];

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { questions } = useAppSelector((state) => state.questions);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [open, setOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchDialog, setShowSearchDialog] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Update search results only when questions change and a search has been performed
    useEffect(() => {
        if (hasSearched && searchTerm.trim()) {
            const filtered = questions.filter(q =>
                q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(filtered);
            setShowSearchDialog(filtered.length > 0);
        }
    }, [questions, searchTerm, hasSearched]);

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const handleDrawerClose = () => {
        if (isMobile) {
            setOpen(false);
        }
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleLogout = async () => {
        await dispatch(logout());
        handleMenuClose();
        navigate('/login');
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) {
            setOpen(false);
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            setHasSearched(true);
            dispatch(fetchQuestions({ search: searchTerm }));
        }
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setShowSearchDialog(false);
        setHasSearched(false);
        // Reset to show all questions
        dispatch(fetchQuestions());
    };

    const handleSearchResultClick = (questionId: string) => {
        navigate(`/question/${questionId}`);
        setShowSearchDialog(false);
        setSearchTerm('');
        setSearchResults([]);
        setHasSearched(false);
    };

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
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc', maxWidth: '100%', width: '100%' }}>
            <StyledAppBar position="fixed" open={open} elevation={0}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <SearchBar elevation={0}>
                        <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                        <InputBase
                            placeholder="Search questions..."
                            sx={{ flex: 1 }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                        />
                        {searchTerm && (
                            <IconButton size="small" onClick={handleClearSearch} sx={{ p: 0.5 }}>
                                <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        )}
                    </SearchBar>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Notifications">
                            <IconButton onClick={handleNotificationOpen} size="large">
                                <NotificationBadge variant="dot" overlap="circular">
                                    <NotificationsNoneIcon />
                                </NotificationBadge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Account">
                            <IconButton
                                onClick={handleProfileMenuOpen}
                                size="small"
                                sx={{ ml: 1 }}
                            >
                                <Avatar
                                    src={user?.avatar}
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {user?.username?.[0].toUpperCase()}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </StyledAppBar>

            <StyledDrawer
                variant={isMobile ? "temporary" : "persistent"}
                anchor="left"
                open={open}
                onClose={handleDrawerClose}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                <DrawerHeader>
                    <Logo>
                        <Box
                            component={'img'}
                            src='/android-chrome-512x512.png'
                            sx={{
                                width: 30
                            }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            feedmeback
                        </Typography>
                    </Logo>
                    {isMobile && (
                        <IconButton onClick={handleDrawerClose}>
                            <ChevronLeftIcon />
                        </IconButton>
                    )}
                </DrawerHeader>

                <Divider sx={{ opacity: 0.5 }} />

                <List sx={{ flex: 1, py: 2 }}>
                    {navItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <StyledListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.95rem',
                                        fontWeight: 400,
                                    }}
                                />
                            </StyledListItemButton>
                        </ListItem>
                    ))}
                </List>

                <UserSection>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Avatar
                            src={user?.avatar}
                            sx={{
                                width: 44,
                                height: 44,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                            }}
                        >
                            {user?.username?.[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                {user?.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                {user?.email}
                            </Typography>
                        </Box>
                    </Box>
                </UserSection>
            </StyledDrawer>

            <Main open={open}>
                <DrawerHeader />
                {children}
            </Main>

            {/* Search Results Dialog */}
            <Dialog
                open={showSearchDialog && searchResults.length > 0}
                onClose={() => {
                    setShowSearchDialog(false);
                    setHasSearched(false);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }
                }}
            >
                <DialogContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Search Results ({searchResults.length})
                        </Typography>
                        <IconButton size="small" onClick={() => {
                            setShowSearchDialog(false);
                            setHasSearched(false);
                        }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Stack spacing={1.5}>
                        {searchResults.map((question) => (
                            <SearchResultItem
                                key={question.id}
                                onClick={() => handleSearchResultClick(question.id)}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {question.title}
                                        </Typography>
                                        <Chip
                                            label={getAnswerTypeIcon(question.answer_type)}
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                    </Box>
                                    {question.description && (
                                        <Typography variant="caption" color="text.secondary" sx={{
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {question.description}
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(question.created_at).toLocaleDateString()}
                                        </Typography>
                                        <Chip
                                            label={`${question.answers_count || 0} answers`}
                                            size="small"
                                            sx={{ height: 18, fontSize: '0.6rem' }}
                                        />
                                    </Box>
                                </Box>
                                <KeyboardArrowRightIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            </SearchResultItem>
                        ))}
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* Profile Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 1.5,
                        minWidth: 200,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                        '& .MuiMenuItem-root': {
                            px: 2,
                            py: 1.5,
                            fontSize: '0.95rem',
                            gap: 1.5,
                        },
                    },
                }}
            >
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                    <PersonIcon fontSize="small" /> Profile
                </MenuItem>
                <Divider sx={{ my: 1, opacity: 0.5 }} />
                <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" /> Logout
                </MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
                anchorEl={notificationAnchor}
                open={Boolean(notificationAnchor)}
                onClose={handleNotificationClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 1.5,
                        width: 360,
                        maxHeight: 400,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                    },
                }}
            >
                <Box sx={{ p: 2, pb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Notifications
                    </Typography>
                </Box>
                <Divider sx={{ opacity: 0.5 }} />
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        No new notifications
                    </Typography>
                </Box>
            </Menu>
        </Box>
    );
};

export default AppLayout;