import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler
);

const TwitterAnalytics = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profileInfo, setProfileInfo] = useState(null);

    const fetchedRef = useRef(false);

    /* ================= FETCH ================= */
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        axios
            .post("meta-youtube-instagram-face-git-e0bd81-vishwajeet1729s-projects.vercel.app/api/twitter/profile-posts", {
                url: "https://x.com/BJP4Maharashtra"
            })
            .then(res => {
                const data = Array.isArray(res.data?.data) ? res.data.data : [];
                setPosts(data);

                // Extract profile info if available
                if (res.data.profile) {
                    setProfileInfo(res.data.profile);
                }
            })
            .catch(() => setError("Failed to load Twitter analytics"))
            .finally(() => setLoading(false));
    }, []);

    /* ================= LAST 7 DAYS ================= */
    const last7Days = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return posts
            .filter(p => p.date_posted)
            .filter(p => new Date(p.date_posted) >= sevenDaysAgo)
            .sort(
                (a, b) =>
                    new Date(a.date_posted).getTime() -
                    new Date(b.date_posted).getTime()
            );
    }, [posts]);

    /* ================= KPIs ================= */
    const totals = useMemo(() => {
        return last7Days.reduce(
            (acc, p) => {
                acc.likes += p.likes || 0;
                acc.reposts += p.reposts || 0;
                acc.replies += p.replies || 0;
                acc.views += p.views || 0;
                return acc;
            },
            { likes: 0, reposts: 0, replies: 0, views: 0 }
        );
    }, [last7Days]);

    const engagement =
        totals.views > 0
            ? (
                ((totals.likes + totals.reposts + totals.replies) /
                    totals.views) *
                100
            ).toFixed(2)
            : 0;

    const avgLikes = last7Days.length > 0 ? Math.round(totals.likes / last7Days.length) : 0;
    const avgReposts = last7Days.length > 0 ? Math.round(totals.reposts / last7Days.length) : 0;
    const avgEngagement = last7Days.length > 0 ?
        Math.round((totals.likes + totals.reposts + totals.replies) / last7Days.length) : 0;

    /* ================= GRAPHS ================= */
    const labels = last7Days.map(p =>
        new Date(p.date_posted).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    );

    const likesData = last7Days.map(p => p.likes || 0);
    const repostsData = last7Days.map(p => p.reposts || 0);
    const repliesData = last7Days.map(p => p.replies || 0);

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

    /* ================= UI STATES ================= */
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading Twitter Analytics...</p>
                <small style={styles.loadingSubtext}>
                    This may take up to 60s due to data processing.
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

    if (!last7Days.length) {
        return (
            <div style={styles.emptyContainer}>
                <div style={styles.emptyIcon}>📭</div>
                <h3 style={styles.emptyTitle}>No Data Available</h3>
                <p style={styles.emptyMessage}>No tweets found for the last 7 days.</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>🐦 Twitter Analytics Dashboard</h1>
                    <p style={styles.subtitle}>@BJP4Maharashtra • Last 7 Days Performance</p>
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
                    color="#1DA1F2"
                    trend="recent activity"
                />
                <StatCard
                    title="Total Likes"
                    value={totals.likes.toLocaleString()}
                    icon="❤️"
                    color="#E0245E"
                    trend="engagement"
                />
                <StatCard
                    title="Total Reposts"
                    value={totals.reposts.toLocaleString()}
                    icon="🔁"
                    color="#17BF63"
                    trend="shares"
                />
                <StatCard
                    title="Total Replies"
                    value={totals.replies.toLocaleString()}
                    icon="💬"
                    color="#FFAD1F"
                    trend="conversations"
                />
                <StatCard
                    title="Avg Likes/Post"
                    value={avgLikes.toLocaleString()}
                    icon="📈"
                    color="#794BC4"
                    trend="per tweet"
                />
                <StatCard
                    title="Engagement Rate"
                    value={`${engagement}%`}
                    icon="🎯"
                    color="#F45D22"
                    trend="performance"
                />
            </div>

            {/* Charts Section */}
            <div style={styles.chartsGrid}>
                {/* Likes Trend Chart */}
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
                                        data: likesData,
                                        borderColor: "#E0245E",
                                        backgroundColor: 'rgba(224, 36, 94, 0.1)',
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: "#E0245E",
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

                {/* Engagement Comparison Chart */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>📊 Engagement Comparison</h3>
                        <p style={styles.chartSubtitle}>Likes vs Reposts vs Replies</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Bar
                            data={{
                                labels,
                                datasets: [
                                    {
                                        label: "Likes",
                                        data: likesData,
                                        backgroundColor: "rgba(224, 36, 94, 0.8)",
                                        borderRadius: 6,
                                        borderWidth: 0
                                    },
                                    {
                                        label: "Reposts",
                                        data: repostsData,
                                        backgroundColor: "rgba(23, 191, 99, 0.8)",
                                        borderRadius: 6,
                                        borderWidth: 0
                                    },
                                    {
                                        label: "Replies",
                                        data: repliesData,
                                        backgroundColor: "rgba(255, 173, 31, 0.8)",
                                        borderRadius: 6,
                                        borderWidth: 0
                                    }
                                ]
                            }}
                            options={barChartOptions}
                        />
                    </div>
                </div>

                {/* Performance Metrics */}
                <div style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>📊 Daily Views & Engagement</h3>
                        <p style={styles.chartSubtitle}>Views correlation with engagement</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Line
                            data={{
                                labels,
                                datasets: [
                                    {
                                        label: "Views",
                                        data: last7Days.map(p => p.views || 0),
                                        borderColor: "#1DA1F2",
                                        backgroundColor: 'rgba(29, 161, 242, 0.1)',
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: "#1DA1F2",
                                        pointBorderColor: "#ffffff",
                                        pointBorderWidth: 2,
                                        pointRadius: 5
                                    },
                                    {
                                        label: "Total Engagement",
                                        data: last7Days.map(p => (p.likes || 0) + (p.reposts || 0) + (p.replies || 0)),
                                        borderColor: "#794BC4",
                                        backgroundColor: 'rgba(121, 75, 196, 0.1)',
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: "#794BC4",
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
            </div>

            {/* Recent Posts & Performance Summary */}
            <div style={styles.bottomSection}>
                {/* Recent Posts */}
                <div style={styles.postsCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>📝 Recent Posts</h3>
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
                                <p style={styles.postDescription}>
                                    {post.description && post.description.length > 120
                                        ? post.description.substring(0, 120) + '...'
                                        : post.description || "No description available"}
                                </p>
                                <div style={styles.postStats}>
                                    <span style={{ ...styles.postStat, color: '#E0245E' }}>
                                        ❤️ {post.likes?.toLocaleString() || 0}
                                    </span>
                                    <span style={{ ...styles.postStat, color: '#17BF63' }}>
                                        🔁 {post.reposts?.toLocaleString() || 0}
                                    </span>
                                    <span style={{ ...styles.postStat, color: '#FFAD1F' }}>
                                        💬 {post.replies?.toLocaleString() || 0}
                                    </span>
                                    {post.views && (
                                        <span style={{ ...styles.postStat, color: '#1DA1F2' }}>
                                            👁️ {post.views.toLocaleString()}
                                        </span>
                                    )}
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
                            <div style={styles.summaryLabel}>Avg. Engagement/Post</div>
                            <div style={styles.summaryValue}>{avgEngagement.toLocaleString()}</div>
                        </div>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Avg. Reposts/Post</div>
                            <div style={styles.summaryValue}>{avgReposts.toLocaleString()}</div>
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
                            <div style={styles.summaryLabel}>Most Viewed Post</div>
                            <div style={styles.summaryValue}>
                                {last7Days.length > 0
                                    ? Math.max(...last7Days.map(p => p.views || 0)).toLocaleString()
                                    : 0}
                            </div>
                        </div>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Total Views</div>
                            <div style={styles.summaryValue}>{totals.views.toLocaleString()}</div>
                        </div>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Reply Rate</div>
                            <div style={styles.summaryValue}>
                                {last7Days.length > 0
                                    ? ((totals.replies / (totals.likes + totals.reposts + totals.replies)) * 100 || 0).toFixed(1) + '%'
                                    : '0%'}
                            </div>
                        </div>
                    </div>
                    <div style={styles.performanceScore}>
                        <div style={styles.scoreLabel}>Overall Performance Score</div>
                        <div style={styles.scoreBar}>
                            <div
                                style={{
                                    ...styles.scoreFill,
                                    width: `${Math.min(100, engagement * 2)}%`
                                }}
                            ></div>
                        </div>
                        <div style={styles.scoreValue}>
                            {Math.min(100, engagement * 2).toFixed(1)}/100
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={styles.footer}>
                <p style={styles.footerText}>
                    Data fetched from Twitter/X API • Last 7 Days Analysis • Updated: {new Date().toLocaleTimeString()}
                </p>
            </footer>
        </div>
    );
};

/* ================= STAT CARD COMPONENT ================= */
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
        background: 'linear-gradient(135deg, #1DA1F2, #E0245E)',
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
        backgroundColor: 'rgba(29, 161, 242, 0.1)',
        padding: '12px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(29, 161, 242, 0.2)'
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
        color: '#1DA1F2'
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
        height: '300px'
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
        backgroundColor: 'rgba(29, 161, 242, 0.1)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        color: '#1DA1F2',
        fontSize: '0.75rem'
    },
    postDate: {
        fontSize: '0.75rem',
        color: '#64748b'
    },
    postDescription: {
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
        marginBottom: '8px'
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
        background: 'linear-gradient(90deg, #1DA1F2, #E0245E)',
        borderRadius: '4px',
        transition: 'width 0.5s ease'
    },
    scoreValue: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#1DA1F2',
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
        border: '4px solid rgba(29, 161, 242, 0.3)',
        borderTopColor: '#1DA1F2',
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
        backgroundColor: '#1DA1F2',
        color: 'white',
        border: 'none',
        padding: '12px 32px',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
    },
    emptyContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        textAlign: 'center',
        padding: '40px'
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '20px',
        opacity: 0.5
    },
    emptyTitle: {
        fontSize: '1.8rem',
        color: '#f1f5f9',
        marginBottom: '12px'
    },
    emptyMessage: {
        color: '#94a3b8',
        fontSize: '1.1rem',
        marginBottom: '30px',
        maxWidth: '500px'
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

export default TwitterAnalytics;