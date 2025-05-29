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
    Chip,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const DonationHistory = () => {
    const { user } = useAuth();
    const { contract, account } = useWeb3();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (contract && account) {
            loadHistory();
        }
    }, [contract, account]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setHistory([
                {
                    id: 1,
                    date: '2024-03-15',
                    hospital: 'City General Hospital',
                    bloodGroup: 'O+',
                    status: 'Verified',
                    points: 10
                },
                {
                    id: 2,
                    date: '2024-02-01',
                    hospital: 'Medical Center',
                    bloodGroup: 'O+',
                    status: 'Verified',
                    points: 10
                }
            ]);
        } catch (err) {
            setError('Failed to load donation history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Verified':
                return 'success';
            case 'Pending':
                return 'warning';
            case 'Rejected':
                return 'error';
            default:
                return 'default';
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
                Donation History
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Hospital</TableCell>
                            <TableCell>Blood Group</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Points Earned</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history.map((donation) => (
                            <TableRow key={donation.id}>
                                <TableCell>{donation.date}</TableCell>
                                <TableCell>{donation.hospital}</TableCell>
                                <TableCell>{donation.bloodGroup}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={donation.status}
                                        color={getStatusColor(donation.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{donation.points}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default DonationHistory;
