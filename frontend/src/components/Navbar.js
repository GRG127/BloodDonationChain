import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Person,
    LocalHospital,
    History,
    ExitToApp,
    AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const { account, connectWallet, disconnectWallet } = useWeb3();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        disconnectWallet();
        navigate('/login');
    };

    const getNavItems = () => {
        if (!user) {
            return [
                { text: 'Login', path: '/login', icon: <AccountCircle /> },
                { text: 'Register', path: '/register', icon: <Person /> }
            ];
        }

        const items = [
            { text: 'Dashboard', path: `/${user.role}/dashboard`, icon: <Dashboard /> },
            { text: 'Profile', path: `/${user.role}/profile`, icon: <Person /> }
        ];

        switch (user.role) {
            case 'donor':
                items.push(
                    { text: 'Donation History', path: '/donor/history', icon: <History /> }
                );
                break;
            case 'recipient':
            case 'hospital':
                items.push(
                    { text: 'Blood Requests', path: `/${user.role}/requests`, icon: <LocalHospital /> }
                );
                break;
            default:
                break;
        }

        return items;
    };

    const drawer = (
        <Box sx={{ width: 250 }}>
            <List>
                {getNavItems().map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        component={RouterLink}
                        to={item.path}
                        onClick={handleDrawerToggle}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                {user && (
                    <ListItem button onClick={handleLogout}>
                        <ListItemIcon><ExitToApp /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                    >
                        Blood Donation Chain
                    </Typography>

                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getNavItems().map((item) => (
                                <Button
                                    key={item.text}
                                    color="inherit"
                                    component={RouterLink}
                                    to={item.path}
                                    startIcon={item.icon}
                                    sx={{ ml: 2 }}
                                >
                                    {item.text}
                                </Button>
                            ))}
                            {user && (
                                <Button
                                    color="inherit"
                                    onClick={handleLogout}
                                    startIcon={<ExitToApp />}
                                    sx={{ ml: 2 }}
                                >
                                    Logout
                                </Button>
                            )}
                        </Box>
                    )}

                    {user && (
                        <Button
                            color="inherit"
                            onClick={account ? undefined : connectWallet}
                            sx={{ ml: 2 }}
                        >
                            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer
                variant="temporary"
                anchor="left"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true // Better open performance on mobile
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default Navbar;