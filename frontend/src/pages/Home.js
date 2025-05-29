import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    Grid,
    Box,
    Card,
    CardContent,
    CardActions,
    useTheme
} from '@mui/material';
import {
    Favorite as HeartIcon,
    Security as SecurityIcon,
    Timeline as TimelineIcon,
    People as PeopleIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { user } = useAuth();

    const features = [
        {
            icon: <HeartIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
            title: 'Secure Blood Donation',
            description: 'Track and manage blood donations securely using blockchain technology.'
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
            title: 'Transparent System',
            description: 'Ensure complete transparency and traceability in the donation process.'
        },
        {
            icon: <TimelineIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
            title: 'Real-time Updates',
            description: 'Get instant updates on blood availability and donation requests.'
        },
        {
            icon: <PeopleIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
            title: 'Community Network',
            description: 'Connect donors, recipients, and hospitals in a unified platform.'
        }
    ];

    return (
        <Box sx={{ bgcolor: 'background.default' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 8,
                    mb: 6
                }}
            >
                <Container maxWidth="md">
                    <Typography
                        component="h1"
                        variant="h2"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: 'bold' }}
                    >
                        Blood Donation Chain
                    </Typography>
                    <Typography
                        variant="h5"
                        align="center"
                        paragraph
                        sx={{ mb: 4 }}
                    >
                        A secure and transparent blood donation management system powered by blockchain technology
                    </Typography>
                    {!user && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                onClick={() => navigate('/register')}
                            >
                                Get Started
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="large"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </Button>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ mb: 8 }}>
                <Typography
                    component="h2"
                    variant="h3"
                    align="center"
                    sx={{ mb: 6 }}
                >
                    Key Features
                </Typography>
                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item key={index} xs={12} sm={6} md={3}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: '0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: 6
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                    <Box sx={{ mb: 2 }}>
                                        {feature.icon}
                                    </Box>
                                    <Typography gutterBottom variant="h5" component="h3">
                                        {feature.title}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={() => navigate('/register')}
                                    >
                                        Learn More
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Call to Action */}
            <Box
                sx={{
                    bgcolor: 'secondary.main',
                    color: 'white',
                    py: 6
                }}
            >
                <Container maxWidth="md">
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                    >
                        Ready to Make a Difference?
                    </Typography>
                    <Typography
                        variant="h6"
                        align="center"
                        paragraph
                        sx={{ mb: 4 }}
                    >
                        Join our platform and become part of a life-saving community
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => navigate('/register')}
                        >
                            Register Now
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Home;