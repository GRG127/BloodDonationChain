import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Link,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        profile: {
            name: '',
            bloodGroup: '',
            location: '',
            phone: ''
        }
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();
    const { account, connectWallet, contract } = useWeb3();

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (!account) {
            setError('Please connect your wallet first');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            const userData = {
                email: formData.email,
                password: formData.password,
                role: formData.role,
                walletAddress: account,
                profile: {
                    ...formData.profile,
                    bloodGroup: formData.role === 'donor' ? formData.profile.bloodGroup : undefined
                }
            };

            // Register in smart contract if user is a donor
            if (formData.role === 'donor') {
                try {
                    const tx = await contract.registerDonor(formData.profile.bloodGroup);
                    await tx.wait();
                } catch (err) {
                    console.error('Error registering in smart contract:', err);
                    setError('Failed to register in blockchain. Please try again.');
                    return;
                }
            }

            const user = await register(userData);
            
            // Redirect based on user role
            const dashboardRoutes = {
                donor: '/donor/dashboard',
                recipient: '/recipient/dashboard',
                hospital: '/hospital/dashboard',
                admin: '/admin/dashboard'
            };
            navigate(dashboardRoutes[user.role]);
        } catch (err) {
            // Check if this is a wallet address error
            if (err.response?.data?.code === 'DUPLICATE_WALLET') {
                setError('This wallet address is already registered. Please connect a different wallet.');
            } else {
                setError(err.response?.data?.message || 'Failed to register');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleWalletConnect = async () => {
        try {
            setError('');
            setLoading(true);
            
            // Check if MetaMask is installed
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to use this application');
            }

            // Try to connect wallet
            const connectedAccount = await connectWallet();
            console.log('Connected account:', connectedAccount);

            // Reset form data after successful connection
            setFormData(prev => ({
                ...prev,
                email: '',
                password: '',
                confirmPassword: '',
                role: '',
                profile: {
                    name: '',
                    bloodGroup: '',
                    location: '',
                    phone: ''
                }
            }));
        } catch (err) {
            console.error('Wallet connection error:', err);
            setError(err.message || 'Failed to connect wallet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%'
                    }}
                >
                    <Typography component="h1" variant="h5">
                        Register
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleWalletConnect}
                                    disabled={loading}
                                >
                                    {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        name="role"
                                        value={formData.role}
                                        label="Role"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="donor">Donor</MenuItem>
                                        <MenuItem value="recipient">Recipient</MenuItem>
                                        <MenuItem value="hospital">Hospital</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="profile.name"
                                    label="Full Name"
                                    value={formData.profile.name}
                                    onChange={handleChange}
                                />
                            </Grid>
                            {formData.role === 'donor' && (
                                <Grid item xs={12}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Blood Group</InputLabel>
                                        <Select
                                            name="profile.bloodGroup"
                                            value={formData.profile.bloodGroup}
                                            label="Blood Group"
                                            onChange={handleChange}
                                        >
                                            {bloodGroups.map(group => (
                                                <MenuItem key={group} value={group}>
                                                    {group}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="profile.location"
                                    label="Location"
                                    value={formData.profile.location}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="profile.phone"
                                    label="Phone Number"
                                    value={formData.profile.phone}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link href="/login" variant="body2">
                                Already have an account? Sign in
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;