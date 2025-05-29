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
    Chip,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';

const BloodRequests = () => {
    const { contract, account } = useWeb3();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (contract && account) {
            loadRequests();
        }
    }, [contract, account]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setRequests([
                {
                    id: 1,
                    bloodGroup: 'A+',
                    units: 2,
                    status: 'PENDING',
                    date: '2024-03-15',
                    requester: 'John Doe',
                    urgency: 'urgent'
                },
                {
                    id: 2,
                    bloodGroup: 'O-',
                    units: 1,
                    status: 'FULFILLED',
                    date: '2024-03-10',
                    requester: 'Jane Smith',
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
            <Typography variant="h4" gutterBottom>
                Blood Requests
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Requester</TableCell>
                            <TableCell>Blood Group</TableCell>
                            <TableCell>Units</TableCell>
                            <TableCell>Urgency</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>{request.date}</TableCell>
                                <TableCell>{request.requester}</TableCell>
                                <TableCell>{request.bloodGroup}</TableCell>
                                <TableCell>{request.units}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={request.urgency}
                                        color={getUrgencyColor(request.urgency)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={request.status}
                                        color={getStatusColor(request.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {request.status === 'PENDING' && (
                                        <>
                                            <Button color="success" size="small">Fulfill</Button>
                                            <Button color="error" size="small">Reject</Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default BloodRequests; 