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

const API_URL = "https://meta-youtube-instagram-facebook-twi.vercel.app//api/instagram/profile-posts";
const PROFILE_URL = "https://www.instagram.com/bjp4maharashtra/";

const InstagramAnalytics = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profileInfo, setProfileInfo] = useState(null);
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        axios
            .post(API_URL, { url: PROFILE_URL, num_of_posts: 60 })
            .then(res => {
                if (Array.isArray(res.data?.data)) {
                    setPosts(res.data.data);
                    if (res.data.profile) {
                        setProfileInfo(res.data.profile);
                    }
                } else {
                    setError("Instagram data still processing. Please retry in a moment.");
                }
            })
            .catch(() => setError("Failed to load Instagram analytics"))
            .finally(() => setLoading(false));
    }, []);

    /* ================= LAST 7 DAYS ================= */
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

    /* ================= METRICS ================= */
    const totals = last7Days.reduce(
        (a, p) => {
            a.likes += p.likes || 0;
            a.comments += p.comments || 0;
            a.views += p.views || 0;
            return a;
        },
        { likes: 0, comments: 0, views: 0 }
    );

    const engagementRate =
        totals.views > 0
            ? (((totals.likes + totals.comments) / totals.views) * 100).toFixed(2)
            : 0;

    const avgLikes = last7Days.length > 0 ? Math.round(totals.likes / last7Days.length) : 0;
    const avgComments = last7Days.length > 0 ? Math.round(totals.comments / last7Days.length) : 0;
    const avgViews = last7Days.length > 0 ? Math.round(totals.views / last7Days.length) : 0;
    const avgEngagement = last7Days.length > 0 ?
        Math.round((totals.likes + totals.comments) / last7Days.length) : 0;

    const labels = last7Days.map(p =>
        new Date(p.date_posted).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    );

    const likes = last7Days.map(p => p.likes || 0);
    const comments = last7Days.map(p => p.comments || 0);
    const views = last7Days.map(p => p.views || 0);

    const engagementRates = last7Days.map(p => {
        const v = p.views || 0;
        return v > 0 ? (((p.likes + (p.comments || 0)) / v) * 100).toFixed(2) : 0;
    });

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
                <p style={styles.loadingText}>Loading Instagram Analytics...</p>
                <small style={styles.loadingSubtext}>
                    Fetching data from Instagram profile
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
                    <h1 style={styles.title}>📸 Instagram Analytics Dashboard</h1>
                    <p style={styles.subtitle}>@bjp4maharashtra • Last 7 Days Performance</p>
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
                    icon="📸"
                    color="#E4405F"
                    trend="recent activity"
                />
                <StatCard
                    title="Total Likes"
                    value={totals.likes.toLocaleString()}
                    icon="❤️"
                    color="#F56040"
                    trend="engagement"
                />
                <StatCard
                    title="Total Comments"
                    value={totals.comments.toLocaleString()}
                    icon="💬"
                    color="#4C5FD7"
                    trend="interactions"
                />
                <StatCard
                    title="Total Views"
                    value={totals.views.toLocaleString()}
                    icon="👁️"
                    color="#7232BD"
                    trend="reach"
                />
                <StatCard
                    title="Avg Likes/Post"
                    value={avgLikes.toLocaleString()}
                    icon="📈"
                    color="#FCAF45"
                    trend="per post"
                />
                <StatCard
                    title="Engagement Rate"
                    value={`${engagementRate}%`}
                    icon="🎯"
                    color="#C13584"
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
                                        borderColor: "#E4405F",
                                        backgroundColor: 'rgba(228, 64, 95, 0.1)',
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: "#E4405F",
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

                {/* Engagement Rate */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>📉 Engagement Rate</h3>
                        <p style={styles.chartSubtitle}>Percentage over time</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Line
                            data={{
                                labels,
                                datasets: [
                                    {
                                        label: "Engagement Rate %",
                                        data: engagementRates,
                                        borderColor: "#FCAF45",
                                        backgroundColor: 'rgba(252, 175, 69, 0.1)',
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: "#FCAF45",
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

                {/* Likes vs Comments */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>📊 Likes vs Comments</h3>
                        <p style={styles.chartSubtitle}>Comparison by post</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Bar
                            data={{
                                labels,
                                datasets: [
                                    {
                                        label: "Likes",
                                        data: likes,
                                        backgroundColor: "rgba(228, 64, 95, 0.8)",
                                        borderRadius: 6,
                                        borderWidth: 0
                                    },
                                    {
                                        label: "Comments",
                                        data: comments,
                                        backgroundColor: "rgba(76, 95, 215, 0.8)",
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

                {/* Engagement Distribution */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>🥧 Engagement Distribution</h3>
                        <p style={styles.chartSubtitle}>Likes vs Comments vs Views</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Pie
                            data={{
                                labels: ["Likes", "Comments", "Views"],
                                datasets: [
                                    {
                                        data: [totals.likes, totals.comments, totals.views],
                                        backgroundColor: ["#E4405F", "#4C5FD7", "#7232BD"],
                                        borderColor: ["#E4405F", "#4C5FD7", "#7232BD"],
                                        borderWidth: 2
                                    }
                                ]
                            }}
                            options={pieChartOptions}
                        />
                    </div>
                </div>
            </div>

            {/* Performance Charts Row */}
            <div style={styles.performanceRow}>
                {/* Performance Radar */}
                <div style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>🕸️ Performance Radar</h3>
                        <p style={styles.chartSubtitle}>Multi-dimensional analysis</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Radar
                            data={{
                                labels: [
                                    "Avg Likes",
                                    "Avg Comments",
                                    "Avg Views",
                                    "Engagement %",
                                    "Post Frequency"
                                ],
                                datasets: [
                                    {
                                        label: "Instagram Performance",
                                        data: [
                                            totals.likes / last7Days.length || 0,
                                            totals.comments / last7Days.length || 0,
                                            totals.views / last7Days.length || 0,
                                            engagementRate === "N/A" ? 0 : engagementRate,
                                            last7Days.length
                                        ],
                                        backgroundColor: "rgba(193, 53, 132, 0.2)",
                                        borderColor: "#C13584",
                                        borderWidth: 3,
                                        pointBackgroundColor: "#C13584",
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
                                <p style={styles.postDescription}>
                                    {post.description?.slice(0, 80)}…
                                </p>
                                <div style={styles.postStats}>
                                    <span style={{ ...styles.postStat, color: '#E4405F' }}>
                                        ❤️ {post.likes?.toLocaleString() || 0}
                                    </span>
                                    <span style={{ ...styles.postStat, color: '#4C5FD7' }}>
                                        💬 {post.comments?.toLocaleString() || 0}
                                    </span>
                                    {post.views && (
                                        <span style={{ ...styles.postStat, color: '#7232BD' }}>
                                            👁️ {post.views.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div style={styles.summaryContainer}>
                <div style={styles.summaryCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>🏆 Performance Insights</h3>
                        <p style={styles.chartSubtitle}>Key metrics at a glance</p>
                    </div>
                    <div style={styles.summaryGrid}>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Avg. Comments/Post</div>
                            <div style={styles.summaryValue}>{avgComments.toLocaleString()}</div>
                        </div>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Avg. Views/Post</div>
                            <div style={styles.summaryValue}>{avgViews.toLocaleString()}</div>
                        </div>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Avg. Engagement/Post</div>
                            <div style={styles.summaryValue}>{avgEngagement.toLocaleString()}</div>
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
                            <div style={styles.summaryLabel}>Most Commented Post</div>
                            <div style={styles.summaryValue}>
                                {last7Days.length > 0
                                    ? Math.max(...last7Days.map(p => p.comments || 0)).toLocaleString()
                                    : 0}
                            </div>
                        </div>
                        <div style={styles.summaryItem}>
                            <div style={styles.summaryLabel}>Best Engagement Rate</div>
                            <div style={styles.summaryValue}>
                                {last7Days.length > 0
                                    ? Math.max(...engagementRates).toFixed(1) + '%'
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
                                    width: `${Math.min(100, engagementRate * 5)}%`
                                }}
                            ></div>
                        </div>
                        <div style={styles.scoreValue}>
                            {Math.min(100, engagementRate * 5).toFixed(1)}/100
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={styles.footer}>
                <p style={styles.footerText}>
                    Data fetched from Instagram API • Last 7 Days Analysis • Updated: {new Date().toLocaleTimeString()}
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
        background: 'linear-gradient(135deg, #E4405F, #C13584)',
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
        backgroundColor: 'rgba(228, 64, 95, 0.1)',
        padding: '12px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(228, 64, 95, 0.2)'
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
        color: '#E4405F'
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
    performanceRow: {
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
    postsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
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
        marginBottom: '8px'
    },
    postIndex: {
        width: '28px',
        height: '28px',
        backgroundColor: 'rgba(228, 64, 95, 0.1)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        color: '#E4405F',
        fontSize: '0.75rem'
    },
    postDate: {
        fontSize: '0.75rem',
        color: '#64748b'
    },
    postDescription: {
        fontSize: '0.85rem',
        color: '#e2e8f0',
        margin: '0 0 12px 0',
        lineHeight: 1.4
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
    summaryContainer: {
        marginBottom: '32px'
    },
    summaryCard: {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.1)'
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    summaryItem: {
        padding: '12px',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
    },
    summaryLabel: {
        fontSize: '0.8rem',
        color: '#94a3b8',
        marginBottom: '8px'
    },
    summaryValue: {
        fontSize: '1.25rem',
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
        background: 'linear-gradient(90deg, #E4405F, #C13584)',
        borderRadius: '4px',
        transition: 'width 0.5s ease'
    },
    scoreValue: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#E4405F',
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
        border: '4px solid rgba(228, 64, 95, 0.3)',
        borderTopColor: '#E4405F',
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
        backgroundColor: '#E4405F',
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
        
        .performanceRow {
            grid-template-columns: 1fr;
        }
        
        .postsList {
            grid-template-columns: 1fr;
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
        
        .summaryGrid {
            grid-template-columns: repeat(2, 1fr);
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
        
        .summaryGrid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);

export default InstagramAnalytics;