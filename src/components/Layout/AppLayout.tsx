import React, { useState } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
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

// Drawer width
const DRAWER_WIDTH = 280;

// Styled components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
}>(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
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
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        marginLeft: `${DRAWER_WIDTH}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
    width: open ? DRAWER_WIDTH : 0,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: open ? DRAWER_WIDTH : 0,
        boxSizing: 'border-box',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: 'none',
        overflowX: 'hidden'
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
            animation: 'ripple 1.2s infinite ease-in-out',
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

// Navigation items
const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'My Questions', icon: <QuestionAnswerIcon />, path: '/my-questions' },
    { text: 'Create Question', icon: <AddIcon />, path: '/questions/create' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
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

    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

    const handleDrawerToggle = () => {
        setOpen(!open);
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

    const handleLogout = () => {
        dispatch(logout());
        handleMenuClose();
        navigate('/');
    };

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <StyledAppBar position="fixed" open={open} elevation={0}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        sx={{ mr: 2 }}
                    >
                        {open ? <ChevronLeftIcon /> : <MenuIcon />}
                    </IconButton>

                    <SearchBar elevation={0}>
                        <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                        <InputBase
                            placeholder="Search questions..."
                            sx={{ flex: 1 }}
                        />
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
                variant="persistent"
                anchor="left"
                open={open}
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
                    {/* <IconButton onClick={handleDrawerToggle}>
                        <ChevronLeftIcon />
                    </IconButton> */}
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
                <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                    <SettingsIcon fontSize="small" /> Settings
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