import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField
} from '@mui/material';
import {
    LocalHospital as HospitalIcon,
    Search as SearchIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';


const RecipientDashboard = () => {
    const { user } = useAuth();
    const { contract, account, signer, connectWallet, loading: web3Loading, error: web3Error } = useWeb3();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [newRequest, setNewRequest] = useState({
        bloodGroup: '',
        units: '',
        urgency: 'normal',
        notes: ''
    });

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const urgencyLevels = ['Normal', 'Urgent', 'Emergency'];

    useEffect(() => {
        if (contract && account) {
            loadRequests();
        }
    }, [contract, account]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError('');
            // For demo purposes, using mock data
            // In a real application, fetch from blockchain
            setRequests([
                {
                    id: 1,
                    bloodGroup: 'O+',
                    units: 2,
                    status: 'PENDING',
                    date: '2024-03-15',
                    hospital: 'City General Hospital',
                    urgency: 'urgent'
                },
                {
                    id: 2,
                    bloodGroup: 'A+',
                    units: 1,
                    status: 'FULFILLED',
                    date: '2024-03-10',
                    hospital: 'Medical Center',
                    urgency: 'normal'
                }
            ]);
        } catch (err) {
            setError('Failed to load requests');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDialogOpen = () => {
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setNewRequest({
            bloodGroup: '',
            units: '',
            urgency: 'normal',
            notes: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRequest(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitRequest = async () => {
        try {
            if (!account) {
                // If no account is connected, try to connect wallet
                await connectWallet();
                return; // The function will be called again after wallet connection
            }

            if (!contract || !signer) {
                throw new Error('Please connect your wallet first');
            }

            setLoading(true);
            setError('');
            
            // Get the contract with signer
            const contractWithSigner = contract.connect(signer);
            
            // Call smart contract to create request
            const tx = await contractWithSigner.requestBlood(newRequest.bloodGroup);
            await tx.wait();
            
            // Add to local state
            setRequests(prev => [{
                id: Date.now(),
                ...newRequest,
                status: 'PENDING',
                date: new Date().toISOString().split('T')[0]
            }, ...prev]);
            
            handleDialogClose();
        } catch (err) {
            setError(err.message || 'Failed to submit request');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'FULFILLED':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'REJECTED':
                return 'error';
            default:
                return 'default';
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'emergency':
                return 'error';
            case 'urgent':
                return 'warning';
            default:
                return 'info';
        }
    };

    // Show loading state only during initial load
    if (web3Loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Show error if Web3 initialization failed
    if (web3Error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {web3Error}
                </Alert>
            </Container>
        );
    }

    // Show loading state only during initial data load
    if (loading && requests.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Profile Card */}
                <Grid item xs={12} md={4}>
                    <Paper
                        sx={{
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240
                        }}
                    >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Recipient Profile
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Name: {user?.profile?.name}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Location: {user?.profile?.location}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Contact: {user?.profile?.phone}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12} md={4}>
                    <Paper
                        sx={{
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240
                        }}
                    >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Quick Actions
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<HospitalIcon />}
                            onClick={handleDialogOpen}
                            sx={{ mb: 2 }}
                        >
                            New Blood Request
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<SearchIcon />}
                            sx={{ mb: 2 }}
                        >
                            Find Nearby Hospitals
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<NotificationsIcon />}
                        >
                            Manage Notifications
                        </Button>
                    </Paper>
                </Grid>

                {/* Statistics */}
                <Grid item xs={12} md={4}>
                    <Paper
                        sx={{
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240
                        }}
                    >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Request Statistics
                        </Typography>
                        <Typography variant="h4" gutterBottom>
                            {requests.length}
                        </Typography>
                        <Typography color="text.secondary">
                            Total Requests
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            {requests.filter(r => r.status === 'FULFILLED').length} Fulfilled
                        </Typography>
                        <Typography variant="body2">
                            {requests.filter(r => r.status === 'PENDING').length} Pending
                        </Typography>
                    </Paper>
                </Grid>

                {/* Request History */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Blood Requests
                        </Typography>
                        <List>
                            {requests.map((request, index) => (
                                <React.Fragment key={request.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={`${request.bloodGroup} - ${request.units} units`}
                                            secondary={`Date: ${request.date} | Hospital: ${request.hospital}`}
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Chip
                                                label={request.urgency}
                                                color={getUrgencyColor(request.urgency)}
                                                size="small"
                                            />
                                            <Chip
                                                label={request.status}
                                                color={getStatusColor(request.status)}
                                                size="small"
                                            />
                                        </Box>
                                    </ListItem>
                                    {index < requests.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* New Request Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>New Blood Request</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Blood Group</InputLabel>
                            <Select
                                name="bloodGroup"
                                value={newRequest.bloodGroup}
                                label="Blood Group"
                                onChange={handleInputChange}
                            >
                                {bloodGroups.map(group => (
                                    <MenuItem key={group} value={group}>
                                        {group}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Units Required"
                            name="units"
                            type="number"
                            value={newRequest.units}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Urgency Level</InputLabel>
                            <Select
                                name="urgency"
                                value={newRequest.urgency}
                                label="Urgency Level"
                                onChange={handleInputChange}
                            >
                                {urgencyLevels.map(level => (
                                    <MenuItem key={level} value={level}>
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Additional Notes"
                            name="notes"
                            multiline
                            rows={4}
                            value={newRequest.notes}
                            onChange={handleInputChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmitRequest}
                        variant="contained"
                        disabled={!newRequest.bloodGroup || !newRequest.units}
                    >
                        Submit Request
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RecipientDashboard;