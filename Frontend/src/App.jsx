import { useState, useEffect, useRef } from 'react';
import { Mail, ChevronDown, ChevronUp, User, Briefcase, Phone, MessageSquare, Calendar, Clock, Filter, Layers, ArrowUpDown, Search, X, Moon, Sun, Trash2, Grid, List, LayoutGrid, FileText, RefreshCw, Download, BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import axios from 'axios';

    const API_BASE_URL = 'https://enquiry.thumbeja.com/api/api/emails';

export default function App() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [mounted, setMounted] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [collapseMode, setCollapseMode] = useState('one'); // 'one' or 'all'
    const [sortBy, setSortBy] = useState('none'); // 'none', 'name', 'date', 'business'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const [searchQuery, setSearchQuery] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // Store email id to delete
    const [deleteStatus, setDeleteStatus] = useState(null); // 'deleting', 'success', 'error'
    const [deleteMessage, setDeleteMessage] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table', 'card', 'compact', 'messages', 'stats'
    const headerRef = useRef(null);
    const cardRef = useRef(null);
    const rowsRef = useRef([]);

    // Calculate statistics
    const calculateStats = () => {
        if (emails.length === 0) return null;

        // Total submissions
        const totalSubmissions = emails.length;

        // Submissions by date
        const submissionsByDate = emails.reduce((acc, email) => {
            const date = email.date || 'Unknown';
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Most common business types
        const businessTypes = emails.reduce((acc, email) => {
            const business = email.business?.trim() || 'Not Specified';
            if (business) {
                acc[business] = (acc[business] || 0) + 1;
            }
            return acc;
        }, {});

        // Peak submission times
        const submissionsByHour = emails.reduce((acc, email) => {
            if (email.time) {
                const hour = parseInt(email.time.split(':')[0]);
                acc[hour] = (acc[hour] || 0) + 1;
            }
            return acc;
        }, {});

        // Recent submissions (last 7 days)
        const today = new Date();
        const last7Days = emails.filter(email => {
            if (!email.date) return false;
            const emailDate = new Date(email.date);
            const diffTime = today - emailDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        }).length;

        return {
            totalSubmissions,
            submissionsByDate,
            businessTypes,
            submissionsByHour,
            last7Days,
            topBusinesses: Object.entries(businessTypes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            peakHour: Object.entries(submissionsByHour)
                .sort((a, b) => b[1] - a[1])[0]
        };
    };

    const stats = calculateStats();

    useEffect(() => {
        setMounted(true);
        fetchClients();

    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(API_BASE_URL, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch clients');
            }
            const data = await response.json();
            // Map backend data to frontend format
            const mappedData = data.map(client => ({
                id: client.id,
                name: client.name || '',
                email: client.email || '',
                business: client.business || '',
                contact: client.contact || '',
                message: client.message || '',
                date: client.date || '',
                time: client.time || ''
            }));
            setEmails(mappedData);
            console.log(mappedData);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching clients:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            if (collapseMode === 'one') {
                // Close all other rows when opening a new one
                newExpanded.clear();
            }
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const collapseAll = () => {
        setExpandedRows(new Set());
    };

    const expandAll = () => {
        const allIds = new Set(sortedEmails.map(email => email.id));
        setExpandedRows(allIds);
    };

    // Filter emails based on search query
    const searchedEmails = emails.filter(email => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        return (
            email.name.toLowerCase().includes(query) ||
            email.email.toLowerCase().includes(query) ||
            email.business.toLowerCase().includes(query) ||
            email.contact.toLowerCase().includes(query) ||
            email.message.toLowerCase().includes(query)
        );
    });

    // Filter emails based on selected filter
    const filteredEmails = searchedEmails.filter(email => {
        if (filterType === 'all') return true;
        if (filterType === 'business') return email.business && email.business.trim() !== '';
        if (filterType === 'recent') {
            // Filter emails from today
            const today = new Date().toLocaleDateString();
            return email.date === today;
        }
        return true;
    });

    // Sort filtered emails
    const sortedEmails = [...filteredEmails].sort((a, b) => {
        if (sortBy === 'none') return 0;
        
        let comparison = 0;
        
        if (sortBy === 'name') {
            comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'date') {
            // Compare dates and times
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            comparison = dateA - dateB;
        } else if (sortBy === 'business') {
            comparison = a.business.localeCompare(b.business);
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const handleSort = (field) => {
        if (sortBy === field) {
            // Toggle sort order if clicking the same field
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new sort field with ascending order
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleDeleteClick = (emailAddress, event) => {
        event.stopPropagation(); // Prevent row expansion
        setDeleteConfirm(emailAddress);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        setDeleteStatus('deleting');
        setDeleteMessage('Deleting...');

        try {
            console.log('Deleting email:', deleteConfirm);
            
            const response = await axios.delete("https://enquiry.thumbeja.com/api/api/contactdelete  ", {
                data: { email: deleteConfirm },
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            console.log('Delete response:', response.data);

            // Remove from local state
            setEmails(emails.filter(email => email.email !== deleteConfirm));
            setExpandedRows(prev => {
                const newSet = new Set(prev);
                // Find the ID of the email being deleted to remove from expanded rows
                const emailToDelete = emails.find(e => e.email === deleteConfirm);
                if (emailToDelete) {
                    newSet.delete(emailToDelete.id);
                }
                return newSet;
            });
            
            setDeleteStatus('success');
            setDeleteMessage('Email deleted successfully!');
            
            // Auto close after 1.5 seconds
            setTimeout(() => {
                setDeleteConfirm(null);
                setDeleteStatus(null);
                setDeleteMessage('');
            }, 1500);
        } catch (err) {
            console.error('Error deleting client:', err);
            setDeleteStatus('error');
            setDeleteMessage(err.response?.data?.error || err.message || 'Failed to delete email');
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
        setDeleteStatus(null);
        setDeleteMessage('');
    };

    const exportToCSV = () => {
        if (sortedEmails.length === 0) {
            alert('No emails to export');
            return;
        }

        // CSV headers
        const headers = ['Name', 'Email', 'Business', 'Contact', 'Message', 'Date', 'Time'];
        
        // Convert emails to CSV rows
        const csvRows = sortedEmails.map(email => [
            `"${email.name || ''}"`,
            `"${email.email || ''}"`,
            `"${email.business || ''}"`,
            `"${email.contact || ''}"`,
            `"${(email.message || '').replace(/"/g, '""')}"`, // Escape quotes in message
            `"${email.date || ''}"`,
            `"${email.time || ''}"`
        ].join(','));

        // Combine headers and rows
        const csvContent = [headers.join(','), ...csvRows].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `email-submissions-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`Exported ${sortedEmails.length} emails to CSV`);
    };

    return (
        <div className={`min-h-screen p-6 transition-colors duration-500 ${
            darkMode 
                ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-100'
        }`}>
            <div className="max-w-7xl mx-auto relative">
                {/* Floating View Mode Selector */}
                {!loading && !error && (
                    <div className={`fixed right-6 top-24 z-40 rounded-xl shadow-xl p-3 transition-all duration-300 ${
                        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
                                <LayoutGrid className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                                <span className={`text-xs font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    View
                                </span>
                            </div>
                            
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-3 rounded-lg transition-all duration-300 flex flex-col items-center gap-1 ${
                                    viewMode === 'table'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : darkMode
                                            ? 'text-gray-300 hover:bg-gray-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                title="Table View"
                            >
                                <List className="w-5 h-5" />
                                <span className="text-xs font-medium">Table</span>
                            </button>
                            
                            <button
                                onClick={() => setViewMode('card')}
                                className={`p-3 rounded-lg transition-all duration-300 flex flex-col items-center gap-1 ${
                                    viewMode === 'card'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : darkMode
                                            ? 'text-gray-300 hover:bg-gray-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                title="Card View"
                            >
                                <Grid className="w-5 h-5" />
                                <span className="text-xs font-medium">Card</span>
                            </button>
                            
                            <button
                                onClick={() => setViewMode('compact')}
                                className={`p-3 rounded-lg transition-all duration-300 flex flex-col items-center gap-1 ${
                                    viewMode === 'compact'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : darkMode
                                            ? 'text-gray-300 hover:bg-gray-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                title="Compact View"
                            >
                                <Layers className="w-5 h-5" />
                                <span className="text-xs font-medium">Compact</span>
                            </button>
                            
                            <button
                                onClick={() => setViewMode('stats')}
                                className={`p-3 rounded-lg transition-all duration-300 flex flex-col items-center gap-1 ${
                                    viewMode === 'stats'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : darkMode
                                            ? 'text-gray-300 hover:bg-gray-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                title="Statistics"
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span className="text-xs font-medium">Stats</span>
                            </button>
                            
                        </div>
                    </div>
                )}
                <div
                    ref={cardRef}
                    className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-700 ${
                        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    } ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                    {/* Header */}
                    <div
                        ref={headerRef}
                        className={`p-6 text-white transition-all duration-700 ${
                            mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
                        } ${
                            darkMode 
                                ? 'bg-gradient-to-r from-gray-700 to-gray-900' 
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Mail className="w-8 h-8 animate-pulse" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 text-xs font-bold">?</span>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Enquiry</h1>
                                    <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-blue-100'}`}>
                                        {loading ? 'Loading...' : error ? 'Error loading data' : `${emails.length} total submissions`}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* Refresh Button */}
                                <button
                                    onClick={fetchClients}
                                    disabled={loading}
                                    className={`p-3 rounded-full transition-all duration-300 ${
                                        darkMode 
                                            ? 'bg-white-600 hover:bg-gray-500' 
                                            : 'bg-white  bg-opacity-20 hover:bg-opacity-30'
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title="Refresh emails"
                                >
                                    <RefreshCw className={`w-6 h-6 text-white-600 ${loading ? 'animate-spin' : ''} ${darkMode ? 'text-white-600' : 'text-gray-600'}`} />
                                </button>
                                
                                {/* Dark Mode Toggle */}
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`p-3 rounded-full transition-colors duration-300 ${
                                        darkMode 
                                            ? 'bg-white-600 hover:bg-gray-500' 
                                            : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                                    }`}
                                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                >
                                    {darkMode ? (
                                        <Sun className="w-6 h-6 text-yellow-300" />
                                    ) : (
                                        <Moon className="w-6 h-6 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        {!loading && !error && (
                            <div className="relative max-w-2xl">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, business, contact, or message..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-300"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Filter and Collapse Controls */}
                    {!loading && !error && (
                        <div className={`border-b p-4 ${
                            darkMode 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-gray-50 border-gray-200'
                        }`}>
                            {/* First Row: Filter and Collapse Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                {/* Filter Buttons - Left Side */}
                                <div className="flex items-center gap-2">
                                    <Filter className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                                    <span className={`text-sm font-medium mr-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Filter:</span>
                                    <button
                                        onClick={() => setFilterType('all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                            filterType === 'all'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : darkMode
                                                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilterType('recent')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                            filterType === 'recent'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : darkMode
                                                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                        }`}
                                    >
                                        Recent
                                    </button>
                                    <button
                                        onClick={() => setFilterType('business')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                            filterType === 'business'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : darkMode
                                                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                        }`}
                                    >
                                        Business
                                    </button>
                                </div>

                                {/* Collapse Controls - Right Side */}
                                <div className="flex items-center gap-3">
                                    <div className={`flex items-center gap-2 rounded-lg border p-1 ${
                                        darkMode 
                                            ? 'bg-gray-600 border-gray-500' 
                                            : 'bg-white border-gray-300'
                                    }`}>
                                        <button
                                            onClick={() => setCollapseMode('one')}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                                                collapseMode === 'one'
                                                    ? 'bg-blue-600 text-white'
                                                    : darkMode
                                                        ? 'text-gray-200 hover:bg-gray-500'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Layers className="w-4 h-4" />
                                            Collapse One
                                        </button>
                                        <button
                                            onClick={() => setCollapseMode('all')}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                                                collapseMode === 'all'
                                                    ? 'bg-blue-600 text-white'
                                                    : darkMode
                                                        ? 'text-gray-200 hover:bg-gray-500'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Layers className="w-4 h-4" />
                                            Keep All Open
                                        </button>
                                    </div>
                                    
                                    <button
                                        onClick={collapseAll}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 ${
                                            darkMode
                                                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border-gray-500'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                                        }`}
                                    >
                                        Collapse All
                                    </button>
                                    <button
                                        onClick={expandAll}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 ${
                                            darkMode
                                                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border-gray-500'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                                        }`}
                                    >
                                        Expand All
                                    </button>
                                </div>
                            </div>
                            
                            {/* Second Row: Sort and Messages Only */}
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                            
                                {/* Sort Controls - Left Side */}
                                <div className="flex items-center gap-2">
                                <ArrowUpDown className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                                <span className={`text-sm font-medium mr-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Sort by:</span>
                                <button
                                    onClick={() => setSortBy('none')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                        sortBy === 'none'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : darkMode
                                                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                    }`}
                                >
                                    None
                                </button>
                                <button
                                    onClick={() => handleSort('name')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                                        sortBy === 'name'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : darkMode
                                                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                    }`}
                                >
                                    Name
                                    {sortBy === 'name' && (
                                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleSort('date')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                                        sortBy === 'date'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : darkMode
                                                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                    }`}
                                >
                                    Date
                                    {sortBy === 'date' && (
                                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleSort('business')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                                        sortBy === 'business'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : darkMode
                                                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                    }`}
                                >
                                    Business
                                    {sortBy === 'business' && (
                                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </button>
                                </div>

                                {/* Right Side Buttons */}
                                <div className="flex items-center gap-3">
                                    {/* Export Button */}
                                    <button
                                        onClick={exportToCSV}
                                        disabled={loading || emails.length === 0}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 flex items-center gap-2 ${
                                            (loading || emails.length === 0)
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                        } ${
                                            darkMode
                                                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border-gray-500'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                                        }`}
                                        title="Export to CSV"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export CSV
                                    </button>

                                    {/* Messages Only Button */}
                                    <button
                                        onClick={() => setViewMode(viewMode === 'messages' ? 'table' : 'messages')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 flex items-center gap-2 ${
                                            viewMode === 'messages'
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : darkMode
                                                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border-gray-500'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                                        }`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        Messages Only
                                    </button>
                                </div>
                            </div>

                            {/* Results count */}
                            <div className={`mt-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Showing {filteredEmails.length} of {emails.length} submissions
                                {searchQuery && (
                                    <span className="ml-2 text-blue-400">
                                        • Matching "{searchQuery}"
                                    </span>
                                )}
                                {sortBy !== 'none' && (
                                    <span className={`ml-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                        • Sorted by {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading client data...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="p-12 text-center">
                            <p className={`mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Error: {error}</p>
                            <button
                                onClick={fetchClients}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Empty State - View Specific */}
                    {!loading && !error && sortedEmails.length === 0 && (
                        <div className="p-12 text-center">
                            {/* Icon based on view mode */}
                            {viewMode === 'table' && <List className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />}
                            {viewMode === 'card' && <Grid className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />}
                            {viewMode === 'compact' && <Layers className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />}
                            {viewMode === 'messages' && <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />}
                            {viewMode === 'stats' && <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />}
                            
                            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {viewMode === 'table' && 'No Entries in Table'}
                                {viewMode === 'card' && 'No Cards to Display'}
                                {viewMode === 'compact' && 'No Items Found'}
                                {viewMode === 'messages' && 'No Messages Available'}
                                {viewMode === 'stats' && 'No Data for Statistics'}
                            </h3>
                            
                            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {searchQuery ? (
                                    <>
                                        {viewMode === 'table' && `No table entries match your search "${searchQuery}"`}
                                        {viewMode === 'card' && `No cards found matching "${searchQuery}"`}
                                        {viewMode === 'compact' && `No items match "${searchQuery}"`}
                                        {viewMode === 'messages' && `No messages contain "${searchQuery}"`}
                                        {viewMode === 'stats' && `No data available for "${searchQuery}"`}
                                    </>
                                ) : filterType !== 'all' ? (
                                    <>
                                        {viewMode === 'table' && `No ${filterType} entries in the table`}
                                        {viewMode === 'card' && `No ${filterType} cards to show`}
                                        {viewMode === 'compact' && `No ${filterType} items found`}
                                        {viewMode === 'messages' && `No ${filterType} messages available`}
                                        {viewMode === 'stats' && `No ${filterType} data for analysis`}
                                    </>
                                ) : (
                                    <>
                                        {viewMode === 'table' && 'Your enquiry table is empty. New submissions will appear here in a structured format.'}
                                        {viewMode === 'card' && 'No enquiry cards yet. Submissions will be displayed as interactive cards here.'}
                                        {viewMode === 'compact' && 'No enquiries to show. This compact view will list all submissions efficiently.'}
                                        {viewMode === 'messages' && 'No messages received yet. Customer enquiries will appear here for easy reading.'}
                                        {viewMode === 'stats' && 'No statistics available. Data insights will be generated once you receive enquiries.'}
                                    </>
                                )}
                            </p>
                            
                            {/* Action buttons */}
                            {(searchQuery || filterType !== 'all') ? (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterType('all');
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Clear Filters
                                </button>
                            ) : (
                                <div className="flex flex-col items-center gap-3 mt-4">
                                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Waiting for customer enquiries...
                                    </p>
                                    <button
                                        onClick={fetchClients}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Refresh
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Table View */}
                    {!loading && !error && sortedEmails.length > 0 && viewMode === 'table' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className={`border-b-2 ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600' 
                                    : 'bg-gray-50 border-gray-200'
                            }`}>
                                <th className={`px-6 py-4 text-left text-sm font-semibold w-12 ${
                                    darkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}></th>
                                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                                    darkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>Name</th>
                                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                                    darkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>Email</th>
                                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                                    darkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>Business</th>
                                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                                    darkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>Contact</th>
                                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                                    darkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>Date</th>
                                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                                    darkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>Time</th>
                                <th className={`px-6 py-4 text-left text-sm font-semibold w-20 ${
                                    darkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedEmails.map((email, index) => (
                                <>
                                    <tr
                                        key={email.id}
                                        ref={el => rowsRef.current[index] = el}
                                        className={`border-b transition-all duration-500 cursor-pointer ${
                                            mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                                        } ${
                                            darkMode
                                                ? 'border-gray-700 hover:bg-gray-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                        style={{ transitionDelay: `${index * 100 + 400}ms` }}
                                        onClick={() => toggleRow(email.id)}
                                    >
                                        <td className="px-6 py-4">
                                            <button className={`transition-all duration-300 hover:scale-110 ${
                                                darkMode 
                                                    ? 'text-gray-400 hover:text-blue-400' 
                                                    : 'text-gray-500 hover:text-blue-600'
                                            }`}>
                                                {expandedRows.has(email.id) ? (
                                                    <ChevronUp className="w-5 h-5 transition-transform duration-300" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 transition-transform duration-300" />
                                                )}
                                            </button>
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-medium ${
                                            darkMode ? 'text-gray-100' : 'text-gray-900'
                                        }`}>{email.name}</td>
                                        <td className={`px-6 py-4 text-sm ${
                                            darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>{email.email}</td>
                                        <td className={`px-6 py-4 text-sm ${
                                            darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>{email.business}</td>
                                        <td className={`px-6 py-4 text-sm ${
                                            darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>{email.contact}</td>
                                        <td className={`px-6 py-4 text-sm ${
                                            darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>{email.date}</td>
                                        <td className={`px-6 py-4 text-sm ${
                                            darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>{email.time}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(e) => handleDeleteClick(email.email, e)}
                                                className={`p-2 rounded-lg transition-all duration-300 ${
                                                    darkMode
                                                        ? 'text-red-400 hover:bg-red-900 hover:text-red-300'
                                                        : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                                }`}
                                                title="Delete email"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedRows.has(email.id) && (
                                        <tr
                                            key={`${email.id}-details`}
                                            className={`border-b animate-slideDown ${
                                                darkMode
                                                    ? 'bg-gray-900 border-gray-700'
                                                    : 'bg-blue-50 border-gray-200'
                                            }`}
                                        >
                                            <td colSpan="8" className="px-6 py-6">
                                                <div className={`rounded-lg p-6 shadow-sm animate-fadeIn ${
                                                    darkMode ? 'bg-gray-800' : 'bg-white'
                                                }`}>
                                                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                                                        darkMode ? 'text-gray-100' : 'text-gray-900'
                                                    }`}>
                                                        <Mail className={`w-5 h-5 ${
                                                            darkMode ? 'text-blue-400' : 'text-blue-600'
                                                        }`} />
                                                        Detailed Information
                                                    </h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="flex items-start gap-3 animate-slideInLeft" style={{ animationDelay: '100ms' }}>
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                                                                darkMode ? 'bg-blue-900' : 'bg-blue-100'
                                                            }`}>
                                                                <User className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-xs font-medium uppercase ${
                                                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                                                }`}>Name</p>
                                                                <p className={`text-sm mt-1 ${
                                                                    darkMode ? 'text-gray-200' : 'text-gray-900'
                                                                }`}>{email.name}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 animate-slideInRight" style={{ animationDelay: '150ms' }}>
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                                                                darkMode ? 'bg-purple-900' : 'bg-purple-100'
                                                            }`}>
                                                                <Mail className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-xs font-medium uppercase ${
                                                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                                                }`}>Email Address</p>
                                                                <p className={`text-sm mt-1 ${
                                                                    darkMode ? 'text-gray-200' : 'text-gray-900'
                                                                }`}>{email.email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 animate-slideInLeft" style={{ animationDelay: '200ms' }}>
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                                                                darkMode ? 'bg-green-900' : 'bg-green-100'
                                                            }`}>
                                                                <Briefcase className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-xs font-medium uppercase ${
                                                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                                                }`}>Business</p>
                                                                <p className={`text-sm mt-1 ${
                                                                    darkMode ? 'text-gray-200' : 'text-gray-900'
                                                                }`}>{email.business}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 animate-slideInRight" style={{ animationDelay: '250ms' }}>
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                                                                darkMode ? 'bg-orange-900' : 'bg-orange-100'
                                                            }`}>
                                                                <Phone className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-xs font-medium uppercase ${
                                                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                                                }`}>Contact Number</p>
                                                                <p className={`text-sm mt-1 ${
                                                                    darkMode ? 'text-gray-200' : 'text-gray-900'
                                                                }`}>{email.contact}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 animate-slideInLeft" style={{ animationDelay: '300ms' }}>
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                                                                darkMode ? 'bg-teal-900' : 'bg-teal-100'
                                                            }`}>
                                                                <Calendar className={`w-5 h-5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-xs font-medium uppercase ${
                                                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                                                }`}>Date</p>
                                                                <p className={`text-sm mt-1 ${
                                                                    darkMode ? 'text-gray-200' : 'text-gray-900'
                                                                }`}>{email.date}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 animate-slideInRight" style={{ animationDelay: '350ms' }}>
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                                                                darkMode ? 'bg-pink-900' : 'bg-pink-100'
                                                            }`}>
                                                                <Clock className={`w-5 h-5 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-xs font-medium uppercase ${
                                                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                                                }`}>Time</p>
                                                                <p className={`text-sm mt-1 ${
                                                                    darkMode ? 'text-gray-200' : 'text-gray-900'
                                                                }`}>{email.time}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={`flex items-start gap-3 pt-4 border-t animate-slideInLeft ${
                                                        darkMode ? 'border-gray-700' : 'border-gray-200'
                                                    }`} style={{ animationDelay: '400ms' }}>
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                                                            darkMode ? 'bg-indigo-900' : 'bg-indigo-100'
                                                        }`}>
                                                            <MessageSquare className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`text-xs font-medium uppercase mb-2 ${
                                                                darkMode ? 'text-gray-400' : 'text-gray-500'
                                                            }`}>Message</p>
                                                            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                                                                darkMode ? 'text-gray-200' : 'text-gray-900'
                                                            }`}>
                                                                {email.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    )}

                    {/* Card View */}
                    {!loading && !error && sortedEmails.length > 0 && viewMode === 'card' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedEmails.map((email, index) => (
                                    <div
                                        key={email.id}
                                        className={`rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-xl ${
                                            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                        } ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                                        style={{ transitionDelay: `${index * 50}ms` }}
                                    >
                                        <div className={`p-4 ${
                                            darkMode 
                                                ? 'bg-gradient-to-r from-gray-600 to-gray-800' 
                                                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-5 h-5 text-white" />
                                                    <h3 className="text-lg font-bold text-white truncate">{email.name}</h3>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteClick(email.email, e)}
                                                    className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300"
                                                    title="Delete email"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                                <p className={`text-sm truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {email.email}
                                                </p>
                                            </div>
                                            
                                            {email.business && (
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                                                    <p className={`text-sm truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {email.business}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2">
                                                <Phone className={`w-4 h-4 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {email.contact}
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className={`w-3 h-3 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{email.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className={`w-3 h-3 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{email.time}</span>
                                                </div>
                                            </div>
                                            
                                            {email.message && (
                                                <div className={`pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                    <div className="flex items-start gap-2">
                                                        <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                                            darkMode ? 'text-indigo-400' : 'text-indigo-600'
                                                        }`} />
                                                        <p className={`text-sm line-clamp-3 ${
                                                            darkMode ? 'text-gray-300' : 'text-gray-600'
                                                        }`}>
                                                            {email.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Compact View */}
                    {!loading && !error && sortedEmails.length > 0 && viewMode === 'compact' && (
                        <div className="p-6">
                            <div className="space-y-2">
                                {sortedEmails.map((email, index) => (
                                    <div
                                        key={email.id}
                                        className={`rounded-lg p-4 transition-all duration-500 hover:shadow-md cursor-pointer ${
                                            mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                                        } ${
                                            darkMode
                                                ? 'bg-gray-700 hover:bg-gray-600'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                        style={{ transitionDelay: `${index * 30}ms` }}
                                        onClick={() => toggleRow(email.id)}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <button className={`transition-all duration-300 ${
                                                    darkMode 
                                                        ? 'text-gray-400 hover:text-blue-400' 
                                                        : 'text-gray-500 hover:text-blue-600'
                                                }`}>
                                                    {expandedRows.has(email.id) ? (
                                                        <ChevronUp className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5" />
                                                    )}
                                                </button>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className={`font-semibold truncate ${
                                                            darkMode ? 'text-gray-100' : 'text-gray-900'
                                                        }`}>
                                                            {email.name}
                                                        </h3>
                                                        {email.business && (
                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                darkMode 
                                                                    ? 'bg-green-900 text-green-300' 
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}>
                                                                {email.business}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className={`truncate ${
                                                            darkMode ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>
                                                            {email.email}
                                                        </span>
                                                        <span className={`text-xs ${
                                                            darkMode ? 'text-gray-500' : 'text-gray-500'
                                                        }`}>
                                                            {email.date} • {email.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={(e) => handleDeleteClick(email.email, e)}
                                                className={`p-2 rounded-lg transition-all duration-300 flex-shrink-0 ${
                                                    darkMode
                                                        ? 'text-red-400 hover:bg-red-900 hover:text-red-300'
                                                        : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                                }`}
                                                title="Delete email"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        
                                        {expandedRows.has(email.id) && (
                                            <div className={`mt-4 pt-4 border-t animate-slideDown ${
                                                darkMode ? 'border-gray-600' : 'border-gray-200'
                                            }`}>
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div>
                                                        <p className={`text-xs font-medium uppercase mb-1 ${
                                                            darkMode ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>Contact</p>
                                                        <p className={`text-sm ${
                                                            darkMode ? 'text-gray-200' : 'text-gray-900'
                                                        }`}>{email.contact}</p>
                                                    </div>
                                                </div>
                                                {email.message && (
                                                    <div>
                                                        <p className={`text-xs font-medium uppercase mb-2 ${
                                                            darkMode ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>Message</p>
                                                        <p className={`text-sm leading-relaxed ${
                                                            darkMode ? 'text-gray-300' : 'text-gray-700'
                                                        }`}>
                                                            {email.message}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages Only View */}
                    {!loading && !error && sortedEmails.length > 0 && viewMode === 'messages' && (
                        <div className="p-6">
                            <div className="max-w-4xl mx-auto space-y-4">
                                {sortedEmails.map((email, index) => (
                                    <div
                                        key={email.id}
                                        className={`rounded-xl shadow-md overflow-hidden transition-all duration-500 ${
                                            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                        } ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                                        style={{ transitionDelay: `${index * 50}ms` }}
                                    >
                                        {/* Message Header */}
                                        <div className={`px-6 py-4 border-b flex items-center justify-between ${
                                            darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'
                                        }`}>
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`p-2 rounded-full ${
                                                    darkMode ? 'bg-blue-900' : 'bg-blue-100'
                                                }`}>
                                                    <MessageSquare className={`w-5 h-5 ${
                                                        darkMode ? 'text-blue-400' : 'text-blue-600'
                                                    }`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-semibold text-lg truncate ${
                                                        darkMode ? 'text-gray-100' : 'text-gray-900'
                                                    }`}>
                                                        {email.name}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <span className={`truncate ${
                                                            darkMode ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>
                                                            {email.email}
                                                        </span>
                                                        {email.business && (
                                                            <>
                                                                <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
                                                                <span className={`truncate ${
                                                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                                                }`}>
                                                                    {email.business}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className={`text-xs ${
                                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                        {email.date}
                                                    </div>
                                                    <div className={`text-xs ${
                                                        darkMode ? 'text-gray-500' : 'text-gray-400'
                                                    }`}>
                                                        {email.time}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteClick(email.email, e)}
                                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                                        darkMode
                                                            ? 'text-red-400 hover:bg-red-900 hover:text-red-300'
                                                            : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                                    }`}
                                                    title="Delete email"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Message Content */}
                                        <div className="px-6 py-5">
                                            {email.message ? (
                                                <p className={`text-base leading-relaxed whitespace-pre-wrap ${
                                                    darkMode ? 'text-gray-200' : 'text-gray-800'
                                                }`}>
                                                    {email.message}
                                                </p>
                                            ) : (
                                                <p className={`text-sm italic ${
                                                    darkMode ? 'text-gray-500' : 'text-gray-400'
                                                }`}>
                                                    No message provided
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* Message Footer */}
                                        <div className={`px-6 py-3 border-t flex items-center gap-4 text-sm ${
                                            darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                <Phone className={`w-4 h-4 ${
                                                    darkMode ? 'text-orange-400' : 'text-orange-600'
                                                }`} />
                                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                                    {email.contact}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages Only View */}
                    {!loading && !error && sortedEmails.length > 0 && viewMode === 'messages' && (
                        <div className="p-6">
                            <div className="space-y-4">
                                {sortedEmails.map((email, index) => (
                                    <div
                                        key={email.id}
                                        className={`rounded-xl shadow-md overflow-hidden transition-all duration-500 ${
                                            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                        } ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                                        style={{ transitionDelay: `${index * 50}ms` }}
                                    >
                                        <div className={`p-4 flex items-center justify-between ${
                                            darkMode 
                                                ? 'bg-gray-800 border-b border-gray-600' 
                                                : 'bg-gray-50 border-b border-gray-200'
                                        }`}>
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`p-2 rounded-full ${
                                                    darkMode ? 'bg-purple-900' : 'bg-purple-100'
                                                }`}>
                                                    <MessageSquare className={`w-5 h-5 ${
                                                        darkMode ? 'text-purple-400' : 'text-purple-600'
                                                    }`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-semibold truncate ${
                                                        darkMode ? 'text-gray-100' : 'text-gray-900'
                                                    }`}>
                                                        {email.name}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <span className={`truncate ${
                                                            darkMode ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>
                                                            {email.email}
                                                        </span>
                                                        {email.business && (
                                                            <>
                                                                <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
                                                                <span className={`truncate ${
                                                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                                                }`}>
                                                                    {email.business}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className={`text-xs ${
                                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                        {email.date}
                                                    </div>
                                                    <div className={`text-xs ${
                                                        darkMode ? 'text-gray-500' : 'text-gray-400'
                                                    }`}>
                                                        {email.time}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteClick(email.email, e)}
                                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                                        darkMode
                                                            ? 'text-red-400 hover:bg-red-900 hover:text-red-300'
                                                            : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                                    }`}
                                                    title="Delete email"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6">
                                            {email.message ? (
                                                <p className={`text-base leading-relaxed whitespace-pre-wrap ${
                                                    darkMode ? 'text-gray-200' : 'text-gray-800'
                                                }`}>
                                                    {email.message}
                                                </p>
                                            ) : (
                                                <p className={`text-sm italic ${
                                                    darkMode ? 'text-gray-500' : 'text-gray-400'
                                                }`}>
                                                    No message provided
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Statistics Dashboard */}
                    {!loading && !error && viewMode === 'stats' && stats && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                {/* Total Submissions Card */}
                                <div className={`p-6 rounded-xl shadow-lg ${
                                    darkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Mail className="w-8 h-8 text-white opacity-80" />
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            darkMode ? 'bg-blue-700' : 'bg-blue-400'
                                        } text-white`}>
                                            Total
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1">{stats.totalSubmissions}</h3>
                                    <p className="text-blue-100 text-sm">Total Submissions</p>
                                </div>

                                {/* Last 7 Days Card */}
                                <div className={`p-6 rounded-xl shadow-lg ${
                                    darkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-500 to-green-600'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <TrendingUp className="w-8 h-8 text-white opacity-80" />
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            darkMode ? 'bg-green-700' : 'bg-green-400'
                                        } text-white`}>
                                            Recent
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1">{stats.last7Days}</h3>
                                    <p className="text-green-100 text-sm">Last 7 Days</p>
                                </div>

                                {/* Peak Hour Card */}
                                <div className={`p-6 rounded-xl shadow-lg ${
                                    darkMode ? 'bg-gradient-to-br from-purple-900 to-purple-800' : 'bg-gradient-to-br from-purple-500 to-purple-600'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Clock className="w-8 h-8 text-white opacity-80" />
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            darkMode ? 'bg-purple-700' : 'bg-purple-400'
                                        } text-white`}>
                                            Peak
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1">
                                        {stats.peakHour ? `${stats.peakHour[0]}:00` : 'N/A'}
                                    </h3>
                                    <p className="text-purple-100 text-sm">
                                        Peak Hour ({stats.peakHour ? stats.peakHour[1] : 0} emails)
                                    </p>
                                </div>

                                {/* Business Types Card */}
                                <div className={`p-6 rounded-xl shadow-lg ${
                                    darkMode ? 'bg-gradient-to-br from-orange-900 to-orange-800' : 'bg-gradient-to-br from-orange-500 to-orange-600'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Briefcase className="w-8 h-8 text-white opacity-80" />
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            darkMode ? 'bg-orange-700' : 'bg-orange-400'
                                        } text-white`}>
                                            Types
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1">
                                        {Object.keys(stats.businessTypes).length}
                                    </h3>
                                    <p className="text-orange-100 text-sm">Business Types</p>
                                </div>
                            </div>

                            {/* Top Businesses */}
                            <div className={`p-6 rounded-xl shadow-lg mb-6 ${
                                darkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <Users className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                    <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        Top 5 Business Types
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {stats.topBusinesses.map(([business, count], index) => (
                                        <div key={business} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                index === 0 ? 'bg-yellow-500 text-white' :
                                                index === 1 ? 'bg-gray-400 text-white' :
                                                index === 2 ? 'bg-orange-600 text-white' :
                                                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                    {business}
                                                </div>
                                                <div className={`w-full h-2 rounded-full mt-1 ${
                                                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                                }`}>
                                                    <div 
                                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                                        style={{ width: `${(count / stats.totalSubmissions) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className={`text-lg font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {count}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submissions by Date */}
                            <div className={`p-6 rounded-xl shadow-lg ${
                                darkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <Activity className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                                    <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        Submissions by Date (Last 10 Days)
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    {Object.entries(stats.submissionsByDate)
                                        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                                        .slice(0, 10)
                                        .map(([date, count]) => (
                                            <div key={date} className="flex items-center gap-3">
                                                <div className={`w-24 text-sm font-medium ${
                                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                    {date}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`w-full h-8 rounded-lg ${
                                                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                                    }`}>
                                                        <div 
                                                            className="h-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-end pr-3"
                                                            style={{ width: `${(count / Math.max(...Object.values(stats.submissionsByDate))) * 100}%` }}
                                                        >
                                                            <span className="text-white text-sm font-bold">{count}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 backdrop-brightness-75 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className={`rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn ${
                        darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-full ${
                                deleteStatus === 'success' 
                                    ? 'bg-green-100' 
                                    : deleteStatus === 'error'
                                    ? 'bg-red-100'
                                    : darkMode ? 'bg-red-900' : 'bg-red-100'
                            }`}>
                                <Trash2 className={`w-6 h-6 ${
                                    deleteStatus === 'success'
                                        ? 'text-green-600'
                                        : deleteStatus === 'error'
                                        ? 'text-red-600'
                                        : darkMode ? 'text-red-400' : 'text-red-600'
                                }`} />
                            </div>
                            <h3 className={`text-xl font-bold ${
                                darkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                                {deleteStatus === 'success' ? 'Success!' : deleteStatus === 'error' ? 'Error' : 'Delete Email'}
                            </h3>
                        </div>
                        
                        {deleteStatus ? (
                            <div className={`mb-6 p-4 rounded-lg ${
                                deleteStatus === 'success'
                                    ? 'bg-green-50 border border-green-200'
                                    : deleteStatus === 'error'
                                    ? 'bg-red-50 border border-red-200'
                                    : 'bg-blue-50 border border-blue-200'
                            }`}>
                                <p className={`font-medium ${
                                    deleteStatus === 'success'
                                        ? 'text-green-800'
                                        : deleteStatus === 'error'
                                        ? 'text-red-800'
                                        : 'text-blue-800'
                                }`}>
                                    {deleteMessage}
                                </p>
                            </div>
                        ) : (
                            <p className={`mb-6 ${
                                darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Are you sure you want to delete this email submission? This action cannot be undone.
                            </p>
                        )}
                        
                        {!deleteStatus && (
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={cancelDelete}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                        darkMode
                                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-300"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                        
                        {deleteStatus === 'deleting' && (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                        
                        {deleteStatus === 'error' && (
                            <div className="flex justify-end">
                                <button
                                    onClick={cancelDelete}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                        darkMode
                                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.4s ease-out forwards;
          opacity: 0;
        }

        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out forwards;
          opacity: 0;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
        </div>
    );
}

