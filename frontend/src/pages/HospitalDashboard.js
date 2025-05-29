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
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const HospitalDashboard = () => {
    const { user } = useAuth();
    const { contract, account } = useWeb3();
    const [inventory, setInventory] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
    const [selectedUnits, setSelectedUnits] = useState('');

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    useEffect(() => {
        // Load data immediately
        loadDashboardData();
    }, []); // Remove contract and account dependencies

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // For demo purposes, using mock data
            const mockInventory = [
                { bloodGroup: 'A+', quantity: 10, lastUpdated: '2024-03-15' },
                { bloodGroup: 'B+', quantity: 5, lastUpdated: '2024-03-15' },
                { bloodGroup: 'O+', quantity: 8, lastUpdated: '2024-03-14' },
                { bloodGroup: 'AB+', quantity: 3, lastUpdated: '2024-03-13' }
            ];

            const mockRequests = [
                {
                    id: 1,
                    bloodGroup: 'O+',
                    units: 2,
                    recipient: '0x1234...5678',
                    status: 'PENDING',
                    date: '2024-03-15',
                    urgency: 'urgent'
                },
                {
                    id: 2,
                    bloodGroup: 'A+',
                    units: 1,
                    recipient: '0x8765...4321',
                    status: 'FULFILLED',
                    date: '2024-03-14',
                    urgency: 'normal'
                }
            ];

            // Set data
            setInventory(mockInventory);
            setRequests(mockRequests);
        } catch (err) {
            console.error('Error loading dashboard:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleDialogOpen = (type, item = null) => {
        setDialogType(type);
        setSelectedItem(item);
        if (item) {
            setSelectedBloodGroup(item.bloodGroup);
            setSelectedUnits(item.quantity.toString());
        } else {
            setSelectedBloodGroup('');
            setSelectedUnits('');
        }
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setDialogType('');
        setSelectedItem(null);
        setSelectedBloodGroup('');
        setSelectedUnits('');
    };

    const handleUpdateInventory = async (bloodGroup, quantity) => {
        try {
            // Update inventory in blockchain
            // await contract.updateInventory(bloodGroup, quantity);
            
            // Update local state
            setInventory(prev => {
                const index = prev.findIndex(item => item.bloodGroup === bloodGroup);
                if (index >= 0) {
                    const updated = [...prev];
                    updated[index] = {
                        ...updated[index],
                        quantity: parseInt(quantity),
                        lastUpdated: new Date().toISOString().split('T')[0]
                    };
                    return updated;
                }
                return [
                    ...prev,
                    {
                        bloodGroup,
                        quantity: parseInt(quantity),
                        lastUpdated: new Date().toISOString().split('T')[0]
                    }
                ];
            });
            handleDialogClose();
        } catch (err) {
            setError('Failed to update inventory');
            console.error(err);
        }
    };

    const handleUpdateRequestStatus = async (requestId, status) => {
        try {
            // Update request status in blockchain
            await contract.updateRequestStatus(requestId, status);
            
            // Update local state
            setRequests(prev =>
                prev.map(request =>
                    request.id === requestId
                        ? { ...request, status }
                        : request
                )
            );
        } catch (err) {
            setError('Failed to update request status');
            console.error(err);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Show error state
    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Hospital Info */}
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
                            Hospital Profile
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Name: {user?.profile?.name}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Location: {user?.profile?.location}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Registration: {user?.hospitalInfo?.registrationNumber}
                        </Typography>
                        <Chip
                            icon={<HospitalIcon />}
                            label="Verified Hospital"
                            color="success"
                            sx={{ mt: 2, width: 'fit-content' }}
                        />
                    </Paper>
                </Grid>

                {/* Quick Stats */}
                <Grid item xs={12} md={8}>
                    <Paper
                        sx={{
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240
                        }}
                    >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Quick Statistics
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="h4" gutterBottom>
                                    {inventory.reduce((sum, item) => sum + item.quantity, 0)}
                                </Typography>
                                <Typography color="text.secondary">
                                    Total Units Available
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="h4" gutterBottom>
                                    {requests.filter(r => r.status === 'PENDING').length}
                                </Typography>
                                <Typography color="text.secondary">
                                    Pending Requests
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="h4" gutterBottom>
                                    {requests.filter(r => r.status === 'FULFILLED').length}
                                </Typography>
                                <Typography color="text.secondary">
                                    Fulfilled Requests
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Blood Inventory */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography component="h2" variant="h6" color="primary">
                                Blood Inventory
                            </Typography>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => handleDialogOpen('inventory')}
                            >
                                Update Inventory
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Blood Group</TableCell>
                                        <TableCell align="right">Units</TableCell>
                                        <TableCell align="right">Last Updated</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {inventory.map((item, index) => (
                                        <TableRow key={`${item.bloodGroup}-${index}`}>
                                            <TableCell>{item.bloodGroup}</TableCell>
                                            <TableCell align="right">{item.quantity}</TableCell>
                                            <TableCell align="right">{item.lastUpdated}</TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => handleDialogOpen('inventory', item)}
                                                >
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Blood Requests */}
                <Grid item xs={12} md={6}>
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
                                            secondary={`Date: ${request.date} | Recipient: ${request.recipient}`}
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                label={request.status}
                                                color={request.status === 'FULFILLED' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                            {request.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        size="small"
                                                        startIcon={<CheckCircleIcon />}
                                                        color="success"
                                                        onClick={() => handleUpdateRequestStatus(request.id, 'FULFILLED')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        startIcon={<CancelIcon />}
                                                        color="error"
                                                        onClick={() => handleUpdateRequestStatus(request.id, 'REJECTED')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </Box>
                                    </ListItem>
                                    {index < requests.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Inventory Update Dialog */}
            <Dialog open={openDialog && dialogType === 'inventory'} onClose={handleDialogClose}>
                <DialogTitle>
                    {selectedItem ? 'Update Blood Units' : 'Add Blood Units'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Blood Group</InputLabel>
                            <Select
                                value={selectedBloodGroup}
                                label="Blood Group"
                                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                                disabled={!!selectedItem}
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
                            label="Units Available"
                            type="number"
                            value={selectedUnits}
                            onChange={(e) => setSelectedUnits(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button
                        onClick={() => handleUpdateInventory(selectedBloodGroup, selectedUnits)}
                        variant="contained"
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default HospitalDashboard;