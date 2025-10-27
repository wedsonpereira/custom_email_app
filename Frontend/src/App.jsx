import { useState, useEffect, useRef } from 'react';
import { Mail, ChevronDown, ChevronUp, User, Briefcase, Phone, MessageSquare, Calendar, Clock } from 'lucide-react';

export default function App() {
    const [emails] = useState([
        {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            business: "Acme Corporation",
            contact: "+1 (555) 123-4567",
            message: "Hello, I'm interested in learning more about your services. Could you please provide more information about your pricing plans and available features?",
            date: "2025-10-26",
            time: "09:30 AM"
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane.smith@techstart.com",
            business: "TechStart Inc",
            contact: "+1 (555) 987-6543",
            message: "We're looking for a partnership opportunity. Our company specializes in cloud solutions and we believe there's great synergy between our organizations.",
            date: "2025-10-25",
            time: "02:15 PM"
        },
        {
            id: 3,
            name: "Robert Johnson",
            email: "r.johnson@consulting.com",
            business: "Johnson Consulting",
            contact: "+1 (555) 456-7890",
            message: "I would like to schedule a demo of your product. What time slots are available next week?",
            date: "2025-10-25",
            time: "11:45 AM"
        },
        {
            id: 4,
            name: "Emily Chen",
            email: "emily.chen@globaltech.com",
            business: "Global Tech Solutions",
            contact: "+1 (555) 234-5678",
            message: "Our team is evaluating different vendors for our upcoming project. Can you provide case studies and pricing information?",
            date: "2025-10-24",
            time: "04:20 PM"
        },
        {
            id: 5,
            name: "Michael Brown",
            email: "mbrown@innovations.io",
            business: "Innovation Labs",
            contact: "+1 (555) 345-6789",
            message: "I attended your webinar last week and have some follow-up questions about the implementation process.",
            date: "2025-10-23",
            time: "10:00 AM"
        }
    ]);

    const [expandedRows, setExpandedRows] = useState(new Set());
    const [mounted, setMounted] = useState(false);
    const headerRef = useRef(null);
    const cardRef = useRef(null);
    const rowsRef = useRef([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div
                    ref={cardRef}
                    className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 ${
                        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                >
                    {/* Header */}
                    <div
                        ref={headerRef}
                        className={`bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white transition-all duration-700 ${
                            mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Mail className="w-8 h-8 animate-pulse" />
                                <div>
                                    <h1 className="text-3xl font-bold">Email Submissions</h1>
                                    <p className="text-blue-100 mt-1">{emails.length} total submissions</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-200">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-12"></th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Business</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            {emails.map((email, index) => (
                                <>
                                    <tr
                                        key={email.id}
                                        ref={el => rowsRef.current[index] = el}
                                        className={`border-b border-gray-200 hover:bg-gray-50 transition-all duration-500 cursor-pointer ${
                                            mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                                        }`}
                                        style={{ transitionDelay: `${index * 100 + 400}ms` }}
                                        onClick={() => toggleRow(email.id)}
                                    >
                                        <td className="px-6 py-4">
                                            <button className="text-gray-500 hover:text-blue-600 transition-all duration-300 hover:scale-110">
                                                {expandedRows.has(email.id) ? (
                                                    <ChevronUp className="w-5 h-5 transition-transform duration-300" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 transition-transform duration-300" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{email.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{email.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{email.business}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{email.contact}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{email.date}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{email.time}</td>
                                    </tr>

                                    {expandedRows.has(email.id) && (
                                        <tr
                                            key={`${email.id}-details`}
                                            className="bg-blue-50 border-b border-gray-200 animate-slideDown"
                                        >
                                            <td colSpan="7" className="px-6 py-6">
                                                <div className="bg-white rounded-lg p-6 shadow-sm animate-fadeIn">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                        <Mail className="w-5 h-5 text-blue-600" />
                                                        Detailed Information
                                                    </h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="flex items-start gap-3 animate-slideInLeft" style={{ animationDelay: '100ms' }}>
                                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12">
                                                                <User className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 uppercase">Name</p>
                                                                <p className="text-sm text-gray-900 mt-1">{email.name}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 animate-slideInRight" style={{ animationDelay: '150ms' }}>
                                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12">
                                                                <Mail className="w-5 h-5 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 uppercase">Email Address</p>
                                                                <p className="text-sm text-gray-900 mt-1">{email.email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 animate-slideInLeft" style={{ animationDelay: '200ms' }}>
                                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12">
                                                                <Briefcase className="w-5 h-5 text-green-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 uppercase">Business</p>
                                                                <p className="text-sm text-gray-900 mt-1">{email.business}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 animate-slideInRight" style={{ animationDelay: '250ms' }}>
                                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12">
                                                                <Phone className="w-5 h-5 text-orange-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 uppercase">Contact Number</p>
                                                                <p className="text-sm text-gray-900 mt-1">{email.contact}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 animate-slideInLeft" style={{ animationDelay: '300ms' }}>
                                                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12">
                                                                <Calendar className="w-5 h-5 text-teal-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 uppercase">Date</p>
                                                                <p className="text-sm text-gray-900 mt-1">{email.date}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 animate-slideInRight" style={{ animationDelay: '350ms' }}>
                                                            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12">
                                                                <Clock className="w-5 h-5 text-pink-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 uppercase">Time</p>
                                                                <p className="text-sm text-gray-900 mt-1">{email.time}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3 pt-4 border-t border-gray-200 animate-slideInLeft" style={{ animationDelay: '400ms' }}>
                                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-12">
                                                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Message</p>
                                                            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
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
                </div>
            </div>

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
      `}</style>
        </div>
    );
}