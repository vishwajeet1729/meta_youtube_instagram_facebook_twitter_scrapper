const mockTweets = [
    {
        id: "2008874987114090752",
        user_posted: "BJP4Maharashtra",
        name: "भाजपा महाराष्ट्र",
        description: "गती आहे विकासाची\nभाजपा आपली विश्वासाची! 🪷 \n\n#DevendraFadnavis #BJP #Maharashtra #महानगरपालिका #Mahanagarpalika2026",
        date_posted: "2026-01-07T12:14:54.000Z",
        url: "https://x.com/BJP4Maharashtra/status/2008874987114090752",
        likes: 39,
        reposts: 26,
        replies: 10,
        views: 476,
        video_url: null
    },
    {
        id: "2008870809847361823",
        user_posted: "BJP4Maharashtra",
        name: "भाजपा महाराष्ट्र",
        description: "गती आहे विकासाची\nभाजपा आपली विश्वासाची! 🪷 \n\n#DevendraFadnavis #BJP #Maharashtra #महानगरपालिका #Mahanagarpalika2026",
        date_posted: "2026-01-07T11:58:18.000Z",
        url: "https://x.com/BJP4Maharashtra/status/2008870809847361823",
        likes: 69,
        reposts: 37,
        replies: 30,
        views: 833,
        video_url: "https://video.twimg.com/amplify_video/2008869531461275648/vid/avc1/1080x1920/os889tiKbfDtp31q.mp4?tag=21"
    },
    {
        id: "2008578905092091947",
        user_posted: "BJP4Maharashtra",
        name: "भाजपा महाराष्ट्र",
        description: "जळगाव नी हाई गहिरी गर्दीच सांगी राहणी भाजपणा विजय पक्का श...\n\n#अहिराणी #Maharashtra #Jalgaon #जळगाव_महानगरपालिका",
        date_posted: "2026-01-06T16:38:23.000Z",
        url: "https://x.com/BJP4Maharashtra/status/2008578905092091947",
        likes: 98,
        reposts: 47,
        replies: 35,
        views: 1026,
        video_url: "https://video.twimg.com/amplify_video/2008578775622316034/vid/avc1/1280x720/640ehQjilBxrDJet.mp4?tag=21"
    },
    {
        id: "2009250624626409511",
        user_posted: "BJP4Maharashtra",
        name: "भाजपा महाराष्ट्र",
        description: "देशविरोधी असलेल्या रशीद मामूला छत्रपती संभाजीनगरमध्ये उबाठाने त्यांच्या पक्षात घेतले.\n\n#Maharashtra #MumbaiManthan",
        date_posted: "2026-01-08T13:07:33.000Z",
        url: "https://x.com/BJP4Maharashtra/status/2009250624626409511",
        likes: 14,
        reposts: 2,
        replies: 3,
        views: 333,
        video_url: "https://video.twimg.com/amplify_video/2009249566030430208/vid/avc1/1920x1080/r4BSQfmpGiarUiDm.mp4?tag=21"
    },
    {
        id: "2008802742782095671",
        user_posted: "BJP4Maharashtra",
        name: "भाजपा महाराष्ट्र",
        description: "नागपूर हे भारतातील वेगाने विकसित होत असलेल्या प्रमुख शहरांपैकी एक आहे. - मुख्यमंत्री @Dev_Fadnavis जी",
        date_posted: "2026-01-07T07:27:50.000Z",
        url: "https://x.com/BJP4Maharashtra/status/2008802742782095671",
        likes: 61,
        reposts: 34,
        replies: 31,
        views: 564,
        video_url: "https://video.twimg.com/amplify_video/2008802431950614538/vid/avc1/1920x1080/NHBP-vWBfM_nrmEt.mp4?tag=21"
    }
];

const mockInstagramPosts = [
    {
        id: "insta1",
        user_posted: "bjp4maharashtra",
        url: "https://www.instagram.com/p/DTJy-RRlKJ3/",
        date_posted: "2026-01-08T10:00:00.000Z",
        likes: 1250,
        comments: 45,
        views: 5000,
        description: "Celebrating the victory in Maharashtra! 🚩 #BJP #Maharashtra"
    },
    {
        id: "insta2",
        user_posted: "bjp4maharashtra",
        url: "https://www.instagram.com/p/DTKWd2Dge-b/",
        date_posted: "2026-01-07T14:30:00.000Z",
        likes: 980,
        comments: 30,
        views: 4200,
        description: "Development projects in Nagpur are in full swing. #Development #Nagpur"
    },
    {
        id: "insta3",
        user_posted: "bjp4maharashtra",
        url: "https://www.instagram.com/p/DTLTe4Xyf-a/",
        date_posted: "2026-01-06T09:15:00.000Z",
        likes: 1500,
        comments: 60,
        views: 6000,
        description: "Thank you for the immense support! 🙏 #BJP4Maharashtra"
    },
    {
        id: "insta4",
        user_posted: "bjp4maharashtra",
        url: "https://www.instagram.com/p/DTMFe5Zxg-c/",
        date_posted: "2026-01-05T11:45:00.000Z",
        likes: 1100,
        comments: 40,
        views: 4800,
        description: "Meeting with youth leaders today. #YouthEmpowerment"
    },
    {
        id: "insta5",
        user_posted: "bjp4maharashtra",
        url: "https://www.instagram.com/p/DTNGe6Whh-d/",
        date_posted: "2026-01-04T16:20:00.000Z",
        likes: 1350,
        comments: 55,
        views: 5500,
        description: "Preserving our culture and heritage. 🕉️ #Culture"
    }
];

const mockFacebookPosts = [
    {
        id: "fb1",
        date_posted: "2026-01-08T10:00:00.000Z",
        text: "Game day! Let's get this win. 🏀 #Lakers",
        likes: 5400,
        comments: 420,
        shares: 1200
    },
    {
        id: "fb2",
        date_posted: "2026-01-07T14:30:00.000Z",
        text: "Great practice session today. The team is looking sharp.",
        likes: 3800,
        comments: 150,
        shares: 500
    },
    {
        id: "fb3",
        date_posted: "2026-01-06T09:15:00.000Z",
        text: "Family time is the best time. ❤️",
        likes: 8900,
        comments: 600,
        shares: 2000
    },
    {
        id: "fb4",
        date_posted: "2026-01-05T18:45:00.000Z",
        text: "Check out my new shoes! 👟 #Nike",
        likes: 6200,
        comments: 340,
        shares: 900
    },
    {
        id: "fb5",
        date_posted: "2026-01-04T12:20:00.000Z",
        text: "Always striving for greatness. 🚀",
        likes: 4500,
        comments: 210,
        shares: 750
    }
];

module.exports = {
    twitter: mockTweets,
    instagram: mockInstagramPosts,
    facebook: mockFacebookPosts
};
