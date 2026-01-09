import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { Line, Bar, Pie, Radar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    RadialLinearScale
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    RadialLinearScale
);

const API_URL = "http://localhost:5000/api/facebook/profile-posts";
const PAGE_URL = "https://www.facebook.com/bjpformaharashtra";

const FacebookAnalytics = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profileInfo, setProfileInfo] = useState(null);
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        // Calculate dates for the last 7 days
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);

        const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

        axios
            .post(API_URL, {
                url: PAGE_URL,
                num_of_posts: 30,
                start_date: formatDate(start),
                end_date: formatDate(end)
            })
            .then(res => {
                if (Array.isArray(res.data?.data)) {
                    setPosts(res.data.data);
                    if (res.data.profile) {
                        setProfileInfo(res.data.profile);
                    }
                } else {
                    setError("Facebook data processing error. Please retry.");
                }
            })
            .catch(() => setError("Failed to load Facebook analytics"))
            .finally(() => setLoading(false));
    }, []);

    /* ================= LAST 7 DAYS & METRICS ================= */
    const last7Days = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);

        return posts
            .filter(p => p.date_posted)
            .filter(p => new Date(p.date_posted) >= cutoff)
            .sort(
                (a, b) =>
                    new Date(a.date_posted).getTime() -
                    new Date(b.date_posted).getTime()
            );
    }, [posts]);

    const totals = last7Days.reduce(
        (a, p) => {
            a.likes += p.likes || 0;
            a.comments += p.comments || 0;
            a.shares += p.shares || 0;
            return a;
        },
        { likes: 0, comments: 0, shares: 0 }
    );

    const avgLikes = last7Days.length > 0 ? Math.round(totals.likes / last7Days.length) : 0;
    const avgComments = last7Days.length > 0 ? Math.round(totals.comments / last7Days.length) : 0;
    const avgShares = last7Days.length > 0 ? Math.round(totals.shares / last7Days.length) : 0;
    const avgEngagement = last7Days.length > 0 ?
        Math.round((totals.likes + totals.comments + totals.shares) / last7Days.length) : 0;

    const engagementRate =
        last7Days.length > 0
            ? (
                (totals.likes + totals.comments + totals.shares) /
                last7Days.length
            ).toFixed(2)
            : 0;

    const labels = last7Days.map(p =>
        new Date(p.date_posted).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    );

    const likes = last7Days.map(p => p.likes || 0);
    const comments = last7Days.map(p => p.comments || 0);
    const shares = last7Days.map(p => p.shares || 0);

    // Chart configurations
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#94a3b8',
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#94a3b8',
                    maxRotation: 45
                }
            },
            y: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#94a3b8'
                },
                beginAtZero: true
            }
        }
    };

    const barChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                position: 'top',
                labels: {
                    color: '#94a3b8'
                }
            }
        }
    };

    const pieChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                position: 'right',
                labels: {
                    color: '#94a3b8',
                    padding: 20
                }
            }
        }
    };

    const radarChartOptions = {
        ...chartOptions,
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(148, 163, 184, 0.1)'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                },
                pointLabels: {
                    color: '#94a3b8'
                },
                ticks: {
                    color: '#94a3b8',
                    backdropColor: 'transparent'
                }
            }
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading Facebook Analytics...</p>
                <small style={styles.loadingSubtext}>
                    This may take up to a minute...
                </small>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorIcon}>⚠️</div>
                <h3 style={styles.errorTitle}>Error Loading Data</h3>
                <p style={styles.errorMessage}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={styles.retryButton}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>📘 Facebook Analytics Dashboard</h1>
                    <p style={styles.subtitle}>BJP for Maharashtra • Last 7 Days Performance</p>
                </div>
                <div style={styles.headerStats}>
                    <div style={styles.headerStat}>
                        <span style={styles.headerStatLabel}>Total Posts</span>
                        <span style={styles.headerStatValue}>
                            {last7Days.length}
                        </span>
                    </div>
                </div>
            </header>

            {/* Summary Cards */}
            <div style={styles.statsGrid}>
                <StatCard
                    title="Posts (7 days)"
                    value={last7Days.length}
                    icon="📝"
                    color="#1877F2"
                    trend="recent activity"
                />
                <StatCard
                    title="Total Likes"
                    value={totals.likes.toLocaleString()}
                    icon="👍"
                    color="#1877F2"
                    trend="reactions"
                />
                <StatCard
                    title="Total Comments"
                    value={totals.comments.toLocaleString()}
                    icon="💬"
                    color="#42B72A"
                    trend="conversations"
                />
                <StatCard
                    title="Total Shares"
                    value={totals.shares.toLocaleString()}
                    icon="🔁"
                    color="#F7B928"
                    trend="shares"
                />
                <StatCard
                    title="Avg Engagement"
                    value={avgEngagement.toLocaleString()}
                    icon="📈"
                    color="#8b5cf6"
                    trend="per post"
                />
                <StatCard
                    title="Engagement Rate"
                    value={`${engagementRate}`}
                    icon="🎯"
                    color="#F5533D"
                    trend="performance"
                />
            </div>

            {/* Charts Section */}
            <div style={styles.chartsGrid}>
                {/* Likes Trend */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>📈 Likes Trend</h3>
                        <p style={styles.chartSubtitle}>Last 7 days performance</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Line
                            data={{
                                labels,
                                datasets: [
                                    {
                                        label: "Likes",
                                        data: likes,
                                        borderColor: "#1877F2",
                                        backgroundColor: 'rgba(24, 119, 242, 0.1)',
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: "#1877F2",
                                        pointBorderColor: "#ffffff",
                                        pointBorderWidth: 2,
                                        pointRadius: 5
                                    }
                                ]
                            }}
                            options={chartOptions}
                        />
                    </div>
                </div>

                {/* Engagement Breakdown */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>📊 Engagement Breakdown</h3>
                        <p style={styles.chartSubtitle}>Likes vs Comments vs Shares</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Bar
                            data={{
                                labels,
                                datasets: [
                                    {
                                        label: "Likes",
                                        data: likes,
                                        backgroundColor: "rgba(24, 119, 242, 0.8)",
                                        borderRadius: 6,
                                        borderWidth: 0
                                    },
                                    {
                                        label: "Comments",
                                        data: comments,
                                        backgroundColor: "rgba(66, 183, 42, 0.8)",
                                        borderRadius: 6,
                                        borderWidth: 0
                                    },
                                    {
                                        label: "Shares",
                                        data: shares,
                                        backgroundColor: "rgba(247, 185, 40, 0.8)",
                                        borderRadius: 6,
                                        borderWidth: 0
                                    }
                                ]
                            }}
                            options={{
                                ...barChartOptions,
                                scales: {
                                    x: {
                                        ...barChartOptions.scales.x,
                                        stacked: true
                                    },
                                    y: {
                                        ...barChartOptions.scales.y,
                                        stacked: true
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Interaction Share */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>🥧 Interaction Share</h3>
                        <p style={styles.chartSubtitle}>Distribution of engagement types</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Pie
                            data={{
                                labels: ["Likes", "Comments", "Shares"],
                                datasets: [
                                    {
                                        data: [totals.likes, totals.comments, totals.shares],
                                        backgroundColor: ["#1877F2", "#42B72A", "#F7B928"],
                                        borderColor: ["#1877F2", "#42B72A", "#F7B928"],
                                        borderWidth: 2
                                    }
                                ]
                            }}
                            options={pieChartOptions}
                        />
                    </div>
                </div>

                {/* Performance Matrix */}
                <div style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>🕸️ Performance Matrix</h3>
                        <p style={styles.chartSubtitle}>Multi-dimensional analysis</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Radar
                            data={{
                                labels: ["Avg Likes", "Avg Comments", "Avg Shares", "Post Frequency", "Engagement"],
                                datasets: [
                                    {
                                        label: "Activity Score",
                                        data: [
                                            totals.likes / (last7Days.length || 1),
                                            totals.comments / (last7Days.length || 1),
                                            totals.shares / (last7Days.length || 1),
                                            last7Days.length * 100,
                                            (totals.likes + totals.comments + totals.shares) / (last7Days.length || 1)
                                        ],
                                        backgroundColor: "rgba(24, 119, 242, 0.2)",
                                        borderColor: "#1877F2",
                                        borderWidth: 3,
                                        pointBackgroundColor: "#1877F2",
                                        pointBorderColor: "#ffffff",
                                        pointBorderWidth: 2,
                                        pointRadius: 5
                                    }
                                ]
                            }}
                            options={radarChartOptions}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Posts & Performance Summary */}
            <div style={styles.bottomSection}>
                {/* Recent Posts */}
                <div style={styles.postsCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>📌 Recent Posts</h3>
                        <p style={styles.chartSubtitle}>Last 7 days activity</p>
                    </div>
                    <div style={styles.postsList}>
                        {last7Days.slice(0, 6).map((post, index) => (
                            <div key={index} style={styles.postItem}>
                                <div style={styles.postHeader}>
                                    <div style={styles.postIndex}>{index + 1}</div>
                                    <div style={styles.postDate}>
                                        {new Date(post.date_posted).toLocaleDateString()}
                                    </div>
                                </div>
                                <p style={styles.postText}>
                                    {post.text && post.text.length > 120
                                        ? post.text.substring(0, 120) + '...'
                                        : post.text || "No description available"}
                                </p>
                                <div style={styles.postStats}>
                                    <span style={{ ...styles.postStat, color: '#1877F2' }}>
                                        👍 {post.likes?.toLocaleString() || 0}
                                    </span>
                                    <span style={{ ...styles.postStat, color: '#42B72A' }}>
                                        💬 {post.comments?.toLocaleString() || 0}
                                    </span>
                                    <span style={{ ...styles.postStat, color: '#F7B928' }}>
                                        🔁 {post.shares?.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Summary */}
                <div style={styles.summaryCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>🏆 Performance Summary</h3>
                        <p style={styles.chartSubtitle}>Key metrics overview</p>
                    </div>
                    <div style={styles.summaryContent}>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Avg. Likes/Post</div>
                            <div style={styles.summaryValue}>{avgLikes.toLocaleString()}</div>
                        </div>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Avg. Comments/Post</div>
                            <div style={styles.summaryValue}>{avgComments.toLocaleString()}</div>
                        </div>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Avg. Shares/Post</div>
                            <div style={styles.summaryValue}>{avgShares.toLocaleString()}</div>
                        </div>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Most Liked Post</div>
                            <div style={styles.summaryValue}>
                                {last7Days.length > 0
                                    ? Math.max(...last7Days.map(p => p.likes || 0)).toLocaleString()
                                    : 0}
                            </div>
                        </div>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Most Shared Post</div>
                            <div style={styles.summaryValue}>
                                {last7Days.length > 0
                                    ? Math.max(...last7Days.map(p => p.shares || 0)).toLocaleString()
                                    : 0}
                            </div>
                        </div>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Most Commented Post</div>
                            <div style={styles.summaryValue}>
                                {last7Days.length > 0
                                    ? Math.max(...last7Days.map(p => p.comments || 0)).toLocaleString()
                                    : 0}
                            </div>
                        </div>
                    </div>
                    <div style={styles.performanceScore}>
                        <div style={styles.scoreLabel}>Overall Performance Score</div>
                        <div style={styles.scoreBar}>
                            <div
                                style={{
                                    ...styles.scoreFill,
                                    width: `${Math.min(100, engagementRate * 2)}%`
                                }}
                            ></div>
                        </div>
                        <div style={styles.scoreValue}>
                            {Math.min(100, engagementRate * 2).toFixed(1)}/100
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={styles.footer}>
                <p style={styles.footerText}>
                    Data fetched from Facebook API • Last 7 Days Analysis • Updated: {new Date().toLocaleTimeString()}
                </p>
            </footer>
        </div>
    );
};

/* ================= COMPONENTS ================= */

const StatCard = ({ title, value, icon, color, trend }) => (
    <div style={styles.statCard}>
        <div style={styles.statIconContainer}>
            <span style={{ ...styles.statIcon, backgroundColor: `${color}20` }}>
                {icon}
            </span>
        </div>
        <div style={styles.statContent}>
            <h3 style={styles.statTitle}>{title}</h3>
            <p style={styles.statValue}>{value}</p>
            <p style={styles.statTrend}>{trend}</p>
        </div>
    </div>
);

/* ================= STYLES ================= */

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
    },
    title: {
        fontSize: '2.25rem',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #1877F2, #00C6FF)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px'
    },
    subtitle: {
        fontSize: '1rem',
        color: '#94a3b8',
        fontWeight: '400'
    },
    headerStats: {
        textAlign: 'right'
    },
    headerStat: {
        backgroundColor: 'rgba(24, 119, 242, 0.1)',
        padding: '12px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(24, 119, 242, 0.2)'
    },
    headerStatLabel: {
        display: 'block',
        fontSize: '0.875rem',
        color: '#94a3b8',
        marginBottom: '4px'
    },
    headerStatValue: {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#1877F2'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
    },
    statCard: {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        cursor: 'pointer'
    },
    statIconContainer: {
        flexShrink: 0
    },
    statIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        fontSize: '1.75rem'
    },
    statContent: {
        flex: 1
    },
    statTitle: {
        fontSize: '0.95rem',
        color: '#94a3b8',
        fontWeight: '500',
        margin: '0 0 8px 0'
    },
    statValue: {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#f1f5f9',
        margin: '0 0 4px 0',
        lineHeight: 1.2
    },
    statTrend: {
        fontSize: '0.8rem',
        color: '#64748b',
        margin: 0
    },
    chartsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        marginBottom: '32px'
    },
    chartCard: {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.1)'
    },
    chartHeader: {
        marginBottom: '20px'
    },
    chartTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#f1f5f9',
        margin: '0 0 4px 0'
    },
    chartSubtitle: {
        fontSize: '0.875rem',
        color: '#94a3b8',
        margin: 0
    },
    chartContainer: {
        height: '280px'
    },
    bottomSection: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        marginBottom: '32px'
    },
    postsCard: {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.1)'
    },
    summaryCard: {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        display: 'flex',
        flexDirection: 'column'
    },
    postsList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
    },
    postItem: {
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '12px',
        padding: '16px',
        transition: 'all 0.2s ease',
        border: '1px solid rgba(148, 163, 184, 0.05)'
    },
    postHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
    },
    postIndex: {
        width: '28px',
        height: '28px',
        backgroundColor: 'rgba(24, 119, 242, 0.1)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        color: '#1877F2',
        fontSize: '0.75rem'
    },
    postDate: {
        fontSize: '0.75rem',
        color: '#64748b'
    },
    postText: {
        fontSize: '0.9rem',
        color: '#e2e8f0',
        margin: '0 0 12px 0',
        lineHeight: 1.5
    },
    postStats: {
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    postStat: {
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    summaryContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    summaryItem: {
        padding: '12px',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    summaryLabel: {
        fontSize: '0.875rem',
        color: '#94a3b8'
    },
    summaryValue: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#f1f5f9'
    },
    performanceScore: {
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)'
    },
    scoreLabel: {
        fontSize: '0.875rem',
        color: '#94a3b8',
        marginBottom: '8px',
        textAlign: 'center'
    },
    scoreBar: {
        height: '8px',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '8px'
    },
    scoreFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #1877F2, #00C6FF)',
        borderRadius: '4px',
        transition: 'width 0.5s ease'
    },
    scoreValue: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#1877F2',
        textAlign: 'center'
    },
    footer: {
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)'
    },
    footerText: {
        color: '#64748b',
        fontSize: '0.875rem'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0f172a'
    },
    spinner: {
        width: '60px',
        height: '60px',
        border: '4px solid rgba(24, 119, 242, 0.3)',
        borderTopColor: '#1877F2',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '24px'
    },
    loadingText: {
        color: '#94a3b8',
        fontSize: '1.1rem',
        marginBottom: '8px'
    },
    loadingSubtext: {
        color: '#64748b',
        fontSize: '0.9rem'
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        textAlign: 'center',
        padding: '40px'
    },
    errorIcon: {
        fontSize: '4rem',
        marginBottom: '20px'
    },
    errorTitle: {
        fontSize: '1.8rem',
        color: '#f1f5f9',
        marginBottom: '12px'
    },
    errorMessage: {
        color: '#94a3b8',
        fontSize: '1.1rem',
        marginBottom: '30px',
        maxWidth: '500px'
    },
    retryButton: {
        backgroundColor: '#1877F2',
        color: 'white',
        border: 'none',
        padding: '12px 32px',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
    }
};

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    * {
        box-sizing: border-box;
    }
    
    body {
        margin: 0;
        background-color: #0f172a;
    }
    
    @media (max-width: 1024px) {
        .chartsGrid {
            grid-template-columns: 1fr;
        }
        
        .bottomSection {
            grid-template-columns: 1fr;
        }
        
        .postsList {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }
    }
    
    @media (max-width: 768px) {
        .header {
            flex-direction: column;
            gap: 16px;
        }
        
        .headerStats {
            text-align: left;
            width: 100%;
        }
        
        .statsGrid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .title {
            font-size: 1.75rem;
        }
        
        .postsList {
            grid-template-columns: 1fr;
        }
    }
    
    @media (max-width: 480px) {
        .statsGrid {
            grid-template-columns: 1fr;
        }
        
        .container {
            padding: 16px;
        }
        
        .chartCard {
            padding: 16px;
        }
        
        .postItem {
            padding: 12px;
        }
    }
`;
document.head.appendChild(style);

export default FacebookAnalytics;