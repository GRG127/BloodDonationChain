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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import {
    VerifiedUser as VerifiedIcon,
    Warning as WarningIcon,
    Block as BlockIcon,
    Settings as SettingsIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { contract, account } = useWeb3();
    const [hospitals, setHospitals] = useState([]);
    const [systemStats, setSystemStats] = useState({
        totalDonors: 0,
        totalRecipients: 0,
        totalHospitals: 0,
        totalDonations: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState(null);

    useEffect(() => {
        if (contract && account) {
            loadAdminData();
        }
    }, [contract, account]);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            // For demo purposes, using mock data
            // In a real application, fetch from blockchain
            setHospitals([
                {
                    address: '0x1234...5678',
                    name: 'City General Hospital',
                    status: 'VERIFIED',
                    registrationNumber: 'H001',
                    joinDate: '2024-01-15'
                },
                {
                    address: '0x8765...4321',
                    name: 'Medical Center',
                    status: 'PENDING',
                    registrationNumber: 'H002',
                    joinDate: '2024-03-10'
                }
            ]);

            setSystemStats({
                totalDonors: 150,
                totalRecipients: 75,
                totalHospitals: 10,
                totalDonations: 200
            });

            setRecentActivity([
                {
                    id: 1,
                    type: 'HOSPITAL_REGISTRATION',
                    details: 'New hospital registration request',
                    timestamp: '2024-03-15 14:30',
                    status: 'PENDING'
                },
                {
                    id: 2,
                    type: 'DONATION',
                    details: 'Blood donation verified',
                    timestamp: '2024-03-15 13:45',
                    status: 'COMPLETED'
                }
            ]);
        } catch (err) {
            setError('Failed to load admin data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyHospital = async (hospitalAddress) => {
        try {
            // Call smart contract to verify hospital
            await contract.verifyHospital(hospitalAddress);
            
            // Update local state
            setHospitals(prev =>
                prev.map(hospital =>
                    hospital.address === hospitalAddress
                        ? { ...hospital, status: 'VERIFIED' }
                        : hospital
                )
            );
        } catch (err) {
            setError('Failed to verify hospital');
            console.error(err);
        }
    };

    const handleBlockHospital = async (hospitalAddress) => {
        try {
            // Call smart contract to block hospital
            await contract.blockHospital(hospitalAddress);
            
            // Update local state
            setHospitals(prev =>
                prev.map(hospital =>
                    hospital.address === hospitalAddress
                        ? { ...hospital, status: 'BLOCKED' }
                        : hospital
                )
            );
        } catch (err) {
            setError('Failed to block hospital');
            console.error(err);
        }
    };

    const handleDialogOpen = (hospital) => {
        setSelectedHospital(hospital);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedHospital(null);
    };

    if (loading && hospitals.length === 0) {
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
                {/* System Stats */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            System Overview
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={3}>
                                <Typography variant="h4" gutterBottom>
                                    {systemStats.totalDonors}
                                </Typography>
                                <Typography color="text.secondary">
                                    Total Donors
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Typography variant="h4" gutterBottom>
                                    {systemStats.totalRecipients}
                                </Typography>
                                <Typography color="text.secondary">
                                    Total Recipients
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Typography variant="h4" gutterBottom>
                                    {systemStats.totalHospitals}
                                </Typography>
                                <Typography color="text.secondary">
                                    Registered Hospitals
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Typography variant="h4" gutterBottom>
                                    {systemStats.totalDonations}
                                </Typography>
                                <Typography color="text.secondary">
                                    Total Donations
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Hospital Management */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Hospital Management
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Hospital Name</TableCell>
                                        <TableCell>Registration</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {hospitals.map((hospital) => (
                                        <TableRow key={hospital.address}>
                                            <TableCell>{hospital.name}</TableCell>
                                            <TableCell>{hospital.registrationNumber}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={hospital.status}
                                                    color={
                                                        hospital.status === 'VERIFIED'
                                                            ? 'success'
                                                            : hospital.status === 'PENDING'
                                                            ? 'warning'
                                                            : 'error'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    {hospital.status === 'PENDING' && (
                                                        <Button
                                                            size="small"
                                                            startIcon={<VerifiedIcon />}
                                                            color="success"
                                                            onClick={() => handleVerifyHospital(hospital.address)}
                                                        >
                                                            Verify
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="small"
                                                        startIcon={<SettingsIcon />}
                                                        onClick={() => handleDialogOpen(hospital)}
                                                    >
                                                        Details
                                                    </Button>
                                                    {hospital.status !== 'BLOCKED' && (
                                                        <Button
                                                            size="small"
                                                            startIcon={<BlockIcon />}
                                                            color="error"
                                                            onClick={() => handleBlockHospital(hospital.address)}
                                                        >
                                                            Block
                                                        </Button>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography component="h2" variant="h6" color="primary">
                                Recent Activity
                            </Typography>
                            <Button
                                startIcon={<RefreshIcon />}
                                onClick={loadAdminData}
                            >
                                Refresh
                            </Button>
                        </Box>
                        <List>
                            {recentActivity.map((activity, index) => (
                                <React.Fragment key={activity.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={activity.details}
                                            secondary={activity.timestamp}
                                        />
                                        <Chip
                                            label={activity.status}
                                            color={activity.status === 'COMPLETED' ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </ListItem>
                                    {index < recentActivity.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Hospital Details Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Hospital Details</DialogTitle>
                <DialogContent>
                    {selectedHospital && (
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Hospital Name"
                                value={selectedHospital.name}
                                disabled
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Registration Number"
                                value={selectedHospital.registrationNumber}
                                disabled
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Wallet Address"
                                value={selectedHospital.address}
                                disabled
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Join Date"
                                value={selectedHospital.joinDate}
                                disabled
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;