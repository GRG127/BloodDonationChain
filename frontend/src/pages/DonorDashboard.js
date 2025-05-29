import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
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
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    LocalHospital as HospitalIcon,
    EmojiEvents as TrophyIcon,
    Timeline as TimelineIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const DonorDashboard = () => {
    const { user } = useAuth();
    const { contract, account, provider } = useWeb3();
    const [donationHistory, setDonationHistory] = useState([]);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
    const [scheduleData, setScheduleData] = useState({
        date: new Date(),
        time: '',
        hospital: '',
        notes: ''
    });
    const [hospitals, setHospitals] = useState([
        'City General Hospital',
        'Medical Center',
        'St. Mary\'s Hospital',
        'Community Health Center'
    ]);

    useEffect(() => {
        if (contract && account) {
            loadDonorData();
            setupEventListeners();
        }
    }, [contract, account]);

    const setupEventListeners = () => {
        if (!contract || !provider) return;

        // Listen for blood donation events
        const filter = {
            address: contract.address,
            topics: [
                ethers.utils.id("BloodDonationRecorded(address,string)"),
                ethers.utils.hexZeroPad(account, 32)
            ]
        };

        provider.on(filter, async () => {
            console.log('New donation recorded, refreshing data...');
            await loadDonorData();
        });

        // Listen for reward points updates
        const rewardFilter = {
            address: contract.address,
            topics: [
                ethers.utils.id("RewardPointsUpdated(address,uint256)"),
                ethers.utils.hexZeroPad(account, 32)
            ]
        };

        provider.on(rewardFilter, async () => {
            console.log('Reward points updated, refreshing data...');
            await loadDonorData();
        });

        return () => {
            provider.removeAllListeners(filter);
            provider.removeAllListeners(rewardFilter);
        };
    };

    const loadDonorData = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Get donor info from smart contract
            const donorInfo = await contract.getDonorInfo(account);
            
            // Check if donor is registered
            if (!donorInfo.isRegistered) {
                setError('Please complete your registration first');
                return;
            }

            const points = donorInfo.rewardPoints.toNumber();
            console.log('Current reward points:', points);
            setRewardPoints(points);

            // Get scheduled donations
            const scheduledDonations = await contract.getScheduledDonations(account);
            console.log('Scheduled donations:', scheduledDonations);
            
            const scheduledDonationsList = scheduledDonations.timestamps.map((timestamp, index) => ({
                id: `scheduled-${timestamp}`,
                date: new Date(timestamp * 1000).toISOString().split('T')[0],
                time: new Date(timestamp * 1000).toLocaleTimeString(),
                hospital: scheduledDonations.hospitals[index],
                status: scheduledDonations.completed[index] ? 'Completed' : 'Scheduled',
                pointsEarned: scheduledDonations.completed[index] ? 10 : 0,
                notes: scheduledDonations.notes[index]
            }));

            // Get completed donation history from smart contract
            const filter = {
                address: contract.address,
                topics: [
                    ethers.utils.id("BloodDonationRecorded(address,string)"),
                    ethers.utils.hexZeroPad(account, 32)
                ]
            };

            const donationEvents = await provider.getLogs(filter);

            const completedHistory = await Promise.all(
                donationEvents.map(async (event) => {
                    const block = await provider.getBlock(event.blockNumber);
                    return {
                        id: event.transactionHash,
                        date: new Date(block.timestamp * 1000).toISOString().split('T')[0],
                        time: new Date(block.timestamp * 1000).toLocaleTimeString(),
                        hospital: ethers.utils.parseBytes32String(event.topics[2]),
                        status: 'Completed',
                        pointsEarned: 10
                    };
                })
            );

            // Combine scheduled and completed donations
            const allDonations = [...scheduledDonationsList, ...completedHistory];
            
            // Sort by date (most recent first)
            allDonations.sort((a, b) => new Date(b.date) - new Date(a.date));

            console.log('All donations:', allDonations);
            setDonationHistory(allDonations);
        } catch (err) {
            console.error('Error loading donor data:', err);
            setError('Failed to load donor data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getRewardLevel = (points) => {
        if (points >= 100) return { level: 'Platinum', color: '#E5E4E2' };
        if (points >= 50) return { level: 'Gold', color: '#FFD700' };
        if (points >= 20) return { level: 'Silver', color: '#C0C0C0' };
        return { level: 'Bronze', color: '#CD7F32' };
    };

    const handleScheduleDialogOpen = () => {
        setOpenScheduleDialog(true);
    };

    const handleScheduleDialogClose = () => {
        setOpenScheduleDialog(false);
        setScheduleData({
            date: new Date(),
            time: '',
            hospital: '',
            notes: ''
        });
    };

    const handleScheduleInputChange = (field) => (event) => {
        setScheduleData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleDateChange = (newDate) => {
        setScheduleData(prev => ({
            ...prev,
            date: newDate
        }));
    };

    const handleScheduleDonation = async () => {
        try {
            setLoading(true);
            setError('');

            if (!scheduleData.date || !scheduleData.time || !scheduleData.hospital) {
                throw new Error('Please fill in all required fields');
            }

            // Check if the function exists in the contract
            if (!contract.scheduleDonation) {
                throw new Error('Contract function not available. Please make sure you have the latest contract deployed.');
            }

            // Format the date and time
            const scheduledDateTime = new Date(scheduleData.date);
            const [hours, minutes] = scheduleData.time.split(':');
            scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

            // Check if the scheduled time is in the future
            if (scheduledDateTime <= new Date()) {
                throw new Error('Please schedule for a future date and time');
            }

            // Get donor info to check last donation time
            const donorInfo = await contract.getDonorInfo(account);
            const lastDonationTime = new Date(donorInfo.lastDonationTime.toNumber() * 1000);
            const minimumInterval = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds

            if (scheduledDateTime - lastDonationTime < minimumInterval) {
                throw new Error('Must wait 90 days between donations');
            }

            // Schedule donation in smart contract
            const tx = await contract.scheduleDonation(
                scheduleData.hospital,
                scheduleData.notes || ''
            );
            
            // Wait for transaction to be mined
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                // Refresh donor data
                await loadDonorData();

                // Show success message
                setError('');
                const successMessage = `Donation scheduled for ${scheduleData.date.toLocaleDateString()} at ${scheduleData.time} at ${scheduleData.hospital}`;
                setError(successMessage);

                // Close the dialog
                handleScheduleDialogClose();
            } else {
                throw new Error('Transaction failed');
            }
        } catch (err) {
            console.error('Error scheduling donation:', err);
            setError(err.message || 'Failed to schedule donation');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteDonation = async (scheduledTimestamp) => {
        try {
            setLoading(true);
            setError('');

            const tx = await contract.completeScheduledDonation(scheduledTimestamp);
            await tx.wait();

            // Refresh donor data
            await loadDonorData();

            setError('Donation completed successfully!');
        } catch (err) {
            console.error('Error completing donation:', err);
            setError(err.message || 'Failed to complete donation');
        } finally {
            setLoading(false);
        }
    };

    // Update the donation history display to show time for scheduled donations
    const renderDonationHistory = () => (
        <List>
            {donationHistory.map((donation, index) => (
                <React.Fragment key={donation.id}>
                    <ListItem>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1">
                                        {donation.date} at {donation.time}
                                    </Typography>
                                    <Chip
                                        label={donation.status}
                                        color={donation.status === 'Completed' ? 'success' : 'primary'}
                                        size="small"
                                    />
                                </Box>
                            }
                            secondary={
                                <>
                                    <Typography variant="body2" color="text.secondary">
                                        Hospital: {donation.hospital}
                                    </Typography>
                                    {donation.notes && (
                                        <Typography variant="body2" color="text.secondary">
                                            Notes: {donation.notes}
                                        </Typography>
                                    )}
                                    {donation.status === 'Completed' && (
                                        <Typography variant="body2" color="text.secondary">
                                            Points Earned: {donation.pointsEarned}
                                        </Typography>
                                    )}
                                </>
                            }
                        />
                        {donation.status === 'Scheduled' && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleCompleteDonation(parseInt(donation.id.split('-')[1]))}
                            >
                                Complete
                            </Button>
                        )}
                    </ListItem>
                    {index < donationHistory.length - 1 && <Divider />}
                </React.Fragment>
            ))}
        </List>
    );

    const renderScheduleDialog = () => (
        <Dialog open={openScheduleDialog} onClose={handleScheduleDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle>Schedule Blood Donation</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Donation Date"
                            value={scheduleData.date}
                            onChange={handleDateChange}
                            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                            minDate={new Date()}
                        />
                    </LocalizationProvider>
                    
                    <TextField
                        fullWidth
                        label="Time"
                        type="time"
                        value={scheduleData.time}
                        onChange={handleScheduleInputChange('time')}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Hospital</InputLabel>
                        <Select
                            value={scheduleData.hospital}
                            label="Hospital"
                            onChange={handleScheduleInputChange('hospital')}
                        >
                            {hospitals.map((hospital) => (
                                <MenuItem key={hospital} value={hospital}>
                                    {hospital}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Additional Notes"
                        multiline
                        rows={4}
                        value={scheduleData.notes}
                        onChange={handleScheduleInputChange('notes')}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleScheduleDialogClose}>Cancel</Button>
                <Button
                    onClick={handleScheduleDonation}
                    variant="contained"
                    disabled={!scheduleData.date || !scheduleData.time || !scheduleData.hospital}
                >
                    Schedule
                </Button>
            </DialogActions>
        </Dialog>
    );

    if (loading && rewardPoints === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && (
                <Alert 
                    severity={error.includes('scheduled') ? 'success' : 'error'} 
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {/* Donor Info Card */}
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
                                Donor Profile
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Name: {user?.profile?.name}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Blood Group: {user?.profile?.bloodGroup}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Location: {user?.profile?.location}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    icon={<TrophyIcon />}
                                    label={`${getRewardLevel(rewardPoints).level} Donor`}
                                    sx={{
                                        bgcolor: getRewardLevel(rewardPoints).color,
                                        color: 'white'
                                    }}
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Rewards Card */}
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
                                Rewards Status
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrophyIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h4">
                                    {rewardPoints} Points
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Next reward at {rewardPoints + (10 - (rewardPoints % 10))} points
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                            >
                                View Rewards Catalog
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Quick Actions Card */}
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
                                variant="outlined"
                                startIcon={<CalendarIcon />}
                                onClick={handleScheduleDialogOpen}
                                sx={{ mb: 2 }}
                            >
                                Schedule Donation
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<TimelineIcon />}
                                sx={{ mb: 2 }}
                            >
                                View Donation History
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Donation History */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                Recent Donations
                            </Typography>
                            {renderDonationHistory()}
                        </Paper>
                    </Grid>
                </Grid>
            )}
            
            {renderScheduleDialog()}
        </Container>
    );
};

export default DonorDashboard;