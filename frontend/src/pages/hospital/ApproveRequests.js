import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const ApproveRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError('');

            // Mock data for requests
            const mockRequests = [
                {
                    id: 1,
                    bloodGroup: 'O+',
                    units: 2,
                    recipient: '0x1234...5678',
                    status: 'PENDING',
                    date: '2024-03-15',
                    urgency: 'urgent',
                    hospital: 'City General Hospital',
                    patientName: 'John Doe',
                    reason: 'Emergency Surgery'
                },
                {
                    id: 2,
                    bloodGroup: 'A+',
                    units: 1,
                    recipient: '0x8765...4321',
                    status: 'PENDING',
                    date: '2024-03-14',
                    urgency: 'normal',
                    hospital: 'Memorial Hospital',
                    patientName: 'Jane Smith',
                    reason: 'Regular Transfusion'
                },
                {
                    id: 3,
                    bloodGroup: 'B+',
                    units: 3,
                    recipient: '0x9876...5432',
                    status: 'PENDING',
                    date: '2024-03-16',
                    urgency: 'urgent',
                    hospital: 'St. Mary\'s Hospital',
                    patientName: 'Robert Johnson',
                    reason: 'Accident Victim'
                }
            ];

            setRequests(mockRequests);
        } catch (err) {
            console.error('Error loading requests:', err);
            setError('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            // Update request status in blockchain
            // await contract.approveRequest(requestId);
            
            // Update local state
            setRequests(prev =>
                prev.map(request =>
                    request.id === requestId
                        ? { ...request, status: 'APPROVED' }
                        : request
                )
            );
        } catch (err) {
            setError('Failed to approve request');
            console.error(err);
        }
    };

    const handleReject = (request) => {
        setSelectedRequest(request);
        setOpenDialog(true);
    };

    const handleRejectConfirm = async () => {
        try {
            if (!rejectionReason) {
                setError('Please provide a reason for rejection');
                return;
            }

            // Update request status in blockchain
            // await contract.rejectRequest(selectedRequest.id, rejectionReason);
            
            // Update local state
            setRequests(prev =>
                prev.map(request =>
                    request.id === selectedRequest.id
                        ? { ...request, status: 'REJECTED', rejectionReason }
                        : request
                )
            );

            handleDialogClose();
        } catch (err) {
            setError('Failed to reject request');
            console.error(err);
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedRequest(null);
        setRejectionReason('');
    };

    if (loading) {
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

            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <HospitalIcon sx={{ mr: 1 }} />
                    <Typography component="h1" variant="h5">
                        Blood Request Approvals
                    </Typography>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Patient</TableCell>
                                <TableCell>Blood Group</TableCell>
                                <TableCell>Units</TableCell>
                                <TableCell>Hospital</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Urgency</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{request.date}</TableCell>
                                    <TableCell>{request.patientName}</TableCell>
                                    <TableCell>{request.bloodGroup}</TableCell>
                                    <TableCell>{request.units}</TableCell>
                                    <TableCell>{request.hospital}</TableCell>
                                    <TableCell>{request.reason}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={request.urgency}
                                            color={request.urgency === 'urgent' ? 'error' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={request.status}
                                            color={
                                                request.status === 'APPROVED'
                                                    ? 'success'
                                                    : request.status === 'REJECTED'
                                                    ? 'error'
                                                    : 'warning'
                                            }
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {request.status === 'PENDING' && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<CheckCircleIcon />}
                                                    color="success"
                                                    onClick={() => handleApprove(request.id)}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={<CancelIcon />}
                                                    color="error"
                                                    onClick={() => handleReject(request)}
                                                >
                                                    Reject
                                                </Button>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Rejection Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Reject Request</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason for Rejection"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button onClick={handleRejectConfirm} color="error">
                        Confirm Rejection
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ApproveRequests;
