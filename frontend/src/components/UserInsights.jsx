import { useState, useEffect } from "react";
import { getUserInsights } from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import Loader from "./Loader";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UserInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await getUserInsights();
        setInsights(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching user insights:", err);
        setError(err.message || "Failed to load user insights");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  // Default values for when insights are empty or undefined
  const defaultInsights = {
    ageDistribution: [],
    genderDistribution: [],
    userInterests: [],
    productPerformance: [],
    averageRating: 0,
    reviewCount: 0,
  };

  const {
    ageDistribution = defaultInsights.ageDistribution,
    genderDistribution = defaultInsights.genderDistribution,
    userInterests = defaultInsights.userInterests,
    productPerformance = defaultInsights.productPerformance,
    averageRating = defaultInsights.averageRating,
    reviewCount = defaultInsights.reviewCount,
  } = insights || defaultInsights;

  if (!insights || Object.keys(insights).length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center p-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No insights yet
          </h3>
          <p className="mt-1 text-gray-500">
            As users interact with your products, insights will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Prepare age distribution chart data
  const ageChartData = {
    labels: ageDistribution.map((item) => item.label),
    datasets: [
      {
        label: "Users",
        data: ageDistribution.map((item) => item.value),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare gender distribution chart data
  const genderChartData = {
    labels: genderDistribution.map((item) => item.label),
    datasets: [
      {
        data: genderDistribution.map((item) => item.value),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare user interests chart data
  const interestsChartData = {
    labels: userInterests.map((item) => item.label),
    datasets: [
      {
        label: "User Interest",
        data: userInterests.map((item) => item.value),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare product performance chart data
  const performanceChartData = {
    labels: productPerformance.map((item) => item.title),
    datasets: [
      {
        type: "bar",
        label: "Reviews",
        data: productPerformance.map((item) => item.reviewCount),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        type: "line",
        label: "Average Rating",
        data: productPerformance.map((item) => item.averageRating),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Number of Reviews",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        min: 0,
        max: 5,
        title: {
          display: true,
          text: "Average Rating",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Total Reviews
          </h3>
          <p className="text-3xl font-bold text-blue-600">{reviewCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Average Rating
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {averageRating.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Age Distribution
          </h3>
          <div className="h-64">
            <Pie data={ageChartData} options={chartOptions} />
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Gender Distribution
          </h3>
          <div className="h-64">
            <Pie data={genderChartData} options={chartOptions} />
          </div>
        </div>

        {/* User Interests */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top User Interests
          </h3>
          <div className="h-64">
            <Bar data={interestsChartData} options={chartOptions} />
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Product Performance
          </h3>
          <div className="h-64">
            <Bar
              data={performanceChartData}
              options={performanceChartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInsights;
