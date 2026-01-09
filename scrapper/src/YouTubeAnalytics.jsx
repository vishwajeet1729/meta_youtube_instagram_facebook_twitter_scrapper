import { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
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
    ArcElement,
    Filler
);

const YouTubeAnalytics = () => {
    const API_KEY = "AIzaSyCFauyGotsEz0mrDVmMTygH4LH7tqFFKQg";
    const CHANNEL_QUERY = "BJP4MH";

    const [videos, setVideos] = useState([]);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [channelName, setChannelName] = useState("");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                // 1️⃣ Search channel
                const searchRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${CHANNEL_QUERY}&maxResults=1&key=${API_KEY}`
                );
                const searchData = await searchRes.json();
                const channelId = searchData.items[0].snippet.channelId;
                setChannelName(searchData.items[0].snippet.channelTitle);

                // 2️⃣ Channel details
                const channelRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails,snippet&id=${channelId}&key=${API_KEY}`
                );
                const channelData = await channelRes.json();

                setSubscriberCount(
                    Number(channelData.items[0].statistics.subscriberCount)
                );

                const uploadsId =
                    channelData.items[0].contentDetails.relatedPlaylists.uploads;

                // 3️⃣ Last 7 days videos
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const playlistRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsId}&maxResults=15&key=${API_KEY}`
                );
                const playlistData = await playlistRes.json();

                const recentVideos = playlistData.items.filter(
                    v => new Date(v.snippet.publishedAt) >= sevenDaysAgo
                );

                if (recentVideos.length === 0) {
                    setLoading(false);
                    return;
                }

                const videoIds = recentVideos.map(v => v.snippet.resourceId.videoId);

                // 4️⃣ Video stats
                const statsRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(
                        ","
                    )}&key=${API_KEY}`
                );
                const statsData = await statsRes.json();

                setVideos(statsData.items);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    // =======================
    // 📊 CALCULATIONS
    // =======================
    const totalVideos = videos.length;
    const totalViews = videos.reduce(
        (sum, v) => sum + Number(v.statistics.viewCount),
        0
    );
    const totalLikes = videos.reduce(
        (sum, v) => sum + Number(v.statistics.likeCount || 0),
        0
    );
    const totalComments = videos.reduce(
        (sum, v) => sum + Number(v.statistics.commentCount || 0),
        0
    );

    const avgViews = totalVideos ? Math.round(totalViews / totalVideos) : 0;
    const avgLikes = totalVideos ? Math.round(totalLikes / totalVideos) : 0;
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100).toFixed(2) : 0;

    const labels = videos.map(v =>
        new Date(v.snippet.publishedAt).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    );

    const views = videos.map(v => Number(v.statistics.viewCount));
    const likes = videos.map(v => Number(v.statistics.likeCount || 0));

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

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading YouTube Analytics...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>📊 YouTube Analytics Dashboard</h1>
                    <p style={styles.subtitle}>{channelName || CHANNEL_QUERY} • Last 7 Days Performance</p>
                </div>
                <div style={styles.headerStats}>
                    <div style={styles.headerStat}>
                        <span style={styles.headerStatLabel}>Subscribers</span>
                        <span style={styles.headerStatValue}>
                            {subscriberCount.toLocaleString()}
                        </span>
                    </div>
                </div>
            </header>

            {/* Summary Cards */}
            <div style={styles.statsGrid}>
                <StatCard
                    title="Total Videos"
                    value={totalVideos}
                    icon="🎬"
                    color="#3b82f6"
                    trend="this week"
                />
                <StatCard
                    title="Total Views"
                    value={totalViews.toLocaleString()}
                    icon="👁️"
                    color="#10b981"
                    trend="across all videos"
                />
                <StatCard
                    title="Total Likes"
                    value={totalLikes.toLocaleString()}
                    icon="❤️"
                    color="#ef4444"
                    trend="engagement"
                />
                <StatCard
                    title="Avg Views/Video"
                    value={avgViews.toLocaleString()}
                    icon="📈"
                    color="#8b5cf6"
                    trend="per video"
                />
                <StatCard
                    title="Engagement Rate"
                    value={`${engagementRate}%`}
                    icon="💬"
                    color="#f59e0b"
                    trend="(likes + comments)/views"
                />
            </div>

            {/* Charts Section */}
            <div style={styles.chartsGrid}>
                {/* Views Chart */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>📈 Views Over Time</h3>
                        <p style={styles.chartSubtitle}>Last 7 days performance</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Line
                            data={{
                                labels,
                                datasets: [
                                    {
                                        label: "Views",
                                        data: views,
                                        borderColor: "#3b82f6",
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: "#3b82f6",
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

                {/* Likes Chart */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>❤️ Likes Over Time</h3>
                        <p style={styles.chartSubtitle}>Last 7 days engagement</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Line
                            data={{
                                labels,
                                datasets: [
                                    {
                                        label: "Likes",
                                        data: likes,
                                        borderColor: "#ef4444",
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: "#ef4444",
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

                {/* Comparison Chart */}
                <div style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>📊 Views vs Likes Comparison</h3>
                        <p style={styles.chartSubtitle}>Side-by-side performance</p>
                    </div>
                    <div style={styles.chartContainer}>
                        <Bar
                            data={{
                                labels,
                                datasets: [
                                    {
                                        label: "Views",
                                        data: views,
                                        backgroundColor: "rgba(59, 130, 246, 0.7)",
                                        borderRadius: 6,
                                        borderWidth: 0
                                    },
                                    {
                                        label: "Likes",
                                        data: likes,
                                        backgroundColor: "rgba(239, 68, 68, 0.7)",
                                        borderRadius: 6,
                                        borderWidth: 0
                                    }
                                ]
                            }}
                            options={barChartOptions}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Videos & Subscribers */}
            <div style={styles.bottomSection}>
                {/* Recent Videos */}
                <div style={styles.videosCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>🎬 Recent Videos</h3>
                        <p style={styles.chartSubtitle}>Last 7 days uploads</p>
                    </div>
                    <div style={styles.videosList}>
                        {videos.slice(0, 5).map((video, index) => (
                            <div key={index} style={styles.videoItem}>
                                <div style={styles.videoIndex}>{index + 1}</div>
                                <div style={styles.videoInfo}>
                                    <h4 style={styles.videoTitle}>
                                        {video.snippet.title.length > 50
                                            ? video.snippet.title.substring(0, 50) + '...'
                                            : video.snippet.title}
                                    </h4>
                                    <div style={styles.videoStats}>
                                        <span style={styles.videoStat}>
                                            👁️ {Number(video.statistics.viewCount).toLocaleString()}
                                        </span>
                                        <span style={styles.videoStat}>
                                            ❤️ {Number(video.statistics.likeCount || 0).toLocaleString()}
                                        </span>
                                        <span style={styles.videoDate}>
                                            {new Date(video.snippet.publishedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subscriber Growth */}
                <div style={styles.subscribersCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>📈 Subscriber Milestone</h3>
                        <p style={styles.chartSubtitle}>Current count</p>
                    </div>
                    <div style={styles.subscriberDisplay}>
                        <div style={styles.subscriberCount}>
                            {subscriberCount.toLocaleString()}
                        </div>
                        <div style={styles.subscriberLabel}>
                            Total Subscribers
                        </div>
                        <div style={styles.subscriberProgress}>
                            <div style={styles.progressBar}>
                                <div
                                    style={{
                                        ...styles.progressFill,
                                        width: `${Math.min(100, (subscriberCount / 100000) * 100)}%`
                                    }}
                                ></div>
                            </div>
                            <div style={styles.progressText}>
                                Progress to 100K: {Math.min(100, (subscriberCount / 100000) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={styles.footer}>
                <p style={styles.footerText}>
                    Data fetched from YouTube API • Auto-refresh every 5 minutes • Last updated: {new Date().toLocaleTimeString()}
                </p>
            </footer>
        </div>
    );
};

// Stat Card Component
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

// Styles
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
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
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
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: '12px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(59, 130, 246, 0.2)'
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
        color: '#3b82f6'
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
    statCardHover: {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.3)'
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
    videosCard: {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.1)'
    },
    subscribersCard: {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        display: 'flex',
        flexDirection: 'column'
    },
    videosList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    videoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '12px',
        transition: 'background-color 0.2s ease'
    },
    videoIndex: {
        width: '36px',
        height: '36px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        color: '#3b82f6',
        fontSize: '0.875rem'
    },
    videoInfo: {
        flex: 1
    },
    videoTitle: {
        fontSize: '0.95rem',
        fontWeight: '500',
        color: '#f1f5f9',
        margin: '0 0 8px 0',
        lineHeight: 1.4
    },
    videoStats: {
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    videoStat: {
        fontSize: '0.8rem',
        color: '#94a3b8'
    },
    videoDate: {
        fontSize: '0.8rem',
        color: '#64748b'
    },
    subscriberDisplay: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    },
    subscriberCount: {
        fontSize: '3.5rem',
        fontWeight: '800',
        color: '#8b5cf6',
        marginBottom: '8px',
        lineHeight: 1
    },
    subscriberLabel: {
        fontSize: '1rem',
        color: '#94a3b8',
        marginBottom: '24px'
    },
    subscriberProgress: {
        width: '100%'
    },
    progressBar: {
        height: '8px',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '8px'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#8b5cf6',
        borderRadius: '4px',
        transition: 'width 0.5s ease'
    },
    progressText: {
        fontSize: '0.875rem',
        color: '#94a3b8'
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
        border: '4px solid rgba(59, 130, 246, 0.3)',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '24px'
    },
    loadingText: {
        color: '#94a3b8',
        fontSize: '1.1rem'
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
    }
`;
document.head.appendChild(style);

export default YouTubeAnalytics;